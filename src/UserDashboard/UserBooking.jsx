/* eslint-disable react-hooks/exhaustive-deps */
import { FaCalendarAlt } from "react-icons/fa";
import { PiBookThin } from "react-icons/pi";
import { SlHandbag } from "react-icons/sl";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BookingCard from "../components/BookingCard/BookingCard";
import useAxiosSecure from "../hooks/useAxiosSecure";

export default function UserBooking() {
  const [activeTab, setActiveTab] = useState("All");
  const [filteredData, setFilteredData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [paginatedData, setPaginatedData] = useState([]);
  const axiosSecure = useAxiosSecure();

  const tabs = [
    { id: "All", label: "All Booking", icon: <PiBookThin /> },
    { id: "Requested", label: "Requested", icon: <PiBookThin /> },
    { id: "Pending", label: "Pending", icon: <PiBookThin /> },
    { id: "Delivered", label: "Delivered", icon: <PiBookThin /> },
    { id: "Cancelled", label: "Cancelled", icon: <PiBookThin /> }
  ];

  const { data: booking = {}, isLoading } = useQuery({
    queryKey: ["bookingUser"],
    queryFn: async () => {
      const res = await axiosSecure.get("/booking/my-booking");
      return res.data;
    },
  });

  const bookingData = booking?.Data || [];

  // Filter when tab changes or data loads
  useEffect(() => {
    if (!bookingData.length) {
      setFilteredData([]);
      setCurrentPage(1);
      return;
    }

    setTabLoading(true);

    const timeout = setTimeout(() => {
      let result = [];

      if (activeTab === "All") {
        result = bookingData;
      } else {
        result = bookingData.filter(
          (b) => b.status?.toLowerCase() === activeTab.toLowerCase()
        );
      }

      setFilteredData(result);
      setCurrentPage(1);
      setTabLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [activeTab, bookingData]);

  // Pagination logic
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (filteredData.length === 0) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/60 w-full mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-700">
              {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-700">{filteredData.length}</span> bookings
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {pages.map(n => {
              const isVisible = totalPages <= 5 || n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1;
              const showDots = !isVisible && (n === 2 || n === totalPages - 1);
              if (showDots) return <span key={`dots-${n}`} className="px-1 text-gray-400 text-sm">…</span>;
              if (!isVisible) return null;
              return (
                <button
                  key={n}
                  onClick={() => handlePageChange(n)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg transition-colors border"
                  style={currentPage === n
                    ? { background: '#01788E', color: '#fff', borderColor: '#01788E' }
                    : { background: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }
                  }
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded bg-white w-full max-w-4xl mx-auto min-h-screen p-2 sm:p-4 md:p-4">
      <h2 className="flex items-center gap-2.5 text-xl font-semibold border-b border-[#E5E7EB] pb-3 text-[#5D4F52]">
        <FaCalendarAlt className="text-[#01788E]" /> My Bookings
      </h2>

      <div className="mt-5 md:mt-10 flex flex-col items-center">
        <nav className="hide-scroll-shadow no-scrollbar flex flex-nowrap items-center gap-3 w-full overflow-x-auto px-2 justify-start md:justify-center overflow-scroll">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 cursor-pointer text-[14px] rounded-3xl px-4 py-1 whitespace-nowrap transition
                ${activeTab === tab.id
                  ? "bg-[#01788E] text-white"
                  : "border border-[#01788E] text-[#5D4F52] bg-white"
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Loading State */}
        {(isLoading || tabLoading) && (
          <div className="mt-10 flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#01788E]"></div>
            <p className="mt-4 text-gray-500">Loading your bookings...</p>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && !tabLoading && filteredData.length === 0 && (
          <div className="border border-[#E5E7EB] rounded-md mt-10 w-full max-w-xl py-16 flex flex-col items-center text-center">
            <SlHandbag className="text-4xl text-[#5D4F52] mb-4" />
            <p className="font-semibold text-[#5D4F52] text-lg">
              No {activeTab === "All" ? "" : activeTab} bookings found!
            </p>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              {activeTab === "All"
                ? "You haven't made any bookings yet. Start booking services now!"
                : `You don't have any ${activeTab.toLowerCase()} bookings at the moment.`}
            </p>
          </div>
        )}

        {/* Bookings List */}
        <div className="mt-6 flex flex-col gap-4 w-full items-center">
          {!isLoading &&
            !tabLoading &&
            paginatedData.map((item) => (
              <BookingCard key={item.id || item._id} item={item} />
            ))}
        </div>

        {/* Pagination */}
        {!isLoading && !tabLoading && renderPagination()}
      </div>
    </div>
  );
};





// main component code 
// /* eslint-disable react-hooks/exhaustive-deps */
// // /* eslint-disable react-hooks/exhaustive-deps */
// import { FaCalendarAlt } from "react-icons/fa";
// import { MdOutlineWatchLater } from "react-icons/md";
// import { PiBookThin } from "react-icons/pi";
// import { SlHandbag } from "react-icons/sl";
// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import BookingCard from "../components/BookingCard/BookingCard";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import { IoChevronBack, IoChevronForward } from "react-icons/io5";

// export default function UserBooking() {
//   const [activeTab, setActiveTab] = useState("All");
//   const [filteredData, setFilteredData] = useState([]);
//   const [tabLoading, setTabLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5);
//   const [paginatedData, setPaginatedData] = useState([]);
//   const axiosSecure = useAxiosSecure();

//   const tabs = [
//     { id: "All", label: "All Booking", icon: <PiBookThin /> },
//     { id: "Requested", label: "Requested", icon: <PiBookThin /> },
//     { id: "Pending", label: "Pending", icon: <PiBookThin /> },
//     { id: "Delivered", label: "Delivered", icon: <PiBookThin /> },
//     { id: "Cancelled", label: "Cancelled", icon: <PiBookThin /> }
//   ];

//   const { data: booking = {}, isLoading } = useQuery({
//     queryKey: ["bookingUser"],
//     queryFn: async () => {
//       const res = await axiosSecure.get("/booking/my-booking");
//       return res.data;
//     },
//   });

//   const bookingData = booking?.Data || [];

//   // Filter when tab changes or data loads
//   useEffect(() => {
//     if (!bookingData.length) {
//       setFilteredData([]);
//       setCurrentPage(1);
//       return;
//     }

//     setTabLoading(true);

//     const timeout = setTimeout(() => {
//       let result = [];

//       if (activeTab === "All") {
//         result = bookingData;
//       } else {
//         result = bookingData.filter(
//           (b) => b.status?.toLowerCase() === activeTab.toLowerCase()
//         );
//       }

//       setFilteredData(result);
//       setCurrentPage(1);
//       setTabLoading(false);
//     }, 300);

//     return () => clearTimeout(timeout);
//   }, [activeTab, bookingData]);

//   // Pagination logic
//   useEffect(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     setPaginatedData(filteredData.slice(startIndex, endIndex));
//   }, [filteredData, currentPage, itemsPerPage]);

//   // Calculate total pages
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   // Handle page change
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Pagination component
//   const Pagination = () => {
//     if (totalPages <= 1) return null;

//     return (
//       <div className="flex items-center justify-center gap-2 mt-8 mb-4">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className={`p-2 rounded-lg border ${currentPage === 1
//               ? "border-gray-200 text-gray-400 cursor-not-allowed"
//               : "border-[#01788E] text-[#01788E] hover:bg-[#01788E] hover:text-white"
//             } transition`}
//         >
//           <IoChevronBack />
//         </button>

//         {[...Array(totalPages)].map((_, index) => {
//           const pageNumber = index + 1;
//           if (
//             pageNumber === 1 ||
//             pageNumber === totalPages ||
//             (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
//           ) {
//             return (
//               <button
//                 key={pageNumber}
//                 onClick={() => handlePageChange(pageNumber)}
//                 className={`w-10 h-10 rounded-lg border ${currentPage === pageNumber
//                     ? "bg-[#01788E] text-white border-[#01788E]"
//                     : "border-gray-300 text-gray-700 hover:bg-gray-100"
//                   } transition`}
//               >
//                 {pageNumber}
//               </button>
//             );
//           }
          
//           if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
//             return <span key={pageNumber} className="text-gray-500">...</span>;
//           }

//           return null;
//         })}

//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className={`p-2 rounded-lg border ${currentPage === totalPages
//               ? "border-gray-200 text-gray-400 cursor-not-allowed"
//               : "border-[#01788E] text-[#01788E] hover:bg-[#01788E] hover:text-white"
//             } transition`}
//         >
//           <IoChevronForward />
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="px-2 md:px-6 py-4 rounded-lg bg-white w-full max-w-4xl mx-auto">
//       <h2 className="flex items-center gap-2.5 text-xl font-semibold border-b border-[#E5E7EB] pb-3 text-[#5D4F52]">
//         <FaCalendarAlt className="text-[#01788E]" /> My Bookings
//       </h2>

//       <div className="mt-10 flex flex-col items-center">
//         <nav
//           className="hide-scroll-shadow no-scrollbar flex flex-nowrap items-center gap-3 w-full overflow-x-auto px-2 justify-start md:justify-center overflow-scroll"
//         >
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center gap-1 cursor-pointer text-[14px] rounded-3xl px-4 py-1 whitespace-nowrap transition
//                 ${activeTab === tab.id
//                   ? "bg-[#01788E] text-white"
//                   : "border border-[#01788E] text-[#5D4F52] bg-white"
//                 }`}
//             >
//               {tab.icon} {tab.label}
//             </button>
//           ))}
//         </nav>

//         {/* Results count */}
//         {!isLoading && !tabLoading && filteredData.length > 0 && (
//           <div className="w-full max-w-xl mt-4 text-sm text-gray-600">
//             Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} bookings
//           </div>
//         )}

//         {/* Loading State */}
//         {(isLoading || tabLoading) && (
//           <div className="mt-10 flex flex-col items-center">
//             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#01788E]"></div>
//             <p className="mt-4 text-gray-500">Loading your bookings...</p>
//           </div>
//         )}

//         {/* No Data State */}
//         {!isLoading && !tabLoading && filteredData.length === 0 && (
//           <div className="border border-[#E5E7EB] rounded-md mt-10 w-full max-w-xl py-16 flex flex-col items-center text-center">
//             <SlHandbag className="text-4xl text-[#5D4F52] mb-4" />
//             <p className="font-semibold text-[#5D4F52] text-lg">
//               No {activeTab === "All" ? "" : activeTab} bookings found!
//             </p>
//             <p className="text-sm text-gray-500 mt-2 max-w-xs">
//               {activeTab === "All"
//                 ? "You haven't made any bookings yet. Start booking services now!"
//                 : `You don't have any ${activeTab.toLowerCase()} bookings at the moment.`}
//             </p>
//           </div>
//         )}

//         {/* Bookings List */}
//         <div className="mt-6 flex flex-col gap-4 w-full items-center">
//           {!isLoading &&
//             !tabLoading &&
//             paginatedData.map((item) => (
//               <BookingCard key={item.id || item._id} item={item} />
//             ))}
//         </div>

//         {/* Pagination */}
//         {!isLoading && !tabLoading && filteredData.length > 0 && <Pagination />}
//       </div>
//     </div>
//   );
// };