import { connectDB } from '@/lib/db';
import Registration from '@/models/registration';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    await connectDB();
    const { assignmentId, name, email, passwordOrKey } = await req.json();

    if (!assignmentId || !name || !email || !passwordOrKey) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    try {
        const reg = await Registration.create({
            assignmentId,
            name,
            email,
            passwordOrKey,
        });
        return NextResponse.json(reg);
    } catch (err: any) {
        if (err.code === 11000) {
            return NextResponse.json({ error: 'Already registered for this assignment' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
