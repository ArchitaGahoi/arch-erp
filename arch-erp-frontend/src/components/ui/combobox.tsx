// src/components/ui/combobox.tsx
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ComboBoxProps = {
  options: { label: string; value: string | number }[];
  selectedValue: string | number | null;
  onChange: (value: string | number) => void;
  placeholder?: string;
};

export const ComboBox: React.FC<ComboBoxProps> = ({
  options,
  selectedValue,
  onChange,
  placeholder = "Select option...",
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-full min-w-0 items-center justify-between rounded-md border px-3 py-2 text-sm shadow-xs outline-none",
          "bg-white text-gray-900 border-gray-300",
          "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-400",
          "hover:border-blue-400 dark:hover:border-blue-300",
          "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400",
          !selectedOption && "text-muted-foreground",
        )}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className={cn(
          "w-[200px] p-0 mt-1 rounded-md border shadow-lg",
          "bg-white border-gray-300",
          "dark:bg-gray-800 dark:border-gray-400"
        )}>
        <Command>
          <CommandInput placeholder="Search..." 
              className={cn(
            "w-full px-3 py-2 text-sm border-b",
            "bg-white text-gray-900",
            "dark:bg-gray-800 dark:text-gray-100"
          )}
          />
          <CommandEmpty className="p-2 text-sm text-gray-500 dark:text-gray-400">No option found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="cursor-pointer px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {option.label}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedValue === option.value ? "opacity-100" : "opacity-0"
                    
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
