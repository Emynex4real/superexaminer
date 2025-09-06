"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Play, FileText } from "lucide-react"

interface Document {
  id: string
  title: string
}

interface QuizSetupProps {
  documents: Document[]
  onStartQuiz: (config: QuizConfig) => void
}

interface QuizConfig {
  documentId?: string
  questionCount: number
  difficulty?: string
  questionTypes: string[]
}

export function QuizSetup({ documents, onStartQuiz }: QuizSetupProps) {
  const [documentId, setDocumentId] = useState<string>("all")
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState<string>("any")
  const [questionTypes, setQuestionTypes] = useState<string[]>(["multiple-choice"])

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setQuestionTypes([...questionTypes, type])
    } else {
      setQuestionTypes(questionTypes.filter((t) => t !== type))
    }
  }

  const handleStart = () => {
    onStartQuiz({
      documentId: documentId === "all" ? undefined : documentId,
      questionCount,
      difficulty: difficulty === "any" ? undefined : difficulty,
      questionTypes,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Start Practice Quiz
        </CardTitle>
        <CardDescription>Configure your quiz settings and begin practicing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="document-select">Document (Optional)</Label>
          <Select value={documentId} onValueChange={setDocumentId}>
            <SelectTrigger>
              <SelectValue placeholder="All documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All documents</SelectItem>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {doc.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="question-count">Number of Questions</Label>
            <Input
              id="question-count"
              type="number"
              min="1"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number.parseInt(e.target.value) || 10)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty (Optional)</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Any difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any difficulty</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Question Types</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "multiple-choice", label: "Multiple Choice" },
              { id: "true-false", label: "True/False" },
              { id: "short-answer", label: "Short Answer" },
              { id: "essay", label: "Essay" },
            ].map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={questionTypes.includes(type.id)}
                  onCheckedChange={(checked) => handleQuestionTypeChange(type.id, checked as boolean)}
                />
                <Label htmlFor={type.id} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleStart} disabled={questionTypes.length === 0} className="w-full">
          <Play className="mr-2 h-4 w-4" />
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  )
}
