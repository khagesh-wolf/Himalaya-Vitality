
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, ShoppingCart, Package, MessageSquare, Settings, 
  Search, Tag, Check, X, Trash2, 
  Edit, Save, Bell, Plus, Mail, Truck, Megaphone, DollarSign, Percent, ArrowUpRight, ArrowDownRight, AlertTriangle, Download, History, Menu
} from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { MAIN_PRODUCT } from '../constants';
import { Discount, Review, Order, ProductVariant, Subscriber, RegionConfig, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { getDeliverableCountries, saveDeliverableCountries } from '../utils';
import { 
    fetchAdminOrders, updateOrderStatus, updateProduct, 
    fetchDiscounts, createDiscount, deleteDiscount, 
    fetchAdminReviews, updateReviewStatus, deleteReview, 
    fetchSubscribers, fetchInventoryLogs, fetchAdminStats,
    fetchProduct
} from '../services/api';
import { DashboardSkeleton } from '../components/Skeletons';
import { useCurrency } from '../context/CurrencyContext';

type AdminView = 'DASHBOARD' | 'ORDERS' | 'REVIEWS' | 'DISCOUNTS' | 'PRODUCTS' | 'SETTINGS' | 'SHIPPING' | 'SUBSCRIBERS' | 'INVENTORY_LOGS';

// Extended types for local admin state
interface AdminVariant extends ProductVariant {
  stock: number;
}
type AdminProduct = Omit<Product, 'variants'> & { variants: AdminVariant[] };

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={`flex items-center px-4 py-3 cursor-pointer rounded-lg transition-colors font-medium text-sm ${active ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'text-gray-500 hover:bg-gray-100'}`}
  >
    <Icon size={18} className="mr-3" />
    <span>{label}</span>
  </div>
);

// --- 1. Dashboard Home (Analytics) ---
const DashboardHome = ({ setCurrentView }: { setCurrentView: (view: AdminView) => void }) => {
    const { formatPrice } = useCurrency();
    const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchAdminStats });
    
    // Mock Chart Data (Real chart data requires time-series aggregation on backend)
    const chartData = [
        { name: 'Mon', sales: 4000 }, { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 }, { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 }, { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];

    if (isLoading) return <DashboardSkeleton />;

    const StatCard = ({ title, value, sub, icon: Icon, trend }: any) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-xl text-brand-dark"><Icon size={24}/></div>
                {trend && (
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</div>
            <div className="text-2xl font-heading font-extrabold text-brand-dark mb-1">{value}</div>
            <div className="text-gray-400 text-xs">{sub}</div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={formatPrice(stats?.totalRevenue || 0)} sub="Gross sales" icon={DollarSign} trend={12.5} />
                <StatCard title="Total Orders" value={stats?.totalOrders || 0} sub="Orders processed" icon={ShoppingCart} trend={-2.4} />
                <StatCard title="Avg. Order Value" value={formatPrice(stats?.avgOrderValue || 0)} sub="Per transaction" icon={Percent} trend={5.2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-6 shadow-sm">
                    <h3 className="font-heading font-bold text-lg text-brand-dark mb-6">Revenue Overview</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D0202F" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#D0202F" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} tickFormatter={(val) => `$${val}`} />
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                                <Area type="monotone" dataKey="sales" stroke="#D0202F" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- 2. Orders View ---
const OrdersView = () => {
    const { formatPrice } = useCurrency();
    const queryClient = useQueryClient();
    const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: fetchAdminOrders });
    const [filter, setFilter] = useState('All');

    const updateMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => updateOrderStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    });

    const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    return (
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                    {['All', 'Paid', 'Pending', 'Fulfilled'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-brand-dark text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{f}</button>
                    ))}
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold">Order ID</th>
                            <th className="p-4 font-bold">Customer</th>
                            <th className="p-4 font-bold">Date</th>
                            <th className="p-4 font-bold">Total</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filtered.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-brand-dark">{order.id}</td>
                                <td className="p-4">
                                    <div className="font-bold text-brand-dark">{order.customer}</div>
                                    <div className="text-xs text-gray-400">{order.email}</div>
                                </td>
                                <td className="p-4 text-gray-500">{order.date}</td>
                                <td className="p-4 font-bold">{formatPrice(order.total)}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        order.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                                        order.status === 'Fulfilled' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => updateMutation.mutate({ id: order.id, status: e.target.value })}
                                        className="bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-brand-red"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Fulfilled">Fulfilled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// --- 3. Products View ---
const ProductsView = () => {
    const queryClient = useQueryClient();
    const { data: product } = useQuery({ 
        queryKey: ['admin-product'], 
        queryFn: () => fetchProduct('himalaya-shilajit-resin'),
        initialData: MAIN_PRODUCT 
    });
    
    // Local state for editing
    const [editProduct, setEditProduct] = useState<AdminProduct>(product as AdminProduct);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { setEditProduct(product as AdminProduct) }, [product]);

    const handleVariantChange = (id: string, field: keyof AdminVariant, value: any) => {
        const updatedVariants = editProduct.variants.map(v => 
            v.id === id ? { ...v, [field]: value } : v
        );
        setEditProduct({ ...editProduct, variants: updatedVariants });
    };

    const mutation = useMutation({
        mutationFn: (data: any) => updateProduct(editProduct.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-product'] });
            setIsSaving(false);
            alert("Product updated!");
        }
    });

    const saveChanges = () => {
        setIsSaving(true);
        mutation.mutate(editProduct);
    };

    return (
        <div className="space-y-8">
            {/* General Info */}
            <Card className="p-8 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-brand-dark mb-6">Product Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Title</label>
                        <input 
                            value={editProduct.title} 
                            onChange={(e) => setEditProduct({...editProduct, title: e.target.value})}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none font-bold text-brand-dark"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea 
                            value={editProduct.description} 
                            onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                            rows={4}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none text-sm"
                        />
                    </div>
                </div>
            </Card>

            {/* Variants */}
            <Card className="p-0 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-heading font-bold text-lg text-brand-dark">Variants & Inventory</h3>
                    <Badge color="bg-green-500">Live on Store</Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="p-4">Variant Name</th>
                                <th className="p-4">Price ($)</th>
                                <th className="p-4">Compare At ($)</th>
                                <th className="p-4">Stock Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {editProduct.variants?.map(variant => (
                                <tr key={variant.id}>
                                    <td className="p-4 font-bold text-brand-dark">{variant.name}</td>
                                    <td className="p-4">
                                        <input 
                                            type="number" 
                                            value={variant.price} 
                                            onChange={(e) => handleVariantChange(variant.id, 'price', Number(e.target.value))}
                                            className="w-24 p-2 border border-gray-200 rounded focus:border-brand-red outline-none"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input 
                                            type="number" 
                                            value={variant.compareAtPrice} 
                                            onChange={(e) => handleVariantChange(variant.id, 'compareAtPrice', Number(e.target.value))}
                                            className="w-24 p-2 border border-gray-200 rounded focus:border-brand-red outline-none text-gray-500"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input 
                                            type="number" 
                                            value={variant.stock || 0} 
                                            onChange={(e) => handleVariantChange(variant.id, 'stock', Number(e.target.value))}
                                            className={`w-20 p-2 border rounded focus:border-brand-red outline-none ${variant.stock < 10 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="fixed bottom-6 right-6 z-30">
                <Button onClick={saveChanges} size="lg" className="shadow-2xl shadow-brand-red/40 animate-in fade-in slide-in-from-bottom-4">
                    {isSaving ? 'Saving...' : <><Save size={20} className="mr-2"/> Save Changes</>}
                </Button>
            </div>
        </div>
    );
};

// --- 4. Discounts Module ---
const DiscountsView = () => {
    const queryClient = useQueryClient();
    const { data: discounts = [] } = useQuery({ queryKey: ['admin-discounts'], queryFn: fetchDiscounts });
    const [newCode, setNewCode] = useState({ code: '', value: 10, type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED' });

    const createMutation = useMutation({
        mutationFn: createDiscount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
            setNewCode({ code: '', value: 10, type: 'PERCENTAGE' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDiscount,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-discounts'] })
    });

    const addDiscount = () => {
        if (!newCode.code) return;
        createMutation.mutate({ ...newCode, code: newCode.code.toUpperCase(), active: true });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card className="p-6 sticky top-8">
                    <h3 className="font-heading font-bold text-lg text-brand-dark mb-4">Create Discount</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Code</label>
                            <input 
                                value={newCode.code}
                                onChange={(e) => setNewCode({...newCode, code: e.target.value})}
                                placeholder="e.g. SUMMER20" 
                                className="w-full p-3 border border-gray-200 rounded-lg uppercase outline-none focus:border-brand-red" 
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Value</label>
                                <input 
                                    type="number"
                                    value={newCode.value}
                                    onChange={(e) => setNewCode({...newCode, value: Number(e.target.value)})}
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-brand-red" 
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                                <select 
                                    value={newCode.type}
                                    onChange={(e) => setNewCode({...newCode, type: e.target.value as any})}
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-brand-red bg-white"
                                >
                                    <option value="PERCENTAGE">% Off</option>
                                    <option value="FIXED">$ Off</option>
                                </select>
                            </div>
                        </div>
                        <Button fullWidth onClick={addDiscount}>Create Code</Button>
                    </div>
                </Card>
            </div>
            
            <div className="lg:col-span-2">
                <Card className="p-0 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="p-4">Code</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {discounts.map(d => (
                                <tr key={d.id}>
                                    <td className="p-4 font-bold font-mono text-brand-dark">{d.code}</td>
                                    <td className="p-4">{d.type === 'PERCENTAGE' ? `${d.value}% Off` : `$${d.value} Off`}</td>
                                    <td className="p-4"><Badge color="bg-green-500">Active</Badge></td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => deleteMutation.mutate(d.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {discounts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400">No active discounts</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
};

// --- 5. Reviews Module ---
const ReviewsView = () => {
    const queryClient = useQueryClient();
    const { data: reviews = [] } = useQuery({ queryKey: ['admin-reviews'], queryFn: fetchAdminReviews });

    const updateMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => updateReviewStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    });

    const deleteMutation = useMutation({
        mutationFn: deleteReview,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    });

    const handleAction = (id: string, action: 'approve' | 'delete') => {
        if (action === 'delete') {
            if(window.confirm('Delete this review?')) deleteMutation.mutate(id);
        } else {
            updateMutation.mutate({ id, status: 'Approved' });
        }
    };

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-heading font-bold text-lg text-brand-dark">Review Moderation</h3>
                <div className="text-sm text-gray-500">{reviews.length} Total</div>
            </div>
            <div className="divide-y divide-gray-100">
                {reviews.map(review => (
                    <div key={review.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-brand-dark">{review.author}</span>
                                {review.verified && <Badge color="bg-blue-500">Verified Buyer</Badge>}
                                {review.status === 'Pending' && <Badge color="bg-yellow-500">Pending</Badge>}
                            </div>
                            <div className="flex text-brand-red mb-2 text-xs">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                ))}
                            </div>
                            <h4 className="font-bold text-sm mb-1">{review.title}</h4>
                            <p className="text-sm text-gray-600">{review.content}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {review.status !== 'Approved' && (
                                <button onClick={() => handleAction(review.id, 'approve')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Approve">
                                    <Check size={18} />
                                </button>
                            )}
                            <button onClick={() => handleAction(review.id, 'delete')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// --- 6. Subscribers View ---
const SubscribersView = () => {
    const { data: subscribers = [] } = useQuery({ queryKey: ['admin-subscribers'], queryFn: fetchSubscribers });

    const exportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Email,Date,Source\n"
            + subscribers.map(e => `${e.id},${e.email},${e.date},${e.source}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subscribers.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-heading font-bold text-lg text-brand-dark">Newsletter Subscribers</h3>
                <Button size="sm" variant="outline" onClick={exportCSV}><Download size={16} className="mr-2"/> Export CSV</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <th className="p-4">Email</th>
                            <th className="p-4">Date Joined</th>
                            <th className="p-4">Source</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {subscribers.map((sub, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-brand-dark">{sub.email}</td>
                                <td className="p-4 text-gray-500">{sub.date}</td>
                                <td className="p-4"><Badge color="bg-gray-500">{sub.source}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// --- Inventory Logs View ---
const InventoryLogView = () => {
    const { data: logs = [] } = useQuery({ queryKey: ['admin-logs'], queryFn: fetchInventoryLogs });

    return (
        <Card className="p-0 overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="p-4">SKU / Variant</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Qty Change</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="p-4 font-bold text-brand-dark">{log.sku}</td>
                            <td className="p-4">{log.action}</td>
                            <td className={`p-4 font-bold ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{log.quantity > 0 ? '+' : ''}{log.quantity}</td>
                            <td className="p-4">{log.user}</td>
                            <td className="p-4 text-gray-500">{log.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};

// --- Main Dashboard Component ---
export const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<AdminView>('DASHBOARD');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/admin/login');
  }, [isAuthenticated, navigate]);

  const handleViewChange = (view: AdminView) => {
      setCurrentView(view);
      setIsMobileSidebarOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <SEO title="Admin Dashboard" />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
           <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-red text-white flex items-center justify-center font-heading font-extrabold text-sm rounded-br-lg rounded-tl-lg">HV</div>
            <span className="font-heading font-bold text-lg text-brand-dark uppercase">Himalaya</span>
           </div>
           <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-brand-dark">
               <X size={20} />
           </button>
        </div>
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'DASHBOARD'} onClick={() => handleViewChange('DASHBOARD')} />
          <SidebarItem icon={ShoppingCart} label="Orders" active={currentView === 'ORDERS'} onClick={() => handleViewChange('ORDERS')} />
          <SidebarItem icon={Package} label="Products" active={currentView === 'PRODUCTS'} onClick={() => handleViewChange('PRODUCTS')} />
          <SidebarItem icon={Tag} label="Discounts" active={currentView === 'DISCOUNTS'} onClick={() => handleViewChange('DISCOUNTS')} />
          <SidebarItem icon={Mail} label="Subscribers" active={currentView === 'SUBSCRIBERS'} onClick={() => handleViewChange('SUBSCRIBERS')} />
          <SidebarItem icon={MessageSquare} label="Reviews" active={currentView === 'REVIEWS'} onClick={() => handleViewChange('REVIEWS')} />
          <SidebarItem icon={History} label="Inventory Logs" active={currentView === 'INVENTORY_LOGS'} onClick={() => handleViewChange('INVENTORY_LOGS')} />
          {/* Settings moved to context based, keeping link for structure */}
          <SidebarItem icon={Settings} label="Settings" active={currentView === 'SETTINGS'} onClick={() => handleViewChange('SETTINGS')} />
        </div>
        <div className="p-4 border-t border-gray-100">
             <Button fullWidth variant="ghost" onClick={logout} className="text-gray-500 hover:text-red-500 justify-start">
                Sign Out
             </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileSidebarOpen(true)} className="text-brand-dark">
                    <Menu size={24} />
                </button>
                <span className="font-heading font-bold text-lg text-brand-dark">Admin Panel</span>
            </div>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <h1 className="text-2xl font-heading font-bold text-brand-dark">
                    {currentView.charAt(0) + currentView.slice(1).toLowerCase().replace('_', ' ')}
                </h1>
            </div>

            {currentView === 'DASHBOARD' && <DashboardHome setCurrentView={handleViewChange} />}
            {currentView === 'ORDERS' && <OrdersView />}
            {currentView === 'PRODUCTS' && <ProductsView />}
            {currentView === 'DISCOUNTS' && <DiscountsView />}
            {currentView === 'REVIEWS' && <ReviewsView />}
            {currentView === 'SUBSCRIBERS' && <SubscribersView />}
            {currentView === 'INVENTORY_LOGS' && <InventoryLogView />}
            {/* Settings View component reused from previous or simple placeholder */}
            {currentView === 'SETTINGS' && (
                <Card className="p-8"><h3 className="font-bold">Settings are managed via global context.</h3></Card>
            )}
        </div>
      </div>
    </div>
  );
};
