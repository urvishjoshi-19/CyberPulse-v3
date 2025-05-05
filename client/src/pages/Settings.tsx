import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings as SettingsType, Keyword } from "@shared/schema";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form validation schema for email settings
const emailSettingsSchema = z.object({
  email_alerts: z.boolean().default(true),
  email_recipients: z.array(z.string().email("Please enter a valid email address")),
  smtp_settings: z.object({
    host: z.string().min(1, "SMTP host is required"),
    port: z.number().int().positive(),
    username: z.string().min(1, "SMTP username is required"),
    password: z.string().min(1, "SMTP password is required"),
  }),
});

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isEmailConfigOpen, setIsEmailConfigOpen] = useState(false);
  const [newEmailRecipient, setNewEmailRecipient] = useState("");
  const [isAddKeywordOpen, setIsAddKeywordOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  
  // Fetch settings
  const { 
    data: settings, 
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useQuery<SettingsType>({
    queryKey: ['/api/settings'],
  });
  
  // Fetch keywords
  const { 
    data: keywords = [], 
    isLoading: isLoadingKeywords,
    refetch: refetchKeywords
  } = useQuery<Keyword[]>({
    queryKey: ['/api/keywords'],
  });
  
  // Initialize form with current settings
  const form = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      email_alerts: settings?.email_alerts || false,
      email_recipients: settings?.email_recipients || [],
      smtp_settings: settings?.smtp_settings || {
        host: "",
        port: 587,
        username: "",
        password: ""
      }
    },
    values: settings ? {
      email_alerts: settings.email_alerts,
      email_recipients: settings.email_recipients || [],
      smtp_settings: settings.smtp_settings || {
        host: "",
        port: 587,
        username: "",
        password: ""
      }
    } : undefined
  });
  
  // Email alerts toggle handler
  const handleEmailAlertsToggle = async (checked: boolean) => {
    try {
      await apiRequest('PUT', '/api/settings', {
        email_alerts: checked
      });
      
      await refetchSettings();
      
      toast({
        title: checked ? "Email alerts enabled" : "Email alerts disabled",
        description: checked 
          ? "You will now receive email notifications for new alerts." 
          : "You will no longer receive email notifications for alerts.",
      });
    } catch (error) {
      toast({
        title: "Settings update failed",
        description: "Could not update email alert settings.",
        variant: "destructive"
      });
    }
  };
  
  // Add email recipient handler
  const handleAddEmailRecipient = async () => {
    if (!newEmailRecipient || !newEmailRecipient.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const currentRecipients = settings?.email_recipients || [];
      
      if (currentRecipients.includes(newEmailRecipient)) {
        toast({
          title: "Email already exists",
          description: "This email is already in your recipients list.",
          variant: "destructive"
        });
        return;
      }
      
      await apiRequest('PUT', '/api/settings', {
        email_recipients: [...currentRecipients, newEmailRecipient]
      });
      
      await refetchSettings();
      setNewEmailRecipient("");
      
      toast({
        title: "Email recipient added",
        description: `${newEmailRecipient} has been added to the recipients list.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add recipient",
        description: "Could not add the email recipient.",
        variant: "destructive"
      });
    }
  };
  
  // Remove email recipient handler
  const handleRemoveEmailRecipient = async (email: string) => {
    try {
      const currentRecipients = settings?.email_recipients || [];
      const updatedRecipients = currentRecipients.filter(e => e !== email);
      
      await apiRequest('PUT', '/api/settings', {
        email_recipients: updatedRecipients
      });
      
      await refetchSettings();
      
      toast({
        title: "Email recipient removed",
        description: `${email} has been removed from the recipients list.`,
      });
    } catch (error) {
      toast({
        title: "Failed to remove recipient",
        description: "Could not remove the email recipient.",
        variant: "destructive"
      });
    }
  };
  
  // Update SMTP settings handler
  const onSubmitEmailConfig = async (data: z.infer<typeof emailSettingsSchema>) => {
    try {
      await apiRequest('PUT', '/api/settings', {
        smtp_settings: data.smtp_settings
      });
      
      await refetchSettings();
      setIsEmailConfigOpen(false);
      
      toast({
        title: "SMTP settings updated",
        description: "Your email server configuration has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to update SMTP settings",
        description: "Could not update the email server configuration.",
        variant: "destructive"
      });
    }
  };
  
  // Add keyword handler
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        title: "Invalid keyword",
        description: "Please enter a valid keyword.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check if keyword already exists
      const existingKeyword = keywords.find(k => k.word.toLowerCase() === newKeyword.toLowerCase());
      
      if (existingKeyword) {
        if (!existingKeyword.enabled) {
          // Re-enable existing keyword
          await apiRequest('PUT', `/api/keywords/${existingKeyword.id}`, {
            enabled: true
          });
          
          toast({
            title: "Keyword re-enabled",
            description: `"${newKeyword}" is now active again.`,
          });
        } else {
          toast({
            title: "Keyword already exists",
            description: `"${newKeyword}" is already being tracked.`,
            variant: "destructive"
          });
          setIsAddKeywordOpen(false);
          return;
        }
      } else {
        // Create new keyword
        await apiRequest('POST', '/api/keywords', {
          word: newKeyword,
          enabled: true
        });
        
        toast({
          title: "Keyword added",
          description: `"${newKeyword}" has been added to your keyword alerts.`,
        });
      }
      
      await refetchKeywords();
      setNewKeyword("");
      setIsAddKeywordOpen(false);
    } catch (error) {
      toast({
        title: "Failed to add keyword",
        description: "Could not add the keyword. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Toggle keyword enabled state
  const handleToggleKeyword = async (id: number, enabled: boolean) => {
    try {
      await apiRequest('PUT', `/api/keywords/${id}`, {
        enabled: !enabled
      });
      
      await refetchKeywords();
      
      toast({
        title: enabled ? "Keyword disabled" : "Keyword enabled",
        description: `Keyword tracking has been ${enabled ? "disabled" : "enabled"}.`,
      });
    } catch (error) {
      toast({
        title: "Failed to update keyword",
        description: "Could not update the keyword status.",
        variant: "destructive"
      });
    }
  };
  
  // Delete keyword handler
  const handleDeleteKeyword = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/keywords/${id}`, {});
      
      await refetchKeywords();
      
      toast({
        title: "Keyword deleted",
        description: "The keyword has been removed from tracking.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete keyword",
        description: "Could not delete the keyword.",
        variant: "destructive"
      });
    }
  };
  
  // Force scrape handler
  const handleForceScrape = async () => {
    try {
      toast({
        title: "Starting scrape",
        description: "Fetching the latest cybersecurity news...",
      });
      
      const response = await apiRequest('POST', '/api/scrape', {});
      const result = await response.json();
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      toast({
        title: "Scrape completed",
        description: `Found ${result.articlesCount} articles with ${result.alertsCount} alerts.`,
      });
    } catch (error) {
      toast({
        title: "Scrape failed",
        description: "Could not complete the scrape operation. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar 
        title="Settings" 
        subtitle="System Configuration" 
        showSearch={false}
      />
      
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">System Settings</h2>
          <p className="text-gray-400 mt-1">Configure your cybersecurity news monitoring system</p>
        </div>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-primary-light mb-6">
            <TabsTrigger value="general" className="data-[state=active]:bg-accent">General</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-accent">Alerts & Notifications</TabsTrigger>
            <TabsTrigger value="keywords" className="data-[state=active]:bg-accent">Keywords</TabsTrigger>
          </TabsList>
          
          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Data Source</CardTitle>
                <CardDescription>Configure your cybersecurity news data sources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Primary Source</Label>
                    <p className="text-sm text-gray-400">The Hacker News (thehackernews.com)</p>
                  </div>
                  <Badge variant="outline" className="bg-accent/20 text-accent-light border-accent/30">
                    Active
                  </Badge>
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div>
                  <Label className="text-white mb-2 block">Last Scraped</Label>
                  {isLoadingSettings ? (
                    <Skeleton className="h-6 w-48 bg-gray-800" />
                  ) : (
                    <p className="text-sm text-gray-400">
                      {settings?.last_scraped 
                        ? new Date(settings.last_scraped).toLocaleString() 
                        : "Never"}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-6 flex justify-between">
                <Button 
                  variant="outline" 
                  className="bg-primary-light border-gray-700 text-white hover:bg-accent"
                >
                  Add Source
                </Button>
                <Button 
                  variant="default" 
                  className="bg-accent hover:bg-accent-dark text-white"
                  onClick={handleForceScrape}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                    <path d="M16 16h5v5"/>
                  </svg>
                  Force Scrape Now
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">System Maintenance</CardTitle>
                <CardDescription>Manage your application data and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-primary-light border-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription className="text-gray-400">
                    Use these options with caution. Clearing data cannot be undone.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Clear Article History</Label>
                      <p className="text-sm text-gray-400">Remove all news articles from the database</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="bg-destructive/20 text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Clear Articles
                    </Button>
                  </div>
                  
                  <Separator className="my-2 bg-gray-800" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Reset All Settings</Label>
                      <p className="text-sm text-gray-400">Restore default application settings</p>
                    </div>
                    <Button 
                      variant="destructive"
                      className="bg-destructive/20 text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Reset Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Alerts & Notifications Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Email Notifications</CardTitle>
                <CardDescription>Configure how you receive alert notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="email-alerts" 
                    checked={settings?.email_alerts}
                    onCheckedChange={handleEmailAlertsToggle}
                    disabled={isLoadingSettings}
                  />
                  <Label htmlFor="email-alerts" className="text-white">
                    Email Alerts
                  </Label>
                </div>
                <p className="text-sm text-gray-400">
                  Receive email notifications when new articles match your keyword alerts
                </p>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div>
                  <Label className="text-white mb-2 block">Email Recipients</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {isLoadingSettings ? (
                      <>
                        <Skeleton className="h-8 w-32 bg-gray-800 rounded-full" />
                        <Skeleton className="h-8 w-40 bg-gray-800 rounded-full" />
                      </>
                    ) : settings?.email_recipients && settings.email_recipients.length > 0 ? (
                      settings.email_recipients.map((email, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-primary-light px-3 py-1 text-white border-gray-700 flex items-center gap-1"
                        >
                          {email}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-4 w-4 ml-1 text-gray-400 hover:text-white p-0"
                            onClick={() => handleRemoveEmailRecipient(email)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18"/>
                              <path d="m6 6 12 12"/>
                            </svg>
                          </Button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No recipients configured</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add email recipient"
                      value={newEmailRecipient}
                      onChange={(e) => setNewEmailRecipient(e.target.value)}
                      className="bg-primary-light border-gray-700 text-white"
                    />
                    <Button 
                      onClick={handleAddEmailRecipient}
                      className="bg-accent hover:bg-accent-dark text-white"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div>
                  <div className="flex justify-between items-center">
                    <Label className="text-white mb-2 block">SMTP Configuration</Label>
                    <Dialog open={isEmailConfigOpen} onOpenChange={setIsEmailConfigOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="bg-primary-light border-gray-700 text-white hover:bg-accent">
                          Configure
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-primary border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Email Server Configuration</DialogTitle>
                          <DialogDescription>
                            Configure your SMTP server for sending email alerts
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmitEmailConfig)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="smtp_settings.host"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">SMTP Host</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="smtp.example.com" 
                                      {...field} 
                                      className="bg-primary-light border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="smtp_settings.port"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">SMTP Port</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="587" 
                                      {...field} 
                                      value={field.value?.toString() || "587"}
                                      onChange={e => field.onChange(parseInt(e.target.value) || 587)} 
                                      className="bg-primary-light border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="smtp_settings.username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">SMTP Username</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="username@example.com" 
                                      {...field} 
                                      className="bg-primary-light border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="smtp_settings.password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">SMTP Password</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="••••••••" 
                                      {...field} 
                                      className="bg-primary-light border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter className="pt-4">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsEmailConfigOpen(false)}
                                className="border-gray-700 text-gray-300 hover:bg-primary-light hover:text-white"
                              >
                                Cancel
                              </Button>
                              <Button type="submit" className="bg-accent hover:bg-accent-dark text-white">
                                Save Settings
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {isLoadingSettings ? (
                    <Skeleton className="h-6 w-full bg-gray-800 mt-2" />
                  ) : settings?.smtp_settings ? (
                    <div className="bg-primary-light p-3 rounded-md border border-gray-700 mt-2">
                      <div className="text-sm text-white flex flex-col gap-1">
                        <div className="flex items-center">
                          <span className="text-gray-400 w-20">Host:</span> 
                          <span>{settings.smtp_settings.host || "Not configured"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 w-20">Port:</span> 
                          <span>{settings.smtp_settings.port || 587}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 w-20">Username:</span> 
                          <span>{settings.smtp_settings.username || "Not configured"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 w-20">Password:</span> 
                          <span>••••••••</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mt-2">No SMTP server configured</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Weekly Digest</CardTitle>
                <CardDescription>Configure weekly summary emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="weekly-digest" />
                  <Label htmlFor="weekly-digest" className="text-white">
                    Send Weekly Digest
                  </Label>
                </div>
                <p className="text-sm text-gray-400">
                  Receive a weekly summary of the top cybersecurity news articles
                </p>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div>
                  <Label className="text-white mb-2 block">Delivery Day</Label>
                  <select className="w-full bg-primary-light border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-accent focus:border-accent">
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                    <option>Sunday</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-6">
                <Button className="bg-accent hover:bg-accent-dark text-white">Save Digest Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-6">
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-white">Alert Keywords</CardTitle>
                    <CardDescription>Manage the keywords that trigger alerts</CardDescription>
                  </div>
                  
                  <Dialog open={isAddKeywordOpen} onOpenChange={setIsAddKeywordOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent-dark text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/>
                          <path d="M12 5v14"/>
                        </svg>
                        Add Keyword
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-primary border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add Alert Keyword</DialogTitle>
                        <DialogDescription>
                          Add a new keyword to monitor in cybersecurity news
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-keyword" className="text-white">Keyword</Label>
                          <Input 
                            id="new-keyword" 
                            placeholder="e.g., ransomware, zero-day, CVE" 
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            className="bg-primary-light border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddKeywordOpen(false)}
                          className="border-gray-700 text-gray-300 hover:bg-primary-light hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="button" 
                          onClick={handleAddKeyword}
                          className="bg-accent hover:bg-accent-dark text-white"
                        >
                          Add Keyword
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingKeywords ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full bg-gray-800" />
                    ))}
                  </div>
                ) : keywords.length === 0 ? (
                  <div className="bg-primary-light p-6 rounded-md text-center">
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
                    <Button 
                      onClick={() => setIsAddKeywordOpen(true)}
                      className="bg-accent hover:bg-accent-dark text-white"
                    >
                      Add Your First Keyword
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {keywords.map((keyword) => (
                      <div 
                        key={keyword.id} 
                        className="flex items-center justify-between p-3 bg-primary-light rounded-md border border-gray-700"
                      >
                        <div className="flex items-center">
                          <div className="mr-3">
                            <Switch 
                              checked={keyword.enabled} 
                              onCheckedChange={() => handleToggleKeyword(keyword.id, keyword.enabled)}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-white">{keyword.word}</p>
                            <p className="text-xs text-gray-400">
                              {keyword.matches} {keyword.matches === 1 ? 'match' : 'matches'} found
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${keyword.enabled ? 'bg-accent/15 text-accent-light border-accent/30' : 'bg-gray-700/20 text-gray-400 border-gray-700/30'}
                            `}
                          >
                            {keyword.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-destructive h-8 w-8"
                            onClick={() => handleDeleteKeyword(keyword.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                              <path d="M10 11v6"/>
                              <path d="M14 11v6"/>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-primary border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Keyword Best Practices</CardTitle>
                <CardDescription>Tips for effective keyword monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-primary-light p-4 rounded-md border border-gray-700">
                    <h3 className="font-medium text-white mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-accent" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                      Use Specific Terms
                    </h3>
                    <p className="text-sm text-gray-400">
                      For better results, use specific terms like "zero-day" or "CVE-2023" instead of generic terms like "attack".
                    </p>
                  </div>
                  
                  <div className="bg-primary-light p-4 rounded-md border border-gray-700">
                    <h3 className="font-medium text-white mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-accent" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                      Add Variations
                    </h3>
                    <p className="text-sm text-gray-400">
                      Consider adding variations of keywords (e.g., "ransomware", "ransom attack") to catch different phrasing.
                    </p>
                  </div>
                  
                  <div className="bg-primary-light p-4 rounded-md border border-gray-700">
                    <h3 className="font-medium text-white mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-accent" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                      Focus on Priorities
                    </h3>
                    <p className="text-sm text-gray-400">
                      Too many keywords can lead to alert fatigue. Focus on high-priority threats for your organization.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
