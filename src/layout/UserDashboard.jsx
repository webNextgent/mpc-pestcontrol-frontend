/* eslint-disable no-unused-vars */
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import { MdDeleteSweep, MdMenu } from "react-icons/md";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from '../assets/logo/logo.png';
import { FaUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaWallet } from "react-icons/fa6";
import { RiLogoutCircleLine } from "react-icons/ri";
import { RiMacbookFill } from "react-icons/ri";
import { SiServerless } from "react-icons/si";
import { LuProportions } from "react-icons/lu";
import { MdWatchLater } from "react-icons/md";
import { SiProton } from "react-icons/si";
import useAuth from "../hooks/useAuth";
import { useState } from "react";

const UserDashboard = () => {
    const { user, logOut } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const role = user?.role;

    const closeDrawer = () => {
        const drawerCheckbox = document.getElementById('dashboard-drawer');
        if (drawerCheckbox && window.innerWidth < 1024) {
            drawerCheckbox.checked = false;
        }
    };

    const handleLogout = () => {
        logOut();
        navigate("/");
        closeDrawer();
    };

    const handleNavClick = () => closeDrawer();

    // ── Reusable NavLink factory ──────────────────────────────────────────────
    const SideNavLink = ({ to, icon: Icon, label }) => (
        <li className="list-none">
            <NavLink
                to={to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                    `relative flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-all duration-150
                    ${isActive
                        ? "text-[#01788E] font-semibold bg-[#01788E]/8 border-l-[3px] border-[#01788E]"
                        : "text-gray-600 hover:text-[#01788E] hover:bg-gray-50 border-l-[3px] border-transparent"
                    }`
                }
            >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
            </NavLink>
        </li>
    );

    // ── Nav item groups ───────────────────────────────────────────────────────
    const userNavItems = [
        { to: "/dashboard/booking", icon: FaCalendarAlt, label: "My Bookings" },
        { to: "/dashboard/profile", icon: FaUser, label: "My Profile" },
        { to: "/dashboard/saved-locations", icon: FaLocationDot, label: "Saved Locations" },
        { to: "/dashboard/wallet", icon: FaWallet, label: "My Wallet" },
        { to: "/dashboard/delete-account", icon: MdDeleteSweep, label: "Delete Account" },
    ];

    const adminNavItems = [
        { to: "/dashboard/admin-booking", icon: RiMacbookFill, label: "Booking" },
        { to: "/dashboard/add-services", icon: FaCalendarAlt, label: "Services" },
        { to: "/dashboard/add-service-type", icon: SiServerless, label: "Service Type" },
        { to: "/dashboard/add-property-type", icon: LuProportions, label: "Property Type" },
        { to: "/dashboard/add-property-item", icon: FaCalendarAlt, label: "Property Item" },
        { to: "/dashboard/user-management", icon: FaUsers, label: "User Management" },
        { to: "/dashboard/add-promo-code", icon: SiProton, label: "Promo Codes" },
        { to: "/dashboard/admin-date-time", icon: MdWatchLater, label: "Date & Time Slot" },
    ];

    // ── Sidebar content ───────────────────────────────────────────────────────
    const SidebarContent = () => (
        <div className="flex flex-col h-full min-h-screen">
            {/* Logo */}
            <div className="px-4 pt-6 pb-4 border-b border-gray-100">
                <Link to="/" onClick={handleNavClick}>
                    <img src={logo} alt="logo" className="w-40 mx-auto" />
                </Link>

                {/* User badge */}
                <div className="mt-4 flex items-center gap-2.5 p-2.5 bg-[#01788E]/5 rounded-xl border border-[#01788E]/10">
                    <div className="w-8 h-8 rounded-full bg-[#01788E]/10 flex items-center justify-center shrink-0">
                        <FaUser className="w-3.5 h-3.5 text-[#01788E]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-[#01788E] uppercase tracking-wider truncate">
                            {role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'ADMIN' ? 'Admin' : 'User'}
                        </p>
                        <p className="text-xs font-bold text-gray-400 truncate">
                            {user?.firstName || ''}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                            {user?.email || ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-3 overflow-y-auto">
                {/* Section label */}
                <p className="px-4 mb-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {role === 'USER' ? 'My Account' : 'Management'}
                </p>

                <ul className="space-y-0.5">
                    {role === 'USER' && userNavItems.map(item => (
                        <SideNavLink key={item.to} {...item} />
                    ))}

                    {(role === 'ADMIN' || role === 'SUPER_ADMIN') && adminNavItems.map(item => (
                        <SideNavLink key={item.to} {...item} />
                    ))}
                </ul>
            </nav>

            {/* Logout — pinned to bottom */}
            <div className="border-t border-gray-100 p-3">
                <button
                    onClick={handleLogout}
                    className="
                        w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                        text-[13px] font-medium text-red-500
                        hover:bg-red-50 border border-transparent hover:border-red-100
                        transition-all duration-150 group
                    "
                >
                    <RiLogoutCircleLine className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-white text-gray-500">
            <div className="drawer lg:drawer-open max-w-7xl mx-auto">
                <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

                {/* ── Main content ── */}
                <div className="drawer-content flex flex-col min-h-screen">

                    {/* Mobile top bar */}
           <div className="sticky top-0 z-30 w-full flex justify-between items-center lg:hidden px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
    
    {/* Left: Hamburger + Logo */}
    <div className="flex items-center gap-2">
        <label htmlFor="dashboard-drawer" className="btn btn-ghost p-1.5 -ml-1.5">
            <MdMenu size={22} className="text-gray-600" />
        </label>
        <Link to="/">
            <img src={logo} alt="logo" className="h-7 w-auto" />
        </Link>
    </div>

    {/* Right: Avatar with Dropdown */}
    <div className="relative">
        <button
            onClick={() => setDropdownOpen(prev => !prev)}
            className="w-8 h-8 rounded-full bg-[#01788E]/10 border border-[#01788E]/20 flex items-center justify-center"
        >
            <FaUser className="w-3.5 h-3.5 text-[#01788E]" />
        </button>

        {dropdownOpen && (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 top-10 z-50 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    
                    {/* User Info */}
                    <div className="px-4 py-3 bg-[#01788E]/5 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#01788E]/10 flex items-center justify-center flex-shrink-0">
                                <FaUser className="w-4 h-4 text-[#01788E]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[10px] font-semibold text-[#01788E] uppercase tracking-wide">
                                    {role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'ADMIN' ? 'Admin' : 'User'}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <RiLogoutCircleLine className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </>
        )}
    </div>
</div>

                    {/* Page content */}
                    <div className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <Outlet />
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div className="drawer-side z-40">
                    <label htmlFor="dashboard-drawer" className="drawer-overlay" />

                    <aside className="w-64 md:w-60 bg-white border-r border-gray-100 shadow-sm relative">
                        {/* Mobile close button */}
                        <label
                            htmlFor="dashboard-drawer"
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 lg:hidden text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </label>

                        <SidebarContent />
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;






// main component code
// // update for click route to close dashboard_ just
// import { FaCalendarAlt, FaUsers } from "react-icons/fa";
// import { MdDeleteSweep, MdMenu } from "react-icons/md";
// import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
// import logo from '../assets/logo/logo.png';
// import { FaUser } from "react-icons/fa";
// import { FaLocationDot } from "react-icons/fa6";
// import { MdOutlinePayments } from "react-icons/md";
// import { FaWallet } from "react-icons/fa6";
// import { IoMdShare } from "react-icons/io";
// import { RiLogoutCircleLine } from "react-icons/ri";
// import { RiMacbookFill } from "react-icons/ri";
// import { SiServerless } from "react-icons/si";
// import { LuProportions } from "react-icons/lu";
// import { IoMdTime } from "react-icons/io";
// import { SiProton } from "react-icons/si";
// import useAuth from "../hooks/useAuth";

// const UserDashboard = () => {
//     const { user, logOut } = useAuth();
//     const router = useNavigate();
//     const role = user?.role;

//     // Function to close drawer on mobile
//     const closeDrawer = () => {
//         const drawerCheckbox = document.getElementById('dashboard-drawer');
//         if (drawerCheckbox && window.innerWidth < 1024) { // 1024px is lg breakpoint
//             drawerCheckbox.checked = false;
//         }
//     };

//     const handleLogout = () => {
//         logOut();
//         router("/");
//         closeDrawer(); // Close drawer after logout
//     };

//     // Wrapper function for NavLink clicks
//     const handleNavClick = () => {
//         closeDrawer();
//     };

//     const links = (
//         <>
//             {/* just user  */}
//             {role === 'USER' && (
//                 <ul>
//                     {/* My Bookings */}
//                     <li className="list-none border-y border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/booking"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <FaCalendarAlt /> My Bookings
//                         </NavLink>
//                     </li>

//                     {/* My Profile */}
//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/profile"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <FaUser /> My Profile
//                         </NavLink>
//                     </li>

//                     {/* Saved Locations */}
//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/saved-locations"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <FaLocationDot /> Saved Locations
//                         </NavLink>
//                     </li>

//                     {/* Payment Methods */}
//                     {/* <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/payment-methods"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <MdOutlinePayments /> Payment Methods
//                         </NavLink>
//                     </li> */}

//                     {/* My Wallet */}
//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/wallet"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <FaWallet /> My Wallet
//                         </NavLink>
//                     </li>

//                     {/* Delete Account */}
//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/delete-account"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <MdDeleteSweep className="text-xl" /> Delete Account
//                         </NavLink>
//                     </li>

//                     {/* Invite a Friend */}
//                     {/* <li className="list-none border-b border-dashed hover:bg-gray-50 flex justify-between items-center px-3 py-2">
//                         <NavLink
//                             to="/dashboard/invite-friend"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] py-1 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <IoMdShare className="text-[18px]" /> Invite a friend
//                         </NavLink>

//                         <span className="bg-[#ED6329] text-white text-[11px] px-2 py-0.5 rounded">
//                             Get 30 ৳ credit
//                         </span>
//                     </li> */}

//                     {/* Logout */}
//                     <li onClick={() => handleLogout()} className="list-none flex items-center gap-1.5 py-3 px-3 hover:underline cursor-pointer text-[#157D91]">
//                         <RiLogoutCircleLine />  Logout
//                     </li>
//                 </ul>
//             )}

//             {/* just admin  */}
//             {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
//                 <ul>
//                     <li className="list-none border-y border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/admin-booking"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <RiMacbookFill /> Booking
//                         </NavLink>
//                     </li>

//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/add-services"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <FaCalendarAlt /> Services
//                         </NavLink>
//                     </li>

//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/add-service-type"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <SiServerless /> Services Type
//                         </NavLink>
//                     </li>

//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/add-property-type"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <LuProportions className="text-[16px]" /> Property Type
//                         </NavLink>
//                     </li>

//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/add-property-item"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <FaCalendarAlt /> Property Item
//                         </NavLink>
//                     </li>

//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/user-management"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <FaUsers /> User Management
//                         </NavLink>
//                     </li>

//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/add-promo-code"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <SiProton /> Add promo Code
//                         </NavLink>
//                     </li>

//                     <li className="list-none border-b border-dashed hover:bg-gray-50">
//                         <NavLink
//                             to="/dashboard/admin-date-time"
//                             onClick={handleNavClick}
//                             className={({ isActive }) =>
//                                 `text-[14px] font-medium flex items-center gap-2 text-[#157D91] px-3 py-2 transition
//                         ${isActive ? "font-extrabold" : ""}`
//                             }>
//                             <IoMdTime className="text-[18px]" /> Date & Time Slot
//                         </NavLink>
//                     </li>
//                 </ul>
//             )}
//         </>
//     );

//     return (
//         <div className="w-full min-h-screen bg-white text-gray-500">
//             <div className="drawer lg:drawer-open max-w-7xl mx-auto">
//                 <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

//                 {/* Drawer Content */}
//                 <div className="drawer-content flex flex-col">
//                     {/* Top Navbar for Mobile - WITH IMAGE */}
//                     <div className="w-full navbar flex justify-between items-center lg:hidden px-4 py-3 shadow-sm">
//                         <div className="flex items-center gap-2">
//                             <label htmlFor="dashboard-drawer" className="btn btn-ghost lg:hidden p-2">
//                                 <MdMenu size={24} />
//                             </label>
//                         </div>

//                         {/* User Image on Mobile Navbar */}
//                         <div className="flex items-center gap-3">
//                             <div className="relative">
//                                 <p className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center"><FaUser /></p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="md:px-10">
//                         <Outlet />
//                     </div>
//                 </div>

//                 {/* Drawer Side */}
//                 <div className="drawer-side">
//                     <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>

//                     <div className="md:w-72 bg-[#FFFFFF] p-2 relative min-h-screen">
//                         {/* Mobile Close Button */}
//                         <label
//                             htmlFor="dashboard-drawer"
//                             className="btn btn-sm btn-circle absolute right-2 top-2 lg:hidden"
//                         >
//                             ✕
//                         </label>

//                         <div className="flex flex-col items-center justify-center mb-4">
//                             <Link to='/' className="mb-4" onClick={handleNavClick}>
//                                 <img className="w-52 md:mt-4" src={logo} alt="logo" />
//                             </Link>

//                             {/* User Info with Image - Professional Layout */}
//                             <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl w-full max-w-xs mb-4">
//                                 {/* User Details */}
//                                 <div className="flex-1 text-center">
//                                     <p className="text-sm font-medium text-[#01788E] mt-1">{user?.role}</p>
//                                 </div>
//                             </div>
//                         </div>
//                         {links}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserDashboard;