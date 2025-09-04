import * as React from "react";

export function Table({ children, className = "", ...props }) {
  return (
    <div className={`overflow-x-auto w-full ${className}`} {...props}>
      <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead className="bg-gray-50">{children}</thead>;
}

export function TableRow({ children }) {
  return <tr className="border-b last:border-none">{children}</tr>;
}

export function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>;
}

export function TableHeaderCell({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left font-semibold text-gray-900 ${className}`}
    >
      {children}
    </th>
  );
}
