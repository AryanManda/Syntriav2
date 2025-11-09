import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateRiskScore, createAuditEvent, createEntity } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/* ---------- Types ---------- */

type CompanyType = "vendor" | "client";

interface OnboardingForm {
  companyName: string;
  companyType: CompanyType;
  ein: string;
  country: string;
  contactEmail: string;
  documents: string[];
  hasControls: boolean;
  hasPII: boolean;
  uploadedFiles: Array<{
    name: string;
    type: string;
    base64: string;
  }>;
}

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface RiskResult {
  riskLevel: RiskLevel;
  reasons?: string[];
}

/* ---------- Component ---------- */

export default function Onboarding() {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<OnboardingForm>({
    companyName: "",
    companyType: "vendor",
    ein: "",
    country: "USA",
    contactEmail: "",
    documents: [],
    hasControls: false,
    hasPII: false,
    uploadedFiles: [],
  });

  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);

  const docs = ["W9", "SOC2", "Insurance", "MSA", "DPA"] as const;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = (await calculateRiskScore(formData)) as RiskResult;
      setRiskResult(result);

      // Create entity
      await createEntity({
        name: formData.companyName,
        type: formData.companyType,
        riskLevel: result.riskLevel,
        compliance: formData.documents.length >= 3 ? "Pass" : formData.documents.length >= 1 ? "Partial" : "Fail",
        status: "Active",
        owner: "system",
        contactEmail: formData.contactEmail,
        ein: formData.ein,
        country: formData.country,
        documents: formData.documents,
        hasControls: formData.hasControls,
        hasPII: formData.hasPII,
      });

      await createAuditEvent({
        action: "onboarding_complete",
        entityId: formData.companyName,
        user: "system",
        details: `Risk: ${result.riskLevel}`,
      });

      toast({
        title: "Onboarding Complete!",
        description: `Risk: ${result.riskLevel}`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<{ name: string; type: string; base64: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve({
            name: file.name,
            type: file.type,
            base64: base64.split(',')[1], // Remove data:image/png;base64, prefix
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const uploadedFiles = await Promise.all(filePromises);
    setFormData({ ...formData, uploadedFiles: [...formData.uploadedFiles, ...uploadedFiles] });
  };

  const removeFile = (index: number) => {
    setFormData({
      ...formData,
      uploadedFiles: formData.uploadedFiles.filter((_, i) => i !== index),
    });
  };

  const progress = (step / 5) * 100;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold mb-2">Onboarding Wizard</h1>
      <Progress value={progress} className="mb-6" />

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Company Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={formData.companyType}
                onValueChange={(val: CompanyType) =>
                  setFormData({ ...formData, companyType: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>EIN</Label>
              <Input
                value={formData.ein}
                onChange={(e) =>
                  setFormData({ ...formData, ein: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
              />
            </div>
            <Button onClick={() => setStep(2)}>Next</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Upload Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-4xl">📄</div>
                  <p className="text-sm font-medium">Upload compliance documents</p>
                  <p className="text-xs text-muted-foreground">
                    PDFs, Word docs, images (SOC2, Insurance, W9, etc.)
                  </p>
                </div>
              </label>
            </div>

            {formData.uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                {formData.uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Document Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {docs.map((doc) => {
              const checked = formData.documents.includes(doc);
              return (
                <div key={doc} className="flex items-center space-x-2">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => {
                      const isChecked = value === true;
                      setFormData({
                        ...formData,
                        documents: isChecked
                          ? [...formData.documents, doc]
                          : formData.documents.filter((d) => d !== doc),
                      });
                    }}
                  />
                  <Label>{doc}</Label>
                </div>
              );
            })}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Controls &amp; PII</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.hasControls}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, hasControls: v === true })
                }
              />
              <Label>Has IAM, Encryption, Logging, Network Controls</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.hasPII}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, hasPII: v === true })
                }
              />
              <Label>Handles PII/Sensitive Data</Label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={() => setStep(5)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Review &amp; Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!riskResult ? (
              <>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Company:</strong> {formData.companyName}
                  </p>
                  <p>
                    <strong>Type:</strong> {formData.companyType}
                  </p>
                  <p>
                    <strong>Uploaded Files:</strong> {formData.uploadedFiles.length}
                  </p>
                  <p>
                    <strong>Document Checklist:</strong>{" "}
                    {formData.documents.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>Controls:</strong>{" "}
                    {formData.hasControls ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>PII:</strong> {formData.hasPII ? "Yes" : "No"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(4)}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Analyzing documents..." : "Submit"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Risk Level:</span>
                  <Badge
                    variant={
                      riskResult.riskLevel === "HIGH" ? "destructive" : "outline"
                    }
                  >
                    {riskResult.riskLevel}
                  </Badge>
                </div>

                <div>
                  <p className="font-medium mb-2">Reasons:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {riskResult.reasons?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">Routing:</p>
                  <p className="text-sm">
                    {riskResult.riskLevel === "LOW" && "✓ Auto-approve"}
                    {riskResult.riskLevel === "MEDIUM" && "→ Manager review"}
                    {riskResult.riskLevel === "HIGH" && "⚠ Risk committee"}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setStep(1);
                    setRiskResult(null);
                    setFormData({
                      companyName: "",
                      companyType: "vendor",
                      ein: "",
                      country: "USA",
                      contactEmail: "",
                      documents: [],
                      hasControls: false,
                      hasPII: false,
                      uploadedFiles: [],
                    });
                  }}
                >
                  Start New Onboarding
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
