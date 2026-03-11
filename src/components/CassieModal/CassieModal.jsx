import { useState } from "react";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useScrollLock from "../../hooks/useScrollLock";

const CassieModal = ({ open, onClose }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: { firstName: "", lastName: "", email: "" }
    });
    useScrollLock(open);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    if (!open) return null;

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await axiosSecure.patch(`/auth/update/profile`, {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
            });
            if (res?.data?.success) {
                reset();
                onClose();
                navigate('/confirmation');
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to submit form. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reusable InputField — same as Address component
    const InputField = ({ label, name, type = "text", placeholder, rules }) => (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                className={`w-full px-4 py-2 border rounded text-sm transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-[#01788E]/40 focus:border-[#01788E]
                    ${errors[name]
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                {...register(name, rules)}
            />
            {errors[name] && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                     {errors[name].message}
                </p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-9999 flex items-end md:items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-10" onClick={onClose} />

            {/* Modal */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                onClick={(e) => e.stopPropagation()}
                className="relative z-20 bg-white w-full rounded-t md:rounded
                    md:max-w-md flex flex-col overflow-hidden
                    h-auto max-h-[70vh] md:max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
                    {/* Mobile handle */}
                    <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 md:hidden" />

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-800 uppercase tracking-wider">
                                Your Details
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Please provide your details to manage your booking
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 text-lg cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 overflow-y-auto grow">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="First Name"
                            name="firstName"
                            placeholder="e.g. John"
                            rules={{
                                required: "First name is required",
                                minLength: { value: 2, message: "At least 2 characters" }
                            }}
                        />
                        <InputField
                            label="Last Name"
                            name="lastName"
                            placeholder="e.g. Doe"
                            rules={{
                                required: "Last name is required",
                                minLength: { value: 2, message: "At least 2 characters" }
                            }}
                        />
                    </div>

                    <InputField
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="e.g. john@example.com"
                        rules={{
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        }}
                    />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded font-semibold text-sm text-white transition-colors
                            ${isSubmitting
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-[#ED6329] hover:bg-[#d4541f] cursor-pointer"
                            }`}
                    >
                        {isSubmitting ? "Submitting..." : "Continue →"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CassieModal;






// main component code 
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import useAxiosSecure from "../../hooks/useAxiosSecure";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// const CassieModal = ({ open, onClose }) => {
//     const { register, handleSubmit, formState: { errors }, reset } = useForm({
//         defaultValues: {
//             firstName: "",
//             lastName: "",
//             email: "",
//         }
//     });

//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const axiosSecure = useAxiosSecure();
//     const navigate = useNavigate();

//     if (!open) return null;

//     const onSubmit = async (data) => {
//         setIsSubmitting(true);
//         const updateData = {
//             firstName: data.firstName,
//             lastName: data.lastName,
//             email: data.email,
//         }

//         try {
//             const res = await axiosSecure.patch(`/auth/update/profile`, updateData);
//             if (res?.data?.success) {
//                 reset();
//                 onClose();
//                 navigate('/confirmation');
//             }
//         } catch (error) {
//             console.error("Submission error:", error);
//             toast.error("Failed to submit form. Please try again.");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-9999 flex items-end md:items-center justify-center">
//             {/* OVERLAY */}
//             <div
//                 className="absolute inset-0 bg-black/60 z-10"
//                 onClick={onClose}
//             />

//             {/* MODAL BOX */}
//             <form
//                 onSubmit={handleSubmit(onSubmit)}
//                 className="
//                     relative z-20 bg-white text-gray-900 w-full 
//                     h-[80vh] rounded-t-2xl 
//                     md:h-[90vh] md:max-w-lg md:rounded-xl 
//                     flex flex-col overflow-hidden transition-all duration-300
//                 "
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 {/* Header */}
//                 <div className="px-4 pt-4 shrink-0">
//                     {/* Mobile Handle Bar */}
//                     <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
//                     <h2 className="text-lg font-semibold">
//                         Your Details
//                     </h2>
//                     <p className="text-sm text-gray-600 mt-1">
//                         Please provide your details to help us manage your booking
//                     </p>
//                 </div>

//                 {/* Body - Scrollable */}
//                 <div className="p-6 space-y-4 overflow-y-auto grow">
//                     {/* First Name */}
//                     <div>
//                         <label className="block text-sm font-medium mb-1">
//                             First Name
//                             {errors.firstName && (
//                                 <span className="text-red-500 text-xs ml-1">*</span>
//                             )}
//                         </label>
//                         <input
//                             type="text"
//                             placeholder="Enter first name"
//                             className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#01788E] outline-none ${errors.firstName ? "border-red-500" : ""
//                                 }`}
//                             {...register("firstName", {
//                                 required: "First name is required",
//                                 minLength: {
//                                     value: 2,
//                                     message: "First name must be at least 2 characters"
//                                 }
//                             })}
//                         />
//                         {errors.firstName && (
//                             <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
//                         )}
//                     </div>

//                     {/* Last Name */}
//                     <div>
//                         <label className="block text-sm font-medium mb-1">
//                             Last Name
//                             {errors.lastName && (
//                                 <span className="text-red-500 text-xs ml-1">*</span>
//                             )}
//                         </label>
//                         <input
//                             type="text"
//                             placeholder="Enter last name"
//                             className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#01788E] outline-none ${errors.lastName ? "border-red-500" : ""
//                                 }`}
//                             {...register("lastName", {
//                                 required: "Last name is required",
//                                 minLength: {
//                                     value: 2,
//                                     message: "Last name must be at least 2 characters"
//                                 }
//                             })}
//                         />
//                         {errors.lastName && (
//                             <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
//                         )}
//                     </div>

//                     {/* Email */}
//                     <div>
//                         <label className="block text-sm font-medium mb-1">
//                             Email
//                             {errors.email && (
//                                 <span className="text-red-500 text-xs ml-1">*</span>
//                             )}
//                         </label>
//                         <input
//                             type="email"
//                             placeholder="Enter email address"
//                             className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#01788E] outline-none ${errors.email ? "border-red-500" : ""
//                                 }`}
//                             {...register("email", {
//                                 required: "Email is required",
//                                 pattern: {
//                                     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                                     message: "Invalid email address"
//                                 }
//                             })}
//                         />
//                         {errors.email && (
//                             <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
//                         )}
//                     </div>

//                     {/* Spacer for long forms */}
//                     <div className="h-20 md:hidden"></div>
//                 </div>

//                 {/* Footer - Always at bottom */}
//                 <div className="p-4 border-t bg-white shrink-0">
//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className={`w-full bg-[#ED6329] hover:bg-[#d55622] text-white py-3 font-semibold transition-colors ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
//                             }`}
//                     >
//                         {isSubmitting ? "Submitting..." : "Continue"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default CassieModal;