'use client';

import { useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';

type Assessment = {
    _id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    duration: number; // Assuming duration is in minutes
};

export default function AdminDashboard() {
    const [activeAssessments, setActiveAssessments] = useState<Assessment[]>([]);
    const [pastAssessments, setPastAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const res = await fetch('/api/admin/assignments');

                if (!res.ok) {
                    const errorMessage = await res.text();  // Log the response text in case of an error
                    throw new Error(`HTTP error! status: ${res.status}, ${errorMessage}`);
                }

                const data = await res.json();

                if (data && data.length > 0) {
                    const now = new Date();

                    // Categorize active and past assessments based on startTime and durationMinutes
                    const active = data.filter((a: any) => {
                        const startTime = new Date(a.startTime);
                        const endTime = new Date(startTime.getTime() + a.durationMinutes * 60000);  // Convert duration to milliseconds
                        return endTime > now; // Active if the endTime is in the future
                    });

                    const past = data.filter((a: any) => {
                        const startTime = new Date(a.startTime);
                        const endTime = new Date(startTime.getTime() + a.durationMinutes * 60000);
                        return endTime <= now; // Past if the endTime has passed
                    });

                    setActiveAssessments(active);
                    setPastAssessments(past);
                } else {
                    console.warn('No assessments found.');
                }
            } catch (error) {
                console.log('Failed to fetch assessments:', error);
                alert('An error occurred while fetching assessments. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssessments();
    }, []); // Empty dependency array means it runs only once after component mounts

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

    if (loading) return <div className="p-6 text-lg">Loading...</div>;

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <section>
                <h2 className="text-xl font-semibold mb-3">🟢 Active Assessments</h2>
                {activeAssessments?.length === 0 ? (
                    <p>No active assessments.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeAssessments?.map((a) => (
                            <div
                                key={a._id}
                                className="p-4 border rounded-xl shadow-sm "
                                onClick={() => redirect(`/admin/assignments/${a._id}`)}
                            >
                                <h3 className="text-lg font-bold">{a.title}</h3>
                                <p className="text-sm text-gray-600">{a.description}</p>
                                <p className="text-sm mt-2">
                                    Start: {formatDate(a.startTime)}
                                </p>
                                <p className="text-sm">End: {formatDate(a.endTime)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-3">📁 Past Assessments</h2>
                {pastAssessments?.length === 0 ? (
                    <p>No past assessments.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pastAssessments?.map((a) => (
                            <div
                                key={a._id}
                                onClick={() => redirect(`/admin/assignments/${a._id}`)}
                                className="p-4 border rounded-xl shadow-sm"
                            >
                                <h3 className="text-lg font-bold">{a.title}</h3>
                                <p className="text-sm text-gray-600">{a.description}</p>
                                <p className="text-sm mt-2">
                                    Start: {formatDate(a.startTime)}
                                </p>
                                <p className="text-sm">End: {formatDate(a.endTime)}</p>
                                <button
                                    onClick={() => router.push(`/admin/assessment/${a._id}`)}
                                    className="mt-3 bg-gray-700 text-white px-4 py-1.5 rounded hover:bg-gray-800"
                                >
                                    Review Results
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
