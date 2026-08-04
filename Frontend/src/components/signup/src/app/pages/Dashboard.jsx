import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Heart,
  FileText,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Plus,
  Activity,
  Pill,
  ClipboardList,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Card } from "../components/ui/card.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu.jsx";

// Mock data for demonstration
const mockProfiles = [
  { id: "1", name: "John Smith", relationship: "Self", age: 35, bloodGroup: "O+" },
  { id: "2", name: "Mary Smith", relationship: "Spouse", age: 33, bloodGroup: "A+" },
  { id: "3", name: "Emily Smith", relationship: "Daughter", age: 8, bloodGroup: "O+" },
  { id: "4", name: "Robert Smith Sr.", relationship: "Father", age: 65, bloodGroup: "B+" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(mockProfiles[0]);

  const handleLogout = () => {
    navigate("/login");
  };

  const handleAddProfile = () => {
    navigate("/patient-profiles");
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#6FB3B5] rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-[#2F3A40]">HealthCare Platform</h1>
                <p className="text-sm text-[#7A8A92]">Family Health Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5 text-[#7A8A92]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5 text-[#7A8A92]" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[#7A8A92] hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl text-[#2F3A40] mb-1">Family Profiles</h2>
              <p className="text-[#7A8A92]">Select a profile to view health records</p>
            </div>
            <Button
              onClick={handleAddProfile}
              className="bg-[#6FB3B5] hover:bg-[#5fa3a5] text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockProfiles.map((profile) => (
              <Card
                key={profile.id}
                onClick={() => setSelectedProfile(profile)}
                className={`p-5 cursor-pointer transition-all ${
                  selectedProfile.id === profile.id
                    ? "bg-[#6FB3B5] border-[#6FB3B5] shadow-lg"
                    : "bg-white border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedProfile.id === profile.id
                        ? "bg-white/20"
                        : "bg-[#DCE8EE]"
                    }`}
                  >
                    <User
                      className={`w-6 h-6 ${
                        selectedProfile.id === profile.id ? "text-white" : "text-[#6FB3B5]"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`mb-1 ${
                        selectedProfile.id === profile.id
                          ? "text-white"
                          : "text-[#2F3A40]"
                      }`}
                    >
                      {profile.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        selectedProfile.id === profile.id
                          ? "text-white/80"
                          : "text-[#7A8A92]"
                      }`}
                    >
                      {profile.relationship} • {profile.age} yrs
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        selectedProfile.id === profile.id
                          ? "text-white/80"
                          : "text-[#7A8A92]"
                      }`}
                    >
                      Blood: {profile.bloodGroup}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Current Profile Dashboard */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-[#6FB3B5] to-[#9BD3D5] rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 mb-1">Viewing Dashboard For</p>
                <h2 className="text-3xl mb-2">{selectedProfile.name}</h2>
                <p className="text-white/90">
                  {selectedProfile.relationship} • {selectedProfile.age} years old • Blood Group:{" "}
                  {selectedProfile.bloodGroup}
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-5 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[#7A8A92]">Appointments</p>
                  <p className="text-2xl text-[#2F3A40]">3</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Pill className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-[#7A8A92]">Prescriptions</p>
                  <p className="text-2xl text-[#2F3A40]">5</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-[#7A8A92]">Reports</p>
                  <p className="text-2xl text-[#2F3A40]">12</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-white border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-[#7A8A92]">Lab Tests</p>
                  <p className="text-2xl text-[#2F3A40]">8</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Upcoming Appointments */}
            <Card className="md:col-span-2 p-6 bg-white border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl text-[#2F3A40]">Upcoming Appointments</h3>
                <Button variant="ghost" size="sm" className="text-[#6FB3B5]">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-[#F4F6F8] rounded-lg">
                  <div className="w-12 h-12 bg-[#6FB3B5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#2F3A40] mb-1">General Checkup</h4>
                    <p className="text-sm text-[#7A8A92]">Dr. Sarah Johnson</p>
                    <p className="text-sm text-[#7A8A92] mt-1">March 15, 2026 at 10:00 AM</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-[#6FB3B5] text-[#6FB3B5]">
                    Details
                  </Button>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#F4F6F8] rounded-lg">
                  <div className="w-12 h-12 bg-[#6FB3B5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#2F3A40] mb-1">Dental Cleaning</h4>
                    <p className="text-sm text-[#7A8A92]">Dr. Michael Chen</p>
                    <p className="text-sm text-[#7A8A92] mt-1">March 20, 2026 at 2:30 PM</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-[#6FB3B5] text-[#6FB3B5]">
                    Details
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Reports */}
            <Card className="p-6 bg-white border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl text-[#2F3A40]">Recent Reports</h3>
                <Button variant="ghost" size="sm" className="text-[#6FB3B5]">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#F4F6F8] rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#2F3A40]">Blood Test</p>
                    <p className="text-xs text-[#7A8A92]">Mar 8, 2026</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#F4F6F8] rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#2F3A40]">X-Ray Report</p>
                    <p className="text-xs text-[#7A8A92]">Mar 5, 2026</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#F4F6F8] rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#2F3A40]">ECG Report</p>
                    <p className="text-xs text-[#7A8A92]">Feb 28, 2026</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
