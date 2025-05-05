import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Article } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";

interface AlertNotificationProps {
  alertArticles: Article[];
}

export default function AlertNotification({ alertArticles }: AlertNotificationProps) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed || alertArticles.length === 0) {
    return null;
  }
  
  // Get unique matched keywords
  const allKeywords: string[] = [];
  alertArticles.forEach(article => {
    if (article.matched_keywords) {
      allKeywords.push(...article.matched_keywords);
    }
  });
  const uniqueKeywords = [...new Set(allKeywords)];
  
  // Format keywords for display
  const keywordsText = uniqueKeywords
    .slice(0, 3)
    .map(keyword => `<span class="font-semibold">${keyword}</span>`)
    .join(", ");
  
  const additionalKeywords = uniqueKeywords.length > 3 
    ? ` and ${uniqueKeywords.length - 3} more` 
    : "";

  return (
    <Alert variant="destructive" className="bg-destructive/10 border border-destructive text-gray-100 mb-6">
      <div className="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 text-destructive" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>
        <div className="flex-1">
          <AlertTitle className="text-sm font-medium text-destructive mb-1">
            Alert: {alertArticles.length} new {alertArticles.length === 1 ? 'article matches' : 'articles match'} your keyword filters
          </AlertTitle>
          <AlertDescription className="text-sm text-gray-300">
            <div dangerouslySetInnerHTML={{ 
              __html: `New articles contain mentions of ${keywordsText}${additionalKeywords} keywords you're tracking.` 
            }} />
            <div className="mt-3 flex items-center">
              <Link href="/alerts">
                <Button variant="link" className="p-0 text-accent hover:text-accent-light">
                  View all alerts
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Button>
              </Link>
              <Button 
                variant="link" 
                className="ml-6 p-0 text-gray-400 hover:text-white" 
                onClick={() => setDismissed(true)}
              >
                Dismiss
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
