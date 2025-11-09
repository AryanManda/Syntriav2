import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEntities } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Entity, RiskLevel, ComplianceStatus } from "@/lib/types";

export default function Risk() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const data = await getEntities();
      setEntities(data);
      
      // If no entities from API, use mock data
      if (data.length === 0) {
        const mockEntities: Entity[] = [
          {
            id: 'mock-1',
            name: 'Acme Corp',
            type: 'vendor',
            riskLevel: 'HIGH',
            compliance: 'Fail',
            status: 'Active',
            owner: 'John Smith',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
          {
            id: 'mock-2',
            name: 'TechStart Inc',
            type: 'client',
            riskLevel: 'MEDIUM',
            compliance: 'Partial',
            status: 'Active',
            owner: 'Sarah Johnson',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
          {
            id: 'mock-3',
            name: 'Global Solutions',
            type: 'vendor',
            riskLevel: 'LOW',
            compliance: 'Pass',
            status: 'Active',
            owner: 'Mike Davis',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
        ];
        setEntities(mockEntities);
      }
    } catch (error) {
      console.error('Failed to load entities:', error);
      
      // Use mock data as fallback
      const mockEntities: Entity[] = [
        {
          id: 'mock-1',
          name: 'Acme Corp',
          type: 'vendor',
          riskLevel: 'HIGH',
          compliance: 'Fail',
          status: 'Active',
          owner: 'John Smith',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'mock-2',
          name: 'TechStart Inc',
          type: 'client',
          riskLevel: 'MEDIUM',
          compliance: 'Partial',
          status: 'Active',
          owner: 'Sarah Johnson',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'mock-3',
          name: 'Global Solutions',
          type: 'vendor',
          riskLevel: 'LOW',
          compliance: 'Pass',
          status: 'Active',
          owner: 'Mike Davis',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      ];
      setEntities(mockEntities);
      
      toast({
        title: "Using Demo Data",
        description: "Backend server not running. Showing sample entities.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch =
      entity.name.toLowerCase().includes(search.toLowerCase()) ||
      entity.owner.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === "all" || entity.riskLevel === riskFilter;
    const matchesType = typeFilter === "all" || entity.type === typeFilter;
    return matchesSearch && matchesRisk && matchesType;
  });

  const getRiskBadgeVariant = (risk: RiskLevel) => {
    switch (risk) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
    }
  };

  const getComplianceBadgeVariant = (compliance: ComplianceStatus) => {
    switch (compliance) {
      case "Pass":
        return "secondary";
      case "Partial":
        return "default";
      case "Fail":
        return "destructive";
    }
  };

  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case "HIGH":
        return <TrendingUp className="w-4 h-4" />;
      case "MEDIUM":
        return <Minus className="w-4 h-4" />;
      case "LOW":
        return <TrendingDown className="w-4 h-4" />;
    }
  };

  const stats = {
    total: entities.length,
    high: entities.filter((e) => e.riskLevel === "HIGH").length,
    medium: entities.filter((e) => e.riskLevel === "MEDIUM").length,
    low: entities.filter((e) => e.riskLevel === "LOW").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Risk & Compliance</h1>
        <p className="text-muted-foreground">
          Entity risk scoring and compliance status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medium Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.medium}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-foreground">{stats.low}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="HIGH">High Risk</SelectItem>
                <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                <SelectItem value="LOW">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Entities ({filteredEntities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredEntities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {entities.length === 0
                ? "No entities yet. Complete onboarding to add entities."
                : "No entities match your filters."}
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntities.map((entity) => (
                    <TableRow 
                      key={entity.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/entities/${entity.id}`)}
                    >
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell className="capitalize">{entity.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getRiskBadgeVariant(entity.riskLevel)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getRiskIcon(entity.riskLevel)}
                          {entity.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getComplianceBadgeVariant(entity.compliance)}>
                          {entity.compliance}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entity.status}</Badge>
                      </TableCell>
                      <TableCell>{entity.owner}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(entity.lastUpdated).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
