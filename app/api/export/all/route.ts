import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get all user data
    const [{ data: documents }, { data: questions }, { data: quizSessions }, { data: feedback }] = await Promise.all([
      supabase.from("documents").select("*").eq("user_id", user.id),
      supabase.from("questions").select("*").eq("user_id", user.id),
      supabase
        .from("quiz_sessions")
        .select(`
        *,
        quiz_responses (*)
      `)
        .eq("user_id", user.id),
      supabase.from("feedback").select("*").eq("user_id", user.id),
    ])

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      documents: documents || [],
      questions: questions || [],
      quiz_sessions: quizSessions || [],
      feedback: feedback || [],
      exported_at: new Date().toISOString(),
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="superai_examiner_data_${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return new Response("Failed to export data", { status: 500 })
  }
}
