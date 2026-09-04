import { Link } from "wouter";

import { motion } from "framer-motion";

import { Activity, ShieldCheck, Clock, Users, ArrowRight, UserCircle, Pill, Bot } from "lucide-react";

import { Button } from "@/components/ui/button";



export default function Home() {

  const modules = [
    { title: "Doctors Directory", desc: "Find and book specialized medical professionals.", icon: <Activity />, href: "/doctors", color: "bg-blue-500/10 text-blue-600" },
    { title: "Lab Results", desc: "View and track your diagnostic tests securely.", icon: <ShieldCheck />, href: "/lab", color: "bg-purple-500/10 text-purple-600" },
    { title: "E-Pharmacy", desc: "Manage prescriptions and order medications.", icon: <Pill />, href: "/pharmacy", color: "bg-emerald-500/10 text-emerald-600" },
    { title: "AI Assistant", desc: "Intelligent symptom checker and health advice.", icon: <Bot />, href: "/ai-chat", color: "bg-primary/10 text-primary" },
  ];



  return (

    <div className="pb-16">

      <section className="relative pt-20 pb-32 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 to-background z-0" />



        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            <motion.div

              initial={{ opacity: 0, x: -30 }}

              animate={{ opacity: 1, x: 0 }}

              transition={{ duration: 0.6, ease: "easeOut" }}

              className="max-w-2xl"

            >

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/20 shadow-sm mb-6 text-sm font-medium text-primary">

                <ShieldCheck className="w-4 h-4" />

                HIPAA Compliant & Secure

              </div>

              <h1 className="text-5xl lg:text-6xl font-display font-extrabold text-foreground leading-[1.1] mb-6 tracking-tight">

                Centralize your <br />

                <span className="text-gradient">medical records</span>, <br />

                intelligently.

              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">

                Experience the future of healthcare. A unified platform connecting you with doctors, lab results, pharmacy services, and AI-driven health insights in one secure place.

              </p>



              <div className="flex flex-wrap gap-4">
                <Button asChild className="btn-primary-gradient rounded-full px-8 py-6 text-lg">
                  <Link href="/profiles">Get Started <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-8 py-6 text-lg border-2 border-border hover:bg-secondary">
                  <Link href="/ai-chat">Try AI Assistant</Link>

                </Button>

              </div>

            </motion.div>



            <motion.div

              initial={{ opacity: 0, scale: 0.95 }}

              animate={{ opacity: 1, scale: 1 }}

              transition={{ duration: 0.8, delay: 0.2 }}

              className="relative lg:h-[600px] flex items-center justify-center"

            >

              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] transform rotate-3 scale-105" />

              <img

                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop"

                alt="Modern Medical Facility"

                className="relative z-10 rounded-[2.5rem] shadow-2xl shadow-primary/20 object-cover w-full h-full max-h-[500px]"

              />



              <motion.div

                initial={{ y: 20, opacity: 0 }}

                animate={{ y: 0, opacity: 1 }}

                transition={{ delay: 0.8, duration: 0.5 }}

                className="absolute -bottom-6 -left-6 bg-card p-5 rounded-2xl shadow-xl border border-border/50 z-20 flex items-center gap-4"

              >

                <div className="bg-green-500/10 p-3 rounded-full">

                  <Activity className="w-6 h-6 text-green-500" />

                </div>

                <div>

                  <p className="text-sm text-muted-foreground font-medium">Platform Status</p>

                  <p className="text-foreground font-bold font-display">All Systems Active</p>

                </div>

              </motion.div>

            </motion.div>

          </div>

        </div>

      </section>



      <section className="py-20 bg-card/50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">

            <h2 className="text-3xl font-display font-bold mb-4">Comprehensive Care Modules</h2>

            <p className="text-muted-foreground">Everything you need to manage your health journey effectively, accessible from a single, unified dashboard.</p>

          </div>



          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            {modules.map((mod, i) => (

              <motion.div

                key={mod.title}

                initial={{ opacity: 0, y: 20 }}

                whileInView={{ opacity: 1, y: 0 }}

                viewport={{ once: true }}

                transition={{ delay: i * 0.1, duration: 0.5 }}

              >

                <Link href={mod.href} className="block h-full">

                  <div className="medical-card h-full p-8 group">

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${mod.color} group-hover:scale-110 transition-transform duration-300`}>

                      {mod.icon}

                    </div>

                    <h3 className="text-xl font-bold font-display mb-3">{mod.title}</h3>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{mod.desc}</p>

                    <div className="flex items-center text-sm font-semibold text-primary group-hover:text-accent transition-colors">

                      Access Module <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />

                    </div>

                  </div>

                </Link>

              </motion.div>

            ))}

          </div>

        </div>

      </section>



      <section className="py-20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="bg-primary rounded-3xl p-12 text-primary-foreground shadow-2xl relative overflow-hidden">

            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />



            <div className="grid md:grid-cols-3 gap-8 relative z-10 text-center divide-y md:divide-y-0 md:divide-x divide-primary-foreground/20">

              <div className="py-4 md:py-0">

                <Clock className="w-8 h-8 mx-auto mb-4 opacity-80" />

                <div className="text-4xl font-display font-bold mb-2">24/7</div>

                <div className="text-primary-foreground/80 font-medium">Access to Records</div>

              </div>

              <div className="py-4 md:py-0">

                <ShieldCheck className="w-8 h-8 mx-auto mb-4 opacity-80" />

                <div className="text-4xl font-display font-bold mb-2">100%</div>

                <div className="text-primary-foreground/80 font-medium">Data Encryption</div>

              </div>

              <div className="py-4 md:py-0">

                <Users className="w-8 h-8 mx-auto mb-4 opacity-80" />

                <div className="text-4xl font-display font-bold mb-2">50k+</div>

                <div className="text-primary-foreground/80 font-medium">Active Patients</div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>

  );

}

