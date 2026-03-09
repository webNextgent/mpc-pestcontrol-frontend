/* eslint-disable no-unused-vars */
import { useState } from "react";
import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";
import { IoClose, IoImageOutline } from "react-icons/io5";
import useDashboardServiceType from "../hooks/useDashboardServiceType";
import { GoBrowser } from "react-icons/go";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAllServices from "../hooks/useAllServices";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { FiLayers } from "react-icons/fi";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// ── Shared styles — teal palette ──────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all bg-gray-50/30 placeholder:text-gray-300";
const labelCls = "block text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
const errCls   = "text-red-500 text-[11px] mt-1";

// ── Input focus helper ────────────────────────────────────────────────────────
const tealFocus = {
    onFocus: (e) => { e.target.style.borderColor = '#01788E'; e.target.style.boxShadow = '0 0 0 2px rgba(1,120,142,0.15)'; },
    onBlur:  (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }
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
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                    <IoClose className="w-4 h-4" />
                </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5">{children}</div>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function AddServiceType() {
    const [serviceType, refetch] = useDashboardServiceType();
    const [services]             = useAllServices();
    const [loading, setLoading]  = useState(false);
    const [selectedValue, setSelectedValue] = useState(null);
    const axiosSecure = useAxiosSecure();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    const {
        register:     registerEdit,
        handleSubmit: handleEditSubmit,
        reset:        resetEdit,
        formState:    { errors: editErrors }
    } = useForm();

    const [isModalOpenAdd,  setIsModalOpenAdd]  = useState(false);
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);

    const openAddModal  = () => { reset(); setSelectedValue(null); setIsModalOpenAdd(true); };
    const closeAddModal = () => { reset(); setIsModalOpenAdd(false); };

    const openEditModal = (service) => {
        // BUG FIX: serviceId fallback — API may return nested service object instead of flat serviceId
        const sid = service.serviceId || service.service?.id || (service.service?._id ?? "");
        resetEdit({
            title:     service.title ?? "",
            serviceId: sid,
        });
        setSelectedValue(service);
        setIsModalOpenEdit(true);
    };

    const closeEditModal = () => { resetEdit(); setIsModalOpenEdit(false); setSelectedValue(null); };

    // ── Image upload helper ───────────────────────────────────────────────────
    const uploadImage = async (file) => {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(image_hosting_api, { method: "POST", body: fd });
        const r   = await res.json();
        if (!r.success) throw new Error("Image upload failed");
        return r.data.url;
    };

    // ── Add submit ────────────────────────────────────────────────────────────
    const handleFormSubmitAdd = async (data) => {
        setLoading(true);
        try {
            const imageUrl  = await uploadImage(data.image[0]);
            const finalData = { ...data, image: imageUrl };
            const res       = await axiosSecure.post("/service-type/create", finalData);
            if (res?.data?.success) {
                toast.success("Service Type added successfully");
                closeAddModal(); refetch();
            } else {
                toast.error(res?.data?.message || "Failed to add service type");
            }
        } catch (err) {
            toast.error(err?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    // ── Edit submit ───────────────────────────────────────────────────────────
    const handleFormSubmitEdit = async (data) => {
        setLoading(true);
        try {
            let imageUrl = selectedValue.image;
            // BUG FIX: FileList length check instead of truthy on FileList object
            if (data.image && data.image.length > 0) {
                imageUrl = await uploadImage(data.image[0]);
            }
            const updatedData = { ...data, image: imageUrl };
            // BUG FIX: _id fallback for edit endpoint
            const itemId = selectedValue.id || selectedValue._id;
            const res = await axiosSecure.patch(`/service-type/update/${itemId}`, updatedData);
            if (res?.data?.success) {
                toast.success("Service Type updated successfully");
                closeEditModal(); refetch();
            } else {
                toast.error(res?.data?.message || "Failed to update");
            }
        } catch (err) {
            toast.error(err?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteServiceType = (service) => {
        // BUG FIX: _id fallback
        const serviceId = service.id || service._id;
        Swal.fire({
            title:              "Are you sure?",
            text:               `"${service.title}" will be permanently deleted.`,
            icon:               "warning",
            showCancelButton:   true,
            confirmButtonColor: "#01788E",
            cancelButtonColor:  "#d33",
            confirmButtonText:  "Yes, delete it!",
            reverseButtons:     true,
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await axiosSecure.delete(`/service-type/delete/${serviceId}`);
                if (res?.data?.success) {
                    refetch(); toast.success("Service Type deleted");
                } else {
                    toast.error(res?.data?.message || "Failed to delete");
                }
            } catch (err) {
                toast.error(err?.message || "Something went wrong");
            }
        });
    };

    // ── Shared form ───────────────────────────────────────────────────────────
    const renderFormFields = (reg, errs, isEdit = false) => (
        <div className="space-y-4">

            <SectionHead icon={GoBrowser} label="Basic Info" />

            <Field label="Title" error={errs.title?.message}>
                <input type="text" placeholder="e.g. Deep Cleaning"
                    className={inputCls} {...tealFocus}
                    {...reg("title", { required: "Title is required" })} />
            </Field>

            <Field label="Service" error={errs.serviceId?.message}>
                <select className={inputCls} {...tealFocus}
                    {...reg("serviceId", { required: "Service is required" })}>
                    <option value="">Choose a service…</option>
                    {services?.map((ser) => {
                        // BUG FIX: _id fallback for option key/value
                        const serId = ser.id || ser._id;
                        return (
                            <option key={serId} value={serId}>{ser.title}</option>
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
                {isEdit && selectedValue?.image && (
                    <div className="mt-2 flex items-center gap-3 p-3 rounded-xl border"
                        style={{ background: 'rgba(1,120,142,0.05)', borderColor: 'rgba(1,120,142,0.15)' }}>
                        <img src={selectedValue.image} alt={selectedValue.title}
                            className="w-12 h-12 object-cover rounded-lg shrink-0 border"
                            style={{ borderColor: 'rgba(1,120,142,0.2)' }} />
                        <div>
                            <p className="text-xs font-semibold text-gray-600">Current photo</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Upload a new one to replace</p>
                        </div>
                    </div>
                )}
            </Field>

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
                            {isEdit ? "Save Changes" : "Add Service Type"}
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
                                Service Types
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                Manage your service type listings
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        {/* Count pill */}
                        <div className="px-3 py-1.5 rounded-lg border flex items-center gap-2"
                            style={{ background: 'rgba(1,120,142,0.07)', borderColor: 'rgba(1,120,142,0.2)' }}>
                            <FiLayers className="text-sm" style={{ color: '#01788E' }} />
                            <span className="text-xs sm:text-sm font-semibold" style={{ color: '#01788E' }}>
                                {serviceType.length} {serviceType.length === 1 ? "Type" : "Types"}
                            </span>
                        </div>
                        {/* Add button */}
                        <button
                            onClick={openAddModal}
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
                    {serviceType.length === 0 && (
                        <div className="py-16 text-center px-4">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(1,120,142,0.08)' }}>
                                <IoImageOutline className="w-7 h-7" style={{ color: 'rgba(1,120,142,0.5)' }} />
                            </div>
                            <p className="text-sm font-semibold text-gray-600">No service types yet</p>
                            <p className="text-xs text-gray-400 mt-1 mb-5">Add your first service type to get started</p>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-sm rounded-xl border transition-all"
                                style={{ background: 'rgba(1,120,142,0.07)', color: '#01788E', borderColor: 'rgba(1,120,142,0.2)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(1,120,142,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(1,120,142,0.07)'}
                            >
                                <MdOutlineAddPhotoAlternate /> Add your first type
                            </button>
                        </div>
                    )}

                    {serviceType.length > 0 && (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {["#", "Service Type", "Actions"].map(h => (
                                                <th key={h} className="py-3 px-5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {serviceType.map((service, idx) => {
                                            // BUG FIX: _id fallback for row key
                                            const sid = service.id || service._id;
                                            return (
                                                <tr key={sid ?? idx} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="py-3.5 px-5">
                                                        <span className="text-xs font-semibold text-gray-400">#{idx + 1}</span>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-3">
                                                            <img src={service.image} alt={service.title}
                                                                className="w-11 h-11 object-cover rounded-xl border border-gray-200 shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">{service.title}</p>
                                                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                                    {service?.service?.title ?? "No Service"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openEditModal(service)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-all">
                                                                <RiEditBoxLine /> Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteServiceType(service)}
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
                                {serviceType.map((service, idx) => {
                                    const sid = service.id || service._id;
                                    return (
                                        <div key={sid ?? idx} className="p-4 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                                            <img src={service.image} alt={service.title}
                                                className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{service.title}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                                    {service?.service?.title ?? "No Service"}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1.5 shrink-0">
                                                <button onClick={() => openEditModal(service)}
                                                    className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg transition-all">
                                                    <RiEditBoxLine className="text-sm" />
                                                </button>
                                                <button onClick={() => handleDeleteServiceType(service)}
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
            {isModalOpenAdd && (
                <Modal title="Add Service Type" onClose={closeAddModal}>
                    <form onSubmit={handleSubmit(handleFormSubmitAdd)}>
                        {renderFormFields(register, errors, false)}
                    </form>
                </Modal>
            )}

            {/* ── Edit Modal ── */}
            {isModalOpenEdit && selectedValue && (
                <Modal title="Edit Service Type" onClose={closeEditModal}>
                    <form onSubmit={handleEditSubmit(handleFormSubmitEdit)}>
                        {renderFormFields(registerEdit, editErrors, true)}
                    </form>
                </Modal>
            )}
        </div>
    );
};








// import { useState } from "react";
// import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";
// import { IoClose } from "react-icons/io5";
// import useDashboardServiceType from "../hooks/useDashboardServiceType";
// import { GoBrowser } from "react-icons/go";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import useAllServices from "../hooks/useAllServices";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";

// const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
// const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// export default function AddServiceType() {
//   const [serviceType, refetch] = useDashboardServiceType();
//   const [services] = useAllServices();
//   const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
//   const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedValue, setSelectedValue] = useState(null);
//   const axiosSecure = useAxiosSecure();

//   const { register, handleSubmit, formState: { errors }, reset } = useForm();

//   // ------------------ Add Service Type ------------------
//   const handleFormSubmitAdd = async (data) => {
//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("image", data.image[0]);
//       const res = await fetch(image_hosting_api, { method: "POST", body: formData });
//       const result = await res.json();

//       if (!result.success) {
//         toast.error("Image upload failed");
//         setLoading(false);
//         return;
//       }

//       const finalData = { ...data, image: result.data.url };

//       const postData = await axiosSecure.post('/service-type/create', finalData);

//       if (postData?.data?.success) {
//         toast.success("Service added successfully");
//         setIsModalOpenAdd(false);
//         reset();
//         refetch();
//       }
//     } catch (error) {
//       toast.error(`Something wrong: ${error?.message || error}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ------------------ Edit Service Type ------------------
//   const handleFormSubmitEdit = async (data) => {
//     setLoading(true);
//     try {
//       let imageUrl = selectedValue.image;

//       if (data.image && data.image.length > 0) {
//         const formData = new FormData();
//         formData.append("image", data.image[0]);

//         const res = await fetch(image_hosting_api, { method: "POST", body: formData });
//         const imgResult = await res.json();

//         if (!imgResult.success) {
//           toast.error("Image upload failed");
//           setLoading(false);
//           return;
//         }

//         imageUrl = imgResult.data.url;
//       }

//       const updatedData = { ...data, image: imageUrl };

//       const updateRes = await axiosSecure.patch(`/service-type/update/${selectedValue.id}`, updatedData);
//       if (updateRes?.data?.success) {
//         toast.success("Service updated successfully");
//         setIsModalOpenEdit(false);
//         refetch();
//       } else {
//         toast.error("Failed to update");
//       }
//     } catch (error) {
//       toast.error(`Error: ${error?.message} `);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handelDeleteServiceType = async (service) => {
//     try {
//       Swal.fire({
//         title: "Are you sure?",
//         text: "You won't be able to revert this!",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonColor: "#3085d6",
//         cancelButtonColor: "#d33",
//         confirmButtonText: "Yes, delete it!"
//       }).then(async (result) => {
//         if (result.isConfirmed) {
//           const res = await axiosSecure.delete(`/service-type/delete/${service.id}`);
//           if (res?.data?.success) {
//             refetch();
//             Swal.fire({
//               title: "Deleted!",
//               text: "Service deleted successfully",
//               icon: "success"
//             });
//           }
//         }
//       })
//     } catch (error) {
//       console.error(error);
//       toast.error("Something went wrong");
//     }
//   };

//   return (
//     <>
//       {/* ------------------- Table ------------------- */}
//       <div className="border border-[#E5E7EB] px-2 md:px-6 py-4 rounded-lg bg-white w-full max-w-4xl mx-auto">
//         <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
//           <h2 className="flex items-center gap-2.5 text-xl font-semibold text-[#5D4F52]">
//             <GoBrowser className="text-[#01788E]" /> Service Type: {serviceType.length}
//           </h2>
//           <button
//             onClick={() => {
//               setIsModalOpenAdd(true);
//               reset({ title: "", serviceId: "" });
//               setSelectedValue(null);
//             }}
//             className="btn btn-outline mt-3 md:mt-0"
//           >
//             Add Service Type
//           </button>
//         </div>

//         <div className="mt-2 md:mt-10 flex flex-col items-center">
//           <div className="w-full overflow-x-auto">
//             <table className="table w-full">
//               <thead>
//                 <tr className="text-gray-600">
//                   <th>No</th>
//                   <th>Service Type</th>
//                   <th>Edit</th>
//                   <th>Delete</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {serviceType.map((service, idx) => (
//                   <tr key={idx}>
//                     <td>{idx + 1}</td>
//                     <td>
//                       <div className="flex items-center gap-3">
//                         <div className="avatar">
//                           <div className="mask mask-squircle h-12 w-12">
//                             <img src={service.image} alt="" />
//                           </div>
//                         </div>
//                         <div className="font-semibold">
//                           {service.title} - {service?.service?.title ?? "No Service"}
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <button className="btn btn-ghost btn-xs">
//                         <RiEditBoxLine
//                           onClick={() => {
//                             setSelectedValue(service);
//                             setIsModalOpenEdit(true);
//                             reset({
//                               title: service.title,
//                               serviceId: service.serviceId,
//                             });
//                           }}
//                           className="text-xl text-green-500"
//                         />
//                       </button>
//                     </td>
//                     <td>
//                       <button onClick={() => handelDeleteServiceType(service)} className="btn btn-ghost btn-xs">
//                         <RiDeleteBin5Line className="text-xl text-red-500" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* ------------------- Add Modal ------------------- */}
//       {isModalOpenAdd && (
//         <div
//           className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
//           onClick={() => setIsModalOpenAdd(false)}
//         >
//           <div
//             className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg relative"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={() => setIsModalOpenAdd(false)}
//               className="absolute top-3 right-3 text-2xl text-gray-600 hover:text-red-500"
//             >
//               <IoClose />
//             </button>

//             <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
//               Add New Service Type
//             </h2>

//             <form onSubmit={handleSubmit(handleFormSubmitAdd)} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="font-medium">Title</label>
//                   <input
//                     type="text"
//                     {...register("title", { required: true })}
//                     className="border p-2 w-full rounded-md"
//                     placeholder="Enter title"
//                   />
//                   {errors.title && <p className="text-red-500 text-sm">Title is required</p>}
//                 </div>

//                 <div>
//                   <label className="block font-medium mb-1">Service Type</label>
//                   <select {...register("serviceId", { required: true })} className="border p-2 w-full rounded-md">
//                     <option value="">Select Service</option>
//                     {services?.map((ser) => (
//                       <option key={ser.id} value={ser.id}>
//                         {ser.title}
//                       </option>
//                     ))}
//                   </select>
//                   {errors.services && <p className="text-red-500 text-sm">Required</p>}
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="font-medium">Service Type Image</label>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     {...register("image", { required: true })}
//                     className="border w-full p-2 rounded-md"
//                   />
//                   {errors.image && <p className="text-red-500 text-sm">Image is required</p>}
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg"
//               >
//                 {loading ? "Submitting..." : "Submit"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ------------------- Edit Modal ------------------- */}
//       {isModalOpenEdit && (
//         <div
//           className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
//           onClick={() => setIsModalOpenEdit(false)}
//         >
//           <div
//             className="bg-white w-full max-w-xl p-6 rounded-lg shadow-lg relative"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={() => setIsModalOpenEdit(false)}
//               className="absolute top-3 right-3 text-2xl text-gray-600 hover:text-red-500"
//             >
//               <IoClose />
//             </button>

//             <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
//               Edit Service Type
//             </h2>

//             <form onSubmit={handleSubmit(handleFormSubmitEdit)} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="font-medium">Title</label>
//                   <input
//                     type="text"
//                     defaultValue={selectedValue?.title || ""}
//                     {...register("title", { required: true })}
//                     className="border p-2 w-full rounded-md"
//                   />
//                   {errors.title && <p className="text-red-500 text-sm">Title is required</p>}
//                 </div>

//                 <div>
//                   <label className="block font-medium mb-1">Service Type</label>
//                   <select
//                     defaultValue={selectedValue?.serviceId || ""}
//                     {...register("serviceId", { required: true })}
//                     className="border p-2 w-full rounded-md"
//                   >
//                     <option value="">Select Service</option>
//                     {services?.map((ser) => (
//                       <option key={ser.id} value={ser.id}>
//                         {ser.title}
//                       </option>
//                     ))}
//                   </select>
//                   {errors.services && <p className="text-red-500 text-sm">Required</p>}
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="font-medium">Service Type Image</label>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     {...register("image")} // optional
//                     className="border w-full p-2 rounded-md"
//                   />
//                   {selectedValue?.image && (
//                     <img className="h-14 w-28 mt-3.5" src={selectedValue.image} alt="" />
//                   )}
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg"
//               >
//                 {loading ? "Submitting..." : "Submit"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };