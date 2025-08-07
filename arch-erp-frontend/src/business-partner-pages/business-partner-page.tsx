import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PartnerHeader from "@/components/business-partner-comp/partner-header";
import BusinessPartnerForm from "@/components/business-partner-comp/business-partner-form";
import type { BusinessPartnerFormData } from "@/components/business-partner-comp/business-partner-form";
import { api } from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

//import {useAuth} from "@/components/login-comp/auth-context";

export default function BusinessPartnerPage() {
  const [errData, setErrData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<{ reset: () => void }>(null);
  //const { user } = useAuth();
  const token = localStorage.getItem('2081......token'); 
  // If coming from search page with editBusinessPartner, use it
  const [editBusinessPartner, setEditBusinessPartner] = useState<any>(location.state?.editBusinessPartner || null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<() => void>(() => {});
  const [isDelete, setIsDelete] = useState(false);
  // Enable delete only when editing
  const deleteEnabled = !!editBusinessPartner;

  // When location.state changes (navigated from search), update editBusinessPartner
  useEffect(() => {
    if (location.state?.editBusinessPartner) {
      setEditBusinessPartner(location.state.editBusinessPartner);
      // Clear state after using it, so form doesn't stay filled after navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Save or update
  const handleFormSubmit = async (data: BusinessPartnerFormData) => {
    console.log("forsubmit")
    if (editBusinessPartner && editBusinessPartner.bpId) {
      try{await api.put(`/business-partner/partner/${editBusinessPartner.bpId}`, {
        ...data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch(err : Error | any){
          console.log(err);
          setErrData(()=>{
            return {bpCode : err.response.data.message};
          })
          return;
      }
    }
    
    else {
      try{ await api.post("/business-partner/partner", {
        ...data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch(err : Error | any){
          console.log(err);
          setErrData(()=>{
            return {bpCode : err.response.data.message};
          })
          return;
      }
    }
    setEditBusinessPartner(null); // Clear form after save/update
    formRef.current?.reset();
    setErrData({});
  };

  // Clear and add new entry on click + button
  const handleClear = () =>{
    setEditBusinessPartner(null);
    formRef.current?.reset();
    console.log("clear")
    setErrData({});
  }

  // Delete
  const handleDelete = async () => {
    if (editBusinessPartner && editBusinessPartner.bpId) {
      await api.delete(`/business-partner/partner/${editBusinessPartner.bpId}`);
      setErrData({});
      setEditBusinessPartner(null); // Clear form after delete
      formRef.current?.reset();
    }
  };

  // Search button
  const handleSearch = () => {
    navigate("/businessPartner-search");
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setIsDelete(false);
  };

  const handleDialogOpen = () => {
    console.log("dialog-->")
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
      <PartnerHeader
        onAdd={handleClear}
        onSearch={handleSearch}
        onDelete={() =>{
          setIsDelete(true);
          handleDialogOpen();
          setDialogAction(()=>()=>handleDelete());
        }}
        deleteEnabled={deleteEnabled}
        isEdit={!!editBusinessPartner}
      />
      <BusinessPartnerForm
        ref={formRef}
        defaultValues={
          editBusinessPartner
            ? {
                bpCode: editBusinessPartner.bpCode,
                bpName: editBusinessPartner.bpName,
                bpType: editBusinessPartner.bpType,
                bpAddress: editBusinessPartner.bpAddress,
                pin: String(editBusinessPartner.pin),
                state: editBusinessPartner.state,
                city: editBusinessPartner.city,
                country: editBusinessPartner.country,
              }
            : undefined
        }
        onSubmit={(data) =>{
            console.log("dialog-->")
            setIsDelete(false);
            handleDialogOpen();
            setDialogAction(()=>()=>handleFormSubmit(data));
          }}
        isEdit={!!editBusinessPartner}
        errData={errData}
      />
      <Dialog open={openDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="p-6">
          <p className="text-xl font-semibold">
            {isDelete ? "delete" :editBusinessPartner ? "update" : "Save"} Business Partner 
          </p>
          <p className="mt-4">
            Are you sure you want to {isDelete ? "delete" : (editBusinessPartner ? "update" : "Save")} this Business Partner?
          </p>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              className="ml-4"
              onClick={handleDialogConfirm}
            >
              {isDelete ? "delete" :editBusinessPartner ? "update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
