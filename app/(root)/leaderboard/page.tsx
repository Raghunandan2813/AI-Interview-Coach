import React from 'react'
import { getLeaderboard } from '@/lib/action/score.action'
import { Trophy, Medal, Award, Flame, User } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Global Leaderboard",
  description: "Check the top performers in the AI Interview challenges and see where you rank globally.",
}

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const result = await getLeaderboard(50); // Get top 50 accumulated scorers
  const leaderboard = result.success ? result.data : [];

  return (
    <div className="w-full flex-1 flex flex-col items-center pt-8 pb-20 px-4 md:px-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Header section */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full"></div>
          <Trophy size={64} className="text-yellow-400 relative z-10 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">Global Leaderboard</h1>
        <p className="text-light-400 max-w-lg text-sm md:text-base">Rank up by completing real AI Interviews. Score is the average of every interview feedback score you've generated.</p>
      </div>

      {/* Podium Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-1 sm:gap-6 w-full mb-16 h-52 sm:h-64 mt-10">
          
          {/* Rank 2 */}
          <div className="flex flex-col items-center flex-1 max-w-[90px] sm:max-w-[120px] animate-in slide-in-from-bottom-8 duration-700 delay-100">
            <h3 className="font-bold text-light-100 truncate w-full text-center text-xs sm:text-sm md:text-base">{leaderboard[1].name}</h3>
            <span className="text-primary-200 font-black mb-1 sm:mb-3 text-xs sm:text-base">{leaderboard[1].averageScore} pts</span>
            <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-dark-300 to-slate-400/20 rounded-t-xl border-t-4 border-slate-300 relative flex justify-center shadow-[0_0_20px_rgba(203,213,225,0.1)]">
              <span className="text-2xl sm:text-4xl font-black text-slate-300 mt-2 opacity-80">2</span>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="flex flex-col items-center flex-1 max-w-[110px] sm:max-w-[140px] z-10 animate-in slide-in-from-bottom-12 duration-700">
            <div className="absolute -top-8 sm:-top-10 text-yellow-400 animate-bounce">
              <Medal size={30} className="sm:hidden drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
              <Medal size={40} className="hidden sm:block drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            </div>
            <h3 className="font-bold text-white truncate w-full text-center text-sm md:text-lg">{leaderboard[0].name}</h3>
            <span className="text-yellow-400 font-black mb-1 sm:mb-3 text-sm sm:text-lg">{leaderboard[0].averageScore} pts</span>
            <div className="w-full h-36 sm:h-44 bg-gradient-to-t from-dark-300 to-yellow-500/30 rounded-t-xl border-t-4 border-yellow-400 relative flex justify-center shadow-[0_0_30px_rgba(250,204,21,0.2)]">
              <span className="text-4xl sm:text-6xl font-black text-yellow-400 mt-2">1</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center flex-1 max-w-[90px] sm:max-w-[120px] animate-in slide-in-from-bottom-6 duration-700 delay-200">
            <h3 className="font-bold text-light-100 truncate w-full text-center text-xs sm:text-sm md:text-base">{leaderboard[2].name}</h3>
            <span className="text-amber-600 font-black mb-1 sm:mb-3 text-xs sm:text-base">{leaderboard[2].averageScore} pts</span>
            <div className="w-full h-16 sm:h-24 bg-gradient-to-t from-dark-300 to-amber-700/20 rounded-t-xl border-t-4 border-amber-600 relative flex justify-center shadow-[0_0_20px_rgba(217,119,6,0.1)]">
              <span className="text-xl sm:text-3xl font-black text-amber-600 mt-2 opacity-80">3</span>
            </div>
          </div>

        </div>
      )}

      {/* Leaderboard Table */}
      <div className="w-full bg-dark-200/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[var(--shadow-soft)]">
        
        {/* Table Header */}
        <div className="grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 bg-dark-300/50 border-b border-white/5 text-[10px] md:text-xs font-semibold text-light-600 uppercase tracking-wider">
          <div className="col-span-2 text-center overflow-hidden">Rank</div>
          <div className="col-span-4 md:col-span-3">Candidate</div>
          <div className="col-span-2 md:col-span-2 text-right">Avg Score</div>
          <div className="col-span-3 hidden md:flex md:col-span-5 justify-end pr-2 text-right">Achievements</div>
        </div>

        {/* List Content */}
        <div className="flex flex-col divide-y divide-white/5">
          {leaderboard.length === 0 ? (
             <div className="p-10 text-center text-light-400">No interview feedback recorded yet. Be the first to prep!</div>
          ) : (
            leaderboard.map((user, index) => (
              <div 
                key={user.id} 
                className={`grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-4 items-center px-4 md:px-6 py-5 transition-colors hover:bg-white/5 ${index < 3 ? 'bg-primary-200/5' : ''}`}
              >
                {/* Rank */}
                <div className="col-span-2 flex justify-center">
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                    index === 0 ? 'bg-yellow-400 text-dark-100 shadow-[0_0_10px_rgba(250,204,21,0.5)]' :
                    index === 1 ? 'bg-slate-300 text-dark-100' :
                    index === 2 ? 'bg-amber-600 text-dark-100' :
                    'bg-white/5 text-light-400'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* Name */}
                <div className="col-span-4 md:col-span-3 flex flex-col justify-center min-w-0">
                  <span className={`font-bold truncate text-sm md:text-base ${index < 3 ? 'text-white' : 'text-light-100'}`}>{user.name}</span>
                  <span className="text-[10px] md:text-xs text-light-600 mt-1 truncate">{user.interviewsCompleted} Interviews</span>
                </div>

                {/* Score */}
                <div className="col-span-2 md:col-span-2 flex justify-end items-center">
                  <span className={`font-black tracking-tight ${index === 0 ? 'text-yellow-400 text-base md:text-lg' : 'text-primary-200 text-sm md:text-base'}`}>
                    {user.averageScore}
                  </span>
                </div>

                {/* Badges */}
                <div className="col-span-3 hidden md:flex md:col-span-5 justify-end gap-1 flex-wrap items-center pl-2">
                  {user.badges && user.badges.slice(0,3).map((badge, bIndex) => (
                    <span key={bIndex} className="text-[10px] whitespace-nowrap bg-dark-300 border border-white/10 text-light-400 px-2 py-1 rounded-full flex items-center gap-1" title={badge}>
                      {badge}
                    </span>
                  ))}
                  {(!user.badges || user.badges.length === 0) && (
                    <span className="text-xs text-light-600">-</span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
