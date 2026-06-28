// ── Auto subject detection from task text ─────────────────────────────────

const KEYWORDS = {
  "Data Structures":      ["dsa","data structure","array","linked list","tree","graph","heap","stack","queue","sorting","searching","dp","dynamic programming","recursion","algo","leetcode"],
  "Operating Systems":    ["os","operating system","process","thread","scheduling","memory","paging","semaphore","deadlock","kernel","cpu","mutex","virtual memory"],
  "DBMS":                 ["dbms","database","sql","query","normalization","er diagram","transaction","acid","index","join","relational","mongodb","nosql"],
  "Computer Networks":    ["network","http","tcp","ip","dns","routing","protocol","socket","osi","bandwidth","lan","wan","subnet","firewall","vpn"],
  "Software Engineering": ["software engineering","agile","scrum","uml","design pattern","sdlc","testing","deployment","devops","git","ci/cd","api","rest","microservice"],
  "Mathematics":          ["math","calculus","algebra","matrix","probability","statistics","discrete","integral","derivative","theorem","proof","combinatorics"],
  "Machine Learning":     ["ml","machine learning","neural","deep learning","model","training","dataset","classification","regression","pytorch","tensorflow","sklearn"],
  "Web Development":      ["web","html","css","javascript","react","vue","angular","node","express","frontend","backend","fullstack","dom","api","json"],
};

/**
 * Returns subject name that best matches task text, or null.
 */
export function detectSubject(text, subjects = []) {
  const lower = text.toLowerCase();

  // First try matching against user's actual subjects
  for (const subj of subjects) {
    const name = subj.name.toLowerCase();
    if (lower.includes(name)) return subj.id;
    // Check first word
    const firstWord = name.split(" ")[0];
    if (firstWord.length > 3 && lower.includes(firstWord)) return subj.id;
  }

  // Fall back to keyword map → find matching subject by name
  for (const [subjName, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      const match = subjects.find((s) =>
        s.name.toLowerCase().includes(subjName.toLowerCase().split(" ")[0])
      );
      if (match) return match.id;
    }
  }

  return null;
}

/**
 * Returns confidence label for UI.
 */
export function detectSubjectLabel(text, subjects) {
  const id    = detectSubject(text, subjects);
  const subj  = subjects.find((s) => s.id === id);
  return subj ? { id: subj.id, name: subj.name, color: subj.color } : null;
}
