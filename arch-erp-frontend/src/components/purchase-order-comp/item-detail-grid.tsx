import { Button } from "@/components/ui/button";
import { useEffect } from 'react';

interface ItemDetail {
  itemName: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Props {
  itemDetails: ItemDetail[];
  setItemDetails: (items: ItemDetail[]) => void;
  onRowClick?: (item: ItemDetail) => void;
  onTotalChange?: (total: number) => void;
  isReadOnly?: boolean;
}

const ItemDetailGrid = ({ itemDetails, setItemDetails, onRowClick, onTotalChange, isReadOnly  }: Props) => {
  const handleDelete = (index: number) => {
    const updated = [...itemDetails];
    updated.splice(index, 1);
    setItemDetails(updated);
  };

  const total = itemDetails.reduce((sum, item) => sum + Number(item.amount || 0), 0);


  useEffect(() => {
    onTotalChange?.(total);
  }, [itemDetails]);

  return (
    <div className="bg-white dark:bg-[#23272f] p-4 rounded-lg shadow mt-4">
      <h2 className="text-lg font-bold mb-2 dark:text-gray-100">Item Details</h2>
      <table className="table-auto w-full">
        <thead>
          <tr className="bg-gray-100 dark:bg-[#18181b] text-left text-gray-800 dark:text-gray-100 ">
            <th className="p-2 border" >SNo.</th>
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">Unit</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Rate</th>
            <th className="p-2 border">Amount</th>
            {!isReadOnly && <th className="p-2 border">Action</th>}
          </tr>
        </thead>
        <tbody>
          {itemDetails.map((item, index) => (
            <tr key={index}
            className="hover:bg-gray-50 dark:hover:bg-[#2a2f38] cursor-pointer text-gray-900 dark:text-gray-100"
              onClick={() => onRowClick?.(item)}
              >
              <td>{index+1}</td>
              <td>{item.itemName}</td>
              <td>{item.unit}</td>
              <td>{item.quantity}</td>
              <td>{item.rate}</td>
              <td>{item.amount}</td>
              {!isReadOnly && (
              <td>
                <Button variant="outline" onClick={() => handleDelete(index)}>
                  Delete
                </Button>
              </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-semibold mt-2 flex justify-end">
        Total Item Amount: {total.toFixed(2)}
      </p>
    </div>
  );
};

export default ItemDetailGrid;
