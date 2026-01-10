import { Shield, Github, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-primary/30 blur-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              GenStar
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-widest">
              AI Threat Detection
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="cyber-ghost" size="sm" className="hidden sm:flex">
            <ExternalLink size={16} />
            Docs
          </Button>
          <Button variant="cyber-outline" size="sm">
            <Github size={16} />
            <span className="hidden sm:inline">GitHub</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
