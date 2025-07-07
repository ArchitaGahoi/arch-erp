"use client"

import * as React from "react"
import {
  // IconCamera,
  IconChartBar,
  //IconDashboard,
  // IconDatabase,
  // IconFileAi,
  // IconFileDescription,
  // IconFileWord,
  IconFolder,
  //IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  // IconReport,
  // IconSearch,
  // IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import { NavLink } from "react-router-dom";

//import { NavDocuments } from "@/components/dashboard-comp/nav-documents"
import { NavMain } from "@/components/dashboard-comp/nav-main"
//import { NavSecondary } from "@/components/dashboard-comp/nav-secondary"
import { NavUser } from "@/components/dashboard-comp/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Item Master",
      link: "/itemMaster-search",
      icon: IconListDetails,            //IconListDetails,
    },
    {
      title: "User Master",
      link: "/userMaster-search",
      icon: IconUsers,            //IconListDetails,
    },
    {
      title: "Purchase Order",
      link: "/purchaseOrder-search",
      icon: IconChartBar,
    },
    {
      title: "Business Partner",
      link: "/businessPartner-search",
      icon: IconUsers,
    },
    {
      title: "Goods Receipt Note",
      link: "/grn-search",
      icon: IconFolder,
    },
    {
      title: "Material Issue",
      link: "#",
      icon: IconFolder,
    },
  ]
  // navClouds: [
  //   {
  //     title: "Capture",
  //     icon: IconCamera,
  //     isActive: true,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Proposal",
  //     icon: IconFileDescription,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Prompts",
  //     icon: IconFileAi,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  // ],
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: IconSettings,
  //   },
  //   {
  //     title: "Get Help",
  //     url: "#",
  //     icon: IconHelp,
  //   },
  //   {
  //     title: "Search",
  //     url: "#",
  //     icon: IconSearch,
  //   },
  // ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: IconReport,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: IconFileWord,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <NavLink to="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

