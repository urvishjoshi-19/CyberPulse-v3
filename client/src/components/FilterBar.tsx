import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  onViewChange: (view: "grid" | "list") => void;
  currentView: "grid" | "list";
}

export default function FilterBar({
  tags,
  selectedTags,
  onTagToggle,
  filterType,
  onFilterTypeChange,
  onViewChange,
  currentView
}: FilterBarProps) {
  // Get unique tags and sort alphabetically
  const uniqueTags = [...new Set(tags)].sort();
  
  return (
    <div className="bg-primary rounded-lg p-4 mb-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div>
            <label htmlFor="filter-type" className="text-sm font-medium text-gray-300 mr-2">Filter by:</label>
            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger id="filter-type" className="w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-700 bg-primary-light text-white">
                <SelectValue placeholder="All Articles" />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-primary text-white">
                <SelectItem value="all">All Articles</SelectItem>
                <SelectItem value="alerts">Alerts Only</SelectItem>
                <SelectItem value="recent">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-300">Tags:</span>
            {uniqueTags.slice(0, 5).map(tag => {
              const isSelected = selectedTags.includes(tag);
              const isAlert = tag.toLowerCase() === "ransomware" || tag.toLowerCase() === "zero-day" || tag.toLowerCase() === "cve" || tag.toLowerCase() === "phishing" || tag.toLowerCase() === "apt";
              
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium",
                    isSelected ? "bg-accent border-accent text-white" : "",
                    !isSelected && isAlert 
                      ? "bg-destructive/15 text-destructive-foreground border-destructive/30" 
                      : !isSelected 
                        ? "bg-accent/15 text-accent-light border-accent/30"
                        : ""
                  )}
                  onClick={() => onTagToggle(tag)}
                >
                  {isAlert && !isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 inline" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  )}
                  {tag}
                </Badge>
              );
            })}
            {uniqueTags.length > 5 && (
              <Badge variant="outline" className="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium bg-primary-light border-gray-700 text-gray-300">
                +{uniqueTags.length - 5} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "bg-primary-light border-r border-gray-700 rounded-l-md rounded-r-none text-gray-400 hover:text-white",
                currentView === "grid" && "text-white"
              )}
              onClick={() => onViewChange("grid")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "bg-primary-light rounded-r-md rounded-l-none text-gray-400 hover:text-white",
                currentView === "list" && "text-white"
              )}
              onClick={() => onViewChange("list")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
