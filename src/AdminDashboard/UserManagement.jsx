/* eslint-disable no-unused-vars */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { FaUsers, FaSearch } from "react-icons/fa";
import { RiDeleteBin5Line, RiShieldUserLine, RiUserLine } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

const UserManagement = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [roleFilter, setRoleFilter] = useState("all");

    const { data: allUsers = [], isLoading, error } = useQuery({
        queryKey: ['all-users'],
        queryFn: async () => {
            const res = await axiosSecure.get(`/auth/users`);
            return res.data?.Data ?? [];
        }
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    // Filter
    const filteredUsers = allUsers.filter(user => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            user.firstName?.toLowerCase().includes(q) ||
            user.lastName?.toLowerCase().includes(q) ||
            user.phone?.includes(searchTerm) ||
            user.email?.toLowerCase().includes(q);
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Role toggle
    const handleMakeAdmin = (user) => {
        const isAdmin = user.role === 'ADMIN';
        const userId = user.id || user._id;
        Swal.fire({
            title: isAdmin ? "Remove Admin Role?" : "Make Admin?",
            text: isAdmin
                ? `${user.firstName || 'User'} will lose admin privileges.`
                : `${user.firstName || 'User'} will get admin privileges.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#01788E",
            cancelButtonColor: "#6b7280",
            confirmButtonText: isAdmin ? "Remove Admin" : "Make Admin",
            cancelButtonText: "Cancel",
            reverseButtons: true
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await axiosSecure.patch(`/auth/change-role/${userId}`, {
                    role: isAdmin ? 'USER' : 'ADMIN'
                });
                if (res.data?.success) {
                    await queryClient.invalidateQueries({ queryKey: ['all-users'] });
                    toast.success(isAdmin
                        ? `${user.firstName || 'User'} removed from admin role`
                        : `${user.firstName || 'User'} promoted to admin`
                    );
                } else {
                    throw new Error(res.data?.message || 'Failed to update role');
                }
            } catch (err) {
                toast.error(err.message || 'Failed to update user role');
            }
        });
    };

    const handleDeleteUser = (user) => {
        const userId = user.id || user._id;
        Swal.fire({
            title: "Delete User?",
            text: `"${user.firstName || 'This user'}" will be permanently deleted.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete",
            reverseButtons: true
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const res = await axiosSecure.delete(`/auth/delete-account/${userId}`);
                if (res?.data?.success) {
                    await queryClient.invalidateQueries({ queryKey: ['all-users'] });
                    const newTotal = filteredUsers.length - 1;
                    const newTotalPages = Math.ceil(newTotal / itemsPerPage);
                    if (currentPage > newTotalPages && newTotalPages > 0) {
                        setCurrentPage(newTotalPages);
                    }
                    toast.success(`${user.firstName || 'User'} deleted`);
                } else {
                    toast.error(res?.data?.message || 'Failed to delete');
                }
            } catch {
                toast.error('Something went wrong');
            }
        });
    };

    const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;
    const userCount = allUsers.filter(u => u.role !== 'ADMIN').length;

    const getUserInitials = (user) => {
        const f = user.firstName?.[0] || '';
        const l = user.lastName?.[0] || '';
        return (f + l).toUpperCase() || '?';
    };

    const getAvatarColor = (id) => {
        const colors = [
            { bg: 'rgba(1,120,142,0.1)', text: '#01788E' },
            { bg: 'rgba(124,58,237,0.1)', text: '#7c3aed' },
            { bg: 'rgba(5,150,105,0.1)', text: '#059669' },
            { bg: 'rgba(217,119,6,0.1)', text: '#d97706' },
            { bg: 'rgba(225,29,72,0.1)', text: '#e11d48' },
            { bg: 'rgba(8,145,178,0.1)', text: '#0891b2' },
        ];
        // works for both numeric and string IDs
        const charSum = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return colors[charSum % colors.length];
    };

    // Loading
    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="w-10 h-10 border-[3px] border-gray-200 rounded-full animate-spin mx-auto"
                    style={{ borderTopColor: '#01788E' }} />
                <p className="mt-3 text-sm text-gray-500 font-medium">Loading users...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <p className="text-red-500 font-medium">Failed to load users</p>
                <button
                    onClick={() => queryClient.refetchQueries({ queryKey: ['all-users'] })}
                    className="mt-3 px-4 py-2 text-white text-sm rounded-lg"
                    style={{ background: '#01788E' }}
                >Retry</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-2 sm:p-4 md:p-4">
            <div className="max-w-6xl mx-auto space-y-5">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 flex items-center gap-2.5">
                            <span className="p-2 rounded-xl inline-flex" style={{ background: 'linear-gradient(135deg, #01788E, #015f70)' }}>
                                <FaUsers className="text-white text-base sm:text-lg" />
                            </span>
                            User Management
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-0.5">
                            Manage roles and access for all registered users
                        </p>
                    </div>

                    {/* Stat pills */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-center min-w-[60px] sm:min-w-16">
                            <p className="text-base sm:text-lg font-bold text-gray-900">{allUsers.length}</p>
                            <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Total</p>
                        </div>
                        <div className="px-3 py-2 bg-purple-50 rounded-xl border border-purple-100 shadow-sm text-center min-w-[60px] sm:min-w-16">
                            <p className="text-base sm:text-lg font-bold text-purple-700">{adminCount}</p>
                            <p className="text-[10px] sm:text-[11px] text-purple-500 font-medium">Admins</p>
                        </div>
                        <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm text-center min-w-[60px] sm:min-w-16">
                            <p className="text-base sm:text-lg font-bold text-emerald-700">{userCount}</p>
                            <p className="text-[10px] sm:text-[11px] text-emerald-500 font-medium">Users</p>
                        </div>
                    </div>
                </div>

                {/* ── Table Card ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input
                                    type="text"
                                    placeholder="Search by name, phone or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl outline-none transition-all text-sm bg-white"
                                    onFocus={e => { e.target.style.borderColor = '#01788E'; e.target.style.boxShadow = '0 0 0 2px rgba(1,120,142,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <IoClose className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {/* Role filter */}
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none transition-all text-xs sm:text-sm bg-white"
                                    onFocus={e => { e.target.style.borderColor = '#01788E'; e.target.style.boxShadow = '0 0 0 2px rgba(1,120,142,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="USER">User</option>
                                </select>

                                {/* Per page */}
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                                    className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none transition-all text-xs sm:text-sm bg-white"
                                    onFocus={e => { e.target.style.borderColor = '#01788E'; e.target.style.boxShadow = '0 0 0 2px rgba(1,120,142,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                                >
                                    <option value="5">5 / page</option>
                                    <option value="10">10 / page</option>
                                    <option value="20">20 / page</option>
                                    <option value="50">50 / page</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── Desktop Table ── */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {['#', 'User', 'Contact', 'Role', 'Actions'].map(h => (
                                        <th key={h} className="py-3 px-4 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <FaUsers className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                                            <p className="text-sm font-medium text-gray-500">No users found</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {searchTerm ? 'Try adjusting your search' : 'Users will appear here once they register'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : currentUsers.map((user, idx) => {
                                    const uid = user.id || user._id;
                                    const avatarColor = getAvatarColor(uid);
                                    return (
                                        <tr key={uid} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="text-xs font-semibold text-gray-400">#{startIndex + idx + 1}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                        style={{ background: avatarColor.bg, color: avatarColor.text }}
                                                    >
                                                        {getUserInitials(user)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {user.firstName || user.lastName
                                                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                                            : <span className="text-gray-400 italic">Unnamed</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-900">{user.phone || <span className="text-gray-400">—</span>}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{user.email || '—'}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                    user.role === 'ADMIN'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}>
                                                    {user.role === 'ADMIN'
                                                        ? <RiShieldUserLine className="text-xs" />
                                                        : <RiUserLine className="text-xs" />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleMakeAdmin(user)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                                                        style={user.role === 'ADMIN'
                                                            ? { background: 'rgba(234,88,12,0.07)', color: '#c2410c', borderColor: 'rgba(234,88,12,0.2)' }
                                                            : { background: 'rgba(1,120,142,0.07)', color: '#01788E', borderColor: 'rgba(1,120,142,0.2)' }
                                                        }
                                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                    >
                                                        {user.role === 'ADMIN'
                                                            ? <><RiUserLine /> Remove Admin</>
                                                            : <><RiShieldUserLine /> Make Admin</>}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                                        title="Delete user"
                                                    >
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
                        {currentUsers.length === 0 ? (
                            <div className="py-14 text-center px-4">
                                <FaUsers className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                                <p className="text-sm font-medium text-gray-500">No users found</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {searchTerm ? 'Try adjusting your search' : 'Users will appear here once they register'}
                                </p>
                            </div>
                        ) : currentUsers.map((user) => {
                            const uid = user.id || user._id;
                            const avatarColor = getAvatarColor(uid);
                            return (
                                <div key={uid} className="px-4 py-4 hover:bg-gray-50/60 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ background: avatarColor.bg, color: avatarColor.text }}
                                            >
                                                {getUserInitials(user)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {user.firstName || user.lastName
                                                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                                            : <span className="text-gray-400 italic text-xs">Unnamed</span>}
                                                    </p>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        user.role === 'ADMIN'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{user.phone || '—'}</p>
                                                <p className="text-[11px] sm:text-xs text-gray-400 truncate max-w-[180px]">{user.email || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Mobile action buttons */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                onClick={() => handleMakeAdmin(user)}
                                                className="p-2 rounded-lg border text-sm transition-all"
                                                style={user.role === 'ADMIN'
                                                    ? { background: 'rgba(234,88,12,0.07)', color: '#c2410c', borderColor: 'rgba(234,88,12,0.2)' }
                                                    : { background: 'rgba(1,120,142,0.07)', color: '#01788E', borderColor: 'rgba(1,120,142,0.2)' }
                                                }
                                                title={user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                                            >
                                                {user.role === 'ADMIN' ? <RiUserLine /> : <RiShieldUserLine />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-100 transition-all"
                                            >
                                                <RiDeleteBin5Line className="text-sm" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Pagination ── */}
                    {filteredUsers.length > 0 && (
                        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-xs text-gray-500">
                                    Showing{' '}
                                    <span className="font-semibold text-gray-700">{startIndex + 1}–{Math.min(endIndex, filteredUsers.length)}</span>
                                    {' '}of{' '}
                                    <span className="font-semibold text-gray-700">{filteredUsers.length}</span> users
                                </p>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <HiOutlineChevronLeft className="w-4 h-4" />
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) pageNum = i + 1;
                                        else if (currentPage <= 3) pageNum = i + 1;
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = currentPage - 2 + i;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => goToPage(pageNum)}
                                                className="w-8 h-8 rounded-lg text-xs font-semibold transition-colors border"
                                                style={currentPage === pageNum
                                                    ? { background: '#01788E', color: '#fff', borderColor: '#01788E' }
                                                    : { background: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }
                                                }
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <HiOutlineChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;






// main component code
// /* eslint-disable no-unused-vars */
// import { useQuery } from "@tanstack/react-query";
// import { useState } from "react";
// import useAxiosSecure from "../hooks/useAxiosSecure";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import { FaUsers, FaSearch } from "react-icons/fa";
// import { RiDeleteBin5Line } from "react-icons/ri";
// import { IoClose } from "react-icons/io5";

// const UserManagement = () => {
//     const axiosSecure = useAxiosSecure();
//     const [searchTerm, setSearchTerm] = useState("");
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage, setItemsPerPage] = useState(10);

//     const { data: allUsers = [], isLoading, refetch } = useQuery({
//         queryKey: ['all-users'],
//         queryFn: async () => {
//             const resReserv = await axiosSecure.get(`/auth/users`);
//             return resReserv.data?.Data;
//         }
//     });

//     // Filter users based on search
//     const filteredUsers = allUsers.filter(user => {
//         const searchLower = searchTerm.toLowerCase();
//         return (
//             user.firstName?.toLowerCase().includes(searchLower) ||
//             user.lastName?.toLowerCase().includes(searchLower) ||
//             user.phone?.includes(searchTerm) ||
//             user.email?.toLowerCase().includes(searchLower)
//         );
//     });

//     // Pagination Logic
//     const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     const currentUsers = filteredUsers.slice(startIndex, endIndex);

//     // Reset to first page when search changes
//     const handleSearch = (e) => {
//         setSearchTerm(e.target.value);
//         setCurrentPage(1);
//     };

//     const handleMakeAdmin = (user) => {
//         const isAdmin = user.role === 'ADMIN';

//         const config = {
//             title: isAdmin ? "Remove Admin Role?" : "Make Admin?",
//             text: isAdmin
//                 ? `${user.firstName || 'User'} will lose admin privileges.`
//                 : `${user.firstName || 'User'} will get admin privileges.`,
//             confirmButtonColor: isAdmin ? "#dc2626" : "#2563eb",
//             confirmButtonText: isAdmin ? "Remove Admin" : "Make Admin",
//             successTitle: isAdmin ? "Admin Removed!" : "Admin Added!",
//             successText: isAdmin
//                 ? `${user.firstName || 'User'} is no longer an admin.`
//                 : `${user.firstName || 'User'} is now an admin.`,
//             toastMessage: isAdmin
//                 ? `${user.firstName || 'User'} removed from admin role`
//                 : `${user.firstName || 'User'} promoted to admin`
//         };

//         Swal.fire({
//             title: config.title,
//             text: config.text,
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: config.confirmButtonColor,
//             cancelButtonColor: "#6b7280",
//             confirmButtonText: config.confirmButtonText,
//             cancelButtonText: "Cancel",
//             reverseButtons: true
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 try {
//                     const resPatch = await axiosSecure.patch(`/auth/change-role/${user.id}`, {
//                         role: isAdmin ? 'USER' : 'ADMIN'
//                     });

//                     if (resPatch.data.success) {
//                         refetch();
//                         Swal.fire({
//                             title: config.successTitle,
//                             text: config.successText,
//                             icon: "success",
//                             confirmButtonColor: config.confirmButtonColor
//                         });
//                         // toast.success(config.toastMessage);
//                     } else {
//                         throw new Error(resPatch.data.message || 'Failed to update role');
//                     }
//                 } catch (err) {
//                     Swal.fire({
//                         title: "Error!",
//                         text: err.message || 'Failed to update user role',
//                         icon: "error",
//                         confirmButtonColor: config.confirmButtonColor
//                     });
//                     console.error(err);
//                 }
//             }
//         });
//     };

//     const handleDeleteUser = (user) => {
//         Swal.fire({
//             title: "Are you sure?",
//             text: "You won't be able to revert this!",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#3085d6",
//             cancelButtonColor: "#d33",
//             confirmButtonText: "Yes, delete it!"
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 try {
//                     const resDelete = await axiosSecure.delete(`/auth/delete-account/${user.id}`);
//                     if (resDelete?.data?.success) {
//                         refetch();
//                         Swal.fire({
//                             title: "Deleted!",
//                             text: `${user.firstName || 'User'} has been deleted.`,
//                             icon: "success"
//                         });
//                     }
//                 } catch (err) {
//                     // toast.error('Something went wrong');
//                 }
//             }
//         });
//     };

//     // Pagination handlers
//     const goToPage = (page) => {
//         if (page >= 1 && page <= totalPages) {
//             setCurrentPage(page);
//         }
//     };

//     const handleItemsPerPageChange = (value) => {
//         setItemsPerPage(parseInt(value));
//         setCurrentPage(1);
//     };

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-[400px]">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="border border-gray-200 px-4 md:px-6 py-6 rounded-xl bg-white w-full max-w-6xl mx-auto shadow-sm">
//             {/* Header Section */}
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-gray-200">
//                 <div>
//                     <h2 className="flex items-center gap-2.5 text-xl font-semibold text-gray-800">
//                         <FaUsers className="text-blue-600" />
//                         User Management
//                     </h2>
//                     <p className="text-sm text-gray-500 mt-1">
//                         Total {filteredUsers.length} users • Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}
//                     </p>
//                 </div>

//                 {/* Search and Per Page Controls */}
//                 <div className="flex flex-col sm:flex-row gap-3">
//                     {/* Search Input */}
//                     <div className="relative">
//                         <input
//                             type="text"
//                             placeholder="Search by name, phone or email..."
//                             value={searchTerm}
//                             onChange={handleSearch}
//                             className="w-full sm:w-64 pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
//                         />
//                         <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
//                         {searchTerm && (
//                             <button
//                                 onClick={() => setSearchTerm("")}
//                                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                             >
//                                 <IoClose className="w-4 h-4" />
//                             </button>
//                         )}
//                     </div>

//                     {/* Items Per Page Select */}
//                     <select
//                         value={itemsPerPage}
//                         onChange={(e) => handleItemsPerPageChange(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm bg-white"
//                     >
//                         <option value="5">5 per page</option>
//                         <option value="10">10 per page</option>
//                         <option value="20">20 per page</option>
//                         <option value="50">50 per page</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Users Table */}
//             <div className="mt-6 overflow-x-auto">
//                 <table className="w-full">
//                     <thead>
//                         <tr className="bg-gray-50 border-y border-gray-200">
//                             <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
//                             <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User Name</th>
//                             <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
//                             <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
//                             <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                         {currentUsers.length === 0 ? (
//                             <tr>
//                                 <td colSpan="6" className="py-12 text-center">
//                                     <div className="text-gray-300 mb-3">
//                                         <FaUsers className="w-14 h-14 mx-auto opacity-40" />
//                                     </div>
//                                     <p className="text-gray-500 font-medium text-base">No users found</p>
//                                     <p className="text-sm text-gray-400 mt-1">
//                                         {searchTerm ? 'Try adjusting your search' : 'Users will appear here once they register'}
//                                     </p>
//                                 </td>
//                             </tr>
//                         ) : (
//                             currentUsers.map((user, idx) => (
//                                 <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
//                                     <td className="py-3 px-4">
//                                         <span className="text-sm font-medium text-gray-500">#{startIndex + idx + 1}</span>
//                                     </td>
//                                     <td className="py-3 px-4">
//                                         <div className="font-medium text-gray-900">
//                                             {user.firstName || user.lastName
//                                                 ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
//                                                 : 'Unnamed User'
//                                             }
//                                         </div>
//                                     </td>
//                                     <td className="py-3 px-4">
//                                         <div className="space-y-1">
//                                             <div className="text-sm font-medium text-gray-900">
//                                                 {user.phone || 'No phone'}
//                                             </div>
//                                             <div className="text-xs text-gray-500">
//                                                 {user.email || 'No email'}
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="py-3 px-4">
//                                         <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
//                                             ? 'bg-purple-50 text-purple-700 border border-purple-200'
//                                             : 'bg-green-50 text-green-700 border border-green-200'
//                                             }`}>
//                                             {user.role}
//                                         </span>
//                                     </td>
//                                     <td className="py-3 px-4">
//                                         <div className="flex items-center gap-2">
//                                             <button
//                                                 title={user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
//                                                 onClick={() => handleMakeAdmin(user)}
//                                                 className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${user.role === 'ADMIN'
//                                                     ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
//                                                     : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
//                                                     }`}
//                                             >
//                                                 {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
//                                             </button>
//                                             <button
//                                                 title="Delete User"
//                                                 onClick={() => handleDeleteUser(user)}
//                                                 className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
//                                             >
//                                                 <RiDeleteBin5Line className="text-lg" />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination */}
//             {filteredUsers.length > 0 && (
//                 <div className="mt-6 pt-4 border-t border-gray-200">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                         <div className="text-sm text-gray-600">
//                             Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
//                             <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
//                             <span className="font-semibold text-gray-900">{filteredUsers.length}</span> users
//                         </div>

//                         <div className="flex items-center gap-2">
//                             {/* Previous Button */}
//                             <button
//                                 onClick={() => goToPage(currentPage - 1)}
//                                 disabled={currentPage === 1}
//                                 className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === 1
//                                     ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
//                                     : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                                     }`}
//                             >
//                                 Previous
//                             </button>

//                             {/* Page Numbers */}
//                             <div className="flex items-center gap-1">
//                                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                                     let pageNum;
//                                     if (totalPages <= 5) {
//                                         pageNum = i + 1;
//                                     } else if (currentPage <= 3) {
//                                         pageNum = i + 1;
//                                     } else if (currentPage >= totalPages - 2) {
//                                         pageNum = totalPages - 4 + i;
//                                     } else {
//                                         pageNum = currentPage - 2 + i;
//                                     }

//                                     return (
//                                         <button
//                                             key={pageNum}
//                                             onClick={() => goToPage(pageNum)}
//                                             className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
//                                                 ? 'bg-blue-600 text-white'
//                                                 : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
//                                                 }`}
//                                         >
//                                             {pageNum}
//                                         </button>
//                                     );
//                                 })}
//                             </div>

//                             {/* Next Button */}
//                             <button
//                                 onClick={() => goToPage(currentPage + 1)}
//                                 disabled={currentPage === totalPages}
//                                 className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === totalPages
//                                     ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
//                                     : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                                     }`}
//                             >
//                                 Next
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default UserManagement;