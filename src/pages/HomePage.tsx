import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Calculator, GitBranch } from 'lucide-react';

interface AppCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  available?: boolean;
}

function AppCard({ title, description, icon, href, available = true }: AppCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
        !available ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={() => available && navigate(href)}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
          {!available && (
            <span className="text-xs text-muted-foreground mt-2 inline-block">Coming soon</span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('authenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  const apps = [
    {
      title: 'BPFee',
      description: 'Calculate ongoing advice fees, SMSF costs, and document service charges',
      icon: <Calculator className="h-6 w-6 text-primary" />,
      href: '/bpfee',
      available: true,
    },
    {
      title: 'Workflow Tracker',
      description: 'Track and manage workflow tasks and processes',
      icon: <GitBranch className="h-6 w-6 text-primary" />,
      href: '/workflow',
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">BPF</h1>
          <p className="text-primary-foreground/80 mt-2">Select an application to continue</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard key={app.title} {...app} />
          ))}
        </div>
      </main>
    </div>
  );
}
