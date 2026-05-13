"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters";
import JobCard from "../components/JobCard";
import { fetchJobs, fetchTopMatches, markApplied, updateStatus } from "../lib/api";

function sectionizeJobs(jobs) {
  return {
    topMatches: jobs.filter((job) => job.matchScore >= 75),
    easyApplyJobs: jobs.filter((job) => job.applyType === "EASY_APPLY" && job.status === "NOT_APPLIED"),
    manualApplyJobs: jobs.filter((job) => job.applyType === "MANUAL" && job.status === "NOT_APPLIED"),
    appliedJobs: jobs.filter((job) => job.status === "APPLIED"),
    skippedJobs: jobs.filter((job) => job.status === "SKIPPED"),
    recentJobs: [...jobs]
      .sort((a, b) => new Date(b.createdAt || b.postedAt || 0) - new Date(a.createdAt || a.postedAt || 0))
      .slice(0, 12),
  };
}

function Section({ title, items, onMarkApplied, onSetStatus }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No jobs in this section.</p>
      ) : (
        <div className="grid">
          {items.map((job) => (
            <JobCard key={job._id} job={job} onMarkApplied={onMarkApplied} onSetStatus={onSetStatus} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const [filters, setFilters] = useState({ role: "", location: "", status: "", applyType: "" });
  const [appliedFilters, setAppliedFilters] = useState({ role: "", location: "", status: "", applyType: "" });
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [{ items, meta: responseMeta }, topMatchResp] = await Promise.all([
        fetchJobs({ ...appliedFilters, page, limit: 20 }),
        fetchTopMatches({ limit: 5 }),
      ]);

      const merged = [...topMatchResp.items, ...items].reduce((acc, job) => {
        if (!acc.some((item) => item._id === job._id)) {
          acc.push(job);
        }
        return acc;
      }, []);

      setJobs(merged);
      setMeta(responseMeta);
    } catch (loadError) {
      setError(loadError.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const sections = useMemo(() => sectionizeJobs(jobs), [jobs]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleMarkApplied = async (id) => {
    await markApplied(id);
    await loadJobs();
  };

  const handleSetStatus = async (id, status) => {
    await updateStatus(id, status);
    await loadJobs();
  };

  return (
    <main className="container">
      <h1>GOZO AI Dashboard</h1>
      <p style={{ opacity: 0.8 }}>
        Personal job hunting assistant with AI ranking and safe automation controls.
      </p>

      <Filters filters={filters} onChange={handleFilterChange} onSubmit={applyFilters} />

      {loading && <p>Loading jobs...</p>}
      {error && <p style={{ color: "#ff8080" }}>{error}</p>}

      {!loading && !error && (
        <>
          <Section title="Top Matches" items={sections.topMatches} onMarkApplied={handleMarkApplied} onSetStatus={handleSetStatus} />
          <Section title="Easy Apply Jobs" items={sections.easyApplyJobs} onMarkApplied={handleMarkApplied} onSetStatus={handleSetStatus} />
          <Section title="Manual Apply Jobs" items={sections.manualApplyJobs} onMarkApplied={handleMarkApplied} onSetStatus={handleSetStatus} />
          <Section title="Applied Jobs" items={sections.appliedJobs} onMarkApplied={handleMarkApplied} onSetStatus={handleSetStatus} />
          <Section title="Skipped Jobs" items={sections.skippedJobs} onMarkApplied={handleMarkApplied} onSetStatus={handleSetStatus} />
          <Section title="Recent Jobs" items={sections.recentJobs} onMarkApplied={handleMarkApplied} onSetStatus={handleSetStatus} />

          <section className="section" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} total jobs)
            </span>
            <button className="secondary" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </section>
        </>
      )}
    </main>
  );
}
