import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  serviceFee?: number;
  onProceed?: () => void;
  buttonText?: string;
  isLoading?: boolean;
}

export default function OrderSummary({ 
  items, 
  serviceFee = 0, 
  onProceed, 
  buttonText = "Continue to Payment", 
  isLoading = false 
}: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + serviceFee;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {item.quantity} x {item.name}
            </span>
            <span className="text-gray-900 font-medium">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
        
        {serviceFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service Fee</span>
            <span className="text-gray-900 font-medium">{formatCurrency(serviceFee)}</span>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-900 font-medium">Total</span>
            <span className="text-gray-900 font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
      
      {onProceed && (
        <CardFooter>
          <Button 
            onClick={onProceed}
            className="w-full bg-primary-600 hover:bg-primary-700"
            disabled={items.length === 0 || isLoading}
          >
            {isLoading ? "Processing..." : buttonText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
