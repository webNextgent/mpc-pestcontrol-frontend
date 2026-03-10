// import { useRef, useState } from "react";
// import NextBtn from "../../../components/NextBtn/NextBtn";
// import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
// import { IoBagRemoveSharp, IoLocation } from "react-icons/io5";
// import { FaCalendar } from "react-icons/fa";
// import { SiTicktick } from "react-icons/si";
// import { useSummary } from "../../../provider/SummaryProvider";
// import dirhum from "../../../assets/icon/dirhum.png";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import useAuth from "../../../hooks/useAuth";
// import useAxiosSecure from "../../../hooks/useAxiosSecure";

// export default function Confirmation() {
//     const [openModal, setOpenModal] = useState(false);
//     const {
//         services,
//         date,
//         time,
//         mapLongitude,
//         mapLatitude,
//         liveAddress,
//         itemSummary,
//         useDiscount,
//         servicePrice,
//         serviceCharge,
//         subTotal,
//         vat,
//         promoStatus,
//         totalToPay,
//         discountAmount,
//         discountedSubTotal,
//         vatAfterDiscount,
//         totalAfterDiscount,
//         showInput,
//         setShowInput,
//         handleApply,
//     } = useSummary();

//     const axiosSecure = useAxiosSecure();
//     const promoInputRef = useRef(null);
//     const [paymentMethod, setPaymentMethod] = useState("");
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();
//     const { user } = useAuth();

//     // ─── COD charge: শুধু display ও payload এর জন্য ───
//     // Provider এ COD নেই, তাই এখানেই handle করা হচ্ছে
//     const COD_CHARGE = 5;
//     const isCash = paymentMethod === "Cash";

//     // COD selected হলে subTotal এ +5 যোগ করে নতুন করে VAT ও total বের করা হচ্ছে
//     const codSubTotal = isCash ? subTotal + COD_CHARGE : subTotal;
//     const codDiscountAmount = useDiscount > 0 ? (codSubTotal * useDiscount) / 100 : 0;
//     const codDiscountedSubTotal = codSubTotal - codDiscountAmount;
//     const codVat = codDiscountedSubTotal * 0.05;
//     const codTotal = codDiscountedSubTotal + codVat;

//     // Display values: Cash হলে COD adjusted, Card হলে provider এর values
//     const displaySubTotal = isCash ? codSubTotal : subTotal;
//     const displayVat = isCash ? codVat : vatAfterDiscount;
//     const displayDiscount = isCash ? codDiscountAmount : discountAmount;
//     const displayTotal = isCash
//         ? Number(codTotal.toFixed(2))
//         : Number(totalAfterDiscount.toFixed(2));

//     // ===============================
//     // ADDRESS DISPLAY HELPER
//     // ===============================
//     const getDisplayAddress = () => {
//         if (!liveAddress) return null;
//         if (liveAddress.displayAddress) return liveAddress.displayAddress;
//         switch (liveAddress.type) {
//             case "Apartment":
//             case "Office":
//                 return `${liveAddress.apartmentNo || ""} - ${liveAddress.buildingName || ""} - ${liveAddress.area || ""} - ${liveAddress.city || ""}`;
//             case "Villa":
//                 return `${liveAddress.villaNo || ""} - ${liveAddress.community || ""} - ${liveAddress.area || ""} - ${liveAddress.city || ""}`;
//             case "Other":
//                 return `${liveAddress.otherNo || ""} - ${liveAddress.streetName || ""} - ${liveAddress.area || ""} - ${liveAddress.city || ""}`;
//             default:
//                 return `${liveAddress.area || ""} - ${liveAddress.city || ""}`;
//         }
//     };

//     // ===============================
//     // CASH ON DELIVERY
//     // ===============================
//     const handleCashOnDelivery = async () => {
//         try {
//             setLoading(true);
//             const bookingData = {
//                 serviceName: services[0]?.title || "Cleaning Service",
//                 date,
//                 time,
//                 address: getDisplayAddress() || "",
//                 offer: promoStatus ? `${useDiscount}% discount` : "No offer",
//                 userName: `${user?.firstName || ""} ${user?.lastName || ""}`,
//                 userEmail: user?.email,
//                 propertyItemIds: itemSummary.map((item) => item.id),
//                 paymentMethod: "CashOnDelivery",
//                 serviceFee: servicePrice,
//                 serviceCharge,
//                 cashOnDelivery: COD_CHARGE,
//                 discount: useDiscount || 0,
//                 subTotal: codSubTotal,
//                 vat: codVat,
//                 totalPay: displayTotal,
//                 longitude: mapLongitude,
//                 latitude: mapLatitude,
//                 status: "Requested",
//                 userId: user?.id,
//                 paymentStatus: "Unpaid",
//             };
//             const response = await axiosSecure.post("/booking/create", bookingData);
//             if (response.data.success) {
//                 toast.success("Booking confirmed! Pay with Cash on Delivery.");
//                 navigate("/booking-success", {
//                     state: { bookingId: response.data.bookingId, paymentMethod: "Cash" },
//                 });
//             } else {
//                 throw new Error("Booking creation failed");
//             }
//         } catch (err) {
//             console.error("COD Error:", err);
//             toast.error(err?.response?.data?.message || "Booking failed!");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ===============================
//     // ONLINE PAYMENT
//     // ===============================
//     const handleOnlinePayment = async () => {
//         try {
//             setLoading(true);
//             const bookingData = {
//                 serviceName: services[0]?.title || "Cleaning Service",
//                 date,
//                 time,
//                 address: getDisplayAddress() || "",
//                 offer: promoStatus ? `${useDiscount}% discount` : "No offer",
//                 userName: `${user?.firstName || ""} ${user?.lastName || ""}`,
//                 userEmail: user?.email,
//                 propertyItemIds: itemSummary.map((item) => item.id),
//                 paymentMethod: "Online",
//                 serviceFee: servicePrice,
//                 serviceCharge,
//                 cashOnDelivery: 0,
//                 discount: useDiscount || 0,
//                 subTotal,
//                 vat: vatAfterDiscount,
//                 totalPay: totalAfterDiscount,
//                 longitude: mapLongitude,
//                 latitude: mapLatitude,
//                 status: "Requested",
//                 userId: user?.id,
//                 paymentStatus: "Unpaid",
//             };
//             const bookingResponse = await axiosSecure.post("/booking/create", bookingData);
//             if (!bookingResponse.data.success) {
//                 throw new Error("Booking creation failed");
//             }
//             const bookingId = bookingResponse.data.Data.id;
//             const payload = {
//                 amount: totalAfterDiscount,
//                 currency: "AED",
//                 order_id: `${bookingId}`,
//                 booking_id: bookingId,
//                 return_url: `${window.location.origin}/dashboard/payment-success`,
//                 cancel_url: `${window.location.origin}/dashboard/payment-cancel`,
//                 customer_email: user?.email,
//                 customer_name: `${user?.firstName || "Customer"} ${user?.lastName || ""}`,
//                 customer_phone: user?.phone,
//             };
//             const paymentResponse = await axiosSecure.post("/payments/ziina/create", payload);
//             if (paymentResponse.data?.payment_url) {
//                 window.location.href = paymentResponse.data.payment_url;
//             } else {
//                 toast.error("Payment initiation failed.");
//                 setLoading(false);
//             }
//         } catch (err) {
//             console.error("Online Payment Error:", err);
//             toast.error(err?.response?.data?.message || "Payment failed!");
//             setLoading(false);
//         }
//     };

//     // ===============================
//     // MAIN BOOKING HANDLER
//     // ===============================
//     const handleBookingConfirmation = async () => {
//         if (!paymentMethod) {
//             toast.error("Please select a payment method!");
//             return;
//         }
//         if (!user) {
//             toast.error("Please login to continue!");
//             navigate("/login");
//             return;
//         }
//         if (!date || !time) {
//             toast.error("Please select date and time!");
//             return;
//         }
//         if (!liveAddress) {
//             toast.error("Please select an address!");
//             return;
//         }
//         if (paymentMethod === "Cash") {
//             await handleCashOnDelivery();
//         } else if (paymentMethod === "Card") {
//             await handleOnlinePayment();
//         }
//     };

//     // ===============================
//     // PROMO HANDLER
//     // ===============================
//     const handleApplyPromo = async () => {
//         const promoCode = promoInputRef.current?.value?.trim();
//         if (!promoCode) {
//             toast.error("No promo code entered");
//             return;
//         }
//         await handleApply(promoCode);
//     };

//     return (
//         <div className="md:pb-14">
//             <div className="hidden md:block">
//                 <ServiceDetails title="Review & Confirm" currentStep={4} />
//             </div>

//             <div className="max-w-3xl mx-auto bg-white rounded-2xl mt-6 md:mt-0 shadow-lg p-4 md:p-7 text-[#4E4E4E]">

//                 {/* Booking Details */}
//                 <h2 className="text-base md:text-lg text-center md:text-start font-semibold mb-3 md:mb-4">
//                     Booking Details
//                 </h2>

//                 <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
//                     <IoBagRemoveSharp className="text-xl md:text-2xl shrink-0 mt-0.5" />
//                     <p className="text-sm md:text-base font-medium">{services[0]?.title || "Service"}</p>
//                 </div>

//                 <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
//                     <FaCalendar className="text-xl md:text-2xl shrink-0 mt-0.5" />
//                     <p className="text-sm md:text-base font-medium">
//                         {date || "Not selected"}, between {time || "Not selected"}
//                     </p>
//                 </div>

//                 <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
//                     <IoLocation className="text-xl md:text-2xl shrink-0 mt-0.5" />
//                     <p className="text-sm md:text-base font-medium">
//                         {getDisplayAddress() || "No address provided"}
//                     </p>
//                 </div>

//                 <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden">
//                     <iframe
//                         width="100%"
//                         height="100%"
//                         loading="lazy"
//                         src={`https://www.google.com/maps?q=${mapLatitude || 0},${mapLongitude || 0}&z=16&output=embed`}
//                         style={{ pointerEvents: "none" }}
//                         title="Location Map"
//                     />
//                 </div>

//                 {/* Promo Code */}
//                 {promoStatus ? (
//                     <div className="mt-5 md:mt-6">
//                         <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Offers</h2>
//                         <div className="flex items-center justify-between p-2 md:p-3 bg-[#FDFDFD] rounded-lg border border-gray-100">
//                             <div className="text-sm font-medium text-gray-600">
//                                 Discount
//                             </div>
//                             <div className="flex items-center gap-2.5">
//                                 <div className="text-sm md:text-[15px] bg-[#e0f2f4] text-[#01788E] px-2 md:px-3 py-1 rounded-lg font-semibold flex items-center gap-1">
//                                     <img className="h-3 w-3 md:h-4 md:w-4" src={dirhum} alt="currency" />
//                                     {useDiscount}% off
//                                 </div>
//                             </div>
//                             <SiTicktick className="text-lg md:text-xl text-[#01788E]" />
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="mt-5 md:mt-8">
//                         <h3 className="font-semibold text-gray-700 mb-2 text-sm md:text-base uppercase tracking-wider">
//                             Promo Code
//                         </h3>
//                         {!showInput ? (
//                             <button
//                                 onClick={() => setShowInput(true)}
//                                 className="w-full py-2.5 md:py-3 border border-dashed border-gray-300 rounded-lg text-sm md:text-base text-gray-600 hover:border-[#01788E] hover:text-[#01788E] transition-colors"
//                             >
//                                 + Add Promo Code
//                             </button>
//                         ) : (
//                             <div className="flex gap-2">
//                                 <input
//                                     type="text"
//                                     ref={promoInputRef}
//                                     placeholder="Enter promo code"
//                                     className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 md:py-3 text-sm md:text-base focus:ring-1 focus:ring-[#01788E] focus:border-[#01788E] outline-none"
//                                 />
//                                 <button
//                                     onClick={handleApplyPromo}
//                                     className="bg-[#01788E] text-white px-4 py-2.5 rounded-lg hover:bg-[#016070] transition-colors text-sm md:text-base font-medium"
//                                 >
//                                     Apply
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Payment Method */}
//                 <h2 className="text-base md:text-lg font-semibold mt-5 md:mt-6 mb-2 md:mb-3">Pay with</h2>
//                 <div className="space-y-2 md:space-y-3">

//                     {/* Card */}
//                     <div
//                         onClick={() => {
//                             setPaymentMethod("Card");
//                             setOpenModal(true);
//                         }}
//                         className={`border rounded-xl p-3 md:p-4 flex items-center justify-between cursor-pointer transition-all
//                             ${paymentMethod === "Card"
//                                 ? "border-[#01788E] bg-[#f0fafb]"
//                                 : "border-gray-200 hover:bg-gray-50"}`}
//                     >
//                         <div className="flex items-center justify-between w-full">
//                             <div className="flex items-center gap-3">
//                                 <div className="relative flex items-center justify-center">
//                                     <input
//                                         type="radio"
//                                         name="payment"
//                                         checked={paymentMethod === "Card"}
//                                         readOnly
//                                         className="peer h-4 w-4 md:h-5 md:w-5 cursor-pointer appearance-none rounded-full border-2 border-[#01788E] checked:border-[#01788E] transition-all"
//                                     />
//                                     <div className="absolute w-2 h-2 md:w-2.5 md:h-2.5 bg-[#01788E] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
//                                 </div>
//                                 <span className="text-[#1A1A1A] text-sm md:text-base font-medium">
//                                     Pay by card with Ziina
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="bg-white border border-gray-200 rounded px-1 py-0.5 md:px-1.5 md:py-1 h-6 md:h-8 flex items-center">
//                                     <img src="https://i.postimg.cc/KYj6NrYX/visa.jpg" alt="Visa" className="h-2.5 md:h-3" />
//                                 </div>
//                                 <div className="bg-white border border-gray-200 rounded px-1 py-0.5 md:px-1.5 md:py-1 h-6 md:h-8 flex items-center">
//                                     <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3 md:h-5" />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Cash On Delivery */}
//                     <div
//                         onClick={() => setPaymentMethod("Cash")}
//                         className={`border rounded-xl p-3 md:p-4 flex items-center justify-between cursor-pointer transition-all
//                             ${paymentMethod === "Cash"
//                                 ? "border-[#01788E] bg-[#f0fafb]"
//                                 : "border-gray-200 hover:bg-gray-50"}`}
//                     >
//                         <div className="flex items-center justify-between w-full">
//                             <div className="flex items-center gap-3">
//                                 <div className="relative flex items-center justify-center">
//                                     <input
//                                         type="radio"
//                                         name="payment"
//                                         checked={paymentMethod === "Cash"}
//                                         readOnly
//                                         className="peer h-4 w-4 md:h-5 md:w-5 cursor-pointer appearance-none rounded-full border-2 border-[#01788E] checked:border-[#01788E] transition-all"
//                                     />
//                                     <div className="absolute w-2 h-2 md:w-2.5 md:h-2.5 bg-[#01788E] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
//                                 </div>
//                                 <span className="text-[#1A1A1A] text-sm md:text-base font-medium">
//                                     Cash On Delivery
//                                 </span>
//                             </div>
//                             <div className="bg-[#FFEDD5] text-[#C6724D] text-xs font-bold px-2 md:px-2.5 py-1 rounded-lg border border-[#FDBA74]">
//                                 +5% FEE
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Payment Summary */}
//                 <h2 className="text-base md:text-lg font-semibold mt-5 md:mt-6 mb-2 md:mb-3">Payment Summary</h2>
//                 <div className="space-y-2 text-sm md:text-sm">

//                     <div className="flex justify-between">
//                         <span className="font-medium">Service Charges</span>
//                         <span className="font-medium flex items-center gap-1">
//                             <img className="h-2.5 w-2.5 md:h-3 md:w-3" src={dirhum} alt="currency" />
//                             {Number(servicePrice).toFixed(2)}
//                         </span>
//                     </div>

//                     <div className="flex justify-between">
//                         <span className="font-medium">Service Fee</span>
//                         <span className="font-medium flex items-center gap-1">
//                             <img className="h-2.5 w-2.5 md:h-3 md:w-3" src={dirhum} alt="currency" />
//                             {Number(serviceCharge).toFixed(2)}
//                         </span>
//                     </div>

//                     {isCash && (
//                         <div className="flex justify-between">
//                             <span className="font-medium">Cash On Delivery Charge</span>
//                             <span className="font-medium flex items-center gap-1">
//                                 <img className="h-2.5 w-2.5 md:h-3 md:w-3" src={dirhum} alt="currency" />
//                                 {COD_CHARGE.toFixed(2)}
//                             </span>
//                         </div>
//                     )}

//                     <div className="flex justify-between items-center">
//                         <span className="font-medium">Sub Total</span>
//                         <span className="font-medium flex items-center gap-1">
//                             <img className="h-2.5 w-2.5 md:h-3 md:w-3" src={dirhum} alt="currency" />
//                             {Number(displaySubTotal).toFixed(2)}
//                         </span>
//                     </div>

//                     {useDiscount > 0 && (
//                         <div className="flex justify-between items-center text-[#01788E]">
//                             <span className="text-sm">Discount ({useDiscount}%)</span>
//                             <span className="flex items-center gap-1 font-medium text-sm">
//                                 -&nbsp;<img src={dirhum} className="w-2.5 h-2.5 md:w-3 md:h-3" alt="currency" />
//                                 {Number(displayDiscount).toFixed(2)}
//                             </span>
//                         </div>
//                     )}

//                     <div className="flex justify-between items-center">
//                         <span className="font-medium">VAT (5%)</span>
//                         <span className="font-medium flex items-center gap-1">
//                             <img className="h-2.5 w-2.5 md:h-3 md:w-3" src={dirhum} alt="currency" />
//                             {Number(displayVat).toFixed(2)}
//                         </span>
//                     </div>

//                     <hr className="my-2 md:my-3" />
//                     <div className="flex justify-between text-base md:text-lg font-bold">
//                         <span className="text-[#1A1A1A]">Total to pay</span>
//                         <span className="flex items-center gap-1 text-[#01788E]">
//                             <img className="h-3.5 w-3.5 md:h-4 md:w-4 mt-0.5" src={dirhum} alt="currency" />
//                             {displayTotal.toFixed(2)}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             <div className="my-4 md:my-0 mx-auto w-60">
//                 <NextBtn
//                     onClick={handleBookingConfirmation}
//                     name={loading ? "Processing..." : "Book Now"}
//                     disabled={loading}
//                 />
//             </div>

//             {/* Modal */}
//             {openModal && (
//                 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 relative">
//                         <button
//                             onClick={() => {
//                                 setOpenModal(false);
//                                 setPaymentMethod("");
//                             }}
//                             className="absolute cursor-pointer right-4 top-4 text-gray-500 text-2xl leading-none"
//                         >
//                             ×
//                         </button>
//                         <h2 className="text-center text-lg md:text-xl font-semibold mb-4 md:mb-6">
//                             Online Payment
//                         </h2>
//                         <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 text-center">
//                             You will be redirected to Ziina payment gateway to complete your payment securely.
//                         </p>
//                         <div className="flex items-center bg-gray-100 text-gray-600 text-sm md:text-base p-3 rounded-xl">
//                             <span className="mr-2">ℹ️</span>
//                             Your payment will be processed securely by Ziina
//                         </div>
//                         <div className="flex gap-3 mt-5 md:mt-6">
//                             <button
//                                 onClick={() => {
//                                     setOpenModal(false);
//                                     setPaymentMethod("");
//                                 }}
//                                 className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm md:text-base font-semibold hover:bg-gray-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={() => setOpenModal(false)}
//                                 className="flex-1 bg-[#01788E] text-white py-3 rounded-xl text-sm md:text-base font-semibold hover:bg-[#016070] transition-colors"
//                             >
//                                 Confirm
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };








// main component code 
import { useRef, useState } from "react";
import NextBtn from "../../../components/NextBtn/NextBtn";
import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
import { GoCreditCard } from "react-icons/go";
import { MdKeyboardArrowRight } from "react-icons/md";
import { PiMoneyWavy } from "react-icons/pi";
import { IoBagRemoveSharp, IoLocation } from "react-icons/io5";
import { FaCalendar } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { useSummary } from "../../../provider/SummaryProvider";
import dirhum from "../../../assets/icon/dirhum.png";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

export default function Confirmation() {
    const [openModal, setOpenModal] = useState(false);
    const { serviceCharge, subTotal, services, vat, date, time, mapLongitude, mapLatitude, liveAddress, itemSummary, useDiscount, servicePrice, promoStatus, showInput, setShowInput, handleApply, totalAfterDiscount,
    } = useSummary();
    const axiosSecure = useAxiosSecure();
    const promoInputRef = useRef(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const getDisplayAddress = () => {
        if (!liveAddress) return null;

        if (liveAddress.displayAddress) return liveAddress.displayAddress;

        switch (liveAddress.type) {
            case "Apartment":
            case "Office":
                return `${liveAddress.apartmentNo || ""} - ${liveAddress.buildingName || ""} - ${liveAddress.area || ""} - ${liveAddress.city || ""}`;
            case "Villa":
                return `${liveAddress.villaNo || ""} - ${liveAddress.community || ""} - ${liveAddress.area || ""} - ${liveAddress.city || ""}`;
            case "Other":
                return `${liveAddress.otherNo || ""} - ${liveAddress.streetName || ""} - ${liveAddress.area || ""} - ${liveAddress.city || ""}`;
            default:
                return `${liveAddress.area || ""} - ${liveAddress.city || ""}`;
        }
    };

    // ===============================
    // CASH ON DELIVERY FUNCTION
    // ===============================
    const handleCashOnDelivery = async () => {
        try {
            setLoading(true);
            const displayAddress = getDisplayAddress() || "";

            const bookingData = {
                serviceName: services[0]?.title || "Cleaning Service",
                date,
                time,
                address: displayAddress,
                offer: promoStatus ? `${useDiscount}% discount` : "No offer",
                userName: `${user?.firstName || ""} ${user?.lastName || ""}`,
                userEmail: user?.email,
                propertyItemIds: itemSummary.map((item) => item.id),
                paymentMethod: "CashOnDelivery",
                serviceFee: servicePrice,
                serviceCharge,
                cashOnDelivery: 5,
                discount: useDiscount || 0,
                subTotal: subTotal + 5,
                vat,
                totalPay: totalAfterDiscount + 5,
                longitude: mapLongitude,
                latitude: mapLatitude,
                status: "Requested",
                userId: user?.id,
                paymentStatus: "Unpaid",
            };

            const response = await axiosSecure.post("/booking/create", bookingData);
            if (response.data.success) {
                toast.success("Booking confirmed! Pay with Cash on Delivery.");
                navigate("/booking-success", {
                    state: {
                        bookingId: response.data.bookingId,
                        paymentMethod: "Cash",
                    },
                });
            } else {
                throw new Error("Booking creation failed");
            }
        } catch (err) {
            console.error("COD Error:", err);
            toast.error(err?.response?.data?.message || "Booking failed!");
        } finally {
            setLoading(false);
        }
    };



    const handleOnlinePayment = async () => {
        try {
            setLoading(true);
            const displayAddress = getDisplayAddress() || "";

            const bookingData = {
                serviceName: services[0]?.title || "Cleaning Service",
                date,
                time,
                address: displayAddress,
                offer: promoStatus ? `${useDiscount}% discount` : "No offer",
                userName: `${user?.firstName || ""} ${user?.lastName || ""}`,
                userEmail: user?.email,
                propertyItemIds: itemSummary.map((item) => item.id),
                paymentMethod: "Online",
                serviceFee: servicePrice,
                serviceCharge,
                cashOnDelivery: 0,
                discount: useDiscount || 0,
                subTotal,
                vat,
                totalPay: totalAfterDiscount,
                longitude: mapLongitude,
                latitude: mapLatitude,
                status: "Requested",
                userId: user?.id,
                paymentStatus: "Unpaid",
            };

            const bookingResponse = await axiosSecure.post(
                "/booking/create",
                bookingData,
            );

            if (!bookingResponse.data.success) {
                throw new Error("Booking creation failed");
            }

            const bookingId = bookingResponse.data.Data.id;

            // Prepare payment payload
            const payload = {
                amount: totalAfterDiscount,
                currency: "AED",
                // order_id: `booking_${bookingId}_${Date.now()}`,
                order_id: `${bookingId}`,
                booking_id: bookingId,
                return_url: `${window.location.origin}/dashboard/payment-success`,
                cancel_url: `${window.location.origin}/dashboard/payment-cancel`,
                customer_email: user?.email,
                customer_name: `${user?.firstName || "Customer"} ${user?.lastName || ""}`,
                customer_phone: user?.phone,
            };

            // Create payment session
            const paymentResponse = await axiosSecure.post(
                "/payments/ziina/create",
                payload,
            );

            if (paymentResponse.data?.payment_url) {
                window.location.href = paymentResponse.data.payment_url;
            } else {
                toast.error("Payment initiation failed.");
            }
        } catch (err) {
            console.error("Online Payment Error:", err);
            toast.error(err?.response?.data?.message || "Payment failed!");
            setLoading(false);
        }
    };

    // ===============================
    // MAIN BOOKING CONFIRMATION HANDLER
    // ===============================
    const handleBookingConfirmation = async () => {
        if (!paymentMethod) {
            toast.error("Please select a payment method!");
            return;
        }
        if (!user) {
            toast.error("Please login to continue!");
            navigate("/login");
            return;
        }
        if (!date || !time) {
            toast.error("Please select date and time!");
            return;
        }
        if (!liveAddress) {
            toast.error("Please select an address!");
            return;
        }

        if (paymentMethod === "Cash") {
            await handleCashOnDelivery();
        } else if (paymentMethod === "Card") {
            await handleOnlinePayment();
        }
    };

    const handleApplyPromo = async () => {
        const promoCode = promoInputRef.current?.value;
        if (!promoCode) {
            toast.error("No promo code entered");
            return;
        }
        await handleApply(promoCode.trim());
    };

    const cashOnDeliveryCharge = 5;
    const subTotalWithCOD =
        paymentMethod === "Cash"
            ? Number(subTotal) + cashOnDeliveryCharge
            : Number(subTotal);
    const vatAmount = (subTotalWithCOD * 0.05).toFixed(2);
    const discountAmount =
        useDiscount > 0 ? (subTotalWithCOD * useDiscount) / 100 : 0;
    const finalTotal =
        paymentMethod === "Cash"
            ? (totalAfterDiscount + cashOnDeliveryCharge).toFixed(2)
            : totalAfterDiscount.toFixed(2);

    return (
        <div className="md:pb-14">
            <div className="hidden md:block">
                <ServiceDetails title="Review & Confirm" currentStep={4} />
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-2xl mt-6 md:mt-0 shadow-lg p-4 md:p-7 text-[#4E4E4E]">
                {/* User Info (for debugging) */}
                {user && (
                    <div className="mb-3 md:mb-4 p-2 md:p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs md:text-sm text-gray-600">Logged in as: {user.email}</p>
                        <p className="text-xs md:text-sm text-gray-600">User ID: {user.id}</p>
                    </div>
                )}

                {/* Booking Details */}
                <h2 className="text-base md:text-lg text-center md:text-start font-semibold mb-3 md:mb-4">
                    Booking Details
                </h2>

                <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                    <IoBagRemoveSharp className="text-xl md:text-2xl" />
                    <p className="text-sm md:text-base font-medium">{services[0]?.title || "Service"}</p>
                </div>

                <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                    <FaCalendar className="text-xl md:text-2xl" />
                    <p className="text-sm md:text-base font-medium">
                        {date || "Not selected"}, between {time || "Not selected"}
                    </p>
                </div>

                <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                    <IoLocation className="text-xl md:text-2xl" />
                    <p className="text-sm md:text-base font-medium">
                        {getDisplayAddress() || "No address provided"}
                    </p>
                </div>

                <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden">
                    <iframe
                        width="100%"
                        height="100%"
                        loading="lazy"
                        src={`https://www.google.com/maps?q=${mapLatitude || 0},${mapLongitude || 0}&z=16&output=embed`}
                        style={{ pointerEvents: "none" }}
                        title="Location Map"
                    ></iframe>
                </div>

                {/* Promo Code */}
                {promoStatus ? (
                    <div>
                        <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Offers</h2>
                        <div className="flex items-center justify-between p-2 md:p-3 bg-[#FDFDFD]">
                            <div className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-2">
                                Discount
                            </div>
                            <div className="flex items-center gap-2.5 text-[#ff7a00]">
                                <div className="text-xs md:text-[15px] bg-[#FCDFD5] text-[#ED6329] px-2 md:px-3 py-1 rounded-lg font-semibold flex items-center gap-1">
                                    <img
                                        className="h-3 w-3 md:h-4 md:w-4 filter invert sepia saturate-200 hue-rotate-20 text-red-700"
                                        src={dirhum}
                                        alt="currency"
                                    />
                                    {useDiscount}% off
                                </div>
                            </div>
                            <SiTicktick className="text-lg md:text-xl" />
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 md:mt-8">
                        <h3 className="font-semibold text-gray-700 mb-2 text-sm md:text-base uppercase tracking-wider">
                            Promo Code
                        </h3>
                        {!showInput ? (
                            <button
                                onClick={() => setShowInput(true)}
                                className="w-full py-2 md:py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#01788E] hover:text-[#01788E] transition-colors text-xs md:text-sm"
                            >
                                + Add Promo Code
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    ref={promoInputRef}
                                    placeholder="Enter promo code"
                                    className="flex-1 border border-gray-300 rounded-lg px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm focus:ring-1 focus:ring-[#01788E] focus:border-transparent outline-none"
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    className="bg-[#01788E] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-[#016a7a] transition-colors text-xs md:text-sm"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Payment Method */}
                <h2 className="text-base md:text-lg font-semibold mt-5 md:mt-6 mb-2 md:mb-3">Pay with</h2>
                <div className="space-y-2 md:space-y-3">

                    {/* Card (Online Payment) */}
                    <div
                        onClick={() => {
                            setOpenModal(true);
                            setPaymentMethod("Card");
                        }}
                        className={`border rounded-xl p-3 md:p-4 flex items-center justify-between cursor-pointer transition-all
                                  ${paymentMethod === "Card" ? "border-[#C6724D] bg-[#FDF5F3]" : "border-gray-200 hover:bg-gray-50"}`} >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                {/* Custom Radio Button */}
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === "Card"}
                                        readOnly
                                        className="peer h-4 w-4 md:h-5 md:w-5 cursor-pointer appearance-none rounded-full border-2 border-[#A3735E] checked:border-[#A3735E] transition-all"
                                    />
                                    <div className="absolute w-2 h-2 md:w-2.5 md:h-2.5 bg-[#A3735E] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                </div>

                                <span className="text-[#1A1A1A] text-sm md:text-base font-medium">
                                    Pay by card with Ziina
                                </span>
                            </div>

                            {/* Card Logos */}
                            <div className="flex items-center gap-2">
                                <div className="bg-white border border-gray-200 rounded px-1 py-0.5 md:px-1.5 md:py-1 h-6 md:h-8 flex items-center">
                                    <img src="https://i.postimg.cc/KYj6NrYX/visa.jpg" alt="Visa" className="h-2 md:h-3" />
                                </div>
                                <div className="bg-white border border-gray-200 rounded px-1 py-0.5 md:px-1.5 md:py-1 h-6 md:h-8 flex items-center">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3 md:h-5" />
                                </div>
                                <div className="bg-white border border-gray-200 rounded px-1 py-0.5 md:px-1.5 md:py-1 h-6 md:h-8 flex items-center flex-col justify-center leading-none">
                                    <img src="https://i.postimg.cc/vmTJzLZC/images.jpg" alt="Visa" className="h-1.5 md:h-2" />
                                    <span className="text-[4px] md:text-[6px] font-bold italic text-blue-900">DEBIT</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cash On Delivery */}
                    <div
                        onClick={() => setPaymentMethod("Cash")}
                        className={`border rounded-xl p-3 md:p-4 flex items-center justify-between cursor-pointer transition-all
        ${paymentMethod === "Cash" ? "border-[#C6724D] bg-[#FDF5F3]" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                {/* Custom Radio Button */}
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === "Cash"}
                                        readOnly
                                        className="peer h-4 w-4 md:h-5 md:w-5 cursor-pointer appearance-none rounded-full border-2 border-[#A3735E] checked:border-[#A3735E] transition-all"
                                    />
                                    <div className="absolute w-2 h-2 md:w-2.5 md:h-2.5 bg-[#A3735E] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                </div>

                                <span className="text-[#1A1A1A] text-sm md:text-base font-medium">
                                    Cash On Delivery
                                </span>
                            </div>

                            {/* Fee Badge */}
                            <div className="bg-[#FFEDD5] text-[#C6724D] text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-1 rounded-lg border border-[#FDBA74]">
                                +5% FEE
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Summary */}
                <h2 className="text-base md:text-lg font-semibold mt-5 md:mt-6 mb-2 md:mb-3">Payment Summary</h2>
                <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex justify-between">
                        <span className="font-medium">Service Charges</span>
                        <span className="font-medium flex items-center gap-1">
                            <img className="h-2 w-2 md:h-3 md:w-3" src={dirhum} alt="currency" />{" "}
                            {servicePrice}
                        </span>
                    </div>

                    {paymentMethod === "Cash" && (
                        <div className="flex justify-between">
                            <span className="font-medium">Cash On Delivery Charge</span>
                            <span className="font-medium flex items-center gap-1">
                                <img className="h-2 w-2 md:h-3 md:w-3" src={dirhum} alt="currency" /> 5.00
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="font-medium">Service Fee</span>
                        <span className="font-medium flex items-center gap-1">
                            <img className="h-2 w-2 md:h-3 md:w-3" src={dirhum} alt="currency" />{" "}
                            {serviceCharge}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">Sub Total</span>
                        <span className="font-medium flex items-center gap-1">
                            <img className="h-2 w-2 md:h-3 md:w-3" src={dirhum} alt="currency" />{" "}
                            {subTotalWithCOD.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">VAT (5%)</span>
                        <span className="font-medium flex items-center gap-1">
                            <img className="h-2 w-2 md:h-3 md:w-3" src={dirhum} alt="currency" />{" "}
                            {vatAmount}
                        </span>
                    </div>

                    {useDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                            <span className="text-xs md:text-sm">Discount</span>
                            <span className="flex items-center gap-1 font-medium text-xs md:text-sm">
                                <img src={dirhum} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" alt="currency" />-
                                {discountAmount.toFixed(2)}
                            </span>
                        </div>
                    )}

                    <hr className="my-2 md:my-3" />
                    <div className="flex justify-between text-base md:text-lg font-bold">
                        <span>Total to pay</span>
                        <span className="flex items-center gap-1">
                            <img className="h-3 w-3 md:h-4 md:w-4 mt-[2px] md:mt-[3px]" src={dirhum} alt="currency" />{" "}
                            {finalTotal}
                        </span>
                    </div>
                </div>
            </div>

            <div className="my-4 md:my-0 mx-auto w-60">
                <NextBtn
                    onClick={handleBookingConfirmation}
                    name={loading ? "Processing..." : "Book Now"}
                    disabled={loading}
                />
            </div>

            {/* Modal for card payment details */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 relative">
                        <button
                            onClick={() => setOpenModal(false)}
                            className="absolute cursor-pointer right-4 top-4 text-gray-500 text-2xl"
                        >
                            ×
                        </button>
                        <h2 className="text-center text-xl font-semibold mb-6">
                            Online Payment
                        </h2>

                        <p className="text-gray-600 mb-6 text-center">
                            You will be redirected to Ziina payment gateway to complete your
                            payment securely.
                        </p>

                        <div className="flex items-center bg-gray-100 text-gray-600 text-sm p-3 rounded-xl mt-5">
                            <span className="mr-2">ℹ️</span>
                            Your payment will be processed securely by Ziina
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setPaymentMethod("Card");
                                    setOpenModal(false);
                                }}
                                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};