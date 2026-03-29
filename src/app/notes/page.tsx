
"use client"

import { useState } from "react"
import { useStudentData } from "@/hooks/use-student-data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles, 
  Search, 
  BrainCircuit,
  X
} from "lucide-react"
import { summarizeStudyNotes } from "@/ai/flows/summarize-study-notes"
import { generateStudyAidsFromText } from "@/ai/flows/generate-study-aids-from-text"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, addQuiz, addFlashcardSet, isLoaded } = useStudentData()
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
    const newNoteId = Math.random().toString(36).substr(2, 9)
    addNote({
      title: "Untitled Note",
      subject: "General",
      content: ""
    })
    // Note: Since addNote doesn't return the ID, we'll let the user click it in the sidebar
    // but in a real app you'd return the ID or handle navigation.
  }

  const handleDelete = () => {
    if (selectedNoteId) {
      deleteNote(selectedNoteId)
      setSelectedNoteId(null)
      toast({ title: "Note Deleted", description: "Your note has been permanently removed." })
    }
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
        <Card className="md:col-span-1 flex flex-col border-2">
          <CardHeader className="p-4 border-b">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Search notes..." 
                className="pl-9 pr-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg hover:bg-accent transition-all duration-200 flex flex-col gap-1 border border-transparent",
                  selectedNoteId === note.id && "bg-accent border-primary/20 shadow-sm"
                )}
              >
                <span className="font-semibold truncate text-sm">{note.title || "Untitled"}</span>
                <span className="text-xs text-muted-foreground">{note.subject}</span>
              </button>
            ))}
            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-xs italic">
                No notes found matching your search.
              </div>
            )}
          </div>
        </Card>

        <Card className="md:col-span-3 flex flex-col border-2 shadow-sm">
          {selectedNote ? (
            <>
              <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 gap-4">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Input 
                    className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0 truncate" 
                    value={selectedNote.title}
                    placeholder="Enter note title..."
                    onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                  />
                  <Input 
                    className="text-xs h-auto border-none p-0 focus-visible:ring-0 text-muted-foreground font-medium" 
                    value={selectedNote.subject}
                    placeholder="Subject (e.g. History)"
                    onChange={(e) => updateNote(selectedNote.id, { subject: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSummarize}
                    disabled={isSummarizing || !selectedNote.content}
                    className="hidden sm:flex"
                  >
                    <Sparkles className={cn("h-4 w-4 mr-2 text-primary", isSummarizing && "animate-spin")} />
                    Summarize
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleGenerateStudyAids}
                    disabled={isGeneratingAids || !selectedNote.content}
                    className="hidden lg:flex"
                  >
                    <BrainCircuit className={cn("h-4 w-4 mr-2 text-primary", isGeneratingAids && "animate-spin")} />
                    Gen Aids
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your note
                          and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete Note
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden relative">
                <Textarea 
                  className="h-full w-full border-none focus-visible:ring-0 resize-none p-8 text-base leading-relaxed"
                  placeholder="Start capturing your thoughts..."
                  value={selectedNote.content}
                  onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                />
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 bg-muted/10">
              <FileText className="h-20 w-20 mb-6 opacity-10" />
              <h3 className="text-lg font-medium mb-1">Your Workspace is Empty</h3>
              <p className="text-sm max-w-[250px] text-center mb-6">Select an existing note or create a new one to start studying.</p>
              <Button onClick={handleCreateNote} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Create My First Note
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
