import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/authContext';
import { useLocation } from 'wouter';

export default function Cart() {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/marketplace/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const response = await fetch(`http://localhost:3000/api/marketplace/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      const response = await fetch(`http://localhost:3000/api/marketplace/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast({
        title: 'Item Removed',
        description: 'Item has been removed from cart',
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('http://localhost:3000/api/marketplace/cart', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast({
        title: 'Cart Cleared',
        description: 'All items have been removed from cart',
      });
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading cart...</div>;
  }

  const cart = cartData?.data;
  const items = cart?.items || [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button onClick={() => setLocation('/marketplace')}>Continue Shopping</Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Button onClick={() => setLocation('/marketplace')}>Browse Products</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.type === 'product' ? 'Product' : item.type === 'lab_test' ? 'Lab Test' : 'Lab Package'}
                    </p>
                    <p className="text-sm text-gray-600">Price: ${item.unitPrice}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantityMutation.mutate({ itemId: item._id, quantity: parseInt(e.target.value) })}
                      className="w-20"
                    />
                    <div className="font-bold">${item.totalPrice}</div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItemMutation.mutate(item._id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="text-lg">Subtotal: ${cart?.subtotal || 0}</div>
                <div className="text-lg">Delivery Fee: ${cart?.deliveryFee || 0}</div>
                <div className="text-xl font-bold">Total: ${cart?.totalAmount || 0}</div>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => clearCartMutation.mutate()}>
                  Clear Cart
                </Button>
                <Button onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
