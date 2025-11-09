import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getEntities, updateEntity, createAuditEvent } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, Archive, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";
import type { Entity } from "@/lib/types";

export default function Decommission() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [view, setView] = useState<"active" | "decommissioned">("active");
  const [decommissionDialog, setDecommissionDialog] = useState<{
    open: boolean;
    entity: Entity | null;
  }>({ open: false, entity: null });
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const data = await getEntities();
      setEntities(data);
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

  const activeEntities = entities.filter(
    (e) => e.status === "Active" || e.status === "Pending"
  );
  const decommissionedEntities = entities.filter(
    (e) => e.status === "Decommissioned"
  );

  const displayedEntities =
    view === "active" ? activeEntities : decommissionedEntities;

  const filteredEntities = displayedEntities.filter((entity) => {
    const matchesSearch =
      entity.name.toLowerCase().includes(search.toLowerCase()) ||
      entity.owner.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || entity.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDecommission = async () => {
    if (!decommissionDialog.entity || !reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for decommissioning",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      await updateEntity(decommissionDialog.entity.id, {
        status: "Decommissioned",
        decommissionReason: reason,
        decommissionedAt: new Date().toISOString(),
      });

      await createAuditEvent({
        action: "entity_decommissioned",
        entityId: decommissionDialog.entity.id,
        user: "system",
        details: `Decommissioned: ${reason}`,
      });

      await loadEntities();

      toast({
        title: "Success",
        description: `${decommissionDialog.entity.name} has been decommissioned`,
      });

      setDecommissionDialog({ open: false, entity: null });
      setReason("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivate = async (entity: Entity) => {
    try {
      await updateEntity(entity.id, {
        status: "Active",
        reactivatedAt: new Date().toISOString(),
      });

      await createAuditEvent({
        action: "entity_reactivated",
        entityId: entity.id,
        user: "system",
        details: "Entity reactivated",
      });

      await loadEntities();

      toast({
        title: "Success",
        description: `${entity.name} has been reactivated`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stats = {
    active: activeEntities.length,
    decommissioned: decommissionedEntities.length,
    highRiskActive: activeEntities.filter((e) => e.riskLevel === "HIGH").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Decommission</h1>
        <p className="text-muted-foreground">
          Manage entity lifecycle and decommissioning
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold">{stats.active}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Decommissioned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.decommissioned}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Risk Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="text-2xl font-bold text-destructive">
                {stats.highRiskActive}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === "active" ? "default" : "outline"}
          onClick={() => setView("active")}
        >
          Active Entities ({stats.active})
        </Button>
        <Button
          variant={view === "decommissioned" ? "default" : "outline"}
          onClick={() => setView("decommissioned")}
        >
          Decommissioned ({stats.decommissioned})
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
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
          <CardTitle>
            {view === "active" ? "Active" : "Decommissioned"} Entities (
            {filteredEntities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : filteredEntities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {displayedEntities.length === 0
                ? view === "active"
                  ? "No active entities. All entities have been decommissioned."
                  : "No decommissioned entities yet."
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
                    <TableHead>Owner</TableHead>
                    {view === "decommissioned" && (
                      <TableHead>Decommissioned</TableHead>
                    )}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell className="capitalize">{entity.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entity.riskLevel === "HIGH"
                              ? "destructive"
                              : entity.riskLevel === "MEDIUM"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {entity.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{entity.owner}</TableCell>
                      {view === "decommissioned" && (
                        <TableCell className="text-sm text-muted-foreground">
                          {entity.decommissionedAt
                            ? new Date(entity.decommissionedAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      )}
                      <TableCell>
                        {view === "active" ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setDecommissionDialog({ open: true, entity })
                            }
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Decommission
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivate(entity)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decommission Dialog */}
      <Dialog
        open={decommissionDialog.open}
        onOpenChange={(open) =>
          setDecommissionDialog({ open, entity: decommissionDialog.entity })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decommission Entity</DialogTitle>
            <DialogDescription>
              You are about to decommission{" "}
              <strong>{decommissionDialog.entity?.name}</strong>. This action will
              mark the entity as inactive. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Decommissioning</Label>
              <Textarea
                placeholder="e.g., Contract ended, vendor no longer needed, merged with another entity..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDecommissionDialog({ open: false, entity: null });
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecommission}
              disabled={processing || !reason.trim()}
            >
              {processing ? "Processing..." : "Decommission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
