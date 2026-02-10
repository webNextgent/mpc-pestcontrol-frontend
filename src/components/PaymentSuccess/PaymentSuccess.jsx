import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Download, Home, Package, Calendar, CreditCard, User, Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const PaymentSuccess = () => {
    const [orderId, setOrderId] = useState('');
    const [countdown, setCountdown] = useState(10);
    const axiosSecure = useAxiosSecure();

    const { data: paymentHistory, isLoading, refetch } = useQuery({
        queryKey: ['paymentDetails'],
        queryFn: async () => {
            const res = await axiosSecure.get('/payments/payment-history');
            return res.data;
        }
    });


    // Generate a random order ID on component mount
    useEffect(() => {
        const id = 'ORD' + Math.floor(100000 + Math.random() * 900000);
        setOrderId(id);

        // Countdown timer for redirect
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // In a real app, you would redirect here
                    // window.location.href = '/';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const orderDetails = {
        items: [
            { id: 1, name: 'Premium Wireless Headphones', quantity: 1, price: 129.99 },
            { id: 2, name: 'Phone Case - Protective', quantity: 2, price: 19.99 },
            { id: 3, name: 'Screen Protector (Pack of 3)', quantity: 1, price: 14.99 },
        ],
        shipping: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            address: '123 Main Street, Suite 456',
            city: 'New York, NY 10001',
        },
        paymentMethod: 'Visa ending in 4242',
        orderDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    };

    const subtotal = orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    const handleDownloadReceipt = () => {
        alert('Receipt download started! In a real app, this would generate a PDF.');
    };

    const handleBackToHome = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="h-16 w-16 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-lg text-gray-600">
                        Thank you for your order. We've received your payment and your order is being processed.
                    </p>
                    <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 rounded-full">
                        <span className="text-green-800 font-medium">Order ID: {orderId}</span>
                        <span className="ml-2 text-green-600 text-sm">Keep this for your records</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Summary */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Details Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Order Details
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {orderDetails.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                                <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="font-medium">${shippingCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax</span>
                                            <span className="font-medium">${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between pt-3 border-t border-gray-200 text-lg font-bold">
                                            <span className="text-gray-900">Total</span>
                                            <span className="text-blue-600">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Info */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Shipping Address
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                            <span className="font-medium">{orderDetails.shipping.name}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                            <span>{orderDetails.shipping.email}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                                            <span>{orderDetails.shipping.phone}</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="font-medium">{orderDetails.shipping.address}</p>
                                            <p className="text-gray-600">{orderDetails.shipping.city}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment & Delivery Info */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        Payment & Delivery
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-5">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
                                            <p className="font-medium">{orderDetails.paymentMethod}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                Order Date
                                            </h3>
                                            <p className="font-medium">{orderDetails.orderDate}</p>
                                        </div>

                                        <div className="pt-3 border-t border-gray-100">
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Delivery</h3>
                                            <p className="font-medium text-green-600">{orderDetails.deliveryDate}</p>
                                            <p className="text-sm text-gray-500 mt-1">You will receive tracking information via email.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Next Steps */}
                    <div className="space-y-6">
                        {/* Next Steps Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-5 bg-blue-50 border-b border-blue-100">
                                <h2 className="text-xl font-bold text-gray-900">What's Next?</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div className="flex">
                                        <div className="shrink-0">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold">1</div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-medium text-gray-900">Order Confirmation</h3>
                                            <p className="text-sm text-gray-600 mt-1">We've sent a confirmation email with your order details.</p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="shrink-0">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold">2</div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-medium text-gray-900">Order Processing</h3>
                                            <p className="text-sm text-gray-600 mt-1">Your order is being prepared for shipment.</p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="shrink-0">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold">3</div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-medium text-gray-900">Shipping</h3>
                                            <p className="text-sm text-gray-600 mt-1">You'll receive tracking information once your order ships.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={handleDownloadReceipt}
                                className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Download Receipt
                            </button>

                            <button
                                onClick={handleBackToHome}
                                className="w-full flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                <Home className="h-5 w-5 mr-2" />
                                Back to Homepage
                            </button>
                        </div>

                        {/* Help Section */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                If you have any questions about your order, please contact our customer support.
                            </p>
                            <div className="space-y-2">
                                <a href="mailto:support@ziina.com" className="block text-blue-600 font-medium text-sm hover:text-blue-800">
                                    ✉️ support@ziina.com
                                </a>
                                <a href="tel:+15551234567" className="block text-blue-600 font-medium text-sm hover:text-blue-800">
                                    📞 +1 (555) 123-4567
                                </a>
                            </div>
                        </div>

                        {/* Countdown Redirect */}
                        <div className="text-center text-sm text-gray-500">
                            <p>You will be redirected to the homepage in <span className="font-bold text-blue-600">{countdown}</span> seconds.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;