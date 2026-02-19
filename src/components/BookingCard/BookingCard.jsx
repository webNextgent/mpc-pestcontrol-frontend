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

const getServiceDisplay = (booking) => {
    if (booking.bookingItems && booking.bookingItems.length > 0) {
        return booking.bookingItems.map(item => {
            const propertyItem = item.propertyItem;
            if (propertyItem) {
                const itemTitle = propertyItem.title || '';
                const serviceTypeTitle = propertyItem.propertyType?.serviceType?.title || '';

                if (itemTitle && serviceTypeTitle) {
                    return `${itemTitle} - ${serviceTypeTitle}`;
                } else if (itemTitle) {
                    return itemTitle;
                } else if (serviceTypeTitle) {
                    return serviceTypeTitle;
                }
            }
            return '';
        }).filter(Boolean).join(', ');
    }

    if (booking.propertyItems && booking.propertyItems.length > 0) {
        return booking.propertyItems.map(item => {
            const itemTitle = item.title || '';
            const serviceTypeTitle = item.propertyType?.serviceType?.title || '';

            if (itemTitle && serviceTypeTitle) {
                return `${itemTitle} - ${serviceTypeTitle}`;
            } else if (itemTitle) {
                return itemTitle;
            } else if (serviceTypeTitle) {
                return serviceTypeTitle;
            }
            return '';
        }).filter(Boolean).join(', ');
    }
    return booking.serviceName || 'N/A';
};

const BookingCard = ({ item }) => {
    const { status, date, time, totalPay, paymentStatus, propertyItems = [] } = item;
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

    // Format payment status for display
    const formattedPaymentStatus = paymentStatus?.toLowerCase() || 'unknown';
    const paymentStatusText = paymentStatus || 'Unknown';

    return (
        <div className="w-full max-w-xl border border-[#01788E] rounded-2xl p-5 shadow-md hover:shadow-lg transition cursor-pointer">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[20px] font-semibold text-gray-900">
                        {displayService}
                    </h2>

                    <p className="text-[14px] text-gray-500 mt-1">
                        {formattedDate} • {formattedTime}
                    </p>
                </div>

                {/* Status Badge - Booking Status */}
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
                {/* Total Price with Payment Status */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <img src={dirhum} className="h-5 w-5" alt="currency" />
                        <p className="text-[20px] font-bold text-gray-700">
                            {totalPay?.toLocaleString?.() || totalPay || '0'}
                        </p>
                    </div>
                    
                    {/* Payment Status Badge - Small & Short */}
                    <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${paymentStatusColors[formattedPaymentStatus] || "bg-gray-100 text-gray-800"}`}
                    >
                        {paymentStatusText}
                    </span>
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