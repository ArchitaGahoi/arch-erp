import { Button } from "@/components/ui/button";

interface HeaderProps {
  onAdd: () => void;
  onSearch: () => void;
  onDelete: () => void;
  onSave: () => void;
  deleteEnabled: boolean;
  isEdit?: boolean;
}

export default function GRNHeader({ onAdd, onSearch, onDelete, deleteEnabled, isEdit, onSave }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold mb-2">GOODS RECEIPT NOTE</h2>
      {/* <div className="flex items-center gap-4"></div> */}
      <div className="flex gap-2">
        <Button onClick={onSave}>{isEdit ? "Update" : "Save"}</Button>
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
