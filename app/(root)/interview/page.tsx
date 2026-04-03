import CreateInterviewForm from "@/components/CreateInterviewForm";
import { getCurrentUser } from "@/lib/action/auth.action";
import React from "react";
import type { Metadata } from "next";
import AgentWrapper from "@/components/AgentWrapper";
import { Bot, FileText, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Start Interview",
  description:
    "Create a customized AI mock interview using form builder or voice assistant.",
};

const page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Hero Header */}
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-200/30 bg-primary-200/10 w-fit mb-2 shadow-[0_0_15px_rgba(167,139,250,0.15)]">
          <Sparkles size={16} className="text-primary-200" />
          <span className="text-sm font-semibold text-primary-200 uppercase tracking-wider">AI Studio</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
          Generate an Interview
        </h1>
        <p className="text-light-400 text-base md:text-lg max-w-2xl leading-relaxed">
          Choose between structuring a complete text-based interview manually, or utilizing our Voice AI to instantly synthesize one through natural conversation.
        </p>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full w-full">
        
        {/* Left Bento: Form */}
        <div className="flex flex-col relative rounded-[32px] border border-white/10 dark-gradient shadow-[var(--shadow-soft)] overflow-hidden h-full group hover:border-white/15 transition-all">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          <div className="p-8 md:p-10 border-b border-white/10 relative overflow-hidden">
             <div className="absolute -top-6 -right-6 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
               <FileText size={160} />
             </div>
             <h2 className="text-3xl font-bold text-light-100 mb-3 flex items-center gap-3">
               Form Builder
             </h2>
             <p className="text-light-400 text-sm leading-relaxed max-w-xs relative z-10">
               Manually configure exactly what you want the AI to assess before taking the interview.
             </p>
          </div>
          <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
             <CreateInterviewForm />
          </div>
        </div>

        {/* Right Bento: Voice AI */}
        <div className="flex flex-col relative rounded-[32px] border border-white/10 blue-gradient-dark shadow-[var(--shadow-soft)] overflow-hidden h-full group hover:border-primary-200/30 transition-all">
          <div className="absolute pointer-events-none inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.2),transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('/pattern.png')] bg-cover opacity-10 pointer-events-none" />
          
          <div className="p-8 md:p-10 border-b border-primary-200/10 relative overflow-hidden z-10 lg:min-h-[220px]">
             <div className="absolute -top-6 -right-6 p-6 opacity-10 text-primary-200 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
               <Bot size={160} />
             </div>
             <div className="flex items-center gap-3 mb-3 relative z-10">
                 <h2 className="text-3xl font-bold text-light-100">
                    Voice Assistant
                 </h2>
                 <span className="text-[10px] bg-primary-200 text-dark-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(167,139,250,0.8)]">Beta</span>
             </div>
             
             <p className="text-light-400 text-sm leading-relaxed max-w-xs relative z-10">
               Simply start a vocal call and describe the role you want. The assistant will dynamically synthesize the interview in real-time.
             </p>
          </div>
          <div className="p-8 md:p-10 flex-1 flex flex-col items-center justify-center relative z-10">
            <AgentWrapper userName={user?.name!} userId={user?.id} type="generate" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default page;