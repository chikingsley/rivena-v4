import { useState, useEffect } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
  User,
  Sparkles,
  Loader2
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/auth/client/auth-client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { secureSignOut } from "@/auth/client/auth-service";

export interface NavUserProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onLogout?: () => void;
}

export function NavUser({ user, onLogout }: NavUserProps) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const success = await secureSignOut();
      if (success) {
        toast.success("Logged out successfully");
        
        if (onLogout) {
          onLogout();
        } else {
          // If no callback provided, navigate to home
          navigate('/');
        }
      } else {
        toast.error("Failed to log out");
      }
    } catch (error) {
      toast.error("Failed to log out");
      console.error(error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) {
    return <SignInButton />;
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = getInitials(user.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/upgrade")}>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/account")}>
                <User className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/billing")}>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/notifications")}>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center"
            >
              {loggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {loggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// SignInButton component for when user is not logged in
export function SignInButton() {
  const navigate = useNavigate();
  
  return (
    <Button 
      onClick={() => navigate("/sign-in")}
      variant="default" 
      className="gap-2 justify-between"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.2em"
        height="1.2em"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M5 3H3v4h2V5h14v14H5v-2H3v4h18V3zm12 8h-2V9h-2V7h-2v2h2v2H3v2h10v2h-2v2h2v-2h2v-2h2z"
        />
      </svg>
      <span>Sign In</span>
    </Button>
  );
}

// NavUserWithAuth component that integrates with Better Auth
export function NavUserWithAuth({ onLogout }: { onLogout?: () => void }) {
  // Get current session state
  const sessionAtom = useSession;
  const [sessionState, setSessionState] = useState({
    data: sessionAtom.get()?.data,
    isPending: sessionAtom.get()?.isPending || false,
    error: sessionAtom.get()?.error
  });
  
  // Subscribe to session state changes
  useEffect(() => {
    const unsubscribe = sessionAtom.subscribe((newValue) => {
      setSessionState({
        data: newValue?.data,
        isPending: newValue?.isPending || false,
        error: newValue?.error
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  if (sessionState.isPending) {
    return (
      <Button variant="ghost" disabled className="gap-2">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }
  
  // If we have a session and user data
  if (sessionState.data?.user) {
    const user = {
      name: sessionState.data.user.name || 'User',
      email: sessionState.data.user.email || '',
      avatar: sessionState.data.user.image || undefined
    };
    
    return <NavUser user={user} onLogout={onLogout} />;
  }
  
  // No session, show sign in button
  return <SignInButton />;
}