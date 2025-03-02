import "./index.css";
import { APITester } from "./APITester";
import { Card, CardContent } from "@/components/ui/card";
import logo from "./logo.svg";
import reactLogo from "./react.svg";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Import our auth components
import { LoginForm } from "./auth/components/login-form";
import { RegisterForm } from "./auth/components/register-form";
import { NavUserWithAuthTest } from "./components/nav-user-test";
import { useSession } from "./auth/client/auth-client";
import VoiceFlowUI from "./pages/VoiceFlowUI";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function App() {
  // Get the session using the Better Auth hook
  const sessionAtom = useSession;
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for auth modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Subscribe to session changes
  useEffect(() => {
    const unsubscribe = sessionAtom.subscribe((newSession) => {
      setSession(newSession.data);
      setIsLoading(false);
    });
    
    // Initial session check
    const initialSession = sessionAtom.get();
    setSession(initialSession.data);
    setIsLoading(false);
    
    return () => unsubscribe();
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
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background relative">
        {/* Authentication Modal */}
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="sm:max-w-md backdrop-blur-lg bg-background/80">
            <DialogHeader>
              <DialogTitle>{authMode === 'login' ? 'Sign In' : 'Create Account'}</DialogTitle>
              <DialogDescription>
                {authMode === 'login' 
                  ? 'Enter your credentials to sign in to your account' 
                  : 'Complete the form below to create your account'}
              </DialogDescription>
            </DialogHeader>
            
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
            
            <div className="mt-4 text-center text-sm">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{" "}
                  <button 
                    onClick={toggleAuthMode}
                    className="text-primary underline underline-offset-4 hover:text-primary/90"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button 
                    onClick={toggleAuthMode}
                    className="text-primary underline underline-offset-4 hover:text-primary/90"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Global Navigation */}
        <header className="w-full py-4 px-6 backdrop-blur-md bg-background/60 border-b border-border fixed top-0 z-50 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
            <span className="font-bold text-lg">Rivena</span>
          </div>
          
          {session ? (
            <NavUserWithAuthTest onNavigate={(path) => console.log(`Navigate to: ${path}`)} />
          ) : (
            <div className="space-x-2">
              <Button variant="outline" onClick={() => openAuthModal('login')}>
                Sign In
              </Button>
              <Button onClick={() => openAuthModal('register')}>
                Create Account
              </Button>
            </div>
          )}
        </header>
        
        {/* Main Content */}
        <main className="pt-20 pb-8">
          <Routes>
            {/* Protected Route */}
            <Route 
              path="/voice-flow" 
              element={session ? <VoiceFlowUI /> : <Navigate to="/" />} 
            />
            
            {/* Home Route */}
            <Route 
              path="/" 
              element={
                <div className="container mx-auto p-8 text-center">
                  <div className="flex justify-center items-center gap-8 mb-8">
                    <img
                      src={logo}
                      alt="Bun Logo"
                      className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
                    />
                    <img
                      src={reactLogo}
                      alt="React Logo"
                      className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] [animation:spin_20s_linear_infinite]"
                    />
                  </div>
                  
                  <Card className="bg-card/50 backdrop-blur-sm border-muted mb-8">
                    <CardContent className="pt-6">
                      <h1 className="text-5xl font-bold my-4 leading-tight">Welcome to Rivena</h1>
                      <p className="mb-6">An advanced voice interface powered by AI</p>
                      
                      {session ? (
                        <Button size="lg" onClick={() => window.location.href = '/voice-flow'}>
                          Launch Voice Flow UI
                        </Button>
                      ) : (
                        <Button size="lg" onClick={() => openAuthModal('login')}>
                          Sign In to Continue
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                  
                  <APITester />
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
