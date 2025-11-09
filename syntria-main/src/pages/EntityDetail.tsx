import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Shield, Calendar, Mail, Building, MapPin, Edit } from "lucide-react";
import { getEntity, updateEntity } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EntityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entity, setEntity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadEntity();
  }, [id]);

  const loadEntity = async () => {
    setLoading(true);
    try {
      const data = await getEntity(id!);
      setEntity(data);
      setEditData(data);
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

  const handleSave = async () => {
    try {
      await updateEntity(id!, editData);
      setEntity(editData);
      setEditOpen(false);
      toast({
        title: "Success",
        description: "Entity updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Entity Not Found</h2>
          <Button onClick={() => navigate("/risk")}>Back to Risk</Button>
        </div>
      </div>
    );
  }

  const riskColors = {
    LOW: "bg-green-100 text-green-800 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    HIGH: "bg-red-100 text-red-800 border-red-200",
  };

  const complianceColors = {
    Pass: "bg-green-100 text-green-800",
    Partial: "bg-yellow-100 text-yellow-800",
    Fail: "bg-red-100 text-red-800",
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/risk")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{entity.name}</h1>
            <p className="text-muted-foreground">
              {entity.type === "vendor" ? "Vendor" : "Client"} • ID: {entity.id}
            </p>
          </div>
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Entity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Owner</Label>
                <Input
                  value={editData.owner}
                  onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input
                  value={editData.contactEmail}
                  onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editData.status}
                  onValueChange={(val) => setEditData({ ...editData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Risk & Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge className={riskColors[entity.riskLevel as keyof typeof riskColors]}>
                {entity.riskLevel}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Compliance:</span>
              <Badge variant="outline" className={complianceColors[entity.compliance as keyof typeof complianceColors]}>
                {entity.compliance}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="secondary">{entity.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{entity.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{entity.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>EIN: {entity.ein}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Onboarded: {new Date(entity.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Document Checklist:</p>
            <div className="flex flex-wrap gap-2">
              {entity.documents && entity.documents.length > 0 ? (
                entity.documents.map((doc: string) => (
                  <Badge key={doc} variant="outline">
                    {doc}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No documents in checklist</span>
              )}
            </div>
          </div>

          {entity.uploadedFiles && entity.uploadedFiles.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Uploaded Files ({entity.uploadedFiles.length}):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entity.uploadedFiles.map((file: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    {file.type?.startsWith('image/') && (
                      <img
                        src={`data:${file.type};base64,${file.base64}`}
                        alt={file.name}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:${file.type};base64,${file.base64}`;
                        link.download = file.name;
                        link.click();
                      }}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Security Controls (IAM, Encryption, Logging, Network):</span>
            <Badge variant={entity.hasControls ? "default" : "secondary"}>
              {entity.hasControls ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Handles PII/Sensitive Data:</span>
            <Badge variant={entity.hasPII ? "destructive" : "secondary"}>
              {entity.hasPII ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Owner:</span>
            <span className="font-medium">{entity.owner}</span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-0.5 h-full bg-border" />
              </div>
              <div className="pb-4">
                <p className="font-medium">Entity Onboarded</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(entity.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Risk Assessment: {entity.riskLevel}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-muted" />
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(entity.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
