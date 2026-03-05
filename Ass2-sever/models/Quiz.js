import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  question: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
});

export default mongoose.model("Quiz", questionSchema);
