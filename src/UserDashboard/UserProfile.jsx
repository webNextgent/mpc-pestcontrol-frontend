import { FaUser, FaCheckCircle } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import useAxiosSecure from "../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { user, logOut } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName:  user.lastName  || "",
        email:     user.email     || "",
        phone:     user.phone     || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Core update logic (no form event dependency) ─────────────────────────
  const submitUpdate = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.patch(`/auth/update/profile`, {
        firstName: formData.firstName,
        lastName:  formData.lastName,
        email:     formData.email,
        phone:     formData.phone,
      });

      if (res?.data?.success) {
        toast.success("Profile updated successfully!");
        await logOut();
        window.location.href = "/";
      } else {
        toast.error(res?.data?.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // ── Confirmation dialog then submit ──────────────────────────────────────
  const handleUpdateAccount = () => {
    if (!user) { toast.error("User information not available"); return; }

    Swal.fire({
      title: "Update your account?",
      text: "You will be logged out after the update.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#01788E",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) submitUpdate();
    });
  };

  // ── Shared input class ───────────────────────────────────────────────────
  const inputCls =
    "border border-[#E5E7EB] rounded-md px-4 py-2.5 outline-none w-full text-sm text-gray-800 transition focus:border-[#01788E] focus:ring-1 focus:ring-[#01788E]/20";

  if (!user) {
    return (
      <div className="px-2 md:px-6 py-4 rounded-lg bg-white w-full max-w-4xl mx-auto">
        <h2 className="flex items-center gap-2.5 text-xl font-semibold border-b border-[#E5E7EB] pb-3 text-[#5D4F52]">
          <FaUser className="text-[#01788E]" /> Contact Information
        </h2>
        <div className="mt-10 flex flex-col items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#01788E]" />
          <p className="mt-4 text-gray-500 text-sm">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 md:px-6 py-4 rounded-lg bg-white w-full max-w-4xl mx-auto">

      {/* ── Header ── */}
      <h2 className="flex items-center gap-2.5 text-xl font-semibold border-b border-[#E5E7EB] pb-3 text-[#5D4F52]">
        <FaUser className="text-[#01788E]" /> Contact Information
      </h2>

      {/* ── Avatar ── */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, #01788E, #015f70)' }}>
          {formData.firstName?.[0]?.toUpperCase() || <FaUser className="text-2xl" />}
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-800">
            {formData.firstName} {formData.lastName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{formData.phone}</p>
        </div>
      </div>

      {/* ── Form Fields ── */}
      <div className="mt-8 space-y-5">

        {/* Name row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className={inputCls}
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            className={inputCls}
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+880XXXXXXXXXX"
              className={`${inputCls} pr-10`}
            />
            {formData.phone && (
              <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-base pointer-events-none" />
            )}
          </div>
          <p className="text-[11px] text-gray-400">Enter your phone number including country code</p>
        </div>
      </div>

      {/* ── Submit Button ── */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={handleUpdateAccount}
          disabled={loading}
          className="flex items-center gap-2 px-10 py-2.5 rounded-md text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{ background: loading ? '#6b7280' : 'linear-gradient(135deg, #01788E, #015f70)' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Updating...
            </>
          ) : 'Update Profile'}
        </button>
      </div>

    </div>
  );
};

export default UserProfile;







// main component code 
// import { FaUser, FaCheckCircle } from "react-icons/fa";
// import useAuth from "../hooks/useAuth";
// import { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import toast from "react-hot-toast";

// const UserProfile = () => {
//   const { user, logOut } = useAuth();
//   const axiosSecure = useAxiosSecure();
// // console.log(user);
//   // Initialize form state with user data
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   // Update form data when user data is available
//   useEffect(() => {
//     if (user) {
//       setFormData({
//         firstName: user.firstName || "",
//         lastName: user.lastName || "",
//         email: user.email || "",
//         phone: user.phone || "",
//       });
//     }
//   }, [user]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e?.preventDefault(); // Prevent default form submission if called from form
//     setLoading(true);
//     setSuccess(false);

//     try {
//       // Prepare data for update - only send fields that can be updated
//       const updateData = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email:formData.email,
//         phone: formData.phone,
//       };


//       const res = await axiosSecure.patch(`/auth/update/profile`, updateData);

//       if (res.data.success) {
//         setSuccess(true);
//         toast.success("Profile updated successfully!");

//         logOut();
//         setTimeout(() => {
//           window.location.href = "/";
//         }, 2000);
//       } else {
//         throw new Error(res.data.message || "Failed to update profile");
//       }
//     } catch (err) {
//       toast.error(err.message || "Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateAccount = () => {
//     if (!user) {
//       toast.error("User information not available");
//       return;
//     }

//     Swal.fire({
//       title: "Are you sure you want to update your account?",
//       text: "This action cannot be undone!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#6b7280",
//       confirmButtonText: "Yes, update my account",
//       cancelButtonText: "Cancel",
//       reverseButtons: true,
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         // Call the update function
//         await handleSubmit();
//       }
//     });
//   };

//   if (!user) {
//     return (
//       <div className="border border-[#E5E7EB] p-6 rounded-lg bg-white w-full max-w-5xl mx-auto">
//         <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#5D4F52] border-b border-[#E5E7EB] pb-3">
//           <FaUser className="text-[#01788E]" /> Contact Information
//         </h2>
//         <div className="mt-6 text-center py-10">
//           <p className="text-gray-500">Loading user information...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="border border-[#E5E7EB] p-6 rounded-lg bg-white w-full max-w-5xl mx-auto"
//     >
//       <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#5D4F52] border-b border-[#E5E7EB] pb-3">
//         <FaUser className="text-[#01788E]" /> Contact Information
//       </h2>

//       {/* Success Message */}
//       {success && (
//         <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
//           <p className="text-green-600 text-sm flex items-center gap-2">
//             <FaCheckCircle className="text-green-500" />
//             Profile updated successfully!
//           </p>
//         </div>
//       )}

//       <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* First Name */}
//         <div className="flex flex-col gap-2">
//           <label className="text-sm text-gray-600">First Name</label>
//           <input
//             type="text"
//             name="firstName"
//             value={formData.firstName}
//             onChange={handleChange}
//             placeholder="First Name"
//             className="border border-[#E5E7EB] rounded-md px-4 py-2 outline-none focus:border-[#01788E]"
//           />
//         </div>

//         {/* Last Name */}
//         <div className="flex flex-col gap-2">
//           <label className="text-sm text-gray-600">Last Name</label>
//           <input
//             type="text"
//             name="lastName"
//             value={formData.lastName}
//             onChange={handleChange}
//             placeholder="Last Name"
//             className="border border-[#E5E7EB] rounded-md px-4 py-2 outline-none focus:border-[#01788E]"
//           />
//         </div>
//       </div>

//       <div className="md:flex items-center gap-6">
//         {/* Email Section */}
//         <div className="mt-6 flex flex-col gap-2 w-full md:w-1/2">
//           <label className="text-sm text-gray-600">Email</label>
//             <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Email"
//             className="border border-[#E5E7EB] rounded-md px-4 py-2 outline-none focus:border-[#01788E]"
//           />
         
        
//         </div>

//         {/* Phone */}
//         <div className="mt-6 flex flex-col gap-2 w-full md:w-1/2">
//           <label className="text-sm text-gray-600">Phone</label>
//           <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden">
//             <input
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               placeholder="+880XXXXXXXXXX"
//               className="px-4 py-2 outline-none flex-1 focus:border-[#01788E]"
//             />
//             {/* Success Icon - show when phone is not empty */}
//             {formData.phone && (
//               <FaCheckCircle className="text-green-500 text-xl mr-3" />
//             )}
//           </div>
//           <p className="text-xs text-gray-500 mt-1">
//             Enter your phone number including country code
//           </p>
//         </div>
//       </div>

//       {/* Button */}
//       <div className="mt-10 flex justify-center gap-4">
//         <button
//           type="button"
//           onClick={handleUpdateAccount}
//           disabled={loading}
//           className={`bg-[#F26B2B] text-white font-semibold px-10 py-2 rounded-md hover:bg-[#e26227] transition flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
//         >
//           {loading ? (
//             <>
//               <svg
//                 className="animate-spin h-5 w-5 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Updating...
//             </>
//           ) : (
//             "UPDATE"
//           )}
//         </button>

    
//       </div>
//     </form>
//   );
// };

// export default UserProfile;