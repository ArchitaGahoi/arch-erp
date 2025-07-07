import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="flex items-center space-x-2">
      <Switch checked={isDark} onCheckedChange={setIsDark} />
      <span>{isDark ? "Dark" : "Light"} Mode</span>
    </div>
  );
};

export default ThemeToggle;