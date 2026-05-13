const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

export async function fetchJobs(params = {}) {
  const query = toQueryString(params);
  const response = await fetch(`${API_BASE}/jobs${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return response.json();
}

export async function fetchTopMatches(params = {}) {
  const query = toQueryString(params);
  const response = await fetch(`${API_BASE}/jobs/top-matches${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch top matches");
  }

  return response.json();
}

export async function markApplied(id) {
  const response = await fetch(`${API_BASE}/applications/${id}/mark-applied`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to mark applied");
  }

  return response.json();
}

export async function updateStatus(id, status) {
  const response = await fetch(`${API_BASE}/applications/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update status");
  }

  return response.json();
}
