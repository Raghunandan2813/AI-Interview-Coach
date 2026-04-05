import React from 'react'
import QuizGame from '@/components/Quiz'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Tech Quiz Challenge",
  description: "Test your programming and technical knowledge with our interactive AI quiz game.",
}

export default function QuizPage() {
  return (
    <div className="w-full flex-1 flex flex-col pt-8 pb-10">
      <QuizGame />
    </div>
  )
}
