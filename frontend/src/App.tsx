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
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentTests from "./pages/student/StudentTests";
import StudentTraining from "./pages/student/StudentTraining";
import TakeTest from "./pages/student/TakeTest";

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
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/faculty/login" element={<FacultyLogin />} />
            <Route path="/placement/login" element={<PlacementLogin />} />

            {/* Student */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/tests" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentTests /></ProtectedRoute>} />
            <Route path="/student/training" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentTraining /></ProtectedRoute>} />
            <Route path="/student/test/:id" element={<ProtectedRoute allowedRoles={["STUDENT"]}><TakeTest /></ProtectedRoute>} />

            {/* Faculty */}
            <Route path="/faculty" element={<ProtectedRoute allowedRoles={["FACULTY"]}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="/faculty/students" element={<ProtectedRoute allowedRoles={["FACULTY"]}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="/faculty/students/:id" element={<ProtectedRoute allowedRoles={["FACULTY"]}><StudentProfile role="faculty" /></ProtectedRoute>} />
            <Route path="/faculty/upload" element={<ProtectedRoute allowedRoles={["FACULTY"]}><Upload /></ProtectedRoute>} />
            <Route path="/faculty/marks" element={<ProtectedRoute allowedRoles={["FACULTY"]}><MarksUpload /></ProtectedRoute>} />
            <Route path="/faculty/schedule" element={<ProtectedRoute allowedRoles={["FACULTY"]}><ScheduleTests /></ProtectedRoute>} />
            <Route path="/faculty/reports" element={<ProtectedRoute allowedRoles={["FACULTY"]}><Reports role="faculty" /></ProtectedRoute>} />

            {/* Placement */}
            <Route path="/placement" element={<ProtectedRoute allowedRoles={["PLACEMENT", "FACULTY"]}><PlacementDashboard /></ProtectedRoute>} />
            <Route path="/placement/companies" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><Companies /></ProtectedRoute>} />
            <Route path="/placement/shortlist" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><Shortlist /></ProtectedRoute>} />
            <Route path="/placement/drives" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><Drives /></ProtectedRoute>} />
            <Route path="/placement/students/:id" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><StudentProfile role="placement" /></ProtectedRoute>} />
            <Route path="/placement/trends" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><Reports role="placement" /></ProtectedRoute>} />
            <Route path="/placement/reports" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><Reports role="placement" /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
