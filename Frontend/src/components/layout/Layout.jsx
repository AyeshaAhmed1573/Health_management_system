import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <Navbar />
      <main className="flex-grow pt-20">{children}</main>

      <footer className="border-t border-border/50 bg-card py-12 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p className="font-display text-lg font-semibold text-foreground mb-2">Intelligent Healthcare Platform</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} All rights reserved. Secure, Private, Trusted.</p>
        </div>
      </footer>
    </div>
  );
}
