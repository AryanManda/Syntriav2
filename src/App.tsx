import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Overview from "./pages/Overview";
import Workbench from "./pages/Workbench";
import Onboarding from "./pages/Onboarding";
import Risk from "./pages/Risk";
import EntityDetail from "./pages/EntityDetail";
import Decommission from "./pages/Decommission";
import Audit from "./pages/Audit";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Overview /></Layout>} />
          <Route path="/workbench" element={<Layout><Workbench /></Layout>} />
          <Route path="/onboarding" element={<Layout><Onboarding /></Layout>} />
          <Route path="/risk" element={<Layout><Risk /></Layout>} />
          <Route path="/entities/:id" element={<Layout><EntityDetail /></Layout>} />
          <Route path="/decommission" element={<Layout><Decommission /></Layout>} />
          <Route path="/audit" element={<Layout><Audit /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/admin" element={<Layout><Admin /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
