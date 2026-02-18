import { FaArrowRight } from "react-icons/fa";
import dirhum from "../../assets/icon/dirhum.png";
import { useNavigate } from "react-router-dom";

const statusColors = {
    Requested: "bg-purple-500",
    Upcoming: "bg-blue-500",
    Pending: "bg-yellow-500",
    Delivered: "bg-green-600",
    Cancelled: "bg-red-500",
    Completed: "bg-green-600",
    Rejected: "bg-red-500"
};

// Helper to display service name as "propertyItem.title - propertyType.title"
const getServiceDisplay = (booking) => {
    // First try using bookingItems (new structure)
    if (booking.bookingItems && booking.bookingItems.length > 0) {
        return booking.bookingItems.map(item => {
            const propertyItem = item.propertyItem;
            if (propertyItem) {
                const itemTitle = propertyItem.title || '';
                const typeTitle = propertyItem.propertyType?.title || '';
                if (itemTitle && typeTitle) {
                    return `${itemTitle} - ${typeTitle}`;
                } else if (itemTitle) {
                    return itemTitle;
                } else if (typeTitle) {
                    return typeTitle;
                }
            }
            return '';
        }).filter(Boolean).join(', ');
    }
    // Fallback to old propertyItems
    if (booking.propertyItems && booking.propertyItems.length > 0) {
        return booking.propertyItems.map(item => {
            const itemTitle = item.title || '';
            const typeTitle = item.propertyType?.title || '';
            if (itemTitle && typeTitle) {
                return `${itemTitle} - ${typeTitle}`;
            } else if (itemTitle) {
                return itemTitle;
            } else if (typeTitle) {
                return typeTitle;
            }
            return '';
        }).filter(Boolean).join(', ');
    }
    return booking.serviceName || 'N/A';
};

const BookingCard = ({ item }) => {
    const { status, date, time, totalPay, propertyItems = [] } = item;
    const navigate = useNavigate();
    
    const handleManageBooking = () => {
        navigate(`/booking-details/${item.id || item._id}`);
    };

    const displayService = getServiceDisplay(item);

    // Format date if it exists
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : 'Date not set';

    // Format time if it exists
    const formattedTime = time || 'Time not set';

    return (
        <div className="w-full max-w-xl border border-[#01788E] rounded-2xl p-5 shadow-md hover:shadow-lg transition cursor-pointer">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[20px] font-semibold text-gray-900">
                        {displayService}
                    </h2>

                    {/* Optional: still show individual item titles if needed */}
                    {propertyItems.length > 0 && (
                        <p className="text-[14px] text-gray-600 mt-1">
                            {propertyItems.map((p, index) => (
                                <span key={index}>
                                    {p.title}
                                    {index !== propertyItems.length - 1 && ", "}
                                </span>
                            ))}
                        </p>
                    )}

                    <p className="text-[14px] text-gray-500 mt-1">
                        {formattedDate} • {formattedTime}
                    </p>
                </div>

                {/* Status Badge */}
                <span
                    className={`text-[12px] px-3 py-1 rounded-full text-white font-medium ${statusColors[status] || "bg-gray-500"}`}
                >
                    {status || 'Unknown'}
                </span>
            </div>

            {/* Line */}
            <div className="w-full border-b my-4"></div>

            {/* Bottom */}
            <div className="flex justify-between items-center">
                {/* Total Price */}
                <div className="flex items-center gap-1">
                    <img src={dirhum} className="h-5 w-5" alt="currency" />
                    <p className="text-[20px] font-bold text-gray-700">
                        {totalPay?.toLocaleString?.() || totalPay || '0'}
                    </p>
                </div>

                {/* Manage Button */}
                <button
                    onClick={handleManageBooking}
                    className="flex items-center gap-2 text-[14px] font-semibold text-[#01788E] border border-[#01788E] px-4 py-2 rounded-lg hover:bg-[#F3FAFB] transition"
                >
                    Manage
                    <FaArrowRight className="text-[12px]" />
                </button>
            </div>
        </div>
    );
};

export default BookingCard;


// import { FaArrowRight } from "react-icons/fa";
// import dirhum from "../../assets/icon/dirhum.png";
// import { useNavigate } from "react-router-dom";

// const statusColors = {
//     Upcoming: "bg-blue-500",
//     Delivered: "bg-green-600",
//     Cancelled: "bg-red-500",
//     Pending: "bg-yellow-500"
// };

// const BookingCard = ({ item }) => {
//     const { serviceName, status, date, time, totalPay, propertyItems = [] } = item;
//     const navigate = useNavigate();

//     const handelManagebooking = item => {
//         // console.log(item.id);
//         navigate(`/booking-details/${item.id}`);
//     }

//     return (
//         <div className="w-full max-w-xl border-[#01788E] rounded-2xl p-5 shadow-md hover:shadow-lg transition cursor-pointer">

//             {/* Header */}
//             <div className="flex justify-between items-start">
//                 <div>
//                     <h2 className="text-[20px] font-semibold text-gray-900">
//                         {serviceName}
//                     </h2>

//                     {propertyItems.length > 0 && (
//                         <p className="text-[14px] text-gray-600 mt-1">
//                             {propertyItems.map((p, index) => (
//                                 <span key={index}>
//                                     {p.title}
//                                     {index !== propertyItems.length - 1 && ", "}
//                                 </span>
//                             ))}
//                         </p>
//                     )}

//                     <p className="text-[14px] text-gray-500 mt-1">
//                         {date} • {time}
//                     </p>
//                 </div>

//                 {/* Status Badge */}
//                 <span
//                     className={`text-[12px] px-3 py-1 rounded-full text-white font-medium ${statusColors[status] || "bg-gray-500"}`}
//                 >
//                     {status}
//                 </span>
//             </div>

//             {/* Line */}
//             <div className="w-full border-b my-4"></div>

//             {/* Bottom */}
//             <div className="flex justify-between items-center">

//                 {/* Total Price */}
//                 <div className="flex items-center gap-1">
//                     <img src={dirhum} className="h-5 w-5" alt="currency" />
//                     <p className="text-[20px] font-bold text-gray-700">{totalPay}</p>
//                 </div>

//                 {/* Manage Button */}
//                 <button
//                     onClick={() => handelManagebooking(item)}
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