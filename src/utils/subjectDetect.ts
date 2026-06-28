export function detectSubjectId(text: string, subjects: any[]): string | null {
  const t = text.toLowerCase();

  const rules: { [key: string]: string[] } = {
    math: ["math", "calculus", "geometry", "algebra", "integration", "derivative", "differential", "theorem", "limit", "vector", "matrix", "arithmetic"],
    cs: ["computer", "code", "api", "database", "programming", "react", "vue", "node", "python", "javascript", "typescript", "java", "deploy", "server", "html", "css", "git", "web", "frontend", "backend"],
    phys: ["physics", "optics", "force", "gravity", "energy", "quantum", "thermodynamics", "velocity", "acceleration", "mechanics", "wave", "magnet", "electric"],
    chem: ["chem", "organic", "molecule", "reaction", "acid", "alkane", "chemical", "ph ", "base", "solution", "periodic", "atom", "bonding"],
  };

  for (const [subjId, keywords] of Object.entries(rules)) {
    // Check if any keyword matches
    if (keywords.some((kw) => t.includes(kw))) {
      // Confirm this subject actually exists in the subject list
      const exists = subjects.some((sub) => sub.id === subjId);
      if (exists) return subjId;
    }
  }

  return null;
}
