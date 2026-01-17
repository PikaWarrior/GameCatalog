import React, { useState, useMemo } from 'react';
import '../styles/TagFilter.css';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  allTags,
  selectedTags,
  setSelectedTags,
}) => {
  const [tagSearch, setTagSearch] = useState('');

  const filteredTags = useMemo(() => {
    const searchLower = tagSearch.toLowerCase();
    return allTags.filter(tag => tag.toLowerCase().includes(searchLower));
  }, [allTags, tagSearch]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="tag-filter">
      <div className="tag-filter-header">
        <h4>Tags and Subgenres</h4>
        <span className="selected-count">
          {selectedTags.length} selected
        </span>
      </div>
      
      <div className="tag-search-container">
        <input
          type="text"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          placeholder="Search tags..."
          className="tag-search-input"
          aria-label="Search tags"
        />
      </div>

      <div className="selected-tags">
        {selectedTags.map(tag => (
          <span 
            key={tag} 
            className="selected-tag"
            onClick={() => handleTagToggle(tag)}
            aria-label={`Remove ${tag} filter`}
          >
            {tag} ×
          </span>
        ))}
        {selectedTags.length > 0 && (
          <button 
            onClick={clearAllTags}
            className="clear-tags-btn"
            aria-label="Clear all tags"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="tags-container">
        {filteredTags.slice(0, 50).map(tag => (
          <button
            key={tag}
            onClick={() => handleTagToggle(tag)}
            className={`tag-item ${selectedTags.includes(tag) ? 'selected' : ''}`}
            title={tag}
            aria-label={`Select ${tag} tag`}
            aria-pressed={selectedTags.includes(tag)}
          >
            {tag}
            <span className="tag-check">
              {selectedTags.includes(tag) ? '✓' : '+'}
            </span>
          </button>
        ))}
        {filteredTags.length > 50 && (
          <div className="tag-more">
            and {filteredTags.length - 50} more tags...
          </div>
        )}
      </div>
    </div>
  );
};

export default TagFilter;
