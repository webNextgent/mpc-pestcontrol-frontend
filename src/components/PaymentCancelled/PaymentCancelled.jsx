import React, { useEffect, useState } from 'react';
import { XCircle, AlertTriangle, RefreshCw, Home, CreditCard, Mail, Phone, Clock, Shield } from 'lucide-react';

const PaymentCancelled = () => {
    const [retryCount, setRetryCount] = useState(0);
    const [redirectCountdown, setRedirectCountdown] = useState(15);

    useEffect(() => {
        const timer = setInterval(() => {
            setRedirectCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // window.location.href = '/';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleRetryPayment = () => {
        setRetryCount(prev => prev + 1);
        // In real app: redirect to payment page
        alert('Redirecting to payment page...');
    };

    const handleBackToHome = () => {
        window.location.href = '/';
    };

    const handleContactSupport = () => {
        window.location.href = 'mailto:support@ziina.com';
    };

    const commonIssues = [
        {
            title: 'Insufficient Funds',
            description: 'Ensure your account has sufficient balance',
            icon: <CreditCard className="h-5 w-5" />
        },
        {
            title: 'Expired Card',
            description: 'Check your card expiration date',
            icon: <Clock className="h-5 w-5" />
        },
        {
            title: 'Security Block',
            description: 'Your bank might have blocked the transaction',
            icon: <Shield className="h-5 w-5" />
        },
        {
            title: 'Technical Error',
            description: 'Temporary issue with payment processor',
            icon: <AlertTriangle className="h-5 w-5" />
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-100 p-5 rounded-full">
                            <XCircle className="h-20 w-20 text-red-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Payment Cancelled</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your payment was not completed. No charges have been made to your account.
                    </p>

                    {retryCount > 0 && (
                        <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-50 rounded-full">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-yellow-800">Retry attempt: {retryCount}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-red-500">
                            <div className="px-6 py-5 bg-red-50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                                    Transaction Status
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                <XCircle className="h-6 w-6 text-red-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-bold text-gray-900 text-lg">Payment Failed</h3>
                                            <p className="text-gray-600 mt-1">
                                                The transaction was cancelled before completion. Your order has been saved in your cart.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h4 className="font-semibold text-gray-900 mb-3">Your order is still available</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Order Total:</span>
                                                <span className="font-semibold">$189.97</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Items in Cart:</span>
                                                <span className="font-semibold">3 items</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Cart Expires:</span>
                                                <span className="font-semibold">In 24 hours</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Common Issues */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Common Payment Issues</h2>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {commonIssues.map((issue, index) => (
                                        <div key={index} className="flex items-start p-4 border border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50 transition-colors">
                                            <div className="flex-shrink-0 text-red-600 mt-0.5">
                                                {issue.icon}
                                            </div>
                                            <div className="ml-3">
                                                <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Security Assurance */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                            <div className="flex">
                                <Shield className="h-8 w-8 text-blue-600 flex-shrink-0" />
                                <div className="ml-4">
                                    <h3 className="font-bold text-gray-900 text-lg">Your Security is Our Priority</h3>
                                    <p className="text-gray-700 mt-2">
                                        We use bank-level encryption and never store your full card details.
                                        All transactions are processed through PCI-DSS compliant payment gateways.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions & Help */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
                                <h3 className="font-bold text-gray-900">Next Steps</h3>
                            </div>

                            <div className="p-6 space-y-4">
                                <button
                                    onClick={handleRetryPayment}
                                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                                >
                                    <RefreshCw className="h-5 w-5 mr-2" />
                                    Try Payment Again
                                </button>

                                <button
                                    onClick={handleBackToHome}
                                    className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                                >
                                    <Home className="h-5 w-5 mr-2" />
                                    Return to Homepage
                                </button>

                                <button
                                    onClick={() => window.location.href = '/cart'}
                                    className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                >
                                    View Cart
                                </button>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                                <h3 className="font-bold text-gray-900">Need Help?</h3>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="ml-3">
                                            <h4 className="font-semibold text-gray-900">Call Us</h4>
                                            <a href="tel:+8801234567890" className="text-blue-600 hover:text-blue-800 block">
                                                +880 1234 567890
                                            </a>
                                            <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9AM-6PM</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="ml-3">
                                            <h4 className="font-semibold text-gray-900">Email Support</h4>
                                            <a href="mailto:support@ziina.com" className="text-blue-600 hover:text-blue-800 block">
                                                support@ziina.com
                                            </a>
                                            <p className="text-sm text-gray-500 mt-1">24/7 email support</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleContactSupport}
                                        className="w-full mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        Contact Support Team
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Preview */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h4 className="font-bold text-gray-900 mb-3">Frequently Asked</h4>
                            <div className="space-y-3">
                                <div>
                                    <h5 className="font-medium text-gray-900">Will I be charged?</h5>
                                    <p className="text-sm text-gray-600">No charges were made to your account.</p>
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900">How long is my cart saved?</h5>
                                    <p className="text-sm text-gray-600">Your items will be saved for 24 hours.</p>
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900">Can I use a different payment method?</h5>
                                    <p className="text-sm text-gray-600">Yes, you can choose another payment option.</p>
                                </div>
                            </div>
                            <a href="/faq" className="inline-block mt-4 text-blue-600 font-medium text-sm hover:text-blue-800">
                                View all FAQs →
                            </a>
                        </div>

                        {/* Redirect Notice */}
                        <div className="text-center text-sm text-gray-500 bg-white p-4 rounded-xl border">
                            <p>Returning to homepage in <span className="font-bold text-red-600">{redirectCountdown}</span> seconds</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelled;