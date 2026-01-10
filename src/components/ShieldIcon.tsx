import { Shield } from "lucide-react";

interface ShieldIconProps {
  animated?: boolean;
  size?: number;
  className?: string;
}

const ShieldIcon = ({ animated = false, size = 48, className = "" }: ShieldIconProps) => {
  return (
    <div className={`relative ${animated ? 'shield-animated' : ''} ${className}`}>
      <Shield 
        size={size} 
        className="text-primary fill-primary/20"
        strokeWidth={1.5}
      />
      {animated && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full pulse-glow" />
        </div>
      )}
    </div>
  );
};

export default ShieldIcon;
