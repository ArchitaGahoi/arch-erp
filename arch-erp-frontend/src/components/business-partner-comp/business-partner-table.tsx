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
      <table className="min-w-full bg-white border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">BP ID</th>
            <th className="p-2 border">BP Code</th>
            <th className="p-2 border">BP Name</th>
            <th className="p-2 border">BP Type</th>
            <th className="p-2 border">BP Address</th>
            <th className="p-2 border">Pin</th>
            <th className="p-2 border">State</th>
            <th className="p-2 border">City</th>
            <th className="p-2 border">Country</th>
            {showAction && <th className="p-2 border">Action</th>}
          </tr>
        </thead>
        <tbody>
          {businessPartners.map((businessPartner) => (
            <tr
              key={businessPartner.bpId}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(businessPartner)}
            >
              <td className="p-2 border">{businessPartner.bpId}</td>
              <td className="p-2 border">{businessPartner.bpCode}</td>
              <td className="p-2 border">{businessPartner.bpName}</td>
              <td className="p-2 border">{businessPartner.bpType}</td>
              <td className="p-2 border">{businessPartner.bpAddress}</td>
              <td className="p-2 border">{businessPartner.pin}</td>
              <td className="p-2 border">{businessPartner.state}</td>
              <td className="p-2 border">{businessPartner.city}</td>
              <td className="p-2 border">{businessPartner.country}</td>
              {showAction && (
                <td className="p-2 border">
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onEdit?.(businessPartner); }}>
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
