import { Button } from "@/components/ui/button";

export interface Item {
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
}

interface ItemMasterTableProps {
  items: Item[];
  onRowClick?: (item: Item) => void;
  showAction?: boolean;
  onEdit?: (item: Item) => void;
}

export default function ItemMasterTable({
  items,
  onRowClick,
  showAction = false,
  onEdit,
}: ItemMasterTableProps) {
  return (
    <div className="">
      <table className="min-w-full bg-white border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">SNo.</th>
            <th className="p-2 border">Item Code</th>
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">Unit</th>
            {showAction && <th className="p-2 border">Action</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.itemId}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(item)}
            >
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{item.itemCode}</td>
              <td className="p-2 border">{item.itemName}</td>
              <td className="p-2 border">{item.unit}</td>
              {showAction && (
                <td className="p-2 border">
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}>
                    Edit
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}