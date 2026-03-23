---
name: b2b-sales
description: Run the B2B Sales agent to research a company and generate personalized sales outreach. Use when the user wants to prospect a company, write cold emails for sales, or research a target account.
license: MIT
metadata:
  author: llmconveyors
  version: "0.1.0"
---

# B2B Sales

Research a target company and generate personalized cold email outreach for B2B sales.

## When to use

- User wants to research a company for sales prospecting
- User needs a personalized cold email for a specific company
- User mentions B2B outreach, sales emails, or account research
- User has a company name and website they want to target

## Steps

1. **Get company details.** You need: company name and website URL. Ask the user if not provided.

2. **Run the agent.** Call `b2b-sales-run` with:
   - `companyName` - target company name
   - `companyWebsite` - company website URL
   - `strategy` (optional) - specific angle or approach for the outreach

3. **Present the results.** The agent returns company research, person research (identifying the right contact), and a drafted cold email. Share these with the user.

4. **Create a share link.** If the user wants to share the output, call `share-create` with the session and generation IDs from the run result.

## Example

User: "Research Notion and draft a sales email for our developer tools product"

```
1. Call b2b-sales-run with companyName="Notion", companyWebsite="https://notion.so", strategy="Focus on developer tools integration"
2. Wait for completion (may take 3-10 minutes)
3. Present the company research report and drafted cold email
```

## Tips

- The agent performs deep company research including identifying decision makers
- Results typically take 3-10 minutes depending on how much public information is available
- The strategy parameter helps focus the outreach angle
