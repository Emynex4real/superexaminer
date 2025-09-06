import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Calendar, FileType, HardDrive, Plus } from "lucide-react"
import Link from "next/link"

export default async function DocumentsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's documents
  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", data.user.id)
    .order("upload_date", { ascending: false })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes("pdf")) return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
    if (fileType.includes("word") || fileType.includes("document"))
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
    if (fileType.includes("text")) return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
    return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
  }

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.includes("pdf")) return "PDF"
    if (fileType.includes("word") || fileType.includes("document")) return "Word"
    if (fileType.includes("text")) return "Text"
    return "Unknown"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation user={data.user} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Documents</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your uploaded study materials</p>
          </div>
          <Button asChild>
            <Link href="/upload">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Link>
          </Button>
        </div>

        {/* Documents Grid */}
        {documents && documents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* File Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <FileType className="h-4 w-4 text-gray-400" />
                        <Badge variant="secondary" className={getFileTypeColor(doc.file_type)}>
                          {getFileTypeLabel(doc.file_type)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <HardDrive className="h-3 w-3" />
                        <span>{formatFileSize(doc.file_size || 0)}</span>
                      </div>
                    </div>

                    {/* Processing Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                      {doc.processed ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                          Processed
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                          Processing
                        </Badge>
                      )}
                    </div>

                    {/* Content Preview */}
                    {doc.content && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Content Preview:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                          {doc.content.substring(0, 150)}...
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-3 border-t">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        View Details
                      </Button>
                      {doc.processed && (
                        <Button size="sm" className="flex-1">
                          Generate Quiz
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Upload your first document to get started with AI-powered question generation
              </p>
              <Button asChild>
                <Link href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
