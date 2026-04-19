import { useState, useEffect } from "react";
import { IoAddSharp } from "react-icons/io5";
import { MdOutlineArrowBack } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import dirhum from '../../assets/icon/dirhum.png'
import { useItem } from "../../provider/ItemProvider";

const ContentModal = ({ setShowModal, property }) => {
    const [quantities, setQuantities] = useState({});
    const { addItem, removeItem } = useItem();
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Restore previously added items from localStorage on modal open
    useEffect(() => {
        const savedItems = JSON.parse(localStorage.getItem("item")) || [];
        const initialQuantities = {};
        savedItems.forEach((id) => {
            initialQuantities[id] = 1;
        });
        setQuantities(initialQuantities);
    }, []);

    const handleAdd = (id) => {
        setQuantities((prev) => ({ ...prev, [id]: 1 }));
        addItem(id);
    };

    const handleRemove = (id) => {
        setQuantities((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
        removeItem(id);
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!property) {
        return (
            <div className="fixed inset-0 text-[#5D4F52] bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                    <p className="text-gray-600 mb-4">No property data found.</p>
                    <button
                        onClick={() => setShowModal(false)}
                        className="w-full px-4 py-3 bg-[#01788E] text-white rounded-lg font-medium hover:bg-[#016379] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const handelDetails = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedItem(null);
    };

    const items = Array.isArray(property.propertyItems) ? property.propertyItems : [];
    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-99 flex md:items-center md:justify-center">
                <div className="absolute inset-0" onClick={() => setShowModal(false)} />

                {/* Modal panel */}
                <div
                    className="bg-white w-full md:max-w-2xl md:rounded-xl shadow-2xl
                               fixed bottom-0 md:static
                               flex flex-col
                               h-[70vh] md:h-[90vh]
                               z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Header ── */}
                    <div className="shrink-0 border-b border-gray-200 md:rounded-t-xl px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-between gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 transition-colors shrink-0"
                            >
                                <MdOutlineArrowBack className="w-6 h-6" />
                            </button>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex-1 text-center truncate">
                                {property.title}
                            </h2>
                            {/* spacer to keep title centered */}
                            <div className="w-7 shrink-0" />
                        </div>
                    </div>

                    {/* ── Items List — scrollable ── */}
                    <div className="flex-1 overflow-y-auto px-6 md:px-8">
                        {items.length > 0 ? (
                            <div className="space-y-0">
                                {items.map((item) => {
                                    const itemId = item.id || item._id;
                                    const qty = quantities[itemId] || 0;
                                    return (
                                        <div
                                            key={itemId}
                                            className="border-b border-gray-200 py-4 last:border-b-0"
                                        >
                                            <div className="flex gap-4">
                                                {/* Image */}
                                                <div
                                                    onClick={() => handelDetails(item)}
                                                    className="shrink-0 cursor-pointer"
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-[78px] h-[78px] object-cover rounded"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div
                                                        onClick={() => handelDetails(item)}
                                                        className="cursor-pointer"
                                                    >
                                                        <h3 className="text-[14px] sm:text-base font-medium line-clamp-1">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-gray-800 text-[12px] sm:text-sm mt-1 line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                    </div>

                                                    <div className="flex justify-between mt-3">
                                                        {/* Price */}
                                                        <div className="flex items-center justify-center gap-0 mb-3">
                                                            <img className="h-3.5 w-4 sm:h-5 sm:w-5 mt-0.5" src={dirhum} alt="AED" />
                                                            <span className="text-sm sm:text-base font-semibold text-gray-700">
                                                                {item.price?.toLocaleString?.() ?? item.price}
                                                            </span>
                                                        </div>

                                                        {/* Add btn */}
                                                        {qty === 0 ? (
                                                            <button
                                                                onClick={() => handleAdd(itemId)}
                                                                className="border border-[#01788E] text-[#01788E] px-2.5 py-0.5 rounded flex items-center gap-1 font-normal text-[12px] cursor-pointer hover:bg-[#01788E]/5 transition-colors"
                                                            >
                                                                <span>Add</span>
                                                                <IoAddSharp className="text-[15px]" />
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleRemove(itemId)}
                                                                    className="w-7 h-7 flex justify-center items-center pb-1
                                                                 border border-[#01788E] rounded-full text-[#01788E] transition-colors text-lg cursor-pointer"
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="font-semibold text-gray-800 text-sm sm:text-base w-5 text-center">
                                                                    {qty}
                                                                </span>

                                                                <button
                                                                    className="w-7 h-7 flex justify-center items-center pb-1
                                                                 border border-[#01788E] rounded-full text-[#01788E] transition-colors text-lg cursor-pointer"
                                                                    title="Maximum quantity reached"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                <div className="text-5xl mb-4">📭</div>
                                <p className="text-gray-500 text-base font-medium">No options available</p>
                                <p className="text-gray-400 text-sm mt-1">Check back later for new options</p>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="shrink-0 border-t border-gray-100 md:rounded-b-xl px-4 sm:px-6 py-3">
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full bg-red-500 hover:bg-red-600 cursor-pointer active:scale-[0.98] text-white font-semibold py-3 rounded text-sm sm:text-base tracking-wide transition-all duration-200"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Detail Modal ── */}
            {showDetailModal && selectedItem && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4"
                    onClick={closeDetailModal}
                >
                    <div
                        className="bg-white rounded shadow-2xl w-full max-w-md md:max-w-[560px] max-h-[80vh] md:max-h-[88vh] flex flex-col relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeDetailModal}
                            className="absolute top-3 right-3 z-10 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm transition-colors"
                        >
                            <IoClose className="w-4 h-4" />
                        </button>

                        {/* Hero Image */}
                        <div
                            className="h-44 sm:h-52 bg-cover bg-center shrink-0"
                            style={{ backgroundImage: `url(${selectedItem.image})` }}
                        />

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 sm:p-6">
                                {/* Title + Price */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                                        {selectedItem.title}
                                    </h2>
                                    <span className="flex items-center gap-1 text-base sm:text-lg font-bold text-gray-800 shrink-0">
                                        {selectedItem.price}
                                        <img src={dirhum} alt="AED" className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    {selectedItem.description}
                                </p>

                                {/* What's Included */}
                                {[selectedItem.feature1, selectedItem.feature2, selectedItem.feature3, selectedItem.feature4].some(Boolean) && (
                                    <>
                                        <hr className="border-gray-100 mb-4" />
                                        <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3">
                                            What&apos;s included
                                        </h3>
                                        <div className="space-y-2.5">
                                            {[selectedItem.feature1, selectedItem.feature2, selectedItem.feature3, selectedItem.feature4]
                                                .filter(Boolean)
                                                .map((feat, i) => (
                                                    <div key={i} className="flex items-start gap-2.5">
                                                        <div className="mt-1.5 w-2.5 h-2.5 border border-gray-400 rounded-full shrink-0" />
                                                        <p className="text-sm text-gray-600 leading-snug">{feat}</p>
                                                    </div>
                                                ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 border-t border-gray-100 px-4 sm:px-6 py-2.5">
                            {/* Quantity row */}
                            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
                                <button
                                    onClick={() => handleRemove(selectedItem.id || selectedItem._id)}
                                    className="w-7 h-7 flex justify-center items-center pb-1
                                                                 border border-[#01788E] rounded-full text-[#01788E] transition-colors text-lg cursor-pointer"
                                >
                                    −
                                </button>
                                <span className="text-base sm:text-lg font-semibold w-8 text-center">
                                    {quantities[selectedItem.id || selectedItem._id] || 0}
                                </span>
                                <button
                                    disabled
                                    className="w-7 h-7 flex justify-center items-center pb-1
                                                                 border border-[#01788E] rounded-full text-[#01788E] transition-colors text-lg cursor-pointercursor-not-allowed"
                                    title="Maximum quantity reached"
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to basket button */}
                            {(() => {
                                const iid = selectedItem.id || selectedItem._id;
                                const inCart = !!quantities[iid];
                                return (
                                    <button
                                        onClick={() => {
                                            if (!inCart) handleAdd(iid);
                                            closeDetailModal();
                                        }}
                                        className={`w-full sm:w-[305px] mx-auto py-1.5 flex items-center justify-center gap-1.5 border font-semibold rounded transition-colors text-sm sm:text-base
                                            ${inCart
                                                ? 'border-gray-300 text-gray-400 cursor-default'
                                                : 'border-[#01788E] text-[#01788E] hover:bg-[#01788E]/5 cursor-pointer'}`}
                                    >
                                        <span className="text-lg font-medium">+</span>
                                        {inCart ? 'Already Added' : 'Add To Basket'}
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ContentModal;




// main component code
// import { useState, useEffect } from "react";
// import { IoAddSharp } from "react-icons/io5";
// import { MdOutlineArrowBack } from "react-icons/md";
// import dirhum from '../../assets/icon/dirhum.png'
// import { useItem } from "../../provider/ItemProvider";

// const ContentModal = ({ setShowModal, property }) => {
//     const [quantities, setQuantities] = useState({});
//     const { addItem, removeItem } = useItem();
//     const [showDetailModal, setShowDetailModal] = useState(false);
//     const [selectedItem, setSelectedItem] = useState(null);

//     useEffect(() => {
//         const savedItems = JSON.parse(localStorage.getItem("item")) || [];
//         const initialQuantities = {};
//         savedItems.forEach((id) => {
//             initialQuantities[id] = 1;
//         });
//         setQuantities(initialQuantities);
//     }, []);

//     const handleAdd = (id) => {
//         setQuantities((prev) => ({
//             ...prev,
//             [id]: 1,
//         }));
//         addItem(id);
//     };

//     const handleRemove = (id) => {
//         setQuantities((prev) => {
//             const updated = { ...prev };
//             delete updated[id];
//             return updated;
//         });
//         removeItem(id);
//     };

//     if (!property) {
//         return (
//             <div className="fixed inset-0 text-[#5D4F52] bg-black/70 flex items-center justify-center z- p-4">
//                 <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
//                     <p className="text-gray-600 mb-4">No property data found.</p>
//                     <button
//                         onClick={() => setShowModal(false)}
//                         className="w-full px-4 py-3 bg-[#01788E] text-white rounded-lg font-medium hover:bg-[#016379] transition-colors"
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const handelDetails = item => {
//         setSelectedItem(item);
//         setShowDetailModal(true);
//     };

//     const closeDetailModal = () => {
//         setShowDetailModal(false);
//         setSelectedItem(null);
//     };

//     const items = Array.isArray(property.propertyItems) ? property.propertyItems : [];

//     return (
//         <>
//             <div className="fixed inset-0 bg-black/70 z-50 flex md:items-center md:justify-center">
//                 <div
//                     className="absolute inset-0"
//                     onClick={() => setShowModal(false)}
//                 />
//                 <div
//                     className="bg-white w-full md:max-w-2xl md:rounded-xl shadow-2xl fixed bottom-0 md:static flex flex-col h-[70vh] md:h-[90vh]
//                  transform transition-transform duration-300 translate-y-0 z-10 px-6 sm:px-4"
//                     onClick={(e) => e.stopPropagation()}
//                 >
//                     {/* Header */}
//                     <div className="sticky top-0 bg-white z-20 border-b border-gray-300 md:rounded-t-xl px-4 sm:px-6 py-4 mb-4">
//                         <div className="flex items-center justify-between">
//                             <button
//                                 onClick={() => setShowModal(false)}
//                                 className="text-gray-400 hover:text-gray-600 text-2xl p-1 transition-colors"
//                             >
//                                 <MdOutlineArrowBack className="w-6 h-6" />
//                             </button>
//                             <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex-1 text-center">
//                                 {property.title}
//                             </h2>
//                             <div className="w-8"></div>
//                         </div>
//                     </div>

//                     {/* Items List - Scrollable */}
//                     <div className="flex-1 overflow-y-auto">
//                         {items.length > 0 ? (
//                             <div className="space-y-3 sm:space-y-4">
//                                 {items.map((item) => {
//                                     const qty = quantities[item.id] || 0;
//                                     return (
//                                         <div
//                                             key={item.id}
//                                             className="bg-white mb-8 border-b border-gray-300 pb-3"
//                                         >
//                                             <div className="flex gap-4">
//                                                 {/* Image */}
//                                                 <div className="shrink-0">
//                                                     <div
//                                                         onClick={() => handelDetails(item)}
//                                                         className="cursor-pointer"
//                                                     >
//                                                         <img
//                                                             src={item.image}
//                                                             alt={item.title}
//                                                             className="w-20 h-20 object-cover rounded"
//                                                         />
//                                                     </div>
//                                                 </div>

//                                                 {/* Content */}
//                                                 <div className="flex-1">
//                                                     <div
//                                                         onClick={() => handelDetails(item)}
//                                                         className="cursor-pointer sm:mb-3"
//                                                     >
//                                                         <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">
//                                                             {item.title}
//                                                         </h3>
//                                                         <p className="text-gray-600 text-sm sm:text-base mt-1">
//                                                             {item.description}
//                                                         </p>
//                                                     </div>

//                                                     <div className="flex justify-between mt-2">
//                                                         <div className="flex items-center">
//                                                             <img
//                                                                 className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5"
//                                                                 src={dirhum}
//                                                                 alt="AED"
//                                                             />
//                                                             <span className="sm:text-xl font-semibold text-gray-900">
//                                                                 {item.price.toLocaleString()}
//                                                             </span>
//                                                         </div>

//                                                         {/* Add / Quantity Controller */}
//                                                         {qty === 0 ? (
//                                                             <button
//                                                                 onClick={() => handleAdd(item.id)}
//                                                                 className="border border-[#01788E] text-[#01788E] px-3 py-1.5 rounded flex items-center justify-center gap-1 font-medium text-sm sm:text-base cursor-pointer"
//                                                             >
//                                                                 <span>Add</span>
//                                                                 <IoAddSharp className="text-xl" />
//                                                             </button>
//                                                         ) : (
//                                                             <div className="flex items-center justify-between">
//                                                                 <button
//                                                                     onClick={() => handleRemove(item.id)}
//                                                                     className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors text-lg cursor-pointer"
//                                                                 >
//                                                                     −
//                                                                 </button>
//                                                                 <span className="font-semibold text-gray-800 text-base sm:text-lg min-w-8 text-center">
//                                                                     {qty}
//                                                                 </span>
//                                                                 <button
//                                                                     disabled
//                                                                     className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-400 text-gray-400 rounded-full cursor-not-allowed text-lg"
//                                                                     title="Maximum quantity reached"
//                                                                 >
//                                                                     +
//                                                                 </button>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         ) : (
//                             <div className="text-center py-12">
//                                 <div className="text-gray-400 text-5xl mb-4">📭</div>
//                                 <p className="text-gray-500 text-lg">No options available</p>
//                                 <p className="text-gray-400 text-sm mt-2">Check back later for new options</p>
//                             </div>
//                         )}
//                     </div>

//                     {/* Footer - Sticky Bottom */}
//                     <div className="sticky bottom-0 bg-white border-t border-gray-100 md:rounded-b-xl py-2">
//                         <button
//                             onClick={() => setShowModal(false)}
//                             className="w-full bg-[#ED6329] hover:bg-[#e0551f] text-white font-semibold py-3 sm:py-4 rounded text-base sm:text-lg tracking-wide transition-all duration-200 active:scale-[0.98]"
//                         >
//                             Continue
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {showDetailModal && selectedItem && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//                     onClick={closeDetailModal}
//                 >
//                     <div
//                         className="bg-white rounded-lg shadow-lg w-full max-w-md md:max-w-[600px] max-h-[70vh] md:max-h-[90vh] flex flex-col relative"
//                         onClick={(e) => e.stopPropagation()}
//                     >

//                         {/* Close Button */}
//                         <button
//                             onClick={closeDetailModal}
//                             className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl z-10 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center"
//                         >
//                             ✕
//                         </button>

//                         <div
//                             className="h-48 bg-cover bg-center shrink-0"
//                             style={{
//                                 backgroundImage: `url(${selectedItem.image})`
//                             }}
//                         >
//                         </div>

//                         {/* Content Section - Scrollable */}
//                         <div className="flex-1 overflow-y-auto">
//                             <div className="p-4 md:p-6">
//                                 {/* Title and Price */}
//                                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
//                                     <h2 className="text-lg md:text-xl font-semibold text-gray-800">
//                                         {selectedItem.title}
//                                     </h2>
//                                     <span className="text-lg md:text-xl font-bold text-gray-800 mt-2 sm:mt-0 flex items-center gap-1">
//                                         {selectedItem.price} <img src={dirhum} alt="" className="w-4 h-4 md:w-5 md:h-5" />
//                                     </span>
//                                 </div>

//                                 {/* Description */}
//                                 <p className="text-sm text-gray-600 mb-4 md:mb-6">
//                                     {selectedItem.description}
//                                 </p>

//                                 <hr className="my-4" />

//                                 {/* What's Included Section */}
//                                 <div>
//                                     <h3 className="text-base md:text-lg font-bold mb-3">
//                                         What's included
//                                     </h3>
//                                     <div className="space-y-3">
//                                         {/* Feature 1 */}
//                                         {selectedItem.feature1 && (
//                                             <div className="flex items-start">
//                                                 <div className="mt-1 w-3 h-3 border border-gray-400 rounded-full mr-3 flex-shrink-0"></div>
//                                                 <p className="text-sm text-gray-700">{selectedItem.feature1}</p>
//                                             </div>
//                                         )}
//                                         {/* Feature 2 */}
//                                         {selectedItem.feature2 && (
//                                             <div className="flex items-start">
//                                                 <div className="mt-1 w-3 h-3 border border-gray-400 rounded-full mr-3 flex-shrink-0"></div>
//                                                 <p className="text-sm text-gray-700">{selectedItem.feature2}</p>
//                                             </div>
//                                         )}
//                                         {/* Feature 3 */}
//                                         {selectedItem.feature3 && (
//                                             <div className="flex items-start">
//                                                 <div className="mt-1 w-3 h-3 border border-gray-400 rounded-full mr-3 flex-shrink-0"></div>
//                                                 <p className="text-sm text-gray-700">{selectedItem.feature3}</p>
//                                             </div>
//                                         )}
//                                         {/* Feature 4 */}
//                                         {selectedItem.feature4 && (
//                                             <div className="flex items-start">
//                                                 <div className="mt-1 w-3 h-3 border border-gray-400 rounded-full mr-3 flex-shrink-0"></div>
//                                                 <p className="text-sm text-gray-700">{selectedItem.feature4}</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Footer Section - Fixed at bottom */}
//                         <div className="p-4 md:p-6 border-t shrink-0">
//                             {/* Quantity Selector */}
//                             <div className="flex items-center justify-center mb-4 md:mb-6">
//                                 <button
//                                     onClick={() => handleRemove(selectedItem.id)}
//                                     className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 text-xl md:text-2xl text-gray-600 rounded-full hover:bg-gray-50"
//                                 >
//                                     &minus;
//                                 </button>
//                                 <span className="text-lg md:text-xl font-semibold mx-4 md:mx-6 w-8 text-center">
//                                     {quantities[selectedItem.id] || 0}
//                                 </span>
//                                 <button
//                                     disabled
//                                     className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 text-gray-400 text-xl md:text-2xl rounded-full cursor-not-allowed"
//                                     title="Maximum quantity reached"
//                                 >
//                                     +
//                                 </button>
//                             </div>

//                             {/* Action Button */}
//                             <button
//                                 onClick={() => {
//                                     if (!quantities[selectedItem.id]) {
//                                         handleAdd(selectedItem.id);
//                                     }
//                                     setShowDetailModal(false);
//                                 }}
//                                 className={`w-full md:w-[305px] mx-auto py-3 md:py-3.5 flex items-center justify-center border ${quantities[selectedItem.id] ? 'border-gray-400 text-gray-400' : 'border-[#01788E] text-[#01788E]'} font-semibold rounded`}
//                             >
//                                 <span className="text-xl mr-2 font-medium">+</span>
//                                 {quantities[selectedItem.id] ? 'Already Added' : 'Add To Basket'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default ContentModal;