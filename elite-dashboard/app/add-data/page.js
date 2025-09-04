"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddData() {
  const [form, setForm] = useState({
    propertyType: "",
    size: "",
    price: "",
    city: "",
    latitude: "",
    floors: "",
    status: "",
    parking_spaces: "",
  });
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const router = useRouter();

  useEffect(() => {
    // Only allow admins
    const role = localStorage.getItem("userRole");
    if (role !== "edit") {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.ok) {
      setForm({ propertyType: "", size: "", price: "", city: "" });
      setStatus(
        <div className="mt-2 rounded-xl border border-emerald-500/40 bg-emerald-900/40 text-emerald-200 px-4 py-3 flex items-center gap-2">
          <span>Data saved successfully.</span>
        </div>
      );
    } else {
      setStatus(
        <div className="mt-2 rounded-xl border border-rose-500/40 bg-rose-900/40 text-rose-200 px-4 py-3">
          {json.message || "Could not save entry."}
        </div>
      );
      setToast({ show: true, message: "Could not save entry.", type: "error" });
    }
    setTimeout(() => setToast({ ...toast, show: false }), 2500);
  }

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="title flex items-center gap-3">New Property</h1>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="btn-secondary inline-flex items-center gap-2"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="btn-ghost inline-flex items-center gap-2"
            >
              Login
            </Link>
          </div>
        </div>
        <form
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5"
          onSubmit={handleSubmit}
        >
          <label className="field">
            <span>Property Type</span>
            <input
              type="text"
              required
              value={form.propertyType}
              onChange={(e) =>
                setForm({ ...form, propertyType: e.target.value })
              }
              placeholder="e.g., Apartment, Villa"
            />
          </label>
          <label className="field">
            <span>Size (sqm)</span>
            <input
              type="number"
              min="1"
              required
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              placeholder="e.g., 120"
            />
          </label>
          <label className="field">
            <span>Price (EGP)</span>
            <input
              type="number"
              min="1"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="e.g., 1500000"
            />
          </label>
          <label className="field">
            <span>City</span>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g., Cairo"
            />
          </label>
          <label className="field">
            <span>Latitude</span>
            <input
              type="number"
              step="0.0001"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="e.g., 30.0561"
            />
          </label>
          <label className="field">
            <span>Floors</span>
            <input
              type="number"
              min="1"
              value={form.floors}
              onChange={(e) => setForm({ ...form, floors: e.target.value })}
              placeholder="e.g., 15"
            />
          </label>
          <label className="field">
            <span>Status</span>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="in progress"
                  checked={form.status === "in progress"}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                />
                In Progress
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="finished construction"
                  checked={form.status === "finished construction"}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                />
                Finished Construction
              </label>
            </div>
          </label>
          <label className="field">
            <span>Parking Spaces</span>
            <input
              type="number"
              min="0"
              value={form.parking_spaces}
              onChange={(e) =>
                setForm({ ...form, parking_spaces: e.target.value })
              }
              placeholder="e.g., 220"
            />
          </label>
          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="reset"
              className="btn-ghost"
              onClick={() =>
                setForm({ propertyType: "", size: "", price: "", city: "" })
              }
            >
              Reset
            </button>
            <button type="submit" className="btn-primary">
              Save Record
            </button>
          </div>
        </form>
        <div className="mt-6">{status}</div>
        {/* Toast */}
        {toast.show && (
          <div
            className={`toast ${
              toast.type === "error" ? "error" : ""
            } show fixed bottom-6 right-6 z-50`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
