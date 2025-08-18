import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserHeader from "@/components/user-master-comp/user-header";
import UserMasterForm from "@/components/user-master-comp/user-master-form";
import type { userFormData } from "@/components/user-master-comp/user-master-form";
import { api } from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function UserMasterPage() {
  const [errData, setErrData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef<{ reset: () => void }>(null);
  //const token = localStorage.getUser("token");
  // If coming from search page with editUser, use it
  const [editUser, setEditUser] = useState<any>(location.state?.editUser || null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<() => void>(() => {});
  const [isDelete, setIsDelete] = useState(false);

  // Enable delete only when editing
  const deleteEnabled = !!editUser;

  // When location.state changes (navigated from search), update editUser
  useEffect(() => {
    if (location.state?.editUser) {
      setEditUser(location.state.editUser);
      // Clear state after using it, so form doesn't stay filled after navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // const validate = (data: any) => {
  //   console.log("hh");
  //   if (!data.code) {
  //     setErrData(()=>{
  //             return {code : "User Code is required"};
  //           })
  //   }
  //   if (!data.emailId) {
  //      setErrData(()=>{
  //             return {emailId : "User Email is required"};
  //           })
  //   }
  //   if (!data.password) {
  //      setErrData(()=>{
  //             return {password : "User Password is required"};
  //           })
  //   }
  //   if (!data.userType) {
  //      setErrData(()=>{
  //             return {userType : "User Type is required"};
  //           })
  //   }

  //   console.log(errData);

  //   if (Object.keys(errData).length > 0) 
  //     {return false}
  //   else
  //     {return true}
  // };

  // Save or update
  
  const validate = (data: any) => {
    const newErrors: any = {};
    if (!data.code) newErrors.code = "User Code is required";
    if (!data.emailId) newErrors.emailId = "User Email is required";
    if (!data.password && !editUser) newErrors.password = "User Password is required";
    if (!data.userType) newErrors.userType = "User Type is required";

    setErrData(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const mapUserType = (type: string) => {
    if (type === "admin") return 1;
    if (type === "general") return 2;
    return null;
  };
  const handleFormSubmit = async (data: userFormData) => {
    console.log("kk")
    if (!validate(data)) return;

    const userTypeAsInt = mapUserType(data.userType);

    const transformedData = {
      ...data,
      userType: userTypeAsInt,
    };

    // if (editUser && editUser.userId) {

    //   try{
    //     await api.put(`/user-master/users/${editUser.userId}`, transformedData);
        
    //     console.log("data");
    // } 
    // catch(err : Error | any){
    //       console.log(err);
    //       setErrData(()=>{
    //         return {code : err.response.data.message};
    //       })
    //       return;
    //   }
    // }
    // else {
    //   try{ 
    //     await api.post("/user-master/users", transformedData);
    
    //   } catch(err: Error | any){
    //       console.log(err);
    //       setErrData(()=>{
    //         return {code : err.response.data.message};
    //       })
    //       return;
    //     }
    // }  

    // setEditUser(null); // Clear form after save/update
    // formRef.current?.reset();  
    // setErrData({});

    try {
      if (editUser && editUser.userId) {
        await api.put(`/user-master/users/${editUser.userId}`, transformedData);
      } else {
        await api.post("/user-master/users", transformedData);
      }

      setEditUser(null);
      formRef.current?.reset();
      setErrData({});
    } catch (err: Error | any) {
      console.error(err);
      const backendErrors = err?.response?.data?.errors || {};
      setErrData(backendErrors);
    }
  
  
  };

  
  // Clear and add new entry on click + button
  const handleClear = () =>{
    setEditUser (null);
    formRef.current?.reset();
    console.log("clear")
    setErrData({});
  }


  // Delete
  const handleDelete = async () => {
    if (editUser && editUser.userId) {
      await api.delete(`/user-master/users/${editUser.userId}`);
      setErrData({});
      setEditUser(null); // Clear form after delete
      formRef.current?.reset();
    }
  };

  // Search button
  const handleSearch = () => {
    navigate("/userMaster-search");
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
      <UserHeader
        onAdd={handleClear}
        onSearch={handleSearch}
        onDelete={() =>{
          setIsDelete(true);
          handleDialogOpen();
          setDialogAction(()=>()=>handleDelete());
        }}
        deleteEnabled={deleteEnabled} 
        isEdit={!!editUser}
      />
      <UserMasterForm
        ref={formRef}
        defaultValues={
          editUser
            ? {
                code: editUser.code,
                emailId: editUser.emailId,
                userType: editUser.userType === 1 ? "admin" : "general",
                password: "",
              }
            : undefined
        }
        onSubmit={
          (data) =>{
            setIsDelete(false);
            handleDialogOpen();
            setDialogAction(()=>()=>handleFormSubmit(data));
          }
        }
        isEdit={!!editUser}
        disablePassword={!!editUser} 
        errData={errData}
      />
      <Dialog open={openDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="p-6">
          <p className="text-xl font-semibold">
            {isDelete ? "delete" :editUser ? "update" : "Save"} User
          </p>
          <p className="mt-4">
            Are you sure you want to {isDelete ? "delete" : (editUser ? "update" : "Save")} this User?
          </p>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              className="ml-4"
              onClick={handleDialogConfirm}
            >
              {isDelete ? "delete" :editUser? "update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}




