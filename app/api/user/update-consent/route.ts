import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const { email, assignmentId } = await req.json();

        if (!email || !assignmentId) {
            return NextResponse.json(
                { message: "Missing email or assignmentId" },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isAlreadyConsented = user.assignmentConsents.includes(assignmentId);

        if (!isAlreadyConsented) {
            user.assignmentConsents.push(new mongoose.Types.ObjectId(assignmentId));
            await user.save();
        }

        return NextResponse.json(
            { message: "Consent recorded successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.log("Consent update error:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
