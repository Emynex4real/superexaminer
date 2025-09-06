import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { QuestionGenerator } from "@/components/question-generator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Brain } from "lucide-react"

export default async function GeneratePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's documents
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get user's questions count
  const { count: questionsCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Generate Questions</h1>
          <p className="text-muted-foreground">Transform your documents into practice questions using AI</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Available for questions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questionsCount || 0}</div>
              <p className="text-sm text-muted-foreground">Generated so far</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">AI Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">Grok Beta</div>
              <p className="text-sm text-muted-foreground">Powered by xAI</p>
            </CardContent>
          </Card>
        </div>

        {documents && documents.length > 0 ? (
          <QuestionGenerator documents={documents} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Documents Found</CardTitle>
              <CardDescription>You need to upload documents before generating questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upload PDF, DOCX, or TXT files to get started with AI-powered question generation.
              </p>
              <a
                href="/upload"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Upload Documents
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
