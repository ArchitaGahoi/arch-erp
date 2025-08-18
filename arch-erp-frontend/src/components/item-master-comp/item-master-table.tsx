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
      <table className="w-full border border-gray-150 dark:border-gray-700 rounded shadow-sm bg-white dark:bg-[#23272f]">
        <thead className="bg-gray-100 dark:bg-[#0c1932] text-left text-gray-900 dark:text-gray-100">
          <tr>
            <th className="p-2 border dark:border-gray-700">Sr No.</th>
            <th className="p-2 border dark:border-gray-700">Item Code</th>
            <th className="p-2 border dark:border-gray-700">Item Name</th>
            <th className="p-2 border dark:border-gray-700">Unit</th>
            {showAction && <th className="p-2 border dark:border-gray-700">Action</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.itemId}
              className=" hover:bg-gray-100 dark:hover:bg-orange-800 cursor-pointer text-gray-900 dark:text-gray-100"
              onClick={() => onRowClick?.(item)}
            >
              <td className="p-2 border dark:border-gray-700">{index + 1}</td>
              <td className="p-2 border dark:border-gray-700">{item.itemCode}</td>
              <td className="p-2 border dark:border-gray-700">{item.itemName}</td>
              <td className="p-2 border dark:border-gray-700">{item.unit}</td>
              {showAction && (
                <td className="p-2 border dark:border-gray-700">
                  <Button size="sm" variant="secondary" className="px-3 py-1 rounded text-sm transition-colors border border-gray-300 text-gray-900 bg-white hover:bg-gray-50
                    dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-white dark:border-transparent"
                    onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}>
                    Edit
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
  );
}