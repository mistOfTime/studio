
"use client"

import { useState } from "react"
import { useStudentData, Quiz, Flashcard } from "@/hooks/use-student-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Play, 
  Brain, 
  Trophy,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function QuizPage() {
  const { quizzes, flashcards, isLoaded, addScore, deleteFlashcardSet } = useStudentData()
  
  // Quiz State
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [isQuizFinished, setIsQuizFinished] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  // Flashcard State
  const [activeFlashcardId, setActiveFlashcardId] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  if (!isLoaded) return null

  const activeQuiz = quizzes.find(q => q.id === activeQuizId)
  const activeFlashcardSet = flashcards.find(f => f.id === activeFlashcardId)

  // Quiz Logic
  const startQuiz = (id: string) => {
    setActiveQuizId(id)
    setCurrentQuestionIndex(0)
    setQuizScore(0)
    setIsQuizFinished(false)
    setSelectedAnswer(null)
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    if (answer === activeQuiz?.questions[currentQuestionIndex].correctAnswer) {
      setQuizScore(quizScore + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < (activeQuiz?.questions.length || 0)) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    } else {
      setIsQuizFinished(true)
      addScore(activeQuizId!, Math.round((quizScore / (activeQuiz?.questions.length || 1)) * 100))
    }
  }

  // Flashcard Logic
  const startFlashcards = (id: string) => {
    setActiveFlashcardId(id)
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  const nextCard = () => {
    if (currentCardIndex + 1 < (activeFlashcardSet?.cards.length || 0)) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  // Render Quiz View
  if (activeQuiz && !isQuizFinished) {
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
              <div className="text-sm font-medium">Score: {quizScore}</div>
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

  // Render Quiz Results
  if (isQuizFinished) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="mb-8 flex justify-center">
          <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-2">Well Done!</h2>
        <p className="text-xl text-muted-foreground mb-8">
          You scored {quizScore} out of {activeQuiz?.questions.length}
          <br />
          ({Math.round((quizScore / (activeQuiz?.questions.length || 1)) * 100)}%)
        </p>
        <Button size="lg" className="w-full" onClick={() => setActiveQuizId(null)}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  // Render Flashcard View
  if (activeFlashcardSet) {
    const card = activeFlashcardSet.cards[currentCardIndex]
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Button variant="ghost" className="mb-6" onClick={() => setActiveFlashcardId(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Flashcards
        </Button>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">{activeFlashcardSet.title}</h3>
            <Badge variant="outline">{currentCardIndex + 1} / {activeFlashcardSet.cards.length}</Badge>
          </div>

          <div 
            className="group perspective-1000 h-80 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={cn(
              "relative w-full h-full transition-all duration-500 preserve-3d",
              isFlipped && "rotate-y-180"
            )}>
              {/* Front */}
              <Card className="absolute inset-0 backface-hidden flex items-center justify-center p-12 text-center shadow-xl border-2">
                <p className="text-2xl font-medium">{card.front}</p>
                <div className="absolute bottom-4 text-xs text-muted-foreground flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" /> Click to flip
                </div>
              </Card>
              {/* Back */}
              <Card className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-12 text-center shadow-xl border-2 bg-primary/5">
                <p className="text-xl leading-relaxed">{card.back}</p>
              </Card>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={prevCard} 
              disabled={currentCardIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button 
              className="flex-1" 
              onClick={nextCard} 
              disabled={currentCardIndex === activeFlashcardSet.cards.length - 1}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
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
      </div>

      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="quizzes" className="px-8">Quizzes</TabsTrigger>
          <TabsTrigger value="flashcards" className="px-8">Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes">
          {quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map(quiz => (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline">{quiz.questions.length} Qs</Badge>
                    </div>
                    <CardTitle className="mt-4">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Best Score: {quiz.scores.length > 0 ? `${Math.max(...quiz.scores.map(s => s.score))}%` : 'No attempts yet'}
                    </div>
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
              <p className="text-muted-foreground mb-6">Generate a quiz from your notes to get started.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="flashcards">
          {flashcards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map(set => (
                <Card key={set.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      </div>
                      <Badge variant="outline">{set.cards.length} Cards</Badge>
                    </div>
                    <CardTitle className="mt-4">{set.title}</CardTitle>
                    <CardDescription>{set.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => startFlashcards(set.id)}>
                      <Play className="mr-2 h-4 w-4" /> Review Cards
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-10" />
              <h3 className="text-lg font-semibold">No Flashcards Found</h3>
              <p className="text-muted-foreground mb-6">Generate flashcards from your notes to study smarter.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
