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



        {/* Hospital Details */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-sm" style={{ color: '#2F3A40' }}>Hospital Details (Optional)</h4>
          <div className="space-y-2">
            <Label htmlFor="hospitalName" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Hospital Name
            </Label>
            <Input
              id="hospitalName"
              type="text"
              placeholder="Enter hospital name"
              value={formData.hospitalName}
              onChange={(e) => updateFormData({ hospitalName: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospitalAddress" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Hospital Address
            </Label>
            <Input
              id="hospitalAddress"
              type="text"
              placeholder="Enter hospital address"
              value={formData.hospitalAddress}
              onChange={(e) => updateFormData({ hospitalAddress: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospitalCity" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Hospital City
            </Label>
            <Input
              id="hospitalCity"
              type="text"
              placeholder="Enter hospital city"
              value={formData.hospitalCity}
              onChange={(e) => updateFormData({ hospitalCity: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospitalPhone" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Hospital Phone
            </Label>
            <Input
              id="hospitalPhone"
              type="text"
              placeholder="Enter hospital phone"
              value={formData.hospitalPhone}
              onChange={(e) => updateFormData({ hospitalPhone: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospitalWorkingHours" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Clock className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Working Hours
            </Label>
            <Input
              id="hospitalWorkingHours"
              type="text"
              placeholder="e.g., Mon-Fri 9AM-5PM"
              value={formData.hospitalWorkingHours}
              onChange={(e) => updateFormData({ hospitalWorkingHours: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospitalConsultationFee" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Consultation Fee (PKR)
            </Label>
            <Input
              id="hospitalConsultationFee"
              type="number"
              placeholder="Enter consultation fee"
              value={formData.hospitalConsultationFee}
              onChange={(e) => updateFormData({ hospitalConsultationFee: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
        </div>

        {/* Clinic Details */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-sm" style={{ color: '#2F3A40' }}>Clinic Details (Optional)</h4>
          <div className="space-y-2">
            <Label htmlFor="clinicName" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Clinic Name
            </Label>
            <Input
              id="clinicName"
              type="text"
              placeholder="Enter clinic name"
              value={formData.clinicName}
              onChange={(e) => updateFormData({ clinicName: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicAddress" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Clinic Address
            </Label>
            <Input
              id="clinicAddress"
              type="text"
              placeholder="Enter clinic address"
              value={formData.clinicAddress}
              onChange={(e) => updateFormData({ clinicAddress: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicCity" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Clinic City
            </Label>
            <Input
              id="clinicCity"
              type="text"
              placeholder="Enter clinic city"
              value={formData.clinicCity}
              onChange={(e) => updateFormData({ clinicCity: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicPhone" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Clinic Phone
            </Label>
            <Input
              id="clinicPhone"
              type="text"
              placeholder="Enter clinic phone"
              value={formData.clinicPhone}
              onChange={(e) => updateFormData({ clinicPhone: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicWorkingHours" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Clock className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Working Hours
            </Label>
            <Input
              id="clinicWorkingHours"
              type="text"
              placeholder="e.g., Mon-Fri 6PM-9PM"
              value={formData.clinicWorkingHours}
              onChange={(e) => updateFormData({ clinicWorkingHours: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinicConsultationFee" className="flex items-center gap-2 text-sm font-medium" style={{ color: '#2F3A40' }}>
              <Building2 className="w-4 h-4" style={{ color: '#6FB3B5' }} />
              Consultation Fee (PKR)
            </Label>
            <Input
              id="clinicConsultationFee"
              type="number"
              placeholder="Enter consultation fee"
              value={formData.clinicConsultationFee}
              onChange={(e) => updateFormData({ clinicConsultationFee: e.target.value })}
              className="h-12 text-base"
              style={{ borderColor: '#DCE8EE', borderWidth: '1px' }}
            />
          </div>
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