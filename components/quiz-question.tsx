"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { FeedbackForm } from "./feedback-form"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "true-false" | "short-answer" | "essay"
  options?: string[]
  topic: string
  difficulty: "easy" | "medium" | "hard"
}

interface QuizQuestionProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  onAnswer: (answer: string) => void
  isAnswered: boolean
  userAnswer?: string
  isCorrect?: boolean
  correctAnswer?: string
  showResult?: boolean
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isAnswered,
  userAnswer,
  isCorrect,
  correctAnswer,
  showResult = false,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(userAnswer || "")
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSubmit = () => {
    if (selectedAnswer.trim()) {
      onAnswer(selectedAnswer)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const renderQuestionInput = () => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                    showResult && option === correctAnswer
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                      : showResult && option === userAnswer && !isCorrect
                        ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {option}
                  {showResult && option === correctAnswer && (
                    <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                  )}
                  {showResult && option === userAnswer && !isCorrect && (
                    <XCircle className="inline ml-2 h-4 w-4 text-red-600" />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "true-false":
        return (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
            className="space-y-3"
          >
            {["True", "False"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option.toLowerCase()} />
                <Label
                  htmlFor={option.toLowerCase()}
                  className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                    showResult && option === correctAnswer
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                      : showResult && option === userAnswer && !isCorrect
                        ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {option}
                  {showResult && option === correctAnswer && (
                    <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                  )}
                  {showResult && option === userAnswer && !isCorrect && (
                    <XCircle className="inline ml-2 h-4 w-4 text-red-600" />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "short-answer":
      case "essay":
        return (
          <Textarea
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={isAnswered}
            placeholder="Type your answer here..."
            className={`min-h-[100px] ${
              showResult && isCorrect
                ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                : showResult && !isCorrect
                  ? "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                  : ""
            }`}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
              <Badge variant="secondary">{question.topic}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {showResult && (
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              )}
              {isAnswered && (
                <Button variant="outline" size="sm" onClick={() => setShowFeedback(!showFeedback)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Feedback
                </Button>
              )}
            </div>
          </div>
          <CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestionInput()}

          {showResult && correctAnswer && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Correct Answer: {correctAnswer}</p>
            </div>
          )}

          {!isAnswered && (
            <Button onClick={handleSubmit} disabled={!selectedAnswer.trim()} className="w-full">
              Submit Answer
            </Button>
          )}
        </CardContent>
      </Card>

      {showFeedback && isAnswered && (
        <FeedbackForm
          questionId={question.id}
          questionText={question.question}
          onFeedbackSubmitted={() => setShowFeedback(false)}
        />
      )}
    </div>
  )
}
