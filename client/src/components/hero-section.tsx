import React, { useState } from "react";
import { useLocation } from "wouter";
import SearchBar from "./events/search-bar";

export default function HeroSection() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Anywhere");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    if (searchQuery) {
      queryParams.set("search", searchQuery);
    }
    
    if (selectedLocation && selectedLocation !== "Anywhere") {
      queryParams.set("location", selectedLocation);
    }
    
    const queryString = queryParams.toString();
    setLocation(`/?${queryString}`);
  };

  return (
    <div className="relative bg-primary-600 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-primary-600 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-primary-600 transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
          <div className="pt-10 sm:pt-16 lg:pt-8 xl:pt-16">
            <div className="sm:text-center lg:text-left px-4 sm:px-8">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl animate-fade-in">
                <span className="block">Find your next</span>
                <span className="block text-pink-400">unforgettable experience</span>
              </h1>
              <p className="mt-3 text-base text-primary-200 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 animate-slide-up">
                Discover and book tickets for concerts, theater shows, festivals, sports,
                and more. Create memories that last a lifetime.
              </p>

              <div className="mt-8 sm:mt-12 sm:flex sm:justify-center lg:justify-start">
                <SearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                  onSubmit={handleSearch}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1567&q=80"
          alt="Concert crowd"
        />
      </div>
    </div>
  );
}
