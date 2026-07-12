import React from "react";
import { motion } from "framer-motion";

export function PageHeader({ title, description, icon }) {
  return (
    <div className="bg-card border-b border-border/50 pb-8 pt-12 mb-8 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-5"
        >
          <div className="bg-primary/10 p-4 rounded-2xl">
            {React.createElement(icon, { className: "w-8 h-8 text-primary", strokeWidth: 2 })}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground max-w-2xl">{description}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
