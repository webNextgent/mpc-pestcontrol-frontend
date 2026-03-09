/* eslint-disable no-unused-vars */
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import useAllServices from "../../hooks/useAllServices";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { IoClose, IoImageOutline } from "react-icons/io5";
import { GoBrowser } from "react-icons/go";
import { FiStar } from "react-icons/fi";

// ── Shared styles — teal palette ──────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all bg-gray-50/30 placeholder:text-gray-300";
const labelCls = "block text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
const errCls = "text-red-500 text-[11px] mt-1";

const tealFocus = {
    onFocus: (e) => { e.target.style.borderColor = '#01788E'; e.target.style.boxShadow = '0 0 0 2px rgba(1,120,142,0.15)'; },
    onBlur: (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }
};

const Field = ({ label, error, hint, children }) => (
    <div>
        {label && <label className={labelCls}>{label}</label>}
        {children}
        {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
        {error && <p className={errCls}>· {error}</p>}
    </div>
);

const SectionHead = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 pt-1 pb-1">
        <div className="p-1.5 rounded-lg shrink-0" style={{ background: 'rgba(1,120,142,0.1)' }}>
            <Icon className="text-xs" style={{ color: '#01788E' }} />
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

// ── EditModal ─────────────────────────────────────────────────────────────────
const EditModal = ({ service, onClose }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            title: service?.title ?? "",
            des1: service?.des1 ?? "",
            des2: service?.des2 ?? "",
            des3: service?.des3 ?? "",
            rated: service?.rated ?? "",
            totalBooking: service?.totalBooking ?? "",
        }
    });

    const [loading, setLoading] = useState(false);
    const [, , refetch] = useAllServices();
    const axiosSecure = useAxiosSecure();

    const handleFormSubmit = async (data) => {
        setLoading(true);
        try {
            let imageUrl = service.image;
            // BUG FIX: FileList length check instead of truthy on FileList object
            if (data.image && data.image.length > 0) {
                const formData = new FormData();
                formData.append("image", data.image[0]);
                const res = await fetch(
                    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOSTING_KEY}`,
                    { method: "POST", body: formData }
                );
                const imgResult = await res.json();
                if (imgResult.success) {
                    imageUrl = imgResult.data.url;
                } else {
                    toast.error("Image upload failed");
                    setLoading(false);
                    return;
                }
            }

            const updatedData = { ...data, image: imageUrl };
            // BUG FIX: _id fallback for update endpoint
            const serviceId = service.id || service._id;
            const updateRes = await axiosSecure.patch(`/service/update/${serviceId}`, updatedData);

            if (updateRes?.data?.success) {
                toast.success("Service updated successfully");
                onClose(false);
                refetch();
            } else {
                toast.error(updateRes?.data?.message || "Failed to update");
            }
        } catch (error) {
            toast.error(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!service) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => onClose(false)}
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
                            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Edit Service</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5">Update the details below</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <IoClose className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5">
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <div className="space-y-4">

                            <SectionHead icon={IoImageOutline} label="Photo & Identity" />

                            {/* Image upload */}
                            <Field label="Service Image" hint="Leave empty to keep the current photo">
                                <input
                                    type="file" accept="image/*"
                                    className="w-full text-xs sm:text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 border border-gray-200 rounded-xl px-2 py-2 bg-gray-50/30 transition-all cursor-pointer"
                                    {...register("image")} />
                                {service?.image && (
                                    <div className="mt-2 flex items-center gap-3 p-3 rounded-xl border"
                                        style={{ background: 'rgba(1,120,142,0.05)', borderColor: 'rgba(1,120,142,0.15)' }}>
                                        <img src={service.image} alt="Current"
                                            className="w-12 h-12 object-cover rounded-lg shrink-0 border"
                                            style={{ borderColor: 'rgba(1,120,142,0.2)' }} />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600">Current photo</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Upload a new one to replace</p>
                                        </div>
                                    </div>
                                )}
                            </Field>

                            {/* Title */}
                            <Field label="Title" error={errors.title ? "Title is required" : null}>
                                <input type="text" placeholder="e.g. Home Cleaning"
                                    className={inputCls} {...tealFocus}
                                    {...register("title", { required: true })} />
                            </Field>

                            <SectionHead icon={GoBrowser} label="Descriptions" />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Field label="Description 1" error={errors.des1 ? "Required" : null}>
                                    <input type="text" placeholder="Short description…"
                                        className={inputCls} {...tealFocus}
                                        {...register("des1", { required: true })} />
                                </Field>
                                <Field label="Description 2" error={errors.des2 ? "Required" : null}>
                                    <input type="text" placeholder="Short description…"
                                        className={inputCls} {...tealFocus}
                                        {...register("des2", { required: true })} />
                                </Field>
                                <Field label="Description 3" error={errors.des3 ? "Required" : null}>
                                    <input type="text" placeholder="Short description…"
                                        className={inputCls} {...tealFocus}
                                        {...register("des3", { required: true })} />
                                </Field>
                            </div>

                            <SectionHead icon={FiStar} label="Stats" />

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Rated" error={errors.rated ? "Required" : null}>
                                    <input type="text" placeholder="e.g. 4.5"
                                        className={inputCls} {...tealFocus}
                                        {...register("rated", { required: true })} />
                                </Field>
                                <Field label="Total Booking" error={errors.totalBooking ? "Required" : null}>
                                    <input type="text" placeholder="e.g. 350"
                                        className={inputCls} {...tealFocus}
                                        {...register("totalBooking", { required: true })} />
                                </Field>
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
                                            Updating…
                                        </>
                                    ) : (
                                        <>
                                            Save Changes
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditModal;






// main component code
// import { useForm } from "react-hook-form";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import useAllServices from "../../hooks/useAllServices";
// import useAxiosSecure from "../../hooks/useAxiosSecure";

// const EditModal = ({ service, onClose }) => {
//     const { register, handleSubmit, formState: { errors } } = useForm({
//         defaultValues: {
//             title: service?.title,
//             des1: service?.des1,
//             des2: service?.des2,
//             des3: service?.des3,
//             rated: service?.rated,
//             totalBooking: service?.totalBooking
//         }
//     });
//     const [loading, setLoading] = useState(false);
//     const [, , refetch] = useAllServices();
//     const axiosSecure = useAxiosSecure();

//     const handleFormSubmit = async (data) => {
//         setLoading(true);
//         try {
//             let imageUrl = service.image;
//             // If a new image is selected, upload it
//             if (data.image && data.image.length > 0) {
//                 const formData = new FormData();
//                 formData.append("image", data.image[0]);

//                 const res = await fetch(
//                     `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOSTING_KEY}`,
//                     { method: "POST", body: formData }
//                 );

//                 const imgResult = await res.json();
//                 if (imgResult.success) {
//                     imageUrl = imgResult.data.url;
//                 } else {
//                     toast.error("Something is wrong");
//                     return;
//                 }
//             }

//             const updatedData = {
//                 ...data,
//                 image: imageUrl,
//             };

//             const updateRes = await axiosSecure.patch(`/service/update/${service.id}`, updatedData);

//             if (updateRes?.data?.success) {
//                 toast.success("Service updated successfully");
//                 onClose(false);
//                 refetch();
//             } else {
//                 toast.error("Failed to update");
//             }
//         } catch (error) {
//             toast.error(`Error: ${error?.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!service) return null;

//     return (
//         <div
//             className="
//         fixed inset-0
//         bg-black/50      /* uniform, cleaner overlay */
//         flex justify-center items-center
//         z-50
//         p-3 sm:p-4 md:p-6
//     "
//             onClick={() => onClose(false)}
//         >
//             <div
//                 className="
//             relative bg-white
//             w-full
//             max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
//             p-3 sm:p-5 md:p-8
//             rounded-lg sm:rounded-xl md:rounded-2xl
//             shadow-xl
//             max-h-[90vh] overflow-y-auto
//         "
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 {/* Close Button */}
//                 <button
//                     onClick={() => onClose(false)}
//                     className="
//                 cursor-pointer absolute
//                 top-3 right-3
//                 text-gray-600 hover:text-red-500
//                 text-2xl font-bold
//             "
//                 >
//                     ×
//                 </button>

//                 <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
//                     Edit Service
//                 </h2>

//                 <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//                         <div className="md:col-span-2">
//                             <label className="font-medium">Service Image</label>
//                             <input
//                                 type="file"
//                                 accept="image/*"
//                                 {...register("image")}
//                                 className="border p-3 w-full rounded-lg"
//                             />
//                             <p className="text-gray-500 text-sm mt-1">
//                                 (Leave empty to keep old image)
//                             </p>
//                             {service?.image && (
//                                 <img
//                                     src={service.image}
//                                     alt="Service Preview"
//                                     className="w-32 h-20 object-cover rounded-lg mt-2 border"
//                                 />
//                             )}

//                         </div>

//                         <div>
//                             <label className="font-medium">Title</label>
//                             <input
//                                 type="text"
//                                 {...register("title", { required: true })}
//                                 className="border p-3 w-full rounded-lg"
//                                 placeholder="Enter title"
//                             />
//                             {errors.title && (
//                                 <p className="text-red-500 text-sm">Title is required</p>
//                             )}
//                         </div>

//                         <div>
//                             <label className="font-medium">Description 1</label>
//                             <input
//                                 type="text"
//                                 {...register("des1", { required: true })}
//                                 className="border p-3 w-full rounded-lg"
//                                 placeholder="Short description..."
//                             />
//                         </div>

//                         <div>
//                             <label className="font-medium">Description 2</label>
//                             <input
//                                 type="text"
//                                 {...register("des2", { required: true })}
//                                 className="border p-3 w-full rounded-lg"
//                                 placeholder="Short description..."
//                             />
//                         </div>

//                         <div>
//                             <label className="font-medium">Description 3</label>
//                             <input
//                                 type="text"
//                                 {...register("des3", { required: true })}
//                                 className="border p-3 w-full rounded-lg"
//                                 placeholder="Short description..."
//                             />
//                         </div>

//                         <div>
//                             <label className="font-medium">Rated</label>
//                             <input
//                                 type="text"
//                                 {...register("rated", { required: true })}
//                                 className="border p-3 w-full rounded-lg"
//                                 placeholder="e.g. 4.5"
//                             />
//                         </div>

//                         <div>
//                             <label className="font-medium">Total Booking</label>
//                             <input
//                                 type="text"
//                                 {...register("totalBooking", { required: true })}
//                                 className="border p-3 w-full rounded-lg"
//                                 placeholder="e.g. 350"
//                             />
//                         </div>
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="
//                     w-full
//                     bg-[#01788E] text-white
//                     py-3 rounded-xl
//                     font-semibold text-lg
//                 "
//                     >
//                         {loading ? "Updating..." : "Update"}
//                     </button>
//                 </form>
//             </div>
//         </div>

//     );
// };

// export default EditModal;