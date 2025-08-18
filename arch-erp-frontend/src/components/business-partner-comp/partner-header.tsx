import { Button } from "@/components/ui/button";
//import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  onAdd: () => void;
  onSearch: () => void;
  onDelete: () => void;
  deleteEnabled: boolean;
  isEdit?: boolean;
}

export default function PartnerHeader({ onAdd, onSearch, onDelete, deleteEnabled, isEdit }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4 ">
      <h2 className="text-xl font-semibold">Business Partner</h2>
      {/* <div className="flex items-center gap-4"></div> */}
      <div className="flex gap-2">
        <Button variant="outline"
        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23272f] text-gray-900 dark:text-gray-100"
        type="submit" form = "businessPartnerForm">{isEdit ? "Update" : "Save"}</Button>        
        <Button onClick={onAdd}
        variant="outline"
        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23272f] text-gray-900 dark:text-gray-100"
        >
          +</Button>
        <Button onClick={onSearch}
        variant="outline"
        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23272f] text-gray-900 dark:text-gray-100"
        >
          Search</Button>
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