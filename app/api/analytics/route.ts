import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "30" // days

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(timeframe))

    // Get quiz performance over time
    const { data: sessions, error: sessionsError } = await supabase
      .from("quiz_sessions")
      .select(`
        *,
        quiz_responses (
          is_correct,
          question_id,
          questions (
            topic,
            difficulty_level
          )
        )
      `)
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("start_time", startDate.toISOString())
      .order("start_time", { ascending: true })

    if (sessionsError) {
      return new Response("Failed to fetch analytics", { status: 500 })
    }

    // Calculate performance metrics
    const performanceByTopic = new Map()
    const performanceByDifficulty = new Map()
    const performanceOverTime = []

    sessions?.forEach((session) => {
      const sessionDate = new Date(session.start_time).toDateString()
      const correctAnswers = session.quiz_responses?.filter((r) => r.is_correct).length || 0
      const totalQuestions = session.quiz_responses?.length || 0
      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

      // Performance over time
      const existingEntry = performanceOverTime.find((p) => p.date === sessionDate)
      if (existingEntry) {
        existingEntry.totalSessions++
        existingEntry.totalAccuracy += accuracy
        existingEntry.averageAccuracy = existingEntry.totalAccuracy / existingEntry.totalSessions
      } else {
        performanceOverTime.push({
          date: sessionDate,
          totalSessions: 1,
          totalAccuracy: accuracy,
          averageAccuracy: accuracy,
        })
      }

      // Performance by topic and difficulty
      session.quiz_responses?.forEach((response) => {
        if (response.questions) {
          const topic = response.questions.topic
          const difficulty = response.questions.difficulty_level

          // By topic
          if (!performanceByTopic.has(topic)) {
            performanceByTopic.set(topic, { correct: 0, total: 0 })
          }
          const topicStats = performanceByTopic.get(topic)
          topicStats.total++
          if (response.is_correct) topicStats.correct++

          // By difficulty
          if (!performanceByDifficulty.has(difficulty)) {
            performanceByDifficulty.set(difficulty, { correct: 0, total: 0 })
          }
          const difficultyStats = performanceByDifficulty.get(difficulty)
          difficultyStats.total++
          if (response.is_correct) difficultyStats.correct++
        }
      })
    })

    // Convert maps to arrays with percentages
    const topicPerformance = Array.from(performanceByTopic.entries()).map(([topic, stats]) => ({
      topic,
      accuracy: (stats.correct / stats.total) * 100,
      totalQuestions: stats.total,
    }))

    const difficultyPerformance = Array.from(performanceByDifficulty.entries()).map(([difficulty, stats]) => ({
      difficulty,
      accuracy: (stats.correct / stats.total) * 100,
      totalQuestions: stats.total,
    }))

    // Get improvement suggestions
    const weakTopics = topicPerformance
      .filter((t) => t.accuracy < 70 && t.totalQuestions >= 3)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3)

    const strongTopics = topicPerformance
      .filter((t) => t.accuracy >= 80 && t.totalQuestions >= 3)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 3)

    return Response.json({
      performanceOverTime,
      topicPerformance,
      difficultyPerformance,
      insights: {
        weakTopics,
        strongTopics,
        totalSessions: sessions?.length || 0,
        averageAccuracy:
          sessions?.length > 0
            ? sessions.reduce((acc, s) => acc + (s.correct_answers / s.total_questions) * 100, 0) / sessions.length
            : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return new Response("Failed to fetch analytics", { status: 500 })
  }
}
