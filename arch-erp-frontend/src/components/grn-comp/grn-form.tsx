import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { Combobox } from "@headlessui/react";
//import axios from "axios";
import { api } from "@/lib/api";
import ItemDetailGrid from "./grn-item-detail-grid";

const formSchema = z.object({
  grnNo : z.string().min(1, "GR No is required").max(6, "GR No must be 6 characters long"),
  grnDate : z.date().min(new Date(), "GR Date must be today or before"),
  statusNo: z.enum(["Initialised", "Authorised"]).refine((val) => val !== undefined, {
    message: "Status is required",
  }),
  supplierLocationNo: z.string().min(1, "Supplier Location is required"),
  supplierLocationLabel: z.string().optional(),
  poNo: z.string().min(1, "PO No is required"),
  challanNo: z.string().min(1, "Challan No is required").max(6, "Challan No must be 6 characters long"),
  challanDate: z.date().min(new Date(), "Challan Date must be today or before"),
});

export type grnFormData = z.infer<typeof formSchema>;


interface grnFormProps {
  defaultValues?: grnFormData;
  //onSubmit: (data: purchaseOrderFormData) => void;
  isEdit?: boolean;
  //disableSave?: boolean;
  //onDelete?: () => Promise<void>;
  
  errData?: ErrorData;
  itemDetails: ItemDetail[];
  setItemDetails: (items: ItemDetail[]) => void;
  disableAll?: boolean;
  // onSupplierChange?: (supplierLocationNo: string) => void;
  // onPOChange?: (poNo: string) => void;
}

interface ErrorData {
  grnNo?: string;
  grnDate?: string;
  statusNo?: string;
  supplierLocationNo?: string;
  poNo?: string;
  challanNo?: string;
  challanDate?: string;
}

interface ItemDetail {
  poitemDetailId: number;
  itemName: string;
  poQuantity: number;
  preRecivedQuantity: number;
  balance: number;
  recivedQuantity: number;
  selected?: boolean;
}


const GRNForm = forwardRef(function grnForm(
  { defaultValues = { grnNo: "", grnDate: new Date(), statusNo: "Initialised", supplierLocationNo: "", poNo: "", challanNo: "", challanDate: new Date() },isEdit,  errData, itemDetails, setItemDetails, disableAll}: grnFormProps,
  ref: React.Ref<{ reset: () => void; getValues: () => any }>
) {
  console.log("defaultValues----", defaultValues)
  const form = useForm<grnFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      grnNo: "",
      grnDate: new Date(),
      statusNo: "Initialised",
      supplierLocationNo: "",
      poNo: "",
      challanNo: "",
      challanDate: new Date()
    },
  });

  useEffect(() => {
    if (defaultValues && isEdit) {
      form.reset(defaultValues);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    reset: () =>
      form.reset({
        grnNo: "",
        grnDate: new Date(),
        statusNo: "Initialised",
        supplierLocationNo: "",
        poNo: "",
        challanNo: "",
        challanDate: new Date()
      }),
      getValues: () => form.getValues(),
  }));

  

  const [query, setQuery] = useState("");
  const [supplierOptions, setSupplierOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [poOptions, setPoOptions] = useState<any[]>([]);
  


  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/business-partner/partner");
        console.log("ds",res);
        if (Array.isArray(res.data)) {
          setSupplierOptions(res.data);
        }
      } catch (err) {
        setSupplierOptions([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const filteredSuppliers =
    query === ""
      ? supplierOptions
      : supplierOptions.filter((partner) =>
          `${partner.bpName} (${partner.bpCode})`
            .toLowerCase()
            .includes(query.toLowerCase())
        );

  useEffect(() => {
  const supplierId = form.watch("supplierLocationNo");
  if (!supplierId) return;

  const fetchPOs = async () => {
    try {
      const res = await api.get(`/purchase-order/authorised/${supplierId}`);
      if (Array.isArray(res.data)) {
        setPoOptions(res.data);
      } else {
        setPoOptions([]);
      }
    } catch {
      setPoOptions([]);
    }
  };

  fetchPOs();
}, [form.watch("supplierLocationNo")]);


  const getErrorClass = (field: keyof ErrorData) =>
    (errData?.[field] || form.formState.errors[field]) ? "border-red-500" : "";
  console.log("field",form);
  return (
    <Form {...form}>
      <form className="grid gap-4 bg-white dark:bg-[#23272f] p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="grnNo"
            control={form.control}
            render={({ field }) => {
              
              return(
              <FormItem className={`flex-1 ${getErrorClass("grnNo")}`}>
                <FormLabel>GRN No</FormLabel>
                <FormControl>
                  
                  <Input className={`w-full border rounded-md p-2 ${
                      disableAll
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white"
                    }`}
                    {...form.register ("grnNo", { required: true })}
                    aria-invalid={errData?.grnNo ? "true" : "false"}
                    placeholder="GRN No" {...field}
                    onChange={(e) => {
                      if (!disableAll) {
                      field.onChange(e);
                      if (errData?.grnNo) errData.grnNo = ""; // clear this specific error
                      }
                    }}
                    maxLength={6} />
                </FormControl>
                {/* <FormMessage /> */}
                <div className="text-red-500 text-sm">{errData?.grnNo}</div>
              </FormItem>
            )}}
          />

          <FormField
            control={form.control}
            name="grnDate"
            render={({ field }) => (
              <div className="grid grid-cols-4 items-center gap-2">
                <FormLabel className="row-span-1">GRN Date</FormLabel>
                <FormControl className="row-span-1">
                  <Input className={`w-full border rounded-md p-2 ${
                      disableAll ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"
                    }`}
                    type="date"
                    value={field.value?.toISOString().split("T")[0] || ""}
                    onChange={(e) => {
                      if (!disableAll) {
                        field.onChange(new Date(e.target.value));
                      }
                    }}

                  />
                </FormControl>
                <FormMessage className="col-span-3 text-red-500 text-sm" />
              </div>
            )}
          />

          <FormField
            name="statusNo"
            control={form.control}
            render={({ field }) => {
              const statusOptions = ["Initialised", "Authorised"];
              const [statusQuery, setStatusQuery] = useState("");
              const filteredStatus =
                statusQuery === ""
                  ? statusOptions
                  : statusOptions.filter((status) =>
                      status.toLowerCase().includes(statusQuery.toLowerCase())
                    );

              return (
                <FormItem className={`flex-1 ${getErrorClass("statusNo")}`}>
                  <FormLabel>GRN Status</FormLabel>
                  <FormControl>
                    <Combobox value={field.value} onChange={field.onChange} disabled={disableAll}>
                      <div className="relative">
                        <Combobox.Input
                          disabled={disableAll}
                          className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
                          dark:bg-gray-800 dark:text-gray-100 dark:border-gray-400
                          focus:outline-none focus:border-blue-500 
                          hover:border-blue-400
                          dark:focus:border-blue-400 dark:hover:border-blue-300
                          ${getErrorClass("statusNo") || ""} 
                          ${disableAll ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""}`}
                          onChange={(e) => {
                            if (!disableAll) {
                              field.onChange(e.target.value);
                              setStatusQuery(e.target.value);
                            }
                          }}
                          displayValue={(val: string) => val}
                          placeholder="Select GRN Status"
                        />
                        {!disableAll && filteredStatus.length > 0 && (
                          <Combobox.Options className="absolute z-10 w-full bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredStatus.map((status, index) => (
                              <Combobox.Option
                                key={index}
                                value={status}
                                className={({ selected }) =>
                                  `cursor-pointer px-4 py-2 ${
                                    selected
                                      ? "bg-blue-500 text-white dark:bg-blue-700"
                                      : "bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100"
                                  }`
                                }
                              >
                                {status}
                              </Combobox.Option>
                            ))}
                          </Combobox.Options>
                        )}
                      </div>
                    </Combobox>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            name="supplierLocationNo"
            control={form.control}
            render={({ field }) => (
              <FormItem className={`flex-1 ${getErrorClass("supplierLocationNo")}`}>
                <FormLabel>Supplier Location</FormLabel>
                <FormControl>
                  <Combobox value={field.value} onChange={(val) => {
                    field.onChange(val); 
                    // onSupplierChange?.(val);
                  }} disabled={disableAll}>
                    <div className="relative">
                      <Combobox.Input
                        // {...form.register ("supplierLocationNo", { required: true })}
                        // aria-invalid={errData?. supplierLocationNo? "true" : "false"}
                        className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
                        dark:bg-gray-800 dark:text-gray-100 dark:border-gray-400
                        focus:outline-none focus:border-blue-500 
                        hover:border-blue-400
                        dark:focus:border-blue-400 dark:hover:border-blue-300
                        ${getErrorClass("supplierLocationNo") || ""} 
                        ${disableAll ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""}`}
                        onChange={(e) => {
                          if (!disableAll) setQuery(e.target.value);
                          if (errData?.supplierLocationNo) errData.supplierLocationNo = "";
                        }}// 
                        displayValue={(val: string | number) => {
                          if (!val) return '';
                          const selected = supplierOptions.find(p => p.bpId === val);
                          return selected
                            ? `${selected.bpName} (${selected.bpCode}) (${selected.bpAddress})`
                            : (defaultValues?.supplierLocationLabel || '');
                        }}
                        placeholder="Select Supplier Location"
                      />
                      {!disableAll && filteredSuppliers.length > 0 && (
                        <Combobox.Options className="absolute z-10 w-full bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredSuppliers.map((partner) => (
                            <Combobox.Option key={partner.bpId} value={partner.bpId}>
                              {partner.bpName} ({partner.bpCode}) ({partner.bpAddress})
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                </FormControl>
                <div className="text-red-500 text-sm">{errData?.supplierLocationNo}</div>
              </FormItem>
            )}
          />

          <FormField
            name="poNo"
            control={form.control}
            render={({ field }) => (
              <FormItem className={`flex-1 ${getErrorClass("poNo")}`}>
                <FormLabel>PO No</FormLabel>
                <FormControl>
                  <Combobox 
                    {...form.register ("poNo", { required: true })}
                    aria-invalid={errData?.poNo ? "true" : "false"}
                    value={field.value} 
                    onChange={async(val) => {
                      if (!disableAll) {
                         field.onChange(val);
                      // if (isEdit) return;
                     const selectedPO = poOptions.find(po => po.poNo === val);
                     
                    if (!selectedPO?.poId) {
                      console.warn("PO ID not found for selected PO No:", val);
                      return;
                    }
                    //form.setValue("supplierLocationNo", selectedPO.poId);

                    // try {
                    //   const res = await api.get(`/purchase-order/${selectedPO.poId}`);
                    //   if (res.data?.itemDetails) {
                    //     const items = res.data.itemDetails.map((item: any) => ({
                    //     poitemDetailId: item.itemDetailId,   
                    //     itemName: item.itemName,
                    //     poQuantity: item.quantity,          
                    //     preRecivedQuantity: item.preRecivedQuantity || 0,
                    //     balance: (item.quantity - item.preRecivedQuantity) || item.quantity,
                    //     recivedQuantity: item.recivedQuantity || 0,
                    //     selected: false
                    //   }));

                    //     setItemDetails(items);
                    //   }
                    // } catch (err) {
                    //   console.error("Error fetching PO item details by ID", err);
                    //   setItemDetails([]);
                    // }

                    try {
                      const res = await api.get(`/grn/items/${selectedPO.poNo}`);
                      if (Array.isArray(res.data)) {
                        const items = res.data.map((item: any) => ({
                          poitemDetailId: item.poitemDetailId,
                          itemName: item.itemName,
                          poQuantity: item.poQuantity,
                          preRecivedQuantity: item.preRecivedQuantity || 0,
                          balance: item.balance || (item.poQuantity - (item.preRecivedQuantity || 0)),
                          recivedQuantity: 0,   // always start fresh when creating a new GRN
                          selected: false
                        }));
                        console.log("Fetched items:", items);
                        setItemDetails(items);
                      } else {
                        setItemDetails([]);
                      }
                    } catch (err) {
                      console.error("Error fetching PO item details by PO No", err);
                      setItemDetails([]);
                    }

                    // onPOChange?.(val);
                        if (errData?.poNo) errData.poNo = "";
                      }
                  }}
                    disabled={disableAll}
                  >
                    <div className="relative">
                      <Combobox.Input
                        className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
                        dark:bg-gray-800 dark:text-gray-100 dark:border-gray-400
                        focus:outline-none focus:border-blue-500 
                        hover:border-blue-400
                        dark:focus:border-blue-400 dark:hover:border-blue-300
                        ${getErrorClass("poNo") || ""} 
                        ${disableAll ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""}`}
                        onChange={(e) => {
                          if (!disableAll) {
                          setQuery(e.target.value);
                          if (errData?.poNo) errData.poNo = "";
                          }
                        }} 
                        displayValue={(val: string) => val}
                        placeholder="Select PO No"
                        disabled={disableAll}
                      />
                      {!disableAll && poOptions.length > 0 && (
                        <Combobox.Options className="absolute z-10 w-full bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                          {poOptions.map((po) => (
                            <Combobox.Option key={po.poId} value={po.poNo}>
                              {po.poNo}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                </FormControl>
                <div className="text-red-500 text-sm">{errData?.poNo}</div>
              </FormItem>
              
            )}
          />
          <FormField
            name="challanNo"
            control={form.control}
            render={({ field }) => (
              <FormItem className={`flex-1 ${getErrorClass("challanNo")}`}>
                <FormLabel>Challan No</FormLabel>
                <FormControl>
                  <Input
                    className={`w-full border rounded-md p-2 ${
                      disableAll ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"
                    }`}
                    {...field}
                    value={field.value || ""}
                    placeholder="Challan No"
                    maxLength={6}
                    {...form.register ("challanNo", { required: true })}
                    aria-invalid={errData?.challanNo ? "true" : "false"}
                    onChange={(e) => {
                      if (!disableAll) {
                      field.onChange(e);
                      if (errData?.challanNo) errData.challanNo = "";
                      }
                    }}
                  />
                </FormControl>
                <div className="text-red-500 text-sm">{errData?.challanNo}</div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="challanDate"
            render={({ field }) => (
              <div className="grid grid-cols-4 items-center gap-2">
                <FormLabel className="row-span-1">Challan Date</FormLabel>
                <FormControl className="row-span-1">
                  <Input className={`w-full border rounded-md p-2 ${
                      disableAll ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white"
                    }`}
                    type="date"
                    value={field.value?.toISOString().split("T")[0] || ""}
                    onChange={(e) =>{ 
                      if (!disableAll) {
                      field.onChange(new Date(e.target.value))}
                    }
                  }
                  />
                </FormControl>
                <FormMessage className="col-span-3 text-red-500 text-sm" />
              </div>
            )}
          />
        </div>
      </form>
      
      {/* <ItemDetailGrid itemDetails={itemDetails} setItemDetails={setItemDetails} /> */}
    </Form>
  );
});

export default GRNForm;

