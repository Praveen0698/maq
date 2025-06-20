import { connectDB } from '@/lib/db';
import Registration from '@/models/registration';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    await connectDB();
    const assignmentId = req.nextUrl.searchParams.get('assignmentId');

    if (!assignmentId) {
        return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const regs = await Registration.find({ assignmentId }).sort({ registeredAt: -1 });
    return NextResponse.json(regs);
}
