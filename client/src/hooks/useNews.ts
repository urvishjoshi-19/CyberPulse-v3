import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { useState, useEffect, useMemo } from "react";

interface UseNewsOptions {
  filterType?: string;
  selectedTags?: string[];
  searchQuery?: string;
}

export function useNews({ filterType = "all", selectedTags = [], searchQuery = "" }: UseNewsOptions = {}) {
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Fetch all articles
  const { data: articles = [], isLoading, error, refetch } = useQuery<Article[]>({
    queryKey: ['/api/news'],
  });
  
  // Fetch alert articles
  const { data: alertArticles = [] } = useQuery<Article[]>({
    queryKey: ['/api/alerts'],
    enabled: filterType === "alerts",
  });

  // Process and filter articles based on filterType, selectedTags, and searchQuery
  useEffect(() => {
    let filtered: Article[] = [];
    
    // Get the right base set of articles
    if (filterType === "alerts") {
      filtered = [...alertArticles];
    } else {
      filtered = [...articles];
      
      // Apply time-based filters
      if (filterType === "recent") {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        filtered = filtered.filter(article => {
          const articleDate = new Date(article.created_at);
          return articleDate >= oneDayAgo;
        });
      } else if (filterType === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(article => {
          const articleDate = new Date(article.created_at);
          return articleDate >= oneWeekAgo;
        });
      }
    }
    
    // Apply tag filters if any are selected
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article => 
        article.tags && selectedTags.some(tag => article.tags.includes(tag))
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.summary.toLowerCase().includes(query) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    setFilteredArticles(filtered);
  }, [articles, alertArticles, filterType, selectedTags, searchQuery]);
  
  // Extract all unique tags from articles
  useEffect(() => {
    const tags = new Set<string>();
    articles.forEach(article => {
      if (article.tags) {
        article.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags));
  }, [articles]);
  
  return {
    articles: filteredArticles,
    allArticles: articles,
    alertArticles,
    isLoading,
    error,
    refetch,
    allTags,
  };
}
