import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Hash, Search, X } from 'lucide-react';
import '../styles/TagFilter.css';

interface TagFilterProps {
  allTags: string[];
  allSubgenres: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags, allSubgenres, selectedTags, onTagToggle }) => {
  // Состояния раскрытия списков
  const [isSubgenresOpen, setSubgenresOpen] = useState(true);
  const [isTagsOpen, setTagsOpen] = useState(false);
  
  // Состояния поиска для каждого списка
  const [subgenreSearch, setSubgenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Универсальная функция рендера секции (Поджанры или Теги)
  const renderSection = (
    title: string,
    items: string[],
    isOpen: boolean,
    toggleOpen: () => void,
    searchValue: string,
    setSearchValue: (val: string) => void,
    icon: React.ReactNode
  ) => {
    // Фильтруем список на лету
    const filteredItems = items.filter(item => 
      item.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <div className="filter-section-block">
        <div className="section-header" onClick={toggleOpen}>
          <div className="header-title">
            {icon}
            <span>{title}</span>
            <span className="count-badge">{items.length}</span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {isOpen && (
          <div className="section-body">
            {/* Встроенный поиск */}
           <div className="section-search">
  {/* SVG Иконка поиска вручную, чтобы не зависеть от библиотек */}
  <svg 
    width="14" height="14" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="search-icon"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
  
  <input 
     /* ... остальной код инпута ... */
  />
                type="text" 
                placeholder={`Find ${title}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Чтобы клик по инпуту не закрывал аккордеон
              />
              {searchValue && (
                <button className="clear-search" onClick={() => setSearchValue('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="section-content custom-scrollbar">
              <div className="tags-grid">
                {filteredItems.length > 0 ? (
                  filteredItems.map(tag => {
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
                  })
                ) : (
                  <div className="no-tags-found">No matches found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tag-filter-container">
      {renderSection(
        "Subgenres", 
        allSubgenres, 
        isSubgenresOpen, 
        () => setSubgenresOpen(!isSubgenresOpen),
        subgenreSearch,
        setSubgenreSearch,
        <Filter size={16} className="header-icon subgenre-icon" />
      )}

      {renderSection(
        "Tags", 
        allTags, 
        isTagsOpen, 
        () => setTagsOpen(!isTagsOpen),
        tagSearch,
        setTagSearch,
        <Hash size={16} className="header-icon tag-icon" />
      )}
    </div>
  );
};

export default TagFilter;
