/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAllServices from "../hooks/useAllServices";
import { RiEditBoxLine, RiDeleteBin5Line } from "react-icons/ri";
import { IoClose, IoImageOutline } from "react-icons/io5";
import EditModal from "../components/EditModal/EditModal";
import { GoBrowser } from "react-icons/go";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { FiLayers, FiStar, FiBookOpen } from "react-icons/fi";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-gray-50/30 placeholder:text-gray-300";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
const errCls   = "text-red-500 text-xs mt-1";

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
    <div>
        {label && <label className={labelCls}>{label}</label>}
        {children}
        {error && <p className={errCls}>· {error}</p>}
    </div>
);

// ── Section divider ───────────────────────────────────────────────────────────
const SectionHead = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 pt-1 pb-1">
        <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
            <Icon className="text-blue-600 text-xs" />
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
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
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600 shrink-0" />
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                        <GoBrowser className="text-blue-600 text-base" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
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
const AddServices = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [loading, setLoading]       = useState(false);
    const [services, isFetching, refetch] = useAllServices();
    const [selectedService, setSelectedService] = useState(null);
    const [isModalOpenAdd,  setIsModalOpenAdd]  = useState(false);
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const axiosSecure = useAxiosSecure();

    const openAddModal  = () => { reset(); setIsModalOpenAdd(true); };
    const closeAddModal = () => { reset(); setIsModalOpenAdd(false); };

    const openEditModal = (service) => {
        setSelectedService(service);
        setIsModalOpenEdit(true);
    };

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
    const handleFormSubmit = async (data) => {
        setLoading(true);
        try {
            const imageUrl  = await uploadImage(data.image[0]);
            const finalData = { ...data, image: imageUrl };
            const res       = await axiosSecure.post("/service/create", finalData);
            if (res?.data?.success) {
                toast.success("Service added successfully");
                closeAddModal();
                refetch();
            } else {
                toast.error(res?.data?.message || "Failed to add service");
            }
        } catch (err) {
            toast.error(err?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = (service) => {
        Swal.fire({
            title:              "Are you sure?",
            text:               `"${service.title}" will be permanently deleted.`,
            icon:               "warning",
            showCancelButton:   true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor:  "#d33",
            confirmButtonText:  "Yes, delete it!",
            reverseButtons:     true,
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await axiosSecure.delete(`/service/delete/${service.id}`);
                if (res?.data?.success) {
                    refetch(); toast.success("Service deleted");
                } else {
                    toast.error(res?.data?.message || "Failed to delete");
                }
            } catch (err) {
                toast.error(err?.message || "Something went wrong");
            }
        });
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isFetching) return (
        <div className="min-h-screen bg-gray-50/70 flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading services…</span>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50/70 p-3 sm:p-5 md:p-6">
            <div className="max-w-5xl mx-auto space-y-5">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm shrink-0">
                            <GoBrowser className="text-base sm:text-xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
                                Services
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                Manage your service listings
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                            <FiLayers className="text-blue-600 text-sm" />
                            <span className="text-xs sm:text-sm font-semibold text-blue-700">
                                {services.length} {services.length === 1 ? "Service" : "Services"}
                            </span>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            <MdOutlineAddPhotoAlternate className="text-base" />
                            Add Service
                        </button>
                    </div>
                </div>

                {/* ── Table Card ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Empty state */}
                    {services.length === 0 && (
                        <div className="py-16 text-center px-4">
                            <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <IoImageOutline className="w-7 h-7 text-blue-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-600">No services yet</p>
                            <p className="text-xs text-gray-400 mt-1 mb-5">Add your first service to get started</p>
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-xl border border-blue-100 transition-all"
                            >
                                <MdOutlineAddPhotoAlternate /> Add your first service
                            </button>
                        </div>
                    )}

                    {services.length > 0 && (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {["#", "Service", "Description", "Stats", "Actions"].map(h => (
                                                <th key={h} className="py-3 px-5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {services.map((service, idx) => (
                                            <tr key={service.id ?? idx} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="py-3.5 px-5">
                                                    <span className="text-xs font-semibold text-gray-400">#{idx + 1}</span>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <img src={service.image} alt={service.title}
                                                            className="w-11 h-11 object-cover rounded-xl border border-gray-200 shrink-0" />
                                                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                                                            {service.title}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 max-w-[200px]">
                                                    <p className="text-xs text-gray-500 truncate">{service.des1}</p>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                                                            <FiStar className="text-[10px]" /> {service.rated ?? "—"}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-blue-500 font-semibold">
                                                            <FiBookOpen className="text-[10px]" /> {service.totalBooking ?? "—"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openEditModal(service)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-all">
                                                            <RiEditBoxLine /> Edit
                                                        </button>
                                                        <button onClick={() => handleDelete(service)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                                            title="Delete">
                                                            <RiDeleteBin5Line className="text-base" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="sm:hidden divide-y divide-gray-100">
                                {services.map((service, idx) => (
                                    <div key={service.id ?? idx} className="p-4 flex items-center gap-3 hover:bg-gray-50/60 transition-colors">
                                        <img src={service.image} alt={service.title}
                                            className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{service.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{service.des1}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                                                    <FiStar className="text-[10px]" /> {service.rated ?? "—"}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-blue-500 font-semibold">
                                                    <FiBookOpen className="text-[10px]" /> {service.totalBooking ?? "—"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5 shrink-0">
                                            <button onClick={() => openEditModal(service)}
                                                className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg transition-all">
                                                <RiEditBoxLine className="text-sm" />
                                            </button>
                                            <button onClick={() => handleDelete(service)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-100 rounded-lg transition-all">
                                                <RiDeleteBin5Line className="text-sm" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Add Modal ── */}
            {isModalOpenAdd && (
                <Modal title="Add New Service" onClose={closeAddModal}>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <div className="space-y-4">

                            <SectionHead icon={IoImageOutline} label="Photo & Identity" />

                            <Field label="Service Image" error={errors.image ? "Image is required" : null}>
                                <input
                                    type="file" accept="image/*"
                                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-xl px-2 py-2 bg-gray-50/30 transition-all cursor-pointer"
                                    {...register("image", { required: true })} />
                            </Field>

                            <Field label="Title" error={errors.title ? "Title is required" : null}>
                                <input type="text" placeholder="e.g. Home Cleaning"
                                    className={inputCls}
                                    {...register("title", { required: true })} />
                            </Field>

                            <SectionHead icon={GoBrowser} label="Descriptions" />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Field label="Description 1" error={errors.des1 ? "Required" : null}>
                                    <input type="text" placeholder="Short description…"
                                        className={inputCls}
                                        {...register("des1", { required: true })} />
                                </Field>
                                <Field label="Description 2" error={errors.des2 ? "Required" : null}>
                                    <input type="text" placeholder="Short description…"
                                        className={inputCls}
                                        {...register("des2", { required: true })} />
                                </Field>
                                <Field label="Description 3" error={errors.des3 ? "Required" : null}>
                                    <input type="text" placeholder="Short description…"
                                        className={inputCls}
                                        {...register("des3", { required: true })} />
                                </Field>
                            </div>

                            <SectionHead icon={FiStar} label="Stats" />

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Rated" error={errors.rated ? "Required" : null}>
                                    <input type="text" placeholder="e.g. 4.5"
                                        className={inputCls}
                                        {...register("rated", { required: true })} />
                                </Field>
                                <Field label="Total Booking" error={errors.totalBooking ? "Required" : null}>
                                    <input type="text" placeholder="e.g. 350"
                                        className={inputCls}
                                        {...register("totalBooking", { required: true })} />
                                </Field>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit" disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-100 hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Adding…
                                        </>
                                    ) : (
                                        <>
                                            Add Service
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── Edit Modal (existing EditModal component) ── */}
            {isModalOpenEdit && selectedService && (
                <EditModal
                    service={selectedService}
                    onClose={() => setIsModalOpenEdit(false)}
                />
            )}
        </div>
    );
};

export default AddServices;







// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import useAllServices from "../hooks/useAllServices";
// import { RiEditBoxLine } from "react-icons/ri";
// import { RiDeleteBin5Line } from "react-icons/ri";
// import EditModal from "../components/EditModal/EditModal";
// import { GoBrowser } from "react-icons/go";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";


// const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
// const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

// const AddServices = () => {
//     const { register, handleSubmit, formState: { errors }, reset } = useForm();
//     const [loading, setLoading] = useState(false);
//     const [services, isLoading, refetch] = useAllServices();
//     const [selectedService, setSelectedService] = useState(null);
//     const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
//     const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
//     const axiosSecure = useAxiosSecure();

//     const handleFormSubmit = async (data) => {
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
//                 const postData = await axiosSecure.post('/service/create', finalData);
//                 if ((postData?.data?.success)) {
//                     toast.success("Service added successfully");
//                     setIsModalOpenAdd(false);
//                     refetch();
//                 }
//             } else {
//                 toast.error("Image upload failed");
//             }
//         } catch (error) {
//             toast.error(`Something wrong: ${error?.message || error}`);
//             // // console.log(error);

//         } finally {
//             setLoading(false);
//             reset();
//         }
//     };

//     const handelDelete = async (service) => {
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
//                     const res = await axiosSecure.delete(`/service/delete/${service.id}`);
//                     if (res?.data?.success) {
//                         refetch();
//                         Swal.fire({
//                             title: "Deleted!",
//                             text: "Service deleted successfully",
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


//     if (isLoading) return <p className="text-center mt-10">Loading...</p>;
//     return (
//         <div className="border border-[#E5E7EB] px-2 md:px-6 py-4 rounded-lg bg-white w-full max-w-4xl mx-auto">
//             <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
//                 <h2 className="flex items-center gap-2.5 text-xl font-semibold text-[#5D4F52]">
//                     <GoBrowser className="text-[#01788E]" />Services: {services.length}
//                 </h2>
//                 <button
//                     onClick={() => setIsModalOpenAdd(true)}
//                     className="btn btn-outline mt-3 md:mt-0"
//                 >
//                     Add services
//                 </button>
//             </div>

//             <div className="mt-2 md:mt-10 flex flex-col items-center">
//                 <div className="w-full">
//                     <div className="overflow-x-auto">
//                         <table className="table">
//                             <thead>
//                                 <tr className="text-gray-600">
//                                     <th>No</th>
//                                     <th>Service Name</th>
//                                     <th>Description</th>
//                                     <th>Total Booking</th>
//                                     <th>Edit</th>
//                                     <th>Delete</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {services.map((service, idx) => (
//                                     <tr key={idx}>
//                                         <th>{idx + 1}</th>
//                                         <td>
//                                             <div className="flex items-center gap-3">
//                                                 <div className="avatar">
//                                                     <div className="mask mask-squircle h-12 w-12">
//                                                         <img
//                                                             src={service.image}
//                                                             alt="Avatar Tailwind CSS Component" />
//                                                     </div>
//                                                 </div>
//                                                 <div>
//                                                     <div className="font-bold">{service.title}</div>
//                                                     <div className="text-sm opacity-50">Rated: {service.rated}</div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             {service.des1}
//                                             <br />
//                                         </td>
//                                         <td>Total Booking: {service.totalBooking}</td>
//                                         <th>
//                                             <button
//                                                 title="Edit"
//                                                 className="btn btn-ghost btn-xs"
//                                                 onClick={() => {
//                                                     setSelectedService(service);
//                                                     setIsModalOpenEdit(true);
//                                                 }}
//                                             >
//                                                 <RiEditBoxLine className="text-xl text-green-500" />
//                                             </button>
//                                         </th>
//                                         <th>
//                                             <button onClick={() => handelDelete(service)} title="Delete" className="btn btn-ghost btn-xs"><RiDeleteBin5Line className="text-xl text-red-400" /></button>
//                                         </th>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//             {/* Add service  */}
//             {isModalOpenAdd && (
//                 <div
//                     className="
//                                 fixed inset-0 
//                                 bg-black/50 
//                                 flex justify-center items-center 
//                                 z-50 
//                                 p-2 sm:p-4 md:p-6
//                             "
//                     onClick={() => setIsModalOpenAdd(false)}
//                 >
//                     <div
//                         className="
//                                     relative bg-white 
//                                     w-full 
//                                     max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
//                                     p-3 sm:p-5 md:p-8 
//                                     rounded-lg
//                                     shadow-xl 
//                                     max-h-[90vh] overflow-y-auto
//                                 "
//                         onClick={(e) => e.stopPropagation()}
//                     >

//                         {/* Close button */}
//                         <button
//                             onClick={() => setIsModalOpenAdd(false)}
//                             className="cursor-pointer absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl font-bold"
//                         >
//                             ×
//                         </button>

//                         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
//                             Add New Service
//                         </h2>

//                         {/* Form */}
//                         <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//                                 <div className="md:col-span-2">
//                                     <label className="font-medium">Service Image</label>
//                                     <input
//                                         type="file"
//                                         accept="image/*"
//                                         {...register("image", { required: true })}
//                                         className="border p-3 w-full rounded-md"
//                                     />
//                                     {errors.image && (
//                                         <p className="text-red-500 text-sm">Image is required</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">Title</label>
//                                     <input
//                                         type="text"
//                                         {...register("title", { required: true })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Enter title"
//                                     />
//                                     {errors.title && (
//                                         <p className="text-red-500 text-sm">Title is required</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">Description 1</label>
//                                     <input
//                                         type="text"
//                                         {...register("des1", { required: true })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Short description..."
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">Description 2</label>
//                                     <input
//                                         type="text"
//                                         {...register("des2", { required: true })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Short description..."
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">Description 3</label>
//                                     <input
//                                         type="text"
//                                         {...register("des3", { required: true })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="Short description..."
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">Rated</label>
//                                     <input
//                                         type="text"
//                                         {...register("rated", { required: true })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="e.g. 4.5"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="font-medium">Total Booking</label>
//                                     <input
//                                         type="text"
//                                         {...register("totalBooking", { required: true })}
//                                         className="border p-3 w-full rounded-md"
//                                         placeholder="e.g. 350"
//                                     />
//                                 </div>
//                             </div>

//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="w-full bg-[#01788E] text-white py-3 rounded-lg font-semibold text-lg"
//                             >
//                                 {loading ? "Submitting..." : "Submit"}
//                             </button>
//                         </form>
//                     </div>
//                 </div>

//             )}
//             {isModalOpenEdit && (
//                 <EditModal
//                     service={selectedService}
//                     onClose={() => setIsModalOpenEdit(false)}
//                 />
//             )}
//         </div>
//     );
// };

// export default AddServices;