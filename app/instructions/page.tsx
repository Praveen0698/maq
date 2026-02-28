"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import axios from "axios";

export default function Instructions() {
  const [companyName, setCompanyName] = useState("");
  const [assData, setAssData] = useState<any>(null);
  const router = useRouter();
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isCheck = localStorage.getItem("check");
      if (isCheck !== "true") {
        setAuthorized(false);
        router.push("/");
      } else {
        setAuthorized(true);
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
        console.log("Error fetching latest assignment", err);
      }
    };

    fetchLatestAssignment();
  }, []);

  const handleProceed = async () => {
    router.push("/declaration");
  };

  if (!authorized) {
    return <></>;
  }

  return (
    <div className="min-h-screen overflow-x-hidden w-full bg-white text-black font-sans overflow-auto">
      <Head>
        <title>General Instructions - {companyName || "NTA"}</title>
      </Head>

      <header className="bg-white/70 backdrop-blur-md shadow-sm py-4 px-6">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {assData?.logo ? (
              <div className="w-12 h-12 bg-white rounded-full shadow-md overflow-hidden flex items-center justify-center border">
                <img
                  src={assData.logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shadow">
                <span className="text-blue-700 font-bold text-xl">?</span>
              </div>
            )}

            <div>
              <h1 className="text-xl font-bold text-blue-700">
                {companyName || "Online Examination Portal"}
              </h1>
              <p className="text-sm text-gray-500">
                Computer Based Test (CBT) System
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <p className="text-sm text-gray-600 font-medium">
              Candidate Dashboard
            </p>
            <p className="text-xs text-gray-400">
              Secure Examination Environment
            </p>
          </div>
        </div>
      </header>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="bg-gray-500 text-white text-lg font-bold py-2 px-4 mt-6 rounded-md">
          GENERAL INSTRUCTIONS
        </div>

        <div className="py-6 text-[15px] leading-relaxed">
          <div className="text-center font-bold text-lg mb-4">
            Please read the instructions carefully
          </div>

          <div className="mb-6">
            <p className="font-bold">General Instructions:</p>
            <ol className="list-decimal pl-5">
              <li>
                Candidates are strictly prohibited from navigating away from the
                examination window. Any attempt to refresh, close, switch tabs,
                minimize the window, or use the browser back button will result
                in automatic submission of the test.
              </li>
              <li>
                The clock will be set at the server. The countdown timer in the
                top right corner will show remaining time.
              </li>
              <li>
                The Questions Palette will show the status of each question
                using these symbols:
                <ol className="list-decimal pl-5 mt-2">
                  <li>
                    <span className="inline-block w-4 h-4 border" /> You have
                    not visited the question yet.
                  </li>
                  <li>
                    <span className="inline-block w-4 h-4 bg-red-500" /> You
                    have not answered the question.
                  </li>
                  <li>
                    <span className="inline-block w-4 h-4 bg-green-500" /> You
                    have answered the question.
                  </li>
                  <li>
                    <span className="inline-block w-4 h-4 bg-purple-700" /> You
                    marked it for review without answering.
                  </li>
                  <li>
                    <span className="inline-block w-4 h-4 bg-indigo-600" />
                    Answered & marked for review – will be considered for
                    evaluation.
                  </li>
                </ol>
              </li>
              <li>
                Click “&gt;” or “&lt;” to toggle question palette visibility.
              </li>
            </ol>
          </div>

          <div className="mb-6">
            <p className="font-bold underline">Navigating to a Question:</p>
            <ol className="list-decimal pl-5 leading-relaxed">
              <li>Click question number to go directly.</li>
              <li>Use Save & Next to save and go to next.</li>
              <li>Use Mark for Review & Next for flagging with saving.</li>
            </ol>
          </div>

          <div className="mb-6">
            <p className="font-bold underline">Answering a Question:</p>
            <ol className="list-decimal pl-5 leading-relaxed">
              <li>Select by clicking an option.</li>
              <li>Deselect by clicking again or “Clear Response”.</li>
              <li>Change by selecting another option.</li>
              <li>Use Save & Next to save your answer.</li>
              <li>Use Mark for Review & Next to flag the question.</li>
            </ol>
          </div>

          <p className=" font-semibold text-sm mt-6 mb-4">
            Note:{" "}
            <span className="text-red-600">
              Please note all questions will appear in english language. Do not
              refresh the page once exam has started.
            </span>
          </p>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleProceed}
              className="w-full cursor-pointer sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg px-10 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Proceed to Declaration
            </button>
          </div>
        </div>
      </div>
      <footer className="bg-white border-t border-t-gray-200 shadow-lg py-4 px-4 sm:px-6 md:px-8 text-center text-xs text-gray-500">
        © 2025 {companyName}
      </footer>
    </div>
  );
}
