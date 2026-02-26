/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Download, Home, Calendar, CreditCard, User, Mail, Phone, MapPin, Package, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const PaymentSuccess = () => {
    const [orderId, setOrderId] = useState('');
    const axiosSecure = useAxiosSecure();
    const [ziinaStatus, setZiinaStatus] = useState(null);

    const { data: paymentHistory, isLoading, error } = useQuery({
        queryKey: ['paymentDetails'],
        queryFn: async () => {
            const res = await axiosSecure.get('/payments/payment-history');
            return res.data;
        }
    });
    // console.log(paymentHistory);
    const payment = paymentHistory?.Data?.[0];

    useEffect(() => {
        if (!payment?.paymentId) return;

        const fetchPaymentStatus = async () => {
            try {
                const res = await axiosSecure.get(
                    `payments/ziina/status/${payment.paymentId}`
                );
                setZiinaStatus(res.data.status);
                // console.log('Payment status:', res.data.status);
            } catch (err) {
                console.error('Error in useEffect:', err);
            }
        };

        fetchPaymentStatus();
    }, [payment?.paymentId]);


    // সর্বশেষ পেমেন্ট ডেটা বের করা

    // Generate a random order ID on component mount (if not available from API)
    useEffect(() => {
        if (!payment?.orderId) {
            const id = 'ORD' + Math.floor(100000 + Math.random() * 900000);
            setOrderId(id);
        } else {
            setOrderId(payment.orderId);
        }
    }, [payment]);

    // ফরম্যাট করার ফাংশন
    const formatCurrency = (amount, currency = 'AED') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadReceipt = () => {
        if (!payment) return;

        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(0, 102, 204);
        doc.text('Payment Receipt', 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Order ID: ${payment.orderId || 'N/A'}`, 20, 40);
        doc.text(`Payment ID: ${payment.paymentId || 'N/A'}`, 20, 50);
        doc.text(`Amount: ${formatCurrency(payment.amount, payment.currency)}`, 20, 60);
        doc.text(`Payment Method: ${payment.paymentMethod || 'N/A'}`, 20, 70);
        doc.text(`Status: ${payment.status || 'N/A'}`, 20, 80);
        doc.text(`Date: ${formatDate(payment.createdAt)}`, 20, 90);

        doc.save(`receipt_${payment.orderId || 'payment'}.pdf`);
    };

    const handleBackToHome = () => {
        window.location.href = '/';
    };

    // লোডিং অবস্থা
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-300 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading payment details...</p>
                </div>
            </div>
        );
    }

    // এরর অবস্থা
    if (error || !payment) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">We couldn't load your payment details. Please try again later.</p>
                    <button
                        onClick={handleBackToHome}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Back to Homepage
                    </button>
                </div>
            </div>
        );
    }

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
                        Thank you for your payment. Your transaction has been completed successfully.
                    </p>
                    <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 rounded-full">
                        <span className="text-green-800 font-medium">Order ID: {orderId}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Payment Summary */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Payment Details Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Payment Details
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Payment ID</h3>
                                            <p className="text-sm text-gray-500 break-all">{payment.paymentId || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Order ID</h3>
                                            <p className="text-sm text-gray-500 break-all">{payment.orderId || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Payment Method</h3>
                                            <p className="text-sm text-gray-500 capitalize">{payment.paymentMethod || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Status</h3>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {ziinaStatus || payment.status || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Transaction Date</h3>
                                            <p className="text-sm text-gray-500">{formatDate(payment.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Amount */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span className="text-gray-900">Total Paid</span>
                                        <span className="text-blue-600">{formatCurrency(payment.amount, payment.currency)}</span>
                                    </div>
                                    {/* <p className="text-sm text-gray-500 mt-1">Currency: {payment.currency || 'AED'}</p> */}
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
                                            <h3 className="font-medium text-gray-900">Payment Confirmation</h3>
                                            <p className="text-sm text-gray-600 mt-1">We've received your payment. A confirmation email has been sent.</p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="shrink-0">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold">2</div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-medium text-gray-900">Booking Processing</h3>
                                            <p className="text-sm text-gray-600 mt-1">Your booking is being confirmed. You'll receive updates shortly.</p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="shrink-0">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-bold">3</div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-medium text-gray-900">Service Delivery</h3>
                                            <p className="text-sm text-gray-600 mt-1">Your service will be delivered as per the scheduled date.</p>
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
                                If you have any questions about your payment, please contact our customer support.
                            </p>
                            <div className="space-y-2">
                                <a href="mailto:support@ziina.com" className="block text-blue-600 font-medium text-sm hover:text-blue-800">
                                    ✉️ info@mpcpest.ae
                                </a>
                                <a href="tel:+15551234567" className="block text-blue-600 font-medium text-sm hover:text-blue-800">
                                    📞 056 333 9199
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;