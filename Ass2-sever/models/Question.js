import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  options: [{ type: String, required: true }],
  keyword: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
});

export default mongoose.model("Question", questionSchema);
