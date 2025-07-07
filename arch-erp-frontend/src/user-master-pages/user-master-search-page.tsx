import { useEffect, useState } from "react";
import UserMasterTable from "@/components/user-master-comp/user-master-table";
import type { User } from "@/components/user-master-comp/user-master-table";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function UserMasterSearchPage() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/user-master/users");
    setUsers(res.data as User[]);
  };

  const handleEdit = (user: User) => {
    navigate("/userMaster", { state: { editUser: user } });
  };

  const handleAdd = () => {
    navigate("/userMaster");
  };



  return (
    <div className="p-6">
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Search Users</h2>
        <div>
          <Button onClick={handleAdd} variant="outline" className="ml-auto">
            Add
          </Button>
        </div>
      </div>
      <UserMasterTable users={users} showAction onEdit={handleEdit} />
    </div>
  );
}

