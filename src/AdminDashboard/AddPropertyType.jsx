/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";
import { IoClose, IoImageOutline } from "react-icons/io5";
import useDashboardPropertyType from "../hooks/userDashboardPropertyType";
import useDashboardServiceType from "../hooks/useDashboardServiceType";
import { GoBrowser } from "react-icons/go";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { FiLayers, FiDollarSign } from "react-icons/fi";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// ── Shared styles — teal palette ──────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all bg-gray-50/30 placeholder:text-gray-300";
const labelCls = "block text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
const errCls = "text-red-500 text-[11px] mt-1";

// ── Input focus helper ────────────────────────────────────────────────────────
const tealFocus = {
    onFocus: (e) => { e.target.style.borderColor = '#01788E'; e.target.style.boxShadow = '0 0 0 2px rgba(1,120,142,0.15)'; },
    onBlur: (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, error, hint, children }) => (
    <div>
        {label && <label className={labelCls}>{label}</label>}
        {children}
        {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
        {error && <p className={errCls}>· {error}</p>}
    </div>
);

// ── Section divider ───────────────────────────────────────────────────────────
const SectionHead = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 pt-1 pb-1">
        <div className="p-1.5 rounded-lg shrink-0" style={{ background: 'rgba(1,120,142,0.1)' }}>
            <Icon className="text-xs" style={{ color: '#01788E' }} />
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

// ── Modal shell ───────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
    <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
            className="relative bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Teal top strip */}
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(to right, #01788E, #015f70)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg" style={{ background: 'rgba(1,120,142,0.1)' }}>
                        <GoBrowser className="text-base" style={{ color: '#01788E' }} />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Fill in the details below</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                    <IoClose className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5">
                {children}
            </div>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function AddPropertyType() {
    const [serviceType] = useDashboardServiceType();
    const [propertyType, refetch] = useDashboardPropertyType();
    const axiosSecure = useAxiosSecure();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    const {
        register: registerEdit,
        handleSubmit: handleEditSubmit,
        reset: resetEdit,
        setValue,
        formState: { errors: editErrors }
    } = useForm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key !== 'Escape') return;
            setIsModalOpen(prev => { if (prev) { reset(); return false; } return prev; });
            setIsEditModalOpen(prev => { if (prev) { resetEdit(); setSelectedItem(null); return false; } return prev; });
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [reset, resetEdit]);

    const closeAddModal = () => { reset(); setIsModalOpen(false); };

    const openEditModal = (item) => {
        resetEdit();
        setSelectedItem(item);
        setIsEditModalOpen(true);
        // BUG FIX: use _id fallback for serviceTypeId population
        setValue("title", item.title ?? "");
        setValue("description", item.description ?? "");
        setValue("startFrom", item.startFrom ?? "");
        setValue("serviceTypeId", item.serviceTypeId || item.serviceType?.id || (item.serviceType?._id ?? ""));
    };

    const closeEditModal = () => { resetEdit(); setIsEditModalOpen(false); setSelectedItem(null); };

    // ── Image upload helper ───────────────────────────────────────────────────
    const uploadImage = async (file) => {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(image_hosting_api, { method: "POST", body: fd });
        const r = await res.json();
        if (!r.success) throw new Error("Image upload failed");
        return r.data.url;
    };

    // ── Add submit ────────────────────────────────────────────────────────────
    const handleFormSubmit = async (data) => {
        setLoading(true);
        try {
            const imageUrl = await uploadImage(data.image[0]);
            const finalData = {
                title: data.title,
                description: data.description,
                startFrom: data.startFrom,
                serviceTypeId: data.serviceTypeId,
                image: imageUrl,
            };
            const res = await axiosSecure.post(`/property-type/create`, finalData);
            if (res?.data?.success) {
                toast.success("Property Type added successfully");
                closeAddModal();
                refetch();
            } else {
                toast.error(res?.data?.message || "Failed to add property type");
            }
        } catch (err) {
            toast.error(err?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    // ── Edit submit ───────────────────────────────────────────────────────────
    const handleEditForm = async (data) => {
        setLoading(true);
        try {
            let imageUrl = selectedItem.image;
            if (data.image && data.image.length > 0) {
                imageUrl = await uploadImage(data.image[0]);
            }
            const updatedData = {
                title: data.title,
                description: data.description,
                startFrom: data.startFrom,
                serviceTypeId: data.serviceTypeId,
                image: imageUrl,
            };
            // BUG FIX: _id fallback for edit endpoint
            const itemId = selectedItem.id || selectedItem._id;
            const res = await axiosSecure.patch(`/property-type/update/${itemId}`, updatedData);
            if (res?.data?.success) {
                toast.success("Updated successfully");
                closeEditModal();
                refetch();
            } else {
                toast.error(res?.data?.message || "Update failed");
            }
        } catch (err) {
            toast.error(err?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteServiceType = (service) => {
        const serviceId = service.id || service._id;
        Swal.fire({
            title: "Are you sure?",
            text: `"${service.title}" will be permanently deleted.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#01788E",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            reverseButtons: true,
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await axiosSecure.delete(`/property-type/delete/${serviceId}`);
                if (res?.data?.success) {
                    refetch();
                    toast.success("Property type deleted");
                } else {
                    toast.error(res?.data?.message || "Failed to delete");
                }
            } catch (err) {
                toast.error(err?.message || "Something went wrong");
            }
        });
    };

    // ── Shared form fields ────────────────────────────────────────────────────
    const renderFormFields = (reg, errs, isEdit = false) => (
        <div className="space-y-4">

            <SectionHead icon={GoBrowser} label="Basic Info" />

            <Field label="Title" error={errs.title?.message}>
                <input type="text" placeholder="e.g. Studio Apartment"
                    className={inputCls} {...tealFocus}
                    {...reg("title", { required: "Title is required" })} />
            </Field>

            <Field label="Description" error={errs.description?.message}>
                <textarea placeholder="Describe this property type…" rows={3}
                    className={`${inputCls} resize-none`} {...tealFocus}
                    {...reg("description", { required: "Description is required" })} />
            </Field>

            <SectionHead icon={FiDollarSign} label="Pricing" />

            <Field label="Start From (AED)" error={errs.startFrom?.message}>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-gray-400">AED</span>
                    <input
                        type="number" placeholder="0"
                        className={`${inputCls} pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        onWheel={(e) => e.target.blur()} {...tealFocus}
                        {...reg("startFrom", {
                            required: "Start from price is required",
                            min: { value: 0, message: "Price cannot be negative" }
                        })} />
                </div>
            </Field>

            <Field label="Service Type" error={errs.serviceTypeId?.message}>
                <select className={inputCls} {...tealFocus}
                    {...reg("serviceTypeId", { required: "Service type is required" })}>
                    <option value="">Choose a service type…</option>
                    {serviceType.map((c) => {
                        const cid = c.id || c._id;
                        return (
                            <option key={cid} value={cid}>
                                {c.title} — {c.service?.title}
                            </option>
                        );
                    })}
                </select>
            </Field>

            <SectionHead icon={IoImageOutline} label="Photo" />

            <Field
                label="Image"
                error={!isEdit && errs.image ? "Image is required" : null}
                hint={isEdit ? "Leave empty to keep the current photo" : undefined}
            >
                <input
                    type="file" accept="image/*"
                    className="w-full text-xs sm:text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 border border-gray-200 rounded-xl px-2 py-2 bg-gray-50/30 transition-all cursor-pointer"
                    {...reg("image", isEdit ? {} : { required: true })} />
                {isEdit && selectedItem?.image && (
                    <div className="mt-2 flex items-center gap-3 p-3 rounded-xl border"
                        style={{ background: 'rgba(1,120,142,0.05)', borderColor: 'rgba(1,120,142,0.15)' }}>
                        <img src={selectedItem.image} alt={selectedItem.title}
                            className="w-12 h-12 object-cover rounded-lg shrink-0 border"
                            style={{ borderColor: 'rgba(1,120,142,0.2)' }} />
                        <div>
                            <p className="text-xs font-semibold text-gray-600">Current photo</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Upload a new one to replace</p>
                        </div>
                    </div>
                )}
            </Field>

            {/* Submit */}
            <div className="pt-2">
                <button
                    type="submit" disabled={loading}
                    className="w-full py-3 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #01788E, #015f70)' }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'linear-gradient(135deg, #015f70, #014d5a)'; }}
                    onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #01788E, #015f70)'}
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {isEdit ? "Saving…" : "Adding…"}
                        </>
                    ) : (
                        <>
                            {isEdit ? "Save Changes" : "Add Property Type"}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen p-2 sm:p-4 md:p-4">
            <div className="max-w-5xl mx-auto space-y-5">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 rounded-xl shadow-sm shrink-0"
                            style={{ background: 'linear-gradient(135deg, #01788E, #015f70)' }}>
                            <GoBrowser className="text-base sm:text-xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
                                Property Types
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                Manage your property type listings
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        {/* Count pill */}
                        <div className="px-3 py-1.5 rounded-lg border flex items-center gap-2"
                            style={{ background: 'rgba(1,120,142,0.07)', borderColor: 'rgba(1,120,142,0.2)' }}>
                            <FiLayers className="text-sm" style={{ color: '#01788E' }} />
                            <span className="text-xs sm:text-sm font-semibold" style={{ color: '#01788E' }}>
                                {propertyType.length} {propertyType.length === 1 ? "Type" : "Types"}
                            </span>
                        </div>
                        {/* Add button */}
                        <button
                            onClick={() => { reset(); setIsModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2.5 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #01788E, #015f70)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #015f70, #014d5a)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #01788E, #015f70)'}
                        >
                            <MdOutlineAddPhotoAlternate className="text-base" />
                            Add Type
                        </button>
                    </div>
                </div>

                {/* ── Table Card ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Empty state */}
                    {propertyType.length === 0 && (
                        <div className="py-16 text-center px-4">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(1,120,142,0.08)' }}>
                                <IoImageOutline className="w-7 h-7" style={{ color: 'rgba(1,120,142,0.5)' }} />
                            </div>
                            <p className="text-sm font-semibold text-gray-600">No property types yet</p>
                            <p className="text-xs text-gray-400 mt-1 mb-5">Add your first property type to get started</p>
                            <button
                                onClick={() => { reset(); setIsModalOpen(true); }}
                                className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-sm rounded-xl border transition-all"
                                style={{ background: 'rgba(1,120,142,0.07)', color: '#01788E', borderColor: 'rgba(1,120,142,0.2)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(1,120,142,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(1,120,142,0.07)'}
                            >
                                <MdOutlineAddPhotoAlternate /> Add your first type
                            </button>
                        </div>
                    )}

                    {propertyType.length > 0 && (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {["#", "Property Type", "Start From", "Actions"].map(h => (
                                                <th key={h} className="py-3 px-5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {propertyType.map((prop, idx) => {
                                            const propId = prop.id || prop._id;
                                            return (
                                                <tr key={propId ?? idx} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="py-3.5 px-5">
                                                        <span className="text-xs font-semibold text-gray-400">#{idx + 1}</span>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-3">
                                                            <img src={prop.image} alt={prop.title}
                                                                className="w-11 h-11 object-cover rounded-xl border border-gray-200 shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">{prop.title}</p>
                                                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                                                                    {[prop.serviceType?.title, prop.serviceType?.service?.title].filter(Boolean).join(" · ")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <span className="text-sm font-semibold" style={{ color: '#01788E' }}>
                                                            AED {prop.startFrom ?? "—"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openEditModal(prop)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-all">
                                                                <RiEditBoxLine /> Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteServiceType(prop)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                                                title="Delete">
                                                                <RiDeleteBin5Line className="text-base" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="sm:hidden divide-y divide-gray-100">
                                {propertyType.map((prop, idx) => {
                                    const propId = prop.id || prop._id;
                                    return (
                                        <div key={propId ?? idx} className="p-4 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                                            <img src={prop.image} alt={prop.title}
                                                className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{prop.title}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                                    {[prop.serviceType?.title, prop.serviceType?.service?.title].filter(Boolean).join(" · ")}
                                                </p>
                                                <p className="text-sm font-semibold mt-1" style={{ color: '#01788E' }}>
                                                    AED {prop.startFrom ?? "—"}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1.5 shrink-0">
                                                <button onClick={() => openEditModal(prop)}
                                                    className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg transition-all">
                                                    <RiEditBoxLine className="text-sm" />
                                                </button>
                                                <button onClick={() => handleDeleteServiceType(prop)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-100 rounded-lg transition-all">
                                                    <RiDeleteBin5Line className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Add Modal ── */}
            {isModalOpen && (
                <Modal title="Add Property Type" onClose={closeAddModal}>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        {renderFormFields(register, errors, false)}
                    </form>
                </Modal>
            )}

            {/* ── Edit Modal ── */}
            {isEditModalOpen && selectedItem && (
                <Modal title="Edit Property Type" onClose={closeEditModal}>
                    <form onSubmit={handleEditSubmit(handleEditForm)}>
                        {renderFormFields(registerEdit, editErrors, true)}
                    </form>
                </Modal>
            )}
        </div>
    );
};





// main component code
// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";
// import { IoClose } from "react-icons/io5";
// import useDashboardPropertyType from "../hooks/userDashboardPropertyType";
// import useDashboardServiceType from "../hooks/useDashboardServiceType";
// import { GoBrowser } from "react-icons/go";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";

// const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
// const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// export default function AddPropertyType() {
//     const [serviceType] = useDashboardServiceType();
//     const [propertyType, refetch] = useDashboardPropertyType();
//     const axiosSecure = useAxiosSecure();

//     const { register, handleSubmit, reset, formState: { errors } } = useForm();
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, setValue } = useForm();
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [selectedItem, setSelectedItem] = useState(null);

//     const [loading, setLoading] = useState(false);

//     // Close modal on Escape key press
//     useEffect(() => {
//         const handleEscape = (e) => {
//             if (e.key === 'Escape') {
//                 if (isModalOpen) setIsModalOpen(false);
//                 if (isEditModalOpen) setIsEditModalOpen(false);
//             }
//         };

//         window.addEventListener('keydown', handleEscape);
//         return () => window.removeEventListener('keydown', handleEscape);
//     }, [isModalOpen, isEditModalOpen]);

//     // Handle backdrop click for Add Modal
//     const handleBackdropClick = () => {
//         setIsModalOpen(false);
//         reset();
//     };

//     // Handle backdrop click for Edit Modal
//     const handleEditBackdropClick = () => {
//         setIsEditModalOpen(false);
//         resetEdit();
//         setSelectedItem(null);
//     };

//     // -----------------------
//     const handleFormSubmit = async (data) => {
//         setLoading(true);
//         const formData = new FormData();
//         formData.append("image", data.image[0]);

//         try {
//             const uploadRes = await fetch(image_hosting_api, {
//                 method: "POST",
//                 body: formData,
//             });
//             const uploadResult = await uploadRes.json();
//             if (!uploadResult.success) return toast.error("Image upload failed");

//             const imageUrl = uploadResult.data.url;
//             const finalData = {
//                 title: data.title,
//                 description: data.description,
//                 startFrom: data.startFrom,
//                 serviceTypeId: data.serviceTypeId,
//                 image: imageUrl,
//             };

//             const postRes = await axiosSecure.post(`/property-type/create`, finalData);

//             if (postRes?.data?.success) {
//                 toast.success("Property Type added successfully");
//                 reset();
//                 setIsModalOpen(false);
//                 refetch();
//             } else {
//                 toast.error(postRes?.message || "Failed to add property type");
//             }
//         } catch (error) {
//             toast.error("Something went wrong: " + error?.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // OPEN EDIT MODAL
//     // -----------------------
//     const openEditModal = (item) => {
//         setSelectedItem(item);
//         setIsEditModalOpen(true);

//         // Prefill form
//         setValue("title", item.title);
//         setValue("description", item.description);
//         setValue("startFrom", item.startFrom);
//         setValue("serviceTypeId", item.serviceTypeId);
//     };

//     // CLOSE EDIT MODAL
//     const closeEditModal = () => {
//         setIsEditModalOpen(false);
//         resetEdit();
//         setSelectedItem(null);
//     };

//     // EDIT FORM SUBMIT
//     // -----------------------
//     const handleEditForm = async (data) => {
//         setLoading(true);

//         let imageUrl = selectedItem.image;

//         // If user selected new image
//         if (data.image && data.image.length > 0) {
//             const formData = new FormData();
//             formData.append("image", data.image[0]);

//             try {
//                 const uploadRes = await fetch(image_hosting_api, {
//                     method: "POST",
//                     body: formData,
//                 });

//                 const uploadResult = await uploadRes.json();
//                 if (!uploadResult.success) {
//                     toast.error("Image upload failed");
//                     setLoading(false);
//                     return;
//                 }

//                 imageUrl = uploadResult.data.url;
//             } catch (error) {
//                 toast.error("Image upload error: " + error?.message);
//                 setLoading(false);
//                 return;
//             }
//         }

//         const updatedData = {
//             title: data.title,
//             description: data.description,
//             startFrom: data.startFrom,
//             serviceTypeId: data.serviceTypeId,
//             image: imageUrl,
//         };

//         try {
//             const res = await axiosSecure.patch(`/property-type/update/${selectedItem.id}`, updatedData);

//             if (res?.data?.success) {
//                 toast.success("Updated successfully");
//                 closeEditModal();
//                 refetch();
//             } else {
//                 toast.error(res?.message || "Update failed");
//             }
//         } catch (error) {
//             toast.error("Update failed: " + error?.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handelDeleteServiceType = async (service) => {
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
//                     const res = await axiosSecure.delete(`/property-type/delete/${service.id}`);
//                     if (res?.data?.success) {
//                         refetch();
//                         Swal.fire({
//                             title: "Deleted!",
//                             text: "Property type deleted successfully",
//                             icon: "success"
//                         });
//                     }
//                 }
//             })
//         } catch (error) {
//             console.error(error);
//             toast.error("Something went wrong");
//         }
//     };

//     return (
//         <div className="md:p-6 border border-[#E5E7EB]">
//             <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
//                 <h2 className="flex items-center gap-2.5 text-xl font-semibold text-[#5D4F52]">
//                     <GoBrowser className="text-[#01788E]" /> Property Type: {propertyType.length}
//                 </h2>
//                 <button
//                     onClick={() => {
//                         setIsModalOpen(true);
//                         reset();
//                     }}
//                     className="btn btn-outline mt-3 md:mt-0"
//                 >
//                     Add Property Type
//                 </button>
//             </div>

//             <div className="overflow-x-auto">
//                 <table className="table w-full">
//                     <thead>
//                         <tr className="text-gray-600">
//                             <th>No</th>
//                             <th>Property Type</th>
//                             <th>Edit</th>
//                             <th>Delete</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {propertyType.map((prop, idx) => (
//                             <tr key={idx}>
//                                 <td>{idx + 1}</td>

//                                 <td>
//                                     <div className="flex items-center gap-3">
//                                         <div className="avatar">
//                                             <div className="mask mask-squircle h-12 w-12">
//                                                 <img src={prop.image} alt={prop.title} />
//                                             </div>
//                                         </div>
//                                         <div className="font-semibold">
//                                             {/* Format: Property Type - Service Type - Service */}
//                                             {prop.title} - {prop.serviceType?.title} - {prop.serviceType?.service?.title}
//                                         </div>
//                                     </div>
//                                 </td>

//                                 <td>
//                                     <button
//                                         className="btn btn-ghost btn-xs"
//                                         onClick={() => openEditModal(prop)}
//                                     >
//                                         <RiEditBoxLine className="text-xl text-green-500" />
//                                     </button>
//                                 </td>

//                                 <td>
//                                     <button
//                                         onClick={() => handelDeleteServiceType(prop)}
//                                         className="btn btn-ghost btn-xs"
//                                     >
//                                         <RiDeleteBin5Line className="text-xl text-red-500" />
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* ADD MODAL */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 z-50">
//                     {/* Backdrop - এইটাতে ক্লিক করলে মডাল বন্ধ হবে */}
//                     <div
//                         className="fixed inset-0 bg-black/40"
//                         onClick={handleBackdropClick}
//                     />

//                     {/* Modal Content */}
//                     <div className="fixed inset-0 z-50 flex justify-center items-center px-2 sm:px-4 md:px-6">
//                         <div
//                             className="relative bg-white
//                                         w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl
//                                         p-4 sm:p-6 md:p-8
//                                         rounded-md shadow-xl
//                                         max-h-[90vh] overflow-y-auto"
//                             onClick={(e) => e.stopPropagation()}
//                         >
//                             <button
//                                 onClick={handleBackdropClick}
//                                 className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl font-bold cursor-pointer"
//                             >
//                                 <IoClose className="text-2xl" />
//                             </button>

//                             {/* Title */}
//                             <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-gray-800">
//                                 Add Property Type
//                             </h2>

//                             {/* Form */}
//                             <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
//                                 {/* Title */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Title</label>
//                                     <input
//                                         type="text"
//                                         {...register("title", { required: "Title is required" })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Title"
//                                     />
//                                     {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
//                                 </div>

//                                 {/* Description */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Description</label>
//                                     <textarea
//                                         {...register("description", { required: "Description is required" })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Description"
//                                         rows="3"
//                                     />
//                                     {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
//                                 </div>

//                                 {/* Start From */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Start From</label>
//                                     <input
//                                         type="number"
//                                         {...register("startFrom", {
//                                             required: "Start from price is required",
//                                             min: { value: 0, message: "Price cannot be negative" }
//                                         })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Start From"
//                                     />
//                                     {errors.startFrom && <p className="text-red-500 text-sm">{errors.startFrom.message}</p>}
//                                 </div>

//                                 {/* Service Type Dropdown */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Service Type</label>
//                                     <select
//                                         {...register("serviceTypeId", { required: "Service type is required" })}
//                                         className="border p-3 w-full rounded-md"
//                                     >
//                                         <option value="">Select Service Type</option>
//                                         {serviceType.map((c) => (
//                                             <option key={c.id} value={c.id}>
//                                                 {/* Format: Service Type - Service */}
//                                                 {c.title} - {c.service?.title}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.serviceTypeId && <p className="text-red-500 text-sm">{errors.serviceTypeId.message}</p>}
//                                 </div>

//                                 {/* Image */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Image</label>
//                                     <input
//                                         type="file"
//                                         accept="image/*"
//                                         {...register("image", { required: "Image is required" })}
//                                         className="w-full border p-3 rounded-md"
//                                     />
//                                     {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
//                                 </div>

//                                 {/* Submit Button */}
//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#016377] transition-colors disabled:opacity-50"
//                                 >
//                                     {loading ? "Submitting..." : "Submit"}
//                                 </button>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* EDIT MODAL */}
//             {isEditModalOpen && selectedItem && (
//                 <div className="fixed inset-0 z-50">
//                     {/* Backdrop - এইটাতে ক্লিক করলে মডাল বন্ধ হবে */}
//                     <div
//                         className="fixed inset-0 bg-black/40"
//                         onClick={handleEditBackdropClick}
//                     />

//                     <div className="fixed inset-0 z-50 flex justify-center items-center px-2 sm:px-4 md:px-6">
//                         <div
//                             className="relative bg-white
//                                         w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl
//                                         p-4 sm:p-6 md:p-8
//                                         rounded-md shadow-xl
//                                         max-h-[90vh] overflow-y-auto"
//                             onClick={(e) => e.stopPropagation()}
//                         >
//                             <button
//                                 onClick={closeEditModal}
//                                 className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl font-bold cursor-pointer"
//                             >
//                                 <IoClose className="text-2xl" />
//                             </button>

//                             <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-gray-800">
//                                 Edit Property Type
//                             </h2>

//                             <form onSubmit={handleEditSubmit(handleEditForm)} className="space-y-4">
//                                 {/* Title */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Title</label>
//                                     <input
//                                         type="text"
//                                         {...registerEdit("title", { required: "Title is required" })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Title"
//                                     />
//                                     {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
//                                 </div>

//                                 {/* Description */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Description</label>
//                                     <textarea
//                                         {...registerEdit("description", { required: "Description is required" })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Description"
//                                         rows="3"
//                                     />
//                                     {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
//                                 </div>

//                                 {/* Start From */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Start From</label>
//                                     <input
//                                         type="number"
//                                         {...registerEdit("startFrom", {
//                                             required: "Start from price is required",
//                                             min: { value: 0, message: "Price cannot be negative" }
//                                         })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Start From"
//                                     />
//                                     {errors.startFrom && <p className="text-red-500 text-sm">{errors.startFrom.message}</p>}
//                                 </div>

//                                 {/* Service Type Dropdown */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Service Type</label>
//                                     <select
//                                         {...registerEdit("serviceTypeId", { required: "Service type is required" })}
//                                         className="border p-3 w-full rounded-md"
//                                     >
//                                         <option value="">Select Service Type</option>
//                                         {serviceType.map((c) => (
//                                             <option key={c.id} value={c.id}>
//                                                 {/* Format: Service Type - Service */}
//                                                 {c.title} - {c.service?.title}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.serviceTypeId && <p className="text-red-500 text-sm">{errors.serviceTypeId.message}</p>}
//                                 </div>

//                                 {/* Image */}
//                                 <div>
//                                     <label className="block font-medium mb-1">Image</label>
//                                     <input
//                                         type="file"
//                                         accept="image/*"
//                                         {...registerEdit("image")}
//                                         className="w-full border p-3 rounded-md"
//                                     />
//                                     {selectedItem?.image && (
//                                         <div className="mt-3">
//                                             <p className="text-sm text-gray-600 mb-1">Current Image:</p>
//                                             <img
//                                                 className="h-28 w-28 object-cover rounded-md border"
//                                                 src={selectedItem.image}
//                                                 alt={selectedItem.title}
//                                             />
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Submit Button */}
//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#016377] transition-colors disabled:opacity-50"
//                                 >
//                                     {loading ? "Updating..." : "Update"}
//                                 </button>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };