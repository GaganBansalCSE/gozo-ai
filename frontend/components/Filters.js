"use client";

export default function Filters({ filters, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="card" style={{ marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>Filters</h3>
      <label>
        Role
        <input
          value={filters.role}
          onChange={(e) => onChange("role", e.target.value)}
          placeholder="Backend Engineer"
        />
      </label>

      <label>
        Location
        <input
          value={filters.location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="Remote"
        />
      </label>

      <label>
        Status
        <select
          value={filters.status}
          onChange={(e) => onChange("status", e.target.value)}
        >
          <option value="">All</option>
          <option value="NOT_APPLIED">Not Applied</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEW">Interview</option>
          <option value="REJECTED">Rejected</option>
          <option value="SKIPPED">Skipped</option>
        </select>
      </label>

      <label>
        Apply Type
        <select
          value={filters.applyType}
          onChange={(e) => onChange("applyType", e.target.value)}
        >
          <option value="">All</option>
          <option value="EASY_APPLY">Easy Apply</option>
          <option value="MANUAL">Manual</option>
        </select>
      </label>

      <button type="submit">Apply Filters</button>
    </form>
  );
}
