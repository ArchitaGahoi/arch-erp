import { Button } from "@/components/ui/button";

export interface User {
  userId: number;
  code: string;
  emailId: string;
  userType: number;
}

interface UserMasterTableProps {
  users: User[];
  onRowClick?: (user: User) => void;
  showAction?: boolean;
  onEdit?: (user: User) => void;
}

export default function UserMasterTable({
  users,
  onRowClick,
  showAction = false,
  onEdit,
 }: UserMasterTableProps) {
  const userTypes = [
    { label: "Admin", value: 1 },
    { label: "General", value: 2 },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-150 rounded shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Sr No.</th>
            <th className="p-2 border">Code</th>
            <th className="p-2 border">Email ID</th>
            <th className="p-2 border">User Type</th>
            {showAction && <th className="p-2 border">Action</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            const userType = userTypes.find((ut) => ut.value === user.userType);
            return (
              <tr
                key={user.userId}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(user)}
              >
                <td className="p-2 border">{index+1}</td>
                <td className="p-2 border">{user.code}</td>
                <td className="p-2 border">{user.emailId}</td>
                <td className="p-2 border">{userType?.label}</td>
                {showAction && (
                  <td className="p-2 border">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(user);
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

