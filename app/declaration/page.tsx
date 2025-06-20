'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import axios from "axios";

export default function Instructions() {
    const [companyName, setCompanyName] = useState("");
    const [assData, setAssData] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
          const isCheck = localStorage.getItem('check');
          if (isCheck !== 'true') {
            router.push('/');
          }
        }
      }, [router]);

    useEffect(() => {
        const fetchLatestAssignment = async () => {
            try {
                const res = await axios.get("/api/admin/assignments/latest");
                if (res.data) {
                    console.log("Assignment fetched successfully", res.data);
                    const { companyName } = res.data;
                    setAssData(res.data);
                    setCompanyName(companyName);
                }
            } catch (err) {
                console.error("Error fetching latest assignment", err);
                // Optionally set an error state to display a message to the user
            }
        };

        fetchLatestAssignment();
    }, []);

    const handleProceed = async () => {
        router.push("/assignment");
    };

    return (
        <div className="min-h-screen overflow-x-hidden w-full bg-gray-50 text-gray-800 font-sans flex flex-col">
            <Head>
                <title>General Instructions - {companyName || "NTA"}</title>
            </Head>

            {/* Header */}
            <header className="bg-white border-b shadow-sm py-4 px-4 sm:px-6">
                <div className="mx-auto  flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {assData?.logo ? (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-full overflow-hidden flex items-center justify-center">
                                <img
                                    src={assData?.logo}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                    onError={() => console.error("Error loading logo")}
                                />
                            </div>
                        ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-bold text-lg sm:text-xl">?</span>
                            </div>
                        )}
                        <div>
                            <h1 className="text-lg font-bold text-blue-700 truncate">
                                {companyName ? companyName : "[CONDUCTOR INSTITUTE]"}
                            </h1>
                            <p className="text-green-500 font-semibold text-sm -mt-1">
                                Excellence in Assessment
                            </p>
                        </div>
                    </div>
                    <div className="text-sm text-right"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto py-6 px-4 sm:px-6">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
                        Declaration
                    </h2>
                    <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 sm:p-6 text-gray-700 leading-relaxed text-sm sm:text-base overflow-y-auto max-h-96">
                        {assData?.declarationContent ? (
                            <p>{assData.declarationContent}</p>
                        ) : (
                            <p className="text-center text-gray-500">Loading declaration...</p>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t shadow-sm py-4 px-4 sm:px-6">
                <div className="mx-auto max-w-3xl text-center text-xs text-gray-500">
                    © 2025 {companyName}
                </div>
            </footer>

            {/* Proceed Button (Fixed at the bottom) */}
            <div className="fixed bottom-[10%] left-0 w-full py-3 px-4 sm:px-6">
                <div className="mx-auto max-w-3xl flex justify-center">
                    <button
                        onClick={handleProceed}
                        className="bg-blue-600 text-white font-medium text-lg px-8 py-3 rounded-md transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                        I Accept
                    </button>
                </div>
            </div>
        </div>
    );
}