"use client"

import { useState, useEffect, useRef } from "react"
import { useStudentData } from "@/hooks/use-student-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Timer, Coffee, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type TimerMode = 'focus' | 'break'

export default function PomodoroTimer() {
  const { incrementTimerStats, isLoaded } = useStudentData()
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const FOCUS_TIME = 25 * 60
  const BREAK_TIME = 5 * 60

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleComplete()
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, timeLeft])

  const handleComplete = () => {
    setIsActive(false)
    if (mode === 'focus') {
      incrementTimerStats(25)
      setMode('break')
      setTimeLeft(BREAK_TIME)
    } else {
      setMode('focus')
      setTimeLeft(FOCUS_TIME)
    }
  }

  const toggleTimer = () => setIsActive(!isActive)

  const resetTimer = () => {
    setIsActive(false)
    setMode('focus')
    setTimeLeft(FOCUS_TIME)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = mode === 'focus' 
    ? ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100 
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100

  if (!isLoaded) return null

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="text-center overflow-hidden border-2">
        <CardHeader className={cn(
          "transition-colors",
          mode === 'focus' ? "bg-primary/5" : "bg-green-50"
        )}>
          <div className="flex justify-center mb-4">
            {mode === 'focus' ? (
              <div className="bg-primary text-primary-foreground p-3 rounded-xl">
                <Zap className="h-6 w-6" />
              </div>
            ) : (
              <div className="bg-green-500 text-white p-3 rounded-xl">
                <Coffee className="h-6 w-6" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {mode === 'focus' ? "Focus Session" : "Short Break"}
          </CardTitle>
          <CardDescription>
            {mode === 'focus' ? "Eliminate distractions and deep dive." : "Take a deep breath and stretch."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-12 pb-12">
          <div className="relative flex justify-center items-center mb-12">
             <div className="text-8xl font-black tracking-tighter tabular-nums text-foreground">
               {formatTime(timeLeft)}
             </div>
          </div>

          <div className="px-12 mb-12">
            <Progress value={progress} className="h-3" />
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-5 w-5 mr-2" /> Reset
            </Button>
            <Button size="lg" className="w-48 text-xl h-16 shadow-lg" onClick={toggleTimer}>
              {isActive ? (
                <>
                  <Pause className="h-6 w-6 mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 mr-2" /> Start
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
              <Timer className="h-4 w-4" /> Focus Duration
            </div>
            <div className="text-2xl font-bold">25 Minutes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
              <Coffee className="h-4 w-4" /> Break Duration
            </div>
            <div className="text-2xl font-bold">5 Minutes</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
