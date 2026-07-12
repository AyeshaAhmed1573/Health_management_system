import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { ProgressSteps } from "./progress-steps";
import { FileUpload } from "./file-upload";
import { MedixLogo } from "./medix-logo";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = ["Lab Information", "Contact Details", "Upload Documents", "Account Setup"];



const LAB_TYPES = [
  "Diagnostic Laboratory",
  "Pathology Laboratory",
  "Imaging Center",
  "Research Laboratory",
];

const SERVICES = [
  "Blood Tests",
  "Urine Tests",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Ultrasound",
  "COVID Testing",
];

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your favorite book?",
];

export function LabRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    labName: "",
    labRegistrationNumber: "",
    labType: "",
    servicesOffered: [],
    yearsOfOperation: "",
    operatingHours: "",
    labDescription: "",
    contactPersonName: "",
    contactEmail: "",
    contactPhone: "",
    alternatePhone: "",
    labAddress: "",
    city: "",
    provinceState: "",
    postalCode: "",
    googleMapsLocation: "",
    emergencyContact: "",
    labLicense: null,
    governmentReg: null,
    accreditation: null,
    taxReg: null,
    labLogo: null,
    username: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
    termsAccepted: false,
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service) => {
    setFormData((prev) => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter((s) => s !== service)
        : [...prev.servicesOffered, service],
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-[#6FB3B5] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-semibold text-[#2F3A40] mb-3">
            Registration Submitted
          </h2>
          <div className="inline-block bg-[#DCE8EE] px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-medium text-[#6FB3B5]">
              Laboratory account status Approval
            </span>
          </div>
          <p className="text-[#7A8A92] mb-8 max-w-md mx-auto">
            An administrator must verify the laboratory before it can start receiving test requests.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#6FB3B5] hover:bg-[#5FA2A4] text-white px-8"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <MedixLogo />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#2F3A40] mb-2">
            Laboratory Registration
          </h1>
          <p className="text-[#7A8A92]">
            Register your diagnostic laboratory to provide medical testing services
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <ProgressSteps steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Step 1 Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#2F3A40] mb-2">
                    Laboratory Information
                  </h3>
                  <p className="text-sm text-[#7A8A92]">
                    Enter basic information about your laboratory
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="labName">Lab Name</Label>
                    <Input
                      id="labName"
                      value={formData.labName}
                      onChange={(e) => updateFormData("labName", e.target.value)}
                      className="border-[#DCE8EE]"
                      placeholder="Enter laboratory name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labRegistrationNumber">Lab Registration Number</Label>
                    <Input
                      id="labRegistrationNumber"
                      value={formData.labRegistrationNumber}
                      onChange={(e) =>
                        updateFormData("labRegistrationNumber", e.target.value)
                      }
                      className="border-[#DCE8EE]"
                      placeholder="Enter registration number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labType">Lab Type</Label>
                  <Select
                    value={formData.labType}
                    onValueChange={(value) => updateFormData("labType", value)}
                  >
                    <SelectTrigger className="border-[#DCE8EE]">
                      <SelectValue placeholder="Select laboratory type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAB_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Services Offered</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {SERVICES.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={formData.servicesOffered.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <label
                          htmlFor={service}
                          className="text-sm text-[#2F3A40] cursor-pointer"
                        >
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfOperation">Years of Operation</Label>
                    <Input
                      id="yearsOfOperation"
                      type="number"
                      value={formData.yearsOfOperation}
                      onChange={(e) =>
                        updateFormData("yearsOfOperation", e.target.value)
                      }
                      className="border-[#DCE8EE]"
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operatingHours">Operating Hours</Label>
                    <Input
                      id="operatingHours"
                      value={formData.operatingHours}
                      onChange={(e) => updateFormData("operatingHours", e.target.value)}
                      className="border-[#DCE8EE]"
                      placeholder="e.g., Mon-Fri 8AM-6PM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labDescription">Laboratory Description</Label>
                  <Textarea
                    id="labDescription"
                    value={formData.labDescription}
                    onChange={(e) => updateFormData("labDescription", e.target.value)}
                    className="border-[#DCE8EE] min-h-32"
                    placeholder="Describe your laboratory and services"
                  />
                </div>
              </div>
            )}

            {/* Step 2 Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#2F3A40] mb-2">
                    Contact Details
                  </h3>
                  <p className="text-sm text-[#7A8A92]">
                    Provide contact and location information
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonName">Contact Person Name</Label>
                    <Input
                      id="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={(e) =>
                        updateFormData("contactPersonName", e.target.value)
                      }
                      className="border-[#DCE8EE]"
                      placeholder="Enter contact person name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => updateFormData("contactEmail", e.target.value)}
                      className="border-[#DCE8EE]"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone Number</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => updateFormData("contactPhone", e.target.value)}
                      className="border-[#DCE8EE]"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Alternate Phone Number</Label>
                    <Input
                      id="alternatePhone"
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={(e) => updateFormData("alternatePhone", e.target.value)}
                      className="border-[#DCE8EE]"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labAddress">Lab Address</Label>
                  <Input
                    id="labAddress"
                    value={formData.labAddress}
                    onChange={(e) => updateFormData("labAddress", e.target.value)}
                    className="border-[#DCE8EE]"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      className="border-[#DCE8EE]"
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provinceState">Province or State</Label>
                    <Input
                      id="provinceState"
                      value={formData.provinceState}
                      onChange={(e) => updateFormData("provinceState", e.target.value)}
                      className="border-[#DCE8EE]"
                      placeholder="State/Province"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => updateFormData("postalCode", e.target.value)}
                      className="border-[#DCE8EE]"
                      placeholder="Postal Code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleMapsLocation">
                    Google Maps Location <span className="text-[#7A8A92]">(optional)</span>
                  </Label>
                  <Input
                    id="googleMapsLocation"
                    value={formData.googleMapsLocation}
                    onChange={(e) =>
                      updateFormData("googleMapsLocation", e.target.value)
                    }
                    className="border-[#DCE8EE]"
                    placeholder="Enter Google Maps link"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
                  <Input
                    id="emergencyContact"
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => updateFormData("emergencyContact", e.target.value)}
                    className="border-[#DCE8EE]"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            )}

            {/* Step 3 Documents */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#2F3A40] mb-2">
                    Upload Verification Documents
                  </h3>
                  <p className="text-sm text-[#7A8A92]">
                    Upload required documents for verification
                  </p>
                </div>

                <FileUpload
                  label="Upload Lab License Certificate"
                  onChange={(file) => updateFormData("labLicense", file)}
                />

                <FileUpload
                  label="Upload Government Registration Document"
                  onChange={(file) => updateFormData("governmentReg", file)}
                />

                <FileUpload
                  label="Upload Accreditation Certificate"
                  optional
                  onChange={(file) => updateFormData("accreditation", file)}
                />

                <FileUpload
                  label="Upload Tax Registration Document"
                  onChange={(file) => updateFormData("taxReg", file)}
                />

                <FileUpload
                  label="Upload Laboratory Logo"
                  onChange={(file) => updateFormData("labLogo", file)}
                />
              </div>
            )}

            {/* Step 4 Setup */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#2F3A40] mb-2">
                    Account Setup
                  </h3>
                  <p className="text-sm text-[#7A8A92]">
                    Create your account credentials
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => updateFormData("username", e.target.value)}
                    className="border-[#DCE8EE]"
                    placeholder="Choose a username"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      className="border-[#DCE8EE]"
                      placeholder="Create a password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateFormData("confirmPassword", e.target.value)
                      }
                      className="border-[#DCE8EE]"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityQuestion">Security Question</Label>
                  <Select
                    value={formData.securityQuestion}
                    onValueChange={(value) => updateFormData("securityQuestion", value)}
                  >
                    <SelectTrigger className="border-[#DCE8EE]">
                      <SelectValue placeholder="Select a security question" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECURITY_QUESTIONS.map((question) => (
                        <SelectItem key={question} value={question}>
                          {question}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityAnswer">Security Answer</Label>
                  <Input
                    id="securityAnswer"
                    value={formData.securityAnswer}
                    onChange={(e) => updateFormData("securityAnswer", e.target.value)}
                    className="border-[#DCE8EE]"
                    placeholder="Enter your answer"
                  />
                </div>

                <div className="flex items-start space-x-3 pt-4">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) =>
                      updateFormData("termsAccepted", checked)
                    }
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-[#2F3A40] cursor-pointer leading-relaxed"
                  >
                    I agree to the{" "}
                    <span className="text-[#6FB3B5] hover:underline">
                      Terms and Conditions
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#DCE8EE]">
              {currentStep > 0 && (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="outline"
                  className="border-[#DCE8EE] text-[#2F3A40] hover:bg-[#F4F6F8]"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}

              {currentStep === STEPS.length - 1 ? (
                <Button
                  type="submit"
                  className="bg-[#6FB3B5] hover:bg-[#5FA2A4] text-white ml-auto"
                >
                  Submit for Verification
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#6FB3B5] hover:bg-[#5FA2A4] text-white ml-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}