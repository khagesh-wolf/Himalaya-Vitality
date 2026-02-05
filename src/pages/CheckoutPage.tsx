    const finalTotal = baseSubtotal + shippingData.cost + shippingData.tax;

    const handleSuccess = (orderId: string) => {
        clearCart();
        navigate('/order-confirmation', { state: { orderId } });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">