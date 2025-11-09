import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TopBar = () => {
  const { 
    currentProject, 
    projects, 
    setCurrentProject
  } = useAppStore();

  return (
    <header className="h-14 border-b border-border bg-surface-1 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg">Syntria</span>
        </div>

        {projects.length > 0 && (
          <Select
            value={currentProject?.id}
            onValueChange={(id) => {
              const project = projects.find(p => p.id === id);
              setCurrentProject(project || null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

    </header>
  );
};
