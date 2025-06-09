import { Link, useLocation } from "wouter";
import { Shield, BarChart3, FlaskConical, VenetianMask, ClipboardCheck, AlertTriangle } from "lucide-react";

interface Domain {
  id: number;
  name: string;
  description: string;
  examPercentage: number;
  progress: number;
  color: string;
  icon: string;
}

interface SidebarProps {
  domains: Domain[];
}

export default function Sidebar({ domains }: SidebarProps) {
  const [location] = useLocation();



  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      case "red": return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "purple": return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
      case "green": return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "orange": return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getProgressBarColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-500";
      case "red": return "bg-red-500";
      case "purple": return "bg-purple-500";
      case "green": return "bg-green-500";
      case "orange": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="w-64 bg-card shadow-lg border-r border-border fixed h-full z-30">
      <div className="p-6 border-b border-border">
        <Link href="/dashboard">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CyberSecure</h1>
              <p className="text-sm text-muted-foreground">Training Platform</p>
            </div>
          </div>
        </Link>
      </div>

      <nav className="p-4 space-y-2">
        <Link href="/dashboard">
          <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
            location === "/dashboard" || location === "/" 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          }`}>
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </div>
        </Link>

        <div className="pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 pb-2">
            Training Domains
          </p>
          
          {domains.map((domain) => (
            <Link key={domain.id} href={`/domain/${domain.id}`}>
              <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer group ${
                location === `/domain/${domain.id}` 
                  ? "bg-muted" 
                  : "hover:bg-muted"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${getColorClasses(domain.color)}`}>
                  <span className="text-xs font-bold">{domain.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate block">
                    {domain.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-1000 ${getProgressBarColor(domain.color)}`}
                      style={{ width: `${domain.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{domain.progress}%</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 pb-2">
            Quick Actions
          </p>
          <Link href="/tools">
            <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
              location === "/tools"
                ? "bg-muted"
                : "hover:bg-muted"
            }`}>
              <FlaskConical className="text-accent w-5 h-5" />
              <span className="text-foreground">Security Tools</span>
            </div>
          </Link>
          <Link href="/threats">
            <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
              location === "/threats"
                ? "bg-muted"
                : "hover:bg-muted"
            }`}>
              <AlertTriangle className="text-red-600 w-5 h-5" />
              <span className="text-foreground">Threats & Attacks</span>
            </div>
          </Link>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <VenetianMask className="text-purple-600 w-5 h-5" />
            <span className="text-foreground">Attack Scenarios</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <ClipboardCheck className="text-secondary w-5 h-5" />
            <span className="text-foreground">Assessment</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
