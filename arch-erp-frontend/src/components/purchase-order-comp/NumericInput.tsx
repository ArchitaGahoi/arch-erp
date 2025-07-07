import React, { useState, useEffect} from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

interface NumericInputProps {
  value: string | number;
  onChange?: (value: string) => void;
  length: [number, number]; // [max integer length, max decimal length]
  isDecimal?: boolean;
  isAbsolute?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onDecimalEnter?: (value: string) => void;
  className?: string;
}

const NumericInput: React.FC<NumericInputProps> = ({
  value: controlledValue,
  onChange,
  length,
  isDecimal = true,
  isAbsolute = false,
  disabled = false,
  placeholder = "Enter number",
  onDecimalEnter,
  className,
}) => {
  const [value, setValue] = useState<string>(controlledValue?.toString() ?? "");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (controlledValue?.toString() !== value) {
      setValue(controlledValue?.toString() ?? "");
    }
  }, [controlledValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (isValidInput(inputValue)) {
      setValue(inputValue);
      onChange?.(inputValue);
    }
  };

  const handleBlur = () => {
    if (value === "") {
      setValue("0");
      setIsValid(true);
      onChange?.("0");
      return;
    }

    if (!isValidInput(value)) {
      setIsValid(false);
      setValue("");
      onChange?.("");
    } else {
      setIsValid(true);

      if (isDecimal) {
        let [intPart, decPart = ""] = value.split(".");
        decPart = decPart.padEnd(length[1], "0");
        const finalValue = `${intPart}.${decPart}`;
        setValue(finalValue);
        onChange?.(finalValue);
      }
    }
  };

  const isValidInput = (input: string) => {
    if (input === "") return true;
    if (isAbsolute && input.includes("-")) return false;
    if (!isAbsolute && input === "-") return true;
    if (isDecimal && (input === "." || input === "-.")) return true;
    if ((input.match(/-/g) || []).length > 1) return false;
    if (input.includes("-") && input.indexOf("-") !== 0) return false;
    if (isDecimal && (input.match(/\./g) || []).length > 1) return false;
    if (!isDecimal && input.includes(".")) return false;

    let [intPart, decPart = ""] = input.replace("-", "").split(".");
    if (intPart.length > 1 && intPart.startsWith("0") && !(input.startsWith("0.") || input.startsWith("-0."))) {
      return false;
    }
    if (intPart.length > length[0]) return false;
    if (isDecimal && decPart.length > length[1]) return false;
    if (!isDecimal && decPart.length > 0) return false;

    const regex = isDecimal ? /^-?\d*(\.\d*)?$/ : /^-?\d*$/;
    return regex.test(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key.toLowerCase() === "e") {
      e.preventDefault();
    }
    if (e.key === "-" && (isAbsolute || value.includes("-") || e.currentTarget.selectionStart !== 0)) {
      e.preventDefault();
    }
    if (e.key === "." && (!isDecimal || value.includes("."))) {
      e.preventDefault();
    }
    if (isDecimal && (e.key === "Enter" || e.keyCode === 13) && value !== "" && !value.includes(".")) {
      e.preventDefault();
      const paddedValue = `${value}.000`;
      if (onDecimalEnter) {
        onDecimalEnter(paddedValue);
      } else {
        setValue(paddedValue);
        onChange?.(paddedValue);
      }
    }
  };

  return (
    <input
      type="text"
      step="any"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        borderColor: isValid ? "black" : "red",
        textAlign: "right",
        background: disabled ? "#eee" : undefined,
      }}
      className={`${className} ${!isValid ? "border-red-500" : ""}`}
      onKeyDown={handleKeyDown}   
    />
  );
};

export default NumericInput;



// import React, { useState } from 'react';
// import '@/App.css';

// const NumericInput = ({ 
//   length, 
//   isDecimal = true, 
//   isAbsolute = false,
//   value: controlledValue,
//   onChange,
//   disabled = false, onDecimalEnter }) => {
//   const [value, setValue] = useState(controlledValue ?? '');
//   const [isValid, setIsValid] = useState(true);
//   //const isDecimal = length[1] > 0;

//   // Sync with controlled value
//   React.useEffect(() => {
//     if (controlledValue !== undefined && controlledValue !== value) {
//       setValue(controlledValue);
//     }
//     // eslint-disable-next-line
//   }, [controlledValue]);

//   const handleChange = (e) => {
//     const inputValue = e.target.value;

//     // Validate input based on specified conditions
//     if (isValidInput(inputValue)) {
//       setValue(inputValue);
//       if (onChange) onChange(inputValue);
//     }
//   };


// const handleBlur = () => {
//   if (value === '') {
//     setValue('0');
//     setIsValid(true);
//     if (onChange) onChange('0');
//     return;
//   }

//   if (!isValidInput(value)) {
//     setIsValid(false);
//     setValue('');
//     if (onChange) onChange('');
//   } else {
//     setIsValid(true);

//     //Only Pad zeros after decimal if user entered a decimal point
//     // if (isDecimal && value.includes('.')) {
//     //   let [intPart, decPart = ''] = value.split('.');
//     //   if (decPart.length < length[1]) {
//     //     decPart = decPart.padEnd(length[1], '0');
//     //     setValue(intPart + '.' + decPart);
//     //     if (onChange) onChange(intPart + '.' + decPart);
//     //   } else if (decPart.length === 0) {
//     //     // If user entered no decimal part, add zeros
//     //     setValue(intPart + '.' + '0'.repeat(length[1]));
//     //     if (onChange) onChange(intPart + '.' + '0'.repeat(length[1]));
//     //   }
//     // }

//     if (isDecimal) {
//     let [intPart, decPart = ''] = value.split('.');
//     if (decPart.length < length[1]) {
//       decPart = decPart.padEnd(length[1], '0');
//       setValue(intPart + '.' + decPart);
//       if (onChange) onChange(intPart + '.' + decPart);
//     } else if (decPart.length === 0) {
//     // If user entered no decimal part, add zeros
//       setValue(intPart + '.' + '0'.repeat(length[1]));
//       if (onChange) onChange(intPart + '.' + '0'.repeat(length[1]));
//     }
//     }
//   }
// };

// const isValidInput = (input) => {
//   // Allow empty input so user can clear the field
//   if (input === '') return true;

//   // If absolute, do not allow '-'
//   if (isAbsolute && input.includes('-')) return false;

//   // Allow just '-' as a valid intermediate input (unless absolute)
//   if (!isAbsolute && input === '-') return true;

//   // Allow just '.' or '-.' as a valid intermediate input if decimals are allowed
//   if (isDecimal && (input === '.' || input === '-.')) return true;

//   // Only one '-' at the start
//   if ((input.match(/-/g) || []).length > 1) return false;
//   if (input.includes('-') && input.indexOf('-') !== 0) return false;

//   // Only one decimal point if decimals allowed
//   if (isDecimal && (input.match(/\./g) || []).length > 1) return false;
//   if (!isDecimal && input.includes('.')) return false;

//   // Split input into integer and decimal parts
//   let [integerPart, decimalPart] = input.replace('-', '').split('.');
//   if (!integerPart) integerPart = '';
//   if (!decimalPart) decimalPart = '';

//   // Leading zero check: allow '0', '-0', '0.xxx', '-0.xxx'
//   if (
//     integerPart.length > 1 &&
//     integerPart.startsWith('0') &&
//     !(input.startsWith('0.') || input.startsWith('-0.'))
//   ) {
//     return false;
//   }

//   // Enforce length limits
//   if (integerPart.length > length[0]) return false;
//   if (isDecimal && decimalPart.length > length[1]) return false;
//   if (!isDecimal && decimalPart.length > 0) return false;

//   // Allow numbers ending with a dot (e.g., '1.' or '-1.')
//   const regex = isDecimal ? /^-?\d*(\.\d*)?$/ : /^-?\d*$/;
//   return regex.test(input);
// };


//   return (
//     <input
//       type="text"
//       step="any"
//       value={value}
//       onChange={handleChange}
//       onBlur={handleBlur}
//       placeholder="Enter number"
//       required
//       disabled={disabled}
//       style={{ borderColor: isValid ? 'black' : 'red',
//               textAlign: 'right',
//               background: disabled ? '#eee' : undefined
//        }}
//       onKeyDown={(e) => {
//         if (e.key === 'e' || e.key === 'E') {
//           e.preventDefault();
//         }
//         // Prevent more than one '-' or '-' not at the start
//         if (
//           e.key === '-' &&
//           (isAbsolute || value.includes('-') || e.target.selectionStart !== 0)
//         ) {
//           e.preventDefault();
//         }
//         if (
//           e.key === '.' &&
//           (!isDecimal || value.includes('.'))
//         ) {
//           e.preventDefault();
//         }
//         if (
//           isDecimal &&
//           (e.key === 'Enter' || e.keyCode === 13) &&
//           value !== '' &&
//           !value.includes('.')
//         ) {
//           e.preventDefault();
//           if (onDecimalEnter) {
//             onDecimalEnter(value + '.000');
//           } else {
//             setValue(value + '.000');
//             if (onChange) onChange(value + '.000');
//           }
//         }
//       }}
//     />
//   );
// };

// export default NumericInput;