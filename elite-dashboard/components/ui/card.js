import * as React from "react";

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
