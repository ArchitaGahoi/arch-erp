import React, { useEffect, useState, useRef } from 'react';
import './ComboBox.css';
import axios from 'axios';

const ComboBox = ({ apiUrl, label, onSelect }) => {
  const [options, setOptions] = useState([]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    // fetch(apiUrl)
    axios.get(apiUrl)
      //.then(res => res.json())
      .then(data => setOptions(Array.isArray(data?.data) ? data.data[0] : []))
      .catch(() => setOptions([]));
  }, [apiUrl]);


  const filtered = input
    ? options.filter(
      item =>
        (item.itemName)
          .toLowerCase()
          .includes(input.toLowerCase())
    )
    : options;

    console.log(filtered);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setShowSuggestions(true);
    setActiveIdx(-1);
    //if (onSelect) onSelect(e.target.value);
  };

  const handleSuggestionClick = (item) => {
    setInput(item.name || item.label || item.value || '');
    setShowSuggestions(false);
    setActiveIdx(-1);
    if (onSelect) onSelect(item.id || item.value || item.name);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      setActiveIdx(idx => Math.min(idx + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveIdx(idx => Math.max(idx - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      handleSuggestionClick(filtered[activeIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIdx(-1);
    }
  };

  return (
    <div className="combo-box-container" ref={containerRef}>
      <label className="combo-box-label">{label}:</label>
      <input
        className="combo-box-input"
        type="text"
        value={input}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder="Type to search..."
        autoComplete="off"
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="combo-box-suggestions">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              className={
                'combo-box-suggestion' +
                (idx === activeIdx ? ' active' : '')
              }
              onMouseDown={() => handleSuggestionClick(item)}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              {item.itemName}
            </div>
          ))}
        </div>
      )}
      {showSuggestions && filtered.length === 0 && (
        <div className="combo-box-suggestions">
          <div className="combo-box-suggestion">No results found</div>
        </div>
      )}
    </div>
  );
};

export default ComboBox;