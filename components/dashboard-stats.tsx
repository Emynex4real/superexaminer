"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, Brain, Target, Award, BookOpen } from "lucide-react"

interface DashboardStatsProps {
  userId: string
}

interface StatsData {
  documents: {
    total: number
    processed: number
    thisWeek: number
  }
  questions: {
    total: number
    byDifficulty: { easy: number; medium: number; hard: number }
    byType: { [key: string]: number }
  }
  quizzes: {
    total: number
    completed: number
    averageScore: number
    totalQuestions: number
    correctAnswers: number
    streak: number
  }
  recentActivity: Array<{
    type: "document" | "quiz" | "question"
    title: string
    date: string
    score?: number
  }>
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const accuracyPercentage =
    stats.quizzes.totalQuestions > 0 ? (stats.quizzes.correctAnswers / stats.quizzes.totalQuestions) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents.total}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">{stats.documents.processed} processed</p>
              {stats.documents.thisWeek > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{stats.documents.thisWeek} this week
                </Badge>
              )}
            </div>
            <Progress
              value={(stats.documents.processed / Math.max(stats.documents.total, 1)) * 100}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Generated</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.questions.total}</div>
            <div className="flex gap-1 mt-2">
              <Badge variant="outline" className="text-xs">
                Easy: {stats.questions.byDifficulty.easy}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Med: {stats.questions.byDifficulty.medium}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Hard: {stats.questions.byDifficulty.hard}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(accuracyPercentage)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.quizzes.correctAnswers}/{stats.quizzes.totalQuestions} correct
            </p>
            <Progress value={accuracyPercentage} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quizzes.streak}</div>
            <p className="text-xs text-muted-foreground">{stats.quizzes.completed} quizzes completed</p>
            {stats.quizzes.streak >= 5 && (
              <Badge className="mt-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                On fire! 🔥
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Question Types</CardTitle>
            <CardDescription>Distribution of generated questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.questions.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm capitalize">{type.replace("-", " ")}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(stats.questions.total, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.type === "document"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : activity.type === "quiz"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-purple-100 dark:bg-purple-900/20"
                      }`}
                    >
                      {activity.type === "document" && <FileText className="h-4 w-4" />}
                      {activity.type === "quiz" && <Brain className="h-4 w-4" />}
                      {activity.type === "question" && <BookOpen className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                        {activity.score !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {activity.score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
