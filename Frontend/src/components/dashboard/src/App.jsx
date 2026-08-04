import { AuthProvider, useAuth } from "./auth.jsx";
import LoginPage from "./LoginPage.jsx";
import Dashboard from "@/imports/pasted_text/mock-data.jsx";

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
