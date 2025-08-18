import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Header from "@/components/item-master-comp/header";
import ItemMasterForm from "@/components/item-master-comp/item-master-form";
import type { ItemFormData } from "@/components/item-master-comp/item-master-form";
import { api } from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

// import { log } from "console";
//import {useAuth} from "@/components/login-comp/auth-context";


export default function ItemMasterPage() {
  const [errData, setErrData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<{ reset: () => void }>(null);
  //const { user } = useAuth();
  const token = localStorage.getItem('token'); 
  // If coming from search page with editItem, use it
  const [editItem, setEditItem] = useState<any>(location.state?.editItem || null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<() => void>(() => {});
  const [isDelete, setIsDelete] = useState(false);

  // Enable delete only when editing
  const deleteEnabled = !!editItem;
  
  // When location.state changes (navigated from search), update editItem
  useEffect(() => {
    if (location.state?.editItem) {
      setEditItem(location.state.editItem);
      // Clear state after using it, so form doesn't stay filled after navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  console.log("editItem--->", editItem)
  console.log(editItem);

  // Save or update
  const handleFormSubmit = async (data: ItemFormData) => {
    //const today = new Date().toISOString().slice(0, 10);
    console.log("forsubmit")
    if (editItem && editItem.itemId) {
      try{await api.put(`/item-master/items/${editItem.itemId}`, {
        ...data,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        
        // modifiedBy: user?.userId,         // use token userId
        // modifiedDate: today,
      });
      }
      catch (err: Error | any) {
        console.error(err);
        const backendErrors = err?.response?.data?.errors || {};
        setErrData(backendErrors); 
        return;
      }
      
    } else {
      try{
        console.log("data")
        await api.post("/item-master/items", {
        ...data,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        // createdBy: user?.userId,         // use token userId
        // createdDate: today,
      });
      }
      catch (err: Error | any) {
        console.error(err);
        const backendErrors = err?.response?.data?.errors || {};
        setErrData(backendErrors); 
        return;
      }
      
    }
    setEditItem(null); // Clear form after save/update
    formRef.current?.reset();
    setErrData({});
  };



  // Clear and add new entry on click + button
  const handleClear = () =>{
    // {editItem ? "update" : "Save"}
    setEditItem(null);
    formRef.current?.reset();
    console.log("clear")
    setErrData({});
  }


  // Delete
  const handleDelete = async () => {
    if (editItem && editItem.itemId) {
      await api.delete(`/item-master/items/${editItem.itemId}`);
      setErrData({});
      setEditItem(null); // Clear form after delete
      formRef.current?.reset();
    }
  };

  // Search button
  const handleSearch = () => {
    navigate("/itemMaster-search");
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setIsDelete(false);
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
    <div className="p-6 w-full min-h-screen bg-gray-100 dark:bg-[#18181b] transition-colors">
      <Header
        onAdd={handleClear}
        onSearch={handleSearch}
        onDelete={() =>{
          setIsDelete(true);
          handleDialogOpen();
          setDialogAction(()=>()=>handleDelete());
        }}
        deleteEnabled={deleteEnabled}
        isEdit={!!editItem}
      />
      <ItemMasterForm
        ref={formRef}
        defaultValues={
          editItem
            ? {
                itemCode: editItem.itemCode,
                itemName: editItem.itemName, 
                unit: editItem.unit,
              }
            : undefined
        }
        onSubmit= {
          (data) =>{
            setIsDelete(false);
            handleDialogOpen();
            setDialogAction(()=>()=>handleFormSubmit(data));
          }
        }
        
        isEdit={!!editItem}
        errData={errData}
        //setErrData={setError}
      />
      <Dialog open={openDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="p-6">
          <p className="text-xl font-semibold">
            {isDelete ? "delete" :editItem ? "update" : "Save"} Item
          </p>
          <p className="mt-4">
            Are you sure you want to {isDelete ? "delete" : (editItem ? "update" : "Save")} this item?
          </p>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              className="ml-4"
              onClick={handleDialogConfirm}
            >
              {isDelete ? "delete" :editItem ? "update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}




