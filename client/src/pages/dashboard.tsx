import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Event, User, PurchaseWithDetails } from "@shared/schema";
import { AuthContext } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/events/event-card";
import TicketItem from "@/components/tickets/ticket-item";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");

  // Handle authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login?redirect=/dashboard");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Get user events (if organizer)
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events/organizer/me"],
    enabled: isAuthenticated && !!user?.isOrganizer,
  });

  // Get user tickets
  const { data: purchases, isLoading: purchasesLoading } = useQuery<PurchaseWithDetails[]>({
    queryKey: ["/api/purchases/me"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full mt-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  // Prepare data for analytics
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const attendanceData = {
    labels: ['Concert', 'Sports', 'Theater', 'Workshop', 'Food & Drink'],
    datasets: [
      {
        label: 'Attendance',
        data: [30, 25, 15, 10, 20],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const revenueData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue',
        data: [500, 1200, 850, 1500],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Filter upcoming purchases
  const upcomingPurchases = purchases?.filter(p => new Date(p.event.endDate) >= new Date()) || [];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-lg text-gray-600">
            {user?.isOrganizer 
              ? "Manage your events and view your analytics" 
              : "View your tickets and account information"}
          </p>
        </div>
        {user?.isOrganizer && (
          <Button
            onClick={() => setLocation("/create-event")}
            className="md:self-start"
          >
            Create New Event
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {user?.isOrganizer ? "Total Events" : "Tickets Purchased"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {user?.isOrganizer ? events?.length || 0 : purchases?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {user?.isOrganizer ? "Total Sales" : "Upcoming Events"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {user?.isOrganizer 
                ? "$2,450" 
                : upcomingPurchases.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {user?.isOrganizer ? "Active Events" : "Total Spent"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {user?.isOrganizer 
                ? events?.filter(e => new Date(e.endDate) >= new Date()).length || 0 
                : `$${purchases?.reduce((sum, p) => sum + p.totalAmount, 0).toFixed(2) || "0.00"}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {user?.isOrganizer ? (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          ) : (
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {user?.isOrganizer ? (
            // Organizer events
            <Card>
              <CardHeader>
                <CardTitle>Your Events</CardTitle>
                <CardDescription>
                  Manage and monitor your events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
                    <Button onClick={() => setLocation('/create-event')}>
                      Create Your First Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // User profile and next event
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                          {user?.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{user?.fullName}</h3>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-gray-500">@{user?.username}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button variant="outline" className="w-full" onClick={() => {}}>
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {upcomingPurchases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Next Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TicketItem purchase={upcomingPurchases[0]} />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {user?.isOrganizer ? (
          // Analytics tab for organizers
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center">
                  <div className="flex-1">
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>Monthly ticket sales</CardDescription>
                  </div>
                  <BarChart className="text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Bar 
                      data={salesData} 
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false,
                          },
                        },
                      }} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center">
                  <div className="flex-1">
                    <CardTitle>Attendance by Category</CardTitle>
                    <CardDescription>Distribution across event types</CardDescription>
                  </div>
                  <PieChart className="text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Pie 
                      data={attendanceData} 
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        },
                      }} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center">
                <div className="flex-1">
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Weekly revenue over the past month</CardDescription>
                </div>
                <LineChart className="text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line 
                    data={revenueData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `$${value}`
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ) : (
          // Tickets tab for users
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Your Tickets</CardTitle>
                <CardDescription>All your event tickets in one place</CardDescription>
              </CardHeader>
              <CardContent>
                {purchasesLoading ? (
                  <div className="space-y-6">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                ) : purchases && purchases.length > 0 ? (
                  <div className="space-y-6">
                    {purchases.map(purchase => (
                      <TicketItem key={purchase.id} purchase={purchase} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't purchased any tickets yet.</p>
                    <Button onClick={() => setLocation('/')}>
                      Browse Events
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
