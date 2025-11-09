import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Briefcase, UserPlus, Shield, Zap, Target, Users } from "lucide-react";
export default function Overview() {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-surface">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-border">
            
            <span className="text-sm font-medium">AI-Powered Product Management</span>
          </div>
          
          <h1 className="font-heading text-6xl font-bold leading-tight">
            AI agents for product leaders
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From onboarding to execution. Syntria combines multi-agent AI automation 
            with enterprise-grade compliance tools.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 shadow-glow" onClick={() => navigate('/workbench')}>
              <Briefcase className="w-5 h-5 mr-2" />
              Try PM Workbench
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/onboarding')}>
              <UserPlus className="w-5 h-5 mr-2" />
              Try Onboarding
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <Target className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Strategy Agent</CardTitle>
              <CardDescription>
                Generate product briefs, define North Star metrics, and create roadmaps
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <Zap className="w-10 h-10 text-accent mb-2" />
              <CardTitle>Automation</CardTitle>
              <CardDescription>
                Auto-sync to Calendar and Notion, export artifacts, generate test cases
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <Shield className="w-10 h-10 text-destructive mb-2" />
              <CardTitle>Compliance</CardTitle>
              <CardDescription>
                Risk scoring, vendor onboarding, audit trails, and decommissioning
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Why Syntria */}
      <section className="container mx-auto px-6 py-16">
        <Card className="bg-gradient-surface border-border">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Why Syntria?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-heading text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  For Product Managers
                </h3>
                <p className="text-muted-foreground">
                  AI agents handle research, planning, and documentation. Focus on strategy 
                  while automation handles the busywork.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-heading text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  For Compliance Teams
                </h3>
                <p className="text-muted-foreground">
                  Streamline vendor onboarding with AI risk scoring, automated routing, 
                  and immutable audit trails.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Metrics */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[{
          label: "AI Agents",
          value: "4+"
        }, {
          label: "Time Saved",
          value: "70%"
        }, {
          label: "Auto Artifacts",
          value: "15+"
        }, {
          label: "Risk Score Accuracy",
          value: "95%"
        }].map(metric => <Card key={metric.label} className="bg-surface-2 border-border text-center">
              <CardHeader>
                <CardTitle className="font-heading text-4xl text-primary">
                  {metric.value}
                </CardTitle>
                <CardDescription className="text-base">{metric.label}</CardDescription>
              </CardHeader>
            </Card>)}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-heading text-4xl font-bold">
            Ready to see it in action?
          </h2>
          <p className="text-xl text-muted-foreground">
            Start with a 2-minute PM Workbench demo or try the 90-second onboarding flow
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" className="gradient-primary text-primary-foreground hover:opacity-90" onClick={() => navigate('/workbench')}>
              Start Demo
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/admin')}>
              Configure Settings
            </Button>
          </div>
        </div>
      </section>
    </div>;
}