import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Keyword } from "@shared/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();
  const [newKeyword, setNewKeyword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: keywords = [] } = useQuery<Keyword[]>({
    queryKey: ['/api/keywords'],
  });

  const alertKeywords = keywords.filter(k => k.enabled);
  
  // Group keywords by number of matches (high, medium, low)
  const highPriorityKeywords = alertKeywords.filter(k => k.matches >= 8);
  const mediumPriorityKeywords = alertKeywords.filter(k => k.matches >= 3 && k.matches < 8);
  const lowPriorityKeywords = alertKeywords.filter(k => k.matches < 3);

  // Handle adding a new keyword
  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    
    try {
      await apiRequest('POST', '/api/keywords', { word: newKeyword, enabled: true });
      await queryClient.invalidateQueries({ queryKey: ['/api/keywords'] });
      setNewKeyword("");
      setIsDialogOpen(false);
      toast({
        title: "Keyword added",
        description: `"${newKeyword}" has been added to your alert keywords.`,
      });
    } catch (error) {
      toast({
        title: "Error adding keyword",
        description: "Could not add the keyword. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="bg-primary-dark w-full lg:w-64 lg:min-h-screen lg:fixed lg:top-0 lg:left-0 lg:overflow-y-auto z-10">
        <div className="p-4 flex lg:flex-col items-center lg:items-start justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-accent rounded-md flex items-center justify-center mr-2">
              <i className="fas fa-shield-alt text-white"></i>
            </div>
            <h1 className="text-xl font-bold text-white">CyberPulse</h1>
          </div>
          
          <button 
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary-light" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <path d="M18 6 6 18M6 6l12 12"/>
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18"/>
              )}
            </svg>
          </button>
        </div>
        
        <div className={`lg:block lg:h-[calc(100vh-4rem)] overflow-y-auto p-4 ${isMobileMenuOpen ? '' : 'hidden'}`}>
          <nav>
            <div className="space-y-4">
              <Link href="/">
                <a className={`flex items-center px-3 py-2 rounded-md ${location === "/" ? "bg-accent text-white" : "text-gray-300 hover:bg-primary-light hover:text-white transition"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                    <path d="M18 14h-8"/>
                    <path d="M15 18h-5"/>
                    <path d="M10 6h8v4h-8V6Z"/>
                  </svg>
                  <span>News Feed</span>
                </a>
              </Link>
              
              <Link href="/alerts">
                <a className={`flex items-center px-3 py-2 rounded-md ${location === "/alerts" ? "bg-accent text-white" : "text-gray-300 hover:bg-primary-light hover:text-white transition"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                  </svg>
                  <span>Alerts</span>
                  {highPriorityKeywords.length > 0 && (
                    <span className="ml-auto bg-destructive text-white text-xs px-2 py-1 rounded-full">
                      {highPriorityKeywords.length}
                    </span>
                  )}
                </a>
              </Link>
              
              <Link href="/settings">
                <a className={`flex items-center px-3 py-2 rounded-md ${location === "/settings" ? "bg-accent text-white" : "text-gray-300 hover:bg-primary-light hover:text-white transition"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>Settings</span>
                </a>
              </Link>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                KEYWORD ALERTS
              </h2>
              <div className="mt-3 space-y-2">
                {highPriorityKeywords.map(keyword => (
                  <div key={keyword.id} className="flex items-center px-3 py-1.5 text-sm text-white">
                    <span className="w-3 h-3 rounded-full bg-destructive mr-2"></span>
                    <span>{keyword.word}</span>
                    <span className="ml-auto text-gray-400 text-xs">{keyword.matches} matches</span>
                  </div>
                ))}
                {mediumPriorityKeywords.map(keyword => (
                  <div key={keyword.id} className="flex items-center px-3 py-1.5 text-sm text-white">
                    <span className="w-3 h-3 rounded-full bg-warning-500 mr-2"></span>
                    <span>{keyword.word}</span>
                    <span className="ml-auto text-gray-400 text-xs">{keyword.matches} matches</span>
                  </div>
                ))}
                {lowPriorityKeywords.map(keyword => (
                  <div key={keyword.id} className="flex items-center px-3 py-1.5 text-sm text-white">
                    <span className="w-3 h-3 rounded-full bg-primary-light mr-2"></span>
                    <span>{keyword.word}</span>
                    <span className="ml-auto text-gray-400 text-xs">{keyword.matches} matches</span>
                  </div>
                ))}
                {alertKeywords.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    No keywords configured
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 px-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-primary-light hover:bg-accent text-white border-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                      <path d="M12 5v14"/>
                    </svg>
                    Add Keyword
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-primary border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add Alert Keyword</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddKeyword} className="space-y-4 pt-4">
                    <Input
                      placeholder="Enter keyword (e.g., ransomware)"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="bg-primary-light border-gray-700 text-white"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-700 text-gray-300 hover:bg-primary-light hover:text-white">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-accent hover:bg-accent-dark text-white">
                        Add
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
