"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Target, BookOpen, Brain, Calendar } from "lucide-react"

interface AnalyticsData {
  performanceOverTime: Array<{
    date: string
    averageAccuracy: number
    totalSessions: number
  }>
  topicPerformance: Array<{
    topic: string
    accuracy: number
    totalQuestions: number
  }>
  difficultyPerformance: Array<{
    difficulty: string
    accuracy: number
    totalQuestions: number
  }>
  insights: {
    weakTopics: Array<{ topic: string; accuracy: number }>
    strongTopics: Array<{ topic: string; accuracy: number }>
    totalSessions: number
    averageAccuracy: number
  }
}

export function LearningAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeframe, setTimeframe] = useState("30")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600 dark:text-green-400"
    if (accuracy >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Learning Analytics</h2>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Analytics</CardTitle>
          <CardDescription>No data available yet. Take some quizzes to see your progress!</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Learning Analytics</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.insights.totalSessions}</div>
            <p className="text-sm text-muted-foreground">Quiz sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(analytics.insights.averageAccuracy)}`}>
              {Math.round(analytics.insights.averageAccuracy)}%
            </div>
            <p className="text-sm text-muted-foreground">Average accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.insights.strongTopics.length}</div>
            <p className="text-sm text-muted-foreground">Topics mastered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.insights.weakTopics.length}</div>
            <p className="text-sm text-muted-foreground">Topics to improve</p>
          </CardContent>
        </Card>
      </div>

      {/* Topic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Performance by Topic
          </CardTitle>
          <CardDescription>Your accuracy across different topics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.topicPerformance.length > 0 ? (
            analytics.topicPerformance.map((topic, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{topic.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getAccuracyColor(topic.accuracy)}`}>
                      {Math.round(topic.accuracy)}%
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {topic.totalQuestions} questions
                    </Badge>
                  </div>
                </div>
                <Progress value={topic.accuracy} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No topic data available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Difficulty Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Performance by Difficulty
          </CardTitle>
          <CardDescription>How you perform across different difficulty levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.difficultyPerformance.length > 0 ? (
            analytics.difficultyPerformance.map((diff, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(diff.difficulty)}>{diff.difficulty}</Badge>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getAccuracyColor(diff.accuracy)}`}>{Math.round(diff.accuracy)}%</span>
                    <Badge variant="outline" className="text-xs">
                      {diff.totalQuestions} questions
                    </Badge>
                  </div>
                </div>
                <Progress value={diff.accuracy} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No difficulty data available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      {(analytics.insights.weakTopics.length > 0 || analytics.insights.strongTopics.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {analytics.insights.strongTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <TrendingUp className="h-5 w-5" />
                  Strong Topics
                </CardTitle>
                <CardDescription>Areas where you excel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.insights.strongTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded"
                  >
                    <span className="font-medium">{topic.topic}</span>
                    <span className="text-green-700 dark:text-green-300 font-bold">{Math.round(topic.accuracy)}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analytics.insights.weakTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <Target className="h-5 w-5" />
                  Focus Areas
                </CardTitle>
                <CardDescription>Topics that need more practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.insights.weakTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded"
                  >
                    <span className="font-medium">{topic.topic}</span>
                    <span className="text-red-700 dark:text-red-300 font-bold">{Math.round(topic.accuracy)}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
