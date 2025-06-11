// src/components/DarkModeToggle.jsx
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    console.log(`Loaded theme from localStorage: ${savedTheme || "none"}`);
    return savedTheme ? savedTheme === "dark" : false;
  });

  useEffect(() => {
    const root = document.documentElement;
    console.log(`Applying theme: ${dark ? "dark" : "light"}`);
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    console.log(`Current <html> classes: ${root.className}`);
  }, [dark]);

  return (
    <button
      className="p-3 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-pink-500 dark:hover:bg-pink-600 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-pink-500"
      onClick={() => {
        console.log("Toggling theme");
        setDark((prev) => !prev);
      }}
      title={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      type="button"
    >
      <span className="text-lg">{dark ? "☀️" : "🌙"}</span>
    </button>
  );
}