import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/Landing";
import StudentLogin from "./pages/auth/StudentLogin";
import FacultyLogin from "./pages/auth/FacultyLogin";
import PlacementLogin from "./pages/auth/PlacementLogin";
import LoginSelection from "./pages/auth/LoginSelection";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentTests from "./pages/student/StudentTests";
import StudentTraining from "./pages/student/StudentTraining";

import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import Upload from "./pages/faculty/Upload";
import MarksUpload from "./pages/faculty/MarksUpload";
import ScheduleTests from "./pages/faculty/ScheduleTests";

import PlacementDashboard from "./pages/placement/PlacementDashboard";
import Companies from "./pages/placement/Companies";
import Shortlist from "./pages/placement/Shortlist";
import Drives from "./pages/placement/Drives";

import Reports from "./pages/Reports";
import StudentProfile from "./pages/StudentProfile";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginSelection />} />

            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/faculty/login" element={<FacultyLogin />} />
            <Route path="/placement/login" element={<PlacementLogin />} />

            {/* Student */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/tests" element={<StudentTests />} />
            <Route path="/student/training" element={<StudentTraining />} />

            {/* Faculty */}
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/students" element={<FacultyDashboard />} />
            <Route path="/faculty/students/:id" element={<StudentProfile role="faculty" />} />
            <Route path="/faculty/upload" element={<Upload />} />
            <Route path="/faculty/marks" element={<MarksUpload />} />
            <Route path="/faculty/schedule" element={<ScheduleTests />} />
            <Route path="/faculty/reports" element={<Reports role="faculty" />} />

            {/* Placement */}
            <Route path="/placement" element={<PlacementDashboard />} />
            <Route path="/placement/companies" element={<Companies />} />
            <Route path="/placement/shortlist" element={<Shortlist />} />
            <Route path="/placement/drives" element={<Drives />} />
            <Route path="/placement/students/:id" element={<StudentProfile role="placement" />} />
            <Route path="/placement/trends" element={<Reports role="placement" />} />
            <Route path="/placement/reports" element={<Reports role="placement" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
