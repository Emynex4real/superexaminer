"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FeedbackFormProps {
  questionId: string
  questionText: string
  onFeedbackSubmitted?: () => void
}

export function FeedbackForm({ questionId, questionText, onFeedbackSubmitted }: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<string>("")
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleSubmit = async () => {
    if (!feedbackType || rating === 0) {
      toast({
        title: "Error",
        description: "Please select feedback type and rating",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          feedbackType,
          rating,
          comment: comment.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully",
      })

      // Reset form
      setFeedbackType("")
      setRating(0)
      setComment("")
      onFeedbackSubmitted?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Question Feedback
        </CardTitle>
        <CardDescription>Help us improve by rating this question</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{questionText}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-type">Feedback Type</Label>
          <Select value={feedbackType} onValueChange={setFeedbackType}>
            <SelectTrigger>
              <SelectValue placeholder="What would you like to feedback on?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="question_quality">Question Quality</SelectItem>
              <SelectItem value="difficulty">Difficulty Level</SelectItem>
              <SelectItem value="relevance">Relevance to Topic</SelectItem>
              <SelectItem value="general">General Feedback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingClick(value)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-6 w-6 ${
                    value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">{rating > 0 && `${rating}/5`}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Additional Comments (Optional)</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share any specific thoughts or suggestions..."
            className="min-h-[80px]"
          />
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting || !feedbackType || rating === 0} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </CardContent>
    </Card>
  )
}
