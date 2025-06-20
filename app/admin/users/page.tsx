"use client"

import { useEffect, useState } from 'react';

interface User {
    _id: string;
    email: string;
    name?: string;
    password?: string; // Assuming password is returned (for demo purposes)
}

const handleCopy = (email: string, password?: string, name?: string) => {
    const credentials = `Name: ${name || 'N/A'}\nEmail: ${email}\nPassword: ${password || 'N/A'}`;
    navigator.clipboard.writeText(credentials)
        .then(() => alert('Copied to clipboard!'))
        .catch(() => alert('Failed to copy!'));
};

export default function AdminUserManager() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [createdUser, setCreatedUser] = useState<{ email: string; name?: string; password: string } | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null); // State for editing user

    // Fetch all existing users
    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                const errorText = await res.text();
                throw new Error(`Fetch error: ${res.status} ${errorText}`);
            }
        } catch (error) {
            console.log('Error fetching users', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleGeneratePassword = () => {
        const generated = Math.random().toString(36).slice(-8);
        setPassword(generated);
    };

    const handleCreateUser = async () => {
        if (!email || !password) return alert('Email and password are required');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();

            if (res.ok) {
                setCreatedUser({ email: data.email, name: data.name, password });
                setEmail('');
                setName('');
                setPassword('');
                await fetchUsers();
                alert(`✅ User created: ${data.email}`);

                // Send credentials via email
                await fetch('/api/admin/send-credentials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: data.email, name: data.name, password }),
                });
            } else {
                alert(`❌ ${data.message || 'Failed to create user'}`);
            }
        } catch (error) {
            console.log('Error creating user:', error);
            alert('Something went wrong. Please try again.');
        }

        setLoading(false);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`/api/admin/users/`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (res.ok) {
                alert("✅ User deleted");
                await fetchUsers(); // Refresh list
            } else {
                const result = await res.json();
                alert(`❌ ${result.message || 'Failed to delete user'}`);
            }
        } catch (error) {
            console.log("Error deleting user:", error);
            alert("Something went wrong while deleting the user.");
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user); // Set the user to be edited
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        try {
            const res = await fetch(`/api/admin/users`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser),
            });

            if (res.ok) {
                const result = await res.json();
                console.log("result", result);

                alert('✅ User updated successfully');
                setEditingUser(null); // Close the edit form
                await fetchUsers(); // Refresh the user list
            } else {
                const result = await res.json();
                alert(`❌ ${result.message || 'Failed to update user'}`);
            }
        } catch (error) {
            console.log('Error updating user:', error);
            alert('Something went wrong while updating the user.');
        }
    };

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full h-screen py-2 px-40 mx-auto gap-4 flex flex-col overflow-auto ">
            {/* Create User Section */}
            <div className="w-full h-[35%] p-4 border rounded shadow-sm ">
                <h2 className="text-xl font-semibold mb-4">Create New User</h2>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <input
                        type="email"
                        placeholder="Email *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Password *"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex-1 border px-3 py-2 rounded"
                        />
                        <button
                            onClick={handleGeneratePassword}
                            className="bg-blue-500 text-white px-3 py-2 rounded"
                        >
                            Generate
                        </button>
                    </div>
                    <button
                        onClick={handleCreateUser}
                        disabled={loading}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </div>

            {/* Edit User Section */}
            {editingUser && (
                <div className="w-full h-[35%] p-4 border rounded shadow-sm ">
                    <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Name"
                            value={editingUser.name || ''}
                            onChange={(e) =>
                                setEditingUser({ ...editingUser, name: e.target.value })
                            }
                            className="w-full border px-3 py-2 rounded"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={editingUser.email}
                            onChange={(e) =>
                                setEditingUser({ ...editingUser, email: e.target.value })
                            }
                            className="w-full border px-3 py-2 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Password"
                            value={editingUser.password || ''}
                            onChange={(e) =>
                                setEditingUser({ ...editingUser, password: e.target.value })
                            }
                            className="w-full border px-3 py-2 rounded"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleUpdateUser}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Update User
                            </button>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User List Section */}
            <div className="w-full h-[100%] border rounded shadow-sm flex flex-col ">
                <h2 className="text-xl text-center font-semibold mb-3 px-4 py-2">Existing Users</h2>
                <input
                    type="text"
                    placeholder="Search by email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[90%] self-center mb-3 border px-3 py-2 rounded"
                />
                <ul className="space-y-2 p-4 h-[80%] overflow-auto">
                    {filteredUsers.length === 0 && <li>No users found.</li>}
                    {filteredUsers.map((user) => (
                        <li key={user._id} className="border-b py-3 text-sm space-y-1">
                            <div><strong>Name:</strong> {user.name || 'N/A'}</div>
                            <div><strong>Email:</strong> {user.email}</div>
                            <div><strong>Password:</strong> {user.password || 'N/A'}</div>

                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handleCopy(user.email, user.password, user.name)}
                                    className="border hover:bg-gray-300 hover:text-black text-xs px-2 py-1 rounded"
                                >
                                    Copy Credentials
                                </button>
                                <button
                                    onClick={() => handleEditUser(user)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
