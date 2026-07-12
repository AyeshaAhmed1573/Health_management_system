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
import {
  Stethoscope,
  FileText,
  Award,
  Clock,
  Building2,
  ChevronLeft,
} from 'lucide-react';

export function ProfessionalDetailsForm({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#2F3A40' }}>
          Professional Details
        </h3>
        <p className="text-base" style={{ color: '#7A8A92' }}>
          Share your medical qualifications and experience
        </p>
      </div>

      <div className="space-y-5">
        {/* Specialization */}
        <div className="space-y-2">
          <Label htmlFor="specialization" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Stethoscope className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Specialization
          </Label>
          <Select
            value={formData.specialization}
            onValueChange={(value) => updateFormData({ specialization: value })}
          >
            <SelectTrigger className="h-12 text-base" style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}>
              <SelectValue placeholder="Select your specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="dermatology">Dermatology</SelectItem>
              <SelectItem value="endocrinology">Endocrinology</SelectItem>
              <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
              <SelectItem value="general-medicine">General Medicine</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
              <SelectItem value="psychiatry">Psychiatry</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Medical License Number */}
        <div className="space-y-2">
          <Label htmlFor="licenseNumber" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <FileText className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Medical License Number
          </Label>
          <Input
            id="licenseNumber"
            type="text"
            placeholder="Enter your license number"
            value={formData.licenseNumber}
            onChange={(e) => updateFormData({ licenseNumber: e.target.value })}
            className="h-12 text-base"
            style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
          />
        </div>

        {/* PMDC / PMC Registration Number */}
        <div className="space-y-2">
          <Label htmlFor="pmdcNumber" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Award className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            PMDC / PMC Registration Number
          </Label>
          <Input
            id="pmdcNumber"
            type="text"
            placeholder="Enter your PMDC/PMC number"
            value={formData.pmdcNumber}
            onChange={(e) => updateFormData({ pmdcNumber: e.target.value })}
            className="h-12 text-base"
            style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
          />
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <Label htmlFor="yearsExperience" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Clock className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Years of Experience
          </Label>
          <Select
            value={formData.yearsExperience}
            onValueChange={(value) =>
              updateFormData({ yearsExperience: value })
            }
          >
            <SelectTrigger className="h-12 text-base" style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}>
              <SelectValue placeholder="Select years of experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-2">0-2 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="6-10">6-10 years</SelectItem>
              <SelectItem value="11-15">11-15 years</SelectItem>
              <SelectItem value="16-20">16-20 years</SelectItem>
              <SelectItem value="20+">20+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hospital / Clinic Name */}
        <div className="space-y-2">
          <Label htmlFor="hospitalName" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
            <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
            Hospital / Clinic Name
          </Label>
          <Input
            id="hospitalName"
            type="text"
            placeholder="Enter hospital or clinic name"
            value={formData.hospitalName}
            onChange={(e) => updateFormData({ hospitalName: e.target.value })}
            className="h-12 text-base"
            style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-10 h-12 text-base font-medium rounded-lg shadow-sm hover:opacity-80 transition-opacity"
          style={{ borderColor: '#DCE8EE', color: '#2F3A40', borderWidth: '1px' }}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
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