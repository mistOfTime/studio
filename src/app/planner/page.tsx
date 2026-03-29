
"use client"

import { useState } from "react"
import { useStudentData, StudySession } from "@/hooks/use-student-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  BookOpen, 
  Trash2, 
  Calendar as CalendarIcon,
  X,
  Info
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSubject, setNewSubject] = useState("")
  const [newDay, setNewDay] = useState("1") // Monday default
  const [newHour, setNewHour] = useState("9") // 9 AM default
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
    setIsDialogOpen(false)
    toast({ title: "Session Scheduled", description: `${newSubject} added to your calendar.` })
  }

  const openAddDialog = (day: number, hour: number) => {
    setNewDay(day.toString());
    setNewHour(hour.toString());
    setIsDialogOpen(true);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">Study Planner</h2>
          <p className="text-muted-foreground">Build your weekly recurring study rhythm.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule Study Session</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="e.g. Calculus II" 
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Day</Label>
                    <Select value={newDay} onValueChange={setNewDay}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Start Hour</Label>
                    <Select value={newHour} onValueChange={setNewHour}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((hour) => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Duration (Minutes)</Label>
                  <Select value={newDuration} onValueChange={setNewDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="60">1 Hour</SelectItem>
                      <SelectItem value="90">1.5 Hours</SelectItem>
                      <SelectItem value="120">2 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSession}>Save Session</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="overflow-hidden border-2 shadow-sm">
        <div className="grid grid-cols-8 border-b bg-muted/30">
          <div className="p-4 border-r flex items-center justify-center">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
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
              {/* Hour Label */}
              <div className="p-2 border-r text-[10px] font-bold text-muted-foreground text-right pr-4 bg-muted/5 flex items-start justify-end pt-1 sticky left-0 z-20">
                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              
              {/* Day Columns */}
              {DAYS.map((_, dayIdx) => {
                const hourSessions = sessions.filter(s => 
                  s.dayOfWeek === dayIdx && 
                  parseInt(s.startTime.split(':')[0]) === hour
                )

                return (
                  <div 
                    key={dayIdx} 
                    className="border-r last:border-r-0 relative group/slot p-1 bg-transparent"
                  >
                    {/* Clickable Background Slot */}
                    <button 
                      onClick={() => openAddDialog(dayIdx, hour)}
                      className="absolute inset-0 z-0 opacity-0 group-hover/slot:opacity-100 hover:bg-accent/50 transition-all flex items-center justify-center cursor-pointer"
                      aria-label={`Schedule session for ${DAYS[dayIdx]} at ${hour > 12 ? `${hour - 12} PM` : `${hour} AM`}`}
                    >
                      <Plus className="h-5 w-5 text-primary/30" />
                    </button>

                    {/* Session Cards - Foreground Layer */}
                    <div className="relative z-10 flex flex-col gap-1 h-full pointer-events-none">
                      {hourSessions.map(session => (
                        <div 
                          key={session.id} 
                          className="group/session relative bg-primary text-primary-foreground p-2 rounded-md text-[10px] shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200 pointer-events-auto flex-1 flex flex-col justify-between border border-primary-foreground/10"
                        >
                          <div className="font-bold flex items-center gap-1 mb-1 min-w-0">
                            <BookOpen className="h-3 w-3 shrink-0" /> 
                            <span className="truncate">{session.subject}</span>
                          </div>
                          <div className="opacity-90 flex items-center justify-between mt-auto">
                            <span>{session.duration}m</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                                toast({ title: "Deleted", description: "Session removed." });
                              }}
                              className="p-1 hover:bg-white/20 rounded transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
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
      
      <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground bg-muted/30 p-4 rounded-xl border border-dashed">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-primary shadow-sm" /> 
          <span className="font-medium">Planned Session</span>
        </div>
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> 
          <span>Click any empty slot to schedule</span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span>Sessions recur weekly automatically</span>
        </div>
      </div>
    </div>
  )
}
