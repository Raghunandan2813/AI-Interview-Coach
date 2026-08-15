# 🎙️ Interview Coach — AI-Powered Mock Interview & Proctoring Platform

**Interview Coach** is a premium, cutting-edge web application designed to help candidates prepare for technical and behavioral interviews using real-time AI agents, live webcam proctoring, and comprehensive feedback report cards.

---

## ✨ Core Features

*   **Interactive Voice AI:** Real-time speech-to-speech mock interviews using **Vapi.ai**, **Deepgram**, and **ElevenLabs**.
*   **Proctoring & Emotion Analytics:** Client-side face-tracking powered by `@vladmandic/face-api` to monitor focus, confidence, and nervousness.
*   **Live Metrics:** Real-time answer scoring, filler word tracking (`um`, `uh`, `like`), and quality trend analysis.
*   **Escalating Quizzes:** 5-question technical quizzes on any topic, escalating in difficulty from Easy to Extreme, powered by **Groq Llama 3.3 70B**.
*   **PDF Feedback Reports:** Comprehensive candidate assessments across 5 metrics (Communication, Technical, etc.) with downloadable PDF exports via `jspdf`.
*   **Analytics Dashboard:** Visual tracking of user progress over time with global leaderboards.

---

## 🛠️ Tech Stack

*   **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion
*   **Database & Auth:** Firebase client/admin SDK, Firestore database
*   **AI Integration:** Vercel AI SDK (`ai`), `@ai-sdk/groq`, Vapi Web SDK
*   **Proctoring:** `@vladmandic/face-api` (TinyFaceDetector, FaceExpressionNet)
*   **Libraries:** `jspdf`, Zod, Recharts, Lucide Icons

---

## ⚙️ Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```ini
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
FIREBASE_CLIENT_EMAIL=your_admin_email
FIREBASE_PRIVATE_KEY="your_private_key"

# AI Config
GROQ_API_KEY=your_groq_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_public_key

# Shared secret for Vapi's server-to-server tool call. Set the same value as an
# "x-vapi-secret" header on the generate assistant's tool in the Vapi dashboard.
# Never put this in a NEXT_PUBLIC_ variable — it would ship to the browser.
VAPI_SERVER_SECRET=generate_a_long_random_value
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
