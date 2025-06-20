import mongoose, { Schema, Document } from 'mongoose';

export interface IUserResult {
    userId: mongoose.Types.ObjectId;
    attemptedQuestions: number;
    correctQuestions: number;
    score: number;
}

export interface IAssignmentResult extends Document {
    assignmentId: mongoose.Types.ObjectId;
    results: IUserResult[];
}

const UserResultSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        attemptedQuestions: {
            type: Number,
            required: true,
        },
        correctQuestions: {
            type: Number,
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const AssignmentResultSchema: Schema = new Schema(
    {
        assignmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true,
            unique: true,
        },
        results: [UserResultSchema],
    },
    { timestamps: true }
);

export default mongoose.model<IAssignmentResult>('AssignmentResult', AssignmentResultSchema);
