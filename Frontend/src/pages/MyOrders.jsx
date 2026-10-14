import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/authContext';

export default function MyOrders() {
  const { token } = useAuth();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/marketplace/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading orders...</div>;
  }

  const orders = ordersData?.data?.orders || [];

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Order #{order.orderNumber}</h3>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <div className="space-y-4">
                  <div className="text-lg font-bold">Sub-orders</div>
                  {order.subOrders.map((subOrder) => (
                    <div key={subOrder._id} className="border p-4 rounded space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{subOrder.vendorName}</div>
                          <div className="text-sm text-gray-600">{subOrder.vendorType}</div>
                        </div>
                        <Badge variant="outline">
                          {subOrder.orderStatus || subOrder.bookingStatus}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {subOrder.items.map((item) => (
                          <div key={item._id} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${item.totalPrice}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Subtotal</span>
                        <span>${subOrder.totalAmount}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-xl font-bold pt-4 border-t">
                    <span>Total</span>
                    <span>${order.totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
