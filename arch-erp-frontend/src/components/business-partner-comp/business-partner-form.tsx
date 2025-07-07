import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef, useImperativeHandle } from "react";

const formSchema = z.object({
  bpCode: z.string().min(1, "Business Partner Code is required").max(6, "Partner code must be 6 characters long"),
  bpName: z.string().min(1, "Business Partner Name is required").max(100, "Partner Name must be 100 characters long"),
  bpType: z.string().min(1, "Business Partner Type is required").max(30, "Partner Type must be 30 characters long"),
  bpAddress: z.string().min(1, "Business Partner Address is required") .max(100, "Partner Address must be 100 characters long"),
  pin: z.string().min(1, "PIN is required") .max(6, "PIN must be 6 characters long"),
  state: z.string().min(1, "State is required") .max(50, "State must be 50 characters long"),
  city: z.string().min(1, "City is required").max(50, "City must be 50 characters long"),
  country: z.string().min(1, "Country is required").max(50, "Country must be 50 characters long"),
});

export type BusinessPartnerFormData = z.infer<typeof formSchema>;

interface BusinessPartnerFormProps {
  defaultValues?: BusinessPartnerFormData;
  onSubmit: (data: BusinessPartnerFormData) => void;
  isEdit?: boolean;
  errData?: ErrorData;
}

interface ErrorData {
  bpCode: string;
  bpName: string;
  bpType: string;
  bpAddress: string;
  pin: string;
  state: string;
  city: string;
  country: string;
}

// Add forwardRef to expose reset
const BusinessPartnerForm = forwardRef(function BusinessPartnerForm(
  { defaultValues = { bpCode: "", bpName: "", bpType: "", bpAddress: "", pin: "", state: "", city: "", country: "" }, onSubmit,  errData }: BusinessPartnerFormProps,
  ref
) {
  const form = useForm<BusinessPartnerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      bpCode: "",
      bpName: "",
      bpType: "",
      bpAddress: "",
      pin: "",
      state: "",
      city: "",
      country: ""
    },
  });
  console.log("errData",errData)
  // console.log("sds",onSubmit)

  // useEffect(() => {
  //   if (defaultValues) {
  //     form.reset(defaultValues);
  //   }
  // }, [defaultValues]);

  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => form.reset({
      bpCode: "",
      bpName: "",
      bpType: "",
      bpAddress: "",
      pin: "",
      state: "",
      city: "",
      country: ""
    }),
  }));

  return (
    <Form {...form}>
      <form
        id="businessPartnerForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full grid grid-cols-1 gap-4 bg-white p-4 rounded-lg shadow mb-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="bpCode"
          render={({ field }) => (
            <div className="grid grid-cols-3 items-center gap-2">
              <FormLabel className="col-span-1">Business Partner Code</FormLabel>
              <FormControl className="col-span-2">
                <Input className="w-full border bg-white rounded-md p-2"
                {...form.register ("bpCode", { required: true })}
                    aria-invalid={errData?.bpCode ? "true" : "false"} 
                placeholder="Business Partner Code" {...field}
                onChange={(e) => {
                    field.onChange(e);
                    if (errData?.bpCode) errData.bpCode = "";
                  }}
                   maxLength={6}
                 />
              </FormControl>
              <FormMessage className="col-span-3 text-red-500 text-sm" />
              <div className="text-red-500 text-sm text-right">{errData?.bpCode}</div>
            </div>
          )}
        />
        <FormField
          control={form.control}
          name="bpName"
          render={({ field }) => (
            <div className="grid grid-cols-3 items-center gap-2">
              <FormLabel className="col-span-1">Business Partner Name</FormLabel>
              <FormControl className="col-span-2">
                <Input className="w-full border bg-white rounded-md p-2"
                  placeholder="Business Partner Name" {...field}
                  maxLength={100}
                  />
              </FormControl>
              <FormMessage className="col-span-3 text-red-500 text-sm"/>
            </div>
          )}
        />
        <FormField
          control={form.control}
          name="bpType"
          render={({ field }) => (
            <div className="grid grid-cols-3 items-center gap-2">
              <FormLabel className="col-span-1">Business Partner Type</FormLabel>
              <FormControl className="col-span-2">
                <Input className="w-full border bg-white rounded-md p-2"
                 placeholder="Business Partner Type" {...field}
                 maxLength={30}
                 />
              </FormControl>
              <FormMessage className="col-span-3 text-red-500 text-sm"/>
            </div>
          )}
        />
        <FormField
          control={form.control}
          name="bpAddress"
          render={({ field }) => (
            <div className="grid grid-cols-3 items-center gap-2">
              <FormLabel className="col-span-1">Business Partner Address</FormLabel>
              <FormControl className="col-span-2">
                <Input className="w-full border bg-white rounded-md p-2"
                 placeholder="Business Partner Address" {...field} 
                 maxLength={100}
                 />
              </FormControl>
              <FormMessage className="col-span-3 text-red-500 text-sm"/>
            </div>
          )}
        />
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <div className="grid grid-cols-3 items-center gap-2">
              <FormLabel className="col-span-1">PIN</FormLabel>
              <FormControl className="col-span-2">
                <Input className="w-full border bg-white rounded-md p-2"
                placeholder="PIN" {...field} 
                maxLength={6}
                />
              </FormControl>
              <FormMessage className="col-span-3 text-red-500 text-sm" />
            </div>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <div className="grid grid-cols-3 items-center gap-2">
              <FormLabel className="col-span-1">State</FormLabel>
              <FormControl className="col-span-2">
                <Input className="w-full border bg-white rounded-md p-2"
                  placeholder="State" {...field} 
                  maxLength={50}
                  />
              </FormControl>
              <FormMessage className="col-span-3 text-red-500 text-sm"/>
            </div>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <div className="grid grid-cols-3 items-center gap-2">
              <FormLabel className="col-span-1">City</FormLabel>
              <FormControl className="col-span-2">
                <Input className="w-full border bg-white rounded-md p-2"
                  placeholder="City" {...field} 
                  maxLength={50}
                  />
              </FormControl>
              <FormMessage className="col-span-3 text-red-500 text-sm"/>
            </div>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <div className="grid grid-cols-3 items-center gap-2">
              <FormLabel className="col-span-1">Country</FormLabel>
              <FormControl className="col-span-2">
                <Input className="w-full border bg-white rounded-md p-2"
                  placeholder="Country" {...field} 
                  maxLength={50}
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

export default BusinessPartnerForm;


