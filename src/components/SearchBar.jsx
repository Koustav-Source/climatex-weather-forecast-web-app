import { Search, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ onSearch, onGetLocation }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Search city..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="search-input"
          aria-label="City search"
        />
        <button type="submit" className="search-btn" aria-label="Search">
          <Search size={20} />
        </button>
      </div>
      <button
        type="button"
        className="location-btn"
        onClick={onGetLocation}
        title="Use my location"
        aria-label="Use current location"
      >
        <MapPin size={20} />
      </button>
    </form>
  );
}
