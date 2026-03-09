/* eslint-disable no-unused-vars */
import { useState } from "react";
import useDashboardPropertyItem from "../hooks/useDashboardPropertyItem";
import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";
import { IoClose, IoImageOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useDashboardPropertyType from "../hooks/userDashboardPropertyType";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { GoBrowser } from "react-icons/go";
import { FiLayers, FiDollarSign, FiStar } from "react-icons/fi";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// ── Styles — teal palette ─────────────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all bg-gray-50/30 placeholder:text-gray-300";
const labelCls = "block text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
const errCls = "text-red-500 text-[11px] mt-1";

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

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
    <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
            className="relative bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Teal gradient top strip */}
            <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(to right, #01788E, #015f70)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
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

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5">
                {children}
            </div>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AddPropertyItem = () => {
    const [propertyItem, refetch] = useDashboardPropertyItem();
    const [propertyType] = useDashboardPropertyType();
    const [loading, setLoading] = useState(false);
    const axiosSecure = useAxiosSecure();

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const closeAddModal = () => { reset(); setIsAddModalOpen(false); };
    const closeEditModal = () => { reset(); setIsEditModalOpen(false); setEditItem(null); };

    const openEditModal = (item) => {
        reset();
        setEditItem(item);
        setIsEditModalOpen(true);
        ["title", "description", "propertyTypeId", "price", "serviceCharge", "vat", "feature1", "feature2", "feature3", "feature4"]
            .forEach(f => setValue(f, item[f] ?? ""));
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const uploadImage = async (file) => {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(image_hosting_api, { method: "POST", body: fd });
        const r = await res.json();
        if (!r.success) throw new Error("Image upload failed");
        return r.data.url;
    };

    const castNumbers = (data) => ({
        ...data,
        price: Number(data.price),
        serviceCharge: Number(data.serviceCharge),
        vat: Number(data.vat),
    });

    // ── Add ───────────────────────────────────────────────────────────────────
    const handleAddFormSubmit = async (data) => {
        setLoading(true);
        try {
            const imageUrl = await uploadImage(data.image[0]);
            const finalData = castNumbers({ ...data, image: imageUrl });
            const res = await axiosSecure.post(`/property-items/create`, finalData);
            if (res?.data?.success) {
                toast.success("Property Item added successfully");
                closeAddModal(); refetch();
            } else {
                toast.error(res?.data?.message || "Failed to add item");
            }
        } catch (err) {
            toast.error(err?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const handleEditFormSubmit = async (data) => {
        setLoading(true);
        try {
            let imageUrl = editItem.image;
            // BUG FIX: check FileList length properly instead of truthy check on FileList object
            if (data.image && data.image.length > 0) {
                imageUrl = await uploadImage(data.image[0]);
            }
            const finalData = castNumbers({ ...data, image: imageUrl });
            // BUG FIX: only delete image key if it's not a valid string URL
            if (typeof finalData.image !== "string" || !finalData.image) {
                delete finalData.image;
            }
            // BUG FIX: use _id fallback for edit endpoint
            const itemId = editItem.id || editItem._id;
            const res = await axiosSecure.patch(`/property-items/update/${itemId}`, finalData);
            if (res?.data?.success) {
                toast.success("Property Item updated successfully");
                closeEditModal(); refetch();
            } else {
                toast.error(res?.data?.message || "Failed to update");
            }
        } catch (err) {
            toast.error(err?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteItem = (item) => {
        // BUG FIX: _id fallback
        const itemId = item.id || item._id;
        Swal.fire({
            title: "Are you sure?",
            text: `"${item.title}" will be permanently deleted.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#01788E",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            reverseButtons: true,
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await axiosSecure.delete(`/property-items/delete/${itemId}`);
                if (res?.data?.success) {
                    refetch(); toast.success("Property Item deleted");
                } else {
                    toast.error(res?.data?.message || "Failed to delete");
                }
            } catch (err) {
                toast.error(err?.message || "Something went wrong");
            }
        });
    };

    // ── Input focus style helper ──────────────────────────────────────────────
    const tealFocus = {
        onFocus: (e) => { e.target.style.borderColor = '#01788E'; e.target.style.boxShadow = '0 0 0 2px rgba(1,120,142,0.15)'; },
        onBlur: (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }
    };

    // ── Shared form fields ────────────────────────────────────────────────────
    const renderFormFields = (isEdit = false) => (
        <div className="space-y-4">

            <SectionHead icon={IoImageOutline} label="Photo & Identity" />

            {/* Image upload */}
            <Field
                label="Photo"
                error={!isEdit && errors.image ? "A photo is required" : null}
                hint={isEdit ? "Leave empty to keep the current photo" : undefined}
            >
                <input
                    type="file" accept="image/*"
                    className="w-full text-xs sm:text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 border border-gray-200 rounded-xl px-2 py-2 bg-gray-50/30 transition-all cursor-pointer"
                    style={{ '--file-bg': 'rgba(1,120,142,0.07)', '--file-color': '#01788E' }}
                    {...register("image", isEdit ? {} : { required: true })}
                />
                {isEdit && editItem?.image && (
                    <div className="mt-2 flex items-center gap-3 p-3 rounded-xl border"
                        style={{ background: 'rgba(1,120,142,0.05)', borderColor: 'rgba(1,120,142,0.15)' }}>
                        <img src={editItem.image} alt="Current" className="w-12 h-12 object-cover rounded-lg border shrink-0"
                            style={{ borderColor: 'rgba(1,120,142,0.2)' }} />
                        <div>
                            <p className="text-xs font-semibold text-gray-600">Current photo</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Upload a new one to replace</p>
                        </div>
                    </div>
                )}
            </Field>

            {/* Title */}
            <Field label="Title" error={errors.title?.message}>
                <input type="text" placeholder="e.g. 2 Bedroom Apartment"
                    className={inputCls} {...tealFocus}
                    {...register("title", { required: "Title is required" })} />
            </Field>

            {/* Description */}
            <Field label="Description" error={errors.description?.message}>
                <textarea placeholder="Describe this property item…" rows={3}
                    className={`${inputCls} resize-none`} {...tealFocus}
                    {...register("description", { required: "Description is required" })} />
            </Field>

            {/* Property Type */}
            <Field label="Property Type" error={errors.propertyTypeId ? "Please select a type" : null}>
                <select className={inputCls} {...tealFocus}
                    {...register("propertyTypeId", { required: true })}>
                    <option value="">Choose a type…</option>
                    {propertyType?.map(p => {
                        // BUG FIX: consistent id with _id fallback for option key/value
                        const pid = p?.id || p?._id;
                        return (
                            <option key={pid} value={pid}>
                                {p?.title} — {p?.serviceType?.title} — {p?.serviceType?.service?.title}
                            </option>
                        );
                    })}
                </select>
            </Field>

            <SectionHead icon={FiDollarSign} label="Pricing" />

            <div className="grid grid-cols-3 gap-3">
                <Field label="Price" error={errors.price?.message}>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-gray-400">AED</span>
                        <input type="number" placeholder="0"
                            className={`${inputCls} pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            onWheel={(e) => e.target.blur()} {...tealFocus}
                            {...register("price", { required: "Required", valueAsNumber: true, min: { value: 0, message: "≥ 0" } })} />
                    </div>
                </Field>
                <Field label="Svc Charge" error={errors.serviceCharge?.message}>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-gray-400">AED</span>
                        <input type="number" placeholder="0"
                            className={`${inputCls} pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            onWheel={(e) => e.target.blur()} {...tealFocus}
                            {...register("serviceCharge", { required: "Required", valueAsNumber: true, min: { value: 0, message: "≥ 0" } })} />
                    </div>
                </Field>
                <Field label="VAT %" error={errors.vat?.message}>
                    <div className="relative">
                        <input type="number" placeholder="0"
                            className={`${inputCls} pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            onWheel={(e) => e.target.blur()} {...tealFocus}
                            {...register("vat", { required: "Required", valueAsNumber: true, min: { value: 0, message: "≥ 0" } })} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-gray-400">%</span>
                    </div>
                </Field>
            </div>

            <SectionHead icon={FiStar} label="Features" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(n => (
                    <input key={n} type="text" placeholder={`Feature ${n}`}
                        className={inputCls} {...tealFocus}
                        {...register(`feature${n}`)} />
                ))}
            </div>

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
                            {isEdit ? "Saving changes…" : "Adding item…"}
                        </>
                    ) : (
                        <>
                            {isEdit ? "Save Changes" : "Add Property Item"}
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
                                Property Items
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                Manage your listed property items
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        {/* Count pill */}
                        <div className="px-3 py-1.5 rounded-lg border flex items-center gap-2"
                            style={{ background: 'rgba(1,120,142,0.07)', borderColor: 'rgba(1,120,142,0.2)' }}>
                            <FiLayers className="text-sm" style={{ color: '#01788E' }} />
                            <span className="text-xs sm:text-sm font-semibold" style={{ color: '#01788E' }}>
                                {propertyItem.length} {propertyItem.length === 1 ? "Item" : "Items"}
                            </span>
                        </div>
                        {/* Add button */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #01788E, #015f70)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #015f70, #014d5a)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #01788E, #015f70)'}
                        >
                            <MdOutlineAddPhotoAlternate className="text-base" />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* ── Table Card ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Empty state */}
                    {propertyItem.length === 0 && (
                        <div className="py-16 text-center px-4">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(1,120,142,0.08)' }}>
                                <IoImageOutline className="w-7 h-7" style={{ color: 'rgba(1,120,142,0.5)' }} />
                            </div>
                            <p className="text-sm font-semibold text-gray-600">No items yet</p>
                            <p className="text-xs text-gray-400 mt-1 mb-5">Add your first property item to get started</p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-sm rounded-xl border transition-all"
                                style={{ background: 'rgba(1,120,142,0.07)', color: '#01788E', borderColor: 'rgba(1,120,142,0.2)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(1,120,142,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(1,120,142,0.07)'}
                            >
                                <MdOutlineAddPhotoAlternate /> Add your first item
                            </button>
                        </div>
                    )}

                    {propertyItem.length > 0 && (
                        <>
                            {/* ── Desktop Table ── */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {["#", "Item", "Pricing", "Actions"].map(h => (
                                                <th key={h} className="py-3 px-5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {propertyItem.map((item, idx) => {
                                            // BUG FIX: _id fallback for key
                                            const itemId = item.id || item._id;
                                            return (
                                                <tr key={itemId ?? idx} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="py-3.5 px-5">
                                                        <span className="text-xs font-semibold text-gray-400">#{idx + 1}</span>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-3">
                                                            <img src={item.image} alt={item.title}
                                                                className="w-11 h-11 object-cover rounded-xl border border-gray-200 shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                                                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                                                                    {[item.propertyType?.title, item.propertyType?.serviceType?.title, item.propertyType?.serviceType?.service?.title].filter(Boolean).join(" · ")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <p className="text-sm font-semibold text-gray-900">AED {item.price ?? "—"}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            SC {item.serviceCharge ?? "—"} · VAT {item.vat ?? "—"}%
                                                        </p>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openEditModal(item)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-all">
                                                                <RiEditBoxLine /> Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteItem(item)}
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

                            {/* ── Mobile Cards ── */}
                            <div className="sm:hidden divide-y divide-gray-100">
                                {propertyItem.map((item, idx) => {
                                    const itemId = item.id || item._id;
                                    return (
                                        <div key={itemId ?? idx} className="p-4 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                                            <img src={item.image} alt={item.title}
                                                className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                                    {[item.propertyType?.title, item.propertyType?.serviceType?.title].filter(Boolean).join(" · ")}
                                                </p>
                                                <p className="text-sm font-semibold mt-1" style={{ color: '#01788E' }}>
                                                    AED {item.price ?? "—"}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1.5 shrink-0">
                                                <button onClick={() => openEditModal(item)}
                                                    className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg transition-all">
                                                    <RiEditBoxLine className="text-sm" />
                                                </button>
                                                <button onClick={() => handleDeleteItem(item)}
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
            {isAddModalOpen && (
                <Modal title="Add Property Item" onClose={closeAddModal}>
                    <form onSubmit={handleSubmit(handleAddFormSubmit)}>
                        {renderFormFields(false)}
                    </form>
                </Modal>
            )}

            {/* ── Edit Modal ── */}
            {isEditModalOpen && editItem && (
                <Modal title="Edit Property Item" onClose={closeEditModal}>
                    <form onSubmit={handleSubmit(handleEditFormSubmit)}>
                        {renderFormFields(true)}
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AddPropertyItem;



// main component code
// import { useState } from "react";
// import useDashboardPropertyItem from "../hooks/useDashboardPropertyItem";
// import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";
// import { IoClose } from "react-icons/io5";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import useDashboardPropertyType from "../hooks/userDashboardPropertyType";
// import { GoBrowser } from "react-icons/go";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";

// const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
// const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// const AddPropertyItem = () => {
//     const [propertyItem, refetch] = useDashboardPropertyItem();
//     const [propertyType] = useDashboardPropertyType();
//     const [loading, setLoading] = useState(false);
//     const axiosSecure = useAxiosSecure();

//     const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);

//     // Edit Modal State
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [editItem, setEditItem] = useState(null);

//     // Open / Close Add Modal
//     const openAddModal = () => setIsAddModalOpen(true);
//     const closeAddModal = () => {
//         reset();
//         setIsAddModalOpen(false);
//     };

//     // Open / Close Edit Modal
//     const openEditModal = (item) => {
//         setEditItem(item);
//         setIsEditModalOpen(true);

//         // Edit form-এ default values সেট করুন
//         setValue("title", item.title);
//         setValue("description", item.description);
//         setValue("propertyTypeId", item.propertyTypeId);
//         setValue("price", item.price);
//         setValue("serviceCharge", item.serviceCharge);
//         setValue("vat", item.vat);
//         setValue("feature1", item.feature1);
//         setValue("feature2", item.feature2);
//         setValue("feature3", item.feature3);
//         setValue("feature4", item.feature4);
//     };
//     const closeEditModal = () => {
//         reset();
//         setIsEditModalOpen(false);
//         setEditItem(null);
//     };

//     // Add Form Submit
//     const handleAddFormSubmit = async (data) => {
//         setLoading(true);
//         const formData = new FormData();
//         formData.append("image", data.image[0]);

//         try {
//             const res = await fetch(image_hosting_api, {
//                 method: "POST",
//                 body: formData,
//             });

//             const result = await res.json();
//             if (result.success) {
//                 const imageUrl = result.data.url;

//                 const finalData = {
//                     ...data,
//                     image: imageUrl,
//                 };
//                 const postData = await axiosSecure.post(`/property-items/create`, finalData);

//                 if (postData?.data?.success) {
//                     toast.success("Property Item added successfully");
//                     closeAddModal();
//                     refetch();
//                     reset();
//                 }
//             } else {
//                 toast.error("Image upload failed");
//             }
//         } catch (error) {
//             toast.error(`Something wrong: ${error?.message || error}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Edit Form Submit
//     const handleEditFormSubmit = async (data) => {
//         setLoading(true);

//         let imageUrl = editItem.image;

//         // Check if new image is uploaded
//         if (data.image && data.image[0]) {
//             const formData = new FormData();
//             formData.append("image", data.image[0]);

//             try {
//                 const res = await fetch(image_hosting_api, {
//                     method: "POST",
//                     body: formData,
//                 });

//                 const result = await res.json();
//                 if (result.success) {
//                     imageUrl = result.data.url;
//                 } else {
//                     toast.error("Image upload failed");
//                     setLoading(false);
//                     return;
//                 }
//             } catch (error) {
//                 toast.error(`Image upload error: ${error?.message || error}`);
//                 setLoading(false);
//                 return;
//             }
//         }

//         const finalData = {
//             ...data,
//             image: imageUrl,
//         };

//         // Remove image field if it's a file object (not a string)
//         if (finalData.image && typeof finalData.image !== 'string') {
//             delete finalData.image;
//         }

//         try {
//             const res = await axiosSecure.patch(`/property-items/update/${editItem.id}`, finalData);
//             if (res?.data?.success) {
//                 toast.success("Property Item updated successfully");
//                 closeEditModal();
//                 refetch();
//             } else {
//                 toast.error(res?.message || "Failed to update");
//             }
//         } catch (error) {
//             toast.error(`Update error: ${error?.message || error}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handelDeleteItem = async (item) => {
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
//                     const res = await axiosSecure.delete(`/property-items/delete/${item.id}`)
//                     if (res?.data?.success) {
//                         refetch();
//                         Swal.fire({
//                             title: "Deleted!",
//                             text: "Property Item deleted successfully",
//                             icon: "success"
//                         });
//                     }
//                 }
//             })
//         } catch (error) {
//             console.error(error);
//             toast.error("Something went wrong");
//         }
//     }

//     return (
//         <div className="p-2 md:p-6 border border-[#E5E7EB]">
//             {/* Header */}
//             <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-7">
//                 <h2 className="flex items-center gap-2.5 text-xl font-semibold text-[#5D4F52]">
//                     <GoBrowser className="text-[#01788E]" />Property Item: {propertyItem.length}
//                 </h2>
//                 <button
//                     onClick={openAddModal}
//                     className="btn btn-outline mt-3 md:mt-0"
//                 >
//                     Add Property Item
//                 </button>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//                 <table className="table w-full">
//                     <thead>
//                         <tr className="text-gray-600">
//                             <th>No</th>
//                             <th>Service Type</th>
//                             <th>Edit</th>
//                             <th>Delete</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {propertyItem.map((item, idx) => (
//                             <tr key={idx}>
//                                 <td>{idx + 1}</td>

//                                 <td>
//                                     <div className="flex items-center gap-3">
//                                         <div className="avatar">
//                                             <div className="mask mask-squircle h-12 w-12">
//                                                 <img src={item.image} alt={item.title} />
//                                             </div>
//                                         </div>
//                                         <div className="font-semibold">
//                                             {item.title} - {item.propertyType?.title} -{" "}
//                                             {item.propertyType?.serviceType?.title} -{" "}
//                                             {item.propertyType?.serviceType?.service?.title}
//                                         </div>
//                                     </div>
//                                 </td>

//                                 <td>
//                                     <button
//                                         className="btn btn-ghost btn-xs"
//                                         onClick={() => openEditModal(item)}
//                                     >
//                                         <RiEditBoxLine className="text-xl text-green-500" />
//                                     </button>
//                                 </td>

//                                 <td>
//                                     <button onClick={() => handelDeleteItem(item)} className="btn btn-ghost btn-xs">
//                                         <RiDeleteBin5Line className="text-xl text-red-500" />
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* ---------------------- Add Modal ---------------------- */}
//             {isAddModalOpen && (
//                 <div
//                     className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
//                     onClick={closeAddModal}
//                 >
//                     <div
//                         className="relative bg-white
//                                     w-full
//                                     max-w-md sm:max-w-lg md:max-w-2xl
//                                     p-3 sm:p-5 md:p-8
//                                     rounded-lg sm:rounded-md md:rounded-xl
//                                     shadow-xl
//                                     max-h-[90vh] overflow-y-auto"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         {/* Close Button */}
//                         <button
//                             className="absolute top-3 right-3 text-xl text-gray-600 hover:text-gray-900"
//                             onClick={closeAddModal}
//                         >
//                             <IoClose />
//                         </button>

//                         <h2 className="text-xl md:text-2xl  font-bold text-center mb-6 text-gray-800">
//                             Add Property Item
//                         </h2>

//                         {/* Form */}
//                         <form
//                             onSubmit={handleSubmit(handleAddFormSubmit)}
//                             className="flex flex-col gap-5 p-4"
//                         >
//                             {/* Image */}
//                             <div className="md:col-span-2">
//                                 <label className="font-medium">Image</label>
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     {...register("image", { required: true })}
//                                     className="border p-3 w-full rounded-md"
//                                 />
//                                 {errors.image && (
//                                     <p className="text-red-500 text-sm">Image is required</p>
//                                 )}
//                             </div>

//                             {/* Title */}
//                             <div>
//                                 <label className="font-medium">Title</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Enter title"
//                                     className="input input-bordered w-full mt-1"
//                                     {...register("title", { required: "Title is required" })}
//                                 />
//                                 {errors.title && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
//                                 )}
//                             </div>

//                             {/* Description */}
//                             <div>
//                                 <label className="font-medium">Description</label>
//                                 <textarea
//                                     placeholder="Enter description"
//                                     className="textarea textarea-bordered w-full mt-1"
//                                     {...register("description", { required: "Description is required" })}
//                                 />
//                                 {errors.description && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
//                                 )}
//                             </div>

//                             {/* Property Type Dropdown */}
//                             <div>
//                                 <label className="block font-medium mb-1">Property Type</label>
//                                 <select
//                                     {...register("propertyTypeId", { required: true })}
//                                     className="border p-3 w-full rounded-md"
//                                 >
//                                     <option value="">Select Property Type</option>
//                                     {propertyType?.map(p => (
//                                         <option key={p?.id} value={p?.id}>
//                                             {p?.title} - {p?.serviceType?.title} - {p?.serviceType?.service?.title}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.propertyTypeId && <p className="text-red-500 text-sm">Required</p>}
//                             </div>

//                             {/* Price - Service Charge - VAT */}
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div>
//                                     <label className="font-medium">Price</label>
//                                     <input
//                                         type="number"
//                                         placeholder="Price"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("price", { required: "Price is required", valueAsNumber: true })}
//                                     />
//                                     {errors.price && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">Service Charge</label>
//                                     <input
//                                         type="number"
//                                         placeholder="Service Charge"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("serviceCharge", { required: "Service charge is required", valueAsNumber: true })}
//                                     />
//                                     {errors.serviceCharge && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.serviceCharge.message}</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">VAT</label>
//                                     <input
//                                         type="number"
//                                         placeholder="VAT"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("vat", { required: "VAT is required", valueAsNumber: true })}
//                                     />
//                                     {errors.vat && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.vat.message}</p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Features Section */}
//                             <div>
//                                 <label className="font-medium block mb-2">Features</label>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-32 overflow-y-auto pr-2">
//                                     <input
//                                         type="text"
//                                         placeholder="Feature 1"
//                                         className="input input-bordered w-full"
//                                         {...register("feature1")}
//                                     />
//                                     <input
//                                         type="text"
//                                         placeholder="Feature 2"
//                                         className="input input-bordered w-full"
//                                         {...register("feature2")}
//                                     />
//                                     <input
//                                         type="text"
//                                         placeholder="Feature 3"
//                                         className="input input-bordered w-full"
//                                         {...register("feature3")}
//                                     />
//                                     <input
//                                         type="text"
//                                         placeholder="Feature 4"
//                                         className="input input-bordered w-full"
//                                         {...register("feature4")}
//                                     />
//                                 </div>
//                             </div>

//                             {/* Submit */}
//                             <button
//                                 disabled={loading}
//                                 className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#016377] transition-colors"
//                             >
//                                 {loading ? 'Submitting...' : 'Submit'}
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* ---------------------- Edit Modal ---------------------- */}
//             {isEditModalOpen && editItem && (
//                 <div
//                     className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
//                     onClick={closeEditModal}
//                 >
//                     <div
//                         className="relative bg-white
//                                     w-full
//                                     max-w-md sm:max-w-lg md:max-w-2xl
//                                     p-3 sm:p-5 md:p-8
//                                     rounded-lg sm:rounded-md md:rounded-xl
//                                     shadow-xl
//                                     max-h-[90vh] overflow-y-auto"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         {/* Close Button */}
//                         <button
//                             className="absolute top-3 right-3 text-xl text-gray-600 hover:text-gray-900"
//                             onClick={closeEditModal}
//                         >
//                             <IoClose />
//                         </button>

//                         <h2 className="text-xl md:text-2xl  font-bold text-center mb-6 text-gray-800">
//                             Edit Property Item
//                         </h2>

//                         {/* Form */}
//                         <form
//                             onSubmit={handleSubmit(handleEditFormSubmit)}
//                             className="flex flex-col gap-5 p-4"
//                         >
//                             {/* Image */}
//                             <div className="md:col-span-2">
//                                 <label className="font-medium">Image</label>
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     {...register("image")}
//                                     className="border p-3 w-full rounded-md"
//                                 />
//                                 {editItem?.image && (
//                                     <div className="mt-2">
//                                         <p className="text-sm text-gray-600 mb-1">Current Image:</p>
//                                         <img
//                                             className="w-28 h-28 object-cover rounded-md border"
//                                             src={editItem.image}
//                                             alt="Current"
//                                         />
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Title */}
//                             <div>
//                                 <label className="font-medium">Title</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Enter title"
//                                     className="input input-bordered w-full mt-1"
//                                     {...register("title", { required: "Title is required" })}
//                                 />
//                                 {errors.title && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
//                                 )}
//                             </div>

//                             {/* Description */}
//                             <div>
//                                 <label className="font-medium">Description</label>
//                                 <textarea
//                                     placeholder="Enter description"
//                                     className="textarea textarea-bordered w-full mt-1"
//                                     {...register("description", { required: "Description is required" })}
//                                 />
//                                 {errors.description && (
//                                     <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
//                                 )}
//                             </div>

//                             {/* Property Type Dropdown */}
//                             <div>
//                                 <label className="block font-medium mb-1">Property Type</label>
//                                 <select
//                                     {...register("propertyTypeId", { required: true })}
//                                     className="border p-3 w-full rounded-md"
//                                 >
//                                     <option value="">Select Property Type</option>
//                                     {propertyType?.map(p => (
//                                         <option key={p?.id} value={p?.id}>
//                                             {p?.title} - {p?.serviceType?.title} - {p?.serviceType?.service?.title}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {errors.propertyTypeId && <p className="text-red-500 text-sm">Required</p>}
//                             </div>

//                             {/* Price - Service Charge - VAT */}
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div>
//                                     <label className="font-medium">Price</label>
//                                     <input
//                                         type="number"
//                                         placeholder="Price"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("price", { required: "Price is required", valueAsNumber: true })}
//                                     />
//                                     {errors.price && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">Service Charge</label>
//                                     <input
//                                         type="number"
//                                         placeholder="Service Charge"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("serviceCharge", { required: "Service charge is required", valueAsNumber: true })}
//                                     />
//                                     {errors.serviceCharge && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.serviceCharge.message}</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">VAT</label>
//                                     <input
//                                         type="number"
//                                         placeholder="VAT"
//                                         className="input input-bordered w-full mt-1"
//                                         {...register("vat", { required: "VAT is required", valueAsNumber: true })}
//                                     />
//                                     {errors.vat && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.vat.message}</p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Features Section */}
//                             <div>
//                                 <label className="font-medium block mb-2">Features</label>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                                     <input
//                                         type="text"
//                                         placeholder="Feature 1"
//                                         className="input input-bordered w-full"
//                                         {...register("feature1")}
//                                     />
//                                     <input
//                                         type="text"
//                                         placeholder="Feature 2"
//                                         className="input input-bordered w-full"
//                                         {...register("feature2")}
//                                     />
//                                     <input
//                                         type="text"
//                                         placeholder="Feature 3"
//                                         className="input input-bordered w-full"
//                                         {...register("feature3")}
//                                     />
//                                     <input
//                                         type="text"
//                                         placeholder="Feature 4"
//                                         className="input input-bordered w-full"
//                                         {...register("feature4")}
//                                     />
//                                 </div>
//                             </div>

//                             {/* Submit */}
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#016377] transition-colors"
//                             >
//                                 {loading ? 'Updating...' : 'Update'}
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AddPropertyItem;