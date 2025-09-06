import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, answer } = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get the correct answer
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("correct_answer")
      .eq("id", questionId)
      .single()

    if (questionError) {
      return new Response("Question not found", { status: 404 })
    }

    const isCorrect = answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()

    // Update quiz response
    const { error: updateError } = await supabase
      .from("quiz_responses")
      .update({
        user_answer: answer,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .eq("question_id", questionId)
      .eq("user_id", user.id)

    if (updateError) {
      return new Response("Failed to save answer", { status: 500 })
    }

    return Response.json({
      success: true,
      isCorrect,
      correctAnswer: question.correct_answer,
    })
  } catch (error) {
    console.error("Error submitting answer:", error)
    return new Response("Failed to submit answer", { status: 500 })
  }
}
