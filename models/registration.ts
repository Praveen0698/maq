import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordOrKey: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now }
});

registrationSchema.index({ assignmentId: 1, email: 1 }, { unique: true }); // prevent double reg

export default mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
