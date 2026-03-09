import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { GoBrowser } from "react-icons/go";
import { IoAddOutline, IoCloseOutline, IoTimeOutline } from "react-icons/io5";
import { MdDateRange, MdAccessTime } from "react-icons/md";
import { FiCalendar, FiClock, FiTrash2 } from "react-icons/fi";
import { BsClock } from "react-icons/bs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";


const convertTo24Hour = (time12h) => {
    if (!time12h) return "";
    const parts = time12h.trim().split(' ');
    if (parts.length < 2) return time12h;
    const [time, period] = parts;
    const [hoursStr, minutes] = time.split(':');
    let hour = parseInt(hoursStr, 10);
    if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
};

const generateTimeOptions = () => {
    const times = new Set();
    for (let hour = 0; hour < 24; hour++) {
        for (const minute of ["00", "15", "30", "45"]) {
            let displayHour = hour % 12;
            if (displayHour === 0) displayHour = 12;
            const period = hour < 12 ? "AM" : "PM";
            times.add(`${displayHour}:${minute} ${period}`);
        }
    }
    return [...times].sort((a, b) => convertTo24Hour(a).localeCompare(convertTo24Hour(b)));
};

const timeOptions = generateTimeOptions();

// ─── Custom DatePicker Input ──────────────────────────────────────────────────
const CustomDateInput = React.forwardRef(({ value, onClick, onChange, placeholder }, ref) => (
    <div className="relative">
        <input
            type="text"
            style={{ borderColor: '#d1d5db' }}
            className="w-full px-3 py-3 border rounded-xl bg-white text-gray-900 font-medium text-sm pr-10 outline-none transition-all focus:ring-2"
            onFocus={e => { e.target.style.borderColor = '#01788E'; e.target.style.boxShadow = '0 0 0 2px rgba(1,120,142,0.2)'; }}
            onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
            value={value}
            onClick={onClick}
            onChange={onChange}
            placeholder={placeholder}
            ref={ref}
            readOnly
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" onClick={onClick}>
            <FiCalendar className="text-base" />
        </div>
    </div>
));
CustomDateInput.displayName = "CustomDateInput";

// ─── Time Picker Dropdown (defined outside main component to avoid remount) ──
const TimeDropdown = ({ index, type, timeSlots, onSelect }) => (
    <div
        data-timepicker
        className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
    >
        <div className="px-3 py-2 border-b border-gray-100" style={{ background: 'rgba(1,120,142,0.06)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#01788E' }}>
                {type === 'start' ? 'Start' : 'End'} Time
            </p>
        </div>
        <div className="max-h-44 overflow-y-auto">
            {timeOptions.map((opt, idx) => {
                const isSelected = timeSlots[index]?.[type] === opt;
                return (
                    <div
                        key={idx}
                        className="px-3 py-2 cursor-pointer text-sm transition-colors"
                        style={isSelected
                            ? { background: 'rgba(1,120,142,0.08)', color: '#01788E', fontWeight: 600 }
                            : { color: '#374151' }
                        }
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onSelect(index, type, opt);
                        }}
                    >
                        {opt}
                    </div>
                );
            })}
        </div>
    </div>
);


// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDateTime = () => {
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);
    const [appliedRecords, setAppliedRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState({ index: null, type: null });
    const axiosSecure = useAxiosSecure();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const addSlot = () => setTimeSlots(prev => [...prev, { start: "", end: "" }]);

    const updateSlot = (index, field, value) => {
        setTimeSlots(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
        setShowTimePicker({ index: null, type: null });
    };

    const removeSlot = (index) => setTimeSlots(prev => prev.filter((_, i) => i !== index));

    // ── API Handlers ──
    const fetchDateTimeData = useCallback(async () => {
        try {
            const res = await axiosSecure.get(`/date-time`);
            if (res?.data?.success) {
                setAppliedRecords(res?.data?.Data || []);
            }
        } catch (error) {
            console.error("GET Error:", error);
        }
    }, [axiosSecure]);

    useEffect(() => { fetchDateTimeData(); }, [fetchDateTimeData]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('[data-timepicker]')) {
                setShowTimePicker({ index: null, type: null });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleApply = async () => {
        if (!fromDate || !toDate) return toast.error("Please select both start and end dates");
        if (timeSlots.length === 0) return toast.error("Please add at least one time slot");

        const invalidSlots = timeSlots.filter(s => !s.start || !s.end);
        if (invalidSlots.length > 0) return toast.error("Please fill in all time slots");

        for (const slot of timeSlots) {
            const s = convertTo24Hour(slot.start);
            const e = convertTo24Hour(slot.end);
            if (s >= e) return toast.error(`"${slot.start}" must be before "${slot.end}"`);
        }

        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const payload = {
            startDate: formatDate(fromDate),
            endDate: formatDate(toDate),
            timeSlots: timeSlots.map(s => `${s.start} - ${s.end}`),
        };

        setIsLoading(true);
        try {
            const res = await axiosSecure.post('/date-time/create', payload);
            if (res?.data?.success) {
                toast.success('Time slots added successfully');
                setFromDate(null);
                setToDate(null);
                setTimeSlots([]);
                setCurrentPage(1);
                fetchDateTimeData();
            } else {
                toast.error(res?.data?.message || "Failed to add time slots");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Data Grouping ──
    const getGroupedData = useCallback(() => {
        const grouped = {};
        appliedRecords.forEach((record) => {
            const slots = record.timeSlots || record.time || [];
            if (!Array.isArray(slots)) return;

            slots.forEach((slot) => {
                const dateKey = slot.date || record.startDate || record.date;
                if (!dateKey) return;

                if (!grouped[dateKey]) {
                    grouped[dateKey] = {
                        date: dateKey,
                        slots: [],
                        fullDate: new Date(dateKey).toLocaleDateString('en-US', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                        }),
                        recordId: record.id || record._id,
                        dayName: new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long' })
                    };
                }

                let startTime, endTime;
                if (typeof slot === 'string') {
                    [startTime, endTime] = slot.split(' - ');
                } else {
                    startTime = slot.startTime || slot.start;
                    endTime = slot.endTime || slot.end;
                }

                if (startTime && endTime) {
                    grouped[dateKey].slots.push({ startTime, endTime, display: `${startTime} - ${endTime}` });
                }
            });
        });

        return Object.values(grouped).sort((a, b) => {
            try { return new Date(a.date) - new Date(b.date); } catch { return 0; }
        });
    }, [appliedRecords]);

    const deleteTimeSlot = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#01788E",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) return;

        try {
            const res = await axiosSecure.delete(`/date-time/delete/${id}`);
            if (res?.data?.success) {
                toast.success("Configuration deleted");
                // Fetch fresh data and then adjust page
                const updatedGroups = groupedDates.filter(g => g.recordId !== id);
                const newTotalPages = Math.ceil(updatedGroups.length / itemsPerPage);
                if (currentPage > newTotalPages) setCurrentPage(Math.max(1, newTotalPages));
                fetchDateTimeData();
            } else {
                toast.error(res?.data?.message || "Failed to delete");
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    const groupedDates = getGroupedData();
    const totalPages = Math.ceil(groupedDates.length / itemsPerPage);
    const currentItems = groupedDates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const totalDays = fromDate && toDate
        ? Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1
        : 0;

    // ── Pagination ──
    const renderPagination = () => {
        if (groupedDates.length === 0) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs text-gray-500">
                        Showing{' '}
                        <span className="font-semibold text-gray-700">
                            {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, groupedDates.length)}
                        </span>{' '}
                        of <span className="font-semibold text-gray-700">{groupedDates.length}</span> dates
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
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
                                    onClick={() => setCurrentPage(n)}
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
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
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

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen p-2 sm:p-4 md:p-4">
            <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0" style={{ background: 'linear-gradient(135deg, #01788E, #015f70)' }}>
                            <GoBrowser className="text-base sm:text-xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">Date & Time Management</h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Configure available time slots for appointments</p>
                        </div>
                    </div>
                    <div className="self-start sm:self-auto px-3 py-1.5 rounded-lg border flex items-center gap-2"
                        style={{ background: 'rgba(1,120,142,0.07)', borderColor: 'rgba(1,120,142,0.2)' }}>
                        <BsClock style={{ color: '#01788E' }} className="text-sm" />
                        <span className="text-xs sm:text-sm font-semibold" style={{ color: '#01788E' }}>
                            {groupedDates.length} {groupedDates.length === 1 ? 'Date' : 'Dates'} Configured
                        </span>
                    </div>
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left — Configuration */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(1,120,142,0.1)' }}>
                                    <MdDateRange className="text-base" style={{ color: '#01788E' }} />
                                </div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Configure Time Slots</h2>
                            </div>

                            <div className="p-4 sm:p-6 space-y-6">

                                {/* Date Range */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <FiCalendar className="text-gray-400" /> Date Range
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                            <DatePicker
                                                selected={fromDate}
                                                onChange={setFromDate}
                                                selectsStart
                                                startDate={fromDate}
                                                endDate={toDate}
                                                minDate={new Date()}
                                                dateFormat="MM/dd/yyyy"
                                                placeholderText="MM/DD/YYYY"
                                                customInput={<CustomDateInput placeholder="MM/DD/YYYY" />}
                                                popperClassName="z-50"
                                                popperPlacement="bottom-start"
                                                isClearable
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                                            <DatePicker
                                                selected={toDate}
                                                onChange={setToDate}
                                                selectsEnd
                                                startDate={fromDate}
                                                endDate={toDate}
                                                minDate={fromDate || new Date()}
                                                dateFormat="MM/dd/yyyy"
                                                placeholderText="MM/DD/YYYY"
                                                customInput={<CustomDateInput placeholder="MM/DD/YYYY" />}
                                                popperClassName="z-50"
                                                popperPlacement="bottom-start"
                                                isClearable
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                            />
                                        </div>
                                    </div>
                                    {fromDate && toDate && (
                                        <div className="mt-2 px-3 py-2 rounded-lg border flex items-center gap-2"
                                            style={{ background: 'rgba(1,120,142,0.06)', borderColor: 'rgba(1,120,142,0.18)' }}>
                                            <FiCalendar className="shrink-0 text-xs" style={{ color: '#01788E' }} />
                                            <p className="text-xs font-medium" style={{ color: '#01788E' }}>
                                                {fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                {' → '}
                                                {toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {' · '}{totalDays} {totalDays === 1 ? 'day' : 'days'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Time Slots */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <FiClock className="text-gray-400" /> Time Slots
                                        </p>
                                        <button
                                            onClick={addSlot}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-xs font-semibold transition-all shadow-sm border"
                                            style={{ borderColor: '#01788E', color: '#01788E' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(1,120,142,0.06)'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                        >
                                            <IoAddOutline className="text-sm" />
                                            Add Slot
                                        </button>
                                    </div>

                                    <div className="space-y-2.5">
                                        {timeSlots.length === 0 ? (
                                            <div className="text-center py-8 sm:py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                                                    style={{ background: 'rgba(1,120,142,0.08)' }}>
                                                    <MdAccessTime className="text-2xl" style={{ color: '#01788E' }} />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500">No time slots added</p>
                                                <p className="text-xs text-gray-400 mt-1">Tap "Add Slot" to get started</p>
                                            </div>
                                        ) : (
                                            timeSlots.map((slot, index) => (
                                                <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-opacity-70 transition-colors"
                                                    style={{ '--tw-border-opacity': 1 }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(1,120,142,0.35)'}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                                                >
                                                    {/* Slot number badge */}
                                                    <div className="shrink-0 w-6 h-6 mt-7 rounded-full flex items-center justify-center"
                                                        style={{ background: 'rgba(1,120,142,0.12)' }}>
                                                        <span className="text-[10px] font-bold" style={{ color: '#01788E' }}>{index + 1}</span>
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {/* Start Time */}
                                                        <div className="space-y-1.5">
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Start</label>
                                                            <div className="relative" data-timepicker>
                                                                <input
                                                                    type="text"
                                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 cursor-pointer pr-9 outline-none transition-all"
                                                                    style={{ borderColor: showTimePicker.index === index && showTimePicker.type === 'start' ? '#01788E' : '#d1d5db' }}
                                                                    value={slot.start}
                                                                    onClick={() => setShowTimePicker(
                                                                        prev => (prev.index === index && prev.type === 'start')
                                                                            ? { index: null, type: null }
                                                                            : { index, type: 'start' }
                                                                    )}
                                                                    placeholder="Select time"
                                                                    readOnly
                                                                />
                                                                <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                                                                {showTimePicker.index === index && showTimePicker.type === 'start' && (
                                                                    <TimeDropdown index={index} type="start" timeSlots={timeSlots} onSelect={updateSlot} />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* End Time */}
                                                        <div className="space-y-1.5">
                                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">End</label>
                                                            <div className="relative" data-timepicker>
                                                                <input
                                                                    type="text"
                                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 cursor-pointer pr-9 outline-none transition-all"
                                                                    style={{ borderColor: showTimePicker.index === index && showTimePicker.type === 'end' ? '#01788E' : '#d1d5db' }}
                                                                    value={slot.end}
                                                                    onClick={() => setShowTimePicker(
                                                                        prev => (prev.index === index && prev.type === 'end')
                                                                            ? { index: null, type: null }
                                                                            : { index, type: 'end' }
                                                                    )}
                                                                    placeholder="Select time"
                                                                    readOnly
                                                                />
                                                                <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                                                                {showTimePicker.index === index && showTimePicker.type === 'end' && (
                                                                    <TimeDropdown index={index} type="end" timeSlots={timeSlots} onSelect={updateSlot} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => removeSlot(index)}
                                                        className="shrink-0 mt-7 p-1.5 text-gray-400 rounded-lg transition-colors"
                                                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                                                        title="Remove"
                                                    >
                                                        <IoCloseOutline className="text-lg" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleApply}
                                        disabled={isLoading || timeSlots.length === 0 || !fromDate || !toDate}
                                        className="w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md active:scale-[0.99]"
                                        style={{ background: 'linear-gradient(135deg, #01788E, #015f70)' }}
                                        onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'linear-gradient(135deg, #015f70, #014d5a)'; }}
                                        onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #01788E, #015f70)'}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Applying...
                                            </>
                                        ) : (
                                            <>
                                                <span>Apply Time Slots</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right — Stats & Preview */}
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="rounded-2xl p-4 sm:p-5 border"
                            style={{ background: 'linear-gradient(135deg, rgba(1,120,142,0.06), rgba(1,95,112,0.1))', borderColor: 'rgba(1,120,142,0.15)' }}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Overview</h3>
                            <div className="space-y-2.5">
                                {[
                                    {
                                        icon: <FiCalendar className="text-sm" style={{ color: '#01788E' }} />,
                                        bg: 'rgba(1,120,142,0.12)',
                                        label: "Selected Range",
                                        value: fromDate && toDate
                                            ? `${fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                            : "Not set"
                                    },
                                    {
                                        icon: <BsClock className="text-sm text-green-600" />,
                                        bg: 'rgba(22,163,74,0.1)',
                                        label: "Time Slots",
                                        value: `${timeSlots.length} slot${timeSlots.length !== 1 ? 's' : ''}`
                                    },
                                    {
                                        icon: <IoTimeOutline className="text-sm text-purple-600" />,
                                        bg: 'rgba(147,51,234,0.1)',
                                        label: "Total Days",
                                        value: `${totalDays} day${totalDays !== 1 ? 's' : ''}`
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-white/80 shadow-sm">
                                        <div className="p-1.5 rounded-lg shrink-0" style={{ background: item.bg }}>{item.icon}</div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500">{item.label}</p>
                                            <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Slot Preview */}
                        {timeSlots.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                                    <FiClock className="text-gray-400" /> Preview
                                </h3>
                                <div className="space-y-2">
                                    {timeSlots.map((slot, index) => (
                                        <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#01788E' }} />
                                                <span className="text-xs sm:text-sm font-medium text-gray-800">
                                                    {slot.start && slot.end
                                                        ? `${slot.start} – ${slot.end}`
                                                        : <span className="text-gray-400 italic">Incomplete</span>}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium shrink-0">#{index + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Records Table ── */}
                {groupedDates.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <div className="p-1.5 bg-gray-100 rounded-lg">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                Configured Slots
                            </h2>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start sm:self-auto">
                                {groupedDates.length} total dates
                            </span>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        {['Date', 'Time Slots', 'Total', 'Status', 'Actions'].map(h => (
                                            <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-3 px-4">
                                                <p className="text-sm font-semibold text-gray-900">{item.fullDate}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{item.dayName}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                    {item.slots.map((slot, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border"
                                                            style={{ background: 'rgba(1,120,142,0.07)', color: '#01788E', borderColor: 'rgba(1,120,142,0.2)' }}>
                                                            <span className="w-1 h-1 rounded-full" style={{ background: '#01788E' }} />
                                                            {slot.display}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                                    {item.slots.length} slots
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                    Active
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => deleteTimeSlot(item.recordId)}
                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 rounded-lg transition-colors border border-gray-200"
                                                    onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                                                >
                                                    <FiTrash2 className="text-xs" /> Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {currentItems.map((item, index) => (
                                <div key={index} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{item.fullDate}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{item.dayName}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                                                <span className="w-1 h-1 bg-green-500 rounded-full" /> Active
                                            </span>
                                            <button
                                                onClick={() => deleteTimeSlot(item.recordId)}
                                                className="p-1.5 text-gray-400 rounded-lg border border-gray-200 transition-colors"
                                                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <FiTrash2 className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.slots.map((slot, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border"
                                                style={{ background: 'rgba(1,120,142,0.07)', color: '#01788E', borderColor: 'rgba(1,120,142,0.2)' }}>
                                                <span className="w-1 h-1 rounded-full" style={{ background: '#01788E' }} />
                                                {slot.display}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400">{item.slots.length} time slots</p>
                                </div>
                            ))}
                        </div>

                        {renderPagination()}
                    </div>
                )}

                {/* ── Empty States ── */}
                {groupedDates.length === 0 && appliedRecords.length === 0 && (
                    <div className="text-center py-12 sm:py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(1,120,142,0.08), rgba(1,120,142,0.15))' }}>
                            <MdAccessTime className="text-3xl" style={{ color: '#01788E' }} />
                        </div>
                        <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-1">No Time Slots Configured</h4>
                        <p className="text-xs sm:text-sm text-gray-400 max-w-xs mx-auto mb-4">Configure your first date range and time slots to get started</p>
                        <div className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: '#01788E' }}>
                            <IoAddOutline /> Add your first configuration
                        </div>
                    </div>
                )}

                {groupedDates.length === 0 && appliedRecords.length > 0 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                        <div className="p-1.5 bg-yellow-100 rounded-lg shrink-0">
                            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-yellow-800 mb-1">Data Format Issue</h3>
                            <p className="text-xs text-yellow-700">Data loaded from API but couldn't be displayed. Check console for details.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDateTime;




// main component code 
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { GoBrowser } from "react-icons/go";
// import { IoAddOutline, IoTrashOutline, IoCloseOutline, IoTimeOutline } from "react-icons/io5";
// import { MdDateRange, MdAccessTime } from "react-icons/md";
// import { FiCalendar, FiClock, FiTrash2 } from "react-icons/fi";
// import { BsClock } from "react-icons/bs";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";

// // Helper functions outside component
// const convertTo24Hour = (time12h) => {
//     if (!time12h) return "";
//     const [time, period] = time12h.split(' ');
//     const [hours, minutes] = time.split(':');
//     let hour = parseInt(hours, 10);

//     if (period === 'PM' && hour < 12) hour += 12;
//     if (period === 'AM' && hour === 12) hour = 0;

//     return `${hour.toString().padStart(2, '0')}:${minutes}`;
// };

// const AdminDateTime = () => {
//     const [fromDate, setFromDate] = useState(null);
//     const [toDate, setToDate] = useState(null);
//     const [timeSlots, setTimeSlots] = useState([]);
//     const [appliedRecords, setAppliedRecords] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [showTimePicker, setShowTimePicker] = useState({ index: null, type: null });
//     const axiosSecure = useAxiosSecure();

//     // Pagination states
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(5);
//     const [totalItems, setTotalItems] = useState(0);

//     const addSlot = () => {
//         setTimeSlots([...timeSlots, { start: "", end: "" }]);
//     };

//     const updateSlot = (index, field, value) => {
//         const updated = [...timeSlots];
//         updated[index][field] = value;
//         setTimeSlots(updated);
//     };

//     const removeSlot = (index) => {
//         setTimeSlots(timeSlots.filter((_, i) => i !== index));
//     };

//     // Generate time options for 12-hour format
//     const generateTimeOptions = () => {
//         const times = [];

//         // Generate times with 15 minute intervals
//         for (let hour = 1; hour <= 12; hour++) {
//             for (let minute of ["00", "15", "30", "45"]) {
//                 times.push(`${hour}:${minute} AM`);
//                 times.push(`${hour}:${minute} PM`);
//             }
//         }

//         // Add 12:00 AM and 12:00 PM
//         times.push("12:00 AM");
//         times.push("12:00 PM");

//         // Sort by converting to 24h format first
//         return [...new Set(times)].sort((a, b) => {
//             const timeA = convertTo24Hour(a);
//             const timeB = convertTo24Hour(b);
//             return timeA.localeCompare(timeB);
//         });
//     };

//     const timeOptions = generateTimeOptions();

//     const handleApply = async () => {
//         if (!fromDate || !toDate) {
//             toast.error("Please select both start and end dates");
//             return;
//         }

//         if (timeSlots.length === 0) {
//             toast.error("Please add at least one time slot");
//             return;
//         }

//         // Validate all time slots
//         const invalidSlots = timeSlots.filter(slot => !slot.start || !slot.end);
//         if (invalidSlots.length > 0) {
//             toast.error("Please fill in all time slots");
//             return;
//         }

//         // Validate start time is before end time
//         for (const slot of timeSlots) {
//             const start24h = convertTo24Hour(slot.start);
//             const end24h = convertTo24Hour(slot.end);

//             if (start24h >= end24h) {
//                 toast.error("Start time must be before end time");
//                 return;
//             }
//         }

//         // Format dates for backend (YYYY-MM-DD)
//         const formatDateForBackend = (date) => {
//             if (!date) return "";
//             const d = new Date(date);
//             return d.toISOString().split('T')[0];
//         };

//         const startDate = formatDateForBackend(fromDate);
//         const endDate = formatDateForBackend(toDate);

//         // **এখন থেকে 12-hour format এ পাঠাবো (AM/PM)**
//         const formattedSlots = timeSlots.map(
//             (slot) => `${slot.start} - ${slot.end}`
//         );

//         const payload = {
//             startDate: startDate,
//             endDate: endDate,
//             timeSlots: formattedSlots,
//         };

//         setIsLoading(true);
//         try {
//             const res = await axiosSecure.post('/date-time/create', payload);

//             if (res?.data?.success) {
//                 toast.success('Time slots added successfully');
//                 // Reset form
//                 setFromDate(null);
//                 setToDate(null);
//                 setTimeSlots([]);
//                 // Reset to first page when new data is added
//                 setCurrentPage(1);
//                 // Refresh data
//                 fetchDateTimeData();
//             } else {
//                 toast.error(res?.message || "Failed to add time slots");
//             }
//         } catch (error) {
//             console.error("Error sending data:", error);
//             toast.error("Something went wrong");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const fetchDateTimeData = async () => {
//         try {
//             const res = await axiosSecure.get(`/date-time`);

//             if (res?.data?.success) {
//                 setAppliedRecords(res?.data?.Data || []);
//                 setTotalItems(res?.data?.Data?.length || 0);
//             }
//         } catch (error) {
//             console.error("GET Error:", error);
//         }
//     };

//     const deleteTimeSlot = async (id) => {
//         try {
//             Swal.fire({
//                 title: "Are you sure?",
//                 text: "You won't be able to revert this!",
//                 icon: "warning",
//                 showCancelButton: true,
//                 confirmButtonColor: "#3085d6",
//                 cancelButtonColor: "#d33",
//                 confirmButtonText: "Yes, delete it!"
//             }).then(async (result) => {
//                 if (result.isConfirmed) {
//                     try {
//                         const res = await axiosSecure.delete(`/date-time/delete/${id}`);
//                         if (res?.data?.success) {
//                             toast.success("Configuration deleted");
//                             // Adjust current page if needed after deletion
//                             const newTotal = totalItems - 1;
//                             const totalPages = Math.ceil(newTotal / itemsPerPage);
//                             if (currentPage > totalPages) {
//                                 setCurrentPage(Math.max(1, totalPages));
//                             }
//                             fetchDateTimeData();
//                         } else {
//                             toast.error(res?.message || "Failed to delete");
//                         }
//                     } catch (err) {
//                         toast.error('Something was wrong');
//                     }
//                 }
//             })
//         } catch (error) {
//             console.error("Delete Error:", error);
//             toast.error("Failed to delete");
//         }
//     };

//     useEffect(() => {
//         fetchDateTimeData();
//     }, []);

//     // Close time picker when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (showTimePicker.index !== null && !event.target.closest('.time-picker-dropdown')) {
//                 setShowTimePicker({ index: null, type: null });
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [showTimePicker]);

//     // Format date for display
//     const formatDate = (dateString) => {
//         if (!dateString) return "";
//         try {
//             const date = new Date(dateString);
//             return date.toLocaleDateString('en-US', {
//                 weekday: 'short',
//                 day: 'numeric',
//                 month: 'short',
//                 year: 'numeric'
//             });
//         } catch (error) {
//             return dateString;
//         }
//     };

//     // Custom input component for DatePicker with manual input capability
//     const CustomDateInput = React.forwardRef(({ value, onClick, onChange, placeholder }, ref) => (
//         <div className="relative">
//             <input
//                 type="text"
//                 className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 font-medium"
//                 value={value}
//                 onClick={onClick}
//                 onChange={onChange}
//                 placeholder={placeholder}
//                 ref={ref}
//             />
//             <div
//                 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
//                 onClick={onClick}
//             >
//                 <FiCalendar className="text-xl" />
//             </div>
//         </div>
//     ));

//     // Function to group time slots by date for table display
//     const getGroupedData = () => {
//         const grouped = {};

//         appliedRecords.forEach((record, recordIndex) => {
//             if (record.timeSlots && Array.isArray(record.timeSlots)) {
//                 record.timeSlots.forEach((slot, slotIndex) => {
//                     const dateKey = slot.date || record.startDate || record.date;

//                     if (!grouped[dateKey]) {
//                         grouped[dateKey] = {
//                             date: dateKey,
//                             slots: [],
//                             fullDate: formatDate(dateKey),
//                             recordId: record.id || record._id,
//                             dayName: new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long' })
//                         };
//                     }

//                     let startTime, endTime;

//                     if (typeof slot === 'string') {
//                         const [start, end] = slot.split(' - ');
//                         startTime = start;
//                         endTime = end;
//                     } else if (slot.startTime && slot.endTime) {
//                         startTime = slot.startTime;
//                         endTime = slot.endTime;
//                     } else if (slot.start && slot.end) {
//                         startTime = slot.start;
//                         endTime = slot.end;
//                     }

//                     if (startTime && endTime) {
//                         grouped[dateKey].slots.push({
//                             startTime,
//                             endTime,
//                             display: `${startTime} - ${endTime}`
//                         });
//                     }
//                 });
//             } else if (record.time && Array.isArray(record.time)) {
//                 record.time.forEach((slot, slotIndex) => {
//                     const dateKey = record.date || record.startDate;

//                     if (!grouped[dateKey]) {
//                         grouped[dateKey] = {
//                             date: dateKey,
//                             slots: [],
//                             fullDate: formatDate(dateKey),
//                             recordId: record.id || record._id,
//                             dayName: new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long' })
//                         };
//                     }

//                     if (typeof slot === 'string') {
//                         const [start, end] = slot.split(' - ');
//                         grouped[dateKey].slots.push({
//                             startTime: start,
//                             endTime: end,
//                             display: `${start} - ${end}`
//                         });
//                     }
//                 });
//             }
//         });

//         // Convert to array and sort by date
//         return Object.values(grouped).sort((a, b) => {
//             try {
//                 return new Date(a.date) - new Date(b.date);
//             } catch (error) {
//                 return 0;
//             }
//         });
//     };

//     const groupedDates = getGroupedData();
    
//     // Pagination logic
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentItems = groupedDates.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(groupedDates.length / itemsPerPage);

//     // Pagination component
//     const Pagination = () => {
//         const pageNumbers = [];
//         for (let i = 1; i <= totalPages; i++) {
//             pageNumbers.push(i);
//         }

//         const renderPageNumbers = () => {
//             const pageItems = [];
//             const maxVisiblePages = 5; // Show maximum 5 page numbers
            
//             if (totalPages <= maxVisiblePages) {
//                 // Show all pages if total pages is less than or equal to max visible
//                 pageNumbers.forEach(number => {
//                     pageItems.push(
//                         <button
//                             key={number}
//                             onClick={() => setCurrentPage(number)}
//                             className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
//                                 currentPage === number
//                                     ? 'bg-blue-600 text-white'
//                                     : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
//                             }`}
//                         >
//                             {number}
//                         </button>
//                     );
//                 });
//             } else {
//                 // Show first page
//                 pageItems.push(
//                     <button
//                         key={1}
//                         onClick={() => setCurrentPage(1)}
//                         className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
//                             currentPage === 1
//                                 ? 'bg-blue-600 text-white'
//                                 : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
//                         }`}
//                     >
//                         1
//                     </button>
//                 );

//                 // Show dots if current page is > 3
//                 if (currentPage > 3) {
//                     pageItems.push(
//                         <span key="dots1" className="px-2 py-2 text-gray-500">
//                             ...
//                         </span>
//                     );
//                 }

//                 // Show pages around current page
//                 for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
//                     if (i > 1 && i < totalPages) {
//                         pageItems.push(
//                             <button
//                                 key={i}
//                                 onClick={() => setCurrentPage(i)}
//                                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
//                                     currentPage === i
//                                         ? 'bg-blue-600 text-white'
//                                         : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
//                                 }`}
//                             >
//                                 {i}
//                             </button>
//                         );
//                     }
//                 }

//                 // Show dots if current page is < totalPages - 2
//                 if (currentPage < totalPages - 2) {
//                     pageItems.push(
//                         <span key="dots2" className="px-2 py-2 text-gray-500">
//                             ...
//                         </span>
//                     );
//                 }

//                 // Show last page
//                 if (totalPages > 1) {
//                     pageItems.push(
//                         <button
//                             key={totalPages}
//                             onClick={() => setCurrentPage(totalPages)}
//                             className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
//                                 currentPage === totalPages
//                                     ? 'bg-blue-600 text-white'
//                                     : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
//                             }`}
//                         >
//                             {totalPages}
//                         </button>
//                     );
//                 }
//             }

//             return pageItems;
//         };

//         if (groupedDates.length === 0) return null;

//         return (
//             <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                     <div className="text-sm text-gray-600">
//                         Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
//                         <span className="font-medium">
//                             {Math.min(indexOfLastItem, groupedDates.length)}
//                         </span>{' '}
//                         of <span className="font-medium">{groupedDates.length}</span> results
//                     </div>
                    
//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                             disabled={currentPage === 1}
//                             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                         >
//                             Previous
//                         </button>
                        
//                         <div className="flex items-center gap-1">
//                             {renderPageNumbers()}
//                         </div>
                        
//                         <button
//                             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                             disabled={currentPage === totalPages}
//                             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                         <div className="flex items-center gap-3">
//                             <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
//                                 <GoBrowser className="text-xl text-white" />
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl md:text-3xl font-font-semibold text-gray-900">Date & Time Management</h1>
//                                 <p className="text-gray-600 mt-1">Configure available time slots for appointments</p>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-3">
//                             <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
//                                 <div className="flex items-center gap-2">
//                                     <BsClock className="text-blue-600" />
//                                     <span className="text-sm font-medium text-blue-700">
//                                         {groupedDates.length} {groupedDates.length === 1 ? 'Date' : 'Dates'}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Left Panel - Configuration */}
//                     <div className="lg:col-span-2 space-y-6">
//                         {/* Configuration Card */}
//                         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//                             <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                 <div className="flex items-center gap-2.5">
//                                     <div className="p-2 bg-blue-100 rounded-lg">
//                                         <MdDateRange className="text-lg text-blue-600" />
//                                     </div>
//                                     <h2 className="text-xl font-semifont-semibold text-gray-900">Configure Time Slots</h2>
//                                 </div>
//                             </div>

//                             <div className="p-6">
//                                 {/* Date Range */}
//                                 <div className="mb-8">
//                                     <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
//                                         <FiCalendar className="text-gray-500" />
//                                         Date Range
//                                     </h3>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                                         <div className="space-y-2.5">
//                                             <label className="block text-sm font-medium text-gray-700">
//                                                 Start Date
//                                             </label>
//                                             <DatePicker
//                                                 selected={fromDate}
//                                                 onChange={(date) => setFromDate(date)}
//                                                 selectsStart
//                                                 startDate={fromDate}
//                                                 endDate={toDate}
//                                                 minDate={new Date()}
//                                                 dateFormat="MM/dd/yyyy"
//                                                 placeholderText="MM/DD/YYYY"
//                                                 customInput={
//                                                     <CustomDateInput
//                                                         placeholder="MM/DD/YYYY"
//                                                     />
//                                                 }
//                                                 popperClassName="z-50"
//                                                 popperPlacement="bottom-start"
//                                                 isClearable
//                                                 showMonthDropdown
//                                                 showYearDropdown
//                                                 dropdownMode="select"
//                                             />
//                                         </div>

//                                         <div className="space-y-2.5">
//                                             <label className="block text-sm font-medium text-gray-700">
//                                                 End Date
//                                             </label>
//                                             <DatePicker
//                                                 selected={toDate}
//                                                 onChange={(date) => setToDate(date)}
//                                                 selectsEnd
//                                                 startDate={fromDate}
//                                                 endDate={toDate}
//                                                 minDate={fromDate || new Date()}
//                                                 dateFormat="MM/dd/yyyy"
//                                                 placeholderText="MM/DD/YYYY"
//                                                 customInput={
//                                                     <CustomDateInput
//                                                         placeholder="MM/DD/YYYY"
//                                                     />
//                                                 }
//                                                 popperClassName="z-50"
//                                                 popperPlacement="bottom-start"
//                                                 isClearable
//                                                 showMonthDropdown
//                                                 showYearDropdown
//                                                 dropdownMode="select"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Time Slots */}
//                                 <div className="mb-8">
//                                     <div className="flex items-center justify-between mb-4">
//                                         <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
//                                             <FiClock className="text-gray-500" />
//                                             Time Slots (12-hour format)
//                                         </h3>
//                                         <button
//                                             onClick={addSlot}
//                                             className="flex items-center gap-2 px-4 py-2.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow"
//                                         >
//                                             <IoAddOutline className="text-lg" />
//                                             Add Slot
//                                         </button>
//                                     </div>

//                                     <div className="space-y-3">
//                                         {timeSlots.map((slot, index) => (
//                                             <div key={index} className="relative flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors group">
//                                                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
//                                                     {/* Start Time */}
//                                                     <div className="space-y-1.5">
//                                                         <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                                             Start Time
//                                                         </label>
//                                                         <div className="relative">
//                                                             <input
//                                                                 type="text"
//                                                                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 cursor-pointer"
//                                                                 value={slot.start}
//                                                                 onClick={() => setShowTimePicker({
//                                                                     index,
//                                                                     type: 'start',
//                                                                     open: true
//                                                                 })}
//                                                                 placeholder="Click to select time"
//                                                                 readOnly
//                                                             />
//                                                             <div
//                                                                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
//                                                                 onClick={() => setShowTimePicker({
//                                                                     index,
//                                                                     type: 'start',
//                                                                     open: true
//                                                                 })}
//                                                             >
//                                                                 <FiClock className="text-lg" />
//                                                             </div>

//                                                             {/* Time Picker Dropdown for Start Time */}
//                                                             {showTimePicker.index === index && showTimePicker.type === 'start' && (
//                                                                 <div className="absolute left-0 right-0 top-full mt-1 z-10 time-picker-dropdown">
//                                                                     <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                                                         <div className="p-2 border-b border-gray-200 bg-gray-50">
//                                                                             <p className="text-xs text-gray-600 font-medium">Select Start Time</p>
//                                                                         </div>
//                                                                         <div className="max-h-48 overflow-y-auto">
//                                                                             {timeOptions.map((timeOption, idx) => (
//                                                                                 <div
//                                                                                     key={idx}
//                                                                                     className={`px-3 py-2 hover:bg-blue-50 cursor-pointer ${slot.start === timeOption ? 'bg-blue-100' : ''}`}
//                                                                                     onClick={() => {
//                                                                                         updateSlot(index, 'start', timeOption);
//                                                                                         setShowTimePicker({ index: null, type: null });
//                                                                                     }}
//                                                                                 >
//                                                                                     <span className="text-gray-800">{timeOption}</span>
//                                                                                 </div>
//                                                                             ))}
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     {/* End Time */}
//                                                     <div className="space-y-1.5">
//                                                         <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
//                                                             End Time
//                                                         </label>
//                                                         <div className="relative">
//                                                             <input
//                                                                 type="text"
//                                                                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 cursor-pointer"
//                                                                 value={slot.end}
//                                                                 onClick={() => setShowTimePicker({
//                                                                     index,
//                                                                     type: 'end',
//                                                                     open: true
//                                                                 })}
//                                                                 placeholder="Click to select time"
//                                                                 readOnly
//                                                             />
//                                                             <div
//                                                                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
//                                                                 onClick={() => setShowTimePicker({
//                                                                     index,
//                                                                     type: 'end',
//                                                                     open: true
//                                                                 })}
//                                                             >
//                                                                 <FiClock className="text-lg" />
//                                                             </div>

//                                                             {/* Time Picker Dropdown for End Time */}
//                                                             {showTimePicker.index === index && showTimePicker.type === 'end' && (
//                                                                 <div className="absolute left-0 right-0 top-full mt-1 z-10 time-picker-dropdown">
//                                                                     <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                                                         <div className="p-2 border-b border-gray-200 bg-gray-50">
//                                                                             <p className="text-xs text-gray-600 font-medium">Select End Time</p>
//                                                                         </div>
//                                                                         <div className="max-h-48 overflow-y-auto">
//                                                                             {timeOptions.map((timeOption, idx) => (
//                                                                                 <div
//                                                                                     key={idx}
//                                                                                     className={`px-3 py-2 hover:bg-blue-50 cursor-pointer ${slot.end === timeOption ? 'bg-blue-100' : ''}`}
//                                                                                     onClick={() => {
//                                                                                         updateSlot(index, 'end', timeOption);
//                                                                                         setShowTimePicker({ index: null, type: null });
//                                                                                     }}
//                                                                                 >
//                                                                                     <span className="text-gray-800">{timeOption}</span>
//                                                                                 </div>
//                                                                             ))}
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 </div>

//                                                 {timeSlots.length > 1 && (
//                                                     <button
//                                                         onClick={() => removeSlot(index)}
//                                                         className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                                                         title="Remove slot"
//                                                     >
//                                                         <IoCloseOutline className="text-xl" />
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         ))}

//                                         {timeSlots.length === 0 && (
//                                             <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
//                                                 <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
//                                                     <MdAccessTime className="text-3xl text-blue-400" />
//                                                 </div>
//                                                 <p className="text-gray-600 font-medium">No time slots added</p>
//                                                 <p className="text-sm text-gray-400 mt-1">Add your first time slot to get started</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Apply Button */}
//                                 <div className="pt-6 border-t border-gray-100">
//                                     <button
//                                         onClick={handleApply}
//                                         disabled={isLoading || timeSlots.length === 0 || !fromDate || !toDate}
//                                         className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semifont-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
//                                     >
//                                         {isLoading ? (
//                                             <>
//                                                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                                 Applying Slots...
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <span>Apply Time Slots</span>
//                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                                                 </svg>
//                                             </>
//                                         )}
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Panel - Preview */}
//                     <div className="space-y-6">
//                         {/* Stats Card */}
//                         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
//                             <h3 className="text-lg font-semifont-semibold text-gray-900 mb-4">Quick Overview</h3>
//                             <div className="space-y-4">
//                                 <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
//                                     <div className="flex items-center gap-3">
//                                         <div className="p-2 bg-blue-100 rounded-lg">
//                                             <FiCalendar className="text-blue-600" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-gray-600">Selected Range</p>
//                                             <p className="font-semifont-semibold text-gray-900">
//                                                 {fromDate && toDate ? (
//                                                     <>
//                                                         {fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                                                     </>
//                                                 ) : (
//                                                     "Not set"
//                                                 )}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
//                                     <div className="flex items-center gap-3">
//                                         <div className="p-2 bg-green-100 rounded-lg">
//                                             <BsClock className="text-green-600" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-gray-600">Time Slots</p>
//                                             <p className="font-semifont-semibold text-gray-900">{timeSlots.length} slots</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
//                                     <div className="flex items-center gap-3">
//                                         <div className="p-2 bg-purple-100 rounded-lg">
//                                             <IoTimeOutline className="text-purple-600" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-gray-600">Total Days</p>
//                                             <p className="font-semifont-semibold text-gray-900">
//                                                 {fromDate && toDate ? (
//                                                     Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1
//                                                 ) : 0} days
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Preview Slots */}
//                         {timeSlots.length > 0 && (
//                             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                                 <h3 className="text-lg font-semifont-semibold text-gray-900 mb-4">Preview (12-hour format)</h3>
//                                 <div className="space-y-3">
//                                     {timeSlots.map((slot, index) => (
//                                         <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                                                 <span className="font-medium text-gray-900">
//                                                     {slot.start} - {slot.end}
//                                                 </span>
//                                             </div>
//                                             <span className="text-sm text-gray-500">Slot {index + 1}</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
//                                     <p className="text-xs text-blue-700">
//                                         <span className="font-medium">Note:</span> Time slots will be sent to server in 12-hour format (AM/PM).
//                                     </p>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Applied Records Table with Pagination */}
//                 {groupedDates.length > 0 && (
//                     <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//                         <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-3">
//                                     <div className="p-2 bg-gray-100 rounded-lg">
//                                         <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                                         </svg>
//                                     </div>
//                                     <h2 className="text-xl font-semifont-semibold text-gray-900">Configured Time Slots (12-hour format)</h2>
//                                 </div>
//                                 <div className="text-sm text-gray-600">
//                                     Showing {currentItems.length} of {groupedDates.length} dates
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead>
//                                     <tr className="bg-gray-50">
//                                         <th className="py-4 px-6 text-left text-xs font-semifont-semibold text-gray-600 uppercase tracking-wider border-b">
//                                             <div className="flex items-center gap-2">
//                                                 <FiCalendar className="text-gray-500" />
//                                                 Date
//                                             </div>
//                                         </th>
//                                         <th className="py-4 px-6 text-left text-xs font-semifont-semibold text-gray-600 uppercase tracking-wider border-b">
//                                             <div className="flex items-center gap-2">
//                                                 <BsClock className="text-gray-500" />
//                                                 Time Slots
//                                             </div>
//                                         </th>
//                                         <th className="py-4 px-6 text-left text-xs font-semifont-semibold text-gray-600 uppercase tracking-wider border-b">
//                                             Total
//                                         </th>
//                                         <th className="py-4 px-6 text-left text-xs font-semifont-semibold text-gray-600 uppercase tracking-wider border-b">
//                                             Status
//                                         </th>
//                                         <th className="py-4 px-6 text-left text-xs font-semifont-semibold text-gray-600 uppercase tracking-wider border-b">
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-200">
//                                     {currentItems.map((item, index) => (
//                                         <tr key={index} className="hover:bg-gray-50/50 transition-colors">
//                                             <td className="py-4 px-6">
//                                                 <div className="space-y-1">
//                                                     <div className="text-sm font-semifont-semibold text-gray-900">
//                                                         {item.fullDate}
//                                                     </div>
//                                                     <div className="text-xs text-gray-500">
//                                                         {item.dayName}
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="py-4 px-6">
//                                                 <div className="flex flex-wrap gap-2 max-w-md">
//                                                     {item.slots.map((slot, idx) => (
//                                                         <span
//                                                             key={idx}
//                                                             className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
//                                                         >
//                                                             <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
//                                                             {slot.display || `${slot.startTime} - ${slot.endTime}`}
//                                                         </span>
//                                                     ))}
//                                                 </div>
//                                             </td>
//                                             <td className="py-4 px-6">
//                                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                                                     {item.slots.length} slots
//                                                 </span>
//                                             </td>
//                                             <td className="py-4 px-6">
//                                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                                                     <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
//                                                     Active
//                                                 </span>
//                                             </td>
//                                             <td className="py-4 px-6">
//                                                 <button
//                                                     onClick={() => deleteTimeSlot(item.recordId)}
//                                                     className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-300 hover:border-red-200"
//                                                 >
//                                                     <FiTrash2 className="text-sm" />
//                                                     Remove
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Pagination Component */}
//                         <Pagination />
//                     </div>
//                 )}

//                 {groupedDates.length === 0 && appliedRecords.length === 0 && (
//                     <div className="mt-8 text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
//                         <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
//                             <MdAccessTime className="text-4xl text-blue-400" />
//                         </div>
//                         <h4 className="text-xl font-semifont-semibold text-gray-700 mb-2">No Time Slots Configured</h4>
//                         <p className="text-gray-500 max-w-md mx-auto mb-6">
//                             Configure your first date range and time slots to get started
//                         </p>
//                         <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
//                             <IoAddOutline className="text-lg" />
//                             <span>Add your first configuration</span>
//                         </div>
//                     </div>
//                 )}

//                 {groupedDates.length === 0 && appliedRecords.length > 0 && (
//                     <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
//                         <div className="flex items-center gap-3 mb-4">
//                             <div className="p-2 bg-yellow-100 rounded-lg">
//                                 <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                                 </svg>
//                             </div>
//                             <h3 className="text-lg font-semifont-semibold text-yellow-800">Data Format Issue</h3>
//                         </div>
//                         <p className="text-yellow-700 mb-3">
//                             Data is available from API but couldn't be displayed properly. Check the console for details.
//                         </p>
//                         <button
//                             className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
//                         >
//                             Check Console for Data
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AdminDateTime;