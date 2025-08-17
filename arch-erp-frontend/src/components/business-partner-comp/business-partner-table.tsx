import { Button } from "@/components/ui/button";

export interface BusinessPartner {
  bpId: number;
  bpCode: string;
  bpName: string;
  bpType: string;
  bpAddress: string;
  pin: string;
  state: string;
  city: string;
  country: string;
}

interface BusinessPartnerTableProps {
  businessPartners: BusinessPartner[];
  onRowClick?: (businessPartner: BusinessPartner) => void;
  showAction?: boolean;
  onEdit?: (businessPartner: BusinessPartner) => void;
}

export default function BusinessPartnerTable({
  businessPartners,
  onRowClick,
  showAction = false,
  onEdit,
}: BusinessPartnerTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-150 dark:border-gray-700 rounded shadow-sm bg-white dark:bg-[#23272f]">
        <thead>
          <tr className=" bg-gray-100 dark:bg-[#0c1932] text-left text-gray-900 dark:text-gray-100">
            <th className="p-2 border dark:border-gray-700">Sr No.</th>
            <th className="p-2 border dark:border-gray-700">BP Code</th>
            <th className="p-2 border dark:border-gray-700">BP Name</th>
            <th className="p-2 border dark:border-gray-700">BP Type</th>
            <th className="p-2 border dark:border-gray-700">BP Address</th>
            <th className="p-2 border dark:border-gray-700">Pin</th>
            <th className="p-2 border dark:border-gray-700">State</th>
            <th className="p-2 border dark:border-gray-700">City</th>
            <th className="p-2 border dark:border-gray-700">Country</th>
            {showAction && <th className="p-2 border dark:border-gray-700">Action</th>}
          </tr>
        </thead>
        <tbody>
          {businessPartners.map((businessPartner, index) => (
            <tr
              key={businessPartner.bpId}
              className={
                
                " hover:bg-gray-100 dark:hover:bg-orange-800 cursor-pointer text-gray-900 dark:text-gray-100"
              }
              onClick={() => onRowClick?.(businessPartner)}
            >
              <td className="p-2 border dark:border-gray-700">{index + 1}</td>
              <td className="p-2 border dark:border-gray-700">{businessPartner.bpCode}</td>
              <td className="p-2 border dark:border-gray-700">{businessPartner.bpName}</td>
              <td className="p-2 border dark:border-gray-700">{businessPartner.bpType}</td>
              <td className="p-2 border dark:border-gray-700">{businessPartner.bpAddress}</td>
              <td className="p-2 border dark:border-gray-700">{businessPartner.pin}</td>
              <td className="p-2 border dark:border-gray-700">{businessPartner.state}</td>
              <td className="p-2 border dark:border-gray-700">{businessPartner.city}</td>
              <td className="p-2 border dark:border-gray-700">{businessPartner.country}</td>
              {showAction && (
                <td className="p-2 border dark:border-gray-700 flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="px-3 py-1 rounded text-sm transition-colors border border-gray-300 text-gray-900 bg-white hover:bg-gray-50
                    dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-white dark:border-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(businessPartner);
                    }}
                  >
                    Edit
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
