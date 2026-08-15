'use client';

import React, { useEffect } from 'react'
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { interviewer, IDLE_TIMEOUT_SECONDS } from '@/constants';
import {vapi} from '@/lib/vapi.sdk'
import { createFeedback } from '@/lib/action/general.action';
import { checkInterviewBudget, recordInterviewUsage } from '@/lib/action/usage.action';
import { toast } from 'sonner';
import InterviewerOrb, { type OrbState } from './InterviewerOrb';
import InterviewStage from './InterviewStage';
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED= 'FINISHED'
}


const mapRole = (role: string): SavedMessage['role'] => {
  switch(role) {
    case 'assistant': return 'assistance';
    case 'user': return 'users';
    case 'system': return 'system';
    default: return 'system'; // fallback
  }
}

interface SavedMessage {
  role : 'users' | 'system' | 'assistance';
  content : string
}

interface LiveAnswerFeedback {
  question: string;
  answer: string;
  qualityScore: number;
  fillerCount: number;
  fillerWords: string[];
  suggestion: string;
}

// Daily (which Vapi runs on) reports normal call teardown through the same
// error channel it uses for real failures. These are lifecycle notices, not
// problems, and must never reach the user as a red toast.
const BENIGN_CALL_ERROR = /meeting (has )?ended|call (has )?ended|ejected|left the meeting/i;

const FILLER_WORD_REGEX =
  /\b(um+|uh+|erm|ah+|like|you know|actually|basically|literally)\b/gi;

const getWordCount = (text: string) =>
  (text.match(/\b[\w'-]+\b/g) || []).length;

const extractKeywords = (text: string) =>
  (text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [])
    .filter((word) => !["what", "when", "where", "which", "would", "could", "should", "about", "there", "their", "these", "those"].includes(word))
    .slice(0, 8);

const buildLiveFeedback = (
  question: string,
  answer: string,
): LiveAnswerFeedback => {
  const answerText = answer.trim();
  const words = getWordCount(answerText);
  const fillers = answerText.match(FILLER_WORD_REGEX) || [];
  const fillerCount = fillers.length;
  const fillerRatio = words > 0 ? fillerCount / words : 1;
  const lowerAnswer = answerText.toLowerCase();
  const questionKeywords = extractKeywords(question);
  const keywordHitCount = questionKeywords.filter((k) =>
    lowerAnswer.includes(k),
  ).length;

  let score = 60;

  if (words >= 25 && words <= 90) score += 20;
  else if (words >= 15) score += 10;
  else score -= 20;

  if (keywordHitCount >= 3) score += 12;
  else if (keywordHitCount >= 1) score += 6;
  else score -= 8;

  if (/(for example|for instance|because|therefore|so that|tradeoff|trade-off)/i.test(lowerAnswer)) {
    score += 8;
  }

  score -= Math.min(30, Math.round(fillerCount * 4 + fillerRatio * 100 * 0.25));
  score = Math.max(0, Math.min(100, score));

  let suggestion = "Strong attempt. Tighten structure: answer -> reasoning -> short example.";
  if (fillerCount >= 3 || fillerRatio > 0.08) {
    suggestion =
      "Reduce filler words. Pause silently instead of using \"um/uh\", and keep sentences shorter.";
  } else if (words < 20) {
    suggestion =
      "Answer is too short. Add approach, one concrete example, and expected outcome.";
  } else if (keywordHitCount === 0) {
    suggestion =
      "Use terms from the question directly and explain tradeoffs to make your answer more relevant.";
  }

  return {
    question: question || "Interviewer question",
    answer: answerText,
    qualityScore: score,
    fillerCount,
    fillerWords: [...new Set(fillers.map((item) => item.toLowerCase()))],
    suggestion,
  };
};

const Agent = ({userName , userId, type, interviewId, questions} : AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [callStatus , setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
  const [messages , setMessages] = useState<SavedMessage[]>([]);
  const [liveFeedback, setLiveFeedback] = useState<LiveAnswerFeedback[]>([]);
  const hasSubmitted = React.useRef(false);
  const [camError, setCamError] = useState(false);

  // Reading expressions from someone's face is biometric processing, so it
  // never begins without an explicit opt-in. Declining runs the interview
  // audio-only and no face data is produced at all.
  const [cameraConsent, setCameraConsent] =
    useState<'pending' | 'granted' | 'declined'>('pending');
  const callStartedAt = React.useRef<number | null>(null);
  // Guards against stopping a call twice — the End button, the idle guard and
  // Vapi's own duration cap can all race, and a second stop() on an already
  // closed meeting is what raises "Meeting has ended".
  const stopRequested = React.useRef(false);
  // Last moment either party said anything, used to detect an abandoned call.
  const lastActivityAt = React.useRef<number>(Date.now());
  const [isStarting, setIsStarting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Single path for ending a call, so the End button, the idle guard and any
  // future caller can't stack stop() requests on a closed meeting.
  const stopCall = React.useCallback(() => {
    if (stopRequested.current) return;
    stopRequested.current = true;
    try {
      vapi.stop();
    } catch (e) {
      console.debug('vapi.stop() ignored', e);
    }
  }, []);

  const webcamRef = React.useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const analysisStats = React.useRef({
    totalFrames: 0,
    nervousCount: 0,
    confidentCount: 0,
    lookingAwayCount: 0,
  });

  useEffect(() => {
    if (type !== 'interview' || cameraConsent !== 'granted') return;

    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (e) {
        console.error("Failed to load face models", e);
      }
    };
    loadModels();
  }, [type, cameraConsent]);

  useEffect(()=>{
    const onCallStart = () => {
      callStartedAt.current = Date.now();
      lastActivityAt.current = Date.now();
      stopRequested.current = false;
      setCallStatus(CallStatus.ACTIVE);
    };
    const onCallEnd = () => {
      // The meeting is already closed; nothing should call stop() after this.
      stopRequested.current = true;
      setCallStatus(CallStatus.FINISHED);
      // Meter what the call actually consumed. The server clamps this to the
      // assistant's hard ceiling, so a forged value can't corrupt the total.
      if (callStartedAt.current !== null) {
        const seconds = (Date.now() - callStartedAt.current) / 1000;
        callStartedAt.current = null;
        void recordInterviewUsage(seconds);
      }
    };
    const onMessage = (message : Message) => {
      if(message.type === 'transcript' && message.transcriptType === 'final'){
        lastActivityAt.current = Date.now();
        const newMessage = {role: mapRole(message.role), content: message.transcript}
        setMessages((prev) => {
          const nextMessages = [...prev, newMessage];

          if (type === "interview" && newMessage.role === "users") {
            const lastQuestion = [...prev]
              .reverse()
              .find((item) => item.role === "assistance")?.content;

            if (lastQuestion) {
              const insight = buildLiveFeedback(lastQuestion, newMessage.content);
              setLiveFeedback((existing) => [...existing, insight]);
            }
          }

          return nextMessages;
        })
      }
    }
    const onSpeechStart = () => {
      lastActivityAt.current = Date.now();
      setIsSpeaking(true);
    };
    const onSpeechEnd = () => {
      lastActivityAt.current = Date.now();
      setIsSpeaking(false);
    };

    // Vapi surfaces microphone and connection failures here. Swallowing them
    // into console.log makes a dead mic look like a working call.
    const onError = (error: any) => {
      const message =
        error?.errorMsg ||
        error?.error?.message ||
        error?.message ||
        (typeof error === 'string' ? error : null);

      // A finished interview is a success. Reporting it as an error told users
      // their session had failed right as it completed.
      if (message && BENIGN_CALL_ERROR.test(message)) {
        console.debug('Vapi lifecycle:', message);
        return;
      }

      console.error('Vapi error', error);
      toast.error(
        message
          ? `Call error: ${message}`
          : 'Call error. Check that your browser has microphone access.',
      );
    };
    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    return ()=>{
    vapi.off('call-start', onCallStart);
    vapi.off('call-end', onCallEnd);
    vapi.off('message', onMessage);
    vapi.off('speech-start', onSpeechStart);
    vapi.off('speech-end', onSpeechEnd);
    vapi.off('error', onError);
    }
  }, [type])


  // End a call nobody is on. Vapi has no silence timeout we can set for a
  // transient assistant, so the browser watches for dead air instead. The call
  // is stopped the same way pressing "End call" does, so whatever was said
  // still gets scored rather than thrown away.
  useEffect(() => {
    if (callStatus !== CallStatus.ACTIVE) return;

    let stopped = false;
    const idleCheckId = setInterval(() => {
      if (stopped) return;
      if (Date.now() - lastActivityAt.current < IDLE_TIMEOUT_SECONDS * 1000) return;

      stopped = true;
      clearInterval(idleCheckId);
      toast.info(`Ended the call after ${IDLE_TIMEOUT_SECONDS} seconds of silence.`);
      setCallStatus(CallStatus.FINISHED);
      stopCall();
    }, 5000);

    return () => clearInterval(idleCheckId);
  }, [callStatus]);

  useEffect(() => {
    if (type !== 'interview' || cameraConsent !== 'granted') return;

    let intervalId: any;

    if (callStatus === CallStatus.ACTIVE && modelsLoaded) {
      intervalId = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video) {
          const video = webcamRef.current.video;
          if (video.readyState === 4) {
            const detections = await faceapi.detectSingleFace(
              video, 
              new faceapi.TinyFaceDetectorOptions()
            ).withFaceExpressions();
            
            analysisStats.current.totalFrames++;
            
            if (!detections) {
              analysisStats.current.lookingAwayCount++;
            } else {
              const expressions = detections.expressions;
              const maxEmotion = Object.keys(expressions).reduce((a, b) => 
                expressions[a as keyof faceapi.FaceExpressions] > expressions[b as keyof faceapi.FaceExpressions] ? a : b
              );
              
              if (['happy', 'neutral'].includes(maxEmotion)) {
                analysisStats.current.confidentCount++;
              } else if (['sad', 'angry', 'fearful', 'disgusted', 'surprised'].includes(maxEmotion)) {
                analysisStats.current.nervousCount++;
              }
            }
          }
        }
      }, 1500); 
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [callStatus, modelsLoaded, type, cameraConsent]);


 const handleGenerateFeedback = async (messages: SavedMessage[]) =>{
  console.log('Generate feedback here.');

  const stats = analysisStats.current;
  let behaviorAnalysis = null;
  
  if (stats.totalFrames > 0) {
    behaviorAnalysis = {
      confidentScore: Math.round((stats.confidentCount / stats.totalFrames) * 100),
      nervousScore: Math.round((stats.nervousCount / stats.totalFrames) * 100),
      cheatingFlags: stats.lookingAwayCount,
    };
  }

  const {success, feedbackId : id} = await createFeedback({
    interviewId: interviewId!,
    transcript: messages,
    behaviorAnalysis
  } as any)
  if(success && id){
    router.push(`/interview/${interviewId}/feedback`)
  }else{
    console.log('Error saving feedback');
    router.push('/home');
  }
 }
  useEffect(()=>{
     if(callStatus === CallStatus.FINISHED && !hasSubmitted.current){
      if(type === 'generate'){
        hasSubmitted.current = true;
        router.push('/home')
      }else{
        hasSubmitted.current = true;
        handleGenerateFeedback(messages);
      }
    }
   
  },[messages, callStatus, type , userId])
  
  const enterFullscreen = () => {
    // Must be called synchronously from the click — browsers reject a
    // fullscreen request that arrives after an await, since the user gesture
    // has expired by then.
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        /* denied or unsupported — the stage still renders, just not fullscreen */
      });
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleCall = async () => {
    if (isStarting) return;
    setIsStarting(true);
    // Fresh call: allow a stop again, in case the previous attempt never
    // reached call-start.
    stopRequested.current = false;

    // Claim fullscreen while we still hold the gesture, then verify budget.
    if (type === 'interview') enterFullscreen();

    try {
      // Gate on the user's remaining minutes before opening a billable call.
      const budget = await checkInterviewBudget();
      if (!budget.allowed) {
        toast.error(budget.reason ?? 'No practice minutes left this month.');
        exitFullscreen();
        return;
      }

      setCallStatus(CallStatus.CONNECTING);

      if (type === 'generate') {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
          variableValues: {
            userid: userId,
          },
        });
      } else {
        const formattedQuestions = questions
          ? questions.map((question) => `- ${question}`).join('\n')
          : '';

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (e) {
      console.error('Failed to start call', e);
      toast.error('Could not start the interview. Please try again.');
      setCallStatus(CallStatus.INACTIVE);
      exitFullscreen();
    } finally {
      setIsStarting(false);
    }
  };


const handleDisconnect = async ()=>{
  setCallStatus(CallStatus.FINISHED);
  stopCall();
}

  // Wall-clock timer for the stage header.
  useEffect(() => {
    if (callStatus !== CallStatus.ACTIVE) {
      setElapsedSeconds(0);
      return;
    }

    const tick = () =>
      setElapsedSeconds(
        callStartedAt.current
          ? Math.floor((Date.now() - callStartedAt.current) / 1000)
          : 0,
      );

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [callStatus]);

  // Hand the screen back the moment the interview is over — including when the
  // idle guard or Vapi's own duration cap ends it, not just the End button.
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE) {
      exitFullscreen();
    }
  }, [callStatus]);

  const latestMessage = messages[messages.length-1]?.content;
  const isCallInactiveOrFinished = callStatus=== CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
  // Make the camera decision before the interview can begin, so consent is a
  // deliberate choice rather than something skipped past.
  const awaitingCameraChoice = type === 'interview' && cameraConsent === 'pending';

  const orbState: OrbState =
    callStatus === CallStatus.CONNECTING
      ? 'connecting'
      : callStatus === CallStatus.ACTIVE
        ? (isSpeaking ? 'speaking' : 'listening')
        : 'idle';

  const elapsedLabel = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  const averageLiveScore =
    liveFeedback.length > 0
      ? Math.round(
          liveFeedback.reduce((sum, item) => sum + item.qualityScore, 0) /
            liveFeedback.length,
        )
      : null;

  const recentWindow = liveFeedback.slice(-3);
  const recentTrendDelta =
    recentWindow.length >= 2
      ? recentWindow[recentWindow.length - 1].qualityScore - recentWindow[0].qualityScore
      : 0;
  const trendLabel =
    recentWindow.length < 2
      ? "Not enough data"
      : recentTrendDelta >= 5
      ? "Improving"
      : recentTrendDelta <= -5
      ? "Dropping"
      : "Stable";

  // A live interview takes over the whole screen; everything else keeps the
  // normal in-page layout.
  const inStage =
    type === 'interview' &&
    (callStatus === CallStatus.CONNECTING || callStatus === CallStatus.ACTIVE);

  if (inStage) {
    return (
      <InterviewStage
        userName={userName}
        orbState={orbState}
        webcamRef={webcamRef}
        cameraOn={cameraConsent === 'granted'}
        camError={camError}
        modelsLoaded={modelsLoaded}
        onCamError={() => setCamError(true)}
        latestMessage={latestMessage}
        liveFeedback={liveFeedback}
        averageLiveScore={averageLiveScore}
        trendLabel={trendLabel}
        recentTrendDelta={recentTrendDelta}
        elapsedLabel={elapsedLabel}
        onDisconnect={handleDisconnect}
      />
    );
  }

  return (
    <>
      {/* live status bar — the call should feel like it's on the air */}
      {callStatus === CallStatus.ACTIVE && (
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-heat-200 opacity-75 animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-heat-200" />
          </span>
          <span className="eyebrow !text-heat-100">On the record</span>
        </div>
      )}

      <div className="call-view">
        <div className="card-interviewer">
          <InterviewerOrb state={orbState} size={210} />
          <h3>Interviewer</h3>
          <p
            className={cn(
              "eyebrow transition-colors",
              orbState === "speaking"
                ? "!text-heat-100"
                : orbState === "listening"
                  ? "!text-primary-200"
                  : "",
            )}
          >
            {orbState === "speaking"
              ? "Speaking"
              : orbState === "listening"
                ? "Listening"
                : orbState === "connecting"
                  ? "Connecting"
                  : "Ready"}
          </p>
        </div>
        <div className="card-border">
          <div className="card-content">
            {type === 'interview' ? (
              cameraConsent !== 'granted' ? (
                <div className="rounded-2xl size-[120px] ring-2 ring-white/10 bg-dark-100 flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[10px] font-semibold text-light-400">
                    {cameraConsent === 'declined' ? 'Camera off' : 'Camera not enabled'}
                  </span>
                  <span className="text-[8px] mt-1 text-light-600 leading-tight">Audio-only mode</span>
                </div>
              ) : camError ? (
                <div className="rounded-2xl size-[120px] ring-2 ring-red-500/50 bg-red-500/10 flex flex-col items-center justify-center p-2 text-center text-red-500">
                  <span className="text-[10px] font-semibold">Camera Blocked</span>
                  <span className="text-[8px] mt-1 opacity-70 leading-tight">Audio-only mode active</span>
                </div>
              ) : modelsLoaded ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  mirrored={true}
                  videoConstraints={{ facingMode: "user" }}
                  onUserMediaError={() => setCamError(true)}
                  className="rounded-2xl object-cover size-[120px] ring-2 ring-white/10"
                />
              ) : (
                <div className="rounded-2xl size-[120px] ring-2 ring-white/10 bg-dark-100 animate-pulse flex items-center justify-center">
                  <span className="text-white/40 text-[10px] text-center px-2">Loading Face AI...</span>
                </div>
              )
            ) : (
              <Image
                src="/people.png"
                alt="You"
                width={120}
                height={120}
                className="rounded-2xl object-cover size-[120px] ring-2 ring-white/10"
              />
            )}
            {type === 'interview' && <h3>{userName}</h3>}
          </div>
        </div>
      </div>

      {type === 'interview' && cameraConsent === 'pending' && isCallInactiveOrFinished && (
        <div className="mt-6 rounded-2xl border border-primary-200/30 bg-primary-200/5 p-4 md:p-5">
          <h4 className="text-sm md:text-base font-semibold text-light-100 mb-2">
            Turn on camera coaching?
          </h4>
          <p className="text-xs md:text-sm text-light-400 leading-relaxed mb-1">
            If you turn this on, your camera analyses your expressions and eye contact
            while you answer, so your report can cover how you came across as well as
            what you said.
          </p>
          <p className="text-xs md:text-sm text-light-400 leading-relaxed mb-4">
            Everything is processed in your browser. No video or images are uploaded or
            stored — only two summary numbers are saved with your report, and only you
            can see them. The interview works exactly the same without it.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setCameraConsent('granted')}
              className="px-4 py-2 rounded-lg bg-primary-200 text-dark-100 text-sm font-semibold hover:bg-white transition-colors"
            >
              Turn on camera
            </button>
            <button
              type="button"
              onClick={() => setCameraConsent('declined')}
              className="px-4 py-2 rounded-lg border border-white/10 text-light-100 text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Continue without it
            </button>
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="transcript-border mt-6">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500",
                "animate-fadeIn opacity-100"
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      {type === "interview" && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-dark-200/60 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="text-sm md:text-base font-semibold text-light-100">
              Live Answer Feedback
            </h4>
            {liveFeedback.length > 0 && (
              <span className="text-xs text-light-400">
                {liveFeedback.length} answer{liveFeedback.length > 1 ? "s" : ""} analyzed
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-white/10 bg-dark-300/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-light-500 mb-1">
                Live Improvement Meter
              </p>
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-sm font-extrabold uppercase tracking-wider",
                    averageLiveScore === null
                      ? "text-light-600"
                      : averageLiveScore >= 75
                      ? "text-tier-strong"
                      : averageLiveScore >= 55
                      ? "text-tier-mid"
                      : "text-tier-weak",
                  )}
                >
                  {averageLiveScore === null
                    ? "Waiting"
                    : averageLiveScore >= 75
                    ? "Strong"
                    : averageLiveScore >= 55
                    ? "Improving"
                    : "Needs work"}
                </p>
                <p className="stat-num text-sm text-light-100">
                  {averageLiveScore === null ? "—" : `${averageLiveScore}`}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-dark-300/40 p-3">
              <p className="text-[11px] uppercase tracking-wider text-light-500 mb-1">
                Quality Trend (last 3)
              </p>
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    trendLabel === "Improving"
                      ? "text-emerald-300"
                      : trendLabel === "Dropping"
                      ? "text-rose-300"
                      : "text-light-300",
                  )}
                >
                  {trendLabel}
                </p>
                <p className="text-xs text-light-300">
                  {recentWindow.length < 2 ? "-" : `${recentTrendDelta > 0 ? "+" : ""}${recentTrendDelta}`}
                </p>
              </div>
            </div>
          </div>

          {liveFeedback.length === 0 ? (
            <p className="text-sm text-light-500">
              Start answering questions to get strict, live scoring, filler-word checks, and better-answer suggestions.
            </p>
          ) : (
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {liveFeedback.map((item, index) => (
                <div key={`${index}-${item.qualityScore}`} className="rounded-xl border border-white/10 bg-dark-300/40 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs text-light-400">Q{index + 1}</p>
                    <p className="text-xs font-semibold text-primary-200">
                      Quality Score: {item.qualityScore}/100
                    </p>
                  </div>
                  <p className="text-xs text-light-300 line-clamp-2 mb-1">{item.question}</p>
                  <p className="text-xs text-light-500">
                    Fillers:{" "}
                    <span className="text-light-300 font-medium">
                      {item.fillerCount}
                    </span>
                    {item.fillerWords.length > 0 ? ` (${item.fillerWords.join(", ")})` : ""}
                  </p>
                  <p className="text-xs text-emerald-300 mt-2">
                    Better answer tip: {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="w-full flex justify-center mt-8">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCall}
            disabled={awaitingCameraChoice || isStarting}
            title={
              awaitingCameraChoice
                ? "Choose whether to turn on camera coaching first"
                : undefined
            }
          >
            <span
              className={cn(
                "absolute inset-0 animate-ping rounded-xl opacity-50",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative">
              {isCallInactiveOrFinished ? "Start call" : "Connecting…"}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End call
          </button>
        )}
      </div>
    </>
  )
}

export default Agent;

