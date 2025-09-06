"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { QuizSetup } from "@/components/quiz-setup"
import { QuizQuestion } from "@/components/quiz-question"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Trophy, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  question: string
  type: "multiple-choice" | "true-false" | "short-answer" | "essay"
  options?: string[]
  topic: string
  difficulty: "easy" | "medium" | "hard"
}

interface QuizConfig {
  documentId?: string
  questionCount: number
  difficulty?: string
  questionTypes: string[]
}

interface QuizResult {
  score: number
  totalQuestions: number
  correctAnswers: number
  responses: Array<{
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string
    topic: string
    difficulty: string
  }>
}

export default function QuizPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string>("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, { isCorrect: boolean; correctAnswer: string }>>({})
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("documents").select("id, title").order("created_at", { ascending: false })

    if (data) setDocuments(data)
  }

  const startQuiz = async (config: QuizConfig) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Failed to start quiz")
      }

      const data = await response.json()
      setSessionId(data.sessionId)
      setQuestions(data.questions)
      setQuizStarted(true)
      setCurrentQuestionIndex(0)
      setAnswers({})
      setResults({})

      toast({
        title: "Quiz Started!",
        description: `${data.questions.length} questions loaded`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start quiz",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex]

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          answer,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit answer")
      }

      const result = await response.json()

      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
      setResults((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          isCorrect: result.isCorrect,
          correctAnswer: result.correctAnswer,
        },
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      })
    }
  }

  const completeQuiz = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        throw new Error("Failed to complete quiz")
      }

      const result = await response.json()
      setQuizResult(result)
      setQuizCompleted(true)

      toast({
        title: "Quiz Completed!",
        description: `You scored ${result.score}%`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete quiz",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setQuizCompleted(false)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setAnswers({})
    setResults({})
    setQuizResult(null)
    setSessionId("")
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const allQuestionsAnswered = questions.every((q) => answers[q.id])

  if (!quizStarted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold">Practice Quiz</h1>
            <p className="text-muted-foreground">Test your knowledge with AI-generated questions</p>
          </div>
          <QuizSetup documents={documents} onStartQuiz={startQuiz} />
        </div>
      </div>
    )
  }

  if (quizCompleted && quizResult) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Trophy className="h-6 w-6" />
                Quiz Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">{quizResult.score}%</div>
              <p className="text-muted-foreground">
                {quizResult.correctAnswers} out of {quizResult.totalQuestions} questions correct
              </p>
              <Button onClick={resetQuiz} className="mt-4">
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Another Quiz
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review Your Answers</h2>
            {quizResult.responses.map((response, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={response.isCorrect ? "default" : "destructive"}>Question {index + 1}</Badge>
                    <Badge variant="outline">{response.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-lg">{response.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <div
                      className={`p-3 rounded ${response.isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
                    >
                      <span className="font-medium">Your Answer: </span>
                      {response.userAnswer}
                    </div>
                    {!response.isCorrect && (
                      <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20">
                        <span className="font-medium">Correct Answer: </span>
                        {response.correctAnswer}
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded">
                    <span className="font-medium">Explanation: </span>
                    {response.explanation}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>
                  {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        {currentQuestion && (
          <QuizQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={submitAnswer}
            isAnswered={!!answers[currentQuestion.id]}
            userAnswer={answers[currentQuestion.id]}
            isCorrect={results[currentQuestion.id]?.isCorrect}
            correctAnswer={results[currentQuestion.id]?.correctAnswer}
            showResult={!!answers[currentQuestion.id]}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {isLastQuestion && allQuestionsAnswered ? (
            <Button onClick={completeQuiz} disabled={isLoading}>
              <Trophy className="mr-2 h-4 w-4" />
              Complete Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
