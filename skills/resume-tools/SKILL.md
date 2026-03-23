---
name: resume-tools
description: Validate, render, preview, and manage resumes. Use when the user wants to check a resume for errors, generate a PDF, preview as HTML, list available themes, or manage their saved master resumes.
license: MIT
metadata:
  author: llmconveyors
  version: "0.1.0"
---

# Resume Tools

Full suite of resume management tools including validation, rendering, and master resume CRUD.

## When to use

- User wants to validate a resume for errors or warnings
- User wants to render a resume as PDF or preview as HTML
- User asks about available resume themes
- User wants to save, list, update, or delete master resumes
- User wants to import from or export to Reactive Resume format

## Available tools

### Validation and rendering
- `resume-validate` - Check a JSON Resume for errors and warnings
- `resume-render` - Generate a PDF from a JSON Resume (returns base64 PDF)
- `resume-preview` - Generate an HTML preview of a resume
- `resume-themes` - List available themes (even, stackoverflow, class, professional)

### Master resume management
- `master-resume-create` - Save a new master resume (needs `label` and `rawText`)
- `master-resume-list` - List all saved master resumes
- `master-resume-get` - Get a specific master resume by ID
- `master-resume-update` - Update a master resume's label or text
- `master-resume-delete` - Delete a master resume

### Import/Export
- `resume-import-rx` - Convert Reactive Resume format to JSON Resume
- `resume-export-rx` - Convert JSON Resume to Reactive Resume format

## Steps for common tasks

### Save a master resume
1. Ask the user for their resume text
2. Call `master-resume-create` with a `label` (name) and `rawText` (the resume content)
3. Confirm the save and share the ID for future reference

### Render a PDF
1. Get or build a JSON Resume object (with basics, work, education, skills sections)
2. Optionally call `resume-themes` to let the user pick a theme
3. Call `resume-render` with the resume object and chosen theme
4. The response contains a base64-encoded PDF
