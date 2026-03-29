"use client"

import { useState } from "react"
import { useStudentData, Task } from "@/hooks/use-student-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Sparkles,
  Eraser
} from "lucide-react"
import { suggestTaskBreakdown } from "@/ai/flows/suggest-task-breakdown"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function TaskManager() {
  const { tasks, addTask, toggleTask, deleteTask, clearCompletedTasks, isLoaded } = useStudentData()
  const { toast } = useToast()
  const [newTitle, setNewTitle] = useState("")
  const [newPriority, setNewPriority] = useState<Task['priority']>("medium")
  const [isBreakingDown, setIsBreakingDown] = useState<string | null>(null)

  if (!isLoaded) return null

  const handleAddTask = () => {
    if (!newTitle.trim()) return
    addTask({
      title: newTitle,
      priority: newPriority,
      dueDate: new Date().toLocaleDateString()
    })
    setNewTitle("")
  }

  const handleAIDecomposition = async (task: Task) => {
    setIsBreakingDown(task.id)
    try {
      const result = await suggestTaskBreakdown({ taskDescription: task.title })
      toast({
        title: "AI Suggestion for " + task.title,
        description: "Steps: " + result.subTasks.join(", "),
      })
    } catch (e) {
      toast({ title: "Error", description: "Failed to get AI breakdown", variant: "destructive" })
    } finally {
      setIsBreakingDown(null)
    }
  }

  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Task Manager</h2>
        {completedCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearCompletedTasks}
            className="text-muted-foreground hover:text-destructive"
          >
            <Eraser className="h-4 w-4 mr-2" />
            Clear Completed ({completedCount})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input 
              placeholder="What needs to be done?" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <select 
              className="bg-background border rounded-md px-3 text-sm"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id} className={cn(task.completed && "opacity-60")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="flex flex-col">
                  <span className={cn(
                    "font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant={
                      task.priority === 'high' ? "destructive" : 
                      task.priority === 'medium' ? "secondary" : "outline"
                    }>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" /> {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleAIDecomposition(task)}
                  disabled={isBreakingDown === task.id}
                  className="text-primary"
                  title="AI Breakdown"
                >
                  <Sparkles className={cn("h-4 w-4", isBreakingDown === task.id && "animate-spin")} />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteTask(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            No tasks yet. Start by adding one above!
          </div>
        )}
      </div>
    </div>
  )
}