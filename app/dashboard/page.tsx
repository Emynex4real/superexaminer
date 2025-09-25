import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, FileText, BookOpen, Plus, Clock, Award, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function DashboardPage() {
  // Check if environment is configured
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_') &&
                      process.env.SUPABASE_SERVICE_ROLE_KEY &&
                      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_')

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configuration required. Please set up your environment variables to access the dashboard.
              </AlertDescription>
            </Alert>
            <Card>
              <CardHeader>
                <CardTitle>Setup Required</CardTitle>
                <CardDescription>Configure these environment variables in Vercel:</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <strong>SUPABASE_SERVICE_ROLE_KEY</strong>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <strong>DEEPSEEK_API_KEY</strong>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <strong>BLOB_READ_WRITE_TOKEN</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to SuperExaminer!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's get started by uploading your first document.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Document
              </CardTitle>
              <CardDescription>Upload PDF, DOCX, or TXT files</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/upload">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Now
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Generate Questions
              </CardTitle>
              <CardDescription>AI-powered question generation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/generate">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Take Quiz
              </CardTitle>
              <CardDescription>Practice with generated questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/quiz">
                  <Award className="h-4 w-4 mr-2" />
                  Start Quiz
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Follow these steps to create your first exam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">1. Upload Document</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Upload your study materials</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Brain className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">2. Generate Questions</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">AI creates intelligent questions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">3. Take Quiz</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Practice and track progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>What you can do with SuperExaminer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Multiple question types (MCQ, True/False, Short Answer)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Difficulty level customization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Progress tracking and analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Export questions and results</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}