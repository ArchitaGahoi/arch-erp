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
          "w-full h-10 px-3 py-2 border rounded-md flex items-center justify-between text-sm",
          !selectedOption && "text-muted-foreground"
        )}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
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
