export default function SkeletonLoader() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header"></div>
      <div className="skeleton-icon"></div>
      <div className="skeleton-temp"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-item"></div>
        ))}
      </div>
    </div>
  );
}
