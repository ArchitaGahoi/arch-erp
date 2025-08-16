import { useTheme } from "./theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="p-2 rounded border bg-gray-300 dark:bg-gray-700"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}