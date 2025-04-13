import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface SeatSelectionProps {
  rows: number;
  cols: number;
  unavailableSeats: number[][];
  onSeatSelect: (seats: number[][]) => void;
  selectedSeats?: number[][];
  className?: string;
}

export default function SeatSelection({
  rows,
  cols,
  unavailableSeats,
  onSeatSelect,
  selectedSeats = [],
  className,
}: SeatSelectionProps) {
  const [selected, setSelected] = useState<number[][]>(selectedSeats);

  const isSeatUnavailable = (row: number, col: number): boolean => {
    return unavailableSeats.some(([r, c]) => r === row && c === col);
  };

  const isSeatSelected = (row: number, col: number): boolean => {
    return selected.some(([r, c]) => r === row && c === col);
  };

  const toggleSeat = (row: number, col: number) => {
    if (isSeatUnavailable(row, col)) return;

    let newSelected;
    if (isSeatSelected(row, col)) {
      newSelected = selected.filter(([r, c]) => !(r === row && c === col));
    } else {
      newSelected = [...selected, [row, col]];
    }
    
    setSelected(newSelected);
    onSeatSelect(newSelected);
  };

  return (
    <div className={cn("bg-gray-50 p-4 rounded-lg", className)}>
      <div className="flex flex-col items-center">
        <div className="w-full bg-gray-200 text-center py-3 rounded-t-lg text-gray-700 font-medium">
          STAGE
        </div>
        
        <div className="my-8 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: rows }).map((_, row) => (
            React.Children.toArray(
              Array.from({ length: cols }).map((_, col) => {
                const isUnavailable = isSeatUnavailable(row, col);
                const isSelected = isSeatSelected(row, col);
                
                return (
                  <button
                    type="button"
                    className={cn(
                      "seat h-6 w-6 rounded transition-all duration-200", 
                      isUnavailable 
                        ? "bg-gray-300 cursor-not-allowed" 
                        : isSelected 
                          ? "bg-primary-600 hover:bg-primary-700 seat-selected" 
                          : "bg-primary-200 hover:bg-primary-400 cursor-pointer"
                    )}
                    onClick={() => toggleSeat(row, col)}
                    disabled={isUnavailable}
                    title={`Row ${row + 1}, Seat ${col + 1}`}
                    aria-label={`Row ${row + 1}, Seat ${col + 1}${isUnavailable ? ' (unavailable)' : isSelected ? ' (selected)' : ''}`}
                  />
                );
              })
            )
          ))}
        </div>
        
        <div className="w-full flex justify-center space-x-8">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-primary-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-primary-600 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
