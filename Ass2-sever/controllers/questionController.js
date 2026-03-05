import Question from "../models/Question.js";

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getQuestionById = async (req, res) => {
  const question = await Question.findById(req.params.questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  res.json(question);
};

export const updateQuestionById = async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.questionId,
    req.body,
    {
      new: true,
    },
  );
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  res.json(question);
};

export const deleteQuestionById = async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  res.json({ message: "Question deleted successfully" });
};

export const deleteAllQuestions = async (req, res) => {
  await Question.deleteMany();
  res.json({ message: "All questions deleted successfully" });
};

export const createQuestion = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      if (req.body.length === 0) {
        return res
          .status(400)
          .json({ error: "Request body array cannot be empty" });
      }

      const payload = req.body.map((question) => ({
        ...question,
        author: req.user._id,
      }));

      const questions = await Question.insertMany(payload);
      return res.status(201).json(questions);
    }

    const payload = {
      ...req.body,
      author: req.user._id,
    };

    const question = await Question.create(payload);
    return res.status(201).json(question);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
