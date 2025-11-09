import { useAppStore } from "@/lib/store";
import syntriaLogo from "@/assets/syntria-logo.png";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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
  
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 border-b border-border bg-surface-1 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src={syntriaLogo} alt="Syntria" className="h-8" />
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

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
};
