import { Button } from "@/components/ui/button";
import type {PO} from "@/components/purchase-order-comp/purchase-order";
interface PurchaseOrderTableProps {
  orders: PO[];
  onEdit: (order: PO) => void;
}

const PurchaseOrderTable = ({ orders, onEdit }: PurchaseOrderTableProps) => {
    const statusNoes = [
    { label: "Initialised", value: 1 },
    { label: "Authorised", value: 2 },
  ];

  
  
  return (
    <table className="w-full border border-gray-150 rounded shadow-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-2 border">Sr No.</th>
          <th className="p-2 border">PO No</th>
          <th className="p-2 border">PO Date</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Supplier Location</th>
          <th className="p-2 border">Net Amount</th>
          <th className="p-2 border">Action</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order, index) => {
          const statusNo = statusNoes.find((ut) => ut.value === Number(order.statusNo));
          return(
          <tr key={order.poId}>
            <td className="p-2 border">{index + 1}</td>
            <td className="p-2 border">{order.poNo}</td>
            <td className="p-2 border">{order.poDate.toLocaleString()}</td>
            <td className="p-2 border">{statusNo?.label}</td>
            <td className="p-2 border">
              {order.bpName
                ? `${order.bpName} (${order.bpCode}) – ${order.bpAddress}`
                : order.supplierLocationNo}
            </td>


            <td className="p-2 border">{Number(order.netAmount).toFixed(2)}</td>
            <td className="p-2 border">
              <Button onClick={() => onEdit(order)} variant="outline">
                Edit
              </Button>
            </td>
          </tr>
        );
      })}
      </tbody>
    </table>
  );
};

export default PurchaseOrderTable;

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import PurchaseOrderForm from "./purchase-order-form";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "@/lib/api";

// // interface PurchaseOrder {
// //   poId: number;
// //   poNo: string;
// //   poDate: string;
// //   statusNo: string;
// //   supplierLocationNo: string;
// //   netAmount: number;
// // }

// import type {PO} from "@/components/purchase-order-comp/purchase-order";

// interface PurchaseOrderTableProps {
//   orders: PO[];
//   onEdit: (order: PO) => void;
// } 
// const PurchaseOrderTable = ({ orders, onEdit }: PurchaseOrderTableProps) => {
//   const [showForm, setShowForm] = useState(false);
//   const [editData, setEditData] = useState<PO | null>(null);
//   const queryClient = useQueryClient();

//   const { data: orders = [], isLoading } = useQuery({
//     queryKey: ["purchase-orders"],
//     queryFn: async () => {
//       const res = await api.get("/purchase-order");
//       return res.data as PO[];
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: number) => {
//       await api.delete(`/purchase-order/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
//     },
//   });

  

//   const handleEdit = (order: PO) => {
//     setEditData(order);
//     setShowForm(true);
//   };

//   const handleDelete = async () => {
//     if (editData?.poId) {
//       await deleteMutation.mutateAsync(editData.poId);
//       setShowForm(false);
//       setEditData(null);
//     }
//   };

//   const handleFormSave = async (formData: PO) => {
//     try {
//       if (editData) {
//         await api.put(`/purchase-order/${editData.poId}`, formData);
//       } else {
//         await api.post("/purchase-order", formData);
//       }
//       queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
//       setShowForm(false);
//       setEditData(null);
//     } catch (error) {
//       console.error("Save failed", error);
//     }
//   };

//   return (
//     <div className="p-4">
//       <div className="flex justify-between mb-4">
//         <h2 className="text-xl font-semibold">Purchase Orders</h2>
//         <Button onClick={() => { setEditData(null); setShowForm(true); }}>Add Purchase Order</Button>
//       </div>

//       {showForm && (
//         <div className="mb-6">
//           <PurchaseOrderForm
//             defaultValues={editData}
//             onSubmit={handleFormSave}
//             onCancel={() => { setShowForm(false); setEditData(null); }}
//             onDelete={handleDelete}
//             isEdit={!!editData}
//           />
//         </div>
//       )}

//       {isLoading ? (
//         <p>Loading...</p>
//       ) : (
//         <table className="w-full border border-gray-200 rounded shadow-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 border">PO No</th>
//               <th className="p-2 border">PO Date</th>
//               <th className="p-2 border">Status</th>
//               <th className="p-2 border">Supplier Location</th>
//               <th className="p-2 border">Net Amount</th>
//               <th className="p-2 border">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr key={order.poId}>
//                 <td className="p-2 border">{order.poNo}</td>
//                 <td className="p-2 border">{order.poDate}</td>
//                 <td className="p-2 border">{order.statusNo}</td>
//                 <td className="p-2 border">{order.supplierLocationNo}</td>
//                 <td className="p-2 border">{order.netAmount.toFixed(2)}</td>
//                 <td className="p-2 border space-x-2">
//                   <Button onClick={() => handleEdit(order)} variant="outline">
//                     Edit
//                   </Button>
//                   <Button
//                     onClick={() => {
//                       if (order.poId !== undefined) {
//                         deleteMutation.mutate(order.poId);
//                       }
//                     }}
//                     variant="destructive"
//                   >
//                     Delete
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default PurchaseOrderTable;

