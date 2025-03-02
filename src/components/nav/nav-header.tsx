import { Button } from "@/components/ui/button";
import logo from "../../logo.svg";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/auth/client/auth-client";
import { useState } from "react";
import { toast } from "sonner";

// Define a type for the component props
interface NavHeaderProps {
  session: any;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export function NavHeader({ session, openAuthModal }: NavHeaderProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
      console.error(error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="w-full py-4 px-6 backdrop-blur-md bg-background/60 border-b border-border fixed top-0 z-50 flex justify-between items-center">
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
        <span className="font-bold text-lg">Rivena</span>
      </div>
      
      {session ? (
        <div className="flex items-center">
          <span className="mr-4 text-sm">
            Logged in as: {session.user?.name || session.user?.email}
          </span>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleSignOut}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </>
            )}
          </Button>
        </div>
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
  );
} 