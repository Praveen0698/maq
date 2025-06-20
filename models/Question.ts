import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
    text: String,
    isCorrect: Boolean,
    image: String
});

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    image: { type: String},
    options: [optionSchema],
  //  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }, // for future linking
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Question || mongoose.model('Question', questionSchema);
