import { Users } from "lucide-react";
import { RoleAuth } from "./RoleAuth";

const FacultyLogin = () => (
  <RoleAuth
    role="faculty"
    title="Faculty sign in"
    subtitle="Access batch analytics and student records."
    icon={Users}
    redirectTo="/faculty"
    accentLabel="Faculty"
  />
);

export default FacultyLogin;
