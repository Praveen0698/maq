import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    declarationContent: String,
    instructions: String,
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    logo: { type: String, required: false },
    companyName: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
    marks: { type: Number, default: 1 },
});

export default mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
