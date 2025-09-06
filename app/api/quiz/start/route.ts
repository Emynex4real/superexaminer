import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { documentId, questionCount = 10, difficulty, questionTypes } = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get questions for the quiz
    let query = supabase.from("questions").select("*").eq("user_id", user.id)

    if (documentId) {
      query = query.eq("document_id", documentId)
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty)
    }

    if (questionTypes && questionTypes.length > 0) {
      query = query.in("type", questionTypes)
    }

    const { data: questions, error: questionsError } = await query
      .limit(questionCount)
      .order("created_at", { ascending: false })

    if (questionsError) {
      return new Response("Failed to fetch questions", { status: 500 })
    }

    if (!questions || questions.length === 0) {
      return new Response("No questions found", { status: 404 })
    }

    // Create quiz session
    const { data: session, error: sessionError } = await supabase
      .from("quiz_sessions")
      .insert({
        user_id: user.id,
        document_id: documentId,
        total_questions: questions.length,
        status: "in_progress",
      })
      .select()
      .single()

    if (sessionError) {
      return new Response("Failed to create quiz session", { status: 500 })
    }

    // Create quiz responses for tracking
    const responses = questions.map((q) => ({
      session_id: session.id,
      question_id: q.id,
      user_id: user.id,
    }))

    const { error: responsesError } = await supabase.from("quiz_responses").insert(responses)

    if (responsesError) {
      return new Response("Failed to initialize quiz responses", { status: 500 })
    }

    return Response.json({
      sessionId: session.id,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        topic: q.topic,
        difficulty: q.difficulty,
      })),
    })
  } catch (error) {
    console.error("Error starting quiz:", error)
    return new Response("Failed to start quiz", { status: 500 })
  }
}
