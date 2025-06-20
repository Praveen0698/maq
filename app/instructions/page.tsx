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

      <div className="mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="flex justify-between items-center py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-full overflow-hidden flex items-center justify-center">
              {assData?.logo ? (
                <img
                  src={assData?.logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  onError={() => console.error("Error loading logo")}
                />
              ) : (
                <span className="text-white font-bold text-lg sm:text-xl">
                  ?
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900 truncate">
                {companyName ? companyName : "[CONDUCTOR INSTITUTE]"}
              </h1>
              <p className="text-green-600 font-semibold text-sm sm:text-base -mt-1">
                Excellence in Assessment
              </p>
            </div>
          </div>
          <div className="text-sm text-right"></div>
        </div>

        <div className="bg-orange-500 text-white text-lg font-bold py-2 px-4 mt-6 rounded-md">
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
              className="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              PROCEED
            </button>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-600 py-4 mt-8 border-t">
          © 2025 {companyName}
        </footer>
      </div>
    </div>
  );
}
