//import { Button } from "@/components/ui/button";

interface ItemDetail {
  itemName: string;
  poQuantity: number;
  preRecivedQuantity: number;
  balance: number;
  recivedQuantity: number;
}

interface Props {
  itemDetails: ItemDetail[];
  setItemDetails: (items: ItemDetail[]) => void;
  onRowClick?: (item: ItemDetail) => void;
}

const ItemDetailGrid = ({ itemDetails, onRowClick, }: Props) => {
  // const handleDelete = (index: number) => {
  //   const updated = [...itemDetails];
  //   updated.splice(index, 1);
  //   setItemDetails(updated);
  // };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <h2 className="text-lg font-bold mb-2">Item Details</h2>
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
            <th className="p-2 border">Action</th> 
          </tr>
        </thead>
        <tbody>
          {itemDetails.map((item, index) => (
            <tr key={index}
            className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(item)}
              >
              <td>{index+1}</td>
              <td>{item.itemName}</td>
              <td>{item.poQuantity}</td>
              <td>{item.preRecivedQuantity}</td>
              <td>{item.balance}</td>
              <td>{item.recivedQuantity}</td>
              {/* <td>
                <Button variant="outline" onClick={() => handleDelete(index)}>
                  Delete
                </Button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemDetailGrid;
