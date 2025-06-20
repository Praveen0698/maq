import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import Assignment from '@/models/Assignment';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { username, password, accessKey } = await req.json();

        await connectDB();

        const user = await User.findOne({ email: username });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Credential check
        if (accessKey) {
            if (accessKey !== user.accessKey) {
                return NextResponse.json({ message: 'Invalid access key' }, { status: 401 });
            }
        } else {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
            }
        }

        // If user is a regular user, check assignment
        if (user.role === 'user') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const assignment = await Assignment.findOne({
                startTime: { $gte: startOfDay, $lte: endOfDay },
                users: user._id
            }).sort({ startTime: 1 });

            if (!assignment) {
                return NextResponse.json({
                    message: 'No assignment scheduled today or you are not assigned.',
                }, { status: 404 });
            }

            const now = new Date();

            if (now < assignment.startTime) {
                return NextResponse.json({
                    message: 'Exam time has not started yet',
                    assignmentStartTime: assignment.startTime,
                }, { status: 403 });
            }
        }

        const res = NextResponse.json({
            message: 'Login successful',
            role: user.role,
            id: user._id,
            name: user.name,
            email: user.email,
        });

        res.cookies.set('session_token', 'mock-token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return res;
    } catch (err: any) {
        console.log('Login error:', err);
        return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
    }
}
