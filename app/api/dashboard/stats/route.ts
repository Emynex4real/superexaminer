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

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Get document stats
    const { data: documents } = await supabase
      .from("documents")
      .select("id, processed, upload_date, title")
      .eq("user_id", user.id)

    const documentStats = {
      total: documents?.length || 0,
      processed: documents?.filter((d) => d.processed).length || 0,
      thisWeek: documents?.filter((d) => new Date(d.upload_date) >= oneWeekAgo).length || 0,
    }

    // Get question stats
    const { data: questions } = await supabase
      .from("questions")
      .select("id, difficulty_level, question_type, created_at")
      .eq("user_id", user.id)

    const questionStats = {
      total: questions?.length || 0,
      byDifficulty: {
        easy: questions?.filter((q) => q.difficulty_level === "easy").length || 0,
        medium: questions?.filter((q) => q.difficulty_level === "medium").length || 0,
        hard: questions?.filter((q) => q.difficulty_level === "hard").length || 0,
      },
      byType:
        questions?.reduce(
          (acc, q) => {
            acc[q.question_type] = (acc[q.question_type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {},
    }

    // Get quiz stats
    const { data: quizSessions } = await supabase
      .from("quiz_sessions")
      .select(`
        id, 
        total_questions, 
        correct_answers, 
        completed, 
        start_time,
        session_name,
        score
      `)
      .eq("user_id", user.id)
      .order("start_time", { ascending: false })

    const completedQuizzes = quizSessions?.filter((q) => q.completed) || []
    const totalQuestions = completedQuizzes.reduce((acc, q) => acc + (q.total_questions || 0), 0)
    const correctAnswers = completedQuizzes.reduce((acc, q) => acc + (q.correct_answers || 0), 0)

    // Calculate streak (consecutive days with completed quizzes)
    let streak = 0
    const today = new Date()
    const currentDate = new Date(today)

    while (true) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const hasQuizOnDay = completedQuizzes.some((q) => {
        const quizDate = new Date(q.start_time)
        return quizDate >= dayStart && quizDate <= dayEnd
      })

      if (hasQuizOnDay) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    const quizStats = {
      total: quizSessions?.length || 0,
      completed: completedQuizzes.length,
      averageScore:
        completedQuizzes.length > 0
          ? completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) / completedQuizzes.length
          : 0,
      totalQuestions,
      correctAnswers,
      streak,
    }

    // Get recent activity
    const recentActivity = []

    // Recent documents
    const recentDocs =
      documents?.slice(0, 3).map((d) => ({
        type: "document" as const,
        title: `Uploaded "${d.title}"`,
        date: new Date(d.upload_date).toLocaleDateString(),
      })) || []

    // Recent quizzes
    const recentQuizzes = completedQuizzes.slice(0, 3).map((q) => ({
      type: "quiz" as const,
      title: q.session_name || "Practice Quiz",
      date: new Date(q.start_time).toLocaleDateString(),
      score: q.score || Math.round((q.correct_answers / q.total_questions) * 100),
    }))

    // Recent questions
    const recentQuestions =
      questions?.slice(0, 2).map((q) => ({
        type: "question" as const,
        title: "Generated questions",
        date: new Date(q.created_at).toLocaleDateString(),
      })) || []

    recentActivity.push(...recentDocs, ...recentQuizzes, ...recentQuestions)
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return Response.json({
      documents: documentStats,
      questions: questionStats,
      quizzes: quizStats,
      recentActivity: recentActivity.slice(0, 8),
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return new Response("Failed to fetch stats", { status: 500 })
  }
}
