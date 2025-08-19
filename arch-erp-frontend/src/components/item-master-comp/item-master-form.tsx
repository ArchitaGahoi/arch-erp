import { useForm } from "react-hook-form";
//import { ErrorMessage } from "@hookform/error-message"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef, useImperativeHandle } from "react";


const formSchema = z.object({
  itemCode: z.string().min(1, "Item code is required").max(6, "Item code must be 6 characters long"),
  itemName: z.string().min(1, "Item name is required").max(50, "Item name must be 50 characters long"),
  unit: z.string().min(1, "Unit is required").max(4, "Unit must be 4 characters long"),
});

export type ItemFormData = z.infer<typeof formSchema>;

interface ItemMasterFormProps {
  defaultValues?: ItemFormData;
  onSubmit: (data: ItemFormData) => void;
  isEdit?: boolean;
  errData?: ErrorData;
}

interface ErrorData {
  itemCode?: string;
  itemName?: string;
  unit?: string;
}

const ItemMasterForm = forwardRef(function ItemMasterForm(
  { defaultValues = { itemCode: "", itemName: "", unit: "" }, onSubmit, errData, isEdit }: ItemMasterFormProps,
  ref
) {
  const form = useForm<ItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || { itemCode: "", itemName: "", unit: "" },
  });

  // useEffect(() => {
  //   if (defaultValues) {
  //     form.reset(defaultValues);
  //   }
  // }, [defaultValues]);

  // Expose reset method to parent

  useImperativeHandle(ref, () => ({
    reset: () => form.reset({ itemCode: "", itemName: "", unit: "" }),
  }));

  const getErrorClass = (field: keyof ErrorData) =>
    (errData?.[field] || form.formState.errors[field]) ? "border-red-500" : "";

  return (
    <Form {...form}>
      <form
        id="itemMasterForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 bg-white dark:bg-[#23272f] p-4 rounded-lg shadow mb-4"
      >
        <div className="flex items-center">
          <FormLabel className="w-24">Item Code</FormLabel>
          <FormField
            control={form.control}
            name="itemCode"
            render={({ field }) => (
              <FormItem className={`flex-1 ${getErrorClass("itemCode")}`}>
                <FormControl>
                  <Input className="w-full border bg-white rounded-md p-2"
                  {...form.register ("itemCode", { required: isEdit ? false : "email is required"  })}
                  aria-invalid={errData?.itemCode ? "true" : "false"}
                    placeholder="Item Code"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (errData?.itemCode) errData.itemCode = ""; // clear this specific error
                    }}
                    maxLength={6}
          
                  />
                </FormControl>
                {/* <ErrorMessage 
                  
                /> */}
                {/* {errData?.itemCode && <p role="alert">{errData.itemCode}</p>} */}
                <div className="text-red-500 text-sm">{errData?.itemCode}</div>
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center">
          <FormLabel className="w-24">Item Name</FormLabel>
          <FormField
            control={form.control}
            name="itemName"
            render={({ field }) => (
              <FormItem className={`flex-1 ${getErrorClass("itemName")}`}>
                <FormControl>
                  <Input className="w-full border bg-white rounded-md p-2"
                  {...form.register ("itemName", { required: isEdit ? false : "Item name is required"}) }
                  aria-invalid={errData?.itemName ? "true" : "false"}
                  placeholder="Item Name" {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    if (errData?.itemName) errData.itemName = "";
                  }}
                  maxLength={50}
                   />
                </FormControl>
                <FormMessage />
                <div className="text-red-500 text-sm">{errData?.itemName}</div>
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center">
          <FormLabel className="w-24">Unit</FormLabel>
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem className={`flex-1 ${getErrorClass("unit")}`}>
                <FormControl>
                  <Input className="w-full border bg-white rounded-md p-2"
                    placeholder="Unit" {...field} maxLength={4} />
                </FormControl>
                <FormMessage />
                <div className="text-red-500 text-sm">{errData?.unit}</div>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
});

export default ItemMasterForm;

