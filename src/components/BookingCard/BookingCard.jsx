/* eslint-disable no-unused-vars */
import { FaArrowRight } from "react-icons/fa";
import dirhum from "../../assets/icon/dirhum.png";
import { useNavigate } from "react-router-dom";

const statusColors = {
    Requested: "bg-purple-500",
    Pending: "bg-yellow-500",
    Delivered: "bg-green-600",
    Cancelled: "bg-red-500",
};

const paymentStatusColors = {
    paid: "bg-green-100 text-green-800 border border-green-300",
    unpaid: "bg-red-100 text-red-800 border border-red-300",
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    failed: "bg-gray-100 text-gray-800 border border-gray-300",
    refunded: "bg-blue-100 text-blue-800 border border-blue-300",
};

// Group bookingItems by serviceType.title → { "Ants": ["2 Bedroom Villa", ...], ... }
const getGroupedServices = (booking) => {
    if (booking.bookingItems && booking.bookingItems.length > 0) {
        const grouped = {};
        booking.bookingItems.forEach(item => {
            const propertyItem = item.propertyItem;
            if (!propertyItem) return;
            const serviceTypeTitle = propertyItem.propertyType?.serviceType?.title || 'Other';
            const itemTitle = propertyItem.title || '';
            if (!grouped[serviceTypeTitle]) grouped[serviceTypeTitle] = [];
            if (itemTitle) grouped[serviceTypeTitle].push(itemTitle);
        });
        return grouped;
    }
    // fallback: propertyItems array
    if (booking.propertyItems && booking.propertyItems.length > 0) {
        const grouped = {};
        booking.propertyItems.forEach(item => {
            const serviceTypeTitle = item.propertyType?.serviceType?.title || 'Other';
            const itemTitle = item.title || '';
            if (!grouped[serviceTypeTitle]) grouped[serviceTypeTitle] = [];
            if (itemTitle) grouped[serviceTypeTitle].push(itemTitle);
        });
        return grouped;
    }
    return null;
};

const BookingCard = ({ item }) => {
    const { status, date, time, totalPay, paymentStatus } = item;
    const navigate = useNavigate();

    const handleManageBooking = () => {
        navigate(`/booking-details/${item.id || item._id}`);
    };

    const grouped = getGroupedServices(item);

    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    }) : 'Date not set';

    const formattedTime          = time || 'Time not set';
    const formattedPaymentStatus = paymentStatus?.toLowerCase() || 'unknown';
    const paymentStatusText      = paymentStatus || 'Unknown';

    return (
        <div className="w-full max-w-xl border border-[#01788E] rounded p-4 sm:p-5 shadow-md hover:shadow-lg transition cursor-pointer">

            {/* Header */}
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">

                    {/* Grouped services: • Ants — 2 Bedroom Villa _ 3 Bedroom Villa */}
                    {grouped && Object.keys(grouped).length > 0 ? (
                        <div className="space-y-0.5">
                            {Object.entries(grouped).map(([serviceType, titles]) => (
                                <p key={serviceType} className="text-sm sm:text-[15px] font-semibold text-gray-900 leading-snug">
                                    <span className="text-[#01788E]">•</span>{" "}
                                    {serviceType}
                                    {titles.length > 0 && (
                                        <span className="font-normal text-gray-500">
                                            {" — "}{titles.join(" _ ")}
                                        </span>
                                    )}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <h2 className="text-sm sm:text-[18px] font-semibold text-gray-900 leading-snug">
                            {item.serviceName || 'N/A'}
                        </h2>
                    )}

                    <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
                        {formattedDate} • {formattedTime}
                    </p>
                </div>

                {/* Booking Status Badge */}
                <span className={`text-[11px] px-2.5 py-1 rounded-full text-white font-medium whitespace-nowrap shrink-0 ${statusColors[status] || "bg-gray-500"}`}>
                    {status || 'Unknown'}
                </span>
            </div>

            {/* Divider */}
            <div className="w-full border-b my-3 sm:my-4" />

            {/* Bottom */}
            <div className="flex justify-between items-center gap-2">

                {/* Price + Payment Status */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                        <img src={dirhum} className="h-4 w-4 sm:h-5 sm:w-5" alt="currency" />
                        <p className="text-base sm:text-[20px] font-bold text-gray-700">
                            {totalPay?.toLocaleString?.() || totalPay || '0'}
                        </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${paymentStatusColors[formattedPaymentStatus] || "bg-gray-100 text-gray-800"}`}>
                        {paymentStatusText}
                    </span>
                </div>

                {/* Manage Button */}
                <button
                    onClick={handleManageBooking}
                    className="flex items-center gap-1.5 text-xs sm:text-[14px] font-semibold text-[#01788E] border border-[#01788E] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#F3FAFB] transition shrink-0"
                >
                    Manage
                    <FaArrowRight className="text-[10px] sm:text-[12px]" />
                </button>
            </div>
        </div>
    );
};

export default BookingCard;





// main component code 
// /* eslint-disable no-unused-vars */
// import { FaArrowRight } from "react-icons/fa";
// import dirhum from "../../assets/icon/dirhum.png";
// import { useNavigate } from "react-router-dom";

// const statusColors = {
//     Requested: "bg-purple-500",
//     Pending: "bg-yellow-500",
//     Delivered: "bg-green-600",
//     Cancelled: "bg-red-500",
// };

// const paymentStatusColors = {
//     paid: "bg-green-100 text-green-800 border border-green-300",
//     unpaid: "bg-red-100 text-red-800 border border-red-300",
//     pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
//     failed: "bg-gray-100 text-gray-800 border border-gray-300",
//     refunded: "bg-blue-100 text-blue-800 border border-blue-300",
// };

// const getServiceDisplay = (booking) => {
//     if (booking.bookingItems && booking.bookingItems.length > 0) {
//         return booking.bookingItems.map(item => {
//             const propertyItem = item.propertyItem;
//             if (propertyItem) {
//                 const itemTitle = propertyItem.title || '';
//                 const serviceTypeTitle = propertyItem.propertyType?.serviceType?.title || '';

//                 if (itemTitle && serviceTypeTitle) {
//                     return `${itemTitle} - ${serviceTypeTitle}`;
//                 } else if (itemTitle) {
//                     return itemTitle;
//                 } else if (serviceTypeTitle) {
//                     return serviceTypeTitle;
//                 }
//             }
//             return '';
//         }).filter(Boolean).join(', ');
//     }

//     if (booking.propertyItems && booking.propertyItems.length > 0) {
//         return booking.propertyItems.map(item => {
//             const itemTitle = item.title || '';
//             const serviceTypeTitle = item.propertyType?.serviceType?.title || '';

//             if (itemTitle && serviceTypeTitle) {
//                 return `${itemTitle} - ${serviceTypeTitle}`;
//             } else if (itemTitle) {
//                 return itemTitle;
//             } else if (serviceTypeTitle) {
//                 return serviceTypeTitle;
//             }
//             return '';
//         }).filter(Boolean).join(', ');
//     }
//     return booking.serviceName || 'N/A';
// };

// const BookingCard = ({ item }) => {
//     console.log(item);
//     const { status, date, time, totalPay, paymentStatus, propertyItems = [] } = item;
//     const navigate = useNavigate();

//     const handleManageBooking = () => {
//         navigate(`/booking-details/${item.id || item._id}`);
//     };

//     const displayService = getServiceDisplay(item);
    
//     // Format date if it exists
//     const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     }) : 'Date not set';

//     // Format time if it exists
//     const formattedTime = time || 'Time not set';

//     // Format payment status for display
//     const formattedPaymentStatus = paymentStatus?.toLowerCase() || 'unknown';
//     const paymentStatusText = paymentStatus || 'Unknown';

//     return (
//         <div className="w-full max-w-xl border border-[#01788E] rounded p-5 shadow-md hover:shadow-lg transition cursor-pointer">
//             {/* Header */}
//             <div className="flex justify-between items-start">
//                 <div>
//                     <h2 className="text-[20px] font-semibold text-gray-900">
//                         {displayService}
//                     </h2>

//                     <p className="text-[14px] text-gray-500 mt-1">
//                         {formattedDate} • {formattedTime}
//                     </p>
//                 </div>

//                 {/* Status Badge - Booking Status */}
//                 <span
//                     className={`text-[12px] px-3 py-1 rounded-full text-white font-medium ${statusColors[status] || "bg-gray-500"}`}
//                 >
//                     {status || 'Unknown'}
//                 </span>
//             </div>

//             {/* Line */}
//             <div className="w-full border-b my-4"></div>

//             {/* Bottom */}
//             <div className="flex justify-between items-center">
//                 {/* Total Price with Payment Status */}
//                 <div className="flex items-center gap-3">
//                     <div className="flex items-center gap-1">
//                         <img src={dirhum} className="h-5 w-5" alt="currency" />
//                         <p className="text-[20px] font-bold text-gray-700">
//                             {totalPay?.toLocaleString?.() || totalPay || '0'}
//                         </p>
//                     </div>
                    
//                     {/* Payment Status Badge - Small & Short */}
//                     <span
//                         className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${paymentStatusColors[formattedPaymentStatus] || "bg-gray-100 text-gray-800"}`}
//                     >
//                         {paymentStatusText}
//                     </span>
//                 </div>

//                 {/* Manage Button */}
//                 <button
//                     onClick={handleManageBooking}
//                     className="flex items-center gap-2 text-[14px] font-semibold text-[#01788E] border border-[#01788E] px-4 py-2 rounded-lg hover:bg-[#F3FAFB] transition"
//                 >
//                     Manage
//                     <FaArrowRight className="text-[12px]" />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default BookingCard;