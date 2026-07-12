import { PageHeader } from "@/components/ui/PageHeader";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AIModule() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Intelligent Health Assistant"
        description="Ask questions about symptoms, medications, and general wellness."
        icon={Bot}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full flex-grow flex flex-col">
        <div className="medical-card flex-grow flex flex-col bg-card/80 p-0 overflow-hidden">
          <div className="flex-grow p-6 overflow-y-auto space-y-6">
            <div className="flex justify-center">
              <div className="bg-secondary text-xs text-muted-foreground px-3 py-1 rounded-full">
                Today, 10:24 AM
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-secondary/50 rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-sm">
                <p className="text-foreground">
                  Hello! I'm your Intelligent Health Assistant. I can help you understand your lab results, explain medication side effects, or check symptoms. How can I assist you today?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-card border border-border/50 px-2 py-1 rounded-md cursor-pointer hover:border-primary transition-colors">
                    Explain my Lipid Panel
                  </span>
                  <span className="text-xs bg-card border border-border/50 px-2 py-1 rounded-md cursor-pointer hover:border-primary transition-colors">
                    I have a headache
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center h-20 opacity-50">
              <Sparkles className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm text-muted-foreground">AI is ready for your questions</span>
            </div>
          </div>

          <div className="p-4 bg-card border-t border-border/50">
            <div className="relative flex items-center">
              <Input
                placeholder="Type your health question here..."
                className="pr-12 py-6 rounded-2xl border-border/60 focus-visible:ring-primary/20 bg-background"
              />
              <Button size="icon" className="absolute right-2 rounded-xl btn-primary-gradient w-10 h-10">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-3">
              Disclaimer AI is for informational purposes only and does not replace professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
