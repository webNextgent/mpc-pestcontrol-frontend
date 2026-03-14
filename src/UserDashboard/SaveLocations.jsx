/* eslint-disable no-unused-vars */
import { FiEdit3, FiTrash2, FiPlus, FiMapPin, FiHome, FiBriefcase, FiMap } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useSummary } from "../provider/SummaryProvider";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function SavedLocations() {
    const { getAddresses, removeAddress, setSaveAddress } = useSummary();
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedType, setSelectedType] = useState("Apartment");
    const buttons = ["Apartment", "Villa", "Office", "Other"];

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm({ mode: "onChange" });

    useEffect(() => {
        setSavedAddresses(getAddresses());
    }, [getAddresses]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    const formatDisplayAddress = (type, data) => {
        switch (type) {
            case "Apartment":
            case "Office":
                return `${data.apartmentNo || ''} - ${data.buildingName || ''} - ${data.area || ''} - ${data.city || ''}`;
            case "Villa":
                return `${data.villaNo || ''} - ${data.community || ''} - ${data.area || ''} - ${data.city || ''}`;
            case "Other":
                return `${data.otherNo || ''} - ${data.streetName || ''} - ${data.area || ''} - ${data.city || ''}`;
            default:
                return `${data.area || ''} - ${data.city || ''}`;
        }
    };

    const formatAddress = (item) => {
        if (item.displayAddress) return item.displayAddress;
        const parts = [];
        if (item.apartmentNo || item.villaNo || item.otherNo) parts.push(item.apartmentNo || item.villaNo || item.otherNo);
        if (item.buildingName || item.community || item.streetName) parts.push(item.buildingName || item.community || item.streetName);
        if (item.area) parts.push(item.area);
        if (item.city) parts.push(item.city);
        return parts.join(", ");
    };

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'apartment': case 'villa': case 'home':
                return <FiHome className="text-sm" style={{ color: '#01788E' }} />;
            case 'office':
                return <FiBriefcase className="text-sm text-blue-600" />;
            default:
                return <FiMapPin className="text-sm text-gray-500" />;
        }
    };

    const getTypeBadgeStyle = (type) => {
        switch (type?.toLowerCase()) {
            case 'apartment': case 'home':
                return { background: 'rgba(1,120,142,0.1)', color: '#01788E' };
            case 'villa':
                return { background: 'rgba(147,51,234,0.1)', color: '#7c3aed' };
            case 'office':
                return { background: 'rgba(59,130,246,0.1)', color: '#2563eb' };
            default:
                return { background: '#f3f4f6', color: '#4b5563' };
        }
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const onSubmit = (data) => {
        const finalData = {
            ...data,
            type: selectedType,
            displayAddress: formatDisplayAddress(selectedType, data),
            timestamp: new Date().toISOString()
        };

        if (modalMode === "edit" && selectedAddress?.id) {
            setSaveAddress(prev => {
                const updated = prev.map(addr =>
                    addr.id === selectedAddress.id
                        ? { ...addr, ...finalData, updatedAt: new Date().toISOString() }
                        : addr
                );
                localStorage.setItem("saveAddress", JSON.stringify(updated));
                return updated;
            });
        } else {
            const newAddress = {
                id: generateId(),
                ...finalData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setSaveAddress(prev => {
                const updated = [...prev, newAddress];
                localStorage.setItem("saveAddress", JSON.stringify(updated));
                return updated;
            });
        }

        handleCloseModal();
        setSavedAddresses(getAddresses());
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            removeAddress(id);
            setSavedAddresses(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleEdit = (address) => {
        setSelectedAddress(address);
        setSelectedType(address.type || "Apartment");
        setModalMode("edit");
        reset({
            city: address.city || "",
            area: address.area || "",
            buildingName: address.buildingName || "",
            apartmentNo: address.apartmentNo || "",
            community: address.community || "",
            villaNo: address.villaNo || "",
            streetName: address.streetName || "",
            otherNo: address.otherNo || "",
            nickname: address.nickname || "",
            additionalInfo: address.additionalInfo || ""
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedAddress(null);
        setSelectedType("Apartment");
        setModalMode("add");
        reset({ city: "", area: "", buildingName: "", apartmentNo: "", community: "", villaNo: "", streetName: "", otherNo: "", nickname: "", additionalInfo: "" });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAddress(null);
        setSelectedType("Apartment");
    };

    // ── Shared input class ────────────────────────────────────────────────────
    const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:border-[#01788E] focus:ring-1 focus:ring-[#01788E]/20";

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="px-2 md:px-6 py-4 rounded-lg bg-white w-full max-w-4xl mx-auto">

                {/* ── Header ── */}
                <h2 className="flex items-center gap-2.5 text-xl font-semibold border-b border-[#E5E7EB] pb-3 text-[#5D4F52]">
                    <FiMapPin className="text-[#01788E]" size={20} />
                    Saved Locations
                </h2>

                {/* ── Empty State ── */}
                {savedAddresses.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center py-16 border border-[#E5E7EB] rounded-md">
                        <FiMapPin size={40} className="text-gray-300 mb-4" />
                        <p className="font-semibold text-[#5D4F52] text-lg">No saved addresses yet</p>
                        <p className="text-sm text-gray-400 mt-2 max-w-xs text-center">
                            Save your frequently used addresses for faster booking
                        </p>
                        <button
                            onClick={handleAddNew}
                            className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold text-white transition-all active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #01788E, #015f70)' }}
                        >
                            <FiPlus size={16} /> Add Your First Address
                        </button>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-col gap-3">
                        {savedAddresses.map((item) => (
                            <div
                                key={item.id}
                                className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {/* Icon */}
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: 'rgba(1,120,142,0.08)' }}>
                                            {getTypeIcon(item.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {item.nickname || "Untitled Address"}
                                                </p>
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                    style={getTypeBadgeStyle(item.type)}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                                                {formatAddress(item)}
                                            </p>
                                            {item.additionalInfo && (
                                                <p className="text-xs text-gray-400 mt-1">📝 {item.additionalInfo}</p>
                                            )}
                                            {item.mapLatitude && item.mapLongitude && (
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                                                    <FiMap size={10} />
                                                    {item.mapLatitude.toFixed(4)}, {item.mapLongitude.toFixed(4)}
                                                </div>
                                            )}
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {item.updatedAt ? "Updated" : "Added"} on{" "}
                                                {new Date(item.updatedAt || item.createdAt || item.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                            style={{ color: '#01788E' }}
                                            title="Edit address"
                                        >
                                            <FiEdit3 size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                            title="Delete address"
                                        >
                                            <FiTrash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Address */}
                        <button
                            onClick={handleAddNew}
                            className="mt-2 w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#01788E]/30 rounded-xl py-3 text-sm font-medium hover:border-[#01788E] hover:bg-[#01788E]/5 transition-all duration-200"
                            style={{ color: '#01788E' }}
                        >
                            <FiPlus size={16} /> Add New Address
                        </button>
                    </div>
                )}

                {/* Quick Stats */}
                {savedAddresses.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                        You have{" "}
                        <span className="font-semibold" style={{ color: '#01788E' }}>{savedAddresses.length}</span>{" "}
                        saved address{savedAddresses.length !== 1 ? 'es' : ''}
                    </div>
                )}
            </div>

            {/* ── Modal ── */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] rounded-t-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Teal top strip */}
                        <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(to right, #01788E, #015f70)' }} />

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                                    {modalMode === "edit" ? "Edit Address" : "Add New Address"}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {modalMode === "edit" ? "Update your saved location" : "Save a new location"}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <IoClose className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                            {/* Type Tabs */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {buttons.map(btn => (
                                    <button
                                        key={btn}
                                        type="button"
                                        onClick={() => setSelectedType(btn)}
                                        className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0"
                                        style={selectedType === btn
                                            ? { background: '#01788E', color: '#fff', borderColor: '#01788E' }
                                            : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
                                    >
                                        {btn}
                                    </button>
                                ))}
                            </div>

                            {/* Nickname */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Nickname <span className="normal-case font-normal text-gray-400">(Optional)</span>
                                </label>
                                <input {...register("nickname")} type="text" placeholder="e.g. Home, Work..." className={inputCls} />
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    City <span className="text-red-400">*</span>
                                </label>
                                <input {...register("city", { required: "City is required" })} type="text" placeholder="Enter City" className={inputCls} />
                                {errors.city && <p className="text-red-500 text-[11px] mt-1">{errors.city.message}</p>}
                            </div>

                            {/* Area */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Area <span className="text-red-400">*</span>
                                </label>
                                <input {...register("area", { required: "Area is required" })} type="text" placeholder="Enter Area" className={inputCls} />
                                {errors.area && <p className="text-red-500 text-[11px] mt-1">{errors.area.message}</p>}
                            </div>

                            {/* Villa fields */}
                            {selectedType === "Villa" && (
                                <>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Community / Street <span className="text-red-400">*</span>
                                        </label>
                                        <input {...register("community", { required: "Community is required" })} type="text" placeholder="Enter Community / Street Name" className={inputCls} />
                                        {errors.community && <p className="text-red-500 text-[11px] mt-1">{errors.community.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Villa No. <span className="text-red-400">*</span>
                                        </label>
                                        <input {...register("villaNo", { required: "Villa number is required" })} type="text" placeholder="Enter Villa Number" className={inputCls} />
                                        {errors.villaNo && <p className="text-red-500 text-[11px] mt-1">{errors.villaNo.message}</p>}
                                    </div>
                                </>
                            )}

                            {/* Other fields */}
                            {selectedType === "Other" && (
                                <>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Street / Building Name <span className="text-red-400">*</span>
                                        </label>
                                        <input {...register("streetName", { required: "Street/Building name is required" })} type="text" placeholder="Enter Street / Building Name" className={inputCls} />
                                        {errors.streetName && <p className="text-red-500 text-[11px] mt-1">{errors.streetName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Apartment / Villa No. <span className="text-red-400">*</span>
                                        </label>
                                        <input {...register("otherNo", { required: "Number is required" })} type="text" placeholder="Enter Apartment / Villa No" className={inputCls} />
                                        {errors.otherNo && <p className="text-red-500 text-[11px] mt-1">{errors.otherNo.message}</p>}
                                    </div>
                                </>
                            )}

                            {/* Apartment / Office fields */}
                            {selectedType !== "Villa" && selectedType !== "Other" && (
                                <>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Building Name <span className="text-red-400">*</span>
                                        </label>
                                        <input {...register("buildingName", { required: "Building name is required" })} type="text" placeholder="Enter Building Name" className={inputCls} />
                                        {errors.buildingName && <p className="text-red-500 text-[11px] mt-1">{errors.buildingName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Apartment No. <span className="text-red-400">*</span>
                                        </label>
                                        <input {...register("apartmentNo", { required: "Apartment number is required" })} type="text" placeholder="Enter Apartment No" className={inputCls} />
                                        {errors.apartmentNo && <p className="text-red-500 text-[11px] mt-1">{errors.apartmentNo.message}</p>}
                                    </div>
                                </>
                            )}

                            {/* Additional Info */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Additional Info <span className="normal-case font-normal text-gray-400">(Optional)</span>
                                </label>
                                <textarea
                                    {...register("additionalInfo")}
                                    rows="2"
                                    placeholder="Floor, landmark, special instructions..."
                                    className={inputCls}
                                />
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="border-t border-gray-100 px-5 py-4 shrink-0 bg-white">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={!isValid}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: isValid ? 'linear-gradient(135deg, #01788E, #015f70)' : undefined }}
                                >
                                    {modalMode === "edit" ? "Update Address" : "Save Address"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};








// main component code 
// /* eslint-disable no-unused-vars */
// import { FiEdit3, FiTrash2, FiPlus, FiMapPin, FiHome, FiBriefcase, FiMap, FiX } from "react-icons/fi";
// import { useSummary } from "../provider/SummaryProvider";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";

// export default function SavedLocations() {
//     const { getAddresses, removeAddress, setSaveAddress } = useSummary();
//     const [savedAddresses, setSavedAddresses] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [modalMode, setModalMode] = useState("add");
//     const [selectedAddress, setSelectedAddress] = useState(null);
//     const [selectedType, setSelectedType] = useState("Apartment");
//     const buttons = ["Apartment", "Villa", "Office", "Other"];

//     const {
//         register,
//         handleSubmit,
//         reset,
//         setValue,
//         formState: { errors, isValid }
//     } = useForm({
//         mode: "onChange"
//     });

//     useEffect(() => {
//         const addresses = getAddresses();
//         setSavedAddresses(addresses);
//     }, [getAddresses]);

//     // Generate ID ফাংশন
//     const generateId = () => {
//         return Date.now().toString(36) + Math.random().toString(36).substr(2);
//     };

//     // Type পরিবর্তনের হ্যান্ডলার
//     const handleTypeChange = (type) => {
//         setSelectedType(type);
//     };

//     // Display address ফরম্যাট করুন
//     const formatDisplayAddress = (type, data) => {
//         switch (type) {
//             case "Apartment":
//             case "Office":
//                 return `${data.apartmentNo || ''} - ${data.buildingName || ''} - ${data.area || ''} - ${data.city || ''}`;
//             case "Villa":
//                 return `${data.villaNo || ''} - ${data.community || ''} - ${data.area || ''} - ${data.city || ''}`;
//             case "Other":
//                 return `${data.otherNo || ''} - ${data.streetName || ''} - ${data.area || ''} - ${data.city || ''}`;
//             default:
//                 return `${data.area || ''} - ${data.city || ''}`;
//         }
//     };

//     // Form সাবমিশন হ্যান্ডলার
//     const onSubmit = (data) => {
//         const finalData = {
//             ...data,
//             type: selectedType,
//             displayAddress: formatDisplayAddress(selectedType, data),
//             timestamp: new Date().toISOString()
//         };

//         if (modalMode === "edit" && selectedAddress?.id) {
//             // Update existing address
//             setSaveAddress(prev => {
//                 const updated = prev.map(addr =>
//                     addr.id === selectedAddress.id
//                         ? { ...addr, ...finalData, updatedAt: new Date().toISOString() }
//                         : addr
//                 );
//                 localStorage.setItem("saveAddress", JSON.stringify(updated));
//                 return updated;
//             });
//         } else {
//             // Add new address
//             const newAddress = {
//                 id: generateId(),
//                 ...finalData,
//                 createdAt: new Date().toISOString(),
//                 updatedAt: new Date().toISOString()
//             };

//             setSaveAddress(prev => {
//                 const updated = [...prev, newAddress];
//                 localStorage.setItem("saveAddress", JSON.stringify(updated));
//                 return updated;
//             });
//         }

//         // মডেল বন্ধ করুন এবং লিস্ট রিফ্রেশ করুন
//         handleCloseModal();
//         const addresses = getAddresses();
//         setSavedAddresses(addresses);
//     };

//     // Delete হ্যান্ডলার
//     const handleDelete = (id) => {
//         if (window.confirm("Are you sure you want to delete this address?")) {
//             removeAddress(id);
//             setSavedAddresses(prev => prev.filter(address => address.id !== id));
//         }
//     };

//     // Edit বাটনে ক্লিক করলে
//     const handleEdit = (address) => {
//         setSelectedAddress(address);
//         setSelectedType(address.type || "Apartment");
//         setModalMode("edit");

//         // ফর্ম ফিল করুন
//         reset({
//             city: address.city || "",
//             area: address.area || "",
//             buildingName: address.buildingName || "",
//             apartmentNo: address.apartmentNo || "",
//             community: address.community || "",
//             villaNo: address.villaNo || "",
//             streetName: address.streetName || "",
//             otherNo: address.otherNo || "",
//             nickname: address.nickname || "",
//             additionalInfo: address.additionalInfo || ""
//         });

//         setIsModalOpen(true);
//     };

//     // Add New বাটনে ক্লিক করলে
//     const handleAddNew = () => {
//         setSelectedAddress(null);
//         setSelectedType("Apartment");
//         setModalMode("add");

//         // ফর্ম রিসেট করুন
//         reset({
//             city: "",
//             area: "",
//             buildingName: "",
//             apartmentNo: "",
//             community: "",
//             villaNo: "",
//             streetName: "",
//             otherNo: "",
//             nickname: "",
//             additionalInfo: ""
//         });

//         setIsModalOpen(true);
//     };

//     // মডেল বন্ধ করার হ্যান্ডলার
//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//         setSelectedAddress(null);
//         setSelectedType("Apartment");
//     };

//     // Type আইকন পান
//     const getTypeIcon = (type) => {
//         switch (type?.toLowerCase()) {
//             case 'home':
//             case 'apartment':
//             case 'villa':
//                 return <FiHome className="text-teal-600" />;
//             case 'office':
//                 return <FiBriefcase className="text-blue-600" />;
//             default:
//                 return <FiMapPin className="text-gray-600" />;
//         }
//     };

//     // Type badge color পান
//     const getTypeBadgeColor = (type) => {
//         switch (type?.toLowerCase()) {
//             case 'home':
//             case 'apartment':
//                 return "bg-teal-100 text-teal-800";
//             case 'villa':
//                 return "bg-purple-100 text-purple-800";
//             case 'office':
//                 return "bg-blue-100 text-blue-800";
//             case 'other':
//                 return "bg-gray-100 text-gray-800";
//             default:
//                 return "bg-gray-100 text-gray-800";
//         }
//     };

//     // Address ফরম্যাট করুন
//     const formatAddress = (item) => {
//         if (item.displayAddress) return item.displayAddress;

//         const parts = [];
//         if (item.apartmentNo || item.villaNo || item.otherNo)
//             parts.push(item.apartmentNo || item.villaNo || item.otherNo);
//         if (item.buildingName || item.community || item.streetName)
//             parts.push(item.buildingName || item.community || item.streetName);
//         if (item.area) parts.push(item.area);
//         if (item.city) parts.push(item.city);

//         return parts.join(", ");
//     };

//     return (
//         <>
//             {/* Main Saved Locations Component */}
//             <div className="border border-[#E5E7EB] rounded-md bg-white p-5 w-full max-w-7xl mx-auto">
//                 <h2 className="flex items-center gap-2 text-xl font-semibold text-[#5D4F52] border-b pb-3">
//                     <FiMapPin className="text-[#01788E]" size={20} />
//                     Saved Locations
//                 </h2>

//                 {savedAddresses.length === 0 ? (
//                     <div className="mt-6 text-center py-8">
//                         <div className="mb-4">
//                             <FiMapPin size={48} className="text-gray-300 mx-auto" />
//                         </div>
//                         <p className="text-gray-500 mb-2">No saved addresses yet</p>
//                         <p className="text-gray-400 text-sm mb-6">
//                             Save your frequently used addresses for faster booking
//                         </p>
//                         <button
//                             onClick={handleAddNew}
//                             className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2 mx-auto"
//                         >
//                             <FiPlus size={18} />
//                             Add Your First Address
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="mt-6 flex flex-col gap-4">
//                         {savedAddresses.map((item) => (
//                             <div
//                                 key={item.id}
//                                 className="border border-[#D1E5EA] rounded-md p-4 hover:shadow-md transition-shadow"
//                             >
//                                 <div className="flex justify-between items-start">
//                                     <div className="flex-1">
//                                         <div className="flex items-center gap-3 mb-2">
//                                             <div className="p-2 bg-gray-50 rounded-lg">
//                                                 {getTypeIcon(item.type)}
//                                             </div>
//                                             <div>
//                                                 <div className="flex items-center gap-2">
//                                                     <h3 className="text-[15px] font-medium text-[#5D4F52]">
//                                                         {item.nickname || "Untitled Address"}
//                                                     </h3>
//                                                     <span className={`text-xs px-2 py-1 rounded ${getTypeBadgeColor(item.type)}`}>
//                                                         {item.type}
//                                                     </span>
//                                                 </div>
//                                                 <p className="text-xs text-gray-400">
//                                                     {item.updatedAt ? "Updated" : "Added"} on {new Date(item.updatedAt || item.createdAt || item.timestamp).toLocaleDateString()}
//                                                 </p>
//                                             </div>
//                                         </div>

//                                         <p className="text-[13px] text-gray-600 mt-1 ml-11">
//                                             {formatAddress(item)}
//                                         </p>

//                                         {item.additionalInfo && (
//                                             <p className="text-xs text-gray-500 mt-2 ml-11">
//                                                 📝 {item.additionalInfo}
//                                             </p>
//                                         )}

//                                         {item.mapLatitude && item.mapLongitude && (
//                                             <div className="flex items-center gap-1 text-xs text-gray-400 mt-2 ml-11">
//                                                 <FiMap size={12} />
//                                                 <span>
//                                                     {item.mapLatitude.toFixed(4)}, {item.mapLongitude.toFixed(4)}
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Actions */}
//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             onClick={() => handleEdit(item)}
//                                             className="p-2 text-[#01788E] hover:bg-teal-50 rounded-full transition"
//                                             title="Edit address"
//                                         >
//                                             <FiEdit3 size={18} />
//                                         </button>
//                                         <button
//                                             onClick={() => handleDelete(item.id)}
//                                             className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
//                                             title="Delete address"
//                                         >
//                                             <FiTrash2 size={18} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}

//                         {/* Add new address card */}
//                         <button
//                             onClick={handleAddNew}
//                             className="border-2 border-dashed border-[#D1E5EA] rounded-md p-6 flex flex-col items-center justify-center w-full hover:bg-gray-50 transition hover:border-teal-300 group"
//                         >
//                             <div className="p-3 bg-teal-50 rounded-full mb-3 group-hover:bg-teal-100 transition-colors">
//                                 <FiPlus size={24} className="text-teal-600" />
//                             </div>
//                             <span className="text-[14px] text-[#5D4F52] font-medium">
//                                 Add New Address
//                             </span>
//                             <span className="text-xs text-gray-400 mt-1">
//                                 Save another location for faster checkout
//                             </span>
//                         </button>
//                     </div>
//                 )}

//                 {/* Quick Stats */}
//                 {savedAddresses.length > 0 && (
//                     <div className="mt-6 pt-4 border-t text-sm text-gray-500">
//                         <p>
//                             You have <span className="font-medium text-teal-600">{savedAddresses.length}</span> saved
//                             address{savedAddresses.length !== 1 ? 'es' : ''}
//                         </p>
//                     </div>
//                 )}
//             </div>

//             {/* Address Modal - Edit/Add */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
//                         {/* Header */}
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                             <h2 className="text-xl font-semibold text-gray-800">
//                                 {modalMode === "edit" ? "Edit Address" : "Add New Address"}
//                             </h2>
//                             <button
//                                 onClick={handleCloseModal}
//                                 className="p-2 hover:bg-gray-100 rounded-full"
//                             >
//                                 <FiX size={24} />
//                             </button>
//                         </div>

//                         {/* Form Content */}
//                         <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
//                             {/* Type Buttons */}
//                             <div className="flex flex-wrap gap-2">
//                                 {buttons.map(btn => (
//                                     <button
//                                         key={btn}
//                                         type="button"
//                                         onClick={() => handleTypeChange(btn)}
//                                         className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
//                                             ${selectedType === btn
//                                                 ? "bg-teal-600 text-white"
//                                                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                             }`}
//                                     >
//                                         {btn}
//                                     </button>
//                                 ))}
//                             </div>

//                             {/* Nickname (Optional) */}
//                             <div>
//                                 <label className="block text-gray-700 font-medium mb-2">
//                                     Nickname (Optional)
//                                 </label>
//                                 <input
//                                     {...register("nickname")}
//                                     type="text"
//                                     placeholder="Give this address a nickname"
//                                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                 />
//                             </div>

//                             {/* City - Required */}
//                             <div>
//                                 <label className="block text-gray-700 font-medium mb-2">
//                                     City <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     {...register("city", { required: "City is required" })}
//                                     type="text"
//                                     placeholder="Enter City"
//                                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                 />
//                                 {errors.city && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
//                                 )}
//                             </div>

//                             {/* Area - Required */}
//                             <div>
//                                 <label className="block text-gray-700 font-medium mb-2">
//                                     Area <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     {...register("area", { required: "Area is required" })}
//                                     type="text"
//                                     placeholder="Enter Area"
//                                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                 />
//                                 {errors.area && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
//                                 )}
//                             </div>

//                             {/* Dynamic Fields based on selected type */}
//                             {selectedType === "Villa" && (
//                                 <>
//                                     <div>
//                                         <label className="block text-gray-700 font-medium mb-2">
//                                             Community / Street Name <span className="text-red-500">*</span>
//                                         </label>
//                                         <input
//                                             {...register("community", { required: "Community is required" })}
//                                             type="text"
//                                             placeholder="Enter Community / Street Name"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                         />
//                                         {errors.community && (
//                                             <p className="text-red-500 text-sm mt-1">{errors.community.message}</p>
//                                         )}
//                                     </div>
//                                     <div>
//                                         <label className="block text-gray-700 font-medium mb-2">
//                                             Villa No <span className="text-red-500">*</span>
//                                         </label>
//                                         <input
//                                             {...register("villaNo", { required: "Villa number is required" })}
//                                             type="text"
//                                             placeholder="Enter Villa Number"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                         />
//                                         {errors.villaNo && (
//                                             <p className="text-red-500 text-sm mt-1">{errors.villaNo.message}</p>
//                                         )}
//                                     </div>
//                                 </>
//                             )}

//                             {selectedType === "Other" && (
//                                 <>
//                                     <div>
//                                         <label className="block text-gray-700 font-medium mb-2">
//                                             Street / Building Name <span className="text-red-500">*</span>
//                                         </label>
//                                         <input
//                                             {...register("streetName", { required: "Street/Building name is required" })}
//                                             type="text"
//                                             placeholder="Enter Street / Building Name"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                         />
//                                         {errors.streetName && (
//                                             <p className="text-red-500 text-sm mt-1">{errors.streetName.message}</p>
//                                         )}
//                                     </div>
//                                     <div>
//                                         <label className="block text-gray-700 font-medium mb-2">
//                                             Apartment / Villa No <span className="text-red-500">*</span>
//                                         </label>
//                                         <input
//                                             {...register("otherNo", { required: "Apartment/Villa number is required" })}
//                                             type="text"
//                                             placeholder="Enter Apartment / Villa No"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                         />
//                                         {errors.otherNo && (
//                                             <p className="text-red-500 text-sm mt-1">{errors.otherNo.message}</p>
//                                         )}
//                                     </div>
//                                 </>
//                             )}

//                             {selectedType !== "Villa" && selectedType !== "Other" && (
//                                 <>
//                                     <div>
//                                         <label className="block text-gray-700 font-medium mb-2">
//                                             Building Name <span className="text-red-500">*</span>
//                                         </label>
//                                         <input
//                                             {...register("buildingName", { required: "Building name is required" })}
//                                             type="text"
//                                             placeholder="Enter Building Name"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                         />
//                                         {errors.buildingName && (
//                                             <p className="text-red-500 text-sm mt-1">{errors.buildingName.message}</p>
//                                         )}
//                                     </div>
//                                     <div>
//                                         <label className="block text-gray-700 font-medium mb-2">
//                                             Apartment No <span className="text-red-500">*</span>
//                                         </label>
//                                         <input
//                                             {...register("apartmentNo", { required: "Apartment number is required" })}
//                                             type="text"
//                                             placeholder="Enter Apartment No"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                         />
//                                         {errors.apartmentNo && (
//                                             <p className="text-red-500 text-sm mt-1">{errors.apartmentNo.message}</p>
//                                         )}
//                                     </div>
//                                 </>
//                             )}

//                             {/* Additional Info (Optional) */}
//                             <div>
//                                 <label className="block text-gray-700 font-medium mb-2">
//                                     Additional Information (Optional)
//                                 </label>
//                                 <textarea
//                                     {...register("additionalInfo")}
//                                     rows="3"
//                                     placeholder="Floor, landmark, special instructions, etc."
//                                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                 />
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="sticky bottom-0 bg-white pt-4 border-t flex gap-3">
//                                 <button
//                                     type="button"
//                                     onClick={handleCloseModal}
//                                     className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={!isValid}
//                                     className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors
//                                         ${isValid
//                                             ? "bg-teal-600 text-white hover:bg-teal-700"
//                                             : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                                         }`}
//                                 >
//                                     {modalMode === "edit" ? "Update Address" : "Save Address"}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };