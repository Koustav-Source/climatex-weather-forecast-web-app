import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <AlertCircle size={48} className="error-icon-main" />
      <h2>Oops!</h2>
      <p>{message}</p>
      <button onClick={onRetry} className="retry-btn">
        <RefreshCw size={18} />
        <span>Try Again</span>
      </button>
    </div>
  );
}
