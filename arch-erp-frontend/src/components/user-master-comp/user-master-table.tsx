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
      <table className="w-full border border-gray-150 dark:border-gray-700  rounded shadow-sm bg-white dark:bg-[#23272f]">
        <thead>
          <tr className="bg-gray-100 dark:bg-[#0c1932] text-left text-gray-900 dark:text-gray-100">
            <th className="p-2 border dark:border-gray-700">Sr No.</th>
            <th className="p-2 border dark:border-gray-700">Code</th>
            <th className="p-2 border dark:border-gray-700">Email ID</th>
            <th className="p-2 border dark:border-gray-700">User Type</th>
            {showAction && <th className="p-2 border dark:border-gray-700">Action</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            const userType = userTypes.find((ut) => ut.value === user.userType);
            return (
              <tr
                key={user.userId}
                className="hover:bg-gray-100 dark:hover:bg-orange-800 cursor-pointer text-gray-900 dark:text-gray-100"
                onClick={() => onRowClick?.(user)}
              >
                <td className="p-2 border dark:border-gray-700">{index+1}</td>
                <td className="p-2 border dark:border-gray-700">{user.code}</td>
                <td className="p-2 border dark:border-gray-700">{user.emailId}</td>
                <td className="p-2 border dark:border-gray-700">{userType?.label}</td>
                {showAction && (
                  <td className="p-2 border dark:border-gray-700 ">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="px-3 py-1 rounded text-sm transition-colors border border-gray-300 text-gray-900 bg-white hover:bg-gray-50
                     dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-white dark:border-transparent"
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

