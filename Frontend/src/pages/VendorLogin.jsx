import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function VendorLogin() {
  const [, setLocation] = useLocation();
  const { marketplaceVendorLogin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await marketplaceVendorLogin(formData.email, formData.password);

      if (result.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to your vendor dashboard',
        });
        setLocation('/vendor/dashboard');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2">Vendor Login</h2>
          <p className="text-gray-600 mb-6">
            Login to manage your pharmacy or laboratory
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <a href="/vendor-signup" className="text-blue-600 hover:underline">
              Don't have a vendor account? Register
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
