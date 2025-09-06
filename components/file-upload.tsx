"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUploadComplete?: (document: any) => void
  className?: string
}

export function FileUpload({ onUploadComplete, className }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(acceptedFiles)
      setUploadStatus("idle")
      setErrorMessage("")

      // Auto-generate title from first file if no title is set
      if (acceptedFiles.length > 0 && !title) {
        const fileName = acceptedFiles[0].name
        const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf(".")) || fileName
        setTitle(nameWithoutExtension)
      }
    },
    [title],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const removeFile = () => {
    setFiles([])
    setUploadStatus("idle")
    setErrorMessage("")
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("file", files[0])
      formData.append("title", title || files[0].name)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setUploadStatus("success")
      setFiles([])
      setTitle("")

      if (onUploadComplete) {
        onUploadComplete(result)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="title">Document Title</Label>
        <Input
          id="title"
          placeholder="Enter a title for your document"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-300 dark:border-gray-600",
              files.length > 0 ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "",
            )}
          >
            <input {...getInputProps()} />

            {files.length === 0 ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {isDragActive ? "Drop your file here" : "Upload your document"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Drag and drop or click to select</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Supports PDF, DOCX, DOC, and TXT files
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <File className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{files[0].name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(files[0].size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadStatus === "success" && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Document uploaded successfully!</span>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      <Button onClick={handleUpload} disabled={files.length === 0 || uploading || !title.trim()} className="w-full">
        {uploading ? "Uploading..." : "Upload Document"}
      </Button>
    </div>
  )
}
