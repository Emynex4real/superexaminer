"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportDialogProps {
  data: any[]
  type: "questions" | "results"
  title?: string
}

export function ExportDialog({ data, type, title = "Export Data" }: ExportDialogProps) {
  const [format, setFormat] = useState<"json" | "csv" | "pdf">("json")
  const [includeAnswers, setIncludeAnswers] = useState(true)
  const [includeExplanations, setIncludeExplanations] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      let exportData = data
      const filename = `${type}_export_${new Date().toISOString().split("T")[0]}`

      // Filter data based on options
      if (type === "questions") {
        exportData = data.map((item) => ({
          question: item.question || item.question_text,
          type: item.type || item.question_type,
          difficulty: item.difficulty || item.difficulty_level,
          topic: item.topic,
          ...(includeAnswers && { correct_answer: item.correct_answer }),
          ...(includeExplanations && { explanation: item.explanation }),
          options: item.options,
        }))
      }

      if (format === "json") {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
        downloadFile(blob, `${filename}.json`)
      } else if (format === "csv") {
        const csv = convertToCSV(exportData)
        const blob = new Blob([csv], { type: "text/csv" })
        downloadFile(blob, `${filename}.csv`)
      } else if (format === "pdf") {
        // For PDF, we'll create a simple text format
        const text = formatForPDF(exportData)
        const blob = new Blob([text], { type: "text/plain" })
        downloadFile(blob, `${filename}.txt`)
      }

      toast({
        title: "Export Successful",
        description: `${data.length} items exported successfully`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            if (Array.isArray(value)) {
              return `"${value.join("; ")}"`
            }
            return `"${String(value || "").replace(/"/g, '""')}"`
          })
          .join(","),
      ),
    ].join("\n")

    return csvContent
  }

  const formatForPDF = (data: any[]) => {
    return data
      .map((item, index) => {
        let text = `${index + 1}. ${item.question}\n`
        if (item.options && Array.isArray(item.options)) {
          item.options.forEach((option: string, i: number) => {
            text += `   ${String.fromCharCode(65 + i)}. ${option}\n`
          })
        }
        if (includeAnswers && item.correct_answer) {
          text += `   Answer: ${item.correct_answer}\n`
        }
        if (includeExplanations && item.explanation) {
          text += `   Explanation: ${item.explanation}\n`
        }
        text += `   Difficulty: ${item.difficulty || "N/A"}\n`
        text += `   Topic: ${item.topic || "N/A"}\n\n`
        return text
      })
      .join("")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Export your {type} in various formats for offline use or sharing.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(value: "json" | "csv" | "pdf") => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Text (PDF-ready)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "questions" && (
            <div className="space-y-3">
              <Label>Include in Export</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="answers" checked={includeAnswers} onCheckedChange={setIncludeAnswers} />
                  <Label htmlFor="answers" className="text-sm">
                    Correct answers
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="explanations" checked={includeExplanations} onCheckedChange={setIncludeExplanations} />
                  <Label htmlFor="explanations" className="text-sm">
                    Explanations
                  </Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">{data.length} items will be exported</p>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
