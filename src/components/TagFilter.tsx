import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Hash } from 'lucide-react';
import '../styles/TagFilter.css';

interface TagFilterProps {
  allTags: string[]; // Это будут обычные теги
  allSubgenres: string[]; // НОВЫЙ ПРОПС: Поджанры
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags, allSubgenres, selectedTags, onTagToggle }) => {
  const [isSubgenresOpen, setSubgenresOpen] = useState(true);
  const [isTagsOpen, setTagsOpen] = useState(false);

  // Функция для рендера списка кнопок
  const renderTagList = (items: string[], icon: React.ReactNode) => (
    <div className="tags-grid">
      {items.map(tag => {
        const isActive = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            className={`tag-chip ${isActive ? 'active' : ''}`}
            onClick={() => onTagToggle(tag)}
            title={tag}
          >
            {isActive && <span className="check-icon">✓</span>}
            <span className="tag-text">{tag}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="tag-filter-container">
      {/* Секция Поджанров */}
      <div className="filter-section-block">
        <div 
          className="section-header" 
          onClick={() => setSubgenresOpen(!isSubgenresOpen)}
        >
          <div className="header-title">
            <Filter size={16} className="header-icon subgenre-icon" />
            <span>Subgenres</span>
            <span className="count-badge">{allSubgenres.length}</span>
          </div>
          {isSubgenresOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {isSubgenresOpen && (
          <div className="section-content custom-scrollbar">
            {renderTagList(allSubgenres, <Filter size={12}/>)}
          </div>
        )}
      </div>

      {/* Секция Тегов */}
      <div className="filter-section-block">
        <div 
          className="section-header" 
          onClick={() => setTagsOpen(!isTagsOpen)}
        >
          <div className="header-title">
            <Hash size={16} className="header-icon tag-icon" />
            <span>Tags</span>
            <span className="count-badge">{allTags.length}</span>
          </div>
          {isTagsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {isTagsOpen && (
          <div className="section-content custom-scrollbar">
            {renderTagList(allTags, <Hash size={12}/>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagFilter;
