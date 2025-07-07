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

const formSchema = z.object({
  grnNo : z.string().min(1, "GR No is required").max(6, "GR No must be 6 characters long"),
  grnDate : z.date().min(new Date(), "GR Date must be today or before"),
  statusNo: z.enum(["Initialised", "Authorised"]).refine((val) => val !== undefined, {
    message: "Status is required",
  }),
  supplierLocationNo: z.string().min(1, "Supplier Location is required"),
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


const GRNForm = forwardRef(function grnForm(
  { defaultValues = { grnNo: "", grnDate: new Date(), statusNo: "Initialised", supplierLocationNo: "", poNo: "", challanNo: "", challanDate: new Date() },  errData }: grnFormProps,
  ref: React.Ref<{ reset: () => void; getValues: () => any }>
) {
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

  // useEffect(() => {
  //   if (defaultValues) {
  //     form.reset(defaultValues);
  //   }
  // }, [defaultValues]);

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

  const getErrorClass = (field: keyof ErrorData) =>
    (errData?.[field] || form.formState.errors[field]) ? "border-red-500" : "";

  return (
    <Form {...form}>
      <form className="grid gap-4 bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="grnNo"
            control={form.control}
            render={({ field }) => {
              console.log("field",field);
              return(
              <FormItem className={`flex-1 ${getErrorClass("grnNo")}`}>
                <FormLabel>GRN No</FormLabel>
                <FormControl>
                  <Input className="w-full border bg-white rounded-md p-2"
                    {...form.register ("grnNo", { required: true })}
                    aria-invalid={errData?.grnNo ? "true" : "false"}
                    placeholder="GRN No" {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (errData?.grnNo) errData.grnNo = ""; // clear this specific error
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
                  <Input className="w-full border bg-white rounded-md p-2"
                    type="date"
                    value={field.value?.toISOString().split("T")[0] || ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
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
                <FormItem>
                  <FormLabel>GRN Status</FormLabel>
                  <FormControl>
                    <Combobox value={field.value} onChange={field.onChange}>
                      <div className="relative">
                        <Combobox.Input
                          className="w-full border border-gray-300 rounded-md p-2"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setStatusQuery(e.target.value);
                          }}
                          displayValue={(val: string) => val}
                          placeholder="Select GRN Status"
                        />
                        {filteredStatus.length > 0 && (
                          <Combobox.Options className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredStatus.map((status, index) => (
                              <Combobox.Option
                                key={index}
                                value={status}
                                className={({ selected }) =>
                                  `cursor-pointer px-4 py-2 ${
                                    selected ? "bg-blue-500 text-white" : "bg-white"
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
              <FormItem>
                <FormLabel>Supplier Location</FormLabel>
                <FormControl>
                  <Combobox value={field.value} onChange={field.onChange}>
                    <div className="relative">
                      <Combobox.Input
                        className="w-full border border-gray-300 rounded-md p-2"
                        onChange={(e) => {
                          setQuery(e.target.value);
                          field.onChange(e.target.value);
                        }}
                        displayValue={(val: string | number) => {
                          const selectedPartner = supplierOptions.find(p => p.bpId === val);
                          return selectedPartner 
                            ? `${selectedPartner.bpName} (${selectedPartner.bpCode}) (${selectedPartner.bpAddress})`
                            : "";
                        }}
                        placeholder="Select Supplier Location"
                      />
                      {filteredSuppliers.length > 0 && (
                        <Combobox.Options className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredSuppliers.map((partner) => (
                            <Combobox.Option
                              key={partner.bpId}
                              value={partner.bpId}
                              className={({ selected }) =>
                                `cursor-pointer px-4 py-2 ${
                                  selected ? "bg-blue-500 text-white" : "bg-white"
                                }`
                              }
                            >
                              {partner.bpName} ({partner.bpCode}) ({partner.bpAddress})
                            </Combobox.Option>
                          ))} 
                        </Combobox.Options>
                      )}
                      {filteredSuppliers.length === 0 && !loading && query !== "" && (
                        <div className="absolute z-10 bg-white p-2 border border-gray-300 mt-1 rounded-md shadow-md text-gray-500">
                          No results found.
                        </div>
                      )}
                    </div>
                  </Combobox>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="poNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO No</FormLabel>
                <FormControl>
                  <Input className="w-full border bg-white rounded-md p-2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="challanNo"
            control={form.control}
            render={({ field }) => {
              console.log("field",field);
              return(
              <FormItem className={`flex-1 ${getErrorClass("grnNo")}`}>
                <FormLabel>Challan No</FormLabel>
                <FormControl>
                  <Input className="w-full border bg-white rounded-md p-2"
                    {...form.register ("grnNo", { required: true })}
                    aria-invalid={errData?.challanNo ? "true" : "false"}
                    placeholder="GRN No" {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (errData?.challanNo) errData.challanNo = ""; // clear this specific error
                    }}
                    maxLength={6} />
                </FormControl>
                {/* <FormMessage /> */}
                <div className="text-red-500 text-sm">{errData?.challanNo}</div>
              </FormItem>
            )}}
          />

          <FormField
            control={form.control}
            name="challanDate"
            render={({ field }) => (
              <div className="grid grid-cols-4 items-center gap-2">
                <FormLabel className="row-span-1">Challan Date</FormLabel>
                <FormControl className="row-span-1">
                  <Input className="w-full border bg-white rounded-md p-2"
                    type="date"
                    value={field.value?.toISOString().split("T")[0] || ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="col-span-3 text-red-500 text-sm" />
              </div>
            )}
          />
        </div>
      </form>
    </Form>
  );
});

export default GRNForm;

