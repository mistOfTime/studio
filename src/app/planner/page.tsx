
"use client"

import { useState, useEffect } from "react"
import { useStudentData, StudySession } from "@/hooks/use-student-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  BookOpen, 
  Clock,
  CalendarDays,
  Timer,
  X,
  Check
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
import { Badge } from "@/components/ui/badge"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function PlannerPage() {
  const { 
    sessions, 
    addSession, 
    updateSession, 
    deleteSession, 
    plannerConfig, 
    isLoaded 
  } = useStudentData()
  const { toast } = useToast()
  
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false)
  const [viewingSession, setViewingSession] = useState<StudySession | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // New Session State
  const [newSubject, setNewSubject] = useState("")
  const [newDay, setNewDay] = useState("1") 
  const [newHour, setNewHour] = useState("9") 
  const [newDuration, setNewDuration] = useState("60")

  // Edit Session State
  const [editSubject, setEditSubject] = useState("")
  const [editDay, setEditDay] = useState("1")
  const [editHour, setEditHour] = useState("9")
  const [editDuration, setEditDuration] = useState("60")

  // Load edit state when a session is selected
  useEffect(() => {
    if (viewingSession) {
      setEditSubject(viewingSession.subject)
      setEditDay(viewingSession.dayOfWeek.toString())
      setEditHour(parseInt(viewingSession.startTime.split(':')[0]).toString())
      setEditDuration(viewingSession.duration.toString())
    }
  }, [viewingSession])

  if (!isLoaded) return null

  const HOURS = Array.from(
    { length: Math.max(1, plannerConfig.endHour - plannerConfig.startHour + 1) }, 
    (_, i) => i + plannerConfig.startHour
  )

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

  const handleUpdateSession = () => {
    if (!viewingSession) return
    if (!editSubject.trim()) {
      toast({ title: "Error", description: "Subject cannot be empty.", variant: "destructive" })
      return
    }

    updateSession(viewingSession.id, {
      subject: editSubject,
      dayOfWeek: parseInt(editDay),
      startTime: `${editHour.padStart(2, '0')}:00`,
      duration: parseInt(editDuration)
    })

    setIsEditing(false)
    setViewingSession(null)
    toast({ title: "Session Updated", description: "Changes have been saved." })
  }

  const openAddSessionDialog = (day: number, hour: number) => {
    setNewDay(day.toString());
    setNewHour(hour.toString());
    setIsSessionDialogOpen(true);
  }

  const formatHour = (hourInt: number) => {
    if (hourInt === 0) return "12 AM";
    if (hourInt === 12) return "12 PM";
    return hourInt > 12 ? `${hourInt - 12} PM` : `${hourInt} AM`;
  }

  const formatDurationDisplay = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = minutes / 60;
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }

  const getSessionTimeRange = (session: StudySession) => {
    const startHour = parseInt(session.startTime.split(':')[0]);
    const endHour = startHour + Math.ceil(session.duration / 60);
    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">Weekly Study Rhythm</h2>
          <p className="text-muted-foreground">Map out your recurring study schedule for the week.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsSessionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Schedule Session
          </Button>
        </div>
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
                {formatHour(hour)}
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
                          onClick={() => {
                            setViewingSession(session);
                            setIsEditing(false);
                          }}
                          className="group/session relative bg-primary text-primary-foreground p-2 rounded-md text-[10px] shadow-sm animate-in fade-in zoom-in duration-200 pointer-events-auto flex-1 flex flex-col justify-between border border-primary-foreground/10 cursor-pointer hover:brightness-110 transition-all"
                        >
                          <div className="font-bold flex items-center gap-1 mb-1 min-w-0">
                            <BookOpen className="h-3 w-3 shrink-0" /> 
                            <span className="truncate">{session.subject}</span>
                          </div>
                          <div className="opacity-90 flex flex-col gap-0.5 mt-auto font-medium">
                            <div className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              <span>{getSessionTimeRange(session)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Timer className="h-2.5 w-2.5" />
                              <span>{formatDurationDisplay(session.duration)}</span>
                            </div>
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
                    {ALL_HOURS.map((hour) => (<SelectItem key={hour} value={hour.toString()}>{formatHour(hour)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Duration</Label>
              <Select value={newDuration} onValueChange={setNewDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSession}>Save Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Session Details Dialog */}
      <Dialog open={!!viewingSession} onOpenChange={(open) => {
        if (!open) {
          setViewingSession(null);
          setIsEditing(false);
        }
      }}>
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
                {isEditing ? (
                  <div className="space-y-4 pt-2">
                    <div className="grid gap-2">
                      <Label>Subject</Label>
                      <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <>
                    <DialogTitle className="text-2xl">{viewingSession.subject}</DialogTitle>
                    <DialogDescription>Session details and schedule.</DialogDescription>
                  </>
                )}
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Day</Label>
                        <Select value={editDay} onValueChange={setEditDay}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day, idx) => (<SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Hour</Label>
                        <Select value={editHour} onValueChange={setEditHour}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ALL_HOURS.map((hour) => (<SelectItem key={hour} value={hour.toString()}>{formatHour(hour)}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Duration</Label>
                      <Select value={editDuration} onValueChange={setEditDuration}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="180">3 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Day</span>
                        <span className="font-medium">{DAYS[viewingSession.dayOfWeek]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Hours</span>
                        <span className="font-medium">{getSessionTimeRange(viewingSession)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                      <Timer className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Duration</span>
                        <span className="font-medium">{formatDurationDisplay(viewingSession.duration)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleUpdateSession}>
                      <Check className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="destructive" 
                      className="sm:mr-auto"
                      onClick={() => {
                        deleteSession(viewingSession.id);
                        setViewingSession(null);
                        toast({ title: "Session Deleted", description: "Successfully removed from schedule." });
                      }}
                    >
                      Delete
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                    <Button variant="secondary" onClick={() => setViewingSession(null)}>
                      Close
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
