import { useState } from 'react';
import { ChevronDown } from 'lucide-react';



const pharmacyTypes = [
  'Retail Pharmacy',
  'Hospital Pharmacy',
  'Online Pharmacy',
  'Clinic Pharmacy',
  'Compounding Pharmacy',
];

const servicesOptions = [
  'Prescription Medicines',
  'Over-the-counter Medicines',
  'Home Delivery',
  'Medical Equipment',
  'Health Consultation',
  'Vaccination Services',
];

export function PharmacyInformation({ formData, updateFormData }) {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  const toggleService = (service) => {
    const currentServices = formData.servicesOffered || [];
    if (currentServices.includes(service)) {
      updateFormData(
        'servicesOffered',
        currentServices.filter((s) => s !== service)
      );
    } else {
      updateFormData('servicesOffered', [...currentServices, service]);
    }
  };

  return (
    <div>
      <h2 className="mb-6" style={{ color: '#2F3A40' }}>
        Pharmacy Information
      </h2>

      <div className="space-y-6">
        {/* Pharmacy Name */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Pharmacy Name <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.pharmacyName}
            onChange={(e) => updateFormData('pharmacyName', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter pharmacy name"
          />
        </div>

        {/* Pharmacy License Number */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Pharmacy License Number <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => updateFormData('licenseNumber', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter license number"
          />
        </div>

        {/* Pharmacy Type */}
        <div className="relative">
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Pharmacy Type <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <div
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="w-full px-4 py-3 rounded-lg border cursor-pointer flex items-center justify-between"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
          >
            <span style={{ color: formData.pharmacyType ? '#2F3A40' : '#7A8A92' }}>
              {formData.pharmacyType || 'Select pharmacy type'}
            </span>
            <ChevronDown className="w-5 h-5" style={{ color: '#7A8A92' }} />
          </div>
          {isTypeDropdownOpen && (
            <div
              className="absolute z-10 w-full mt-2 rounded-lg border shadow-lg"
              style={{
                borderColor: '#DCE8EE',
                backgroundColor: '#FFFFFF',
              }}
            >
              {pharmacyTypes.map((type) => (
                <div
                  key={type}
                  onClick={() => {
                    updateFormData('pharmacyType', type);
                    setIsTypeDropdownOpen(false);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-opacity-50 transition-all"
                  style={{
                    backgroundColor:
                      formData.pharmacyType === type ? '#DCE8EE' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (formData.pharmacyType !== type) {
                      e.currentTarget.style.backgroundColor = '#F4F6F8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.pharmacyType !== type) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Services Offered */}
        <div className="relative">
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Services Offered <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <div
            onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
            className="w-full px-4 py-3 rounded-lg border cursor-pointer flex items-center justify-between min-h-[52px]"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div className="flex flex-wrap gap-2">
              {formData.servicesOffered.length > 0 ? (
                formData.servicesOffered.map((service) => (
                  <span
                    key={service}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: '#9BD3D5',
                      color: '#2F3A40',
                    }}
                  >
                    {service}
                  </span>
                ))
              ) : (
                <span style={{ color: '#7A8A92' }}>Select services offered</span>
              )}
            </div>
            <ChevronDown className="w-5 h-5 ml-2" style={{ color: '#7A8A92' }} />
          </div>
          {isServicesDropdownOpen && (
            <div
              className="absolute z-10 w-full mt-2 rounded-lg border shadow-lg"
              style={{
                borderColor: '#DCE8EE',
                backgroundColor: '#FFFFFF',
              }}
            >
              {servicesOptions.map((service) => (
                <div
                  key={service}
                  onClick={() => toggleService(service)}
                  className="px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-opacity-50 transition-all"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F4F6F8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    className="w-5 h-5 rounded border flex items-center justify-center"
                    style={{
                      borderColor: formData.servicesOffered.includes(service)
                        ? '#6FB3B5'
                        : '#DCE8EE',
                      backgroundColor: formData.servicesOffered.includes(service)
                        ? '#6FB3B5'
                        : '#FFFFFF',
                    }}
                  >
                    {formData.servicesOffered.includes(service) && (
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span style={{ color: '#2F3A40' }}>{service}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Years of Operation */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Years of Operation <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="number"
            value={formData.yearsOfOperation}
            onChange={(e) => updateFormData('yearsOfOperation', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter years of operation"
            min="0"
          />
        </div>

        {/* Operating Hours */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Operating Hours <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.operatingHours}
            onChange={(e) => updateFormData('operatingHours', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="e.g., Mon-Fri:00 AM - 8:00 PM, Sat-Sun:00 AM - 6:00 PM"
          />
        </div>

        {/* Pharmacy Description */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Pharmacy Description
          </label>
          <textarea
            value={formData.pharmacyDescription}
            onChange={(e) => updateFormData('pharmacyDescription', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Provide a brief description of your pharmacy"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
