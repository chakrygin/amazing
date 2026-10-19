export const Options: Record<string, { title: string, minRating: number, pages?: number }> = {
  // ai
  'artificial_intelligence': {
    title: 'Искусственный интеллект',
    minRating: 10,
    pages: 3,
  },

  // devops
  'devops': {
    title: 'DevOps',
    minRating: 20,
  },
  'it-infrastructure': {
    title: 'IT-инфраструктура',
    minRating: 20,
  },
  'kubernetes': {
    title: 'Kubernetes',
    minRating: 20,
  },
  'postgresql': {
    title: 'PostgreSQL',
    minRating: 20,
  },

  // dotnet
  'net': {
    title: '.NET',
    minRating: 10,
  },
  'csharp': {
    title: 'C#',
    minRating: 10,
  },
  'fsharp': {
    title: 'F#',
    minRating: 10,
  },

  // frontend
  'javascript': {
    title: 'JavaScript',
    minRating: 10,
  },
  'typescript': {
    title: 'TypeScript',
    minRating: 10,
  },
};
