---
name: job-hunter
description: Run the Job Hunter agent to generate tailored CVs, cover letters, and cold emails for job applications. Use when the user wants to apply for a job, tailor their resume, or write outreach emails for a specific role.
license: MIT
metadata:
  author: llmconveyors
  version: "0.1.0"
---

# Job Hunter

Generate a complete, tailored job application package for a specific role.

## When to use

- User wants to apply for a job and needs a tailored CV
- User needs a cover letter written for a specific position
- User wants cold outreach emails to hiring managers or recruiters
- User has a job description and wants their resume optimized for it

## Steps

1. **Get the job details.** You need at minimum: company name, job title, and job description. Ask the user if they haven't provided these.

2. **Check for a master resume.** Call `master-resume-list` to see if the user has saved master resumes. If they have one, use its ID with the `masterResumeId` parameter.

3. **Run the agent.** Call `job-hunter-run` with the job details:
   - `companyName` - target company
   - `jobTitle` - the role
   - `jobDescription` - full job description text
   - `theme` - resume theme (default: "even", options: even, stackoverflow, class, professional)
   - `mode` - "standard" for CV + cover letter, "cold_outreach" to also generate cold emails
   - `contactName` and `contactEmail` - if the user has a specific hiring contact

4. **Present the results.** The agent returns artifacts including the tailored CV, cover letter, and optionally cold emails. Share the key outputs with the user.

5. **Score it.** Optionally call `ats-score` with the generated resume text and the job description to show the user how well their tailored CV matches.

## Example

User: "I want to apply for the Senior Engineer role at Stripe. Here's the job description: ..."

```
1. Call job-hunter-run with companyName="Stripe", jobTitle="Senior Engineer", jobDescription="..."
2. Wait for completion (may take 2-3 minutes)
3. Present the tailored CV, cover letter, and ATS score
```

## Tips

- The agent takes 1-3 minutes to complete as it researches the company and generates multiple documents
- If the user has uploaded their resume before, it will be used automatically
- Cold outreach mode requires a contact name and email for best results
