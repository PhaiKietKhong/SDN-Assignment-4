import { useEffect, useState } from "react";
import apiClient from "../apiClient";

const EMPTY_FORM = {
  text: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
  keyword: [],
};

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
function ManageQuestionsPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null); // full quiz with populated questions
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // form state (shared for add & edit)
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null = adding new
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ── fetch quiz list ── */
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const { data } = await apiClient.get("/quizzes");
      setQuizzes(data);
    } catch {
      setError("Failed to load quizzes.");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  /* ── open a quiz ── */
  const handleSelectQuiz = async (quizId) => {
    setLoadingQuiz(true);
    setError("");
    setForm(EMPTY_FORM);
    setEditingId(null);
    try {
      const { data } = await apiClient.get(`/quizzes/${quizId}`);
      setSelectedQuiz(data);
    } catch {
      setError("Failed to load quiz.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  /* ── refresh the open quiz ── */
  const refreshQuiz = async () => {
    if (!selectedQuiz) return;
    const { data } = await apiClient.get(`/quizzes/${selectedQuiz._id}`);
    setSelectedQuiz(data);
  };

  /* ── option input change ── */
  const handleOptionChange = (idx, value) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[idx] = value;
      return { ...prev, options };
    });
  };

  /* ── submit add / edit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // validation
    if (!form.text.trim()) {
      setError("Question text is required.");
      return;
    }
    const filledOptions = form.options.filter((o) => o.trim() !== "");
    if (filledOptions.length < 2) {
      setError("Please provide at least 2 options.");
      return;
    }
    if (
      form.correctAnswerIndex < 0 ||
      form.correctAnswerIndex >= form.options.length
    ) {
      setError("Correct answer index is out of range.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // ── EDIT ──
        await apiClient.put(
          `/questions/${editingId}`,
          {
            text: form.text.trim(),
            options: form.options.filter((o) => o.trim() !== ""),
            correctAnswerIndex: Number(form.correctAnswerIndex),
            keyword: form.keyword,
          },
          { headers: authHeader() },
        );
      } else {
        // ── ADD ──
        const { data: newQuestion } = await apiClient.post(
          "/questions",
          {
            text: form.text.trim(),
            options: form.options.filter((o) => o.trim() !== ""),
            correctAnswerIndex: Number(form.correctAnswerIndex),
            keyword: form.keyword.length ? form.keyword : ["general"],
          },
          { headers: authHeader() },
        );

        // attach question to quiz
        const updatedQuestionIds = [
          ...(selectedQuiz.question || []).map((q) =>
            typeof q === "object" ? q._id : q,
          ),
          newQuestion._id,
        ];
        await apiClient.put(
          `/quizzes/${selectedQuiz._id}`,
          { question: updatedQuestionIds },
          { headers: authHeader() },
        );
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      await refreshQuiz();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to save question.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── populate form for editing ── */
  const handleEdit = (question) => {
    setEditingId(question._id);
    setForm({
      text: question.text,
      options:
        question.options.length >= 4
          ? question.options
          : [
              ...question.options,
              ...Array(4 - question.options.length).fill(""),
            ],
      correctAnswerIndex: question.correctAnswerIndex,
      keyword: question.keyword || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── delete question ── */
  const handleDelete = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    setError("");
    try {
      await apiClient.delete(`/questions/${questionId}`, {
        headers: authHeader(),
      });

      // remove from quiz
      const updatedQuestionIds = (selectedQuiz.question || [])
        .map((q) => (typeof q === "object" ? q._id : q))
        .filter((id) => id !== questionId);
      await apiClient.put(
        `/quizzes/${selectedQuiz._id}`,
        { question: updatedQuestionIds },
        { headers: authHeader() },
      );

      await refreshQuiz();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete question.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  /* ─────────────────────────────
     RENDER: Quiz list
  ───────────────────────────── */
  if (!selectedQuiz) {
    return (
      <div className="container mt-4">
        <h2 className="fw-bold mb-4">Manage Questions</h2>
        <p className="text-muted">Select a quiz to manage its questions.</p>

        {loadingQuizzes ? (
          <div className="text-center mt-4">
            <div className="spinner-border" role="status" />
          </div>
        ) : quizzes.length === 0 ? (
          <p className="text-muted">No quizzes found.</p>
        ) : (
          <div className="list-group">
            {quizzes.map((quiz) => (
              <button
                key={quiz._id}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                onClick={() => handleSelectQuiz(quiz._id)}
              >
                <div>
                  <div className="fw-semibold">{quiz.title}</div>
                  {quiz.description && (
                    <small className="text-muted">{quiz.description}</small>
                  )}
                </div>
                <span className="badge bg-primary rounded-pill">
                  {quiz.question?.length || 0} questions
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────
     RENDER: Question management for selected quiz
  ───────────────────────────── */
  const questions = selectedQuiz.question || [];

  return (
    <div className="container mt-4">
      {/* header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => {
            setSelectedQuiz(null);
            setForm(EMPTY_FORM);
            setEditingId(null);
            setError("");
            fetchQuizzes();
          }}
        >
          ← Back to Quizzes
        </button>
        <h2 className="fw-bold mb-0">
          Questions — <span className="text-primary">{selectedQuiz.title}</span>
        </h2>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* ── Form ── */}
      <div className="card mb-4">
        <div className="card-header fw-semibold">
          {editingId ? "Edit Question" : "Add New Question"}
        </div>
        <div className="card-body">
          {loadingQuiz ? (
            <div className="text-center">
              <div className="spinner-border" role="status" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">
                  Question Text:
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    value={form.text}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, text: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">Options:</label>
                <div className="col-sm-9">
                  {form.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      className="form-control mb-2"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">
                  Correct Answer Index:
                </label>
                <div className="col-sm-9">
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    max={form.options.length - 1}
                    value={form.correctAnswerIndex}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        correctAnswerIndex: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label">
                  Keywords:
                  <small className="d-block text-muted fw-normal">
                    comma-separated
                  </small>
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. geography, capitals"
                    value={form.keyword.join(", ")}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        keyword: e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save Changes"
                      : "Add Question"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── Question list ── */}
      {questions.length === 0 ? (
        <p className="text-muted">No questions yet. Add one above.</p>
      ) : (
        questions.map((q) => (
          <div key={q._id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{q.text}</h5>
              <ul className="mb-2">
                {q.options.map((opt, idx) => (
                  <li
                    key={idx}
                    className={
                      idx === q.correctAnswerIndex
                        ? "fw-semibold text-success"
                        : ""
                    }
                  >
                    {opt}{" "}
                    {idx === q.correctAnswerIndex && (
                      <span className="badge bg-success ms-1">Correct</span>
                    )}
                  </li>
                ))}
              </ul>
              {q.keyword?.length > 0 && (
                <div className="mb-2">
                  {q.keyword.map((k) => (
                    <span key={k} className="badge bg-secondary me-1">
                      {k}
                    </span>
                  ))}
                </div>
              )}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleEdit(q)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(q._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ManageQuestionsPage;
