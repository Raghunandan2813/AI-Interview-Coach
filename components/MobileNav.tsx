"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutDashboard, Mic, Gamepad2, Menu, Trophy, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

// The 4 main links shown on the primary bar
const mainLinks = [
  { imgURL: Home, route: '/', label: 'Home' },
  { imgURL: LayoutDashboard, route: '/dashboard', label: 'Dashboard' },
  { imgURL: Mic, route: '/interview', label: 'Interview' },
  { imgURL: Gamepad2, route: '/quiz', label: 'Quiz' },
]

// The master directory for the "More" popout
const allLinks = [
  { imgURL: Home, route: '/', label: 'Home' },
  { imgURL: LayoutDashboard, route: '/dashboard', label: 'Dashboard' },
  { imgURL: Mic, route: '/interview', label: 'Interview' },
  { imgURL: Gamepad2, route: '/quiz', label: 'Quiz' },
  { imgURL: Trophy, route: '/leaderboard', label: 'Leaderboard' },
  { imgURL: FileText, route: '/feedback', label: 'Feedbacks' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Dimmed Overlay when More menu is open */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="sm:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Floating "More" Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="sm:hidden fixed bottom-[85px] left-4 right-4 z-[60] bg-dark-200/95 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-[60vh] flex flex-col"
          >
            <div className="flex flex-col gap-1 p-2 overflow-y-auto no-scrollbar pb-4">
              <div className="flex justify-between items-center px-3 mb-2 pb-2 border-b border-white/5 sticky top-0 bg-dark-200/90 backdrop-blur-md z-10">
                <span className="text-sm font-bold text-light-100 uppercase tracking-widest opacity-60">Master Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-1 rounded-full bg-white/5 text-light-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {allLinks.map((link) => {
                const isActive = pathname === link.route || (pathname.startsWith(link.route) && link.route !== '/');
                const Icon = link.imgURL;
                return (
                  <Link
                    href={link.route}
                    key={link.label}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-xl transition-all",
                      isActive ? "bg-primary-200/10" : "hover:bg-white/5"
                    )}
                  >
                     <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                         isActive ? "bg-primary-200 text-dark-100 shadow-[0_0_10px_rgba(167,139,250,0.5)]" : "bg-dark-300 text-light-400"
                     )}>
                        <Icon size={16} />
                     </div>
                     <span className={cn(
                        "text-sm font-bold transition-colors",
                        isActive ? "text-primary-200" : "text-light-100"
                     )}>
                       {link.label}
                     </span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bottom Navigation Bar */}
      <section className="sm:hidden fixed bottom-0 left-0 w-full z-50 bg-dark-200/90 backdrop-blur-lg border-t border-white/10 px-4 py-2 pb-safe">
        <div className="flex justify-between items-end max-w-md mx-auto">
          
          {/* Main 4 Links */}
          {mainLinks.map((link) => {
            const isActive = pathname === link.route || (pathname.startsWith(link.route) && link.route !== '/')
            const Icon = link.imgURL

            return (
              <Link
                href={link.route}
                key={link.label}
                className="flex flex-col items-center justify-center p-2 w-[18%] mb-1"
              >
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary-200/15 scale-110" : "bg-transparent scale-100"
                )}>
                  <Icon size={22} className={cn(
                    "transition-all duration-300",
                    isActive ? "text-primary-200 drop-shadow-[0_0_12px_rgba(167,139,250,1)]" : "text-light-600"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] mt-1 transition-colors leading-none",
                  isActive ? "text-primary-200 font-bold drop-shadow-[0_0_5px_rgba(167,139,250,0.5)]" : "font-medium text-light-600"
                )}>
                  {link.label}
                </span>
              </Link>
            )
          })}

          {/* Special "More" Button */}
          <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col items-center justify-center p-2 w-[18%] mb-1 focus:outline-none"
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isMenuOpen ? "bg-white/10 scale-110" : "bg-transparent scale-100"
              )}>
                <Menu size={22} className={cn(
                  "transition-all duration-300",
                  isMenuOpen ? "text-white" : "text-light-600"
                )} />
              </div>
              <span className={cn(
                "text-[10px] mt-1 transition-colors leading-none",
                isMenuOpen ? "text-white font-bold" : "font-medium text-light-600"
              )}>
                More
              </span>
            </button>

        </div>
      </section>
    </>
  )
}
