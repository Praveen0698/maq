"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type ResponseStatus =
  | "answered"
  | "review"
  | "review-answered"
  | "skipped"
  | "";
type Responses = {
  [questionNumber: number]: {
    selected: number | null;
    status: ResponseStatus;
  };
};

type Option = { text: string; image?: string };
type Question = {
  id: string;
  question: string;
  image?: string;
  options: Option[];
};

export default function MCQPage() {
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [responses, setResponses] = useState<Responses>({});
  const [timeLeft, setTimeLeft] = useState<number>(120 * 60); // 120 minutes
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assData, setAssData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isCheck = localStorage.getItem("check");
      if (isCheck !== "true") {
        router.push("/");
      }
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  useEffect(() => {
    const fetchAssignmentAndQuestions = async () => {
      try {
        const assignmentRes = await axios.get("/api/admin/assignments/latest");
        setAssData(assignmentRes.data);
        const questionIds = assignmentRes.data.questionIds;

        const questionsRes = await axios.post(
          "/api/admin/questions/ass-questions",
          { ids: questionIds }
        );
        const fetchedQuestions = questionsRes.data.map((q: any) => ({
          id: q._id,
          question: q.text,
          image: q.image,
          options: q.options.map((opt: any) => ({
            text: opt.text,
            image: opt.image,
          })),
        }));
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.log("Error fetching assignment/questions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentAndQuestions();
  }, []);

  useEffect(() => {
    if (!assData?.durationMinutes) return;

    const now = Date.now();
    const durationInMs = assData.durationMinutes * 60 * 1000;

    let storedEndTime = sessionStorage.getItem("examEndTime");

    if (!storedEndTime) {
      const newEndTime = now + durationInMs;
      sessionStorage.setItem("examEndTime", newEndTime.toString());
      storedEndTime = newEndTime.toString();
    }

    const endTime = parseInt(storedEndTime, 10);

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeRemaining = Math.max(
        0,
        Math.floor((endTime - currentTime) / 1000)
      );

      setTimeLeft(timeRemaining);

      if (timeRemaining <= 0) {
        clearInterval(interval);
        setIsTimeUp(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [assData]);

  useEffect(() => {
    if (isTimeUp) {
      setTimeout(() => {
        localStorage.removeItem("check");
        router.push("/submitted");
      }, 3000);
    }
  }, [isTimeUp, router]);

  const formatTime = () => {
    const hours = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const updateResponse = (type: ResponseStatus) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion]: {
        selected: prev[currentQuestion]?.selected ?? null,
        status: type,
      },
    }));
  };

  const handleOptionChange = (value: number) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion]: {
        selected: value,
        status: "answered",
      },
    }));
  };

  const goToQuestion = (q: number) => setCurrentQuestion(q);
  const nextQuestion = () =>
    setCurrentQuestion((q) => Math.min(q + 1, questions.length));
  const prevQuestion = () => setCurrentQuestion((q) => Math.max(q - 1, 1));

  const renderStatusColor = (q: number): string => {
    const status = responses[q]?.status;
    if (!responses[q]) return "bg-gray-300";
    if (status === "answered") return "bg-green-500";
    if (status === "review") return "bg-purple-500";
    if (status === "review-answered") return "bg-indigo-600";
    if (status === "skipped") return "bg-red-500";
    return "bg-gray-300";
  };

  const openSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };

  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      localStorage.removeItem("check");
      router.push("/submitted");
    }, 300);
  };

  const current = questions[currentQuestion - 1];

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-orange-500 text-white py-4 px-4 sm:px-6 md:px-8 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
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
                <span className="text-gray-600 font-bold text-lg sm:text-xl">
                  ?
                </span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-white truncate">
                {assData?.companyName
                  ? assData.companyName
                  : "[CONDUCTOR INSTITUTE]"}
              </h1>
              <p className="text-white font-semibold text-sm -mt-1">
                Excellence in Assessment
              </p>
            </div>
          </div>
          <div className="text-sm md:text-base text-right">
            <div>
              Candidate Name:{" "}
              <span className="font-semibold">
                {user?.name || "[Your Name]"}
              </span>
            </div>
            <div>
              Remaining Time:{" "}
              <span className="text-yellow-300 font-bold">{formatTime()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto py-6 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto lg:grid grid-cols-3 gap-6">
          {/* Question Area */}
          <div className="col-span-2 bg-white rounded-md shadow-md p-4 sm:p-6">
            <div className="text-lg font-semibold mb-4">
              Question {currentQuestion}:
            </div>
            <div className="mb-4">
              {current?.question}
              {current?.image && (
                <img
                  src={current.image}
                  alt="question"
                  style={{ maxHeight: "120px" }}
                  className="max-w-full h-auto mt-2 rounded-md"
                />
              )}
            </div>
            <div className="space-y-3 mb-6">
              {current?.options?.map((option, idx) => (
                <label key={idx} className="flex items-start space-x-2">
                  <input
                    type="radio"
                    name="option"
                    value={idx}
                    checked={responses[currentQuestion]?.selected === idx}
                    onChange={() => handleOptionChange(idx)}
                    className="mt-1"
                  />
                  <span>
                    {`${String.fromCharCode(65 + idx)}) ${option.text}`}
                    {option.image && (
                      <img
                        src={option.image}
                        alt={`option-${String.fromCharCode(65 + idx)}`}
                        className="max-w-full h-auto ml-4 rounded-md"
                        style={{ maxHeight: "60px" }}
                      />
                    )}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => {
                  updateResponse("answered");
                  nextQuestion();
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
              >
                Save & Next
              </button>
              <button
                onClick={() => {
                  updateResponse("review-answered");
                  nextQuestion();
                }}
                className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm sm:text-base"
              >
                Save & Mark for Review
              </button>
              <button
                onClick={() =>
                  setResponses((prev) => ({
                    ...prev,
                    [currentQuestion]: { selected: null, status: "" },
                  }))
                }
                className="border border-gray-400 px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base"
              >
                Clear Response
              </button>
              <button
                onClick={() => {
                  updateResponse("review");
                  nextQuestion();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              >
                Mark for Review & Next
              </button>
            </div>
            <div className="flex justify-between">
              <button
                onClick={prevQuestion}
                className="border border-gray-400 px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base"
              >
                &lt;&lt; Back
              </button>
              <button
                onClick={nextQuestion}
                className="border border-gray-400 px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base"
              >
                Next &gt;&gt;
              </button>
            </div>
          </div>

          {/* Palette */}
          <div className="bg-white rounded-md shadow-md p-4 sm:p-6">
            <h3 className="font-semibold mb-3">Question Palette</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-gray-300 inline-block"></span> Not
                Visited
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-red-500 inline-block"></span> Not
                Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 inline-block"></span>{" "}
                Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-500 inline-block"></span>{" "}
                Marked for Review
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-600 inline-block"></span>{" "}
                Answered & Marked
              </div>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
              {questions.map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToQuestion(i + 1)}
                  className={`text-sm cursor-pointer w-8 h-8 sm:w-10 sm:h-10 border text-white rounded-sm flex items-center justify-center ${renderStatusColor(
                    i + 1
                  )}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <button
              onClick={openSubmitModal}
              className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            >
              Submit
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t shadow-sm py-4 px-4 sm:px-6 md:px-8 text-center text-xs text-gray-500">
        <div className="container mx-auto">© 2025 {assData?.companyName}</div>
      </footer>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-md shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Submission</h2>
            <p className="mb-4">
              Are you sure you want to submit your assessment?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeSubmitModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {submitting ? (
                  <span className="animate-spin">Submitting...</span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTimeUp && (
        <div className="fixed inset-0 bg-black/60  flex justify-center items-center">
          <div className="bg-white rounded-md shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Time's Up!</h2>
            <p className="mb-4">
              The assessment time has expired. Your test is being submitted
              automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
