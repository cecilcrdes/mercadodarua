import React, { useEffect } from "react";
import { AppProvider, useApp } from "./state";
import { Shell } from "./components/Shell";
import { Toasts } from "./components/ui";
import { ClientView } from "./views/Client";
import { VendorView } from "./views/Vendor";
import { AdminView } from "./views/Admin";
import { ClientLogin, VendorLogin } from "./views/Auth";

function Root() {
  const { state } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.module, state.clientUser, state.vendorUser]);

  return (
    <Shell>
      <div className="bg-dots">
        {state.module === "client" && (state.clientUser ? <ClientView /> : <ClientLogin />)}
        {state.module === "vendor" && (state.vendorUser ? <VendorView /> : <VendorLogin />)}
        {state.module === "admin" && <AdminView />}
      </div>
      <Toasts />
    </Shell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
