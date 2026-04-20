const Cover = ({ content }) => {
    return (
        <section
            className="relative w-full h-[130px] md:h-40 lg:h-[200px] bg-center bg-cover rounded-md overflow-hidden"
            style={{ backgroundImage: `url(${content.image})` }}
            aria-label={content.title}
        >
            {/* শুধু এই একটা div এর opacity পরিবর্তন করো */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "rgba(0,0,0,0.4)" }}
            />

            {/* Title */}
            <div className="absolute inset-0 flex items-center justify-center px-6">
                <h1 className="text-white text-2xl font-semibold text-center leading-tight drop-shadow-lg">
                    {content.title}
                </h1>
            </div>
        </section>
    );
};

export default Cover;



// main compoenent 
// const Cover = ({ content }) => {

//     return (
//         <section
//             className="relative w-full h-38 md:h-[130px] lg:h-[200px] bg-center -opacity-80 bg-cover rounded-md overflow-hidden"
//             style={{ backgroundImage: `url(${content.image})` }} 
//             aria-label={content.title}
//         >
//             <div className="absolute inset-0 bg-linear-to-b rounded-md" />
//             <div
//                 className="absolute inset-0 pointer-events-none rounded-md"
//                 style={{
//                     boxShadow: "inset 0 80px 120px rgba(0,0,0,0.35)",
//                 }}
//             />
//             <div className="absolute inset-0 flex items-center justify-center px-6">
//                 <h1 className="text-white text-2xl font-semibold text-center leading-tight drop-shadow-lg">
//                     {content.title}
//                 </h1>
//             </div>

//             <div className="absolute left-0 right-0 bottom-0 h-6 bg-linear-to-t from-black/30 to-transparent rounded-b-md" />
//         </section>
//     );
// };

// export default Cover;