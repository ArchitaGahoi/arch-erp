// PurchaseOrderPage.tsx
import { useEffect, useState, useRef } from "react";
// import { useForm } from 'react-hook-form';
import GRNHeader from "@/components/grn-comp/grn-header";
import GRNForm from "@/components/grn-comp/grn-form"; 
import ItemDetailGrid from "@/components/grn-comp/grn-item-detail-grid";
//import ItemDetailForm from "@/components/purchase-order-comp/item-detail-form";
import { useLocation, useNavigate } from "react-router-dom";
import type { GRN } from "@/components/grn-comp/grn";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Dialog ,DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// type ItemDetail = {
//   itemName: string;
//   quantity: number;
//   rate: number;
//   amount: number;
//   unit: string; 
// };


// type ItemMaster = {
//   itemId: string;
//   itemCode: string;
//   itemName: string;
//   unit: string;
// };

export default function GRNPage() {
  const [errData, setErrData] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const formRef = useRef<{ reset: () => void; getValues: () => any }>(null);
  // const { setValue } = useForm();
  const token = localStorage.getItem('token');
  const [editItem, setEditItem] = useState<GRN | null>(null);
  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
  // const [taxDetails, setTaxDetails] = useState<TaxDetail[]>([]);
  //const [netAmount, setNetAmount] = useState(0);
  const [showItemDetailForm, setShowItemDetailForm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<() => void>(() => {});
  //const [itemMasters, setItemMasters] = useState<ItemMaster[]>([]);
  const [isDelete, setIsDelete] = useState(false);
  const initializedRef = useRef(false);

  const isReadOnly = editItem?.statusNo === 2;

   const deleteEnabled = !!editItem;
  
useEffect(() => {
  if (location.state?.editItem) {
    const grnFullData = location.state.editItem;
    console.log("grnFullData--->", grnFullData) 
    const enrichedEditItem = {
    ...grnFullData,
    supplierLocationLabel: `${grnFullData.bpName} (${grnFullData.bpCode}) (${grnFullData.bpAddress})`,
    };
    console.log("enrichedEditItem--->", enrichedEditItem);
    console.log("itemDetails from backend:", grnFullData.itemDetails);
    const mappedItems = (grnFullData.itemDetails || []).map((item: any) => {
    const poQty = parseFloat(item.poQuantity) || 0;
    const pre = parseFloat(item.preRecivedQuantity) || 0;
    const curr = parseFloat(item.recievedQty) || 0;

    return {
      poitemDetailId: item.poitemDetailId,
      itemName: item.itemName,
      poQuantity: poQty,
      preRecivedQuantity: pre,
      recivedQuantity: curr,
      balance: poQty - (pre + curr),
      selected: item.selected === 1
    };
  });

    setEditItem(enrichedEditItem);
    setItemDetails(mappedItems);
    // setTaxDetails(fullData.taxDetails || []);
    // setNetAmount(Number(fullData.netAmount) || 0);
  }
}, [location.state]);

  // useEffect(() => {
  //   const totalItemAmount = itemDetails.reduce((prev, curr) => prev + curr.amount, 0);
  //   const totalTaxAmount = taxDetails.reduce((prev, curr) => prev + curr.amount, 0);
  //   setNetAmount(totalItemAmount + totalTaxAmount);
  // }, [itemDetails, taxDetails]);

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

    const formatDateTime = (date: Date): string => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 19).replace("T", " ");
  };

  const handleFormSubmit = async (data: GRN) => {
    console.log("forsubmit");
    const grnFormData = { ...formRef.current?.getValues() };
    if (!grnFormData) return;
    const selectedItems = itemDetails.filter(item => item.selected);

  //   const hasInvalidItems = selectedItems.some(
  //   item => !item.poitemDetailId || item.recivedQuantity == null
  // );

  // if (hasInvalidItems) {
  //   toast.error("Please select valid items with received quantity before saving.");
  //   return;
  // }

    // if (!grnFormData.poNo) errors.poNo = "PO No is required";
    // if (!grnFormData.supplierLocationNo) errors.supplierLocationNo = "Supplier Location is required";
    console.log("sdfgbn....",data);
    const finalData = {
      grnNo: grnFormData.grnNo,
      grnDate: formatDateTime(new Date(grnFormData.grnDate)),
      statusNo: grnFormData.statusNo === "Initialised" ? 1 : 2,
      supplierLocationNo: grnFormData.supplierLocationNo,
      poNo: grnFormData.poNo,
      challanNo: grnFormData.challanNo,
      challanDate: formatDateTime(new Date(grnFormData.challanDate)),
      itemDetails: selectedItems.map(item => ({
      poitemDetailId: item.poitemDetailId,
      recievedQty: item.recivedQuantity
    })),
      createdDate: formatDateTime(new Date()),

      // taxDetails: grnFormData.taxDetails,
      // netAmount: grnFormData.netAmount
    };
    console.log("asdfghjk",finalData);
    
    try {
      if (editItem && editItem?.grnId) {
        console.log("asdf",finalData)
        await api.put(`/grn/${editItem.grnId}`,finalData, {
           headers: {
            Authorization: `Bearer ${token}`,
          },         
      });
        toast.success("GRN updated successfully");
      } else {
        console.log("asdf",itemDetails)
        await api.post("/grn", finalData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },

      });
        toast.success("GRN created successfully");
      }
      
    } catch (err: Error | any) {
      console.error(err);
      const backendErrors = err?.response?.data?.errors || {};
      setErrData(backendErrors); 
      // setErrData(()=>{
      //   return {grnNo : err.response.data.message,
      //       supplierLocationNo : err.response.data.message,
      //       poNo : err.response.data.message,
      //       challanNo : err.response.data.message
      //   };
      // })
      return;
      // const message =
      //   error?.response?.data?.message || error?.message || "Something went wrong";
      // toast.error(message);
    }
    setEditItem(null); // Clear form after save/update
    //formRef.current?.reset();
    
    setItemDetails([]);

    formRef.current?.reset();
  };

  const handleSave = () => {
    if (!formRef.current) return;
    const grnFormData = formRef.current.getValues();
    handleFormSubmit(grnFormData);
  };

  // Clear and add new entry on click + button
  const handleClear = () =>{
    setEditItem(null);
    
    setItemDetails([]);
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
    if (!editItem?.grnId) return;

    try {
      await api.delete(`/grn/${editItem.grnId}`
        , {
        headers: { Authorization: `Bearer ${token}` },
      }
      );
      toast.success("GRN deleted");
      navigate("/grn-search");
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message || error?.message || "Something went wrong";
      toast.error(message);
    }
    setEditItem(null); // Clear form after delete

    setItemDetails([]);
    formRef.current?.reset();
  };

  const handleSearch = () => {
    navigate("/grn-search");
  };

//   const handleSupplierChange = (supplierLocationNo: string) => {
//   formRef.current?.reset();
//   setItemDetails([]);
// };

//   const handlePOChange = async (poNo: string) => {
//     try {
//       const res: { data: any[] } = await api.get(`/purchase-order/items/${poNo}`);
//       const items = res.data.map((item: any) => ({
//         itemName: item.itemName,
//         poQuantity: item.poQuantity,
//         preRecivedQuantity: item.preRecivedQuantity || 0,
//         balance: item.poQuantity - (item.preRecivedQuantity || 0),
//         recivedQuantity: 0,
//         selected: false
//       }));
//       setItemDetails(items);
//     } catch (err) {
//       toast.error("Failed to load item details");
//       setItemDetails([]);
//     }
//   };


  // const handleAddItem = () => {
  //   setShowItemDetailForm(true);
  // };

  // const addItemToGrid = (item: ItemDetail) => {
  //   setItemDetails([...itemDetails, item]);
  //   setShowItemDetailForm(false);
  // };

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
          const grnFormData = new grnFormData(e.currentTarget);

          const data: PO = {
            poNo: grnFormData.get("poNo") as string,
            poDate: new Date(grnFormData.get("poDate") as string),
            statusNo: grnFormData.get("statusNo") as "Initialised" | "Authorised",
            supplierLocationNo: grnFormData.get("supplierLocationNo") as string,
            netAmount: netAmount, // from state
          };

          handleFormSubmit(data);
        }}
      > */}
      <GRNHeader
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
        
        <GRNForm
          key={editItem ? `edit-${editItem.grnId}` : "new"}
          ref={formRef}
          
          defaultValues={
            
            editItem
              ? {                
                grnNo: editItem.grnNo,
                grnDate: new Date(editItem.grnDate),
                statusNo: ((editItem.statusNo === 1 ? "Initialised" : "Authorised") as "Initialised" | "Authorised"),
                supplierLocationNo: String(editItem.supplierLocationNo) || "",
                supplierLocationLabel: editItem.supplierLocationLabel || "",
                poNo: String(editItem.poNo) || "",
                challanNo: String(editItem.challanNo) || "",
                challanDate: new Date(editItem.challanDate)
              }
              : undefined
          }
          //onSubmit={(data) => handleFormSubmit({ ...data, netAmount: netAmount })}
          isEdit={!!editItem}
          
          errData={errData}
          itemDetails={itemDetails}
          setItemDetails={setItemDetails}
          disableAll={isReadOnly}
          //onSupplierChange={handleSupplierChange}
          //onPOChange={handlePOChange}
        />

        <ItemDetailGrid
          itemDetails={itemDetails}
          setItemDetails={setItemDetails}
          isReadOnly={isReadOnly}
        />
      {/* </form> */}

      {/* <div className="my-6 flex justify-end">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAddItem}
        >
          Add Item
        </button>
      </div> */}
          
      {/* {showItemDetailForm && (
        <Dialog open={showItemDetailForm} onOpenChange={setShowItemDetailForm}>
          <DialogContent>
            <div className="mb-6">
              <ItemDetailForm addItemToGrid={addItemToGrid} />
            </div>
          </DialogContent>
        </Dialog>
      )} */}

      {/* <div className="my-6">
        <ItemDetailGrid itemDetails={itemDetails} setItemDetails={setItemDetails} />
      </div> */}

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





