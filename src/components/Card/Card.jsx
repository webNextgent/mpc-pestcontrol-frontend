import { useState, useEffect, useRef } from "react";
import { FaStar } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";
import useScrollLock from "../../hooks/useScrollLock";

const sliderImages = [
    "https://i.postimg.cc/kMRpgpBV/pexels-nikiemmert-27719617.jpg",
    "https://i.postimg.cc/qRRWwBJD/pexels-wilawan-pantukang-108390463-9588928.jpg",
    "https://i.postimg.cc/3rpQcRjZ/pexels-ekamelev-760086.jpg",
];

const Card = ({ service }) => {
    const { title, rated, totalBooking, des1, des2, des3 } = service;
    const [showModal, setShowModal] = useState(false);
    const [current, setCurrent] = useState(0);
    const touchStartX = useRef(null);
    const mouseStartX = useRef(null);
    const isDragging = useRef(false);
    const timerRef = useRef(null);
    useScrollLock(showModal, () => setShowModal(false));

    const total = sliderImages.length;

    const goTo = (index) => {
        setCurrent((index + total) % total);
    };

    const resetTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrent((c) => (c + 1) % total);
        }, 3000);
    };

    const prev = () => { goTo(current - 1); resetTimer(); };
    const next = () => { goTo(current + 1); resetTimer(); };

    // Auto slide
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setCurrent((c) => (c + 1) % total);
        }, 3000);
        return () => clearInterval(timerRef.current);
    }, [total]);

    // Touch handlers
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) next();
        else if (diff < -50) prev();
        touchStartX.current = null;
    };

    // Mouse drag handlers
    const handleMouseDown = (e) => {
        mouseStartX.current = e.clientX;
        isDragging.current = false;
    };

    const handleMouseMove = (e) => {
        if (mouseStartX.current === null) return;
        if (Math.abs(e.clientX - mouseStartX.current) > 5) {
            isDragging.current = true;
        }
    };

    const handleMouseUp = (e) => {
        if (mouseStartX.current === null) return;
        const diff = mouseStartX.current - e.clientX;
        if (isDragging.current) {
            if (diff > 50) next();
            else if (diff < -50) prev();
        }
        mouseStartX.current = null;
        isDragging.current = false;
    };

    const handleMouseLeave = () => {
        mouseStartX.current = null;
        isDragging.current = false;
    };

    return (
        <div className="overflow-hidden bg-white relative">
            {/* Image Slider */}
            <div
                className="relative w-full h-60 md:h-72 overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {/* Slides */}
                <div
                    className="flex h-full transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {sliderImages.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt={`${title} ${i + 1}`}
                            className="min-w-full h-full object-cover pointer-events-none"
                        />
                    ))}
                </div>

                {/* Progress Bar */}
               <div className="absolute bottom-0 left-0 w-full flex gap-1.5 px-6 pb-3.5 z-10">
    {sliderImages.map((_, i) => (
        <div
            key={i}
            onClick={(e) => { e.stopPropagation(); goTo(i); resetTimer(); }}
            className="flex-1 h-[5px] rounded-full cursor-pointer"
            style={{ backgroundColor: "rgba(1, 120, 142, 0.25)" }}
        >
            <div
                className="h-full rounded-full"
                style={{
                    width: i === current ? "100%" : "0%",
                    backgroundColor: "#01788E",
                    transition: "width 0.4s ease",
                }}
            />
        </div>
    ))}
</div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 w-full bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A] mt-1">
                            {title}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <FaStar className="text-amber-400 text-xs md:text-sm" />
                            <span className="text-sm md:text-sm font-semibold text-gray-700">{rated}/5</span>
                            <span className="text-xs md:text-sm text-gray-400">({totalBooking})</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="p-1.5 rounded-full hover:bg-[#e8f4f6] transition-colors"
                    >
                        <IoInformationCircleOutline className="text-2xl md:text-3xl text-[#01788E]" />
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    onClick={() => setShowModal(false)}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded w-full max-w-md shadow-xl relative overflow-hidden"
                    >
                        <div className="bg-[#01788E] px-5 py-4 flex items-center justify-between">
                            <h2 className="text-base md:text-lg font-semibold text-white">
                                What&apos;s included
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="px-5 pt-4 pb-2">
                            <p className="text-xs font-semibold text-[#01788E] uppercase tracking-wider">
                                Our {title} service includes:
                            </p>
                        </div>

                        <ul className="px-5 pb-5 space-y-2.5">
                            {[des1, des2, des3].filter(Boolean).map((desc, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <span className="mt-1 w-4 h-4 rounded-full bg-[#e8f4f6] flex items-center justify-center shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#01788E] block" />
                                    </span>
                                    <span className="text-sm md:text-base text-gray-600 leading-snug">{desc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Card;






// main component code 
// import { useState } from "react";
// import { FaStar } from "react-icons/fa";
// import { IoInformationCircleOutline } from "react-icons/io5";
// import useScrollLock from "../../hooks/useScrollLock";

// const Card = ({ service }) => {
//     const { image, title, rated, totalBooking, des1, des2, des3 } = service;
//     const [showModal, setShowModal] = useState(false);
//     useScrollLock(showModal, () => setShowModal(false));

//     return (
//         <div className="overflow-hidden bg-white relative">
//             {/* Image */}
//             <img
//                 className="object-cover w-full h-80 md:h-64"
//                 src={image}
//                 alt={title}
//             />

//             {/* Content */}
//             <div className="p-4 md:p-6 absolute md:relative top-[220px] md:top-0 rounded-t-3xl md:rounded-t-none w-full bg-white">
//                 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
//                     <div>
//                         <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A] mt-1">
//                             {title}
//                         </h2>
//                         <div className="flex items-center gap-1.5 mt-1">
//                             <FaStar className="text-amber-400 text-xs md:text-sm" />
//                             <span className="text-sm md:text-sm font-semibold text-gray-700">{rated}/5</span>
//                             <span className="text-xs md:text-sm text-gray-400">({totalBooking} bookings)</span>
//                         </div>
//                     </div>

//                     {/* Info Icon */}
//                     <button
//                         onClick={() => setShowModal(true)}
//                         className="p-1.5 rounded-full hover:bg-[#e8f4f6] transition-colors"
//                     >
//                         <IoInformationCircleOutline className="text-2xl md:text-3xl text-[#01788E]" />
//                     </button>
//                 </div>
//             </div>

//             {/* Modal */}
//             {showModal && (
//                 <div
//                     onClick={() => setShowModal(false)}
//                     className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//                 >
//                     <div
//                         onClick={(e) => e.stopPropagation()}
//                         className="bg-white rounded w-full max-w-md shadow-xl relative overflow-hidden"
//                     >
//                         {/* Modal Header */}
//                         <div className="bg-[#01788E] px-5 py-4 flex items-center justify-between">
//                             <h2 className="text-base md:text-lg font-semibold text-white">
//                                 What&apos;s included
//                             </h2>
//                             <button
//                                 onClick={() => setShowModal(false)}
//                                 className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-xl leading-none"
//                             >
//                                 ×
//                             </button>
//                         </div>

//                         {/* Service Title */}
//                         <div className="px-5 pt-4 pb-2">
//                             <p className="text-xs font-semibold text-[#01788E] uppercase tracking-wider">
//                                 Our {title} service includes:
//                             </p>
//                         </div>

//                         {/* List */}
//                         <ul className="px-5 pb-5 space-y-2.5">
//                             {[des1, des2, des3].filter(Boolean).map((desc, i) => (
//                                 <li key={i} className="flex items-start gap-2.5">
//                                     <span className="mt-1 w-4 h-4 rounded-full bg-[#e8f4f6] flex items-center justify-center shrink-0">
//                                         <span className="w-1.5 h-1.5 rounded-full bg-[#01788E] block" />
//                                     </span>
//                                     <span className="text-sm md:text-base text-gray-600 leading-snug">{desc}</span>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Card;