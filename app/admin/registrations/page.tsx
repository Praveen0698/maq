'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ViewRegistrations() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [registrations, setRegistrations] = useState<any[]>([]);

    useEffect(() => {
        axios.get('/api/admin/assignments').then((res) => setAssignments(res.data));
    }, []);

    const fetchRegistrations = async (assignmentId: string) => {
        setSelectedId(assignmentId);
        const res = await axios.get(`/api/admin/registrations?assignmentId=${assignmentId}`);
        setRegistrations(res.data);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Registered Users</h1>

            <select
                className="w-full p-2 mb-6 border rounded"
                value={selectedId}
                onChange={(e) => fetchRegistrations(e.target.value)}
            >
                <option value="">Select Assignment</option>
                {assignments.map((a) => (
                    <option key={a._id} value={a._id}>
                        {a.title}
                    </option>
                ))}
            </select>

            {registrations.length > 0 ? (
                <table className="w-full border border-collapse text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border p-2">#</th>
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Email</th>
                            <th className="border p-2">Registered At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map((r, idx) => (
                            <tr key={r._id}>
                                <td className="border p-2 text-center">{idx + 1}</td>
                                <td className="border p-2">{r.name}</td>
                                <td className="border p-2">{r.email}</td>
                                <td className="border p-2">{new Date(r.registeredAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : selectedId ? (
                <p className="text-gray-500">No registrations found.</p>
            ) : null}
        </div>
    );
}
