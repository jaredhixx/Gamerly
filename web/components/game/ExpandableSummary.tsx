"use client";

import { useState } from "react";

export default function ExpandableSummary({ summary }: { summary: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p className={`gameSummary ${expanded ? "expanded" : ""}`}>
        {summary}
      </p>

      <button
        type="button"
        className="summaryToggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}