import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./store/authStore";
import { CompanyProvider } from "./context/CompanyContext";

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <CompanyProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </CompanyProvider>
    </BrowserRouter>
  );
}

export default App;
