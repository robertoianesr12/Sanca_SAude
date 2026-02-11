import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClinicIndex from "./pages/ClinicIndex";
import PatientPortal from "./pages/PatientPortal";
import ClinicAdmin from "./pages/ClinicAdmin";
import Services from "./pages/Services";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClinicIndex />} />
          <Route path="/login" element={<Login />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/portal" element={<PatientPortal />} />
          <Route path="/admin" element={<ClinicAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;