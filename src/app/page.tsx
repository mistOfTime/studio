
"use client"

import { useStudentData } from "@/hooks/use-student-data"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  CheckSquare, 
  Timer, 
  Brain, 
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { tasks, timerStats, quizzes, isLoaded } = useStudentData()

  if (!isLoaded) return <div className="p-8 text-center">Loading your workspace...</div>

  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const averageQuizScore = quizzes.reduce((acc, q) => {
    if (q.scores.length === 0) return acc
    const latestScore = q.scores[q.scores.length - 1].score
    return acc + latestScore
  }, 0) / (quizzes.filter(q => q.scores.length > 0).length || 1)

  const recentTasks = tasks.filter(t => !t.completed).slice(0, 3)

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">Here's an overview of your academic progress.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks} / {totalTasks}</div>
            <Progress value={taskProgress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(timerStats.totalFocusMinutes / 60)}h {timerStats.totalFocusMinutes % 60}m</div>
            <p className="text-xs text-muted-foreground mt-1">
              {timerStats.sessionsCompleted} focus sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Quiz Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageQuizScore)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all completed quizzes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Good</div>
            <p className="text-xs text-muted-foreground mt-1">You're staying consistent!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Don't forget these pending assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        task.priority === 'high' ? "bg-destructive" : task.priority === 'medium' ? "bg-orange-500" : "bg-green-500"
                      )} />
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {task.dueDate}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No pending tasks. Great job!
                </div>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/tasks">View All Tasks <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Focus Mode</CardTitle>
            <CardDescription>Ready for a deep study session?</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-8">
            <div className="h-32 w-32 rounded-full border-4 border-primary flex items-center justify-center text-4xl font-bold mb-6">
              25:00
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/timer">Start Pomodoro</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
