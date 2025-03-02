import "./index.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { LoginForm } from "./components/auth/login-form";
import { RegisterForm } from "./components/auth/register-form";
import { useSession, signIn } from "./auth/client/auth-client";
import VoiceFlowUI from "./pages/VoiceFlowUI";
import Home from "./pages/Home";
import ChatLayout from "./components/layouts/chat-layout";
import { NavHeader } from "./components/nav/nav-header";
import { 
  Dialog, 
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Layout for public pages that includes the nav header
function PublicLayout({ session, openAuthModal }: { session: any, openAuthModal: (mode: 'login' | 'register') => void }) {
  return (
    <>
      <NavHeader session={session} openAuthModal={openAuthModal} />
      <main className="pt-20 pb-8">
        <Outlet />
      </main>
    </>
  );
}

export function App() {
  // Get the session using the Better Auth hook
  const sessionAtom = useSession;
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for auth modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Try to get cached session from localStorage first
  useEffect(() => {
    try {
      const cachedSession = localStorage.getItem('cached_session');
      if (cachedSession) {
        setSession(JSON.parse(cachedSession));
      }
    } catch (error) {
      console.log('Error retrieving cached session', error);
    }
  }, []);
  
  // Subscribe to session changes
  useEffect(() => {
    // Set loading to true during initial check
    setIsLoading(true);
    
    const unsubscribe = sessionAtom.subscribe((newSession) => {
      setSession(newSession.data);
      setIsLoading(false);
      
      // Cache valid sessions in localStorage
      if (newSession.data) {
        try {
          localStorage.setItem('cached_session', JSON.stringify(newSession.data));
        } catch (error) {
          console.log('Error caching session', error);
        }
      } else {
        // Clear cached session if logged out
        localStorage.removeItem('cached_session');
      }
    });
    
    // Initial session check
    const initialSession = sessionAtom.get();
    if (initialSession.data) {
      setSession(initialSession.data);
    }
    
    // Only set loading to false after a short delay to give time for session check
    // This prevents the brief flash of unauthenticated UI
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);
  
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-background">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="mt-4 text-lg font-medium text-foreground">Loading your session...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
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
          <Route element={<PublicLayout session={session} openAuthModal={openAuthModal} />}>
            <Route path="/" element={<Home session={session} openAuthModal={openAuthModal} />} />
          </Route>
          
          {/* Protected routes with ChatLayout */}
          <Route element={session ? <ChatLayout /> : <Navigate to="/" />}>
            <Route path="/voice-flow" element={<VoiceFlowUI />} />
            {/* Add more protected routes here */}
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
