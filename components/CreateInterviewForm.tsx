"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInterview } from "@/lib/action/general.action";
import { toast } from "sonner";
import { Briefcase, Activity, Layers, Hash, Combine } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer", "Web Developer", "Mobile App Developer", "Android Developer", "iOS Developer", "Game Developer", "DevOps Engineer", "Cloud Engineer", "Cloud Architect", "Site Reliability Engineer", "Data Scientist", "Data Analyst", "Data Engineer", "Machine Learning Engineer", "AI Engineer", "Deep Learning Engineer", "Computer Vision Engineer", "NLP Engineer", "Cybersecurity Analyst", "Security Engineer", "Ethical Hacker", "Penetration Tester", "Blockchain Developer", "Smart Contract Developer", "Embedded Systems Engineer", "Firmware Engineer", "Robotics Engineer", "AR VR Developer", "UI UX Designer", "Product Designer", "Systems Engineer", "Network Engineer", "Database Administrator", "Database Engineer", "QA Engineer", "Automation Test Engineer", "Technical Support Engineer", "IT Support Specialist", "Solutions Architect", "Software Architect", "Technical Project Manager", "Scrum Master", "Business Intelligence Developer", "Big Data Engineer", "Research Scientist", "Professor in Computer Science", "Computer Graphics Engineer"];
const LEVELS = ["Junior", "Mid", "Senior", "Lead"];
const TYPES = ["Behavioural", "Technical", "Mix"];

const ROLE_TECH_STACK_MAP: Record<string, string[]> = {
  "Frontend Developer": ["React", "Vue", "Angular", "HTML/CSS", "TypeScript", "Next.js", "Tailwind"],
  "Backend Developer": ["Node.js", "Python", "Java", "Go", "Ruby", "Spring Boot", "Express", "PostgreSQL", "MongoDB"],
  "Full Stack Developer": ["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL", "Next.js", "AWS"],
  "Software Engineer": ["Java", "C++", "Python", "Go", "Data Structures", "Algorithms", "System Design"],
  "Web Developer": ["HTML", "CSS", "JavaScript", "React", "PHP", "WordPress", "Node.js"],
  "Mobile App Developer": ["React Native", "Flutter", "Swift", "Kotlin", "Java", "Objective-C"],
  "Android Developer": ["Kotlin", "Java", "Android Studio", "Jetpack Compose", "Coroutines", "SQLite"],
  "iOS Developer": ["Swift", "Objective-C", "UIKit", "SwiftUI", "CoreData", "XCode"],
  "Game Developer": ["Unity", "C#", "Unreal Engine", "C++", "3D Math", "OpenGL", "DirectX"],
  "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins", "Ansible", "Linux", "CI/CD"],
  "Cloud Engineer": ["AWS", "Azure", "GCP", "Kubernetes", "Terraform", "Docker", "Linux"],
  "Cloud Architect": ["AWS Solutions Architect", "System Design", "Microservices", "Docker", "Kubernetes", "Serverless"],
  "Site Reliability Engineer": ["Linux", "Python", "Go", "Kubernetes", "Prometheus", "Grafana", "Terraform"],
  "Data Scientist": ["Python", "R", "SQL", "Pandas", "Scikit-Learn", "TensorFlow", "PyTorch"],
  "Data Analyst": ["SQL", "Excel", "Tableau", "Power BI", "Python", "R", "Pandas"],
  "Data Engineer": ["Python", "SQL", "Spark", "Hadoop", "Airflow", "AWS", "Kafka", "Snowflake"],
  "Machine Learning Engineer": ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "CUDA", "AWS", "MLOps"],
  "AI Engineer": ["Python", "PyTorch", "Transformers", "OpenAI API", "LangChain", "Vector DBs"],
  "Deep Learning Engineer": ["Python", "PyTorch", "TensorFlow", "Keras", "CUDA", "Neural Networks", "NLP", "CV"],
  "Computer Vision Engineer": ["Python", "OpenCV", "PyTorch", "TensorFlow", "C++", "YOLO", "CUDA"],
  "NLP Engineer": ["Python", "Transformers", "NLTK", "Spacy", "HuggingFace", "PyTorch", "LLMs"],
  "Cybersecurity Analyst": ["SIEM", "Splunk", "Wireshark", "Nmap", "Firewalls", "Incident Response", "Linux"],
  "Security Engineer": ["Python", "Bash", "Linux", "AWS Security", "Cryptography", "Penetration Testing"],
  "Ethical Hacker": ["Kali Linux", "Metasploit", "Burp Suite", "Nmap", "Wireshark", "Python", "Reverse Engineering"],
  "Penetration Tester": ["Burp Suite", "Metasploit", "Nessus", "OWASP", "Kali Linux", "Bash", "Python"],
  "Blockchain Developer": ["Solidity", "Web3.js", "Ethers.js", "Rust", "Go", "Ethereum", "Smart Contracts"],
  "Smart Contract Developer": ["Solidity", "Ethereum", "Hardhat", "Truffle", "Ethers.js", "DeFi", "Web3.js"],
  "Embedded Systems Engineer": ["C", "C++", "RTOS", "Microcontrollers", "ARM", "Linux", "IoT"],
  "Firmware Engineer": ["C", "C++", "Assembly", "RTOS", "Microcontrollers", "Hardware debugging"],
  "Robotics Engineer": ["ROS", "C++", "Python", "Simulink", "Computer Vision", "Control Systems", "Kinematics"],
  "AR VR Developer": ["Unity", "C#", "Unreal Engine", "C++", "Oculus SDK", "ARKit", "ARCore"],
  "UI UX Designer": ["Figma", "Adobe XD", "Sketch", "Prototyping", "Wireframing", "User Research"],
  "Product Designer": ["Figma", "Design Systems", "Prototyping", "User Research", "Wireframing", "UI/UX"],
  "Systems Engineer": ["Linux", "Windows Server", "Bash", "Python", "Networking", "Virtualization", "Active Directory"],
  "Network Engineer": ["Cisco", "Routing", "Switching", "BGP", "OSPF", "Firewalls", "Wireshark"],
  "Database Administrator": ["SQL", "Oracle", "MySQL", "PostgreSQL", "SQL Server", "MongoDB", "Performance Tuning"],
  "Database Engineer": ["SQL", "PostgreSQL", "MySQL", "NoSQL", "Database Design", "Data Modeling", "Python"],
  "QA Engineer": ["Selenium", "Cypress", "JUnit", "TestNG", "Postman", "Jira", "Python", "Java"],
  "Automation Test Engineer": ["Selenium", "Appium", "Cypress", "Playwright", "Java", "Python", "CI/CD"],
  "Technical Support Engineer": ["Linux", "Windows", "Networking", "SQL", "Ticketing Systems", "Troubleshooting"],
  "IT Support Specialist": ["Windows", "MacOS", "Active Directory", "Office 365", "Hardware Troubleshooting", "Networking"],
  "Solutions Architect": ["AWS", "System Design", "Microservices", "Java", "Python", "Cloud Architecture"],
  "Software Architect": ["System Design", "Microservices", "Java", "C#", "Design Patterns", "Cloud Computing"],
  "Technical Project Manager": ["Agile", "Scrum", "Jira", "Risk Management", "SDLC", "Communication"],
  "Scrum Master": ["Agile", "Scrum", "Kanban", "Jira", "Sprint Planning", "Facilitation"],
  "Business Intelligence Developer": ["SQL", "Power BI", "Tableau", "SSIS", "Data Warehousing", "Python"],
  "Big Data Engineer": ["Hadoop", "Spark", "Scala", "Python", "Kafka", "AWS", "Airflow"],
  "Research Scientist": ["Python", "Mathematics", "Statistics", "Machine Learning", "Deep Learning", "PyTorch"],
  "Professor in Computer Science": ["Algorithms", "Data Structures", "Teaching", "Research", "Computer Architecture", "Software Engineering"],
  "Computer Graphics Engineer": ["C++", "OpenGL", "Vulkan", "DirectX", "WebGL", "GLSL", "Linear Algebra"],
  "default": ["JavaScript", "Python", "Java", "C++", "SQL", "Git", "Docker", "AWS", "Agile"]
};

export default function CreateInterviewForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [type, setType] = useState("Mix");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [amount, setAmount] = useState(5);

  const suggestedTechs = ROLE_TECH_STACK_MAP[role] || ROLE_TECH_STACK_MAP["default"];

  const toggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter((t) => t !== tech));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value);
    setSelectedTechs([]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createInterview({
        role: role || "Software Engineer",
        type,
        level: level || "Mid",
        techstack: selectedTechs.join(", "),
        amount,
      });
      if (result.success) {
        toast.success("Interview created. Redirecting…");
        router.push(`/interview/${result.interviewId}`);
        return;
      }
      toast.error(result.error || "Something went wrong");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full relative z-10 h-full flex flex-col justify-between">
      <div className="space-y-6">
          {/* Role Row */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-light-100 uppercase tracking-widest pl-1">Target Role</label>
            <div className="relative group">
              <Briefcase className="absolute left-4 top-[18px] text-light-600 group-focus-within:text-primary-200 transition-colors pointer-events-none" size={16} />
              <Input
                value={role}
                onChange={handleRoleChange}
                placeholder="e.g. Full Stack Developer"
                list="roles-list"
                required
                className="pl-[42px] h-14 bg-dark-300/40 border-white/10 rounded-xl focus:border-primary-200/60 focus:ring-2 focus:ring-primary-200/20 focus:bg-dark-300/80 transition-all placeholder:text-light-600 font-medium text-base shadow-inner"
              />
              <datalist id="roles-list">
                {ROLES.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Tech Stack Row */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-light-100 uppercase tracking-widest pl-1">Target Tech Stack</label>
            <div className="flex flex-wrap gap-2 pt-1 pb-1">
               {suggestedTechs.map((tech) => (
                 <button
                   key={tech}
                   type="button"
                   onClick={() => toggleTech(tech)}
                   className={cn(
                     "px-4 py-2 rounded-xl text-sm font-semibold transition-all border outline-none",
                     selectedTechs.includes(tech) 
                       ? "bg-primary-200 border-primary-200 text-dark-100 shadow-[0_0_10px_rgba(0,225,240,0.5)] scale-[1.02]" 
                       : "bg-dark-300/40 border-white/10 text-light-400 hover:text-light-100 hover:border-white/20 hover:bg-dark-300"
                   )}
                 >
                   {tech}
                 </button>
               ))}
            </div>
            {selectedTechs.length === 0 && (
                <p className="text-[11px] text-light-600 pl-2 mt-1">Please select at least one technology to focus the interview.</p>
            )}
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-light-100 uppercase tracking-widest pl-1">Experience Level</label>
              <div className="relative group">
                <Activity className="absolute left-4 top-[18px] text-light-600 group-focus-within:text-primary-200 transition-colors pointer-events-none" size={16} />
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-14 rounded-xl pl-[42px] pr-4 border border-white/10 bg-dark-300/40 text-light-100 focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200/60 outline-none appearance-none transition-all cursor-pointer font-medium text-base shadow-inner"
                  required
                >
                  <option value="" disabled className="bg-dark-100">Select level</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l} className="bg-dark-100">{l}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-light-100 uppercase tracking-widest pl-1">Focus Type</label>
              <div className="relative group">
                <Combine className="absolute left-4 top-[18px] text-light-600 group-focus-within:text-primary-200 transition-colors pointer-events-none" size={16} />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-14 rounded-xl pl-[42px] pr-4 border border-white/10 bg-dark-300/40 text-light-100 focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200/60 outline-none appearance-none transition-all cursor-pointer font-medium text-base shadow-inner"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t} className="bg-dark-100">{t}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-light-100 uppercase tracking-widest pl-1">Question Count</label>
            <div className="relative group">
              <Hash className="absolute left-4 top-[18px] text-light-600 group-focus-within:text-primary-200 transition-colors pointer-events-none" size={16} />
              <Input
                type="number"
                min={3}
                max={15}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 5)}
                className="pl-[42px] h-14 bg-dark-300/40 border-white/10 rounded-xl focus:border-primary-200/60 focus:ring-2 focus:ring-primary-200/20 focus:bg-dark-300/80 transition-all text-base shadow-inner font-medium"
              />
            </div>
            <p className="text-[11px] text-light-600 pl-2">Recommendation: 5 questions provides a balanced 15-minute challenge.</p>
          </div>
      </div>

      <Button type="submit" className="w-full min-h-[56px] bg-primary-200 text-dark-100 hover:bg-white rounded-xl font-bold text-lg shadow-[var(--shadow-glow)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all mt-6" disabled={loading}>
        {loading ? (
            <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-dark-100 border-t-transparent rounded-full animate-spin"></div>
                Generating...
            </span>
        ) : "Generate Interview Content"}
      </Button>
    </form>
  );
}
