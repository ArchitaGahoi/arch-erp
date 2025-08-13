import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "bg-input text-foreground dark:bg-input dark:text-[--input-foreground]",
        "border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Default styles
          "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
          // Dark mode border and background
          "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-400",
          // Focus/hover styles
          "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          "hover:border-blue-400",
          // Dark mode focus/hover
          "dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:hover:border-blue-300",
        className
      )}
      {...props}
    />
  )
}

export { Input }
