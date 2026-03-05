import { useState } from 'react';
import { Tag, Calendar, X, Sparkles, Percent, Trash2, Copy, Clock, Check } from 'lucide-react';
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
    const [copiedId, setCopiedId] = useState(null);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const { data: promoCodes = [], isLoading } = useQuery({
        queryKey: ["promo-codes"],
        queryFn: async () => {
            const response = await axiosSecure.get("/promo-code");
            if (!response?.data?.Data) return [];
            return response.data.Data.map(promo => ({
                ...promo,
                expiryDate: promo.expiryDate
                    ? promo.expiryDate.split("T")[0]
                    : null,
                createdAt: promo.createdAt || new Date().toISOString()
            }));
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!promoCode.trim()) return setError('Please enter a promo code');

        const discountVal = parseFloat(discount);
        if (isNaN(discountVal) || discountVal <= 0 || discountVal > 100) {
            return setError('Please enter a valid discount percentage (1–100)');
        }

        setIsSubmitting(true);
        setError('');

        const promoData = {
            code: promoCode.trim().toUpperCase(),
            expiryDate: expiryDate.trim() !== '' ? expiryDate : null,
            discount: discountVal
        };

        try {
            const res = await axiosSecure.post(`/promo-code/create`, promoData);
            if (res?.data?.success) {
                setPromoCode('');
                setExpiryDate('');
                setDiscount('');
                await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
                toast.success("Promo code added successfully!");
            } else {
                setError(res?.data?.message || 'Failed to add promo code');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add promo code');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (promo) => {
        Swal.fire({
            title: "Delete Promo Code?",
            text: `Are you sure you want to delete "${promo.code}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await axiosSecure.delete(`/promo-code/delete/${promo.id}`);
                if (res?.data?.success) {
                    await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
                    toast.success("Promo code deleted");
                } else {
                    toast.error(res?.data?.message || 'Failed to delete');
                }
            } catch {
                toast.error('Something went wrong');
            }
        });
    };

    const handleCopyCode = (promo) => {
        navigator.clipboard.writeText(promo.code).then(() => {
            setCopiedId(promo.id);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No expiry';
        try {
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return 'Invalid date'; }
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        try {
            const expiry = new Date(expiryDate + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return expiry < today;
        } catch { return false; }
    };

    const getDaysLeft = (expiryDate) => {
        if (!expiryDate) return null;
        const expiry = new Date(expiryDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    };

    const getStatusBadge = (expiryDate) => {
        if (!expiryDate) return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Active
            </span>
        );
        if (isExpired(expiryDate)) return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-[11px] font-semibold rounded-full border border-red-200">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Expired
            </span>
        );
        const days = getDaysLeft(expiryDate);
        if (days <= 7) return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> {days}d left
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Active
            </span>
        );
    };

    const activeCount = promoCodes.filter(p => !isExpired(p.expiryDate)).length;
    const expiredCount = promoCodes.filter(p => isExpired(p.expiryDate)).length;

    return (
        <div className="min-h-screen bg-gray-50/60 p-3 sm:p-5 md:p-6">
            <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-2">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Promotions</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">Promo Code Manager</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Create and manage percentage-based discount codes</p>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-center min-w-[72px]">
                            <p className="text-lg font-bold text-gray-900">{promoCodes.length}</p>
                            <p className="text-[10px] text-gray-500 font-medium">Total</p>
                        </div>
                        <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm text-center min-w-[72px]">
                            <p className="text-lg font-bold text-emerald-700">{activeCount}</p>
                            <p className="text-[10px] text-emerald-600 font-medium">Active</p>
                        </div>
                        <div className="px-3 py-2 bg-red-50 rounded-xl border border-red-100 shadow-sm text-center min-w-[72px]">
                            <p className="text-lg font-bold text-red-600">{expiredCount}</p>
                            <p className="text-[10px] text-red-500 font-medium">Expired</p>
                        </div>
                    </div>
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Left — Add Form (2/5) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <Tag className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h2 className="text-base font-semibold text-gray-900">Add New Code</h2>
                                </div>
                            </div>

                            <div className="p-4 sm:p-5">
                                <form onSubmit={handleSubmit} className="space-y-4">

                                    {/* Promo Code */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            Promo Code
                                        </label>
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => {
                                                setPromoCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
                                                setError('');
                                            }}
                                            placeholder="e.g. SUMMER25"
                                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono font-semibold text-sm tracking-widest placeholder:font-normal placeholder:tracking-normal"
                                            maxLength={20}
                                        />
                                    </div>

                                    {/* Discount */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            Discount (%)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={discount}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') return setDiscount('');
                                                    const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
                                                    setDiscount(num);
                                                    setError('');
                                                }}
                                                onWheel={(e) => e.target.blur()}
                                                onKeyDown={(e) => {
                                                    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                                                }}
                                                placeholder="25"
                                                min="1"
                                                max="100"
                                                step="1"
                                                className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                                <Percent className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-400">Enter a value between 1 and 100</p>
                                    </div>

                                    {/* Expiry Date */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            Expiry Date <span className="text-gray-400 normal-case font-normal">(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400">Leave empty for no expiry</p>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-red-700 text-xs leading-relaxed">{error}</p>
                                        </div>
                                    )}

                                    {/* Preview Badge */}
                                    {promoCode && discount && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                            <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                                                <Tag className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs text-blue-600 font-medium">Preview</p>
                                                <p className="text-sm font-bold text-blue-800 font-mono tracking-wider truncate">
                                                    {promoCode} — {discount}% OFF
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !promoCode.trim() || !discount}
                                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Adding...
                                            </span>
                                        ) : 'Add Promo Code'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right — List (3/5) */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-gray-100 rounded-lg">
                                        <Sparkles className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h2 className="text-base font-semibold text-gray-900">All Promo Codes</h2>
                                </div>
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                                    {promoCodes.length} total
                                </span>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                                        <p className="text-sm text-gray-500">Loading codes...</p>
                                    </div>
                                ) : promoCodes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                            <Tag className="w-7 h-7 text-gray-400" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-700 mb-1">No promo codes yet</h3>
                                        <p className="text-sm text-gray-400 max-w-xs">Create your first promo code using the form on the left</p>
                                    </div>
                                ) : (
                                    <div className="overflow-y-auto max-h-[520px] divide-y divide-gray-100">
                                        {promoCodes.map((promo) => {
                                            const expired = isExpired(promo.expiryDate);
                                            const isCopied = copiedId === promo.id;
                                            return (
                                                <div
                                                    key={promo.id}
                                                    className={`px-4 sm:px-5 py-4 transition-colors ${expired ? 'bg-gray-50/70' : 'bg-white hover:bg-gray-50/50'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        {/* Left info */}
                                                        <div className="flex items-start gap-3 min-w-0">
                                                            {/* Discount badge */}
                                                            <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${expired ? 'bg-gray-100' : 'bg-blue-50 border border-blue-100'}`}>
                                                                <span className={`text-base font-black leading-none ${expired ? 'text-gray-400' : 'text-blue-600'}`}>{promo.discount}</span>
                                                                <span className={`text-[9px] font-bold uppercase tracking-wide ${expired ? 'text-gray-400' : 'text-blue-500'}`}>% off</span>
                                                            </div>

                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                    <span className={`font-mono font-bold text-sm tracking-wider ${expired ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                                        {promo.code}
                                                                    </span>
                                                                    {getStatusBadge(promo.expiryDate)}
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                                                                        <span className="text-xs text-gray-500">
                                                                            {promo.expiryDate ? formatDate(promo.expiryDate) : 'No expiry'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                                                        <span className="text-xs text-gray-400">
                                                                            {formatDate(promo.createdAt)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action buttons */}
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                onClick={() => handleCopyCode(promo)}
                                                                className={`p-2 rounded-lg transition-all ${isCopied ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-100 text-gray-500'}`}
                                                                title="Copy code"
                                                            >
                                                                {isCopied
                                                                    ? <Check className="w-4 h-4" />
                                                                    : <Copy className="w-4 h-4" />
                                                                }
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(promo)}
                                                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPromoCode;





// main component code 
// /* eslint-disable no-unused-vars */
// import { useState } from 'react';
// import { Tag, Calendar, X, Sparkles, Percent, Trash2, Copy, Clock } from 'lucide-react';
// import useAxiosSecure from '../hooks/useAxiosSecure';
// import Swal from 'sweetalert2';
// import toast from 'react-hot-toast';
// import { useQuery, useQueryClient } from '@tanstack/react-query';

// const AddPromoCode = () => {
//     const [expiryDate, setExpiryDate] = useState('');
//     const [discount, setDiscount] = useState('');
//     const [promoCode, setPromoCode] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [error, setError] = useState('');
    
//     const axiosSecure = useAxiosSecure();
//     const queryClient = useQueryClient();

//     // Fetch promo codes
//     const { data: promoCodes = [], isLoading } = useQuery({
//         queryKey: ["promo-codes"],
//         queryFn: async () => {
//             const response = await axiosSecure.get("/promo-code");
//             if (!response?.data?.Data) return [];
            
//             return response.data.Data.map(promo => ({
//                 ...promo,
//                 expiryDate: promo.expiryDate 
//                     ? new Date(promo.expiryDate).toISOString().split("T")[0] 
//                     : null,
//                 createdAt: promo.createdAt 
//                     ? new Date(promo.createdAt).toISOString() 
//                     : new Date().toISOString()
//             }));
//         }
//     });

//     // Handle form submit
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // Validation
//         if (!promoCode.trim()) {
//             setError('Please enter a promo code');
//             return;
//         }

//         if (!discount || isNaN(discount) || parseFloat(discount) <= 0 || parseFloat(discount) > 100) {
//             setError('Please enter a valid discount percentage (1-100)');
//             return;
//         }

//         setIsSubmitting(true);
//         setError('');

//         const promoData = {
//             code: promoCode.trim().toUpperCase(),
//             expiryDate: expiryDate || null,
//             discount: parseFloat(discount)
//         };

//         try {
//             const resPromo = await axiosSecure.post(`/promo-code/create`, promoData);

//             if (resPromo?.data?.success) {
//                 // Clear form
//                 setPromoCode("");
//                 setExpiryDate("");
//                 setDiscount("");
                
//                 // Invalidate cache to refetch
//                 await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
                
//                 toast.success("Promo code added successfully!");
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to add promo code');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Handle delete
//     const handleDelete = async (promo) => {
//         Swal.fire({
//             title: "Delete Promo Code?",
//             text: `Are you sure you want to delete "${promo.code}"?`,
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#d33",
//             cancelButtonColor: "#3085d6",
//             confirmButtonText: "Yes, delete it!"
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 try {
//                     const resPromo = await axiosSecure.delete(`/promo-code/delete/${promo.id}`);
//                     if (resPromo?.data?.success) {
//                         await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
//                         toast.success("Promo code deleted");
//                     }
//                 } catch (err) {
//                     toast.error('Something went wrong');
//                 }
//             }
//         });
//     };

//     // Handle copy code
//     const handleCopyCode = (code) => {
//         navigator.clipboard.writeText(code);
//         toast.success('Copied to clipboard!');
//     };

//     // Format date
//     const formatDate = (dateString) => {
//         if (!dateString) return 'No expiry';
//         try {
//             const date = new Date(dateString);
//             return date.toLocaleDateString('en-US', {
//                 day: 'numeric',
//                 month: 'short',
//                 year: 'numeric'
//             });
//         } catch {
//             return 'Invalid date';
//         }
//     };

//     // Check if expired
//     const isExpired = (expiryDate) => {
//         if (!expiryDate) return false;
//         try {
//             const expiry = new Date(expiryDate);
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);
//             return expiry < today;
//         } catch {
//             return false;
//         }
//     };

//     // Get status badge
//     const getStatusBadge = (expiryDate) => {
//         if (!expiryDate) {
//             return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">Active</span>;
//         }
        
//         if (isExpired(expiryDate)) {
//             return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full border border-red-200">Expired</span>;
//         }

//         const expiry = new Date(expiryDate);
//         const today = new Date();
//         const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

//         if (daysLeft <= 7) {
//             return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full border border-yellow-200">Expiring Soon</span>;
//         }

//         return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">Active</span>;
//     };

//     // Prevent scroll on number input
//     const preventScroll = (e) => {
//         e.target.blur();
//     };

//     return (
//         <div className="max-w-6xl mx-auto p-6">
//             {/* Header - Center Aligned */}
//             <div className="text-center mb-8">
//                 <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg mb-3">
//                     <Sparkles className="w-4 h-4 text-blue-600" />
//                     <span className="text-sm font-medium text-blue-700">Promotions</span>
//                 </div>
//                 <h1 className="text-2xl font-semibold text-gray-900 mb-2">Promo Code Manager</h1>
//                 <p className="text-gray-600">Create and manage percentage-based discount codes</p>
//             </div>

//             <div className="grid lg:grid-cols-2 gap-8">
//                 {/* Left: Add Promo Form */}
//                 <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//                     <h2 className="text-lg font-semibold text-gray-900 mb-5">Add New Promo Code</h2>
                    
//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         {/* Promo Code */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Promo Code
//                             </label>
//                             <input
//                                 type="text"
//                                 value={promoCode}
//                                 onChange={(e) => {
//                                     const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
//                                     setPromoCode(value);
//                                     setError('');
//                                 }}
//                                 placeholder="SUMMER25"
//                                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
//                                 maxLength={20}
//                                 required
//                             />
//                         </div>

//                         {/* Discount Percentage - Professional Input */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Discount Percentage (%)
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type="number"
//                                     value={discount}
//                                     onChange={(e) => {
//                                         const value = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
//                                         setDiscount(value);
//                                         setError('');
//                                     }}
//                                     onWheel={preventScroll}
//                                     onKeyDown={(e) => {
//                                         // Prevent 'e', 'E', '+', '-', '.' from being entered
//                                         if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
//                                             e.preventDefault();
//                                         }
//                                     }}
//                                     placeholder="25"
//                                     min="0"
//                                     max="100"
//                                     step="1"
//                                     className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                                     required
//                                 />
//                                 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
//                                     <span className="text-gray-500 font-medium">%</span>
//                                 </div>
//                             </div>
//                             <p className="text-xs text-gray-500 mt-1">Enter percentage (1-100)</p>
//                         </div>

//                         {/* Expiry Date */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Expiry Date (Optional)
//                             </label>
//                             <input
//                                 type="date"
//                                 value={expiryDate}
//                                 onChange={(e) => setExpiryDate(e.target.value)}
//                                 min={new Date().toISOString().split('T')[0]}
//                                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
//                             />
//                             <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
//                         </div>

//                         {/* Error Message */}
//                         {error && (
//                             <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                                 <div className="flex items-center gap-2">
//                                     <X className="w-4 h-4 text-red-500" />
//                                     <p className="text-red-700 text-sm">{error}</p>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Submit Button */}
//                         <button
//                             type="submit"
//                             disabled={isSubmitting || !promoCode.trim() || !discount}
//                             className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                         >
//                             {isSubmitting ? 'Adding...' : 'Add Promo Code'}
//                         </button>
//                     </form>
//                 </div>

//                 {/* Right: Promo Codes List */}
//                 <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//                     <div className="flex items-center justify-between mb-5">
//                         <h2 className="text-lg font-semibold text-gray-900">All Promo Codes</h2>
//                         <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
//                             {promoCodes.length} total
//                         </span>
//                     </div>

//                     {isLoading ? (
//                         <div className="text-center py-12">
//                             <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
//                             <p className="text-gray-600">Loading...</p>
//                         </div>
//                     ) : promoCodes.length === 0 ? (
//                         <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//                             <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                             <h3 className="text-lg font-medium text-gray-700 mb-1">No promo codes</h3>
//                             <p className="text-gray-500 text-sm">Create your first promo code to get started</p>
//                         </div>
//                     ) : (
//                         <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
//                             {promoCodes.map((promo) => (
//                                 <div
//                                     key={promo.id}
//                                     className={`p-4 rounded-lg border ${isExpired(promo.expiryDate) ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
//                                 >
//                                     <div className="flex items-start justify-between">
//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-3 mb-2">
//                                                 <span className="font-mono font-semibold text-gray-900">
//                                                     {promo.code}
//                                                 </span>
//                                                 {getStatusBadge(promo.expiryDate)}
//                                             </div>
                                            
//                                             <div className="space-y-1">
//                                                 <div className="flex items-center gap-4">
//                                                     <div className="flex items-center gap-1">
//                                                         <Percent className="w-3.5 h-3.5 text-blue-600" />
//                                                         <span className="text-sm font-medium text-blue-600">
//                                                             {promo.discount}% OFF
//                                                         </span>
//                                                     </div>
//                                                     <div className="flex items-center gap-1">
//                                                         <Calendar className="w-3.5 h-3.5 text-gray-500" />
//                                                         <span className="text-sm text-gray-600">
//                                                             {promo.expiryDate ? formatDate(promo.expiryDate) : 'No expiry'}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex items-center gap-1">
//                                                     <Clock className="w-3.5 h-3.5 text-gray-500" />
//                                                     <span className="text-sm text-gray-500">
//                                                         Created: {formatDate(promo.createdAt)}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="flex items-center gap-1">
//                                             <button
//                                                 onClick={() => handleCopyCode(promo.code)}
//                                                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                                                 title="Copy code"
//                                             >
//                                                 <Copy className="w-4 h-4 text-gray-600" />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleDelete(promo)}
//                                                 className="p-2 hover:bg-red-50 rounded-lg transition-colors"
//                                                 title="Delete"
//                                             >
//                                                 <Trash2 className="w-4 h-4 text-red-500" />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddPromoCode;