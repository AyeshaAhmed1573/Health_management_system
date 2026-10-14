import { useAuth } from '@/lib/authContext';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';

export default function VendorDashboard() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/dashboard/overview', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
  });

  const { data: salesData } = useQuery({
    queryKey: ['vendor-sales-chart'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/dashboard/sales-chart?period=30d', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch sales data');
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome, {user?.name}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <div className="text-3xl font-bold">{dashboardData?.data?.orders?.total || 0}</div>
            <div className="text-sm text-gray-600">This month: {dashboardData?.data?.orders?.thisMonth || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <div className="text-3xl font-bold">${dashboardData?.data?.revenue?.total || 0}</div>
            <div className="text-sm text-gray-600">This month: ${dashboardData?.data?.revenue?.thisMonth || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Reviews</h3>
            <div className="text-3xl font-bold">{dashboardData?.data?.reviews?.total || 0}</div>
            <div className="text-sm text-gray-600">Rating: {dashboardData?.data?.reviews?.averageRating?.toFixed(1) || 0}/5</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Inventory Alerts</h3>
            <div className="text-3xl font-bold text-orange-500">
              {dashboardData?.data?.inventory?.lowStock || 0}
            </div>
            <div className="text-sm text-gray-600">Low stock items</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Overview (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData?.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setLocation('/vendor/products')}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Manage Products</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove your products</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">View Orders</h3>
            <p className="text-sm text-gray-600">Manage and track your orders</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Settings</h3>
            <p className="text-sm text-gray-600">Update your business profile</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
