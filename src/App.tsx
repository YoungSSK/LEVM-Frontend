import { useEffect } from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router";
import AuthPage from "./pages/AuthPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import { authStore } from "@/stores/auth.store";
function App() {
  useEffect(() => {
    void authStore.bootstrapSession();
  }, []);

  return (
    <div>
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* public routes */}
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
