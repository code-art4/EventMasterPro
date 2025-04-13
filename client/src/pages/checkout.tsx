import React, { useContext, useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "../App";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { EventWithDetails, TicketType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CheckoutSteps from "@/components/ui/checkout-steps";
import OrderSummary from "@/components/tickets/order-summary";
import { CreditCard, Loader2, Lock, TicketIcon } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface CheckoutFormState {
  fullName: string;
  email: string;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
}

export default function Checkout() {
  const { eventId } = useParams<{ eventId: string }>();
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
  const [selectedSeats, setSelectedSeats] = useState<number[][]>([]);
  const [formState, setFormState] = useState<CheckoutFormState>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation(`/login?redirect=/checkout/${eventId}`);
    }
  }, [authLoading, isAuthenticated, setLocation, eventId]);

  // Get event details
  const { data: event, isLoading: eventLoading } = useQuery<EventWithDetails>({
    queryKey: [`/api/events/${eventId}`],
    enabled: isAuthenticated,
    onSuccess: (data) => {
      // Restore selected tickets from localStorage
      try {
        const storedTickets = localStorage.getItem("selectedTickets");
        const storedSeats = localStorage.getItem("selectedSeats");
        
        if (storedTickets) {
          const parsedTickets = JSON.parse(storedTickets);
          setSelectedTickets(parsedTickets);
          
          // Calculate items and total
          const ticketItems: OrderItem[] = [];
          let total = 0;
          
          for (const ticketTypeId in parsedTickets) {
            const quantity = parsedTickets[ticketTypeId];
            const ticketType = data.ticketTypes.find(t => t.id === parseInt(ticketTypeId));
            
            if (ticketType && quantity > 0) {
              ticketItems.push({
                name: ticketType.name,
                quantity,
                price: ticketType.price
              });
              
              total += ticketType.price * quantity;
            }
          }
          
          const serviceFee = 5.99; // Hardcoded for simplicity
          total += serviceFee;
          
          setItems(ticketItems);
          setTotalAmount(total);
        }
        
        if (storedSeats) {
          setSelectedSeats(JSON.parse(storedSeats));
        }
      } catch (e) {
        console.error("Error restoring selected tickets:", e);
      }
    }
  });

  // Purchase tickets mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      // Prepare purchase data
      const purchaseItems = [];
      for (const ticketTypeId in selectedTickets) {
        const quantity = selectedTickets[ticketTypeId];
        const ticketType = event?.ticketTypes.find(t => t.id === parseInt(ticketTypeId));
        
        if (ticketType && quantity > 0) {
          purchaseItems.push({
            ticketTypeId: parseInt(ticketTypeId),
            quantity,
            price: ticketType.price,
            seatInfo: event?.hasSeating ? { selectedSeats } : null
          });
        }
      }
      
      const purchaseData = {
        purchase: {
          eventId: parseInt(eventId),
          totalAmount
        },
        items: purchaseItems
      };
      
      // Make API request
      const response = await apiRequest("POST", "/api/purchases", purchaseData);
      return response.json();
    },
    onSuccess: () => {
      // Clear the localStorage
      localStorage.removeItem("selectedTickets");
      localStorage.removeItem("selectedSeats");
      
      // Show success message
      toast({
        title: "Purchase Complete!",
        description: "Your tickets have been purchased successfully.",
      });
      
      // Invalidate tickets query and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/purchases/me"] });
      setLocation("/tickets");
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
      console.error("Purchase error:", error);
    }
  });

  // Steps configuration
  const steps = [
    { id: 1, name: "Tickets" },
    { id: 2, name: "Details" },
    { id: 3, name: "Payment" },
  ];

  // Form change handler
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Continue to next step
  const handleContinue = () => {
    if (step < steps.length) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  // Complete purchase
  const handleCompletePurchase = async () => {
    setIsProcessing(true);
    try {
      await purchaseMutation.mutateAsync();
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || eventLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Event not found</h1>
        <p className="mt-4 text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-8" onClick={() => setLocation("/")}>Back to Home</Button>
      </div>
    );
  }

  // If no tickets are selected or there's a problem, redirect to event page
  if (items.length === 0) {
    toast({
      title: "No tickets selected",
      description: "Please select tickets before proceeding to checkout.",
      variant: "destructive",
    });
    setLocation(`/events/${eventId}`);
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CheckoutSteps steps={steps} currentStep={step} className="bg-white rounded-lg mb-6" />
        
        <div className="space-y-6">
          {/* Step 1: Review Tickets */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Review Your Order</h2>
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{event.title}</h3>
                  <p className="text-gray-500">{event.location}</p>
                </div>
                
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                        <p className="text-sm text-gray-500">
                          {item.quantity > 1 ? `${formatCurrency(item.price)} each` : ''}
                        </p>
                      </div>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  
                  {event.hasSeating && selectedSeats.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium mb-2">Selected Seats:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.map(([row, col], idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Row {row + 1}, Seat {col + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              <OrderSummary 
                items={items}
                serviceFee={5.99}
                onProceed={handleContinue}
                buttonText="Continue to Details"
              />
            </div>
          )}
          
          {/* Step 2: Customer Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Customer Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formState.fullName}
                      onChange={handleFormChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleFormChange}
                      className="mt-1"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Your tickets will be sent to this email
                    </p>
                  </div>
                </div>
              </Card>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleContinue}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Payment Information</h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <Lock className="h-4 w-4 mr-1" />
                    Secure Payment
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      value={formState.cardName}
                      onChange={handleFormChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formState.cardNumber}
                      onChange={handleFormChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Expiration Date</Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formState.cardExpiry}
                        onChange={handleFormChange}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCVC">CVC</Label>
                      <Input
                        id="cardCVC"
                        name="cardCVC"
                        placeholder="123"
                        value={formState.cardCVC}
                        onChange={handleFormChange}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="rounded-md bg-gray-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <TicketIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-primary-800">Secure Checkout</h3>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Your payment information is processed securely. We do not store credit card details.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-medium text-lg mb-4">Order Summary</h3>
                
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between py-2">
                  <span>Service Fee</span>
                  <span>{formatCurrency(5.99)}</span>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </Card>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleCompletePurchase}
                  disabled={isProcessing}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
