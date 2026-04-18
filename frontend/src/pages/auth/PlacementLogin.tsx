import { Briefcase } from "lucide-react";
import { RoleAuth } from "./RoleAuth";

const PlacementLogin = () => (
  <RoleAuth
    role="placement"
    title="Placement officer sign in"
    subtitle="Manage company profiles and shortlists."
    icon={Briefcase}
    redirectTo="/placement"
    accentLabel="Placement"
  />
);

export default PlacementLogin;
