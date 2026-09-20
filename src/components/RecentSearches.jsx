import { Clock, X } from "lucide-react";

export default function RecentSearches({ currentCity, onSelectCity }) {
  const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");

  if (recent.length === 0) return null;

  const handleClear = (e, cityToRemove) => {
    e.stopPropagation();
    const updated = recent.filter(c => c !== cityToRemove);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600 }}>
        <Clock size={13} /> Recent Searches
      </div>
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }} className="no-scrollbar">
        {recent.map((c) => {
          const isSelected = currentCity.toLowerCase() === c.toLowerCase();
          return (
            <div
              key={c}
              onClick={() => onSelectCity(c)}
              style={{
                display: "flex",
                alignItem: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "16px",
                border: isSelected ? "1px solid var(--accent)" : "1px solid rgba(59, 130, 246, 0.25)",
                background: isSelected ? "rgba(59, 130, 246, 0.25)" : "rgba(15, 23, 42, 0.5)",
                color: isSelected ? "#fff" : "var(--text-primary)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              <span>{c}</span>
              <button
                onClick={(e) => handleClear(e, c)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                title="Remove"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
