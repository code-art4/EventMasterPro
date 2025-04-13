import React from "react";
import { Event } from "@shared/schema";
import { Link } from "wouter";
import { cn, formatCurrency, formatDateRange, truncateText } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Ticket } from "lucide-react";

interface EventCardProps {
  event: Event;
  className?: string;
}

export default function EventCard({ event, className }: EventCardProps) {
  // Find the minimum and maximum price from the event's ticket types (would normally come from the API)
  const minPrice = 59;
  const maxPrice = 199;

  // Format the date range
  const dateRange = formatDateRange(event.startDate, event.endDate);

  // Prevent link navigation when clicking on the button
  const handleGetTicketsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/events/${event.id}`;
  };

  return (
    <article className={cn("event-card bg-white rounded-xl shadow-md overflow-hidden", className)}>
      <Link href={`/events/${event.id}`}>
        <div className="relative">
          <img
            className="h-48 w-full object-cover"
            src={event.imageUrl}
            alt={event.title}
          />
          {event.isTrending && (
            <div className="absolute top-0 right-0 mt-4 mr-4">
              <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">
                <Flame className="h-3 w-3 mr-1 text-pink-500" />
                Hot
              </Badge>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center">
            <time className="block text-sm font-medium text-primary-600">
              {dateRange}
            </time>
            <div className="mx-2 text-gray-300">•</div>
            <span className="text-sm text-gray-500">{event.location}</span>
          </div>
          <h3 className="mt-2 text-xl font-semibold">
            <span className="text-gray-900 hover:text-primary-600 transition">
              {event.title}
            </span>
          </h3>
          <p className="mt-2 text-base text-gray-500 line-clamp-2">
            {truncateText(event.description, 100)}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-gray-900 font-bold">
                {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
              </span>
            </div>
            <Button
              onClick={handleGetTicketsClick}
              variant="outline"
              className="text-primary-700 bg-primary-100 hover:bg-primary-200 border-none"
              size="sm"
            >
              <Ticket className="h-4 w-4 mr-1" />
              Get Tickets
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
}
