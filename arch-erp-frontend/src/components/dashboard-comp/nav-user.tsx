"use client"
import { useState } from "react";
import{ api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
  onLogout,
}: {
  user: {
    code: string
    emailId: string
    avatar: string
  };
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changeMsg, setChangeMsg] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    setOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src={user.avatar} alt={user.code} />
                  <AvatarFallback className="rounded-lg">{user.code?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.code}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.emailId}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
              //side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.code} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.code}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.emailId}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowChange(true)}>
                <IconUserCircle />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <IconLogout />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
            </DialogHeader>
            <div>Are you sure you want to log out?</div>
            <DialogFooter>
              <button onClick={() => setOpen(false)} className="btn btn-secondary">No</button>
              <button onClick={handleLogout} className="btn btn-primary">Yes</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showChange} onOpenChange={setShowChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async e => {
                e.preventDefault();

                // Prevent submission if passwords don't match
                if (!newPassword || !confirmPassword) {
                  setChangeMsg("Both new and confirm password are required.");
                  return;
                }

                if (newPassword !== confirmPassword) {
                  setChangeMsg("Passwords do not match.");
                  return;
                }

                try {
                  await api.post("/user-master/change-password", { oldPassword, newPassword });
                  setChangeMsg("Password changed successfully.");
                  setTimeout(() => setShowChange(false), 1200);
                } catch (err: any) {
                  setChangeMsg(err.response?.data?.message || "Error");
                }
              }}
              className="space-y-4"
            >

              <input
                className="w-full border p-2 rounded"
                type="password"
                placeholder="Old password"
                value={oldPassword}
                onChange={e => {
                  setOldPassword(e.target.value);
                  setChangeMsg(""); 
                }}
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => {setNewPassword(e.target.value);
                  setChangeMsg("");
                }}
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => {setConfirmPassword(e.target.value)
                  setChangeMsg("");
                }}
                required
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <div className="text-red-500 text-sm">Passwords do not match</div>
              )}
              <button className="btn btn-primary w-full" type="submit">Change Password</button>
              {changeMsg && <div className="text-green-600">{changeMsg}</div>}
            </form>
          </DialogContent>
        </Dialog>
    </>
  )
}
