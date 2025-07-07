import { useEffect, useState } from "react";
import GRNTable from "@/components/grn-comp/grn-table";
import type {GRN} from "@/components/grn-comp/grn";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function GRNSearchPage() {
  const [receipts, setReciepts] = useState<GRN[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    const res = await api.get("/grn");
    setReciepts(res.data as GRN[]);
  };

const handleEdit = async (receipt: GRN) => {
  console.log("res");
  try {
    const res = await api.get(`/grn/${receipt.grnId}`);
    console.log("res",res.data);
    const fullReceipt = res.data; 

    navigate("/grn-page", {
      state: { editItem: fullReceipt },
    });
  } catch (err) {
    console.error("Failed to fetch full GRN data", err);
  }
};

  const handleAdd = () => {
    navigate("/grn-page");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Search Good Receipt Note</h2>
        <div className="space-x-2">
          <Button onClick={handleAdd} variant="outline">Add</Button>
        </div>
      </div>
      <GRNTable receipts={receipts} onEdit={handleEdit} />
    </div>
  );
}



// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Form, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import ComboBox from "@/components/purchase-order-comp/combo-box";
// import { useQuery } from "@tanstack/react-query";
// import { api } from "@/lib/api";
// import { toast } from "react-hot-toast";
// import ItemDetailGrid from "@/components/purchase-order-comp/item-detail-grid";
// import TaxDetailGrid from "@/components/purchase-order-comp/tax-detail-grid";
// import PurchaseOrderTable from "@/components/purchase-order-comp/purchase-order-table";

// interface BusinessPartner {
//   id: string;
//   name: string;
//   location: string;
// }

// interface ItemDetail {
//   itemCode: string;
//   unit: string;
//   quantity: number;
//   rate: number;
//   amount: number;
// }

// interface TaxDetail {
//   taxName: string;
//   nature: string;
//   amount: number;
// }

// interface PurchaseOrderResponse {
//   poId: string;
// }

// const statusOptions = ["Initialised", "Authorised"] as const;

// const formSchema = z.object({
//   poNo: z.string().min(1, "PO Number is required"),
//   poDate: z.date().min(1, "PO Date is required"),
//   statusNo: z.enum(statusOptions),
//   supplierLocationNo: z.string().min(1, "Supplier Location is required"),
//   netAmount: z.number(),
// });

// export default function PurchaseOrderSearchPage() {
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       poNo: "",
//       poDate: new Date().toISOString().split("T")[0],
//       statusNo: statusOptions[0],
//       supplierLocationNo: "",
//       netAmount: 0,
//     },
//   });

//   const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
//   const [taxDetails, setTaxDetails] = useState<TaxDetail[]>([]);

//   const { data: businessPartners = [] } = useQuery({
//     queryKey: ["businessPartners"],
//     queryFn: async () => {
//       const res = await api.get("/business-partner");
//       return res.data as BusinessPartner[];
//     },
//   });

//   const handleSubmit = async (data: any) => {
//     try {
//       const res = await api.post<PurchaseOrderResponse>("/purchase-orders", {
//         ...data,
//         netAmount: data.netAmount,
//       });
//       const poId = res.data.poId;

//       await Promise.all(itemDetails.map((item) =>
//         api.post(`/purchase-orders/${poId}/item-details`, item)
//       ));

//       await Promise.all(taxDetails.map((tax) =>
//         api.post(`/purchase-orders/${poId}/tax-details`, tax)
//       ));

//       toast.success("Purchase Order saved successfully");
//     } catch (error) {
//       toast.error("Error saving Purchase Order");
//     }
//   };

//   useEffect(() => {
//     const totalItemAmount = itemDetails.reduce((sum, item) => sum + item.amount, 0);
//     const totalTaxAmount = taxDetails.reduce((sum, tax) => sum + tax.amount, 0);
//     const net = totalItemAmount + totalTaxAmount;
//     form.setValue("netAmount", net);
//   }, [itemDetails, taxDetails, form]);

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
//           <FormField
//             control={form.control}
//             name="poNo"
//             render={({ field }) => (
//               <>
//                 <FormLabel>PO Number</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="poDate"
//             render={({ field }) => (
//               <>
//                 <FormLabel>PO Date</FormLabel>
//                 <FormControl>
//                   <Input type="date" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="statusNo"
//             render={({ field }) => (
//               <>
//                 <FormLabel>Status</FormLabel>
//                 <FormControl>
//                   <select {...field} className="w-full border p-2 rounded">
//                     <option value="Initialised">Initialised</option>
//                     <option value="Authorised">Authorised</option>
//                   </select>
//                 </FormControl>
//                 <FormMessage />
//               </>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="supplierLocationNo"
//             render={({ field }) => (
//               <>
//                 <FormLabel>Supplier Location</FormLabel>
//                 <FormControl>
//                   <ComboBox
//                     options={businessPartners.map((bp) => ({
//                       label: `${bp.name} - ${bp.location}`,
//                       value: bp.id,
//                     }))}
//                     defaultValue={field.value}
//                     onChange={(value: string | number) => field.onChange(value)}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="netAmount"
//             render={({ field }) => (
//               <>
//                 <FormLabel>Net Amount</FormLabel>
//                 <FormControl>
//                   <Input value={field.value.toFixed(2)} readOnly />
//                 </FormControl>
//                 <FormMessage />
//               </>
//             )}
//           />

//           <div className="flex justify-end">
//             <Button type="submit">Save Purchase Order</Button>
//           </div>
//         </form>
//       </Form>

//       <ItemDetailGrid itemDetails={itemDetails} setItemDetails={setItemDetails} />
//       <TaxDetailGrid taxDetails={taxDetails} setTaxDetails={setTaxDetails} />
//     </div>
//   );
// }

