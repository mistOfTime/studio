"use client"

import { useState } from "react"
import { useStudentData, StudySession } from "@/hooks/use-student-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  BookOpen, 
  Clock,
  X,
  CalendarDays,
  Timer
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8 AM to 10 PM

export default function PlannerPage() {
  const { sessions, addSession, deleteSession, isLoaded } = useStudentData()
  const { toast } = useToast()
  
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false)
  const [viewingSession, setViewingSession] = useState<StudySession | null>(null)
  
  // Recurring Session State
  const [newSubject, setNewSubject] = useState("")
  const [newDay, setNewDay] = useState("1") 
  const [newHour, setNewHour] = useState("9") 
  const [newDuration, setNewDuration] = useState("60")

  if (!isLoaded) return null

  const handleAddSession = () => {
    if (!newSubject.trim()) {
      toast({ title: "Error", description: "Please enter a subject name.", variant: "destructive" })
      return
    }

    addSession({
      subject: newSubject,
      dayOfWeek: parseInt(newDay),
      startTime: `${newHour.padStart(2, '0')}:00`,
      duration: parseInt(newDuration)
    })

    setNewSubject("")
    setIsSessionDialogOpen(false)
    toast({ title: "Session Scheduled", description: `${newSubject} added to your weekly rhythm.` })
  }

  const openAddSessionDialog = (day: number, hour: number) => {
    setNewDay(day.toString());
    setNewHour(hour.toString());
    setIsSessionDialogOpen(true);
  }

  const formatHour = (hourStr: string) => {
    const hour = parseInt(hourStr.split(':')[0]);
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">Weekly Study Rhythm</h2>
          <p className="text-muted-foreground">Map out your recurring study schedule for the week.</p>
        </div>
        <Button onClick={() => setIsSessionDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Schedule Session
        </Button>
      </div>

      <Card className="overflow-hidden border-2 shadow-sm">
        <div className="grid grid-cols-8 border-b bg-muted/30">
          <div className="p-4 border-r flex items-center justify-center">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          {DAYS.map((day, idx) => (
            <div key={idx} className="p-4 text-center font-bold border-r last:border-r-0 text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="h-[700px] overflow-y-auto relative bg-background">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 h-24 border-b relative">
              <div className="p-2 border-r text-[10px] font-bold text-muted-foreground text-right pr-4 bg-muted/5 flex items-start justify-end pt-1 sticky left-0 z-20">
                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              
              {DAYS.map((_, dayIdx) => {
                const hourSessions = sessions.filter(s => 
                  s.dayOfWeek === dayIdx && 
                  parseInt(s.startTime.split(':')[0]) === hour
                )

                return (
                  <div key={dayIdx} className="border-r last:border-r-0 relative group/slot p-1 bg-transparent">
                    <button 
                      onClick={() => openAddSessionDialog(dayIdx, hour)}
                      className="absolute inset-0 z-0 opacity-0 group-hover/slot:opacity-100 hover:bg-accent/50 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="h-5 w-5 text-primary/30" />
                    </button>

                    <div className="relative z-10 flex flex-col gap-1 h-full pointer-events-none">
                      {hourSessions.map(session => (
                        <div 
                          key={session.id} 
                          onClick={() => setViewingSession(session)}
                          className="group/session relative bg-primary text-primary-foreground p-2 rounded-md text-[10px] shadow-sm animate-in fade-in zoom-in duration-200 pointer-events-auto flex-1 flex flex-col justify-between border border-primary-foreground/10 cursor-pointer hover:brightness-110 transition-all"
                        >
                          <div className="font-bold flex items-center gap-1 mb-1 min-w-0">
                            <BookOpen className="h-3 w-3 shrink-0" /> 
                            <span className="truncate">{session.subject}</span>
                          </div>
                          <div className="opacity-90 flex items-center justify-between mt-auto">
                            <span>{session.duration}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Add Session Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Study Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="e.g. Calculus II" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Day</Label>
                <Select value={newDay} onValueChange={setNewDay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, idx) => (<SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Start Hour</Label>
                <Select value={newHour} onValueChange={setNewHour}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HOURS.map((hour) => (<SelectItem key={hour} value={hour.toString()}>{hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSession}>Save Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Session Details Dialog */}
      <Dialog open={!!viewingSession} onOpenChange={(open) => !open && setViewingSession(null)}>
        <DialogContent className="sm:max-w-[400px]">
          {viewingSession && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="ml-auto">Study Session</Badge>
                </div>
                <DialogTitle className="text-2xl">{viewingSession.subject}</DialogTitle>
                <DialogDescription>Session details and schedule.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Day</span>
                    <span className="font-medium">{DAYS[viewingSession.dayOfWeek]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Time</span>
                      <span className="font-medium">{formatHour(viewingSession.startTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                    <Timer className="h-5 w-5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Duration</span>
                      <span className="font-medium">{viewingSession.duration} Minutes</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="destructive" 
                  className="sm:mr-auto"
                  onClick={() => {
                    deleteSession(viewingSession.id);
                    setViewingSession(null);
                    toast({ title: "Session Deleted", description: "Successfully removed from schedule." });
                  }}
                >
                  Delete Session
                </Button>
                <Button variant="secondary" onClick={() => setViewingSession(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "outline", className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "default" ? "border-transparent bg-primary text-primary-foreground" : "text-foreground",
      className
    )}>
      {children}
    </span>
  )
}
