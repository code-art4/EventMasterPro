import React, { useContext, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AuthContext } from "../../App";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/");
      // Force reload to update auth status
      window.location.reload();
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-auto text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ml-2 text-xl font-bold text-primary-600">Eventify</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link 
                href="/" 
                className={`${location === "/" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} font-medium border-b-2 px-1 pt-1 pb-2 transition-colors`}
              >
                Discover
              </Link>
              <Link 
                href="/tickets" 
                className={`${location === "/tickets" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} font-medium border-b-2 px-1 pt-1 pb-2 transition-colors`}
              >
                My Tickets
              </Link>
              <Link 
                href="/create-event" 
                className={`${location === "/create-event" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} font-medium border-b-2 px-1 pt-1 pb-2 transition-colors`}
              >
                Create Event
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="flex items-center ml-4 md:ml-6">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" size="icon" className="mr-2" aria-label="Notifications">
                      <Bell className="h-5 w-5 text-gray-500" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative rounded-full h-8 w-8 flex items-center justify-center overflow-hidden">
                          <Avatar>
                            <AvatarImage src={user?.avatarUrl || ""} alt={user?.username || ""} />
                            <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href="/tickets">My Tickets</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <div className="flex space-x-4">
                    <Link href="/auth">
                      <Button variant="ghost">Log in</Button>
                    </Link>
                    <Link href="/auth">
                      <Button>Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Menu">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className={`${location === "/" ? "bg-primary-50 border-primary-500 text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
            </Link>
            <Link 
              href="/tickets" 
              className={`${location === "/tickets" ? "bg-primary-50 border-primary-500 text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Tickets
            </Link>
            <Link 
              href="/create-event" 
              className={`${location === "/create-event" ? "bg-primary-50 border-primary-500 text-primary-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Event
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={user?.avatarUrl || ""} alt={user?.username || ""} />
                      <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.fullName}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/tickets" 
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Tickets
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1 px-4">
                <Link 
                  href="/auth" 
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  href="/auth" 
                  className="block px-4 py-2 text-base font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
