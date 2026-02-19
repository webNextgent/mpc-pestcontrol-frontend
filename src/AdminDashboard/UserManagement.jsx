/* eslint-disable no-unused-vars */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { FaUsers, FaSearch } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoClose } from "react-icons/io5";

const UserManagement = () => {
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { data: allUsers = [], isLoading, refetch } = useQuery({
        queryKey: ['all-users'],
        queryFn: async () => {
            const resReserv = await axiosSecure.get(`/auth/users`);
            return resReserv.data?.Data;
        }
    });

    // Filter users based on search
    const filteredUsers = allUsers.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.firstName?.toLowerCase().includes(searchLower) ||
            user.lastName?.toLowerCase().includes(searchLower) ||
            user.phone?.includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchLower)
        );
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to first page when search changes
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleMakeAdmin = (user) => {
        const isAdmin = user.role === 'ADMIN';

        const config = {
            title: isAdmin ? "Remove Admin Role?" : "Make Admin?",
            text: isAdmin
                ? `${user.firstName || 'User'} will lose admin privileges.`
                : `${user.firstName || 'User'} will get admin privileges.`,
            confirmButtonColor: isAdmin ? "#dc2626" : "#2563eb",
            confirmButtonText: isAdmin ? "Remove Admin" : "Make Admin",
            successTitle: isAdmin ? "Admin Removed!" : "Admin Added!",
            successText: isAdmin
                ? `${user.firstName || 'User'} is no longer an admin.`
                : `${user.firstName || 'User'} is now an admin.`,
            toastMessage: isAdmin
                ? `${user.firstName || 'User'} removed from admin role`
                : `${user.firstName || 'User'} promoted to admin`
        };

        Swal.fire({
            title: config.title,
            text: config.text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: config.confirmButtonColor,
            cancelButtonColor: "#6b7280",
            confirmButtonText: config.confirmButtonText,
            cancelButtonText: "Cancel",
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const resPatch = await axiosSecure.patch(`/auth/change-role/${user.id}`, {
                        role: isAdmin ? 'USER' : 'ADMIN'
                    });

                    if (resPatch.data.success) {
                        refetch();
                        Swal.fire({
                            title: config.successTitle,
                            text: config.successText,
                            icon: "success",
                            confirmButtonColor: config.confirmButtonColor
                        });
                        // toast.success(config.toastMessage);
                    } else {
                        throw new Error(resPatch.data.message || 'Failed to update role');
                    }
                } catch (err) {
                    Swal.fire({
                        title: "Error!",
                        text: err.message || 'Failed to update user role',
                        icon: "error",
                        confirmButtonColor: config.confirmButtonColor
                    });
                    console.error(err);
                }
            }
        });
    };

    const handleDeleteUser = (user) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const resDelete = await axiosSecure.delete(`/auth/delete-account/${user.id}`);
                    if (resDelete?.data?.success) {
                        refetch();
                        Swal.fire({
                            title: "Deleted!",
                            text: `${user.firstName || 'User'} has been deleted.`,
                            icon: "success"
                        });
                    }
                } catch (err) {
                    // toast.error('Something went wrong');
                }
            }
        });
    };

    // Pagination handlers
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 px-4 md:px-6 py-6 rounded-xl bg-white w-full max-w-6xl mx-auto shadow-sm">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-gray-200">
                <div>
                    <h2 className="flex items-center gap-2.5 text-xl font-semibold text-gray-800">
                        <FaUsers className="text-blue-600" />
                        User Management
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Total {filteredUsers.length} users • Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}
                    </p>
                </div>

                {/* Search and Per Page Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full sm:w-64 pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <IoClose className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Items Per Page Select */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                    >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-y border-gray-200">
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User Name</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-12 text-center">
                                    <div className="text-gray-300 mb-3">
                                        <FaUsers className="w-14 h-14 mx-auto opacity-40" />
                                    </div>
                                    <p className="text-gray-500 font-medium text-base">No users found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {searchTerm ? 'Try adjusting your search' : 'Users will appear here once they register'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            currentUsers.map((user, idx) => (
                                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="py-3 px-4">
                                        <span className="text-sm font-medium text-gray-500">#{startIndex + idx + 1}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-gray-900">
                                            {user.firstName || user.lastName
                                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                                : 'Unnamed User'
                                            }
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.phone || 'No phone'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user.email || 'No email'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                            : 'bg-green-50 text-green-700 border border-green-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                title={user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                                                onClick={() => handleMakeAdmin(user)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${user.role === 'ADMIN'
                                                    ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                                                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                                    }`}
                                            >
                                                {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                                            </button>
                                            <button
                                                title="Delete User"
                                                onClick={() => handleDeleteUser(user)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                            >
                                                <RiDeleteBin5Line className="text-lg" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                            <span className="font-semibold text-gray-900">{filteredUsers.length}</span> users
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === 1
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === totalPages
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;