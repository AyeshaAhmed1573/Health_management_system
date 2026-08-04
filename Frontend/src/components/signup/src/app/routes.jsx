import { createBrowserRouter } from "react-router";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { PatientProfiles } from "./pages/PatientProfiles";
import { Dashboard } from "./pages/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Signup,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/patient-profiles",
    Component: PatientProfiles,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
]);
