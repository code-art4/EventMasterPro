import React from "react";
import { Event } from "@shared/schema";
import EventCard from "./event-card";
import { Skeleton } from "@/components/ui/skeleton";

interface EventGridProps {
  events: Event[] | undefined;
  isLoading: boolean;
  emptyMessage?: string;
}

export default function EventGrid({ events, isLoading, emptyMessage = "No events found." }: EventGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(4).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-6">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
