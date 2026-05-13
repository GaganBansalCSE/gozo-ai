"use client";

export default function JobCard({ job, onMarkApplied, onSetStatus }) {
  return (
    <article className="card">
      <h4 style={{ marginTop: 0 }}>{job.role}</h4>
      <p style={{ margin: "4px 0" }}>{job.company}</p>
      <p style={{ margin: "4px 0", opacity: 0.9 }}>{job.location}</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <span className="badge">{job.source}</span>
        <span className="badge">{job.applyType}</span>
        <span className="badge">Score: {job.matchScore}</span>
        <span className="badge">{job.status}</span>
      </div>

      <p style={{ fontSize: 13, opacity: 0.85, marginTop: 10 }}>{job.reason}</p>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <a href={job.url} target="_blank" rel="noreferrer">
          <button className="secondary">Open Job</button>
        </a>
        <button onClick={() => onMarkApplied(job._id)}>Mark Applied</button>
        <select value={job.status} onChange={(e) => onSetStatus(job._id, e.target.value)}>
          <option value="NOT_APPLIED">NOT_APPLIED</option>
          <option value="APPLIED">APPLIED</option>
          <option value="INTERVIEW">INTERVIEW</option>
          <option value="REJECTED">REJECTED</option>
          <option value="SKIPPED">SKIPPED</option>
        </select>
      </div>
    </article>
  );
}
