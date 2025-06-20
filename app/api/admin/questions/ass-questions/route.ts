import { connectDB } from '@/lib/db';
import Question from '@/models/Question';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { ids } = await req.json();
    await connectDB();

    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: 'Invalid or empty IDs array' }, { status: 400 });
    }

    const questions = await Question.find({ _id: { $in: ids } });
    console.log(questions)

    if (!questions || questions.length === 0) {
        return NextResponse.json({ error: 'No questions found for the provided IDs' }, { status: 404 });
    }

    return NextResponse.json(questions);
}