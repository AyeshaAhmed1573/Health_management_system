import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  Plus, 
  User, 
  Calendar, 
  Droplet,
  AlertCircle,
  Pill,
  Trash2,
  Users,
  CheckCircle2
} from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select.jsx";
import { Card } from "../components/ui/card.jsx";

export function PatientProfiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [currentProfile, setCurrentProfile] = useState({
    name: "",
    relationship: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    medicalConditions: "",
    allergies: ""
  });

  const handleInputChange = (field, value) => {
    setCurrentProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProfile = (e) => {
    e.preventDefault();
    
    const newProfile = {
      id: Date.now().toString(),
      name: currentProfile.name || "",
      relationship: currentProfile.relationship || "",
      gender: currentProfile.gender || "",
      dateOfBirth: currentProfile.dateOfBirth || "",
      bloodGroup: currentProfile.bloodGroup || "",
      medicalConditions: currentProfile.medicalConditions || "",
      allergies: currentProfile.allergies || ""
    };

    setProfiles([...profiles, newProfile]);
    
    // Reset form
    setCurrentProfile({
      name: "",
      relationship: "",
      gender: "",
      dateOfBirth: "",
      bloodGroup: "",
      medicalConditions: "",
      allergies: ""
    });
    setShowForm(false);
  };

  const handleDeleteProfile = (id) => {
    setProfiles(profiles.filter(p => p.id !== id));
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4">
            <Users className="w-8 h-8 text-[#6FB3B5]" />
          </div>
          <h1 className="text-4xl text-[#2F3A40] mb-3">Add Patient Profiles</h1>
          <p className="text-[#7A8A92] text-lg">
            Add family members to manage their healthcare records
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6FB3B5] text-white text-sm">
              ✓
            </div>
            <div className="w-24 h-1 bg-[#6FB3B5] mx-2"></div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6FB3B5] text-white text-sm">
              ✓
            </div>
            <div className="w-24 h-1 bg-[#6FB3B5] mx-2"></div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#6FB3B5] text-white text-sm">
              3
            </div>
          </div>
        </div>

        {/* Existing Profiles */}
        {profiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl text-[#2F3A40] mb-4">Family Members ({profiles.length})</h3>
            <div className="grid gap-4 mb-6">
              {profiles.map((profile) => (
                <Card key={profile.id} className="p-5 bg-white border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#DCE8EE] flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-[#6FB3B5]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg text-[#2F3A40]">{profile.name}</h4>
                          <span className="px-3 py-1 bg-[#DCE8EE] text-[#6FB3B5] text-sm rounded-full">
                            {profile.relationship}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="text-[#7A8A92]">
                            <span className="text-[#2F3A40]">Gender:</span> {profile.gender}
                          </div>
                          <div className="text-[#7A8A92]">
                            <span className="text-[#2F3A40]">DOB:</span> {profile.dateOfBirth}
                          </div>
                          <div className="text-[#7A8A92]">
                            <span className="text-[#2F3A40]">Blood:</span> {profile.bloodGroup || "N/A"}
                          </div>
                          {profile.allergies && (
                            <div className="text-[#7A8A92]">
                              <span className="text-[#2F3A40]">Allergies:</span> {profile.allergies}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Add Profile Form */}
        {showForm ? (
          <Card className="p-8 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#DCE8EE] flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#6FB3B5]" />
              </div>
              <h3 className="text-2xl text-[#2F3A40]">
                {profiles.length === 0 ? "Add First Patient Profile" : "Add Another Family Member"}
              </h3>
            </div>

            <form onSubmit={handleAddProfile} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name" className="text-[#2F3A40] mb-2 block">
                    Patient Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92]" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter full name"
                      value={currentProfile.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="relationship" className="text-[#2F3A40] mb-2 block">
                    Relationship *
                  </Label>
                  <Select 
                    value={currentProfile.relationship} 
                    onValueChange={(value) => handleInputChange("relationship", value)}
                    required
                  >
                    <SelectTrigger className="h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Self">Self</SelectItem>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Son">Son</SelectItem>
                      <SelectItem value="Daughter">Daughter</SelectItem>
                      <SelectItem value="Brother">Brother</SelectItem>
                      <SelectItem value="Sister">Sister</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gender" className="text-[#2F3A40] mb-2 block">
                    Gender *
                  </Label>
                  <Select 
                    value={currentProfile.gender} 
                    onValueChange={(value) => handleInputChange("gender", value)}
                    required
                  >
                    <SelectTrigger className="h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dob" className="text-[#2F3A40] mb-2 block">
                    Date of Birth *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92] pointer-events-none" />
                    <Input
                      id="dob"
                      type="date"
                      value={currentProfile.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bloodGroup" className="text-[#2F3A40] mb-2 block">
                    Blood Group
                  </Label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92] pointer-events-none z-10" />
                    <Select 
                      value={currentProfile.bloodGroup} 
                      onValueChange={(value) => handleInputChange("bloodGroup", value)}
                    >
                      <SelectTrigger className="h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5] pl-10">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="allergies" className="text-[#2F3A40] mb-2 block">
                    Allergies
                  </Label>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8A92]" />
                    <Input
                      id="allergies"
                      type="text"
                      placeholder="e.g., Penicillin, Peanuts"
                      value={currentProfile.allergies}
                      onChange={(e) => handleInputChange("allergies", e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-[#6FB3B5] focus:ring-[#6FB3B5]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="medicalConditions" className="text-[#2F3A40] mb-2 block">
                  Medical Conditions
                </Label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 w-5 h-5 text-[#7A8A92]" />
                  <textarea
                    id="medicalConditions"
                    placeholder="List any existing medical conditions (optional)"
                    value={currentProfile.medicalConditions}
                    onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:border-[#6FB3B5] focus:ring-1 focus:ring-[#6FB3B5] min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 bg-[#6FB3B5] hover:bg-[#5fa3a5] text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Patient Profile
                </Button>
                {profiles.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="h-12 px-6 border-gray-300"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>
        ) : (
          <div className="text-center">
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="h-12 px-8 border-2 border-dashed border-[#6FB3B5] text-[#6FB3B5] hover:bg-[#DCE8EE]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Family Member
            </Button>
          </div>
        )}

        {/* Continue Button */}
        {profiles.length > 0 && !showForm && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleContinue}
              className="h-12 px-12 bg-[#6FB3B5] hover:bg-[#5fa3a5] text-white"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Continue to Dashboard
            </Button>
          </div>
        )}

        {/* Skip Option */}
        {profiles.length === 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleContinue}
              className="text-[#7A8A92] hover:text-[#6FB3B5] underline"
            >
              Skip for now, I'll add profiles later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
