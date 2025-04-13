import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  onSubmit
}: SearchBarProps) {
  const locations = [
    "Anywhere",
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas"
  ];

  return (
    <form onSubmit={onSubmit} className="w-full sm:flex sm:max-w-lg lg:justify-start">
      <div className="relative rounded-md w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events, artists, or venues"
          className="pl-10 pr-24 py-6 rounded-lg text-gray-900 w-full"
        />
        <div className="absolute inset-y-0 right-0 flex items-center mr-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="border-0 bg-transparent w-[120px] h-8 text-gray-500 focus:ring-0">
              <SelectValue placeholder="Anywhere" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-3 sm:mt-0 sm:ml-3">
        <Button 
          type="submit" 
          className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-lg px-8 py-6 text-base font-medium transition duration-150 ease-in-out"
        >
          <Search className="h-5 w-5 mr-2" />
          Find Events
        </Button>
      </div>
    </form>
  );
}
