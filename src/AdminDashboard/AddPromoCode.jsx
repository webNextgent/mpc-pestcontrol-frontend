/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Tag, Calendar, X, Sparkles, Percent, Trash2, Copy, Clock } from 'lucide-react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AddPromoCode = () => {
    const [expiryDate, setExpiryDate] = useState('');
    const [discount, setDiscount] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    // Fetch promo codes
    const { data: promoCodes = [], isLoading } = useQuery({
        queryKey: ["promo-codes"],
        queryFn: async () => {
            const response = await axiosSecure.get("/promo-code");
            if (!response?.data?.Data) return [];
            
            return response.data.Data.map(promo => ({
                ...promo,
                expiryDate: promo.expiryDate 
                    ? new Date(promo.expiryDate).toISOString().split("T")[0] 
                    : null,
                createdAt: promo.createdAt 
                    ? new Date(promo.createdAt).toISOString() 
                    : new Date().toISOString()
            }));
        }
    });

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!promoCode.trim()) {
            setError('Please enter a promo code');
            return;
        }

        if (!discount || isNaN(discount) || parseFloat(discount) <= 0 || parseFloat(discount) > 100) {
            setError('Please enter a valid discount percentage (1-100)');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const promoData = {
            code: promoCode.trim().toUpperCase(),
            expiryDate: expiryDate || null,
            discount: parseFloat(discount)
        };

        try {
            const resPromo = await axiosSecure.post(`/promo-code/create`, promoData);

            if (resPromo?.data?.success) {
                // Clear form
                setPromoCode("");
                setExpiryDate("");
                setDiscount("");
                
                // Invalidate cache to refetch
                await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
                
                toast.success("Promo code added successfully!");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add promo code');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (promo) => {
        Swal.fire({
            title: "Delete Promo Code?",
            text: `Are you sure you want to delete "${promo.code}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const resPromo = await axiosSecure.delete(`/promo-code/delete/${promo.id}`);
                    if (resPromo?.data?.success) {
                        await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
                        toast.success("Promo code deleted");
                    }
                } catch (err) {
                    toast.error('Something went wrong');
                }
            }
        });
    };

    // Handle copy code
    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Copied to clipboard!');
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'No expiry';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    // Check if expired
    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        try {
            const expiry = new Date(expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return expiry < today;
        } catch {
            return false;
        }
    };

    // Get status badge
    const getStatusBadge = (expiryDate) => {
        if (!expiryDate) {
            return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">Active</span>;
        }
        
        if (isExpired(expiryDate)) {
            return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full border border-red-200">Expired</span>;
        }

        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 7) {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full border border-yellow-200">Expiring Soon</span>;
        }

        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">Active</span>;
    };

    // Prevent scroll on number input
    const preventScroll = (e) => {
        e.target.blur();
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header - Center Aligned */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg mb-3">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Promotions</span>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Promo Code Manager</h1>
                <p className="text-gray-600">Create and manage percentage-based discount codes</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Add Promo Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5">Add New Promo Code</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Promo Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Promo Code
                            </label>
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                                    setPromoCode(value);
                                    setError('');
                                }}
                                placeholder="SUMMER25"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                maxLength={20}
                                required
                            />
                        </div>

                        {/* Discount Percentage - Professional Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount Percentage (%)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                        setDiscount(value);
                                        setError('');
                                    }}
                                    onWheel={preventScroll}
                                    onKeyDown={(e) => {
                                        // Prevent 'e', 'E', '+', '-', '.' from being entered
                                        if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder="25"
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    required
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <span className="text-gray-500 font-medium">%</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Enter percentage (1-100)</p>
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <X className="w-4 h-4 text-red-500" />
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !promoCode.trim() || !discount}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Promo Code'}
                        </button>
                    </form>
                </div>

                {/* Right: Promo Codes List */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">All Promo Codes</h2>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            {promoCodes.length} total
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                            <p className="text-gray-600">Loading...</p>
                        </div>
                    ) : promoCodes.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-700 mb-1">No promo codes</h3>
                            <p className="text-gray-500 text-sm">Create your first promo code to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {promoCodes.map((promo) => (
                                <div
                                    key={promo.id}
                                    className={`p-4 rounded-lg border ${isExpired(promo.expiryDate) ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono font-semibold text-gray-900">
                                                    {promo.code}
                                                </span>
                                                {getStatusBadge(promo.expiryDate)}
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <Percent className="w-3.5 h-3.5 text-blue-600" />
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {promo.discount}% OFF
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                                        <span className="text-sm text-gray-600">
                                                            {promo.expiryDate ? formatDate(promo.expiryDate) : 'No expiry'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                                                    <span className="text-sm text-gray-500">
                                                        Created: {formatDate(promo.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopyCode(promo.code)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Copy code"
                                            >
                                                <Copy className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddPromoCode;