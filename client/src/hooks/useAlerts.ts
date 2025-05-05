import { useQuery } from "@tanstack/react-query";
import { Article, Keyword } from "@shared/schema";
import { useMemo } from "react";

export function useAlerts() {
  // Fetch alert articles
  const { 
    data: alertArticles = [], 
    isLoading: isLoadingAlerts, 
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery<Article[]>({
    queryKey: ['/api/alerts'],
  });
  
  // Fetch keywords
  const { 
    data: keywords = [], 
    isLoading: isLoadingKeywords, 
    error: keywordsError,
    refetch: refetchKeywords
  } = useQuery<Keyword[]>({
    queryKey: ['/api/keywords'],
  });
  
  // Get stats by keyword
  const keywordStats = useMemo(() => {
    const stats: Record<string, { count: number, articles: Article[] }> = {};
    
    // Initialize stats for all keywords
    keywords.forEach(keyword => {
      stats[keyword.word] = { count: 0, articles: [] };
    });
    
    // Count articles per keyword
    alertArticles.forEach(article => {
      if (article.matched_keywords) {
        article.matched_keywords.forEach(keyword => {
          if (stats[keyword]) {
            stats[keyword].count += 1;
            stats[keyword].articles.push(article);
          }
        });
      }
    });
    
    return stats;
  }, [alertArticles, keywords]);
  
  // Get top keywords by match count
  const topKeywords = useMemo(() => {
    return [...keywords]
      .filter(k => k.enabled)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 5);
  }, [keywords]);
  
  // Get recent alerts (last 24 hours)
  const recentAlerts = useMemo(() => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return alertArticles.filter(article => {
      const articleDate = new Date(article.created_at);
      return articleDate >= oneDayAgo;
    });
  }, [alertArticles]);
  
  return {
    alertArticles,
    keywords,
    keywordStats,
    topKeywords,
    recentAlerts,
    isLoading: isLoadingAlerts || isLoadingKeywords,
    error: alertsError || keywordsError,
    refetch: () => {
      refetchAlerts();
      refetchKeywords();
    }
  };
}
