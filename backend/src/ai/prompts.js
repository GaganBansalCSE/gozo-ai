const profile = {
  preferredRoles: [
    "Software Engineer",
    "Software Development Engineer",
    "Associate Software Engineer",
    "SDE1",
    "Backend Engineer",
    "Backend Developer",
    "Java Developer",
    "Software Engineer Intern",
    "Backend Intern",
    "AI Engineer Intern",
  ],
  preferredLocations: [
    "Remote",
    "India",
    "Bangalore",
    "Gurgaon",
    "Hyderabad",
    "Pune",
    "Mumbai",
  ],
  skills: [
    "Java",
    "C++",
    "JavaScript",
    "Spring Boot",
    "Node.js",
    "Express.js",
    "MongoDB",
    "REST APIs",
    "React.js",
    "DSA",
    "OOP",
    "DBMS",
    "OS basics",
    "CN basics",
    "Git",
    "GitHub",
    "Postman",
    "LLM basics",
    "RAG basics",
  ],
};

function buildMatchingPrompt(job) {
  return `You are evaluating how suitable a job is for this candidate profile.\nProfile: ${JSON.stringify(
    profile
  )}\nJob: ${JSON.stringify({
    role: job.role,
    company: job.company,
    location: job.location,
    applyType: job.applyType,
    description: job.metadata?.description || "",
  })}\nReturn strict JSON only with shape {\"score\": number, \"reason\": string}. Score must be 0-100.`;
}

module.exports = { buildMatchingPrompt };
