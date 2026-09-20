export default function CityBookmarks({ currentCity, onSelectCity }) {
  const popularCities = ["Kolkata", "London", "New York", "Tokyo", "Paris", "Sydney"];

  return (
    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px" }} className="no-scrollbar">
      {popularCities.map((c) => {
        const isSelected = currentCity.toLowerCase() === c.toLowerCase();
        return (
          <button
            key={c}
            onClick={() => onSelectCity(c)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: isSelected ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.15)",
              background: isSelected ? "var(--accent)" : "rgba(255,255,255,0.08)",
              color: isSelected ? "#fff" : "var(--text-primary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
