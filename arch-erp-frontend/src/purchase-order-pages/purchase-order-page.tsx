// PurchaseOrderPage.tsx
import { useEffect, useState, useRef } from "react";
// import { useForm } from 'react-hook-form';
import PurchaseHeader from "@/components/purchase-order-comp/purchase-header";
import PurchaseOrderForm from "@/components/purchase-order-comp/purchase-order-form";
import ItemDetailGrid from "@/components/purchase-order-comp/item-detail-grid";
import TaxDetailGrid from "@/components/purchase-order-comp/tax-detail-grid";
import ItemDetailForm from "@/components/purchase-order-comp/item-detail-form";
import { useLocation, useNavigate } from "react-router-dom";
import type { PO } from "@/components/purchase-order-comp/purchase-order";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Dialog ,DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ItemDetail = {
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
  unit: string;
};

type TaxDetail = {
  taxName: string;
  nature: "Add" | "Subtract";
  amount: number;
};

// type ItemMaster = {
//   itemId: string;
//   itemCode: string;
//   itemName: string;
//   unit: string;
// };

export default function PurchaseOrderPage() {
  const [errData, setErrData] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const formRef = useRef<{ reset: () => void; getValues: () => any }>(null);
  // const { setValue } = useForm();
  const token = localStorage.getItem('token');
  const [editItem, setEditItem] = useState<PO | null>(null);
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
  const [taxDetails, setTaxDetails] = useState<TaxDetail[]>([]);
  const [netAmount, setNetAmount] = useState(0);
  const [showItemDetailForm, setShowItemDetailForm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<() => void>(() => {});
  //const [itemMasters, setItemMasters] = useState<ItemMaster[]>([]);
  const [isDelete, setIsDelete] = useState(false);
  const initializedRef = useRef(false);

   const deleteEnabled = !!editItem;
  
useEffect(() => {
  if (location.state?.editItem) {
    const fullData = location.state.editItem;
    const enrichedEditItem = {
      ...fullData,
      supplierLocationLabel: `${fullData.bpName} (${fullData.bpCode}) (${fullData.bpAddress})`,
    };
    setEditItem(enrichedEditItem);
    setItemDetails(fullData.itemDetails || []);   
    setTaxDetails(fullData.taxDetails || []);
    setNetAmount(Number(fullData.netAmount) || 0);
  }
}, [location.state]);

useEffect(() => {
  const totalItemAmount = itemDetails.reduce((prev, curr) => prev + curr.amount, 0);
  const totalTaxAmount = taxDetails.reduce((prev, curr) => {
    return prev + (curr.nature === "Add" ? curr.amount : -curr.amount);
  }, 0);
  setNetAmount(totalItemAmount + totalTaxAmount);
}, [itemDetails, taxDetails]);
  


  // useEffect(() => {
  //   const fetchItems = async () => {
  //     try {
  //       const res = await api.get("/item-master/items"); // adjust endpoint as needed
  //       setItemMasters(res.data as ItemMaster[] || []);
  //     } catch (error) {
  //       toast.error("Failed to load items");
  //       console.error(error);
  //     }
  //   };
  //   fetchItems();
  // }, []);

  const handleFormSubmit = async (data: PO) => {
    const formData = formRef.current?.getValues();

    // if (!formData.poNo) errors.poNo = "PO No is required";
    // if (!formData.supplierLocationNo) errors.supplierLocationNo = "Supplier Location is required";

    console.log("sdfgbn....",data);
    const finalData = {
      poNo: formData.poNo,
      poDate: formData.poDate,
      statusNo: formData.statusNo === "Initialised" ? 1 : 2,
      supplierLocationNo: formData.supplierLocationNo,
      itemDetails,
      taxDetails,
      netAmount,  
    };

    console.log(finalData);
    try {
      if (editItem?.poId) {
        await api.put(`/purchase-order/${editItem.poId}`,finalData, {
           headers: {
            Authorization: `Bearer ${token}`,
          },         
      });
        toast.success("Purchase Order updated successfully");
      } else {
        await api.post("/purchase-order", finalData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },

      });
        toast.success("Purchase Order created successfully");
      }
      navigate("/purchaseOrder-search");
    } catch (err: Error | any) {
      console.error(err);
      setErrData(()=>{
        return {poNo : err.response.data.message,
          statusNo : err.response.data.message,
          supplierLocationNo : err.response.data.message,
        };
      })
      return;
      // const message =
      //   error?.response?.data?.message || error?.message || "Something went wrong";
      // toast.error(message);
    }
    setEditItem(null); // Clear form after save/update
    // formRef.current?.reset();
    
    setItemDetails([]);
    setTaxDetails([]);
    setNetAmount(0);
    formRef.current?.reset();
  };

  const handleSave = () => {
    if (!formRef.current) return;
    const formData = formRef.current.getValues();
    handleFormSubmit({ ...formData, netAmount });
  };

  // Clear and add new entry on click + button
  const handleClear = () =>{
    setEditItem(null);
    
    setItemDetails([]);
    setTaxDetails([]);
    setNetAmount(0);
    formRef.current?.reset();
    console.log("clear")
    setErrData({});
  }
  // const handleSave = () => {
  //   const form = document.querySelector<HTMLFormElement>("#purchase-order-form");
  //   if (form) {
  //     form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  //   }
  // };

  const handleDelete = async () => {
    if (!editItem?.poId) return;

    try {
      await api.delete(`/purchase-order/${editItem.poId}`
        , {
        headers: { Authorization: `Bearer ${token}` },
      }
      );
      toast.success("Purchase Order deleted");
      navigate("/purchaseOrder-search");
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message || error?.message || "Something went wrong";
      toast.error(message);
    }
    setEditItem(null); // Clear form after delete

    setItemDetails([]);
    setTaxDetails([]);
    setNetAmount(0);
    formRef.current?.reset();
  };

  const handleSearch = () => {
    navigate("/purchaseOrder-search");
  };

  const handleAddItem = () => {
    setShowItemDetailForm(true);
  };

  const addItemToGrid = (item: ItemDetail) => {
    setItemDetails([...itemDetails, item]);
    setShowItemDetailForm(false);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogConfirm = () => {
    console.log("dialog-->",dialogAction)
    if (dialogAction) {
      dialogAction();
    }
    setDialogAction(()=>()=>{});
    setOpenDialog(false);
    if (isDelete) setIsDelete(false)
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-100">
      {/* <form
        id="userMasterForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 bg-white p-4 rounded-lg shadow mb-4"
      > */}
      {/* <form
        id="purchase-order-form"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);

          const data: PO = {
            poNo: formData.get("poNo") as string,
            poDate: new Date(formData.get("poDate") as string),
            statusNo: formData.get("statusNo") as "Initialised" | "Authorised",
            supplierLocationNo: formData.get("supplierLocationNo") as string,
            netAmount: netAmount, // from state
          };

          handleFormSubmit(data);
        }}
      > */}
      <PurchaseHeader
        onAdd={handleClear}
        onSearch={handleSearch}
        onDelete={() =>{
          setIsDelete(true);
          handleDialogOpen();
          setDialogAction(()=>()=>handleDelete());
        }}
        deleteEnabled={deleteEnabled}
        isEdit={!!editItem}
        onSave={() =>{
          handleDialogOpen();
          setDialogAction(()=>()=>handleSave());
        }}
        
        errData={errData}
      />
        
        <PurchaseOrderForm
          key={editItem ? `edit-${editItem.poId}` : "new"}
          ref={formRef}
          
          defaultValues={
            
            editItem
              ? {                
                poNo: editItem.poNo,
                poDate: new Date(editItem.poDate),
                statusNo: ((editItem.statusNo === 1 ? "Initialised" : "Authorised") as "Initialised" | "Authorised"),

                supplierLocationNo: String(editItem.supplierLocationNo) || "",
                supplierLocationLabel: editItem.supplierLocationLabel || "",
              }
              : undefined
          }
          //onSubmit={(data) => handleFormSubmit({ ...data, netAmount: netAmount })}
          isEdit={!!editItem}
          
          errData={errData}
        />
      {/* </form> */}

      <div className="my-6 flex justify-end">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAddItem}
        >
          Add Item
        </button>
      </div>
          
      {showItemDetailForm && (
        <Dialog open={showItemDetailForm} onOpenChange={setShowItemDetailForm}>
          <DialogContent>
            <div className="mb-6">
              <ItemDetailForm addItemToGrid={addItemToGrid} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="my-6">
        <ItemDetailGrid itemDetails={itemDetails} setItemDetails={setItemDetails} />
      </div>

      <div className="my-6">
        <TaxDetailGrid taxDetails={taxDetails} setTaxDetails={setTaxDetails} />
      </div>

      <div className="my-6 flex justify-end">
        <h4 className="font-semibold">Net Amount: {Number(netAmount).toFixed(2)}</h4>
      </div>
      <Dialog open={openDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="p-6">
          <p className="text-xl font-semibold">
            {isDelete ? "delete" :editItem ? "update" : "Save"} User
          </p>
          <p className="mt-4">
            Are you sure you want to {isDelete ? "delete" : (editItem ? "update" : "Save")} this User?
          </p>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              className="ml-4"
              onClick={handleDialogConfirm}
            >
              {isDelete ? "delete" :editItem? "update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* </form> */}
      {/* <div className="flex justify-end">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSave}
        >
          Save
        </button>
      </div> */}

        {/* </form> */}
    </div>
    
  );
}



