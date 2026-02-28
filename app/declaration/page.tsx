"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import axios from "axios";

export default function Instructions() {
  const [companyName, setCompanyName] = useState("");
  const [assData, setAssData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const isCheck = localStorage.getItem("check");
    if (isCheck !== "true") {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const fetchLatestAssignment = async () => {
      try {
        const res = await axios.get("/api/admin/assignments/latest");
        if (res.data) {
          setAssData(res.data);
          setCompanyName(res.data.companyName);
        }
      } catch (err) {
        console.error("Error fetching latest assignment", err);
      }
    };

    fetchLatestAssignment();
  }, []);

  const handleProceed = () => {
    router.replace("/assignment");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <Head>
        <title>General Instructions - {companyName || "MCQ Portal"}</title>
      </Head>

      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b shadow-sm py-3 px-4 sm:px-6">
        <div className="mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            {assData?.logo ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-md overflow-hidden border">
                <img
                  src={assData.logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center shadow">
                <span className="text-blue-700 font-bold text-lg sm:text-xl">
                  ?
                </span>
              </div>
            )}

            <div>
              <h1 className="text-base sm:text-xl font-bold text-blue-700">
                {companyName || "Online Examination Portal"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Computer Based Test (CBT) System
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-600">
              Candidate Dashboard
            </p>
            <p className="text-xs text-gray-400">
              Secure Examination Environment
            </p>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              General Instructions
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Please read the instructions carefully before starting the
              examination.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8 relative">
            <div className="absolute top-4 right-6 text-xs text-gray-400 hidden sm:block">
              Scroll to read completely
            </div>

            {/* Scroll Container */}
            <div className="max-h-[350px] sm:max-h-[420px] overflow-y-auto pr-2 text-gray-700 leading-relaxed text-sm sm:text-base space-y-4 scroll-smooth">
              {assData?.declarationContent ? (
                <p className="whitespace-pre-line">
                  {assData.declarationContent}
                </p>
              ) : (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Warning Box */}
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Once you click <strong>“I Accept & Start Test”</strong>, the
                timer will begin immediately. Do not refresh, switch tabs, or
                navigate back. Any such action may auto-submit your test.
              </p>
            </div>

            {/* Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleProceed}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-base sm:text-lg px-8 sm:px-10 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                I Accept & Start Test
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © 2026 {companyName || "MCQ Portal"} | All Rights Reserved
      </footer>
    </div>
  );
}
