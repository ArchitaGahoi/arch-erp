//import { Button } from "@/components/ui/button";

interface ItemDetail {
  itemName: string;
  poQuantity: number;
  preRecivedQuantity: number;
  balance: number;
  recivedQuantity: number;
  selected?: boolean;
}

interface Props {
  itemDetails: ItemDetail[];
  setItemDetails: (items: ItemDetail[]) => void;
  onRowClick?: (item: ItemDetail) => void;
  isReadOnly?: boolean;
}

const ItemDetailGrid = ({ itemDetails, setItemDetails, onRowClick, isReadOnly}: Props) => {
  // const handleDelete = (index: number) => {
  //   const updated = [...itemDetails];
  //   updated.splice(index, 1);
  //   setItemDetails(updated);
  // };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <h2 className="text-lg font-bold mb-2">Item Details</h2>
      {itemDetails.length === 0 ? (
        <div className="text-gray-500 text-sm italic">No item details available. Please select a PO.</div>
      ) : (
      <table className="table-auto w-full">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border" >SNo.</th>
            <th className="p-2 border">Selection</th>
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">PO Quantity</th>
            <th className="p-2 border">Pre Recived Quantity</th>
            <th className="p-2 border">Balance</th>
            <th className="p-2 border">Recived Quantity</th>
          </tr>
        </thead>
        <tbody>
          {itemDetails.map((item, index) => (
            <tr key={index}
            className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(item)}
              >
              <td>{index+1}</td>
              <td>
                <input
                  type="checkbox"
                  checked={item.selected || false}
                  disabled={isReadOnly}
                  className={isReadOnly ? "cursor-not-allowed" : ""}
                  onChange={(e) => {
                    const updated = [...itemDetails];
                    updated[index].selected = e.target.checked;
                    setItemDetails(updated);
                  }}
                />
              </td>
              <td>{item.itemName}</td>
              <td>{item.poQuantity}
                
              </td>
              <td>{item.preRecivedQuantity}</td>
              <td>{item.balance}</td>
              <td><input
                  type="number"
                  min={0}
                  max={item.poQuantity - item.preRecivedQuantity}
                  value={item.recivedQuantity}
                  disabled={isReadOnly}
                  className={`border rounded p-1 w-full ${isReadOnly ? "bg-gray-200 text-gray-500" : ""}`}
                  onChange={(e) => {
                    const inputQty = Number(e.target.value);
                    const maxQty = item.poQuantity - item.preRecivedQuantity;

                    if (inputQty > maxQty) return alert("Received quantity exceeds PO balance");

                    const updated = [...itemDetails];
                    updated[index].recivedQuantity = inputQty;
                    updated[index].balance = item.poQuantity - (item.preRecivedQuantity + inputQty);
                    setItemDetails(updated);
                  }}
                />
              </td>
              {/* <td>
                <Button variant="outline" onClick={() => handleDelete(index)}>
                  Delete
                </Button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
};

export default ItemDetailGrid;
