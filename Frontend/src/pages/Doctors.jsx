import { PageHeader } from "@/components/ui/PageHeader";
import { UserCircle, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Doctors() {
  const mockDoctors = [
    { id: 1, name: "Dr. Sarah Jenkins", spec: "Cardiologist", exp: "15 yrs", rating: 4.9, img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80" },
    { id: 2, name: "Dr. Michael Chen", spec: "Neurologist", exp: "12 yrs", rating: 4.8, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80" },
    { id: 3, name: "Dr. Emily Rodriguez", spec: "Pediatrician", exp: "8 yrs", rating: 4.9, img: "https://images.unsplash.com/photo-1594824436998-d748f3b2dd0a?w=400&q=80" },
    { id: 4, name: "Dr. James Wilson", spec: "General Practice", exp: "20 yrs", rating: 4.7, img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80" },
  ];

  return (
    <div>
      <PageHeader
        title="Doctors Directory"
        description="Find and book appointments with top-rated medical specialists in our network."
        icon={UserCircle}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockDoctors.map((doc) => (
            <div key={doc.id} className="medical-card overflow-hidden group flex flex-col">
              <div className="h-48 overflow-hidden relative bg-secondary">
                <img
                  src={doc.img}
                  alt={doc.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur text-sm font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {doc.rating}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-1">{doc.name}</h3>
                <p className="text-primary font-medium text-sm mb-4">{doc.spec}</p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <UserCircle className="w-4 h-4" /> {doc.exp} experience
                </div>

                <Button className="w-full mt-auto bg-secondary text-primary hover:bg-primary hover:text-white rounded-xl">
                  <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
