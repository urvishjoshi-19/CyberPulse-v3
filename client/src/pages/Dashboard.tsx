import { useState } from "react";
import TopBar from "@/components/TopBar";
import AlertNotification from "@/components/AlertNotification";
import FilterBar from "@/components/FilterBar";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { useNews } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [filterType, setFilterType] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { 
    articles, 
    alertArticles, 
    isLoading, 
    error, 
    allTags 
  } = useNews({ filterType, selectedTags, searchQuery });

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Calculate pagination
  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = articles.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar 
        title="News Dashboard" 
        subtitle="Live Feed" 
        onSearch={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }} 
      />
      
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">Latest Cybersecurity News</h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 mr-1.5 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Last updated: <span className="ml-1 font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar 
          tags={allTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          onViewChange={setCurrentView}
          currentView={currentView}
        />
        
        {/* Alert Notification */}
        {alertArticles.length > 0 && (
          <AlertNotification alertArticles={alertArticles} />
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-white p-4 rounded-md mb-6">
            <h3 className="text-lg font-medium text-destructive">Error loading articles</h3>
            <p className="mt-1 text-sm">Failed to fetch the latest news. Please try refreshing the page.</p>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && articles.length === 0 && (
          <div className="bg-primary border border-gray-700 text-white p-6 rounded-md text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">No articles found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery ? 
                `No results for "${searchQuery}"` : 
                selectedTags.length ? 
                  "No articles match the selected tags" : 
                  "No articles available"}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedTags([]);
                setSearchQuery("");
                setFilterType("all");
              }}
              className="bg-primary-light border-gray-700 text-white hover:bg-accent"
            >
              Reset Filters
            </Button>
          </div>
        )}
        
        {/* News Grid */}
        <div className={
          currentView === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col space-y-6"
        }>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-primary border border-gray-800 rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full bg-gray-800" />
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Skeleton className="h-5 w-16 bg-gray-800 rounded-full" />
                    <Skeleton className="h-5 w-20 bg-gray-800 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-full bg-gray-800 mb-2" />
                  <Skeleton className="h-6 w-3/4 bg-gray-800 mb-2" />
                  <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
                  <Skeleton className="h-4 w-5/6 bg-gray-800 mb-2" />
                  <Skeleton className="h-4 w-4/6 bg-gray-800 mb-2" />
                  <div className="flex items-center justify-between mt-4">
                    <Skeleton className="h-4 w-24 bg-gray-800" />
                    <Skeleton className="h-4 w-20 bg-gray-800" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            currentArticles.map(article => (
              <NewsCard key={article.id} article={article} />
            ))
          )}
        </div>
        
        {/* Pagination */}
        {!isLoading && !error && articles.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="border-gray-700 text-gray-300 hover:bg-primary-light"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="ml-3 border-gray-700 text-gray-300 hover:bg-primary-light"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, articles.length)}</span> of <span className="font-medium">{articles.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-primary-dark text-sm text-gray-300 hover:bg-primary-light"
                  >
                    <span className="sr-only">Previous</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          pageNum === currentPage 
                            ? "bg-accent border-accent text-white z-10" 
                            : "bg-primary-dark border-gray-700 text-gray-300 hover:bg-primary-light"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-primary-dark text-sm text-gray-400">
                        ...
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(totalPages)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-primary-dark text-sm text-gray-300 hover:bg-primary-light"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-primary-dark text-sm text-gray-300 hover:bg-primary-light"
                  >
                    <span className="sr-only">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
