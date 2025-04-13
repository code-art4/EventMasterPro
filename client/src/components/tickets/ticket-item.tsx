import React from "react";
import { PurchaseWithDetails } from "@shared/schema";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TicketItemProps {
  purchase: PurchaseWithDetails;
  className?: string;
}

export default function TicketItem({ purchase, className }: TicketItemProps) {
  const isPastEvent = new Date(purchase.event.endDate) < new Date();

  return (
    <Card className={cn("bg-white", className)}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row overflow-hidden">
          <div className="md:w-1/3 relative">
            <img 
              src={purchase.event.imageUrl} 
              alt={purchase.event.title} 
              className="h-48 md:h-full w-full object-cover"
            />
            {isPastEvent && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white font-bold text-xl rotate-[-30deg] border-2 border-white px-4 py-1 rounded">
                  PAST EVENT
                </span>
              </div>
            )}
          </div>
          <div className="p-6 flex-1">
            <h3 className="text-xl font-bold text-gray-900">{purchase.event.title}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(purchase.event.startDate)}</span>
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{purchase.event.location}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-800">Your Tickets:</h4>
              <ul className="mt-2 space-y-2">
                {purchase.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.ticketType.name}</span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-gray-600 text-sm">Purchased on {formatDate(purchase.purchaseDate)}</span>
                <p className="font-bold text-gray-900">Total: {formatCurrency(purchase.totalAmount)}</p>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Tickets</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
