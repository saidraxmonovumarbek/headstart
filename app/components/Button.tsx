"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  variant = "primary",
  className,
  ...props
}: Props) {
  const base =
    "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm";

  const styles = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger:
      "bg-red-500 text-white hover:bg-red-600 shadow-red-200",
  };

  return (
    <button
      className={clsx(base, styles[variant], className)}
      {...props}
    />
  );
}