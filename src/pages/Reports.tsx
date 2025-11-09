import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEntities, getAuditEvents } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Eye, BarChart3, Shield, ClipboardList } from "lucide-react";
import type { Entity, AuditEvent } from "@/lib/types";

type ReportType = "compliance" | "risk" | "audit";

interface GeneratedReport {
  id: string;
  entityId: string;
  entityName: string;
  type: ReportType;
  generatedAt: string;
  content: string;
}

export default function Reports() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [reportType, setReportType] = useState<ReportType>("compliance");
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    report: GeneratedReport | null;
  }>({ open: false, report: null });
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadReportsFromStorage();
  }, []);

  const loadData = async () => {
    try {
      const [entitiesData, auditData] = await Promise.all([
        getEntities(),
        getAuditEvents(),
      ]);
      setEntities(entitiesData);
      setAuditEvents(auditData);
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

  const loadReportsFromStorage = () => {
    const stored = localStorage.getItem("generated_reports");
    if (stored) {
      setGeneratedReports(JSON.parse(stored));
    }
  };

  const saveReportsToStorage = (reports: GeneratedReport[]) => {
    localStorage.setItem("generated_reports", JSON.stringify(reports));
    setGeneratedReports(reports);
  };

  const generateComplianceReport = (entity: Entity): string => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">
          Compliance Report
        </h1>
        <p style="color: #666; margin-bottom: 30px;">
          Generated on ${new Date().toLocaleString()}
        </p>

        <h2 style="color: #1a1a1a; margin-top: 30px;">Entity Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f3f4f6;">
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Company Name</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${entity.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Type</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb; text-transform: capitalize;">${entity.type}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Status</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${entity.status}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Compliance Status</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">
              <strong style="color: ${entity.compliance === 'Pass' ? '#22c55e' : entity.compliance === 'Partial' ? '#eab308' : '#ef4444'};">
                ${entity.compliance}
              </strong>
            </td>
          </tr>
        </table>

        <h2 style="color: #1a1a1a; margin-top: 30px;">Security & Compliance</h2>
        <ul style="line-height: 2;">
          <li><strong>Security Controls:</strong> ${entity.hasControls ? '✓ Yes' : '✗ No'}</li>
          <li><strong>Handles PII:</strong> ${entity.hasPII ? '✓ Yes' : '✗ No'}</li>
          <li><strong>Documents Submitted:</strong> ${entity.documents?.length || 0}</li>
        </ul>

        ${entity.documents && entity.documents.length > 0 ? `
          <h3 style="color: #1a1a1a; margin-top: 20px;">Document Checklist</h3>
          <ul>
            ${entity.documents.map(doc => `<li>${doc}</li>`).join('')}
          </ul>
        ` : ''}

        <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-left: 4px solid #2563eb;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            This report was automatically generated by the Risk Management System.
          </p>
        </div>
      </div>
    `;
  };

  const generateRiskReport = (entity: Entity): string => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; border-bottom: 3px solid #dc2626; padding-bottom: 10px;">
          Risk Assessment Report
        </h1>
        <p style="color: #666; margin-bottom: 30px;">
          Generated on ${new Date().toLocaleString()}
        </p>

        <h2 style="color: #1a1a1a; margin-top: 30px;">Entity Overview</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f3f4f6;">
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Company Name</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${entity.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Owner</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${entity.owner}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Onboarded</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${new Date(entity.createdAt).toLocaleDateString()}</td>
          </tr>
        </table>

        <h2 style="color: #1a1a1a; margin-top: 30px;">Risk Assessment</h2>
        <div style="padding: 20px; background: ${entity.riskLevel === 'HIGH' ? '#fee2e2' : entity.riskLevel === 'MEDIUM' ? '#fef3c7' : '#dcfce7'}; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: ${entity.riskLevel === 'HIGH' ? '#dc2626' : entity.riskLevel === 'MEDIUM' ? '#ca8a04' : '#16a34a'}; margin-top: 0;">
            Risk Level: ${entity.riskLevel}
          </h3>
          <p style="color: #374151; margin: 10px 0;">
            <strong>Recommendation:</strong>
            ${entity.riskLevel === 'HIGH' ? 'Requires risk committee review and approval.' : 
              entity.riskLevel === 'MEDIUM' ? 'Requires manager review before approval.' : 
              'Can be auto-approved.'}
          </p>
        </div>

        <h2 style="color: #1a1a1a; margin-top: 30px;">Risk Factors</h2>
        <ul style="line-height: 2;">
          ${entity.hasPII ? '<li style="color: #dc2626;"><strong>High Risk:</strong> Handles PII/Sensitive Data</li>' : ''}
          ${!entity.hasControls ? '<li style="color: #ca8a04;"><strong>Medium Risk:</strong> Missing security controls</li>' : ''}
          ${entity.documents && entity.documents.length < 3 ? '<li style="color: #ca8a04;"><strong>Medium Risk:</strong> Incomplete documentation</li>' : ''}
          ${entity.hasControls && !entity.hasPII ? '<li style="color: #16a34a;"><strong>Low Risk:</strong> Proper controls in place</li>' : ''}
        </ul>

        <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-left: 4px solid #dc2626;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            This assessment is based on data provided during onboarding and may change as new information becomes available.
          </p>
        </div>
      </div>
    `;
  };

  const generateAuditReport = (entity: Entity, events: AuditEvent[]): string => {
    const entityEvents = events.filter(e => e.entityName === entity.name);
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; border-bottom: 3px solid #7c3aed; padding-bottom: 10px;">
          Full Audit Report
        </h1>
        <p style="color: #666; margin-bottom: 30px;">
          Generated on ${new Date().toLocaleString()}
        </p>

        <h2 style="color: #1a1a1a; margin-top: 30px;">Entity Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f3f4f6;">
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Company Name</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${entity.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Risk Level</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">
              <strong style="color: ${entity.riskLevel === 'HIGH' ? '#dc2626' : entity.riskLevel === 'MEDIUM' ? '#ca8a04' : '#16a34a'};">
                ${entity.riskLevel}
              </strong>
            </td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Status</td>
            <td style="padding: 12px; border: 1px solid #e5e7eb;">${entity.status}</td>
          </tr>
        </table>

        <h2 style="color: #1a1a1a; margin-top: 30px;">Audit Trail</h2>
        ${entityEvents.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #1f2937; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #374151;">Timestamp</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #374151;">Action</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #374151;">Details</th>
              </tr>
            </thead>
            <tbody>
              ${entityEvents.map((event, index) => `
                <tr style="background: ${index % 2 === 0 ? '#f9fafb' : 'white'};">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-size: 13px;">${new Date(event.timestamp).toLocaleString()}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; text-transform: capitalize;">${event.action.replace(/_/g, ' ')}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${event.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="color: #666;">No audit events found for this entity.</p>'}

        <h2 style="color: #1a1a1a; margin-top: 30px;">Summary</h2>
        <ul style="line-height: 2;">
          <li><strong>Total Events:</strong> ${entityEvents.length}</li>
          <li><strong>Last Activity:</strong> ${entityEvents[0] ? new Date(entityEvents[0].timestamp).toLocaleString() : 'N/A'}</li>
          <li><strong>Current Status:</strong> ${entity.status}</li>
        </ul>

        <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-left: 4px solid #7c3aed;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            This audit trail represents all recorded events for this entity.
          </p>
        </div>
      </div>
    `;
  };

  const handleGenerateReport = () => {
    if (!selectedEntity) {
      toast({
        title: "Error",
        description: "Please select an entity",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    
    setTimeout(() => {
      const entity = entities.find(e => e.id === selectedEntity);
      if (!entity) return;

      let content = "";
      switch (reportType) {
        case "compliance":
          content = generateComplianceReport(entity);
          break;
        case "risk":
          content = generateRiskReport(entity);
          break;
        case "audit":
          content = generateAuditReport(entity, auditEvents);
          break;
      }

      const newReport: GeneratedReport = {
        id: `report-${Date.now()}`,
        entityId: entity.id,
        entityName: entity.name,
        type: reportType,
        generatedAt: new Date().toISOString(),
        content,
      };

      const updatedReports = [newReport, ...generatedReports];
      saveReportsToStorage(updatedReports);

      toast({
        title: "Success",
        description: "Report generated successfully",
      });

      setGenerating(false);
    }, 1000);
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    const blob = new Blob([report.content], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.type}-report-${report.entityName}-${new Date(report.generatedAt).toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrintReport = (report: GeneratedReport) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(report.content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case "compliance":
        return <ClipboardList className="h-4 w-4" />;
      case "risk":
        return <Shield className="h-4 w-4" />;
      case "audit":
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getReportTypeBadge = (type: ReportType): "default" | "destructive" | "secondary" => {
    switch (type) {
      case "compliance":
        return "default";
      case "risk":
        return "destructive";
      case "audit":
        return "secondary";
    }
  };

  const stats = {
    total: generatedReports.length,
    compliance: generatedReports.filter(r => r.type === "compliance").length,
    risk: generatedReports.filter(r => r.type === "risk").length,
    audit: generatedReports.filter(r => r.type === "audit").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Generate and manage compliance, risk, and audit reports
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reports
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
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{stats.compliance}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Risk Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              <div className="text-2xl font-bold">{stats.risk}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Audit Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary-foreground" />
              <div className="text-2xl font-bold">{stats.audit}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-full md:flex-1">
                <SelectValue placeholder="Select Entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name} ({entity.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={reportType} onValueChange={(val) => setReportType(val as ReportType)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compliance">Compliance Report</SelectItem>
                <SelectItem value="risk">Risk Assessment</SelectItem>
                <SelectItem value="audit">Full Audit Report</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerateReport}
              disabled={!selectedEntity || generating || loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports History */}
      <Card>
        <CardHeader>
          <CardTitle>Report History ({generatedReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedReports.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No reports generated yet. Create your first report above.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.entityName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getReportTypeBadge(report.type)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getReportTypeIcon(report.type)}
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(report.generatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewDialog({ open: true, report })}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onOpenChange={(open) => setPreviewDialog({ open, report: previewDialog.report })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              {previewDialog.report?.entityName} - {previewDialog.report?.type.charAt(0).toUpperCase()}{previewDialog.report?.type.slice(1)} Report
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {previewDialog.report && (
              <div 
                dangerouslySetInnerHTML={{ __html: previewDialog.report.content }}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => previewDialog.report && handlePrintReport(previewDialog.report)}
            >
              Print
            </Button>
            <Button
              onClick={() => previewDialog.report && handleDownloadReport(previewDialog.report)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
