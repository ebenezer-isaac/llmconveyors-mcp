---
name: upload-parse
description: Upload and parse resumes and job descriptions from files or text. Use when the user provides a resume file, job posting URL, or job description text that needs to be parsed into structured data.
license: MIT
metadata:
  author: llmconveyors
  version: "0.1.0"
---

# Upload and Parse

Parse resumes and job descriptions into structured data for use with other tools.

## When to use

- User provides a resume file (PDF, DOCX, TXT) to upload
- User pastes a job description or provides a job posting
- User wants to extract structured data from a document before scoring or generating

## Available tools

- `upload-resume` - Upload and parse a resume file. Accepts base64-encoded content. Returns structured resume data.
- `upload-job-file` - Upload and parse a job description file. Accepts base64-encoded content.
- `upload-job-text` - Parse a job description from plain text. Returns company name, job title, keywords, and other structured fields.

## Steps

### Parse a job description from text
1. Call `upload-job-text` with the `text` parameter containing the job description
2. The response includes parsed fields: `companyName`, `jobTitle`, `keywords`, `metadata`
3. Use these fields with other tools like `ats-score` or `job-hunter-run`

### Upload a resume file
1. The file must be base64-encoded. If working with a local file, read it and encode to base64.
2. Call `upload-resume` with `fileBase64` (the encoded content), `filename` (original name), and optionally `contentType`
3. The response includes the parsed and normalized resume data

### Upload a job description file
1. Same process as resume: base64-encode the file
2. Call `upload-job-file` with `fileBase64`, `filename`, and optionally `contentType`
3. Returns the same structured output as `upload-job-text`
