
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
  X
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">Study Planner</h2>
          <p className="text-muted-foreground">Plan your weekly recurring study schedule.</p>
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
            <div key={idx} className="p-4 text-center font-bold border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="h-[700px] overflow-y-auto relative">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 h-24 border-b relative group">
              <div className="p-2 border-r text-[10px] font-bold text-muted-foreground text-right pr-4 bg-muted/5 flex items-start justify-end pt-1">
                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              {DAYS.map((_, dayIdx) => {
                const hourSessions = sessions.filter(s => 
                  s.dayOfWeek === dayIdx && 
                  parseInt(s.startTime.split(':')[0]) === hour
                )

                return (
                  <div key={dayIdx} className="border-r last:border-r-0 relative hover:bg-accent/30 transition-colors p-1 group/slot">
                    {hourSessions.map(session => (
                      <div 
                        key={session.id} 
                        className="group/session relative bg-primary text-primary-foreground p-2 rounded-md text-[10px] z-10 shadow-md overflow-hidden animate-in fade-in zoom-in duration-200"
                        style={{ height: '100%' }}
                      >
                        <div className="font-bold flex items-center gap-1 mb-1">
                          <BookOpen className="h-3 w-3 shrink-0" /> 
                          <span className="truncate">{session.subject}</span>
                        </div>
                        <div className="opacity-80 flex items-center justify-between">
                          <span>{session.duration}m</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                              toast({ title: "Deleted", description: "Session removed." });
                            }}
                            className="p-1 hover:bg-white/20 rounded opacity-0 group-hover/session:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {!hourSessions.length && (
                      <button 
                        onClick={() => {
                          setNewDay(dayIdx.toString());
                          setNewHour(hour.toString());
                          setIsDialogOpen(true);
                        }}
                        className="absolute inset-0 opacity-0 group-hover/slot:opacity-100 flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 text-primary/40" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>
      
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-primary" /> Planned Session
        </div>
        <div className="flex items-center gap-1">
          <Plus className="h-3 w-3" /> Click empty slot to schedule
        </div>
      </div>
    </div>
  )
}
