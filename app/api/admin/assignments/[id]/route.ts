import { connectDB } from '@/lib/db';
import Assignment from '@/models/Assignment';
import { User } from '@/models/User';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { NextRequest } from 'next/server'; // Import NextRequest

interface Params {
    params: {
        id: string;
    };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }>}) { // Use NextRequest
    try {
        await connectDB();

        const { id } = (await params);

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
        }

        const assignment = await Assignment.findById(id)
            .populate('users', 'email name')
            .populate('questionIds');

        if (!assignment) {
            return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        }

        return NextResponse.json(assignment);
    } catch (err: any) {
        console.error('Error fetching assignment:', err);
        return NextResponse.json(
            { error: 'Failed to fetch assignment', details: err.message },
            { status: 500 }
        );
    }
}


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    try {
        const { id } = (await params);

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
        }

        const data = await req.json();
        console.log('Incoming update data:', data);

        await connectDB();

        // Validate and convert questions
        if (!Array.isArray(data.questions) || !data.questions.every((qId: any) => Types.ObjectId.isValid(qId))) {
            return NextResponse.json({ error: 'Invalid questions format.  Must be an array of valid ObjectIds.' }, { status: 400 });
        }

        // Validate and convert users (emails -> ObjectIds)
        if (!Array.isArray(data.users) || !data.users.every((email: any) => typeof email === 'string')) {
            return NextResponse.json({ error: 'Invalid users format. Must be an array of strings (emails).' }, { status: 400 });
        }

        const userDocs = await User.find({ email: { $in: data.users } });

        if (userDocs.length !== data.users.length) {
            return NextResponse.json({ error: 'One or more user emails not found' }, { status: 400 });
        }

        const updated = await Assignment.findByIdAndUpdate(
            id,
            {
                title: data.title,
                description: data.description,
                declarationContent: data.declarationContent,
                instructions: data.instructions,
                startTime: data.startTime,
                durationMinutes: data.durationMinutes,
                questionIds: data.questions,
                users: userDocs.map(u => u._id),
                logo: data.logo,
                companyName: data.companyName,
                marks: data.marks
            },
            { new: true }
        ).populate('users', 'email name').populate('questionIds');

        if (!updated) {
            return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (err: any) {
        console.error('Error updating assignment:', err);
        return NextResponse.json(
            { error: 'Failed to update assignment', details: err.message },
            { status: 500 }
        );
    }
}
