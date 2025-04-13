import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "MMM d, yyyy");
}

export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const parsedStartDate = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const parsedEndDate = typeof endDate === "string" ? parseISO(endDate) : endDate;
  
  // Same day
  if (format(parsedStartDate, "yyyy-MM-dd") === format(parsedEndDate, "yyyy-MM-dd")) {
    return format(parsedStartDate, "MMM d, yyyy");
  }
  
  // Same month and year
  if (format(parsedStartDate, "MMM yyyy") === format(parsedEndDate, "MMM yyyy")) {
    return `${format(parsedStartDate, "MMM d")} - ${format(parsedEndDate, "d, yyyy")}`;
  }
  
  // Same year
  if (format(parsedStartDate, "yyyy") === format(parsedEndDate, "yyyy")) {
    return `${format(parsedStartDate, "MMM d")} - ${format(parsedEndDate, "MMM d, yyyy")}`;
  }
  
  // Different years
  return `${format(parsedStartDate, "MMM d, yyyy")} - ${format(parsedEndDate, "MMM d, yyyy")}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatPriceRange(min: number, max: number): string {
  if (min === max) {
    return formatCurrency(min);
  }
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
