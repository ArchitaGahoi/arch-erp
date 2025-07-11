import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import NumericInput from "@/components/purchase-order-comp/NumericInput";

interface TaxDetail {
  taxName: string;
  nature: 1 | 2;
  amount: number;
}

interface Props {
  taxDetails: TaxDetail[];
  setTaxDetails: (items: TaxDetail[]) => void;
  onRowClick?: (items: TaxDetail) => void;
  onTotalChange?: (total: number) => void;
}

const TaxDetailGrid = ({ taxDetails, setTaxDetails, onRowClick, onTotalChange }: Props) => {
  const [editableRows, setEditableRows] = useState<TaxDetail[]>([
    { taxName: "", nature: 1, amount: 0 },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);

  const updateTotal = (updated: TaxDetail[]) => {
    const total = updated.reduce((sum, tax) => {
      return sum + (tax.nature === 1 ? tax.amount : -tax.amount);
    }, 0);
    setTotalAmount(total);
    onTotalChange?.(total);
  };

  useEffect(() => {
  if (taxDetails && taxDetails.length > 0) {
    const total = taxDetails.reduce((sum, tax) => {
      return sum + (tax.nature === 1 ? tax.amount : -tax.amount);
    }, 0);
    setTotalAmount(total);
    onTotalChange?.(total); 
  }
}, [taxDetails]);

  const handleFieldChange = (index: number, field: keyof TaxDetail, value: any) => {
    const updated = [...editableRows];
    if (field === 'taxName') {
    updated[index][field] = value as string;
    } else if (field === 'nature') {
        if (value === 1 || value === 2) {
        updated[index][field] = value;
      } else {
        console.error(`Invalid value for nature: ${value}`);
      }
    } else if (field === 'amount') {
    updated[index][field] = value as number;
    }
    setEditableRows(updated);
  };

  const handleAddRow = () => {
    setEditableRows([...editableRows, { taxName: "", nature: 1, amount: 0 }]);
  };

  const handleSave = (index: number) => {
    const row = editableRows[index];
    const updated = [...taxDetails, row];
    setTaxDetails(updated);
    updateTotal(updated);

    const newEditable = [...editableRows];
    newEditable.splice(index, 1);
    setEditableRows(newEditable);
  };

  const handleDeleteEditable = (index: number) => {
    const updated = [...editableRows];
    updated.splice(index, 1);
    setEditableRows(updated);
  };

  const handleDeleteSaved = (index: number) => {
    const updated = [...taxDetails];
    updated.splice(index, 1);
    setTaxDetails(updated);
    updateTotal(updated);
  };

  const natureOptions = [
    { value: 1, label: "Add" },
    { value: 2, label: "Subtract" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <div className="flex flex-row justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Tax Details</h2>
        <Button onClick={handleAddRow}>Add Tax</Button>
      </div>

      <table className="table-auto w-full">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Tax Name</th>
            <th className="p-2 border">Nature</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Editable rows */}
          {editableRows.map((tax, index) => (
            <tr key={`editable-${index}`} className="bg-yellow-50">
              <td className="border p-2">
                <Input
                  placeholder="Tax Name"
                  value={tax.taxName}
                  onChange={(e) => handleFieldChange(index, "taxName", e.target.value)}
                />
              </td>
              <td className="border p-2">
                <Combobox value={tax.nature} onChange={(val) => handleFieldChange(index, "nature", val)}>
                  <Combobox.Input
                    className="w-full border border-gray-300 rounded-md p-2"
                    displayValue={(val: number) => natureOptions.find((o) => o.value === val)?.label || ""}
                    placeholder="Select"
                  />
                  <Combobox.Options className="absolute z-10 bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                    {natureOptions.map((option) => (
                      <Combobox.Option
                        key={option.value}
                        value={option.value}
                        className={({ selected }) =>
                          `cursor-pointer px-4 py-2 ${selected ? "bg-blue-500 text-white" : "bg-white"}`
                        }
                      >
                        {option.label}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </Combobox>
              </td>
              <td className="border p-2">
                <NumericInput
                  className="w-full border border-gray-300 rounded-md p-2"
                  length={[12, 2]}
                  isDecimal={true}
                  isAbsolute={true}
                  value={tax.amount}
                  onChange={(val : string | number) => handleFieldChange(index, "amount", Number(val))}
                />
              </td>
              <td className="border p-2 space-x-2">
                <Button onClick={() => handleSave(index)}>Add</Button>
                <Button variant="outline" onClick={() => handleDeleteEditable(index)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}

          {/* Saved rows */}
          {taxDetails.map((tax, index) => (
            <tr key={`saved-${index}`} onClick={() => onRowClick?.(tax)} className="hover:bg-gray-50 cursor-pointer">
              <td className="border p-2">{tax.taxName}</td>
              <td className="border p-2">{tax.nature === 1 ? "+" : "-"}</td>
              <td className="border p-2">{tax.amount}</td>
              <td className="border p-2">
                <Button variant="outline" onClick={() => handleDeleteSaved(index)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="font-semibold mt-2 flex justify-end">
        Total Tax Amount: {totalAmount.toFixed(2)}
      </p>
    </div>
  );
};

export default TaxDetailGrid;
