function dedupeJobs(jobs) {
  const map = new Map();

  for (const job of jobs) {
    const key = `${job.company}::${job.role}::${job.url}`.toLowerCase();
    if (!map.has(key)) {
      map.set(key, job);
    }
  }

  return Array.from(map.values());
}

module.exports = { dedupeJobs };
