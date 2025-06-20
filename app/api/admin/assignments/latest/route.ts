import { connectDB } from '@/lib/db';
import Assignment from '@/models/Assignment';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();

        const latestAssignment = await Assignment.findOne().sort({ startTime: -1 });

        if (!latestAssignment) {
            return NextResponse.json({ error: 'No assignments found' }, { status: 404 });
        }

        return NextResponse.json({
            title: latestAssignment.title,
            companyName: latestAssignment.companyName || "Conductor Institute",
            logo: latestAssignment.logo || "",
            startTime: latestAssignment.startTime,
            durationMinutes: latestAssignment.durationMinutes,
            marks: latestAssignment.marks,
            questionIds: latestAssignment.questionIds,
            declarationContent: latestAssignment.declarationContent || "",
            instructions: latestAssignment.instructions || "",
            // Add any other fields you want to expose
        });
    } catch (err: any) {
        console.log('Error fetching latest assignment:', err);
        return NextResponse.json(
            { error: 'Failed to fetch latest assignment', details: err.message },
            { status: 500 }
        );
    }
}
