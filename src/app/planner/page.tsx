
"use client"

import { useState } from "react"
import { useStudentData, StudySession } from "@/hooks/use-student-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight, BookOpen } from "lucide-react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8 AM to 10 PM

export default function PlannerPage() {
  const { sessions, addSession, isLoaded } = useStudentData()
  const [currentWeek, setCurrentWeek] = useState(new Date())

  if (!isLoaded) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Study Planner</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline">Today</Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button className="ml-4">
            <Plus className="mr-2 h-4 w-4" /> Schedule Session
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 border-r bg-muted/50"></div>
          {DAYS.map((day, idx) => (
            <div key={idx} className="p-4 text-center font-semibold border-r last:border-r-0 bg-muted/20">
              {day}
            </div>
          ))}
        </div>
        <div className="h-[600px] overflow-y-auto relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 h-20 border-b relative">
              <div className="p-2 border-r text-xs text-muted-foreground text-right pr-4 bg-muted/10">
                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              {DAYS.map((_, dayIdx) => (
                <div key={dayIdx} className="border-r last:border-r-0 relative hover:bg-accent/50 transition-colors">
                  {/* Render Sessions for this day and hour */}
                  {sessions.filter(s => s.dayOfWeek === dayIdx).map(session => {
                    const startH = parseInt(session.startTime.split(':')[0])
                    if (startH === hour) {
                      return (
                        <div 
                          key={session.id} 
                          className="absolute inset-x-1 top-1 bg-primary text-primary-foreground p-2 rounded text-xs z-10 shadow-sm overflow-hidden"
                          style={{ height: 'calc(100% - 8px)' }}
                        >
                          <div className="font-bold flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> {session.subject}
                          </div>
                          <div className="opacity-90">{session.duration}m session</div>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
      
      <div className="text-sm text-muted-foreground text-center">
        Weekly view is currently read-only. More controls coming soon.
      </div>
    </div>
  )
}
