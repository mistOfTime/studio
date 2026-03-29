
"use client"

import { useState, useEffect } from 'react'

export interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  subTasks?: string[]
}

export interface StudySession {
  id: string
  subject: string
  startTime: string
  duration: number // minutes
  dayOfWeek: number // 0-6
}

export interface Note {
  id: string
  subject: string
  title: string
  content: string
  lastModified: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
}

export interface Quiz {
  id: string
  title: string
  subject: string
  questions: QuizQuestion[]
  scores: { date: string; score: number }[]
}

export interface Flashcard {
  id: string
  title: string
  subject: string
  cards: { front: string; back: string }[]
}

export interface TimerStats {
  totalFocusMinutes: number
  sessionsCompleted: number
}

const DEFAULT_DATA = {
  tasks: [] as Task[],
  sessions: [] as StudySession[],
  notes: [] as Note[],
  quizzes: [] as Quiz[],
  flashcards: [] as Flashcard[],
  timerStats: { totalFocusMinutes: 0, sessionsCompleted: 0 } as TimerStats
}

export function useStudentData() {
  const [data, setData] = useState(DEFAULT_DATA)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('student_os_data')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setData({
          ...DEFAULT_DATA,
          ...parsed
        })
      } catch (e) {
        console.error("Failed to parse student data", e)
      }
    }
    setIsLoaded(true)
  }, [])

  const saveData = (newData: typeof data) => {
    setData(newData)
    localStorage.setItem('student_os_data', JSON.stringify(newData))
  }

  // Tasks
  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9), completed: false }
    saveData({ ...data, tasks: [...data.tasks, newTask] })
  }

  const toggleTask = (id: string) => {
    const newTasks = data.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    saveData({ ...data, tasks: newTasks })
  }

  const deleteTask = (id: string) => {
    saveData({ ...data, tasks: data.tasks.filter(t => t.id !== id) })
  }

  // Sessions
  const addSession = (session: Omit<StudySession, 'id'>) => {
    const newSession = { ...session, id: Math.random().toString(36).substr(2, 9) }
    saveData({ ...data, sessions: [...data.sessions, newSession] })
  }

  // Notes
  const addNote = (note: Omit<Note, 'id' | 'lastModified'>) => {
    const newNote = { ...note, id: Math.random().toString(36).substr(2, 9), lastModified: new Date().toISOString() }
    saveData({ ...data, notes: [...data.notes, newNote] })
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    saveData({
      ...data,
      notes: data.notes.map(n => n.id === id ? { ...n, ...updates, lastModified: new Date().toISOString() } : n)
    })
  }

  const deleteNote = (id: string) => {
    saveData({ ...data, notes: data.notes.filter(n => n.id !== id) })
  }

  // Quizzes
  const addQuiz = (quiz: Omit<Quiz, 'id' | 'scores'>) => {
    const newQuiz = { ...quiz, id: Math.random().toString(36).substr(2, 9), scores: [] }
    saveData({ ...data, quizzes: [...data.quizzes, newQuiz] })
  }

  const addScore = (quizId: string, score: number) => {
    const newQuizzes = data.quizzes.map(q => {
      if (q.id === quizId) {
        return { ...q, scores: [...q.scores, { date: new Date().toISOString(), score }] }
      }
      return q
    })
    saveData({ ...data, quizzes: newQuizzes })
  }

  // Flashcards
  const addFlashcardSet = (flashcard: Omit<Flashcard, 'id'>) => {
    const newSet = { ...flashcard, id: Math.random().toString(36).substr(2, 9) }
    saveData({ ...data, flashcards: [...data.flashcards, newSet] })
  }

  const deleteFlashcardSet = (id: string) => {
    saveData({ ...data, flashcards: data.flashcards.filter(f => f.id !== id) })
  }

  // Timer
  const incrementTimerStats = (minutes: number) => {
    saveData({
      ...data,
      timerStats: {
        totalFocusMinutes: data.timerStats.totalFocusMinutes + minutes,
        sessionsCompleted: data.timerStats.sessionsCompleted + 1
      }
    })
  }

  return {
    ...data,
    isLoaded,
    addTask,
    toggleTask,
    deleteTask,
    addSession,
    addNote,
    updateNote,
    deleteNote,
    addQuiz,
    addScore,
    addFlashcardSet,
    deleteFlashcardSet,
    incrementTimerStats
  }
}
