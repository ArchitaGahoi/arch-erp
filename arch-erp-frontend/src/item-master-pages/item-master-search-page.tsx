import { useEffect, useState } from "react";
import ItemMasterTable from "@/components/item-master-comp/item-master-table";
import  type { Item } from "@/components/item-master-comp/item-master-table";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ItemMasterSearchPage() {
  const [items, setItems] = useState<Item[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await api.get("/item-master/items");
    setItems(res.data as Item[]);
  };

  const handleEdit = (item: Item) => {
    navigate("/itemMaster", { state: { editItem: item } });
  };

  const handleAdd = () => {
    navigate("/itemMaster");
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex flex-row items-center justify-between mb-4 ">
        <h2 className="text-xl font-semibold">Search Items</h2>
        <Button onClick={handleAdd} variant="outline" className="ml-auto">
            Add
        </Button>
      </div>
      <ItemMasterTable items={items} showAction onEdit={handleEdit} />
    </div>
  );
}
