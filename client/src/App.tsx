import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import Home from "./pages/home";
import EventDetail from "./pages/event-detail";
import MyTickets from "./pages/my-tickets";
import CreateEvent from "./pages/create-event";
import Dashboard from "./pages/dashboard";
import Checkout from "./pages/checkout";
import Login from "./pages/login";
import Register from "./pages/register";
import NotFound from "./pages/not-found";
import { useEffect, useState } from "react";
import { User } from "@shared/schema";

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

function Router() {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch("/api/auth/status", {
          credentials: "include",
        });
        const data = await response.json();
        
        setAuthState({
          user: data.user || null,
          isAuthenticated: data.authenticated || false,
          isLoading: false,
        });
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/events/:id" component={EventDetail} />
            <Route path="/tickets" component={MyTickets} />
            <Route path="/create-event" component={CreateEvent} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/checkout/:eventId" component={Checkout} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
