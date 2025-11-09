import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getAuditEvents } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Download, 
  FileText, 
  Activity, 
  Clock,
  UserPlus,
  Archive,
  RotateCcw,
  Edit,
  AlertCircle
} from "lucide-react";
import type { AuditEvent } from "@/lib/types";

export default function Audit() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getAuditEvents();
      // Sort by timestamp descending (newest first)
      const sorted = data.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setEvents(sorted);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "onboarding_complete":
        return <UserPlus className="h-4 w-4" />;
      case "entity_decommissioned":
        return <Archive className="h-4 w-4" />;
      case "entity_reactivated":
        return <RotateCcw className="h-4 w-4" />;
      case "entity_edited":
        return <Edit className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case "onboarding_complete":
        return "default";
      case "entity_decommissioned":
        return "destructive";
      case "entity_reactivated":
        return "secondary";
      case "entity_edited":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "onboarding_complete":
        return "Onboarded";
      case "entity_decommissioned":
        return "Decommissioned";
      case "entity_reactivated":
        return "Reactivated";
      case "entity_edited":
        return "Edited";
      default:
        return action.replace(/_/g, " ");
    }
  };

  const filterByDate = (event: AuditEvent) => {
    if (dateFilter === "all") return true;
    const eventDate = new Date(event.timestamp);
    const now = new Date();
    
    switch (dateFilter) {
      case "today":
        return eventDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return eventDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return eventDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.entityName.toLowerCase().includes(search.toLowerCase()) ||
      event.user.toLowerCase().includes(search.toLowerCase()) ||
      event.details.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || event.action === actionFilter;
    const matchesDate = filterByDate(event);
    return matchesSearch && matchesAction && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Entity", "Action", "User", "Details"];
    const rows = filteredEvents.map((event) => [
      new Date(event.timestamp).toLocaleString(),
      event.entityName,
      getActionLabel(event.action),
      event.user,
      event.details,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Audit trail exported to CSV",
    });
  };

  const stats = {
    total: events.length,
    today: events.filter((e) => {
      const eventDate = new Date(e.timestamp);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length,
    week: events.filter((e) => {
      const eventDate = new Date(e.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return eventDate >= weekAgo;
    }).length,
    decommissions: events.filter((e) => e.action === "entity_decommissioned").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">
            Complete history of all entity actions and changes
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={filteredEvents.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{stats.today}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Past 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary-foreground" />
              <div className="text-2xl font-bold">{stats.week}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Decommissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="text-2xl font-bold">{stats.decommissions}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entity, user, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="onboarding_complete">Onboarded</SelectItem>
                <SelectItem value="entity_decommissioned">Decommissioned</SelectItem>
                <SelectItem value="entity_reactivated">Reactivated</SelectItem>
                <SelectItem value="entity_edited">Edited</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past 7 Days</SelectItem>
                <SelectItem value="month">Past 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {events.length === 0
                ? "No audit events yet. Complete onboarding to generate events."
                : "No events match your filters."}
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => navigate(`/risk`)}
                          className="font-medium hover:underline text-left"
                        >
                          {event.entityName}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getActionBadgeVariant(event.action)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getActionIcon(event.action)}
                          {getActionLabel(event.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{event.user}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {event.details}
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
