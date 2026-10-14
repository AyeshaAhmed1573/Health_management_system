import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/authContext';
import { useLocation } from 'wouter';

export default function Checkout() {
  const { token, user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/marketplace/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
  });

  const { data: profilesData } = useQuery({
    queryKey: ['patient-profiles'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return response.json();
    },
  });

  const [formData, setFormData] = useState({
    profileId: '',
    deliveryAddress: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
    },
    paymentMethod: 'cod',
    notes: '',
  });

  const checkoutMutation = useMutation({
    mutationFn: async (checkoutData) => {
      const response = await fetch('http://localhost:5000/api/marketplace/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutData),
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['cart']);
      toast({
        title: 'Order Placed Successfully',
        description: `Order #${data.data.orderNumber} has been placed`,
      });
      setLocation(`/my-orders`);
    },
    onError: (error) => {
      toast({
        title: 'Checkout Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    checkoutMutation.mutate(formData);
  };

  const cart = cartData?.data;
  const profiles = profilesData?.data || [];

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Button onClick={() => setLocation('/marketplace')}>Browse Products</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checkout Form */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileId">Select Profile</Label>
                <select
                  id="profileId"
                  value={formData.profileId}
                  onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a profile</option>
                  {profiles.map((profile) => (
                    <option key={profile._id} value={profile._id}>
                      {profile.name} ({profile.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.deliveryAddress.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    deliveryAddress: { ...formData.deliveryAddress, street: e.target.value }
                  })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.deliveryAddress.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryAddress: { ...formData.deliveryAddress, city: e.target.value }
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={formData.deliveryAddress.province}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryAddress: { ...formData.deliveryAddress, province: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.deliveryAddress.postalCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    deliveryAddress: { ...formData.deliveryAddress, postalCode: e.target.value }
                  })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={checkoutMutation.isPending}>
                {checkoutMutation.isPending ? 'Processing...' : 'Place Order'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            {cart.items.map((item) => (
              <div key={item._id} className="flex justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                </div>
                <div className="font-bold">${item.totalPrice}</div>
              </div>
            ))}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cart.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${cart.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${cart.totalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
