import { useState } from "react";
import TopBar from "@/components/TopBar";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { useAlerts } from "@/hooks/useAlerts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Alerts() {
  const [currentTab, setCurrentTab] = useState("all");
  const {
    alertArticles,
    keywords,
    keywordStats,
    topKeywords,
    recentAlerts,
    isLoading
  } = useAlerts();

  // Calculate the total number of matched articles
  const totalAlerts = alertArticles.length;
  
  // Find the keyword with the most matches
  const topKeyword = topKeywords.length > 0 ? topKeywords[0] : null;
  
  // Calculate the percentage of recent alerts
  const recentAlertsPercentage = Math.round((recentAlerts.length / Math.max(totalAlerts, 1)) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar 
        title="Alert Center" 
        subtitle={`${totalAlerts} Alerts`} 
        showSearch={false}
      />
      
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8">
        {/* Alert Overview */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Alert Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Alerts Card */}
            <Card className="bg-primary border-gray-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">Total Alerts</CardDescription>
                <CardTitle className="text-3xl font-bold text-white">
                  {isLoading ? <Skeleton className="h-10 w-16 bg-gray-800" /> : totalAlerts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  {isLoading ? (
                    <Skeleton className="h-4 w-full bg-gray-800" />
                  ) : (
                    `${recentAlerts.length} new in the last 24 hours`
                  )}
                </div>
                {!isLoading && (
                  <Progress 
                    value={recentAlertsPercentage} 
                    className="h-2 mt-2 bg-gray-800" 
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Top Keywords Card */}
            <Card className="bg-primary border-gray-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">Top Keyword</CardDescription>
                <CardTitle className="text-3xl font-bold text-white">
                  {isLoading ? (
                    <Skeleton className="h-10 w-32 bg-gray-800" />
                  ) : (
                    topKeyword ? topKeyword.word : "None"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  {isLoading ? (
                    <Skeleton className="h-4 w-full bg-gray-800" />
                  ) : (
                    topKeyword ? `${topKeyword.matches} matches found` : "No keywords tracked"
                  )}
                </div>
                {!isLoading && topKeyword && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-destructive/15 text-destructive-foreground border-destructive/30">
                      High Priority
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Keywords Tracked Card */}
            <Card className="bg-primary border-gray-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">Keywords Tracked</CardDescription>
                <CardTitle className="text-3xl font-bold text-white">
                  {isLoading ? <Skeleton className="h-10 w-16 bg-gray-800" /> : keywords.filter(k => k.enabled).length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  {isLoading ? (
                    <Skeleton className="h-4 w-full bg-gray-800" />
                  ) : (
                    "Active keyword alerts"
                  )}
                </div>
                {!isLoading && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="text-xs bg-primary-light border-gray-700 text-white hover:bg-accent">
                      Manage Keywords
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Alert Articles */}
        <div>
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Alert Articles</h2>
              <TabsList className="bg-primary-light">
                <TabsTrigger value="all" className="data-[state=active]:bg-accent">All Alerts</TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:bg-accent">Last 24 Hours</TabsTrigger>
                <TabsTrigger value="by-keyword" className="data-[state=active]:bg-accent">By Keyword</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
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
                        <div className="flex items-center justify-between mt-4">
                          <Skeleton className="h-4 w-24 bg-gray-800" />
                          <Skeleton className="h-4 w-20 bg-gray-800" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : alertArticles.length === 0 ? (
                <div className="bg-primary border border-gray-700 text-white p-6 rounded-md text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                    <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                  </svg>
                  <h3 className="text-xl font-medium text-white mb-2">No alerts found</h3>
                  <p className="text-gray-400 mb-4">
                    No articles match your keyword criteria yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alertArticles.map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
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
                        <div className="flex items-center justify-between mt-4">
                          <Skeleton className="h-4 w-24 bg-gray-800" />
                          <Skeleton className="h-4 w-20 bg-gray-800" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentAlerts.length === 0 ? (
                <div className="bg-primary border border-gray-700 text-white p-6 rounded-md text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <h3 className="text-xl font-medium text-white mb-2">No recent alerts</h3>
                  <p className="text-gray-400 mb-4">
                    No new alerts in the past 24 hours.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentAlerts.map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="by-keyword" className="mt-0">
              {isLoading ? (
                <Skeleton className="h-64 w-full bg-gray-800 rounded-md" />
              ) : (
                <div className="space-y-8">
                  {topKeywords.length === 0 ? (
                    <div className="bg-primary border border-gray-700 text-white p-6 rounded-md text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 21v-6.5a3.5 3.5 0 0 0-7 0V21h18v-6a4 4 0 0 0-4-4c-.7 0-1.37.25-2 .5"/>
                        <path d="M6 10V5a3 3 0 0 1 3-3h.5"/>
                        <path d="M13 7h5a2 2 0 0 1 2 2v1"/>
                        <path d="M18 14h.01"/>
                      </svg>
                      <h3 className="text-xl font-medium text-white mb-2">No keywords configured</h3>
                      <p className="text-gray-400 mb-4">
                        Add keywords to track specific cybersecurity threats.
                      </p>
                    </div>
                  ) : (
                    topKeywords.map(keyword => {
                      const keywordArticles = keywordStats[keyword.word]?.articles || [];
                      return keywordArticles.length > 0 ? (
                        <div key={keyword.id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2 bg-destructive/15 text-destructive-foreground border-destructive/30">
                                {keyword.word}
                              </Badge>
                              <span className="text-sm text-gray-400">{keywordArticles.length} article{keywordArticles.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {keywordArticles.slice(0, 3).map(article => (
                              <NewsCard key={article.id} article={article} />
                            ))}
                          </div>
                          {keywordArticles.length > 3 && (
                            <div className="flex justify-center mt-2">
                              <Button variant="link" className="text-accent hover:text-accent-light">
                                View all {keywordArticles.length} articles
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
