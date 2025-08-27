import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef, useImperativeHandle } from "react";
import { Combobox } from '@headlessui/react';
import { useState } from 'react';
import { ErrorMessage} from '@hookform/error-message';
import { z } from "zod";

const formSchema = z.object({
  code: z.string().min(1, "user code is required").max(6, "User code must be 6 characters long"),
  emailId: z.string().email("email Id is required").max(50, "User EmailId must be 50 characters long"),
  password: z.string().min(1, "password is required").max(100, "User Password must be 100 characters long"),
  userType: z.string().min(1, "user type is required").max(10, "User type must be 10 characters long"),
});

export type userFormData = z.infer<typeof formSchema>;

interface userMasterFormProps {
  defaultValues?: userFormData;
  onSubmit: (data: userFormData) => void;
  isEdit?: boolean;
  errData?: ErrorData;
  disablePassword?: boolean;
}

interface ErrorData {
  code?: string;
  emailId?: string;
  password?: string;
  userType?: string;
}

// Add forwardRef to expose reset
const userMasterForm = forwardRef(function userMasterForm(
  { defaultValues = { code: "", emailId: "", password: "", userType: "" }, isEdit, onSubmit,  disablePassword = false, errData }: userMasterFormProps,
  ref
) {
  const form = useForm<userFormData>({
    //resolver: zodResolver(formSchema),
    defaultValues: defaultValues || { code: "", emailId: "", password: "", userType: "" },
  });

  console.log("form", form);

  // useEffect(() => {
  //   if (defaultValues) {
  //     form.reset(defaultValues);
  //   }
  // }, [defaultValues]);

  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => form.reset({ code: "", emailId: "" , password: "", userType: "" }),
  }));

   const getErrorClass = (field: keyof ErrorData) =>
    (errData?.[field] || form.formState.errors[field]) ? "border-red-500" : "";

  return (
    <Form {...form}>
      <form
        id="userMasterForm"
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 bg-white dark:bg-[#23272f] p-4 rounded-lg shadow mb-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="code"
            control={form.control}
            render={({ field }) => (
              <FormItem className={`flex-1 ${getErrorClass("code")}`}>
                <FormLabel>User Code</FormLabel>
                <FormControl>
                  <Input className="w-full border bg-white rounded-md p-2"
                    {...form.register ("code", { required:  isEdit ? false : "code is required" })}
                    aria-invalid={errData?.code ? "true" : "false"} 
                    placeholder="User Code" {...field} 
                    onChange={(e) => {
                    field.onChange(e);
                    if (errData?.code) errData.code="";
                  }}
                  maxLength={6}
                  />

                </FormControl>
                <div className=" border-red-500 text-red-500 text-sm ">
                  <ErrorMessage
                    errors={form.formState.errors}
                    name="code"
                  />
                   <ErrorMessage
                    errors={form.formState.errors?.code}
                    name="code"
                  />
                </div>
                <div className="text-red-500 text-sm">{errData?.code}</div> 
              </FormItem>
            )}
          />
          <FormField
            name="emailId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Id</FormLabel>
                <FormControl>
                  <Input className="w-full border bg-white rounded-md p-2 mb-2"
                  {...form.register ("emailId", { required:  isEdit ? false : "email is required" })}
                    aria-invalid={errData?.emailId ? "true" : "false"} 
                  placeholder="Email Id" {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    if (errData?.emailId) errData.emailId="";
                  }}
                  maxLength={50}  />
                </FormControl>
                  <div className=" border-red-500 text-red-500 text-sm ">
                    <ErrorMessage
                      errors={form.formState.errors}
                      name="emailId"
                    />
                    <ErrorMessage
                      errors={form.formState.errors?.emailId}
                      name="emailId"
                    />
                  </div>
                  <div className="text-red-500 text-sm">{errData?.emailId}</div> 
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                  {...form.register ("password", { required:  isEdit ? false : "password is required" })}
                  aria-invalid={errData?.password ? "true" : "false"} 
                  className="w-full border bg-white rounded-md p-2"
                  placeholder="password" {...field}
                  disabled={disablePassword}
                  onChange={(e) => {
                    field.onChange(e);
                    if (errData?.password) errData.password="";
                  }}
                  maxLength={100} 
                   />
                </FormControl>
                <div className=" border-red-500 text-red-500 text-sm ">
                  <ErrorMessage
                    errors={form.formState.errors}
                    name="password"
                  />
                </div>
              </FormItem>
            )}
          />
          <FormField
            name="userType"
            control={form.control}
            render={({ field }) => {
              const userTypes = ["admin", "general"];
              const [query, setQuery] = useState("");
              const filteredTypes = query === ""
                ? userTypes
                : userTypes.filter(type =>
                    type.toLowerCase().includes(query.toLowerCase())
                  );

              return (
                <FormItem>
                  <FormLabel>User Type</FormLabel>
                  <FormControl>
                    <Combobox value={field.value} onChange={field.onChange}>
                      <div className="relative">
                        <Combobox.Input
                          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
                          dark:bg-gray-800 dark:text-gray-100 dark:border-gray-400
                          focus:outline-none focus:border-blue-500 
                          hover:border-blue-400
                          dark:focus:border-blue-400 dark:hover:border-blue-300"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setQuery(e.target.value);
                          }}
                          displayValue={(val: string) => val}
                          placeholder="Select user type"
                        />
                        {filteredTypes.length > 0 && (
                          <Combobox.Options className="absolute z-10 w-full bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredTypes.map((type, index) => (
                              <Combobox.Option
                                key={index}
                                value={type}
                                className={({ selected }) =>
                                  `cursor-pointer px-4 py-2 ${
                                    selected
                                      ? "bg-blue-500 text-white dark:bg-blue-700"
                                      : "bg-white dark:bg-[#18181b] text-gray-900 dark:text-gray-100"
                                  }`
                                }
                              >
                                {type}
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
        </div>
      </form>
    </Form>
  );
});

export default userMasterForm;


// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ComboBox } from "@/components/ui/combobox"; 
// import { toast } from "sonner";

// const formSchema = z.object({
//   code: z.string().min(1, "Code is required"),
//   emailId: z.string().email("Invalid email"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   userType: z.string().min(1, "User Type is required"),
// });

// type UserFormValues = z.infer<typeof formSchema>;

// const userTypes = [
//   { label: "Admin", value: "Admin" },
//   { label: "General", value: "General" },
// ];

// export default function UserMasterForm() {
//   const form = useForm<UserFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       code: "",
//       emailId: "",
//       password: "",
//       userType: "",
//     },
//   });

//   const onSubmit = async (data: UserFormValues) => {
//     try {
//       await axios.post("http://localhost:5000/api/usermaster", data);
//       toast.success("User added successfully!");
//       form.reset();
//     } catch (error) {
//       toast.error("Failed to add user");
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-4 bg-white shadow rounded-xl dark:bg-gray-900">
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//           {/* Code Field */}
//           <FormField
//             control={form.control}
//             name="code"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>User Code</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Enter code" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Email ID Field */}
//           <FormField
//             control={form.control}
//             name="emailId"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Email ID</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Enter email" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Password Field */}
//           <FormField
//             control={form.control}
//             name="password"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Password</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Enter password" type="password" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* ComboBox for User Type */}
//           <FormField
//             control={form.control}
//             name="userType"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>User Type</FormLabel>
//                 <FormControl>
//                   <ComboBox
//                     options={userTypes}
//                     selectedValue={field.value}
//                     onValueChange={(value) => field.onChange(value)}
//                     placeholder="Select User Type"
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Submit Button */}
//           <Button type="submit" className="w-full">
//             Submit
//           </Button>
//         </form>
//       </Form>
//     </div>
//   );
// }
