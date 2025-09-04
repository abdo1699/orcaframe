import * as React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg bg-black text-white px-4 py-2 font-semibold shadow hover:bg-gray-900 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
