/* eslint-disable react-hooks/exhaustive-deps */
import { FaCalendarAlt } from "react-icons/fa";
import { MdOutlineWatchLater } from "react-icons/md";
import { PiBookThin } from "react-icons/pi";
import { SlHandbag } from "react-icons/sl";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BookingCard from "../components/BookingCard/BookingCard";
import useAxiosSecure from "../hooks/useAxiosSecure";

export default function UserBooking() {
  const [activeTab, setActiveTab] = useState("All"); // "All" as default
  const [filteredData, setFilteredData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const axiosSecure = useAxiosSecure();

  const tabs = [
    { id: "All", label: "All Booking", icon: <PiBookThin /> },
    { id: "Requested", label: "Requested", icon: <PiBookThin /> },
    { id: "Pending", label: "Pending", icon: <PiBookThin /> },
    { id: "Delivered", label: "Delivered", icon: <MdOutlineWatchLater /> },
    { id: "Cancelled", label: "Cancelled", icon: <MdOutlineWatchLater /> },
  ];

  const { data: booking = {}, isLoading } = useQuery({
    queryKey: ["bookingUser"],
    queryFn: async () => {
      const res = await axiosSecure.get("/booking/my-booking");
      return res.data;
    },
  });

  const bookingData = booking?.Data || [];
  console.log("Booking Data:", bookingData);

  // Filter when tab changes or data loads
  useEffect(() => {
    if (!bookingData.length) {
      setFilteredData([]);
      return;
    }

    setTabLoading(true);

    const timeout = setTimeout(() => {
      let result = [];

      if (activeTab === "All") {
        // For "All" tab, show all bookings
        result = bookingData;
      } else {
        // For other tabs, filter by status (case-insensitive)
        result = bookingData.filter(
          (b) => b.status?.toLowerCase() === activeTab.toLowerCase()
        );
      }

      setFilteredData(result);
      setTabLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [activeTab, bookingData]);

  // Set initial filtered data when component mounts
  useEffect(() => {
    if (bookingData.length > 0) {
      setFilteredData(bookingData);
    }
  }, [bookingData]);

  return (
    <div className="border border-[#E5E7EB] px-2 md:px-6 py-4 rounded-lg bg-white w-full max-w-4xl mx-auto">
      <h2 className="flex items-center gap-2.5 text-xl font-semibold border-b border-[#E5E7EB] pb-3 text-[#5D4F52]">
        <FaCalendarAlt className="text-[#01788E]" /> My Bookings
      </h2>

      <div className="mt-10 flex flex-col items-center">
        <nav
          className="hide-scroll-shadow no-scrollbar flex flex-nowrap items-center gap-3 w-full overflow-x-auto px-2 justify-start md:justify-center overflow-scroll"
        >
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
            filteredData.map((item) => (
              <BookingCard key={item.id || item._id} item={item} />
            ))}
        </div>
      </div>
    </div>
  );
}