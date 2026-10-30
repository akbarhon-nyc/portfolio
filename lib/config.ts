// Live reader counter (Supabase project "adam-portfolio").
// The anon key is a public, read-mostly key: visitors can read the count and
// call note_reader(), which adds at most one visit per IP per day.
export const readers = {
  url: process.env.NEXT_PUBLIC_READERS_URL ?? "https://wymaosheotrhxmohdsyf.supabase.co",
  anonKey:
    process.env.NEXT_PUBLIC_READERS_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bWFvc2hlb3RyaHhtb2hkc3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjE2ODYsImV4cCI6MjEwODg5NzY4Nn0.lb6sxa7fyFAxDosK4wF0ohgHesFjKoo0rPb5I6NepME",
  counterId: "home",
};

export const site = {
  url: "https://akbarhon.dev",
  title: "Adam Toshkhujayev · AI Engineer",
  description:
    "AI engineer in New York and solo founder of AirBrew. Ask my portfolio anything: case studies on retrieval, import pipelines, multi-agent context and AI design systems.",
};
