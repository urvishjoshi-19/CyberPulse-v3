import { Article } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  const hasAlert = article.alert;
  const placeholderImage = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

  // Function to check if a tag is a matched keyword
  const isAlertTag = (tag: string) => {
    if (!article.matched_keywords) return false;
    return article.matched_keywords.includes(tag.toLowerCase());
  };

  return (
    <Card className={cn(
      "transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden",
      "bg-primary border-gray-800",
      hasAlert && "border-l-4 border-destructive"
    )}>
      <div className="relative h-48 overflow-hidden bg-gray-900">
        <img 
          src={article.image_url || placeholderImage} 
          alt={article.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImage;
          }}
        />
        {hasAlert && (
          <div className="absolute top-0 right-0 m-2">
            <Badge variant="destructive" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Alert
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {article.tags && article.tags.map((tag, index) => (
            <Badge 
              key={`${tag}-${index}`} 
              variant={isAlertTag(tag) ? "destructive" : "outline"}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                isAlertTag(tag) ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-accent/15 text-accent-light border-accent/30"
              )}
            >
              {isAlertTag(tag) && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-3">{article.summary}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{article.date}</span>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent hover:text-accent-light text-sm font-medium flex items-center"
          >
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
