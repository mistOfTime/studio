
"use client"

import { useState } from "react"
import { useStudentData, Quiz } from "@/hooks/use-student-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Play, 
  History, 
  Brain, 
  Trophy,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle
} from "lucide-react"

export default function QuizPage() {
  const { quizzes, isLoaded, addScore } = useStudentData()
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  if (!isLoaded) return null

  const activeQuiz = quizzes.find(q => q.id === activeQuizId)

  const startQuiz = (id: string) => {
    setActiveQuizId(id)
    setCurrentQuestionIndex(0)
    setScore(0)
    setIsFinished(false)
    setSelectedAnswer(null)
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    if (answer === activeQuiz?.questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < (activeQuiz?.questions.length || 0)) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    } else {
      setIsFinished(true)
      addScore(activeQuizId!, Math.round((score / (activeQuiz?.questions.length || 1)) * 100))
    }
  }

  if (activeQuiz && !isFinished) {
    const q = activeQuiz.questions[currentQuestionIndex]
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Button variant="ghost" className="mb-6" onClick={() => setActiveQuizId(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Quiz
        </Button>
        <Card className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <Badge variant="secondary">Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</Badge>
              <div className="text-sm font-medium">Score: {score}</div>
            </div>
            <CardTitle className="text-2xl">{q.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {q.options.map((option, idx) => (
                <Button
                  key={idx}
                  variant={selectedAnswer === option ? (option === q.correctAnswer ? "default" : "destructive") : "outline"}
                  className="justify-start h-auto py-4 px-6 text-left whitespace-normal"
                  onClick={() => !selectedAnswer && handleAnswer(option)}
                  disabled={!!selectedAnswer}
                >
                  <div className="flex items-center w-full">
                    <span className="flex-1">{option}</span>
                    {selectedAnswer && option === q.correctAnswer && <CheckCircle2 className="h-5 w-5 ml-2 text-green-500" />}
                    {selectedAnswer === option && option !== q.correctAnswer && <XCircle className="h-5 w-5 ml-2 text-white" />}
                  </div>
                </Button>
              ))}
            </div>
            {selectedAnswer && (
              <Button className="w-full mt-6" size="lg" onClick={nextQuestion}>
                {currentQuestionIndex + 1 === activeQuiz.questions.length ? "Finish Quiz" : "Next Question"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="mb-8 flex justify-center">
          <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-2">Well Done!</h2>
        <p className="text-xl text-muted-foreground mb-8">
          You scored {score} out of {activeQuiz?.questions.length}
          <br />
          ({Math.round((score / (activeQuiz?.questions.length || 1)) * 100)}%)
        </p>
        <Button size="lg" className="w-full" onClick={() => setActiveQuizId(null)}>
          Back to Quizzes
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Quiz & Flashcards</h2>
          <p className="text-muted-foreground">Test your knowledge and track your progress.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Quiz
        </Button>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline">{quiz.questions.length} Questions</Badge>
                </div>
                <CardTitle className="mt-4">{quiz.title}</CardTitle>
                <CardDescription>Last score: {quiz.scores.length > 0 ? `${quiz.scores[quiz.scores.length-1].score}%` : 'N/A'}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => startQuiz(quiz.id)}>
                  <Play className="mr-2 h-4 w-4" /> Start Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <Brain className="h-16 w-16 mx-auto mb-4 opacity-10" />
          <h3 className="text-lg font-semibold">No Quizzes Found</h3>
          <p className="text-muted-foreground mb-6">Create your first quiz manually or from your notes.</p>
          {/* Static example quiz for demo purposes if empty */}
          <Button variant="outline" onClick={() => {}}>
            Create Example Quiz
          </Button>
        </div>
      )}
    </div>
  )
}
