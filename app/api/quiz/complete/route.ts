import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get quiz results
    const { data: responses, error: responsesError } = await supabase
      .from("quiz_responses")
      .select(`
        *,
        questions (
          question,
          correct_answer,
          explanation,
          topic,
          difficulty
        )
      `)
      .eq("session_id", sessionId)
      .eq("user_id", user.id)

    if (responsesError) {
      return new Response("Failed to fetch results", { status: 500 })
    }

    const totalQuestions = responses.length
    const correctAnswers = responses.filter((r) => r.is_correct).length
    const score = Math.round((correctAnswers / totalQuestions) * 100)

    // Update session
    const { error: sessionError } = await supabase
      .from("quiz_sessions")
      .update({
        score,
        completed_at: new Date().toISOString(),
        status: "completed",
      })
      .eq("id", sessionId)
      .eq("user_id", user.id)

    if (sessionError) {
      return new Response("Failed to complete session", { status: 500 })
    }

    return Response.json({
      score,
      totalQuestions,
      correctAnswers,
      responses: responses.map((r) => ({
        question: r.questions.question,
        userAnswer: r.user_answer,
        correctAnswer: r.questions.correct_answer,
        isCorrect: r.is_correct,
        explanation: r.questions.explanation,
        topic: r.questions.topic,
        difficulty: r.questions.difficulty,
      })),
    })
  } catch (error) {
    console.error("Error completing quiz:", error)
    return new Response("Failed to complete quiz", { status: 500 })
  }
}
