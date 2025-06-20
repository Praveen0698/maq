"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

const ClientSelect = dynamic(() => import("@/components/ReactSelect"), {
  ssr: false,
});

interface UserOption {
  label: string;
  value: string;
}

interface QuestionOption {
  label: string;
  value: string;
}

export default function AssignmentsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [declaration, setDeclaration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [users, setUsers] = useState<string[]>([]); // Changed to string array
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuestionOption[]>([]);

  useEffect(() => {
    axios.get("/api/admin/users").then((res) => {
      const userOptions: UserOption[] = res.data.map(
        (user: { email: string }) => ({
          label: user.email,
          value: user.email,
        })
      );
      setAllUsers(userOptions);
    });

    axios.get("/api/admin/questions").then((res) => {
      const questionOptions: QuestionOption[] = res.data.map(
        (q: { _id: string; text: string }) => ({
          label: q.text,
          value: q._id,
        })
      );
      setAllQuestions(questionOptions);
    });
  }, []);

  const handleSubmit = async () => {
    try {
      let logoUrl = "";

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);

        const uploadRes = await axios.post("/api/uploadLogo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (uploadRes.status === 200 && uploadRes.data?.url) {
          logoUrl = uploadRes.data.url;
        } else {
          throw new Error("Logo upload failed");
        }
      }

      const payload = {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        durationMinutes: parseInt(duration, 10),
        declarationContent: declaration,
        instructions: instructions,
        companyName,
        logo: logoUrl,
        users, // Use the string array directly
        questions,
      };

      console.log("payload", payload);

      const res = await axios.post("/api/admin/assignments", payload);

      if (res.status === 200 || res.status === 201) {
        setTitle("");
        setDescription("");
        setStartTime("");
        setDuration("");
        setDeclaration("");
        setInstructions("");
        setCompanyName("");
        setUsers([]); // Reset to empty array
        setLogoFile(null);
        setQuestions([]); // Reset to empty array

        alert("Assignment created successfully!");
        redirect("/admin/assignments");
      } else {
        throw new Error("Assignment creation failed");
      }
    } catch (error: any) {
      alert(`Error creating assignment: ${error?.message || "Unknown error"}`);
      console.log("Error creating assignment!", error);
    }
  };

  return (
    <div className="w-full h-screen px-40 py-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-4">Create Assignment</h2>
      <div className="space-y-4 ">
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Description"
            value={description}
            rows={5}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="declaration">Declaration</label>
          <textarea
            id="declaration"
            placeholder="Declaration (Shown before starting the assignment)"
            value={declaration}
            rows={10}
            onChange={(e) => setDeclaration(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            placeholder="Instructions (Shown along with questions)"
            value={instructions}
            rows={10}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex gap-4 items-center">
          <label htmlFor="startTime">Start Time</label>
          <input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-fit p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="duration">Duration</label>
          <input
            type="number"
            placeholder="Duration (in minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="logo" className="block font-semibold mb-2">
            Upload Logo
          </label>
          <input
            id="logo"
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            className="w-fit p-2 border rounded mb-2"
          />
          {logoFile && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Selected File: {logoFile.name}
              </p>
              <img
                src={URL.createObjectURL(logoFile)}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover border rounded"
              />
              <button
                onClick={() => setLogoFile(null)}
                className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="users" className="block font-semibold mb-2">
            Add Users
          </label>
          <ClientSelect
            isMulti
            options={allUsers}
            value={allUsers.filter((user) => users.includes(user.value))} // Filter selected users
            onChange={(selectedOptions: any) =>
              setUsers(selectedOptions.map((option: any) => option.value))
            }
            className="w-full text-black"
            placeholder="Select Users"
          />
        </div>

        <div>
          <label htmlFor="questions" className="block font-semibold mb-2">
            Add Questions
          </label>
          <ClientSelect
            isMulti
            options={allQuestions}
            value={allQuestions.filter((question) =>
              questions.includes(question.value)
            )}
            onChange={(selectedOptions: any) =>
              setQuestions(selectedOptions?.map((option: any) => option.value))
            }
            className="w-full text-black"
            placeholder="Select Questions"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create Assignment
      </button>
    </div>
  );
}
