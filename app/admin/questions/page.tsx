"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Option = { text: string; isCorrect: boolean; image?: string };
type Question = {
  _id: string;
  text: string;
  image?: string;
  options: Option[];
};

export default function AdminQuestions() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { text: "", isCorrect: false, image: "" }, // Initialize with image property
    { text: "", isCorrect: false, image: "" },
    { text: "", isCorrect: false, image: "" },
    { text: "", isCorrect: false, image: "" },
  ]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [questionImageBase64, setQuestionImageBase64] = useState<string | null>(
    null
  );

  const fetchQuestions = async () => {
    const res = await axios.get("/api/admin/questions");
    setQuestions(res.data);
  };

  console.log(questions)

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async () => {
    if (!question.trim()) return alert("Question text cannot be empty");
    if (options.some((opt) => !opt.text.trim()))
      return alert("All options must be filled out");
    if (!options.some((opt) => opt.isCorrect))
      return alert("Please select a correct option");

    const optionsWithImages = options.map((opt) => ({
      text: opt.text,
      isCorrect: opt.isCorrect,
      image: opt.image || undefined, // Send undefined if no image
    }));

    await axios.post("/api/admin/questions", {
      text: question,
      image: questionImageBase64,
      options: optionsWithImages,
    });
    setQuestion("");
    setQuestionImageBase64(null);
    setOptions(options.map(() => ({ text: "", isCorrect: false, image: "" })));
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    await axios.delete("/api/admin/questions", { data: { id } });
    fetchQuestions();
  };

  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-40 py-4 h-screen overflow-auto">
      <h2 className="text-2xl font-bold mb-4">Manage MCQs</h2>

      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Enter question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <label className="block mb-2 font-medium">
          Question Image (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = () => {
              setQuestionImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
          }}
        />
        {questionImageBase64 && (
          <img
            src={questionImageBase64}
            alt="question"
            className="w-32 h-32 object-cover mt-2"
          />
        )}

        {options.map((opt, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt.text}
              onChange={(e) => {
                const updated = [...options];
                updated[i].text = e.target.value;
                setOptions(updated);
              }}
              className="p-2 border rounded w-full sm:w-1/2"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () => {
                  const copy = [...options];
                  copy[i].image = reader.result as string;
                  setOptions(copy);
                };
                reader.readAsDataURL(file);
              }}
            />

            {opt.image && (
              <img
                src={opt.image}
                alt={`option-${i}`}
                className="w-20 h-20 object-cover"
              />
            )}

            <label className="flex items-center space-x-1">
              <input
                type="radio"
                name="correct"
                checked={opt.isCorrect}
                onChange={() => {
                  const updated = options.map((o, idx) => ({
                    ...o,
                    isCorrect: idx === i,
                  }));
                  setOptions(updated);
                }}
              />
              <span>Correct</span>
            </label>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
        >
          Add Question
        </button>
      </div>

      <hr className="my-6" />

      <h3 className="text-xl font-semibold mb-4">All Questions</h3>

      <input
        type="text"
        placeholder="Search questions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <ul className="space-y-4">
        {filteredQuestions.map((q) => (
          <li key={q._id} className="p-4 rounded shadow shadow-amber-50">
            <div className="flex justify-between items-center">
              <strong>{q.text}</strong>
              {q.image && (
                <img
                  src={q.image}
                  alt="question"
                  className="w-32 h-32 object-cover my-2"
                />
              )}

              <button
                onClick={() => handleDelete(q._id)}
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
            <ul className="mt-2 list-disc pl-5">
              {q.options.map((opt, i) => (
                <li
                  key={i}
                  className={
                    opt.isCorrect ? "text-green-600 font-semibold" : ""
                  }
                >
                  {opt.text}
                  {opt.image && (
                    <div>
                      <img
                        src={opt.image}
                        alt="option"
                        className="w-20 h-20 object-cover mt-1"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
