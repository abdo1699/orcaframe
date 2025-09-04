"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const USERS = [
  { email: "admin@example.com", password: "admin123", role: "edit" },
  { email: "viewer@example.com", password: "view123", role: "view" },
];

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const user = USERS.find(
      (u) => u.email === form.email && u.password === form.password
    );
    if (user) {
      localStorage.setItem("userRole", user.role);
      if (user.role === "edit") {
        router.push("/add-data");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">
      <div className="glass-panel w-full max-w-md">
        <h1 className="title mb-6">Login</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </label>
          <button type="submit" className="btn-primary mt-2">
            Login
          </button>
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-900/40 text-rose-200 px-4 py-3 mt-2">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
