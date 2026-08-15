import type { LucideIcon } from 'lucide-react'
import {
  AudioLines,
  Target,
  FileText,
  Sparkles,
  LineChart,
  ListChecks,
  Code2,
  Layers,
  MonitorSmartphone,
  Server,
  BrainCircuit,
  ClipboardList,
  MessagesSquare,
  FileSearch,
} from 'lucide-react'

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
] as const

export type Feature = {
  icon: LucideIcon
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    icon: AudioLines,
    title: 'Realistic AI Voice Interviews',
    description:
      'Speak naturally with an AI interviewer that listens, follows up, and adapts to your answers in real time.',
  },
  {
    icon: Target,
    title: 'Role-Specific Questions',
    description:
      'Tailored question sets for your exact role and seniority, from new grad to staff-level positions.',
  },
  {
    icon: FileText,
    title: 'Resume-Based Preparation',
    description:
      'Upload your resume and get questions grounded in your real projects, skills, and experience.',
  },
  {
    icon: Sparkles,
    title: 'Instant Detailed Feedback',
    description:
      'Receive structured feedback on clarity, structure, and content the moment your interview ends.',
  },
  {
    icon: LineChart,
    title: 'Performance Analytics',
    description:
      'Track communication, confidence, and technical scores across every session to see real progress.',
  },
  {
    icon: ListChecks,
    title: 'Personalized Improvement Plans',
    description:
      'Get a focused action plan that targets your weakest areas before your interview that matters.',
  },
]

export type Step = {
  number: string
  title: string
  description: string
}

export const STEPS: Step[] = [
  {
    number: '01',
    title: 'Choose your role & level',
    description:
      'Pick a target role and experience level, or paste a job description for a custom interview.',
  },
  {
    number: '02',
    title: 'Complete a voice interview',
    description:
      'Talk through realistic questions with your AI coach in a calm, judgment-free environment.',
  },
  {
    number: '03',
    title: 'Get feedback & improve',
    description:
      'Review your scores, strengths, and next steps, then run it back to measurably improve.',
  },
]

export type Category = {
  icon: LucideIcon
  title: string
  count: string
}

export const CATEGORIES: Category[] = [
  { icon: Code2, title: 'Software Engineering', count: '120+ questions' },
  { icon: Layers, title: 'Full-Stack Development', count: '95+ questions' },
  { icon: MonitorSmartphone, title: 'Frontend Development', count: '80+ questions' },
  { icon: Server, title: 'Backend Development', count: '85+ questions' },
  { icon: BrainCircuit, title: 'Data Science & AI', count: '110+ questions' },
  { icon: ClipboardList, title: 'Product Management', count: '70+ questions' },
  { icon: MessagesSquare, title: 'Behavioral Interviews', count: '60+ questions' },
  { icon: FileSearch, title: 'Custom Job Description', count: 'Unlimited' },
]

export const PREP_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Stripe',
  'Airbnb',
] as const

export type Benefit = string

export const BENEFITS: Benefit[] = [
  'Practise anytime, without judgment',
  'Prepare for your exact role and level',
  'Identify weaknesses before the real interview',
  'Improve communication and confidence',
  'Track progress across multiple sessions',
]

export const BEFORE_AFTER = {
  before: {
    label: 'Before Interview Coach',
    items: [
      'Rambling, unstructured answers',
      'Interview anxiety and blank moments',
      'No idea what to improve',
      'Guessing what interviewers want',
    ],
  },
  after: {
    label: 'After Interview Coach',
    items: [
      'Clear, structured STAR responses',
      'Calm, rehearsed confidence',
      'A focused, data-driven plan',
      'Answers aligned to the role',
    ],
  },
}

export type Testimonial = {
  name: string
  role: string
  avatar: string
  quote: string
  rating: number
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Priya Sharma',
    role: 'New Grad · Software Engineer',
    avatar: '/avatars/priya.png',
    quote:
      'After a week of daily practice, my answers finally felt structured. I walked into my onsite calm instead of panicking.',
    rating: 5,
  },
  {
    name: 'Marcus Lee',
    role: 'Career Switcher · Frontend Developer',
    avatar: '/avatars/marcus.png',
    quote:
      'The resume-based questions were spot on. It caught the gaps in how I explained my projects before a real recruiter did.',
    rating: 5,
  },
  {
    name: 'Elena Rossi',
    role: 'Aspiring Product Manager',
    avatar: '/avatars/elena.png',
    quote:
      'The behavioral feedback was genuinely useful. My storytelling got clearer and my confidence went up every session.',
    rating: 5,
  },
]

export type Plan = {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
  badge?: string
}

export const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to try your first practice interviews.',
    features: [
      '3 AI voice interviews / month',
      'Basic instant feedback',
      'Behavioral question bank',
      'Single role selection',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For candidates actively preparing for interviews.',
    features: [
      'Unlimited AI voice interviews',
      'Detailed feedback & analytics',
      'Resume-based questions',
      'All roles & difficulty levels',
      'Performance trend tracking',
    ],
    cta: 'Start 7-Day Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Career Accelerator',
    price: '$39',
    period: 'per month',
    description: 'Maximum preparation with personalized coaching plans.',
    features: [
      'Everything in Pro',
      'Personalized improvement plans',
      'Custom job description interviews',
      'Downloadable feedback reports',
      'Priority AI response speed',
    ],
    cta: 'Get Accelerator',
    highlighted: false,
  },
]

export type Faq = {
  question: string
  answer: string
}

export const FAQS: Faq[] = [
  {
    question: 'How does the AI interview work?',
    answer:
      'You pick a role and start a live voice conversation with our AI interviewer. It asks realistic questions, listens to your spoken answers, and asks natural follow-ups — just like a real interviewer would.',
  },
  {
    question: 'Can I practise for a specific job?',
    answer:
      'Yes. Choose from role-specific tracks or paste a job description to generate a custom interview tailored to that exact position and its requirements.',
  },
  {
    question: 'Will I receive feedback after every interview?',
    answer:
      'Every session ends with structured feedback covering communication, technical knowledge, confidence, and problem-solving, plus concrete suggestions on what to improve next.',
  },
  {
    question: 'Is my interview data private?',
    answer:
      'Your recordings and transcripts are private to your account, encrypted in transit and at rest, and never sold. You can delete your data at any time.',
  },
  {
    question: 'Can I use Interview Coach for technical and behavioral interviews?',
    answer:
      'Absolutely. We cover technical tracks like software engineering and data science alongside behavioral and product interviews, so you can prepare for the full loop.',
  },
  {
    question: 'Do I need a credit card to start?',
    answer:
      'No. You can start practising on the Free plan without entering any payment details. Upgrade only when you are ready for unlimited sessions.',
  },
]

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Demo', href: '#demo' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Interview Guides', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Question Bank', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Partners', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
] as const

export const DASHBOARD = {
  overallScore: 82,
  metrics: [
    { label: 'Communication', value: 86 },
    { label: 'Technical Knowledge', value: 78 },
    { label: 'Confidence', value: 84 },
    { label: 'Problem Solving', value: 80 },
  ],
  trend: [
    { session: 'S1', score: 61 },
    { session: 'S2', score: 65 },
    { session: 'S3', score: 68 },
    { session: 'S4', score: 74 },
    { session: 'S5', score: 77 },
    { session: 'S6', score: 82 },
  ],
  sessions: [
    { role: 'Frontend Developer', date: 'Today', score: 82 },
    { role: 'Behavioral Round', date: 'Yesterday', score: 79 },
    { role: 'System Design', date: '2 days ago', score: 74 },
  ],
  strengths: [
    'Clear, structured STAR answers',
    'Strong technical vocabulary',
    'Good pacing and tone',
  ],
  improvements: [
    'Add more quantified impact',
    'Reduce filler words',
    'Deepen system trade-off analysis',
  ],
}
