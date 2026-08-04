import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Heart } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Checkbox } from "../components/ui/checkbox.jsx";
import { ImageWithFallback } from "../components/figma/ImageWithFallback.jsx";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Healthcare Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6FB3B5] to-[#9BD3D5] p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <div className="mb-8">
            <Heart className="w-16 h-16 mb-6" strokeWidth={1.5} />
            <h1 className="text-4xl mb-4 text-white">
              Welcome Back
            </h1>
            <p className="text-lg text-white/90">
              Access your healthcare dashboard and manage your family's health records securely.
            </p>
          </div>
          <div className="mt-12 rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758691461957-13aff0c37c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVjaG5vbG9neSUyMGhlYWx0aGNhcmV8ZW58MXx8fHwxNzczMjExOTAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Healthcare technology"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F6F8]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DCE8EE] rounded-full mb-4">
                <Heart className="w-8 h-8 text-[#6FB3B5]" />
              </div>
              <h2 className="text-3xl text-[#2F3A40] mb-2">Welcome Back</h2>
              <p className="text-[#7A8A92]">Login to access your healthcare dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                    required
                  />
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked)}
                    className="border-gray-300"
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm text-[#7A8A92] cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-[#6FB3B5] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#6FB3B5] hover:bg-[#5fa3a5] text-white"
              >
                Login
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#7A8A92]">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-[#6FB3B5] hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
