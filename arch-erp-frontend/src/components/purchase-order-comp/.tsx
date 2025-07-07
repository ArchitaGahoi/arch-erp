


// // components/purchase-order-comp/purchase-order-form.tsx
// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { FormField, FormLabel, FormControl } from "@/components/ui/form";
// import ItemDetailGrid from "./item-detail-grid";
// import TaxDetailGrid from "./tax-detail-grid";
// import type {PO} from "@/components/purchase-order-comp/purchase-order";
// //import { useMutation } from "@tanstack/react-query";
// //import { api } from "@/lib/api";

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

// // interface PurchaseOrder {
// //   poId?: number;
// //   poNo: string;
// //   poDate: string;
// //   statusNo: string;
// //   supplierLocationNo: string;
// //   netAmount: number;
// // }

// interface PurchaseOrderFormProps {
//   defaultValues?: PO | null;
//   onSubmit: (data: PO) => Promise<void>;
//   onCancel: () => void;
//   isEdit?: boolean;
//   onDelete: () => Promise<void>;
// }

// const PurchaseOrderForm = ({
//   defaultValues,
//   onSubmit,
//   onCancel,
//   isEdit,
//   onDelete,
// }: PurchaseOrderFormProps) => {
//   const [poNo, setPoNo] = useState("");
//   const [poDate, setPoDate] = useState(new Date());
//   const [statusNo, setStatusNo] = useState("Initialised");
//   const [supplierLocationNo, setSupplierLocationNo] = useState("");
//   const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
//   const [taxDetails, setTaxDetails] = useState<TaxDetail[]>([]);

//   useEffect(() => {
//     if (defaultValues) {
//       setPoNo(defaultValues.poNo);
//       setPoDate(new Date(defaultValues.poDate));
//       setStatusNo(defaultValues.statusNo);
//       setSupplierLocationNo(defaultValues.supplierLocationNo);
//     }
//   }, [defaultValues]);

//   const netAmount =
//     itemDetails.reduce((sum, item) => sum + item.amount, 0) +
//     taxDetails.reduce((sum, item) => sum + item.amount, 0);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await onSubmit({
//       poNo,
//       poDate: poDate.toISOString().split("T")[0],
//       statusNo,
//       supplierLocationNo,
//       netAmount,
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
//       <FormField
//         name="poNo"
//         render={() => (
//           <div className="grid grid-cols-3 items-center gap-2">
//             <FormLabel>PO Number</FormLabel>
//             <FormControl>
//               <Input
//                 value={poNo}
//                 onChange={(e) => setPoNo(e.target.value)}
//                 placeholder="Enter PO Number"
//               />
//             </FormControl>
//           </div>
//         )}
//       />
//       <FormField
//         name="poDate"
//         render={() => (
//           <div className="grid grid-cols-3 items-center gap-2">
//             <FormLabel>PO Date</FormLabel>
//             <FormControl>
//               <Input
//                 type="date"
//                 value={poDate.toISOString().split("T")[0]}
//                 onChange={(e) => setPoDate(new Date(e.target.value))}
//               />
//             </FormControl>
//           </div>
//         )}
//       />
//       <FormField
//         name="statusNo"
//         render={() => (
//           <div className="grid grid-cols-3 items-center gap-2">
//             <FormLabel>Status</FormLabel>
//             <FormControl>
//               <select
//                 className="w-full border border-gray-300 rounded p-2"
//                 value={statusNo}
//                 onChange={(e) => setStatusNo(e.target.value)}
//               >
//                 <option value="Initialised">Initialised</option>
//                 <option value="Authorised">Authorised</option>
//               </select>
//             </FormControl>
//           </div>
//         )}
//       />
//       <FormField
//         name="supplierLocationNo"
//         render={() => (
//           <div className="grid grid-cols-3 items-center gap-2">
//             <FormLabel>Supplier Location</FormLabel>
//             <FormControl>
//               <Input
//                 placeholder="Enter Supplier Location"
//                 value={supplierLocationNo}
//                 onChange={(e) => setSupplierLocationNo(e.target.value)}
//               />
//             </FormControl>
//           </div>
//         )}
//       />
//       <FormField
//         name="netAmount"
//         render={() => (
//           <div className="grid grid-cols-3 items-center gap-2">
//             <FormLabel>Net Amount</FormLabel>
//             <FormControl>
//               <Input value={netAmount.toFixed(2)} readOnly />
//             </FormControl>
//           </div>
//         )}
//       />

//       <ItemDetailGrid itemDetails={itemDetails} setItemDetails={setItemDetails} />
//       <TaxDetailGrid taxDetails={taxDetails} setTaxDetails={setTaxDetails} />

//       <div className="flex justify-end gap-4">
//         <Button type="submit">{isEdit ? "Update" : "Save"}</Button>
//         <Button type="button" onClick={onCancel} variant="outline">
//           Cancel
//         </Button>
//         {isEdit && (
//           <Button type="button" onClick={onDelete} variant="destructive">
//             Delete
//           </Button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default PurchaseOrderForm;
