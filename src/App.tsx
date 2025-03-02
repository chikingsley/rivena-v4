import "./index.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { LoginForm } from "./components/auth/login-form";
import { RegisterForm } from "./components/auth/register-form";
import { useAuth, AuthProvider } from "./components/auth/AuthProvider";
import VoiceFlowUI from "./pages/VoiceFlowUI";
import Home from "./pages/Home";
import ChatLayout from "./components/layouts/chat-layout";
import { NavHeader } from "./components/nav/nav-header";
import { 
  Dialog, 
  DialogContent,
} from "@/components/ui/dialog";
import { useAuthStore } from "./auth/client/auth-store";
import { authService } from "./auth/client/auth-service";
import { AuthInitializer } from "./auth/client/auth-initializer";

// Layout for public pages that includes the nav header
function PublicLayout({ openAuthModal }: { openAuthModal: (mode: 'login' | 'register') => void }) {
  const { user } = useAuth();
  
  return (
    <>
      <NavHeader session={{ user }} openAuthModal={openAuthModal} />
      <main className="pt-20 pb-8">
        <Outlet />
      </main>
    </>
  );
}

export function App() {
  // State for auth modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Handle successful auth
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };
  
  // Toggle between login and register
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  // Show the auth modal
  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <BrowserRouter>
      {/* Initialize authentication state from cache */}
      <AuthInitializer />
      
      <AuthProvider>
        <div className="min-h-screen bg-background relative">
          {/* Authentication Modal */}
          <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
            <DialogContent className="sm:max-w-md backdrop-blur-lg">
              {authMode === 'login' ? (
                <LoginForm 
                  onSuccess={handleAuthSuccess}
                  onError={(error) => console.error(error)}
                />
              ) : (
                <RegisterForm 
                  onSuccess={handleAuthSuccess}
                  onError={(error) => console.error(error)}
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Routes Configuration */}
          <Routes>
            {/* Public routes with NavHeader */}
            <Route element={<PublicLayout openAuthModal={openAuthModal} />}>
              <Route path="/" element={<Home openAuthModal={openAuthModal} />} />
            </Route>
            
            {/* Protected routes with ChatLayout */}
            <Route element={
              <AuthProvider requireAuth={true} redirectTo="/">
                <ChatLayout />
              </AuthProvider>
            }>
              <Route path="/voice-flow" element={<VoiceFlowUI />} />
              {/* Add more protected routes here */}
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
