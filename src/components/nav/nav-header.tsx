import { Button } from "@/components/ui/button";
import logo from "../../logo.svg";

// Define a type for the component props
interface NavHeaderProps {
  session: any;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export function NavHeader({ session, openAuthModal }: NavHeaderProps) {
  return (
    <header className="w-full py-4 px-6 backdrop-blur-md bg-background/60 border-b border-border fixed top-0 z-50 flex justify-between items-center">
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
        <span className="font-bold text-lg">Rivena</span>
      </div>
      
      {session ? (
        <div className="flex items-center">
          <span className="mr-2 text-sm">
            {session.user?.name || session.user?.email}
          </span>
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