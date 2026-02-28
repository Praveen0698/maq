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

const shuffleArray = (array: Question[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraAllowed, setCameraAllowed] = useState<boolean | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isCheck = localStorage.getItem("check");
      if (isCheck !== "true") {
        router.push("/");
      }
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setCameraAllowed(true);
    } catch (error) {
      console.error("Camera access denied", error);
      setCameraAllowed(false);
    }
  };

  useEffect(() => {
    const handleBackButton = () => {
      handleSubmit();
    };

    window.history.pushState(null, "", window.location.href);

    const onPopState = () => {
      handleBackButton();
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // Required for Chrome
      handleSubmit();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cameraStream, assData]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;

      videoRef.current.onloadedmetadata = async () => {
        try {
          await videoRef.current?.play();
        } catch (err) {
          console.error("Video play error:", err);
        }
      };
    }
  }, [cameraStream]);

  useEffect(() => {
    const fetchAssignmentAndQuestions = async () => {
      try {
        const assignmentRes = await axios.get("/api/admin/assignments/latest");

        setAssData(assignmentRes.data);
        const questionIds = assignmentRes.data.questionIds;

        const questionsRes = await axios.post(
          "/api/admin/questions/ass-questions",
          { ids: questionIds },
        );

        const fetchedQuestions: Question[] = questionsRes.data.map(
          (q: any) => ({
            id: q._id,
            question: q.text,
            image: q.image,
            options: q.options.map((opt: any) => ({
              text: opt.text,
              image: opt.image,
            })),
          }),
        );

        if (!fetchedQuestions.length) {
          router.push("/");
          return;
        }

        let finalQuestions: Question[] = [];
        const storageKey = `selectedQuestions_${assignmentRes.data._id}`;

        if (fetchedQuestions.length <= 100) {
          finalQuestions = fetchedQuestions;
        } else {
          const stored = sessionStorage.getItem(storageKey);

          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.length === 100) {
              finalQuestions = parsed;
            } else {
              const shuffled = shuffleArray(fetchedQuestions);
              finalQuestions = shuffled.slice(0, 100);
              sessionStorage.setItem(
                storageKey,
                JSON.stringify(finalQuestions),
              );
            }
          } else {
            const shuffled = shuffleArray(fetchedQuestions);
            finalQuestions = shuffled.slice(0, 100);
            sessionStorage.setItem(storageKey, JSON.stringify(finalQuestions));
          }
        }

        setQuestions(finalQuestions);
        setCurrentQuestion(1);
      } catch (error) {
        console.log("Error fetching questions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentAndQuestions();
    requestCameraAccess();
  }, [router]);

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
        Math.floor((endTime - currentTime) / 1000),
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
    if (submitting) return;

    setSubmitting(true);

    sessionStorage.removeItem("examEndTime");

    if (assData?._id) {
      sessionStorage.removeItem(`selectedQuestions_${assData._id}`);
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    localStorage.removeItem("check");

    router.replace("/submitted");
  };

  const current = questions[currentQuestion - 1];

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  if (cameraAllowed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-center p-6">
        <div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Camera Access Required
          </h1>
          <p className="text-gray-700">
            Please allow camera access to proceed with the exam.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 flex flex-col">
      <header className="bg-white/70 backdrop-blur-md shadow-sm py-3 px-4 sm:px-6">
        <div className="mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-3">
            {assData?.logo ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-md overflow-hidden flex items-center justify-center border">
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

            <div className="leading-tight">
              <h1 className="text-base sm:text-xl font-bold text-blue-700">
                {assData?.companyName || "Online Examination Portal"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Computer Based Test (CBT) System
              </p>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Camera */}
            <div className="w-[50px] sm:w-[80px] aspect-[4/3] bg-black rounded-md overflow-hidden border border-white flex-shrink-0">
              <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                autoPlay
                muted
                playsInline
              />
            </div>

            {/* Candidate + Timer */}
            <div className="text-right">
              <div className="text-xs sm:text-sm">
                Candidate:
                <span className="font-semibold ml-1">
                  {user?.name || "[Your Name]"}
                </span>
              </div>

              <div className="text-sm sm:text-base font-bold text-red-600">
                {formatTime()}
              </div>
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
                    i + 1,
                  )}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <button
              onClick={openSubmitModal}
              className="w-full cursor-pointer mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            >
              Submit
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-sm py-4 px-4 sm:px-6 md:px-8 text-center text-xs text-gray-500">
        <div className="container mx-auto">© 2026 {assData?.companyName}</div>
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
                className="bg-gray-300 cursor-pointer hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
