import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event, Category } from "@shared/schema";
import HeroSection from "@/components/hero-section";
import CategoryGrid from "@/components/events/category-grid";
import EventGrid from "@/components/events/event-grid";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [location] = useLocation();
  const [queryParams, setQueryParams] = useState<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    setQueryParams(new URLSearchParams(location.split("?")[1]));
  }, [location]);

  const categoryId = queryParams.get("categoryId");
  const search = queryParams.get("search");
  const locationParam = queryParams.get("location");

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch trending events
  const { data: trendingEvents, isLoading: isTrendingLoading } = useQuery<Event[]>({
    queryKey: ["/api/events/trending"],
  });

  // Fetch filtered events
  const { data: filteredEvents, isLoading: isFilteredLoading } = useQuery<Event[]>({
    queryKey: [
      "/api/events", 
      categoryId ? { categoryId: Number(categoryId) } : undefined,
      search ? { search } : undefined
    ],
    enabled: !!categoryId || !!search || !!locationParam
  });

  // Determine which category is currently selected
  const selectedCategory = categoryId && categories
    ? categories.find(c => c.id === Number(categoryId))
    : null;

  // Determine title based on filters
  const getFilterTitle = () => {
    if (selectedCategory) {
      return `${selectedCategory.name} Events`;
    } else if (search) {
      return `Results for "${search}"`;
    } else if (locationParam && locationParam !== "Anywhere") {
      return `Events in ${locationParam}`;
    }
    return "All Events";
  };

  return (
    <div>
      <HeroSection />

      {/* Featured Categories */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Browse by Category</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Find exactly what you're looking for with our curated categories
            </p>
          </div>

          <div className="mt-10">
            <CategoryGrid />
          </div>
        </div>
      </div>

      {/* Filtered Events Section (conditional) */}
      {(categoryId || search || locationParam) && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{getFilterTitle()}</h2>
              {search && (
                <p className="mt-2 text-lg text-gray-500">
                  Showing results for "{search}" {locationParam && locationParam !== "Anywhere" ? `in ${locationParam}` : ""}
                </p>
              )}
            </div>

            <EventGrid 
              events={filteredEvents} 
              isLoading={isFilteredLoading} 
              emptyMessage="No events found matching your criteria. Try adjusting your search."
            />
          </div>
        </div>
      )}

      {/* Trending Events Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Trending Events</h2>
              <p className="mt-2 text-lg text-gray-500">
                Don't miss out on the hottest events happening now
              </p>
            </div>
            <a href="#" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View all
              <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          <EventGrid events={trendingEvents} isLoading={isTrendingLoading} />
        </div>
      </div>
    </div>
  );
}
