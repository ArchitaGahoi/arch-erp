import { Button } from "@/components/ui/button";
//import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  onAdd: () => void;
  onSearch: () => void;
  onDelete: () => void;
  deleteEnabled: boolean;
  isEdit?: boolean;
}

export default function Header({ onAdd, onSearch, onDelete, deleteEnabled, isEdit }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Item Master</h2>
      {/* <div className="flex items-center gap-4"></div> */}
      <div className="flex gap-2">
        <Button type="submit" form = "itemMasterForm">{isEdit ? "Update" : "Save"}</Button>
        <Button onClick={onAdd}>+</Button>
        <Button onClick={onSearch}>Search</Button>
        <Button onClick={onDelete} disabled={!deleteEnabled} variant="destructive">
          Delete
        </Button>
      </div>
      {/* <ThemeToggle /> */}
    </div>
  );
}