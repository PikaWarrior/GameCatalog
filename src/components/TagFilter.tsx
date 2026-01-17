import React from 'react';
import '../styles/TagFilter.css';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags, selectedTags, onTagToggle }) => {
  return (
    <div className="tag-filter">
      <h3>Tags</h3>
      <div className="tags-list">
        {allTags.map(tag => (
          <button
            key={tag}
            className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
            onClick={() => onTagToggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
export default TagFilter;
