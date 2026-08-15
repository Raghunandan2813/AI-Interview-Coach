"use client"
import React from 'react'
import dayjs from 'dayjs'
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcons from './DisplayTechIcons';
import { motion } from 'framer-motion';
import { ScoreMeter } from './ScoreMeter';

const interviewCard = ({id, userId, role , type, techstack, createdAt, coverImage, feedback}: InterviewCardProps & { feedback?: any }) => {

  const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
  const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY')
  const hasScore = typeof feedback?.totalScore === 'number';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="card-border w-full min-h-[330px] hover:border-primary-200/40 transition-colors"
    >
      <div className="card-interview">
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <Image
              // Prefer the cover stored on the interview. Without this the card
              // and the interview page pick different logos for the same
              // interview — the page reads coverImage, the card hashed the id.
              src={coverImage || getRandomInterviewCover(id || role)}
              alt=""
              width={56}
              height={56}
              className="rounded-xl object-cover size-14 ring-1 ring-white/10"
            />
            <span className="badge-text px-2.5 py-1 rounded-md bg-white/8 text-light-400 border border-white/10 shrink-0">
              {normalizedType}
            </span>
          </div>

          <h3 className="mt-4 capitalize text-lg font-extrabold tracking-tight text-light-100">
            {role}
          </h3>
          <p className="eyebrow mt-1">{formattedDate}</p>

          {/* The score is the point of the card, so it gets the loudest element */}
          {hasScore ? (
            <div className="mt-4">
              <ScoreMeter score={feedback.totalScore} label="Your score" />
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-heat-200 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-heat-100">
                Not attempted
              </span>
            </div>
          )}

          <p className="line-clamp-2 mt-4 text-sm text-light-400 leading-relaxed">
            {feedback?.finalAssessment ||
              "You haven't taken this one yet. Run it and find out where you stand."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-center gap-3">
          <DisplayTechIcons techStack={techstack} />
          <Button className="btn-primary shrink-0 !px-4 !text-xs" asChild>
            <Link href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}>
              {feedback ? "See report" : "Start"}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
 
export default interviewCard;
