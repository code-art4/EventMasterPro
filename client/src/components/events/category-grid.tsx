import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryGrid() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="mt-3 w-16 h-4" />
          </div>
        ))}
      </div>
    );
  }

  const getCategoryIcon = (icon: string) => {
    return `fa-solid fa-${icon}`;
  };

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {categories?.map((category) => (
        <Link key={category.id} href={`/?categoryId=${category.id}`}>
          <div className="group cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-primary-100 group-hover:bg-primary-200 transition-colors duration-200">
                <i className={`${getCategoryIcon(category.icon)} text-primary-600 text-2xl`}></i>
              </div>
              <div className="mt-3">
                <h3 className="text-base font-medium text-gray-900 text-center">{category.name}</h3>
              </div>
            </div>
          </div>
        </Link>
      ))}
      <Link href="/">
        <div className="group cursor-pointer">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-primary-100 group-hover:bg-primary-200 transition-colors duration-200">
              <i className="fa-solid fa-ticket text-primary-600 text-2xl"></i>
            </div>
            <div className="mt-3">
              <h3 className="text-base font-medium text-gray-900 text-center">All Events</h3>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
