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