import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ItemMasterPage from "@/item-master-pages/item-master-page";
import ItemMasterSearchPage from "@/item-master-pages/item-master-search-page";
import Page from "@/login/page";
import { AuthProvider, useAuth } from "@/components/login-comp/auth-context";
import DashboardPage from "@/dashboard/page";
import UserMasterPage from "./user-master-pages/user-master-page";
import UserMasterSearchPage from "./user-master-pages/user-master-search-page";
import BusinessPartnerPage from "./business-partner-pages/business-partner-page";
import BusinessPartnerSearchPage from "./business-partner-pages/business-partner-search-page";
import PurchaseOrderPage from "./purchase-order-pages/purchase-order-page";
import PurchaseOrderSearchPage from "./purchase-order-pages/purchase-order-search-page";
import GRNPage from "./grn-pages/grn-page";
import GRNSearchPage from "./grn-pages/grn-search-page";
import Layout from "@/components/layout-comp/layout";


import React from "react";

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Page />} />
          <Route path="/" element={<Navigate to="/login" />} /> 
          <Route element= {<Layout/>} >
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/itemMaster"
            element={
              <ProtectedRoute>
                <ItemMasterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/itemMaster-search"
            element={
              <ProtectedRoute>
                <ItemMasterSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userMaster"
            element={
              <ProtectedRoute>
                <UserMasterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userMaster-search"
            element={
              <ProtectedRoute>
                <UserMasterSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/businessPartner"
            element={
              <ProtectedRoute>
                <BusinessPartnerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/businessPartner-search"
            element={
              <ProtectedRoute>
                <BusinessPartnerSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchaseOrder"
            element={
              <ProtectedRoute>
                <PurchaseOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchaseOrder-search"
            element={
              <ProtectedRoute>
                <PurchaseOrderSearchPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/grn-page"
            element={
              <ProtectedRoute>
                <GRNPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grn-search"
            element={
              <ProtectedRoute>
                <GRNSearchPage />
              </ProtectedRoute>
            }
          />
          </Route>
        </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}