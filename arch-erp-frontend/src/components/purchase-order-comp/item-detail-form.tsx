import { useEffect, useState } from "react";
import NumericInput from "@/components/purchase-order-comp/NumericInput";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { api } from "@/lib/api";

interface Item {
  itemId: string;
  itemName: string;
  unit: string;
}

interface Props {
  addItemToGrid: (item: {
    itemId: string;
    itemName: string;
    unit: string;
    quantity: number;
    rate: number;
    amount: number;
  }) => void;
}

const ItemDetailForm = ({ addItemToGrid }: Props) => {
  const apiUrl = "/item-master/items";

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);

  const amount = quantity * rate;

  const [itemOptions, setItemOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await api.get(apiUrl);
        if (Array.isArray(res.data)) {
          setItemOptions(res.data);
        }
      } catch (err) {
        setItemOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems =
    query === ""
      ? itemOptions
      : itemOptions.filter((item) =>
          item.itemName?.toLowerCase().includes(query.toLowerCase())
        );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const newItem = {
      itemId: selectedItem.itemId,
      itemName: selectedItem.itemName,
      unit: selectedItem.unit,
      quantity,
      rate,
      amount,
    };

    addItemToGrid(newItem);

    setSelectedItem(null);
    setQuantity(1);
    setRate(0);
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto mt-6 bg-white p-4 rounded-lg shadow"
    >
      <h2 className="text-xl font-semibold mb-4 text-center">Add Item Detail</h2>

      {/* Item Name */}
      <label
        htmlFor="item-combo"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Item Name
      </label>
      <Combobox value={selectedItem} onChange={setSelectedItem}>
        <div className="relative">
          <ComboboxInput
            id="item-combo"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            displayValue={(item: any) => item?.itemName || ""}
            onChange={(event) => setQuery(event.target.value)}
            required
          />
          <ComboboxOptions className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md max-h-60 overflow-auto shadow-md">
            {filteredItems.length === 0 && !loading && query !== "" ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No results found.
              </div>
            ) : (
              filteredItems.map((item) => (
                <ComboboxOption
                  key={item.itemId}
                  value={item}
                  className={({ active }) =>
                    `px-3 py-2 cursor-pointer text-sm ${
                      active ? "bg-blue-500 text-white" : "text-gray-900"
                    }`
                  }
                >
                  {item.itemName}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>

      {/* Unit */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Unit</label>
        <input
          type="text"
          value={selectedItem?.unit ?? ""}
          disabled
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
        />
      </div>

      {/* Quantity */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Quantity</label>
        <NumericInput
          value={quantity}
          length={[6, 0]}
          isDecimal={false}
          isAbsolute={true}
          onChange={(val) => setQuantity(Number(val))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* Rate */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Rate</label>
        <NumericInput
          value={rate}
          length={[9, 4]}
          isDecimal={true}
          isAbsolute={true}
          onChange={(val) => setRate(Number(val))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* Amount */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <NumericInput
          value={amount.toFixed(2)}
          length={[12, 2]}
          isDecimal={true}
          isAbsolute={true}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          disabled
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end space-x-2">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
        <button
          type="reset"
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setSelectedItem(null);
            setQuantity(1);
            setRate(0);
            setQuery("");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ItemDetailForm;
