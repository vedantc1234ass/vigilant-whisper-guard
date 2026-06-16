import logo from "@/assets/genstar-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Size of the logo mark in pixels */
  size?: number;
  /** Show the "GenStar" wordmark next to the logo */
  showText?: boolean;
  /** Optional tagline shown under the wordmark */
  tagline?: string;
  /** Enable subtle scale/glow hover animation */
  interactive?: boolean;
  className?: string;
}

/**
 * Official GenStar brand logo — AI cybersecurity shield + star mark.
 * Reusable across navbar, headers, chatbot and loading screens.
 */
const Logo = ({
  size = 36,
  showText = true,
  tagline,
  interactive = true,
  className = "",
}: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 transition-transform duration-300",
          interactive && "hover:scale-105"
        )}
        style={{ width: size, height: size }}
      >
        {/* Neon glow halo */}
        <div
          className="absolute inset-0 rounded-full blur-md opacity-70"
          style={{ background: "radial-gradient(circle, #00E5FF55 0%, transparent 70%)" }}
        />
        <img
          src={logo}
          alt="GenStar logo"
          width={size}
          height={size}
          className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
        />
      </div>
      {showText && (
        <div className="leading-none">
          <span className="text-lg font-bold tracking-tight text-foreground">
            GenStar
          </span>
          {tagline && (
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">
              {tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
