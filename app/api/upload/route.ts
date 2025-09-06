import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Please upload PDF, DOCX, DOC, or TXT files only.",
        },
        { status: 400 },
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`${user.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    let textContent = ""
    let processed = false

    try {
      if (file.type === "text/plain") {
        textContent = await file.text()
        processed = true
      } else if (file.type === "application/pdf") {
        // Extract text from PDF using pdf-parse
        const pdfParse = await import("pdf-parse/lib/pdf-parse.js")
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const data = await pdfParse.default(buffer)
        textContent = data.text
        processed = true
      } else if (file.type.includes("word") || file.type.includes("document")) {
        // Extract text from DOCX using mammoth
        const mammoth = await import("mammoth")
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        textContent = result.value
        processed = true
      }

      // Clean up extracted text
      textContent = textContent.trim()
      if (!textContent) {
        textContent = "No readable text content found in the document."
        processed = false
      }
    } catch (extractionError) {
      console.error("Text extraction error:", extractionError)
      textContent = `Failed to extract text from ${file.type} file. Please try uploading a different format.`
      processed = false
    }

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: title || file.name,
        content: textContent,
        file_type: file.type,
        file_size: file.size,
        processed: processed,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      // Clean up blob if database insert fails
      await import("@vercel/blob").then(({ del }) => del(blob.url))
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
    }

    return NextResponse.json({
      id: document.id,
      url: blob.url,
      title: document.title,
      filename: file.name,
      size: file.size,
      type: file.type,
      processed: document.processed,
      contentLength: textContent.length,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
