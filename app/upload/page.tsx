import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Upload, FileText, Zap, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UploadPage() {
  // Check if environment is configured
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_') &&
                      process.env.SUPABASE_SERVICE_ROLE_KEY &&
                      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_')

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configuration required. Please set up your environment variables to enable document upload functionality.
              </AlertDescription>
            </Alert>
            <Card>
              <CardHeader>
                <CardTitle>Setup Required</CardTitle>
                <CardDescription>To use the upload feature, please configure these environment variables:</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <strong>SUPABASE_SERVICE_ROLE_KEY</strong>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Get from Supabase Dashboard → Settings → API → Service Role Key
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <strong>DEEPSEEK_API_KEY</strong>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Get from platform.deepseek.com → API Keys
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <strong>BLOB_READ_WRITE_TOKEN</strong>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Get from Vercel Dashboard → Storage → Blob
                    </p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Upload Your Document</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform your study materials into intelligent exam questions with AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-3">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Document</span>
                </CardTitle>
                <CardDescription>Upload your study materials to generate practice questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Drag and drop your files here
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    or click to browse files
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Choose Files
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">1. Upload Document</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Upload PDF, DOCX, or TXT files</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Brain className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">2. AI Analysis</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">AI extracts key concepts and topics</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">3. Generate Questions</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Create practice questions instantly</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>PDF Documents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Word Documents (DOCX, DOC)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Text Files (TXT)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}