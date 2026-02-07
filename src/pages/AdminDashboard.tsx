
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, ShoppingCart, Package, Tag, Check, X, Trash2, 
  Save, Mail, Truck, DollarSign, Percent, ArrowUpRight, ArrowDownRight, Download, History, Menu, Send, Box, Calendar, Globe, Plus, Pencil, Database, MessageSquare
} from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { Order, ProductVariant, Product, RegionConfig, BundleType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { 
    fetchAdminOrders, updateOrderStatus, updateOrderTracking, updateProduct, 
    fetchDiscounts, createDiscount, deleteDiscount, 
    fetchSubscribers, fetchInventoryLogs, fetchAdminStats,
    fetchProduct, sendAdminNewsletter,
    fetchShippingRegions, createShippingRegion, updateShippingRegion, deleteShippingRegion,
    fetchContactMessages
} from '../services/api';
import { DashboardSkeleton } from '../components/Skeletons';
import { useCurrency } from '../context/CurrencyContext';

type AdminView = 'DASHBOARD' | 'ORDERS' | 'DISCOUNTS' | 'PRODUCTS' | 'SUBSCRIBERS' | 'SHIPPING' | 'INVENTORY_LOGS' | 'MESSAGES';

// Extended types for local admin state
// Using type intersection ensures all properties from ProductVariant are included correctly
type AdminVariant = ProductVariant & {
  stock: number;
};

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
const DashboardHome = () => {
    const { formatPrice } = useCurrency();
    const [dateRange, setDateRange] = useState('30'); // '7', '30', '90', '365'
    
    // Calculate dates based on range
    const getDates = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - parseInt(dateRange));
        return { start, end };
    };

    const { start, end } = getDates();
    
    const { data: stats, isLoading } = useQuery({ 
        queryKey: ['admin-stats', dateRange], 
        queryFn: () => fetchAdminStats(start, end) 
    });
    
    if (isLoading) return <DashboardSkeleton />;

    const StatCard = ({ title, value, sub, icon: Icon, trend }: any) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-xl text-brand-dark"><Icon size={24}/></div>
                {trend !== undefined && (
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trend >= 0 ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
                        {Math.abs(trend).toFixed(1)}%
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
            <div className="flex justify-end">
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                    <Calendar size={16} className="ml-2 mr-2 text-gray-400" />
                    {['7', '30', '90'].map(d => (
                        <button 
                            key={d} 
                            onClick={() => setDateRange(d)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${dateRange === d ? 'bg-brand-dark text-white shadow-sm' : 'text-gray-500 hover:text-brand-dark'}`}
                        >
                            Last {d} Days
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Revenue" 
                    value={formatPrice(stats?.totalRevenue || 0)} 
                    sub="Gross sales" 
                    icon={DollarSign} 
                    trend={stats?.trends?.revenue} 
                />
                <StatCard 
                    title="Orders" 
                    value={stats?.totalOrders || 0} 
                    sub="Total placed" 
                    icon={ShoppingCart} 
                    trend={stats?.trends?.orders} 
                />
                <StatCard 
                    title="AOV" 
                    value={formatPrice(stats?.avgOrderValue || 0)} 
                    sub="Avg. Order Value" 
                    icon={Percent} 
                    trend={stats?.trends?.aov} 
                />
            </div>

            {/* Revenue Chart */}
            <Card className="p-6">
                <h3 className="font-heading font-bold text-lg text-brand-dark mb-6">Revenue Overview</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.chart || []}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D0202F" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#D0202F" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 12, fill: '#9CA3AF'}} 
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return `${date.getMonth()+1}/${date.getDate()}`;
                                }}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 12, fill: '#9CA3AF'}} 
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#D0202F', fontWeight: 'bold' }}
                                formatter={(value: number) => [formatPrice(value), 'Revenue']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#D0202F" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

// --- 2. Orders View (Functional) ---
const OrdersView = () => {
    const { formatPrice } = useCurrency();
    const queryClient = useQueryClient();
    const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: fetchAdminOrders });
    const [filter, setFilter] = useState('All');
    
    // Tracking Modal State
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('Australia Post');
    const [notifyCustomer, setNotifyCustomer] = useState(true);

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) => updateOrderStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    });

    const updateTrackingMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => updateOrderTracking(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            setEditingOrder(null);
            alert("Order updated & customer notified!");
        }
    });

    const handleFulfill = (order: any) => {
        setEditingOrder(order.id);
        setTrackingNumber(order.trackingNumber || '');
        setCarrier(order.carrier || 'Australia Post');
    };

    const submitTracking = () => {
        if (!editingOrder) return;
        updateTrackingMutation.mutate({
            id: editingOrder,
            data: { trackingNumber, carrier, notify: notifyCustomer }
        });
    };

    const exportCSV = () => {
        const filteredData = filter === 'All' ? orders : orders.filter((o: any) => o.status === filter);
        const getItemsString = (items: any[]) => Array.isArray(items) ? items.map(i => `${i.quantity}x ${i.name}`).join(' | ') : '';

        const csvContent = "data:text/csv;charset=utf-8," 
            + "Order ID,Customer,Email,Items,Total Jars,Total,Status,Date,Tracking,Carrier\n"
            + filteredData.map((o: any) => `"${o.id}","${o.customer}","${o.email}","${getItemsString(o.items)}","${o.totalJars || 0}","${o.total}","${o.status}","${o.date}","${o.trackingNumber || ''}","${o.carrier || ''}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filtered = filter === 'All' ? orders : orders.filter((o: any) => o.status === filter);

    return (
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                    {['All', 'Paid', 'Pending', 'Fulfilled'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f ? 'bg-brand-dark text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{f}</button>
                    ))}
                </div>
                <Button size="sm" variant="outline" onClick={exportCSV}>
                    <Download size={16} className="mr-2"/> Export CSV
                </Button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold">Order ID</th>
                            <th className="p-4 font-bold">Customer</th>
                            <th className="p-4 font-bold">Items Purchased</th>
                            <th className="p-4 font-bold text-center">Total Jars</th>
                            <th className="p-4 font-bold">Total</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold">Fulfillment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filtered.map((order: any) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-brand-dark">{order.id}</td>
                                <td className="p-4">
                                    <div className="font-bold text-brand-dark">{order.customer}</div>
                                    <div className="text-xs text-gray-400">{order.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-1">
                                        {Array.isArray(order.items) && order.items.length > 0 ? (
                                            order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center text-xs">
                                                    <span className="font-bold bg-gray-100 text-brand-dark px-1.5 py-0.5 rounded mr-2 min-w-[24px] text-center border border-gray-200">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-gray-600 font-medium truncate max-w-[200px]" title={item.name}>{item.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No items found</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-red/10 text-brand-red font-bold text-sm border border-brand-red/20 shadow-sm">
                                        {order.totalJars || 0}
                                    </div>
                                </td>
                                <td className="p-4 font-bold">{formatPrice(order.total)}</td>
                                <td className="p-4">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                                        className={`px-2 py-1 rounded text-xs font-bold outline-none border border-transparent hover:border-gray-300 ${
                                            order.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                                            order.status === 'Fulfilled' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Fulfilled">Fulfilled</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    {order.trackingNumber ? (
                                        <div className="text-xs">
                                            <div className="font-bold text-brand-dark">{order.carrier}</div>
                                            <a href="#" className="text-brand-red hover:underline">{order.trackingNumber}</a>
                                            <button onClick={() => handleFulfill(order)} className="ml-2 text-gray-400 hover:text-brand-dark underline">Edit</button>
                                        </div>
                                    ) : (
                                        <Button size="sm" onClick={() => handleFulfill(order)} className="h-8 text-xs bg-brand-dark hover:bg-black">
                                            Add Tracking
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tracking Modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingOrder(null)} />
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-heading font-bold text-lg text-brand-dark flex items-center">
                                <Truck className="mr-2" size={20}/> Update Shipment
                            </h3>
                            <button onClick={() => setEditingOrder(null)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Carrier</label>
                                <select 
                                    value={carrier} 
                                    onChange={(e) => setCarrier(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-brand-red"
                                >
                                    <option value="Australia Post">Australia Post</option>
                                    <option value="DHL Express">DHL Express</option>
                                    <option value="FedEx">FedEx</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tracking Number</label>
                                <input 
                                    type="text" 
                                    value={trackingNumber} 
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="e.g. 33XHK7..." 
                                    className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-brand-red"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                                <input 
                                    type="checkbox" 
                                    id="notify" 
                                    checked={notifyCustomer} 
                                    onChange={(e) => setNotifyCustomer(e.target.checked)}
                                    className="rounded text-brand-red focus:ring-brand-red"
                                />
                                <label htmlFor="notify" className="text-sm text-blue-900 font-medium cursor-pointer">
                                    Send email notification to customer
                                </label>
                            </div>

                            <Button fullWidth onClick={submitTracking} disabled={updateTrackingMutation.isPending}>
                                {updateTrackingMutation.isPending ? 'Sending...' : 'Update & Notify'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

// --- 3. Products View (Simplified) ---
const ProductsView = () => {
    const queryClient = useQueryClient();
    const { data: product } = useQuery({ 
        queryKey: ['admin-product'], 
        queryFn: () => fetchProduct('himalaya-shilajit-resin')
    });
    
    const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
    const [totalStock, setTotalStock] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { 
        if (product) {
            setEditProduct(product as AdminProduct); 
            // Product comes with variants that have calculated stock, but we need the master stock
            // Assuming API returns totalStock on the product object
            if (product.totalStock !== undefined) {
                setTotalStock(product.totalStock);
            }
        }
    }, [product]);

    const handleVariantPriceChange = (id: string, field: string, value: string) => {
        if (!editProduct) return;
        const updatedVariants = editProduct.variants.map(v => 
            v.id === id ? { ...v, [field]: value } : v
        );
        setEditProduct({ ...editProduct, variants: updatedVariants as any });
    };

    const mutation = useMutation({
        mutationFn: (data: any) => updateProduct(editProduct!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-product'] });
            setIsSaving(false);
            alert("Pricing and Master Inventory updated successfully!");
        },
        onError: (err) => {
            setIsSaving(false);
            alert("Failed to update product.");
        }
    });

    const saveChanges = () => {
        if (!editProduct) return;
        setIsSaving(true);
        // Ensure values are numbers before sending
        const cleanVariants = editProduct.variants.map(v => ({
            ...v,
            price: parseFloat(v.price.toString()),
            compareAtPrice: parseFloat(v.compareAtPrice.toString()),
            // stock is not sent for variants anymore, master stock is sent separately
        }));
        mutation.mutate({ variants: cleanVariants, totalStock: totalStock });
    };

    // Calculate dynamic stocks for display preview
    const calculateStockPreview = (bundleType: string) => {
        const multiplier = bundleType === 'TRIPLE' ? 3 : bundleType === 'DOUBLE' ? 2 : 1;
        return Math.floor(totalStock / multiplier);
    };

    if (!editProduct) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Master Inventory Control */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-dark text-white rounded-xl flex items-center justify-center shadow-lg">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="font-heading font-bold text-lg text-brand-dark">Master Inventory</h3>
                        <p className="text-gray-500 text-sm">Total physical jars available in warehouse.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-sm font-bold text-gray-500 uppercase">Total Jars:</span>
                    <input 
                        type="number" 
                        value={totalStock} 
                        onChange={(e) => setTotalStock(parseInt(e.target.value) || 0)}
                        className="w-32 text-2xl font-bold text-brand-red bg-transparent outline-none text-right"
                    />
                </div>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-heading font-bold text-lg text-brand-dark">Pricing & Bundles</h3>
                    <Badge color="bg-green-500">Live on Store</Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="p-4">Variant Name</th>
                                <th className="p-4">Price ($)</th>
                                <th className="p-4">Compare At ($)</th>
                                <th className="p-4">Calculated Stock</th>
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
                                            onChange={(e) => handleVariantPriceChange(variant.id, 'price', e.target.value)}
                                            className="w-24 p-2 border border-gray-200 rounded focus:border-brand-red outline-none font-bold"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input 
                                            type="number" 
                                            value={variant.compareAtPrice} 
                                            onChange={(e) => handleVariantPriceChange(variant.id, 'compareAtPrice', e.target.value)}
                                            className="w-24 p-2 border border-gray-200 rounded focus:border-brand-red outline-none text-gray-500"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${calculateStockPreview(variant.type) < 10 ? 'text-red-500' : 'text-gray-700'}`}>
                                                {calculateStockPreview(variant.type)}
                                            </span>
                                            <span className="text-xs text-gray-400">available</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="fixed bottom-6 right-6 z-30">
                <Button onClick={saveChanges} size="lg" className="shadow-2xl shadow-brand-red/40 animate-in fade-in slide-in-from-bottom-4">
                    {isSaving ? 'Saving...' : <><Save size={20} className="mr-2"/> Save All Changes</>}
                </Button>
            </div>
        </div>
    );
};

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
                                    onFocus={(e) => e.target.select()}
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

// --- Shipping Regions Management ---
const ShippingView = () => {
    const queryClient = useQueryClient();
    const { data: regions = [], isLoading } = useQuery({ queryKey: ['shipping-regions'], queryFn: fetchShippingRegions });
    
    // Form State (using strings for number inputs to prevent NaN)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        shippingCost: '',
        taxRate: '',
        eta: ''
    });

    const createMutation = useMutation({
        mutationFn: createShippingRegion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipping-regions'] });
            resetForm();
        },
        onError: (err: any) => {
            alert("Failed to create region. Ensure you are logged in as Admin.");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({id, data}: {id: string, data: Partial<RegionConfig>}) => updateShippingRegion(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipping-regions'] });
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteShippingRegion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shipping-regions'] })
    });

    const resetForm = () => {
        setEditingId(null);
        setFormData({ code: '', name: '', shippingCost: '', taxRate: '', eta: '' });
    };

    const handleEdit = (region: RegionConfig) => {
        setEditingId(region.id);
        setFormData({
            code: region.code,
            name: region.name,
            shippingCost: region.shippingCost.toString(),
            taxRate: region.taxRate.toString(),
            eta: region.eta
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            shippingCost: parseFloat(formData.shippingCost || '0'),
            taxRate: parseFloat(formData.taxRate || '0')
        };

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card className="p-6 sticky top-8">
                    <h3 className="font-heading font-bold text-lg text-brand-dark mb-4">
                        {editingId ? 'Edit Region' : 'Add Shipping Region'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Code</label>
                                <input 
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                    placeholder="US" 
                                    className="w-full p-2 border border-gray-200 rounded-lg uppercase outline-none focus:border-brand-red" 
                                    maxLength={2}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Country Name</label>
                                <input 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="United States" 
                                    className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-brand-red" 
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Cost ($)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={formData.shippingCost}
                                    onChange={(e) => setFormData({...formData, shippingCost: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-brand-red" 
                                    required
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Tax (%)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData({...formData, taxRate: e.target.value})}
                                    className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-brand-red" 
                                    required
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>
                        </div>
                        <div>
                             <label className="text-xs font-bold text-gray-500 uppercase">Estimated Delivery</label>
                             <input 
                                value={formData.eta}
                                onChange={(e) => setFormData({...formData, eta: e.target.value})}
                                placeholder="5-10 Business Days" 
                                className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-brand-red" 
                                required
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button fullWidth type="submit">
                                {editingId ? 'Update Region' : 'Add Region'}
                            </Button>
                            {editingId && (
                                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
                            )}
                        </div>
                    </form>
                </Card>
            </div>
            
            <div className="lg:col-span-2">
                <Card className="p-0 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <th className="p-4">Region</th>
                                <th className="p-4">Cost</th>
                                <th className="p-4">Tax</th>
                                <th className="p-4">ETA</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {regions.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-bold text-brand-dark">{r.name}</div>
                                        <div className="text-xs text-gray-400 font-mono">{r.code}</div>
                                    </td>
                                    <td className="p-4">${r.shippingCost}</td>
                                    <td className="p-4">{r.taxRate}%</td>
                                    <td className="p-4 text-gray-500 text-xs">{r.eta}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(r)} className="text-gray-400 hover:text-brand-dark transition-colors">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => deleteMutation.mutate(r.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {regions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">No shipping regions configured.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
};

const SubscribersView = () => {
    const { data: subscribers = [] } = useQuery({ queryKey: ['admin-subscribers'], queryFn: fetchSubscribers });
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sending, setSending] = useState(false);

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

    const handleSendEmail = async () => {
        if(!emailSubject || !emailMessage) return alert("Please fill in subject and message");
        setSending(true);
        try {
            const res = await sendAdminNewsletter(emailSubject, emailMessage);
            alert(`Email sent successfully to ${res.sent} subscribers!`);
            setIsEmailModalOpen(false);
            setEmailSubject('');
            setEmailMessage('');
        } catch (e: any) {
            alert("Failed to send: " + e.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-heading font-bold text-lg text-brand-dark">Newsletter Subscribers</h3>
                    <div className="flex gap-3">
                         <Button size="sm" onClick={() => setIsEmailModalOpen(true)}>
                            <Mail size={16} className="mr-2"/> Compose Email
                         </Button>
                         <Button size="sm" variant="outline" onClick={exportCSV}><Download size={16} className="mr-2"/> Export CSV</Button>
                    </div>
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
            
            {/* Email Composition Modal */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEmailModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                            <h3 className="font-heading font-bold text-lg text-brand-dark flex items-center">
                                <Send className="mr-2" size={20}/> Broadcast Newsletter
                            </h3>
                            <button onClick={() => setIsEmailModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">To</label>
                                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                                    All Subscribers ({subscribers.length})
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Subject</label>
                                <input 
                                    type="text" 
                                    value={emailSubject} 
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="e.g. Special Offer Inside!" 
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-brand-red font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Message (HTML Supported)</label>
                                <textarea 
                                    value={emailMessage} 
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    placeholder="<p>Hello Tribe,</p>..." 
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-brand-red font-mono text-sm h-64"
                                />
                            </div>
                            
                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <Button onClick={handleSendEmail} disabled={sending} className="shadow-lg shadow-brand-red/20">
                                    {sending ? 'Sending...' : <><Send size={16} className="mr-2"/> Send Broadcast</>}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MessagesView = () => {
    const { data: messages = [] } = useQuery({ queryKey: ['admin-messages'], queryFn: fetchContactMessages });

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="font-heading font-bold text-lg text-brand-dark">Inbox (Contact Form)</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <th className="p-4">Date</th>
                            <th className="p-4">From</th>
                            <th className="p-4">Subject</th>
                            <th className="p-4">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {messages.map((msg: any) => (
                            <tr key={msg.id} className="hover:bg-gray-50">
                                <td className="p-4 whitespace-nowrap text-gray-500 text-xs">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-brand-dark">{msg.name}</div>
                                    <div className="text-xs text-gray-400">{msg.email}</div>
                                </td>
                                <td className="p-4 font-medium">{msg.subject}</td>
                                <td className="p-4 text-gray-600 max-w-md truncate">{msg.message}</td>
                            </tr>
                        ))}
                        {messages.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">No messages found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

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
  const { isAuthenticated, logout, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  // Strict Security Check: Must be Authenticated AND Admin
  useEffect(() => {
    if (!isAuthenticated) {
        navigate('/admin/login');
    } else if (user?.role !== 'ADMIN') {
        // Logged in user trying to access admin? Redirect them.
        navigate('/'); 
    }
  }, [isAuthenticated, user, navigate]);

  const handleViewChange = (view: AdminView) => {
      setCurrentView(view);
      setIsMobileSidebarOpen(false);
  };

  // Prevent flash of content for non-admins
  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <SEO title="Admin Dashboard" />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
           <div className="flex items-center gap-2">
            <img 
                src="https://i.ibb.co/tMXQXvJn/logo-red.png" 
                alt="Himalaya" 
                className="h-8 w-auto object-contain" 
            />
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
          <SidebarItem icon={Globe} label="Shipping" active={currentView === 'SHIPPING'} onClick={() => handleViewChange('SHIPPING')} />
          <SidebarItem icon={Mail} label="Subscribers" active={currentView === 'SUBSCRIBERS'} onClick={() => handleViewChange('SUBSCRIBERS')} />
          <SidebarItem icon={MessageSquare} label="Messages" active={currentView === 'MESSAGES'} onClick={() => handleViewChange('MESSAGES')} />
          <SidebarItem icon={History} label="Inventory Logs" active={currentView === 'INVENTORY_LOGS'} onClick={() => handleViewChange('INVENTORY_LOGS')} />
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

            {currentView === 'DASHBOARD' && <DashboardHome />}
            {currentView === 'ORDERS' && <OrdersView />}
            {currentView === 'PRODUCTS' && <ProductsView />}
            {currentView === 'DISCOUNTS' && <DiscountsView />}
            {currentView === 'SHIPPING' && <ShippingView />}
            {currentView === 'SUBSCRIBERS' && <SubscribersView />}
            {currentView === 'MESSAGES' && <MessagesView />}
            {currentView === 'INVENTORY_LOGS' && <InventoryLogView />}
        </div>
      </div>
    </div>
  );
};
