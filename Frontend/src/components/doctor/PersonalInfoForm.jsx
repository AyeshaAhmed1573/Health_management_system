import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { User, Mail, Phone, Calendar, Users } from 'lucide-react';

export function PersonalInfoForm({
  formData,
  updateFormData,
  onNext,
}) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#2F3A40' }}>
          Personal Information
        </h3>
        <p className="text-base" style={{ color: '#7A8A92' }}>
          Please provide your basic personal details
        </p>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <User className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            className="h-12 text-base"
            style={{ 
              borderColor: '#DCE8EE',
              borderWidth: '1px',
            }}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Mail className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="h-12 text-base"
            style={{ 
              borderColor: '#DCE8EE',
              borderWidth: '1px',
            }}
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Phone className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+92 300 1234567"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="h-12 text-base"
            style={{ 
              borderColor: '#DCE8EE',
              borderWidth: '1px',
            }}
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Calendar className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            className="h-12 text-base"
            style={{ 
              borderColor: '#DCE8EE',
              borderWidth: '1px',
            }}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Users className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Gender
          </Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => updateFormData({ gender: value })}
          >
            <SelectTrigger className="h-12 text-base" style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={onNext}
          className="text-white px-10 h-12 text-base font-medium rounded-lg shadow-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6FB3B5' }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}