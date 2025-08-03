import { useState } from "react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export function ForgetPasswordForm() {
  const [emailId, setEmailId] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/user-master/forget-password", { emailId });
      setToken(res.data.token); // For demo, show token
      setStep(2);
      setMsg("Check your email for the reset token (shown here for demo).");
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Error");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/user-master/reset-password", { token, password });
      setMsg("Password reset successful. You can now login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      {step === 1 ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <h2 className="text-lg font-bold">Forgot Password</h2>
          <input
            className="w-full border p-2 rounded"
            type="email"
            placeholder="Enter your email"
            value={emailId}
            onChange={e => setEmailId(e.target.value)}
            required
          />
          <button className="btn btn-primary w-full" type="submit">Update Password</button>
          {msg && <div className="text-red-500">{msg}</div>} 
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <h2 className="text-lg font-bold">Reset Password</h2>
          <input
            className="w-full border p-2 rounded"
            type="text"
            placeholder="Enter reset token"
            value={token}
            onChange={e => setToken(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 rounded"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            className="w-full border p-2 rounded"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
         />
        {password !== confirmPassword && (
        <div className="text-red-500 text-sm">Passwords do not match</div>
        )}
          <button className="btn btn-primary w-full" type="submit">Reset Password</button>
          {msg && <div className="text-green-600">{msg}</div>}
        </form>
      )}
    </div>
  );
}