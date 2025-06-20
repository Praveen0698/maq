'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Assignment {
    _id: string;
    title: string;
    description?: string;
    startTime: string;
    durationMinutes: number;
}

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await fetch('/api/admin/assignments');
                const data = await res.json();
                setAssignments(data);
            } catch (err) {
                console.log('Failed to fetch assignments', err);
            }
        };

        fetchAssignments();
    }, []);

    const handleClick = (id: string) => {
        router.push(`/admin/assignments/${id}`);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex justify-between items-center">
                Assignments <Link href="/admin/assignments/create">
                    <span className='text-lg border border-dashed px-4 py-2'>Create New +</span>
                </Link>{" "}
            </h2>
            {assignments.length === 0 ? (
                <p>No assignments found.</p>
            ) : (
                <ul className="space-y-3">
                    {assignments.map((assignment) => (
                        <li
                            key={assignment._id}
                            onClick={() => handleClick(assignment._id)}
                            className="p-4 border rounded-lg shadow hover:bg-gray-50 hover:text-black cursor-pointer"
                        >
                            <h3 className="text-xl font-medium">{assignment.title}</h3>
                            <p className="text-gray-600">{assignment.description}</p>
                            <p className="text-sm text-gray-500">
                                Starts: {new Date(assignment.startTime).toLocaleString()} |
                                Duration: {assignment.durationMinutes} mins
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
