import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { HeartPulse, UserCircle, LogOut, Menu, Activity, Pill, Bot, Users, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/", icon: HeartPulse },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Doctors", href: "/doctors", icon: Activity },
    { label: "Laboratories", href: "/lab", icon: MessageSquare },
    { label: "Pharmacy", href: "/pharmacy", icon: Pill },
    { label: "AI Module", href: "/ai", icon: Bot },
    { label: "Chat Center", href: "/chat-center", icon: MessageSquare },
    { label: "Profiles", href: "/profiles", icon: Users },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-primary/10 p-2.5 rounded-xl group-hover:bg-primary/20 transition-colors">
                <HeartPulse className="h-6 w-6 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl leading-none tracking-tight">IntelliHealth</h1>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Platform</p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${isActive
                      ? "bg-secondary text-primary shadow-sm"
                      : "text-foreground/70 hover:text-primary hover:bg-secondary/50"
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary transition-colors">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                      <AvatarFallback className="bg-secondary text-primary font-bold">
                        {user.firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate("/signup")}
                className="btn-primary-gradient rounded-full px-6"
              >
                Log In
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col h-full mt-6">
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors
                          ${location === item.href ? "bg-secondary text-primary" : "text-foreground/70 hover:bg-secondary/50"}
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto mb-8 border-t pt-6">
                    {isAuthenticated && user && (
                      <div className="flex items-center gap-4 px-4 mb-6">
                        <Avatar className="h-12 w-12 border border-primary/20">
                          <AvatarFallback className="bg-secondary text-primary font-bold">
                            {user.firstName?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.firstName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full btn-primary-gradient rounded-xl py-6"
                      onClick={() => {
                        setIsOpen(false);
                        if (isAuthenticated) logout();
                        else navigate("/signup");
                      }}
                    >
                      {isAuthenticated ? "Log Out" : "Log In"}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
