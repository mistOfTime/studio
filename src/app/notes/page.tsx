
"use client"

import { useState } from "react"
import { useStudentData, Note } from "@/hooks/use-student-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, FileText, Sparkles, Save, Search, BrainCircuit } from "lucide-react"
import { summarizeStudyNotes } from "@/ai/flows/summarize-study-notes"
import { generateStudyAidsFromText } from "@/ai/flows/generate-study-aids-from-text"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function NotesPage() {
  const { notes, addNote, updateNote, addQuiz, addFlashcardSet, isLoaded } = useStudentData()
  const { toast } = useToast()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isGeneratingAids, setIsGeneratingAids] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  if (!isLoaded) return null

  const selectedNote = notes.find(n => n.id === selectedNoteId)
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateNote = () => {
    addNote({
      title: "Untitled Note",
      subject: "General",
      content: ""
    })
  }

  const handleSummarize = async () => {
    if (!selectedNote || !selectedNote.content) return
    setIsSummarizing(true)
    try {
      const result = await summarizeStudyNotes({ notesContent: selectedNote.content })
      updateNote(selectedNote.id, {
        content: selectedNote.content + "\n\n--- AI SUMMARY ---\n" + result.summary
      })
      toast({ title: "Summary Generated", description: "The AI summary has been added to your note." })
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate summary.", variant: "destructive" })
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleGenerateStudyAids = async () => {
    if (!selectedNote || !selectedNote.content) return
    setIsGeneratingAids(true)
    try {
      const result = await generateStudyAidsFromText({ text: selectedNote.content })
      
      // Save Quiz
      addQuiz({
        title: `Quiz: ${selectedNote.title}`,
        subject: selectedNote.subject,
        questions: result.quizQuestions
      })

      // Save Flashcards
      addFlashcardSet({
        title: `Cards: ${selectedNote.title}`,
        subject: selectedNote.subject,
        cards: result.flashcards
      })

      toast({ 
        title: "Study Aids Generated!", 
        description: "A new quiz and flashcard set have been added to your collection." 
      })
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate study aids.", variant: "destructive" })
    } finally {
      setIsGeneratingAids(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">My Notes</h2>
        <Button onClick={handleCreateNote}>
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search notes..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex flex-col gap-1",
                  selectedNoteId === note.id && "bg-accent border"
                )}
              >
                <span className="font-semibold truncate">{note.title || "Untitled"}</span>
                <span className="text-xs text-muted-foreground">{note.subject}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="md:col-span-3 flex flex-col">
          {selectedNote ? (
            <>
              <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col gap-1 flex-1">
                  <Input 
                    className="text-xl font-bold border-none p-0 focus-visible:ring-0" 
                    value={selectedNote.title}
                    onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <Input 
                      className="text-sm h-6 border-none p-0 focus-visible:ring-0 text-muted-foreground w-32" 
                      value={selectedNote.subject}
                      onChange={(e) => updateNote(selectedNote.id, { subject: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSummarize}
                    disabled={isSummarizing || !selectedNote.content}
                  >
                    <Sparkles className={cn("h-4 w-4 mr-2", isSummarizing && "animate-spin")} />
                    Summarize
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleGenerateStudyAids}
                    disabled={isGeneratingAids || !selectedNote.content}
                  >
                    <BrainCircuit className={cn("h-4 w-4 mr-2", isGeneratingAids && "animate-spin")} />
                    Generate Aids
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <Textarea 
                  className="h-full w-full border-none focus-visible:ring-0 resize-none p-6 text-lg"
                  placeholder="Start writing..."
                  value={selectedNote.content}
                  onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                />
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p>Select a note to view or create a new one.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
