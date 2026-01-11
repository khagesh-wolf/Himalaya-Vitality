
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package, User as UserIcon, LogOut, MapPin, Save, CreditCard, ChevronRight } from 'lucide-react';
import { Container, Button, Card, Reveal, LazyImage } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { fetchUserOrders, updateUserProfile } from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SEO } from '../components/SEO';
import { getDeliverableCountries } from '../utils';
import { useNavigate } from 'react-router-dom';

// Validation Schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email').optional(), // Read-only usually
  phone: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  zip: z.string().min(3, 'ZIP is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  // Redirect if not logged in
  if (!isAuthenticated) {
      navigate('/login');
      return null;
  }

  // --- Queries & Mutations ---
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
      queryKey: ['my-orders'],
      queryFn: fetchUserOrders,
      enabled: !!user
  });

  const updateMutation = useMutation({
      mutationFn: updateUserProfile,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['user'] }); // assuming AuthContext uses this key or similar
          alert("Profile updated successfully!");
      },
      onError: () => alert("Failed to update profile.")
  });

  // --- Form Setup ---
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
          firstName: user?.firstName || user?.name?.split(' ')[0] || '',
          lastName: user?.lastName || user?.name?.split(' ')[1] || '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: user?.address || '',
          city: user?.city || '',
          country: user?.country || 'US',
          zip: user?.zip || ''
      }
  });

  const onSubmit = (data: ProfileFormData) => {
      updateMutation.mutate({ 
          ...data, 
          name: `${data.firstName} ${data.lastName}` // Sync display name
      });
  };

  const countries = getDeliverableCountries();

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-20">
      <SEO title="My Account" />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
                <Card className="p-6 border-none shadow-md sticky top-28">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-brand-dark text-white rounded-full flex items-center justify-center text-2xl font-heading font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 className="font-bold text-brand-dark leading-tight">{user?.name}</h2>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button 
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'orders' ? 'bg-brand-red text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Package size={18} className="mr-3" /> My Orders
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'settings' ? 'bg-brand-red text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <UserIcon size={18} className="mr-3" /> Profile & Address
                        </button>
                        <button 
                            onClick={logout}
                            className="w-full flex items-center p-3 rounded-xl transition-all font-bold text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 mt-4 border-t border-gray-100"
                        >
                            <LogOut size={18} className="mr-3" /> Sign Out
                        </button>
                    </nav>
                </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
                <Reveal>
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <h2 className="font-heading font-bold text-2xl text-brand-dark mb-4">Order History</h2>
                            
                            {isLoadingOrders ? (
                                <div className="text-center py-12 bg-white rounded-2xl shadow-sm"><p>Loading orders...</p></div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Package size={32} />
                                    </div>
                                    <h3 className="font-bold text-lg text-brand-dark">No orders yet</h3>
                                    <p className="text-gray-500 mb-6">Start your journey to vitality today.</p>
                                    <Button onClick={() => navigate('/product/himalaya-shilajit-resin')}>Shop Now</Button>
                                </div>
                            ) : (
                                orders.map((order: any) => (
                                    <Card key={order.id} className="p-0 overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-gray-50 p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
                                            <div className="flex gap-8">
                                                <div>
                                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Order Placed</span>
                                                    <span className="font-bold text-brand-dark text-sm">{order.date}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Total</span>
                                                    <span className="font-bold text-brand-dark text-sm">{formatPrice(order.total)}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Order #</span>
                                                    <span className="font-bold text-brand-dark text-sm">{order.id}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Paid' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            {order.itemsDetails?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-6 mb-4 last:mb-0">
                                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                                        <LazyImage src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-brand-dark mb-1">{item.title}</h4>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Button size="sm" variant="outline-dark" onClick={() => navigate(`/product/${item.productId || 'himalaya-shilajit-resin'}`)}>
                                                            Buy Again
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div>
                            <h2 className="font-heading font-bold text-2xl text-brand-dark mb-6">Profile Settings</h2>
                            <Card className="p-8 border-none shadow-md">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                                        <UserIcon size={18} className="text-brand-red" />
                                        <span className="font-bold text-sm uppercase text-gray-500">Personal Information</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                                            <input {...register('firstName')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-red" />
                                            {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                                            <input {...register('lastName')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-red" />
                                            {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                            <input {...register('email')} disabled className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                            <input {...register('phone')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-red" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4 pt-4 border-b border-gray-100 pb-2">
                                        <MapPin size={18} className="text-brand-red" />
                                        <span className="font-bold text-sm uppercase text-gray-500">Shipping Address</span>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Street Address</label>
                                        <input {...register('address')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-red" />
                                        {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                                            <input {...register('city')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-red" />
                                            {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Country</label>
                                            <select {...register('country')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-red">
                                                {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">ZIP / Postal Code</label>
                                            <input {...register('zip')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-red" />
                                            {errors.zip && <p className="text-red-500 text-xs">{errors.zip.message}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button type="submit" disabled={updateMutation.isPending} className="min-w-[150px]">
                                            {updateMutation.isPending ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Changes</>}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}
                </Reveal>
            </div>
        </div>
      </Container>
    </div>
  );
};
