import { Button } from '@/components/ui/button'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from "next";

import InterviewCard from '@/components/InterviewCard'
import LoadMoreInterviews from '@/components/LoadMoreInterviews'
import { getCurrentUser } from '@/lib/action/auth.action'
import { getInterviewsByUserId, getLatestInterviews } from '@/lib/action/general.action'

export const metadata: Metadata = {
  title: "Home",
  description:
    "Practice AI mock interviews, explore interviews created by others, and start improving today.",
};

 async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.query === 'string' ? searchParams.query.toLowerCase() : '';

  const user = await getCurrentUser();
  // Firestore has no substring matching, so search still filters in memory —
  // but only widen the fetch when someone is actually searching. An ordinary
  // page view shouldn't read 100 documents to render 20.
  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(),
    getLatestInterviews({ limit: query ? 100 : 20 })
  ])

  let filteredLatestInterviews = latestInterviews || [];
  if (query) {
    filteredLatestInterviews = filteredLatestInterviews.filter((interview) => {
      const matchRole = interview.role?.toLowerCase().includes(query);
      const matchTech = interview.techstack?.some(t => t.toLowerCase().includes(query));
      return matchRole || matchTech;
    });
  }
 
  const hasPastInterviews = (userInterviews?.length??0)>0;
  const hasUpcomingInterviews = filteredLatestInterviews.length > 0;
 
  return (
    <>
      <section className="card-cta">
        <div className="relative z-10 flex flex-col gap-5 max-w-xl">
          <p className="eyebrow">Training ground</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-light-100 max-sm:text-2xl">
            Practise until the <span className="heat-text">real one</span> feels easy.
          </h1>
          <p className="text-light-400 text-base leading-relaxed">
            Speak to a live AI interviewer, get scored on what you actually said,
            and watch the number climb.
          </p>
          <Button asChild className="btn-primary max-sm:w-full w-fit">
            <Link href="/interview">Start a session</Link>
          </Button>
        </div>
        <Image
          src="/robolap.jpg"
          alt=""
          width={320}
          height={320}
          className="relative z-10 max-sm:hidden object-contain rounded-2xl"
        />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Your sessions</p>
          <h2 className="text-xl font-extrabold tracking-tight text-light-100">Interviews you&apos;ve created</h2>
        </div>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p className="text-light-600 rounded-xl border border-white/10 bg-dark-200/50 px-6 py-8 text-center">
              You haven&apos;t taken any interviews yet.
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-5 mt-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">{query ? "Search" : "From the community"}</p>
          <h2 className="text-xl font-extrabold tracking-tight text-light-100">
            {query ? `Results for "${query}"` : "Built by other candidates"}
          </h2>
        </div>
        <LoadMoreInterviews interviews={filteredLatestInterviews || []} />
      </section>
    </>
  )
}

export default Home