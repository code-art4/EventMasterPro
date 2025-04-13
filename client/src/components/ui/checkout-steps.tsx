import React from "react";
import { cn } from "@/lib/utils";

interface CheckoutStep {
  id: number;
  name: string;
}

interface CheckoutStepsProps {
  steps: CheckoutStep[];
  currentStep: number;
  className?: string;
}

export default function CheckoutSteps({ steps, currentStep, className }: CheckoutStepsProps) {
  return (
    <div className={cn("bg-gray-50 px-4 py-5 sm:px-6 border-b border-gray-200", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Secure Your Tickets</h3>
        <div className="flex items-center">
          <ol className="flex items-center">
            {steps.map((step, index) => (
              <li key={step.id} className="relative flex items-center">
                <div 
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    step.id <= currentStep ? "bg-primary-600" : "bg-gray-300"
                  )}
                >
                  <span className="text-white font-medium text-sm">{step.id}</span>
                </div>
                <span 
                  className={cn(
                    "ml-2 text-sm font-medium",
                    step.id <= currentStep ? "text-primary-600" : "text-gray-500"
                  )}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "ml-4 h-0.5 w-10",
                      step.id < currentStep ? "bg-primary-600" : "bg-gray-300"
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
