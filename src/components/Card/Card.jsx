import { useState, useEffect, useRef } from "react";
import { FaStar } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import useScrollLock from "../../hooks/useScrollLock";

const sliderImages = [
    "https://i.postimg.cc/P5ttn3gR/33B44FFF-BC40-4862-9A06-F7763A59C59E.png",
    "https://i.postimg.cc/P5ttn3gR/33B44FFF-BC40-4862-9A06-F7763A59C59E.png",
    "https://i.postimg.cc/P5ttn3gR/33B44FFF-BC40-4862-9A06-F7763A59C59E.png",
];

const Card = ({ service }) => {
    const { title, rated, totalBooking, des1, des2, des3 } = service;
    const [showModal, setShowModal] = useState(false);
    const [current, setCurrent] = useState(0);
    const touchStartX = useRef(null);
    useScrollLock(showModal, () => setShowModal(false));

    const total = sliderImages.length;

    const prev = (e) => {
        e?.stopPropagation();
        setCurrent((c) => (c - 1 + total) % total);
    };

    const next = (e) => {
        e?.stopPropagation();
        setCurrent((c) => (c + 1) % total);
    };

    // Auto slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((c) => (c + 1) % total);
        }, 3000);
        return () => clearInterval(timer);
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

    return (
        <div className="overflow-hidden bg-white relative">
            {/* Image Slider */}
            <div
                className="relative w-full h-80 md:h-64 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
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
                            className="min-w-full h-full object-cover"
                        />
                    ))}
                </div>

                {/* Arrows */}
                <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center z-10"
                >
                    <MdChevronLeft className="text-xl text-gray-700" />
                </button>
                <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center z-10"
                >
                    <MdChevronRight className="text-xl text-gray-700" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {sliderImages.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                i === current ? "bg-white" : "bg-white/50"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 absolute md:relative top-[220px] md:top-0 rounded-t-3xl md:rounded-t-none w-full bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-[#1A1A1A] mt-1">
                            {title}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <FaStar className="text-amber-400 text-xs md:text-sm" />
                            <span className="text-sm md:text-sm font-semibold text-gray-700">{rated}/5</span>
                            <span className="text-xs md:text-sm text-gray-400">({totalBooking} bookings)</span>
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