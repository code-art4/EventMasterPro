import React, { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { PurchaseWithDetails } from "@shared/schema";
import { AuthContext } from "../App";
import TicketItem from "@/components/tickets/ticket-item";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Ticket } from "lucide-react";

export default function MyTickets() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useContext(AuthContext);

  const { data: purchases, isLoading } = useQuery<PurchaseWithDetails[]>({
    queryKey: ["/api/purchases/me"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login?redirect=/tickets");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-6">
          {Array(3).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Filter tickets into upcoming and past events
  const now = new Date();
  const upcomingPurchases = purchases?.filter(p => new Date(p.event.endDate) >= now) || [];
  const pastPurchases = purchases?.filter(p => new Date(p.event.endDate) < now) || [];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Tickets</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your upcoming events and view your purchase history
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Upcoming Events ({upcomingPurchases.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center">
            <Ticket className="mr-2 h-4 w-4" />
            Past Events ({pastPurchases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="space-y-6">
              {Array(2).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))}
            </div>
          ) : upcomingPurchases.length > 0 ? (
            <div className="space-y-6">
              {upcomingPurchases.map((purchase) => (
                <TicketItem key={purchase.id} purchase={purchase} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Upcoming Events</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any upcoming events.</p>
              <div className="mt-6">
                <Button onClick={() => setLocation("/")}>
                  Browse Events
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {isLoading ? (
            <div className="space-y-6">
              {Array(2).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))}
            </div>
          ) : pastPurchases.length > 0 ? (
            <div className="space-y-6">
              {pastPurchases.map((purchase) => (
                <TicketItem key={purchase.id} purchase={purchase} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Past Events</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't attended any events yet.</p>
              <div className="mt-6">
                <Button onClick={() => setLocation("/")}>
                  Browse Events
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
