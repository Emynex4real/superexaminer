import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { questionId, feedbackType, rating, comment } = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Insert feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        question_id: questionId,
        feedback_type: feedbackType,
        rating,
        comment,
      })
      .select()
      .single()

    if (feedbackError) {
      console.error("Error saving feedback:", feedbackError)
      return new Response("Failed to save feedback", { status: 500 })
    }

    return Response.json({ success: true, feedback })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return new Response("Failed to submit feedback", { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get("questionId")

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    let query = supabase
      .from("feedback")
      .select(`
        *,
        questions (
          question_text,
          topic,
          difficulty_level
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (questionId) {
      query = query.eq("question_id", questionId)
    }

    const { data: feedback, error: feedbackError } = await query

    if (feedbackError) {
      return new Response("Failed to fetch feedback", { status: 500 })
    }

    return Response.json({ feedback })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return new Response("Failed to fetch feedback", { status: 500 })
  }
}
