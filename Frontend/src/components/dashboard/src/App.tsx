import { AuthProvider, useAuth } from "./auth";
import LoginPage from "./LoginPage";
import Dashboard from "@/imports/pasted_text/mock-data.tsx";

function Root() {
  const { user } = useAuth();
  return user ? <Dashboard currentUser={user} /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
