import { useEffect, useState } from "react";
import studentService from "./services/studentService";
import "./App.css";

const emptyStudent = {
  name: "",
  email: "",
  age: "",
};

function getErrorMessage(error) {
  const data = error.response?.data;

  if (data?.details) {
    return Object.values(data.details).join(". ");
  }

  return (
    data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyStudent);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const student = {
        name: form.name.trim(),
        email: form.email.trim(),
        age: Number(form.age),
      };

      if (editingId !== null) {
        await studentService.update(editingId, student);
        setSuccess("Student updated successfully.");
      } else {
        await studentService.create(student);
        setSuccess("Student created successfully.");
      }

      setForm(emptyStudent);
      setEditingId(null);
      await loadStudents();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(student) {
    setForm({
      name: student.name,
      email: student.email,
      age: String(student.age),
    });

    setEditingId(student.id);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await studentService.delete(id);
      setSuccess("Student deleted successfully.");

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyStudent);
      }

      await loadStudents();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleCancel() {
    setEditingId(null);
    setForm(emptyStudent);
    setError("");
    setSuccess("");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h1>StudentHub</h1>
            <p>Student Management System</p>
          </div>
        </div>

        <span className="api-status">
          <span className="status-dot" />
          REST API
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">ADMINISTRATION</p>
        <h2>Manage your students</h2>
        <p className="hero-description">
          Create, update and manage student records in one place.
        </p>
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          <strong>Error:</strong> {error}
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
          <button
            onClick={() => setSuccess("")}
            aria-label="Dismiss success"
          >
            ×
          </button>
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Total Students</span>
          <strong>{students.length}</strong>
          <span className="stat-note">Registered records</span>
        </article>

        <article className="stat-card">
          <span className="stat-label">API Status</span>
          <strong className="stat-api">
            {loading ? "Checking" : error ? "Check API" : "Connected"}
          </strong>
          <span className="stat-note">Spring Boot backend</span>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                {editingId !== null ? "UPDATE RECORD" : "NEW RECORD"}
              </p>
              <h3>
                {editingId !== null ? "Edit Student" : "Add Student"}
              </h3>
            </div>
            <span className="panel-icon">＋</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />

            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
              required
            />

            <label htmlFor="age">Age</label>
            <input
              id="age"
              name="age"
              type="number"
              min="1"
              step="1"
              value={form.age}
              onChange={handleChange}
              placeholder="Enter age"
              required
            />

            <button className="primary-button" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Student"
                  : "Add Student"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancel}
              >
                Cancel Editing
              </button>
            )}
          </form>
        </article>

        <article className="panel table-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">DIRECTORY</p>
              <h3>Student Records</h3>
            </div>

            <button
              className="refresh-button"
              onClick={loadStudents}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <p className="empty-state">Loading student records...</p>
          ) : students.length === 0 ? (
            <p className="empty-state">
              No students found. Add your first student.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>#{student.id}</td>

                      <td>
                        <div className="student-name">
                          {student.name}
                        </div>
                        <div className="student-email">
                          {student.email}
                        </div>
                      </td>

                      <td>{student.age}</td>

                      <td>
                        <div className="actions">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(student)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(student.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <footer>
        React + Vite · Spring Boot · MySQL
      </footer>
    </main>
  );
}

export default App;