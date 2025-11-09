import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target, MessageSquare, Zap, Download } from "lucide-react";
import { runStrategyAgent } from "@/lib/api";
export default function Workbench() {
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState("strategy");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Strategy inputs
  const [market, setMarket] = useState("");
  const [segment, setSegment] = useState("");
  const [goals, setGoals] = useState("");
  const [constraints, setConstraints] = useState("");

  // Customer Advisory chat
  const [advisoryMessages, setAdvisoryMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
  }>>([]);
  const [advisoryInput, setAdvisoryInput] = useState("");
  const handleStrategy = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await runStrategyAgent({
        market,
        segment,
        goals: goals.split('\n').filter(Boolean),
        constraints: constraints.split('\n').filter(Boolean)
      });
      setResult(response);

      // Automatically sync to calendar via n8n
      try {
        const syncResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-to-calendar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            strategyData: response.data
          })
        });
        if (!syncResponse.ok) {
          throw new Error('Sync failed');
        }
        const syncData = await syncResponse.json();
        toast({
          title: "Strategy Generated & Synced",
          description: `Strategy created and ${syncData?.eventsCount || 0} events sent to your calendar`
        });
      } catch (syncError: any) {
        console.error('Calendar sync error:', syncError);
        toast({
          title: "Strategy Generated",
          description: "Strategy created but calendar sync failed. Check your n8n webhook.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleResearch = async () => {
    if (!advisoryInput.trim()) return;
    const userMessage = {
      role: 'user' as const,
      content: advisoryInput
    };
    setAdvisoryMessages(prev => [...prev, userMessage]);
    setAdvisoryInput("");
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-advisory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...advisoryMessages, userMessage]
        })
      });
      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantMessage = "";
      let streamDone = false;
      while (!streamDone) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, {
          stream: true
        });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setAdvisoryMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? {
                    ...m,
                    content: assistantMessage
                  } : m);
                }
                return [...prev, {
                  role: 'assistant',
                  content: assistantMessage
                }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      toast({
        title: "Response Complete",
        description: "Advisory guidance generated"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleManualSync = async () => {
    if (!result?.data) {
      toast({
        title: "No Data",
        description: "Run Strategy or Customer Advisory first to sync results",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const syncResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-automation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: result.data
        })
      });
      if (!syncResponse.ok) {
        throw new Error('Sync failed');
      }
      const syncData = await syncResponse.json();
      toast({
        title: "Synced to Automation",
        description: "Data sent to your automation workflow"
      });
    } catch (error: any) {
      console.error('Calendar sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Check your automation webhook URL configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Product Management Workbench</h1>
          <p className="text-muted-foreground">AI agents for product strategy, research, and planning</p>
        </div>
        {result && <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex flex-wrap">
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Strategy
          </TabsTrigger>
          <TabsTrigger value="advisory" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Customer Advisory
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Agent</CardTitle>
              <CardDescription>
                Generate product brief, North Star metrics, and success criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="market">Target Market</Label>
                  <Input id="market" placeholder="e.g., Enterprise SaaS" value={market} onChange={e => setMarket(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segment">Customer Segment</Label>
                  <Input id="segment" placeholder="e.g., Mid-market CFOs" value={segment} onChange={e => setSegment(e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goals">Goals (one per line)</Label>
                <Textarea id="goals" placeholder="Increase user retention&#10;Reduce time to value&#10;Expand into new verticals" className="min-h-[100px]" value={goals} onChange={e => setGoals(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">Constraints (one per line)</Label>
                <Textarea id="constraints" placeholder="Must comply with SOC 2&#10;Limited engineering resources&#10;Q2 launch deadline" className="min-h-[100px]" value={constraints} onChange={e => setConstraints(e.target.value)} />
              </div>

              <Button onClick={handleStrategy} disabled={loading || !market}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate Strategy
              </Button>
            </CardContent>
          </Card>

          {result && activeTab === "strategy" && result.data && <Card>
              <CardHeader>
                <CardTitle>Product Strategy Brief</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">North Star</h3>
                  <p className="text-foreground">{result.data.northStar}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Ideal Customer Profiles (ICPs)</h3>
                  {result.data.icps?.map((icp: any, idx: number) => <div key={idx} className="mb-4 p-4 bg-surface-2 rounded-lg">
                      <h4 className="font-medium mb-2">{icp.segment}</h4>
                      <p className="text-sm text-muted-foreground mb-2">Pain Points:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {icp.painPoints?.map((pain: string, i: number) => <li key={i} className="text-sm">{pain}</li>)}
                      </ul>
                    </div>)}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Success Metrics</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.data.successMetrics?.map((metric: string, idx: number) => <li key={idx}>{metric}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.data.constraints?.map((constraint: string, idx: number) => <li key={idx}>{constraint}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Product Requirements Document</h3>
                  <pre className="text-sm bg-surface-2 p-4 rounded-lg whitespace-pre-wrap">
                    {result.data.prd}
                  </pre>
                </div>
              </CardContent>
            </Card>}
        </TabsContent>

        <TabsContent value="advisory" className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Customer Advisory AI</CardTitle>
              <CardDescription>
                Get expert guidance on PM communication, stakeholder management, and customer discovery
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {advisoryMessages.length === 0 && <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Ask for help with:</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Drafting stakeholder emails</li>
                        <li>• Customer interview questions</li>
                        <li>• Analyzing feedback</li>
                        <li>• Decision frameworks</li>
                      </ul>
                    </div>}
                  {advisoryMessages.map((msg, idx) => <div key={idx} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-surface-2 mr-8'}`}>
                      <div className="text-xs font-medium mb-2 opacity-70">
                        {msg.role === 'user' ? 'You' : 'Advisory AI'}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>)}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea placeholder="Ask for PM guidance... (e.g., 'Help me draft an email to stakeholders about a delayed feature')" value={advisoryInput} onChange={e => setAdvisoryInput(e.target.value)} onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleResearch();
                }
              }} className="min-h-[80px]" disabled={loading} />
                <Button onClick={handleResearch} disabled={loading || !advisoryInput.trim()} className="px-6">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation</CardTitle>
              <CardDescription>
                Sync your PM artifacts to external tools via n8n webhook
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-surface-2 rounded-lg">
                <h4 className="font-medium mb-2">Webhooks Configured</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Each agent sends data to its dedicated n8n webhook:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <span className="font-medium">Strategy</span> - Auto-syncs on generation</li>
                  <li>• <span className="font-medium">Customer Advisory</span> - Sends conversations in background</li>
                  <li>• <span className="font-medium">Automation</span> - Manual trigger below</li>
                </ul>
              </div>

              <Button onClick={handleManualSync} disabled={loading || !result} className="w-full">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Zap className="w-4 h-4 mr-2" />
                Sync to Automation Webhook
              </Button>

              {!result && <p className="text-sm text-muted-foreground text-center">
                  Run Strategy or Customer Advisory first to enable manual sync.
                </p>}

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-medium mb-2 text-sm">How It Works</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  • <strong>Strategy Agent</strong>: Automatically sends events to Strategy webhook when you generate a strategy
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  • <strong>Customer Advisory</strong>: Logs conversations to Customer webhook in background
                </p>
                <p className="text-xs text-muted-foreground">
                  • <strong>Manual Sync</strong>: Use the button above to send current results to Automation webhook
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
}