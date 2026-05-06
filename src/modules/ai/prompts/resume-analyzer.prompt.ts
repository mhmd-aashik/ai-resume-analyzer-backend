export function buildResumeAnalyzerPrompt(params: {
  resumeText: string;
  jobDescription: string;
}) {
  return `
You are an expert ATS resume reviewer and technical recruiter.

Analyze the resume against the job description.

Return ONLY valid JSON. Do not include markdown. Do not include explanations outside JSON.

JSON format:
{
  "score": 85,
  "matchedSkills": ["React", "Node.js"],
  "missingSkills": ["AWS", "Docker"],
  "atsFeedback": ["Use clearer section headings"],
  "improvementSuggestions": ["Add measurable achievements"],
  "summarySuggestion": "Improved professional summary here",
  "recommendation": "Final hiring recommendation here"
}

Rules:
- score must be a number from 0 to 100
- matchedSkills must be an array of strings
- missingSkills must be an array of strings
- atsFeedback must be an array of strings
- improvementSuggestions must be an array of strings
- summarySuggestion must be a string
- recommendation must be a string

Resume:
${params.resumeText}

Job Description:
${params.jobDescription}
`;
}
