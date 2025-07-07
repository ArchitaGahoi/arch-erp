// components/ComboBox.tsx
import React, { useState, useEffect } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';

interface ComboBoxProps {
  options: { label: string; value: number | string }[];
  defaultValue?: number | string;
  onChange: (value: number | string) => void;
}

const ComboBox: React.FC<ComboBoxProps> = ({ options, defaultValue, onChange }) => {
  const [selectedItem, setSelectedItem] = useState(
    options.find((option) => option.value === defaultValue) || null
  );
  const [query, setQuery] = useState('');

  const filteredItems =
    query === ''
      ? options
      : options.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase())
        );

  useEffect(() => {
    if (selectedItem) {
      onChange(selectedItem.value);
    }
  }, [selectedItem, onChange]);

  return (
    <Combobox value={selectedItem} onChange={setSelectedItem}>
      <div className="relative w-full">
        <ComboboxInput
          className="border rounded px-2 py-1 w-full"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(item: any) => item?.label || ''}
        />
        <ComboboxOptions className="absolute z-10 bg-white border w-full mt-1 max-h-40 overflow-auto">
          {filteredItems.length === 0 && query !== '' ? (
            <div className="p-2 text-gray-500">No results found.</div>
          ) : (
            filteredItems.map((item) => (
              <ComboboxOption
                key={item.value}
                value={item}
                className={({ active }) =>
                  `p-2 cursor-pointer ${active ? 'bg-blue-100' : ''}`
                }
              >
                {item.label}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
};

export default ComboBox;
