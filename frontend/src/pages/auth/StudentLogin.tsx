import { GraduationCap } from "lucide-react";
import { RoleAuth } from "./RoleAuth";

const StudentLogin = () => (
  <RoleAuth
    role="student"
    title="Welcome back, student"
    subtitle="Sign in to track your placement readiness."
    icon={GraduationCap}
    redirectTo="/student"
    accentLabel="Student"
  />
);

export default StudentLogin;
