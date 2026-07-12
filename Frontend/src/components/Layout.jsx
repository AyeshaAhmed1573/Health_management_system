import { useState } from "react";
import {
  Bot, Stethoscope, Heart, Calculator, FileText,
  Activity, LayoutDashboard, Menu, X, Bell, Search,
  ChevronRight, LogOut, Settings, User
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: <LayoutDashboard size={18} />, group: "Main" },
  { id: "ai-chat", label: "AI Assistant", icon: <Bot size={18} />, badge: "New", group: "Main" },
  { id: "doctors", label: "Find Doctors", icon: <Activity size={18} />, group: "Main" },
  { id: "symptoms", label: "Symptoms Checker", icon: <Stethoscope size={18} />, group: "Tools" },
  { id: "firstaid", label: "First Aid Guide", icon: <Heart size={18} />, group: "Tools" },
  { id: "bmi", label: "BMI Calculator", icon: <Calculator size={18} />, group: "Tools" },
  { id: "report", label: "Medical Reports", icon: <FileText size={18} />, group: "Tools" },
];

export function Layout({ screen, onNavigate, children, rightPanel, rightPanelTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const groups = Array.from(new Set(NAV_ITEMS.map(n => n.group)));

  const activeItem = NAV_ITEMS.find(n => n.id === screen) || NAV_ITEMS[0];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "var(--font-sans)", background: "linear-gradient(180deg, #BFD8E6 0%, #FFFFFF 40%, #8FCED1 100%)" }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(31,45,47,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 lg:z-auto flex flex-col h-full transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: "260px", background: "white", borderRight: "1px solid var(--border)", flexShrink: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2F8F8F, #5FAFB6)" }}>
            <Heart size={18} color="white" fill="white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">HealthChat</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>AI Healthcare Hub</p>
          </div>
          <button className="ml-auto lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <X size={18} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" style={{ scrollbarWidth: "none" }}>
          {groups.map(group => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: "var(--muted-foreground)" }}>{group}</p>
              <div className="space-y-0.5">
                {NAV_ITEMS.filter(n => n.group === group).map(item => {
                  const active = screen === item.id || (item.id === "doctors" && screen === "doctor-chat");
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-secondary group"
                      style={{
                        background: active ? "var(--primary)" : "transparent",
                        color: active ? "white" : "var(--foreground)",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      <span style={{ color: active ? "white" : "var(--primary)", opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: active ? "rgba(255,255,255,0.3)" : "var(--primary)", color: "white" }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #2F8F8F, #5FAFB6)" }}>
              AJ
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Alex Johnson</p>
              <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>alex@healthcare.com</p>
            </div>
            <Settings size={15} style={{ color: "var(--muted-foreground)" }} />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3.5 border-b bg-white flex-shrink-0" style={{ borderColor: "var(--border)" }}>
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} style={{ color: "var(--foreground)" }} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Healthcare Hub</span>
            <ChevronRight size={12} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>{activeItem.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Search bar — visible on md+ */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "var(--border)", background: "var(--input-background)", minWidth: "200px" }}>
              <Search size={14} style={{ color: "var(--muted-foreground)" }} />
              <input placeholder="Search..." className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" style={{ color: "var(--foreground)" }} />
            </div>

            <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
              <Bell size={18} style={{ color: "var(--foreground)" }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
            </button>

            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ml-1" style={{ background: "linear-gradient(135deg, #2F8F8F, #5FAFB6)" }}>
              AJ
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main content */}
          <main className="flex-1 overflow-y-auto min-w-0" style={{ scrollbarWidth: "none" }}>
            {children}
          </main>

          {/* Right panel — only visible on xl+ when provided */}
          {rightPanel && (
            <aside
              className="hidden xl:flex flex-col border-l flex-shrink-0"
              style={{ width: "360px", borderColor: "var(--border)", background: "white" }}
            >
              {rightPanelTitle && (
                <div className="px-4 py-3.5 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-semibold text-foreground">{rightPanelTitle}</p>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                {rightPanel}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
