import { Button } from "@/components/ui/button";
import logo from "../../logo.svg";
import { LogOut, Loader2 } from "lucide-react";
import { secureSignOut } from "@/auth/client/auth-service";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/auth/client/auth-store";

// Define a type for the component props
interface NavHeaderProps {
  openAuthModal: (mode: 'login' | 'register') => void;
}

export function NavHeader({ openAuthModal }: NavHeaderProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      const success = await secureSignOut();
      if (success) {
        toast.success("Logged out successfully");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center">
        <img src={logo} alt="Rivena Logo" className="h-8 w-8 mr-2" />
        <span className="font-bold text-lg">Rivena</span>
      </div>
      <div className="flex items-center space-x-2">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm mr-2">Hello, {user.name || user.email}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openAuthModal('login')}
            >
              Sign in
            </Button>
            <Button 
              onClick={() => openAuthModal('register')}
              size="sm"
            >
              Register
            </Button>
          </>
        )}
      </div>
    </header>
  );
} 