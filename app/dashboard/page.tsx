import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { DashboardStats } from "@/components/dashboard-stats"
import { QuickActions } from "@/components/quick-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, FileText, BookOpen, Plus, Clock, Award } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  console.log("[v0] DashboardPage: starting")

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's recent documents
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, upload_date, processed")
    .eq("user_id", data.user.id)
    .order("upload_date", { ascending: false })
    .limit(5)

  // Get user's recent quiz sessions
  const { data: quizSessions } = await supabase
    .from("quiz_sessions")
    .select("id, session_name, total_questions, correct_answers, completed, start_time, score")
    .eq("user_id", data.user.id)
    .eq("completed", true)
    .order("start_time", { ascending: false })
    .limit(5)

  // Check if user has questions
  const { count: questionCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data.user.id)

  const hasDocuments = (documents?.length || 0) > 0
  const hasQuestions = (questionCount || 0) > 0

  // Get user's name from profile or email
  const displayName = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "there"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation user={data.user} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {displayName}!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {hasDocuments
              ? "Ready to generate some intelligent exam questions?"
              : "Let's get started by uploading your first document."}
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats userId={data.user.id} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions hasDocuments={hasDocuments} hasQuestions={hasQuestions} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Documents
                  </CardTitle>
                  <CardDescription>Your latest uploaded study materials</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href="/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.processed ? (
                          <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                            Ready
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                            Processing
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {documents.length >= 5 && (
                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/documents">View All Documents</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No documents uploaded yet</p>
                  <Button asChild>
                    <Link href="/upload">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Your First Document
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Quiz Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Recent Quiz Results
                  </CardTitle>
                  <CardDescription>Your latest practice sessions</CardDescription>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/quiz">
                    <Brain className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {quizSessions && quizSessions.length > 0 ? (
                <div className="space-y-4">
                  {quizSessions.map((session) => {
                    const score = session.score || Math.round((session.correct_answers / session.total_questions) * 100)
                    const scoreColor =
                      score >= 80
                        ? "text-green-600 dark:text-green-400"
                        : score >= 60
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"

                    return (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            {score >= 80 ? (
                              <Award className="h-4 w-4 text-purple-600" />
                            ) : (
                              <Brain className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{session.session_name || "Practice Quiz"}</p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.start_time).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${scoreColor}`}>{score}%</p>
                          <p className="text-xs text-muted-foreground">
                            {session.correct_answers}/{session.total_questions}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {quizSessions.length >= 5 && (
                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/analytics">View All Results</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No quiz sessions yet</p>
                  <Button asChild disabled={!hasQuestions}>
                    <Link href={hasQuestions ? "/quiz" : "#"}>
                      <Brain className="h-4 w-4 mr-2" />
                      {hasQuestions ? "Start Your First Quiz" : "Generate Questions First"}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
