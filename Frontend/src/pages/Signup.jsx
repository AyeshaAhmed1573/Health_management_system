import { useState } from "react";
import { useLocation } from "wouter";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff,
  Calendar,
  UserCircle,
  Heart,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { useAuth } from "@/lib/authContext";
import { OtpVerification } from "@/components/OtpVerification";

export default function Signup() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [step, setStep] = useState("email-verify"); // Start with email verification
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailVerified = (email) => {
    setVerifiedEmail(email);
    setFormData(prev => ({ ...prev, email }));
    setStep("signup");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const result = await register(
      {
        name: formData.fullName,
        email: verifiedEmail, // Use verified email
        password: formData.password,
        phone: formData.phone,
      },
      'patient'
    );

    if (result.success) {
      setStep("success");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6FB3B5] to-[#9BD3D5] p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <div className="mb-8">
            <Heart className="w-16 h-16 mb-6" strokeWidth={1.5} />
            <h1 className="text-4xl mb-4 text-white">
              Manage Your Family's Health in One Place
            </h1>
            <p className="text-lg text-white/90">
              Create an account to store medical reports, track health records, 
              and manage healthcare information for yourself and your family members.
            </p>
          </div>
          <div className="mt-12 rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758691462568-252f83aae3c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBoZWFsdGhjYXJlJTIwZGlnaXRhbCUyMGlsbHVzdHJhdGlvbnxlbnwxfHx8fDE3NzMyNjQ4NzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Family healthcare illustration"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F6F8]">
        <div className="w-full max-w-md">
          {step === "email-verify" ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DCE8EE] rounded-full mb-4">
                  <Mail className="w-8 h-8 text-[#6FB3B5]" />
                </div>
                <h2 className="text-3xl text-[#2F3A40] mb-2">Verify Your Email</h2>
                <p className="text-[#7A8A92]">We'll send you a verification code to create your account</p>
              </div>

              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6FB3B5] text-white text-sm">
                    1
                  </div>
                  <div className="w-16 h-1 bg-[#DCE8EE] mx-2"></div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#DCE8EE] text-[#7A8A92] text-sm">
                    2
                  </div>
                </div>
              </div>

              <OtpVerification onVerified={handleEmailVerified} />
              
              <div className="mt-6 text-center">
                <p className="text-[#7A8A92]">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/patient-login")}
                    className="text-[#6FB3B5] hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          ) : step === "signup" ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DCE8EE] rounded-full mb-4">
                  <UserCircle className="w-8 h-8 text-[#6FB3B5]" />
                </div>
                <h2 className="text-3xl text-[#2F3A40] mb-2">Create Account</h2>
                <p className="text-[#7A8A92]">Complete your profile to join our healthcare platform</p>
              </div>

              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6FB3B5] text-white text-sm">
                    ✓
                  </div>
                  <div className="w-16 h-1 bg-[#6FB3B5] mx-2"></div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6FB3B5] text-white text-sm">
                    2
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <Label htmlFor="fullName" className="text-[#2F3A40] mb-2 block">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92]" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-[#2F3A40] mb-2 block">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92]" />
                    <Input
                      id="email"
                      type="email"
                      value={verifiedEmail}
                      disabled
                      className="pl-10 h-12 border-gray-300 bg-gray-50 text-gray-600"
                    />
                  </div>
                  <p className="text-xs text-[#6FB3B5] mt-1">✓ Email verified</p>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-[#2F3A40] mb-2 block">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92]" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender" className="text-[#2F3A40] mb-2 block">
                      Gender
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dob" className="text-[#2F3A40] mb-2 block">
                      Date of Birth
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92] pointer-events-none" />
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-[#2F3A40] mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8A92] hover:text-[#6FB3B5]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-[#2F3A40] mb-2 block">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92]" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8A92] hover:text-[#6FB3B5]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-[#6FB3B5] hover:bg-[#5fa3a5] text-white"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[#7A8A92]">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/patient-login")}
                    className="text-[#6FB3B5] hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          ) : step === "success" ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#6FB3B5] rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl text-[#2F3A40] mb-3">Account Created Successfully!</h2>
              <p className="text-[#7A8A92] mb-8">
                Welcome to Vitalis Healthcare. Your account has been created and your email has been verified.
              </p>
              <Button
                onClick={() => navigate("/patient-login")}
                className="w-full h-12 bg-[#6FB3B5] hover:bg-[#5fa3a5] text-white"
              >
                Go to Login
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}