"use client";
import { useEffect, useState } from "react";
import { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "../../components/ui/table";
import { Bar, Doughnut, Line, Scatter } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useRef } from "react";
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    show: false,
  });
  const toastTimeout = useRef(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((json) => {
        setData(json.data || []);
        setFiltered(json.data || []);
        setToast({
          message: "Dashboard loaded ✅",
          type: "success",
          show: true,
        });
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(
          () => setToast((t) => ({ ...t, show: false })),
          2000
        );
      });
  }, []);

  const total = data.length;
  const totalSize = data.reduce((a, b) => a + (b.size || 0), 0);
  const totalPrice = data.reduce((a, b) => a + (b.price || 0), 0);

  // Chart data for filtered
  const colors = [
    "#facc15",
    "#22c55e",
    "#60a5fa",
    "#f97316",
    "#a78bfa",
    "#f43f5e",
    "#14b8a6",
    "#eab308",
  ];
  const labels = filtered.map((d) => `${d.propertyType} • ${d.city}`);
  const prices = filtered.map((d) => d.price);
  const sizes = filtered.map((d) => d.size);
  const byCity = filtered.reduce((acc, item) => {
    const k = item.city || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const byType = filtered.reduce((acc, item) => {
    const k = item.propertyType || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const sorted = [...filtered].sort((a, b) => a.ts - b.ts);
  const handleFilter = useCallback(
    (fn) => {
      setFiltered(data.filter(fn));
    },
    [data]
  );

  const [viewerError, setViewerError] = useState("");
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

  function handleAddData(e) {
    if (userRole === "view") {
      e.preventDefault();
      setViewerError(
        "You are not allowed to add data. Only admins can add data."
      );
      setTimeout(() => setViewerError(""), 3000);
    } else if (userRole === "edit") {
      e.preventDefault();
      window.location.href = "/add-data";
    }
  }

  return (
    <div className="min-h-screen p-8 w-full font-sans bg-[#fcecec] text-gray-900 text-[0.95rem]">
      {/* Toast */}
      {toast.show && (
        <div
          className={`toast ${
            toast.type === "error" ? "error" : ""
          } show fixed top-6 right-6 z-50 bg-black/80 text-yellow-300 px-4 py-2 rounded-xl shadow-xl`}
        >
          {toast.message}
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Image
            src="/orcaframe-logo.png"
            alt="Orcaframe Logo"
            width={160}
            height={32}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button onClick={handleAddData} className="cursor-pointer">
            Add Data
          </Button>
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <Button
          className={`transition cursor-pointer ${
            activeFilter === "size" ? "bg-yellow-200 font-bold" : ""
          }`}
          onClick={() => {
            handleFilter((d) => d.size > 100);
            setActiveFilter("size");
          }}
        >
          Over 100 sqm
        </Button>
        <Button
          className={`transition cursor-pointer ${
            activeFilter === "inprogress" ? "bg-green-200 font-bold" : ""
          }`}
          onClick={() => {
            handleFilter((d) =>
              Array.isArray(d.status)
                ? d.status.includes("in progress")
                : d.status === "in progress"
            );
            setActiveFilter("inprogress");
          }}
        >
          In Progress
        </Button>
        <Button
          className={`transition cursor-pointer ${
            activeFilter === "finished" ? "bg-blue-200 font-bold" : ""
          }`}
          onClick={() => {
            handleFilter((d) =>
              Array.isArray(d.status)
                ? d.status.includes("finished construction")
                : d.status === "finished construction"
            );
            setActiveFilter("finished");
          }}
        >
          Finished
        </Button>
        <Button
          className="transition cursor-pointer"
          onClick={() => {
            setFiltered(data);
            setActiveFilter(null);
          }}
        >
          Clear Filters
        </Button>
        const [activeFilter, setActiveFilter] = useState(null);
      </div>
      {viewerError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-900/40 text-rose-200 px-4 py-3 mb-4 max-w-md mx-auto text-center">
          {viewerError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-sm text-gray-500 mb-1">Total Properties</div>
          <div className="text-2xl font-bold">{filtered.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500 mb-1">Total Size (sqm)</div>
          <div className="text-2xl font-bold text-green-600">
            {filtered.reduce((a, b) => a + (b.size || 0), 0).toLocaleString()}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500 mb-1">Total Price (EGP)</div>
          <div className="text-2xl font-bold text-rose-600">
            {filtered.reduce((a, b) => a + (b.price || 0), 0).toLocaleString()}
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="font-semibold mb-2">Prices by Property</div>
          <div className="flex justify-center">
            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: "Price (EGP)",
                    data: prices,
                    backgroundColor: colors,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: "#222" } },
                  y: { ticks: { color: "#222" } },
                },
              }}
              width={90}
              height={60}
            />
          </div>
        </Card>
        <Card>
          <div className="font-semibold mb-2">Count by City</div>
          <div className="flex justify-center">
            <Doughnut
              data={{
                labels: Object.keys(byCity),
                datasets: [
                  { data: Object.values(byCity), backgroundColor: colors },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#222" },
                  },
                },
              }}
              width={70}
              height={70}
            />
          </div>
        </Card>
        <Card>
          <div className="font-semibold mb-2">Count by Type</div>
          <div className="flex justify-center">
            <Bar
              data={{
                labels: Object.keys(byType),
                datasets: [
                  {
                    label: "Count",
                    data: Object.values(byType),
                    backgroundColor: "#60a5fa",
                  },
                ],
              }}
              options={{
                indexAxis: "y",
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: "#222" } },
                  y: { ticks: { color: "#222" } },
                },
              }}
              width={90}
              height={60}
            />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="font-semibold mb-2">Price Trend</div>
          <div className="flex justify-center">
            <Line
              data={{
                labels: sorted.map((d) => new Date(d.ts).toLocaleString()),
                datasets: [
                  {
                    label: "Price Trend",
                    data: sorted.map((d) => d.price),
                    borderColor: "#facc15",
                    backgroundColor: "rgba(250,204,21,.25)",
                    tension: 0.35,
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: "#222" } },
                  y: { ticks: { color: "#222" } },
                },
              }}
              width={120}
              height={60}
            />
          </div>
        </Card>
        <Card>
          <div className="font-semibold mb-2">Size vs Price</div>
          <div className="flex justify-center">
            <Scatter
              data={{
                datasets: [
                  {
                    label: "Size vs Price",
                    data: filtered.map((d) => ({ x: d.size, y: d.price })),
                    backgroundColor: "#22c55e",
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Size (sqm)",
                      color: "#222",
                    },
                    ticks: { color: "#222" },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Price (EGP)",
                      color: "#222",
                    },
                    ticks: { color: "#222" },
                  },
                },
              }}
              width={90}
              height={60}
            />
          </div>
        </Card>
      </div>
      <Card className="mb-8">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Size</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>City</TableHeaderCell>
              <TableHeaderCell>Latitude</TableHeaderCell>
              <TableHeaderCell>Floors</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Parking Spaces</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {filtered.map((d, i) => (
              <TableRow key={i}>
                <TableCell>{d.propertyType}</TableCell>
                <TableCell>{d.size}</TableCell>
                <TableCell>{d.price}</TableCell>
                <TableCell>{d.city}</TableCell>
                <TableCell>{d.latitude}</TableCell>
                <TableCell>{d.floors}</TableCell>
                <TableCell>{d.status}</TableCell>
                <TableCell>{d.parking_spaces}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
