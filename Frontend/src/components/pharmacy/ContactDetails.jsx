

export function ContactDetails({ formData, updateFormData }) {
  return (
    <div>
      <h2 className="mb-6" style={{ color: '#2F3A40' }}>
        Contact Details
      </h2>

      <div className="space-y-6">
        {/* Contact Person Name */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Contact Person Name <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.contactPersonName}
            onChange={(e) => updateFormData('contactPersonName', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter contact person name"
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Contact Email <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => updateFormData('contactEmail', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter email address"
          />
        </div>

        {/* Contact Phone Number */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Contact Phone Number <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => updateFormData('contactPhone', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter phone number"
          />
        </div>

        {/* Alternate Phone Number */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Alternate Phone Number
          </label>
          <input
            type="tel"
            value={formData.alternatePhone}
            onChange={(e) => updateFormData('alternatePhone', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter alternate phone number"
          />
        </div>

        {/* Pharmacy Address */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Pharmacy Address <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <textarea
            value={formData.pharmacyAddress}
            onChange={(e) => updateFormData('pharmacyAddress', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter complete pharmacy address"
            rows={3}
          />
        </div>

        {/* City and Province in grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2" style={{ color: '#2F3A40' }}>
              City <span style={{ color: '#6FB3B5' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: '#DCE8EE',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block mb-2" style={{ color: '#2F3A40' }}>
              Province / State <span style={{ color: '#6FB3B5' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => updateFormData('province', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: '#DCE8EE',
                backgroundColor: '#FFFFFF',
              }}
              placeholder="Enter province/state"
            />
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Postal Code <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => updateFormData('postalCode', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter postal code"
          />
        </div>

        {/* Google Maps Location */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Google Maps Location <span style={{ color: '#7A8A92' }}>(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.googleMapsLocation}
            onChange={(e) => updateFormData('googleMapsLocation', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Paste Google Maps link or coordinates"
          />
        </div>

        {/* Emergency Contact Number */}
        <div>
          <label className="block mb-2" style={{ color: '#2F3A40' }}>
            Emergency Contact Number <span style={{ color: '#6FB3B5' }}>*</span>
          </label>
          <input
            type="tel"
            value={formData.emergencyContact}
            onChange={(e) => updateFormData('emergencyContact', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#DCE8EE',
              backgroundColor: '#FFFFFF',
            }}
            placeholder="Enter emergency contact number"
          />
        </div>
      </div>
    </div>
  );
}
