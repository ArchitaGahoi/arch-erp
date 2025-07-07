import { useEffect, useState } from "react";
import BusinessPartnerTable from "@/components/business-partner-comp/business-partner-table";
import  type { BusinessPartner } from "@/components/business-partner-comp/business-partner-table";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function BusinessPartnerSearchPage() {
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinessPartners();
  }, []);

  const fetchBusinessPartners = async () => {
    const res = await api.get("/business-partner/partner");
    setBusinessPartners(res.data as BusinessPartner[]);
  };

  const handleEdit = (businessPartner: BusinessPartner) => {
    navigate("/businessPartner", { state: { editBusinessPartner: businessPartner } });
  };

  const handleAdd = () => {
    navigate("/businessPartner");
  };


  return (
    <div className="p-6">
    <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Search Business Partners</h2>
        <Button onClick={handleAdd} variant="outline" className="ml-auto">
            Add
        </Button>
      </div>
      <BusinessPartnerTable businessPartners={businessPartners} showAction onEdit={handleEdit} />
    </div>
  );
}
