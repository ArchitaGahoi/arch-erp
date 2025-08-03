import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/login-comp/auth-context";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";  

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailId = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("Password") as HTMLInputElement).value;

    const success = await login(emailId, password);
    if (success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError("Invalid credentials");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your EmailId and Password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">EmailId</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Enter your EmailId"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" name="Password" type="Password" required />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <p className="text-sm text-right mt-2">
                <Link to="/forgot-password" className="text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </p>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}