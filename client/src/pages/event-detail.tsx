import React, { useState, useContext } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EventWithDetails, TicketType } from "@shared/schema";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import SeatSelection from "@/components/events/seat-selection";
import OrderSummary from "@/components/tickets/order-summary";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Share2, 
  Music, 
  Flame 
} from "lucide-react";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  const { toast } = useToast();
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
  const [selectedSeats, setSelectedSeats] = useState<number[][]>([]);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const { data: event, isLoading } = useQuery<EventWithDetails>({
    queryKey: [`/api/events/${id}`],
  });

  const handleTicketQuantityChange = (ticketTypeId: number, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: quantity
    }));
  };

  const handleSeatSelect = (seats: number[][]) => {
    setSelectedSeats(seats);
  };

  const getTotalItems = () => {
    const items = [];
    
    if (event?.ticketTypes) {
      for (const ticketType of event.ticketTypes) {
        const quantity = selectedTickets[ticketType.id] || 0;
        if (quantity > 0) {
          items.push({
            name: ticketType.name,
            quantity,
            price: ticketType.price
          });
        }
      }
    }
    
    return items;
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setIsLoginDialogOpen(true);
      return;
    }
    
    if (Object.values(selectedTickets).reduce((a, b) => a + b, 0) === 0) {
      toast({
        title: "No tickets selected",
        description: "Please select at least one ticket to continue",
        variant: "destructive"
      });
      return;
    }

    // Store selected tickets and seats in localStorage for checkout
    localStorage.setItem('selectedTickets', JSON.stringify(selectedTickets));
    localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    
    setLocation(`/checkout/${id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out ${event?.title} on Eventify!`,
        url: window.location.href,
      }).catch(err => {
        toast({
          title: "Couldn't share",
          description: "There was a problem sharing this event.",
          variant: "destructive"
        });
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copied!",
          description: "Event link copied to clipboard."
        });
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold">Event not found</h1>
        <p className="mt-4 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-8" onClick={() => setLocation("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="bg-white pb-16">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-40"
            src={event.imageUrl}
            alt={event.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="md:ml-auto md:w-1/2 md:pl-10">
            <div className="text-base text-white mb-2 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <time>{formatDateRange(event.startDate, event.endDate)}</time>
              <div className="mx-2">•</div>
              <MapPin className="h-5 w-5 mr-2" />
              <span>{event.location}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              {event.title}
            </h1>
            <div className="flex items-center mt-6 space-x-4">
              <div className="bg-black bg-opacity-50 rounded-full px-4 py-2 flex items-center">
                <Users className="h-5 w-5 text-white mr-2" />
                <span className="text-white text-sm">12,500+ attending</span>
              </div>
              <Button variant="outline" className="rounded-full px-4 py-2 bg-black/50 border-0 text-white" onClick={handleShare}>
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Event Details</h2>
              {event.isTrending && (
                <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">
                  <Flame className="h-4 w-4 mr-1 text-pink-500" />
                  Hot Event
                </Badge>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold">About this event</h3>
              <div className="mt-3 prose max-w-none text-gray-600">
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Lineup or other event details */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold">Lineup</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center">
                  <Music className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-600">The Weekend</span>
                </li>
                <li className="flex items-center">
                  <Music className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-600">Billie Eilish</span>
                </li>
                <li className="flex items-center">
                  <Music className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-600">Imagine Dragons</span>
                </li>
                <li className="flex items-center">
                  <Music className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-600">Dua Lipa</span>
                </li>
                <li className="flex items-center">
                  <Music className="h-5 w-5 text-primary-500 mr-2" />
                  <span className="text-gray-600">And many more...</span>
                </li>
              </ul>
            </div>

            {/* Location */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold">Location</h3>
              <p className="mt-2 text-gray-600">{event.location}</p>
              <div className="mt-4 bg-gray-100 rounded-lg h-[200px] flex items-center justify-center">
                <span className="text-gray-500">Interactive map would load here</span>
              </div>
            </div>

            {/* Seating Map (if applicable) */}
            {event.hasSeating && event.seatingMap && (
              <div className="mt-10">
                <h3 className="text-xl font-semibold">Select Your Seats</h3>
                <p className="mt-2 text-gray-600">
                  Choose where you'd like to sit for {event.title}
                </p>
                <SeatSelection
                  rows={event.seatingMap.rows}
                  cols={event.seatingMap.cols}
                  unavailableSeats={event.seatingMap.unavailableSeats}
                  onSeatSelect={handleSeatSelect}
                  selectedSeats={selectedSeats}
                  className="mt-4"
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-6">
                <h3 className="text-xl font-semibold">Select Tickets</h3>
                
                <div className="mt-4 space-y-4">
                  {event.ticketTypes.map((ticketType) => (
                    <div 
                      key={ticketType.id}
                      className={`border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-primary-500 cursor-pointer transition ${
                        (selectedTickets[ticketType.id] || 0) > 0 ? 'border-primary-500' : ''
                      }`}
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{ticketType.name}</h4>
                        <p className="text-sm text-gray-500">{ticketType.description}</p>
                        {ticketType.available <= 10 && ticketType.available > 0 && (
                          <p className="text-xs text-red-500 mt-1">Only {ticketType.available} left</p>
                        )}
                        {ticketType.available === 0 && (
                          <p className="text-xs text-red-500 mt-1">Sold out</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-900 font-bold mr-4">{formatCurrency(ticketType.price)}</span>
                        <div className="flex items-center">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                              const currentQty = selectedTickets[ticketType.id] || 0;
                              handleTicketQuantityChange(ticketType.id, Math.max(0, currentQty - 1));
                            }}
                            disabled={!selectedTickets[ticketType.id]}
                          >
                            <span>-</span>
                          </Button>
                          <span className="mx-3 w-6 text-center">{selectedTickets[ticketType.id] || 0}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200"
                            onClick={() => {
                              const currentQty = selectedTickets[ticketType.id] || 0;
                              if (currentQty < ticketType.available) {
                                handleTicketQuantityChange(ticketType.id, currentQty + 1);
                              }
                            }}
                            disabled={ticketType.available === 0 || (selectedTickets[ticketType.id] || 0) >= ticketType.available}
                          >
                            <span>+</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <OrderSummary 
                    items={getTotalItems()}
                    serviceFee={5.99}
                    onProceed={handleProceedToCheckout}
                    buttonText="Proceed to Checkout"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to continue</DialogTitle>
            <DialogDescription>
              You need to be logged in to purchase tickets.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-4">
            <Button onClick={() => setLocation("/login")}>
              Log in
            </Button>
            <Button variant="outline" onClick={() => setLocation("/register")}>
              Create an account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
