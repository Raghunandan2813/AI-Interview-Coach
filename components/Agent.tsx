'use client';

import React, { useEffect } from 'react'
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { interviewer } from '@/constants';
import {vapi} from '@/lib/vapi.sdk'
import { createFeedback } from '@/lib/action/general.action';
import { getAuth } from 'firebase-admin/auth';
import { getCurrentUser } from '@/lib/action/auth.action';
import { NextResponse } from 'next/server';
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
  
  const webcamRef = React.useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const analysisStats = React.useRef({
    totalFrames: 0,
    nervousCount: 0,
    confidentCount: 0,
    lookingAwayCount: 0,
  });

  useEffect(() => {
    if (type !== 'interview') return;

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
  }, [type]);

  useEffect(()=>{
    const onCallStart = () =>setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    //router.push('/')
    const onMessage = (message : Message) => {
      if(message.type === 'transcript' && message.transcriptType === 'final'){
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
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => console.log('Error', error);
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
  }, [])


  useEffect(() => {
    if (type !== 'interview') return;

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
  }, [callStatus, modelsLoaded, type]);


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
    userId: userId!,
    transcript: messages,
    behaviorAnalysis
  } as any)
  if(success && id){
    router.push(`/interview/${interviewId}/feedback`)
  }else{
    console.log('Error saving feedback');
    router.push('/');
  }
 }
  useEffect(()=>{
     if(callStatus === CallStatus.FINISHED && !hasSubmitted.current){
      if(type === 'generate'){
        hasSubmitted.current = true;
        router.push('/')
      }else{
        hasSubmitted.current = true;
        handleGenerateFeedback(messages);
      }
    }
   
  },[messages, callStatus, type , userId])
  
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    if(type==='generate'){
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues : {
          userid: userId
        }
      })
  }else{
     let formattedQuestions ='';
     if(questions){
      formattedQuestions = questions.map((question) => `-${question}`).join('/n');
     }
     await vapi.start(interviewer, {
      variableValues:{
        questions: formattedQuestions
      }
     })
     console.log(userId)
      
    
    

   }
  


    }
    
const handleDisconnect = async ()=>{
  setCallStatus(CallStatus.FINISHED);

  vapi.stop();
}

  const latestMessage = messages[messages.length-1]?.content;
  const isCallInactiveOrFinished = callStatus=== CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
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

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/roboo.png"
              alt="AI"
              width={64}
              height={54}
              className="object-cover rounded-xl"
            />
            {isSpeaking && <span className="animate-speak" />} 
          </div> 
          <h3>AI Interview</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            {type === 'interview' ? (
              camError ? (
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
                    "text-sm font-semibold",
                    averageLiveScore === null
                      ? "text-light-400"
                      : averageLiveScore >= 75
                      ? "text-emerald-300"
                      : averageLiveScore >= 55
                      ? "text-amber-300"
                      : "text-rose-300",
                  )}
                >
                  {averageLiveScore === null
                    ? "Waiting for answers"
                    : averageLiveScore >= 75
                    ? "Green - Strong"
                    : averageLiveScore >= 55
                    ? "Yellow - Improve"
                    : "Red - Weak"}
                </p>
                <p className="text-xs text-light-300">
                  {averageLiveScore === null ? "-" : `${averageLiveScore}/100`}
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
          <button className="relative btn-call" onClick={handleCall}>
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

