import { Button } from "@/components/ui/button";

interface HeaderProps {
  onAdd: () => void;
  onSearch: () => void;
  onDelete: () => void;
  onSave: () => void;
  deleteEnabled: boolean;
  isEdit?: boolean;
}

export default function PurchaseHeader({ onAdd, onSearch, onDelete, deleteEnabled, isEdit, onSave }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold mb-2">Purchase Order</h2>
      {/* <div className="flex items-center gap-4"></div> */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23272f] text-gray-900 dark:text-gray-100"
          onClick={onSave}
          disabled={isEdit && !deleteEnabled}
          title={isEdit && !deleteEnabled ? "Cannot update authorised PO" : ""}
        >
          {isEdit ? "Update" : "Save"}
        </Button>
        <Button 
        variant="outline"
        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23272f] text-gray-900 dark:text-gray-100"
        onClick={onAdd}>+</Button>
        <Button   
        variant="outline"
        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23272f] text-gray-900 dark:text-gray-100"
        onClick={onSearch}>Search</Button>
        <Button
          variant="outline"
          onClick={onDelete}
          disabled={!deleteEnabled}
          className={`border border-red-500 dark:border-red-900 bg-red-500 dark:bg-red-600 text-white font-semibold
            ${!deleteEnabled ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600 dark:hover:bg-red-950"}`}
        >
          Delete
        </Button>
      </div>
      {/* <ThemeToggle /> */}
    </div>
  );
}
