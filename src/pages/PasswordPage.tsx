import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const PASSWORD = 'BPFGroup';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      sessionStorage.setItem('authenticated', 'true');
      navigate('/home');
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">BPF</h1>
          <p className="text-muted-foreground mt-1">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">Incorrect password</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </Card>
    </div>
  );
}
