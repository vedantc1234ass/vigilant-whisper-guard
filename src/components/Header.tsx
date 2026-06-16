import { Github, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import Logo from "./Logo";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo size={38} tagline="AI Threat Detection" />

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
