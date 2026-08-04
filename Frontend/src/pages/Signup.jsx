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
  Heart
} from "lucide-react";
import { Button } from "@/components/signup/src/app/components/ui/button";
import { Input } from "@/components/signup/src/app/components/ui/input";
import { Label } from "@/components/signup/src/app/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/signup/src/app/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/signup/src/app/components/ui/input-otp";
import { ImageWithFallback } from "@/components/signup/src/app/components/figma/ImageWithFallback";

export default function Signup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: ""
  });
  const [otp, setOtp] = useState("");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setStep("otp");
  };

  const handleVerifyOTP = () => {
    navigate("/patient-profiles");
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
          {step === "signup" ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DCE8EE] rounded-full mb-4">
                  <UserCircle className="w-8 h-8 text-[#6FB3B5]" />
                </div>
                <h2 className="text-3xl text-[#2F3A40] mb-2">Create Account</h2>
                <p className="text-[#7A8A92]">Join our healthcare platform today</p>
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
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                      required
                    />
                  </div>
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

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#6FB3B5] hover:bg-[#5fa3a5] text-white"
                >
                  Create Account
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[#7A8A92]">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[#6FB3B5] hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DCE8EE] rounded-full mb-4">
                  <Mail className="w-8 h-8 text-[#6FB3B5]" />
                </div>
                <h2 className="text-3xl text-[#2F3A40] mb-2">Verify Your Email</h2>
                <p className="text-[#7A8A92]">
                  We've sent a verification code to<br />
                  <span className="font-medium text-[#2F3A40]">{formData.email}</span>
                </p>
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

              <div className="space-y-6">
                <div>
                  <Label className="text-[#2F3A40] mb-3 block text-center">
                    Enter 6-Digit Code
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-12 h-12 text-lg border-gray-300" />
                        <InputOTPSlot index={1} className="w-12 h-12 text-lg border-gray-300" />
                        <InputOTPSlot index={2} className="w-12 h-12 text-lg border-gray-300" />
                        <InputOTPSlot index={3} className="w-12 h-12 text-lg border-gray-300" />
                        <InputOTPSlot index={4} className="w-12 h-12 text-lg border-gray-300" />
                        <InputOTPSlot index={5} className="w-12 h-12 text-lg border-gray-300" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button 
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6}
                  className="w-full h-12 bg-[#6FB3B5] hover:bg-[#5fa3a5] text-white disabled:opacity-50"
                >
                  Verify & Continue
                </Button>

                <div className="text-center">
                  <p className="text-[#7A8A92] text-sm">
                    Didn't receive the code?{" "}
                    <button className="text-[#6FB3B5] hover:underline">
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}