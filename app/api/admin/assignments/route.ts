import { connectDB } from "@/lib/db";
import Assignment from "@/models/Assignment";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Incoming assignment data:", data);

    await connectDB();

    // Convert `questions` to `questionIds`
    if (
      !Array.isArray(data.questions) ||
      !data.questions.every((id: any) => typeof id === "string")
    ) {
      return NextResponse.json(
        { error: "Invalid questions format" },
        { status: 400 }
      );
    }

    // Convert user emails to User ObjectIds
    if (
      !Array.isArray(data.users) ||
      !data.users.every((email: any) => typeof email === "string")
    ) {
      return NextResponse.json(
        { error: "Invalid users format" },
        { status: 400 }
      );
    }

    const userDocs = await User.find({ email: { $in: data.users } });

    if (userDocs.length !== data.users.length) {
      return NextResponse.json(
        { error: "One or more user emails not found" },
        { status: 400 }
      );
    }

    const assignment = await Assignment.create({
      title: data.title,
      description: data.description,
      declarationContent: data.declarationContent,
      instructions: data.instructions,
      startTime: data.startTime,
      durationMinutes: data.durationMinutes,
      questionIds: data.questions,
      users: userDocs.map((u) => u._id),
      logo: data.logo,
      marks: data.marks,
      companyName: data.companyName, // ✅ Add this line
    });

    return NextResponse.json(assignment);
  } catch (err: any) {
    console.log("Error creating assignment:", err);
    return NextResponse.json(
      { error: "Failed to create assignment", details: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectDB();
  const assignments = await Assignment.find().populate("questionIds");
  console.log("assignments", assignments);

  return NextResponse.json(assignments);
}
