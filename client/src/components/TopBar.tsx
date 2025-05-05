import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export default function TopBar({ title, subtitle, showSearch = true, onSearch }: TopBarProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: alertArticles = [] } = useQuery<Article[]>({
    queryKey: ['/api/alerts'],
  });

  const alertCount = alertArticles.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleRefresh = async () => {
    try {
      toast({
        title: "Refreshing data",
        description: "Fetching the latest articles...",
      });

      const response = await apiRequest('POST', '/api/scrape', {});
      const result = await response.json();
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      
      toast({
        title: "Data refreshed",
        description: `Found ${result.articlesCount} articles with ${result.alertsCount} alerts.`,
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not fetch the latest data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-primary-dark border-b border-gray-800">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="hidden lg:block">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                {subtitle && (
                  <span className="ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent bg-opacity-20 text-accent-light">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {showSearch && (
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full sm:w-64 rounded-md bg-primary-light border border-gray-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                </button>
              </form>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-gray-400 hover:text-white"
              onClick={() => location === "/alerts" ? null : window.location.href = "/alerts"}
            >
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive"></span>
                </span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="hidden sm:flex items-center px-3 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-dark border-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"/>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
