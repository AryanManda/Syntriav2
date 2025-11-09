import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";
import { checkHealth } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function Admin() {
  const { toast } = useToast();
  const { aiProvider, setAIProvider } = useAppStore();
  const [testing, setTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const handleHealthCheck = async () => {
    setTesting(true);
    try {
      const status = await checkHealth();
      setHealthStatus(status);
      toast({
        title: "Health Check Complete",
        description: `Provider: ${status.provider}, API Key: ${status.hasKey ? 'Configured' : 'Missing'}`,
      });
    } catch (error: any) {
      toast({
        title: "Health Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Admin & Integrations</h1>
        <p className="text-muted-foreground">Configure AI providers and integrations</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Provider</CardTitle>
            <CardDescription>Select your preferred AI provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={aiProvider} onValueChange={(val: any) => setAIProvider(val)}>
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini (Recommended)</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleHealthCheck} disabled={testing}>
              {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Test Connection
            </Button>

            {healthStatus && (
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {healthStatus.ok ? (
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <span className="text-sm font-medium">{healthStatus.provider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Key</span>
                  <span className="text-sm font-medium">
                    {healthStatus.hasKey ? 'Configured' : 'Missing'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity Integrations</CardTitle>
            <CardDescription>Connect Calendar and Notion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Google Calendar</span>
                <Badge variant="outline" className="bg-muted">Mocked</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notion</span>
                <Badge variant="outline" className="bg-muted">Mocked</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure real credentials via environment variables to enable integrations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Setup</CardTitle>
          <CardDescription>Required environment variables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-muted-foreground"># AI Providers</p>
            <p>GEMINI_API_KEY=your_gemini_key</p>
            <p>OPENAI_API_KEY=your_openai_key</p>
            <p className="text-muted-foreground pt-2"># Optional Integrations</p>
            <p>ELEVENLABS_API_KEY=your_elevenlabs_key</p>
            <p>NOTION_API_KEY=your_notion_key</p>
            <p>GOOGLE_CALENDAR_CREDENTIALS_JSON=your_credentials</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
