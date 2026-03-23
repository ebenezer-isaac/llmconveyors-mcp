---
name: ats-score
description: Score a resume against a job description for ATS (Applicant Tracking System) compatibility. Use when the user wants to check how well their resume matches a job posting or improve their resume's keyword coverage.
license: MIT
metadata:
  author: llmconveyors
  version: "0.1.0"
---

# ATS Score

Score a resume against a job description using keyword matching and AI semantic analysis.

## When to use

- User wants to know how well their resume matches a job posting
- User asks about ATS compatibility or keyword optimization
- User wants to improve their resume for a specific role
- After generating a tailored CV with Job Hunter, to validate the output

## Steps

1. **Get the resume text.** Either ask the user to paste their resume, or use `upload-resume` to parse a file, or use a master resume from `master-resume-list`.

2. **Get the job description.** Ask the user for the full job description text, or use `upload-job-text` to parse it.

3. **Score it.** Call `ats-score` with:
   - `resumeText` - the resume as plain text
   - `jobDescription` - the job description as plain text

4. **Present the results.** The response includes:
   - `overallScore` - numeric score (0-100)
   - `grade` - letter grade (A through F)
   - `breakdown` - scores for keyword match, experience relevance, skills coverage, education fit, format quality
   - `matchedKeywords` - which keywords were found
   - `missingKeywords` - which keywords are missing
   - `suggestions` - specific improvements to make

5. **Help improve.** Walk through the missing keywords and suggestions with the user.

## Example

User: "How does my resume score against this job posting?"

```
1. Get resume text and job description from the user
2. Call ats-score with both as plain text strings
3. Present the score, grade, and specific improvement suggestions
```
