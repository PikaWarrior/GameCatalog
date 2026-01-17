import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Check, Ban, ListFilter, Hash } from 'lucide-react';
import '../styles/TagFilter.css';

interface TagFilterProps {
  allTags: string[];
  allSubgenres: string[];
  selectedTags: string[];
  excludedTags: string[];
  onTagToggle: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  allTags, 
  allSubgenres, 
  selectedTags, 
  excludedTags = [], 
  onTagToggle 
}) => {
  const [isSubgenresOpen, setSubgenresOpen] = useState(true);
  const [isTagsOpen, setTagsOpen] = useState(false);
  const [subgenreSearch, setSubgenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Универсальная функция рендера для секций (Subgenres / Tags)
  const renderSection = (
    title: string,
    items: string[],
    isOpen: boolean,
    toggleOpen: () => void,
    searchValue: string,
    setSearchValue: (val: string) => void,
    icon: React.ReactNode
  ) => {
    const filteredItems = items.filter(item => 
      item.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <div className="filter-section">
        <button className="filter-header" onClick={toggleOpen}>
          <div className="filter-title-wrapper">
            {icon}
            <span className="filter-title">{title}</span>
            <span className="count-badge">{items.length}</span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="filter-content">
            <div className="search-input-wrapper">
              <Search size={14} className="search-icon" />
              <input 
                type="text" 
                placeholder={`Search ${title.toLowerCase()}...`}
                className="tag-search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchValue && (
                <button 
                  className="clear-search" 
                  onClick={(e) => { e.stopPropagation(); setSearchValue(''); }}
                >
                  ×
                </button>
              )}
            </div>

            <div className="tags-cloud">
              {filteredItems.length > 0 ? (
                filteredItems.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  const isExcluded = excludedTags.includes(tag);
                  
                  // Вычисляем класс кнопки на основе состояния
                  let btnClass = "filter-tag";
                  if (isSelected) btnClass += " active";
                  else if (isExcluded) btnClass += " excluded";

                  // Текст подсказки при наведении
                  let titleText = "Click to include";
                  if (isSelected) titleText = "Click to exclude";
                  if (isExcluded) titleText = "Click to reset";

                  return (
                    <button
                      key={tag}
                      className={btnClass}
                      onClick={() => onTagToggle(tag)}
                      title={titleText}
                    >
                      {/* Условный рендеринг иконок */}
                      {isSelected && <Check size={12} className="tag-icon check" />}
                      {isExcluded && <Ban size={12} className="tag-icon ban" />}
                      
                      <span>{tag}</span>
                    </button>
                  );
                })
              ) : (
                <div className="no-tags">No matches found</div>
              )}
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
        <ListFilter size={18} className="section-icon" />
      )}
      
      {renderSection(
        "Tags",
        allTags,
        isTagsOpen,
        () => setTagsOpen(!isTagsOpen),
        tagSearch,
        setTagSearch,
        <Hash size={18} className="section-icon" />
      )}
    </div>
  );
};

export default TagFilter;
