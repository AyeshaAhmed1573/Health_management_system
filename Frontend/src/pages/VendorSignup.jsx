import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function VendorSignup() {
  const [, setLocation] = useLocation();
  const { marketplaceVendorLogin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [vendorData, setVendorData] = useState({
    businessName: '',
    type: '',
    licenseNumber: '',
    description: '',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
    },
    city: '',
    serviceArea: '',
    contactInfo: {
      phone: '',
      email: '',
    },
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '14:00', closed: false },
      sunday: { open: 'closed', closed: true },
    },
    deliveryAvailable: false,
    deliveryAreas: '',
    homeCollectionAvailable: false,
    homeCollectionFee: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/vendors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorData: {
            ...vendorData,
            serviceArea: vendorData.serviceArea.split(',').map(s => s.trim()),
            deliveryAreas: vendorData.deliveryAreas ? vendorData.deliveryAreas.split(',').map(s => s.trim()) : [],
          },
          ownerData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Registration Successful',
        description: 'Your vendor registration has been submitted for approval.',
      });

      // Auto-login after registration
      const loginResult = await marketplaceVendorLogin(ownerData.email, ownerData.password);
      if (loginResult.success) {
        setLocation('/vendor/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2">Vendor Registration</h2>
          <p className="text-gray-600 mb-6">
            Register your pharmacy or laboratory as a vendor on our marketplace
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Owner Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Full Name</Label>
                  <Input
                    id="ownerName"
                    value={ownerData.name}
                    onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={ownerData.email}
                    onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Phone</Label>
                  <Input
                    id="ownerPhone"
                    value={ownerData.phone}
                    onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerPassword">Password</Label>
                  <Input
                    id="ownerPassword"
                    type="password"
                    value={ownerData.password}
                    onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Vendor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={vendorData.businessName}
                  onChange={(e) => setVendorData({ ...vendorData, businessName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorType">Vendor Type</Label>
                <Select
                  value={vendorData.type}
                  onValueChange={(value) => setVendorData({ ...vendorData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={vendorData.licenseNumber}
                  onChange={(e) => setVendorData({ ...vendorData, licenseNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={vendorData.description}
                  onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={vendorData.address.street}
                    onChange={(e) => setVendorData({
                      ...vendorData,
                      address: { ...vendorData.address, street: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={vendorData.address.city}
                    onChange={(e) => setVendorData({
                      ...vendorData,
                      address: { ...vendorData.address, city: e.target.value },
                      city: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={vendorData.address.province}
                    onChange={(e) => setVendorData({
                      ...vendorData,
                      address: { ...vendorData.address, province: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={vendorData.address.postalCode}
                    onChange={(e) => setVendorData({
                      ...vendorData,
                      address: { ...vendorData.address, postalCode: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={vendorData.contactInfo.phone}
                    onChange={(e) => setVendorData({
                      ...vendorData,
                      contactInfo: { ...vendorData.contactInfo, phone: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={vendorData.contactInfo.email}
                    onChange={(e) => setVendorData({
                      ...vendorData,
                      contactInfo: { ...vendorData.contactInfo, email: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Service Area */}
            <div className="space-y-2">
              <Label htmlFor="serviceArea">Service Areas (comma-separated)</Label>
              <Input
                id="serviceArea"
                value={vendorData.serviceArea}
                onChange={(e) => setVendorData({ ...vendorData, serviceArea: e.target.value })}
                placeholder="e.g., Manhattan, Brooklyn, Queens"
              />
            </div>

            {/* Type-specific fields */}
            {vendorData.type === 'pharmacy' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pharmacy Settings</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="deliveryAvailable"
                    checked={vendorData.deliveryAvailable}
                    onChange={(e) => setVendorData({ ...vendorData, deliveryAvailable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="deliveryAvailable">Delivery Available</Label>
                </div>
                {vendorData.deliveryAvailable && (
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAreas">Delivery Areas (comma-separated)</Label>
                    <Input
                      id="deliveryAreas"
                      value={vendorData.deliveryAreas}
                      onChange={(e) => setVendorData({ ...vendorData, deliveryAreas: e.target.value })}
                      placeholder="e.g., Manhattan, Brooklyn"
                    />
                  </div>
                )}
              </div>
            )}

            {vendorData.type === 'laboratory' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Laboratory Settings</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="homeCollectionAvailable"
                    checked={vendorData.homeCollectionAvailable}
                    onChange={(e) => setVendorData({ ...vendorData, homeCollectionAvailable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="homeCollectionAvailable">Home Collection Available</Label>
                </div>
                {vendorData.homeCollectionAvailable && (
                  <div className="space-y-2">
                    <Label htmlFor="homeCollectionFee">Home Collection Fee ($)</Label>
                    <Input
                      id="homeCollectionFee"
                      type="number"
                      value={vendorData.homeCollectionFee}
                      onChange={(e) => setVendorData({ ...vendorData, homeCollectionFee: parseFloat(e.target.value) })}
                    />
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register Vendor'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
