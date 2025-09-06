"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Brain, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Document {
  id: string
  title: string
  content: string
  created_at: string
}

interface QuestionGeneratorProps {
  documents: Document[]
  onQuestionsGenerated?: () => void
}

export function QuestionGenerator({ documents, onQuestionsGenerated }: QuestionGeneratorProps) {
  const [selectedDocument, setSelectedDocument] = useState<string>("")
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [questionTypes, setQuestionTypes] = useState<string[]>(["multiple-choice"])
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setQuestionTypes([...questionTypes, type])
    } else {
      setQuestionTypes(questionTypes.filter((t) => t !== type))
    }
  }

  const handleGenerate = async () => {
    if (!selectedDocument) {
      toast({
        title: "Error",
        description: "Please select a document first",
        variant: "destructive",
      })
      return
    }

    if (questionTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question type",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocument,
          questionCount,
          questionTypes,
          difficulty,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate questions")
      }

      const result = await response.json()

      toast({
        title: "Success!",
        description: `Generated ${result.count} questions successfully`,
      })

      onQuestionsGenerated?.()
    } catch (error) {
      console.error("Error generating questions:", error)
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Question Generator
        </CardTitle>
        <CardDescription>Generate exam questions from your uploaded documents using AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="document-select">Select Document</Label>
          <Select value={selectedDocument} onValueChange={setSelectedDocument}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a document..." />
            </SelectTrigger>
            <SelectContent>
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
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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

        <Button onClick={handleGenerate} disabled={isGenerating || !selectedDocument} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate Questions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
