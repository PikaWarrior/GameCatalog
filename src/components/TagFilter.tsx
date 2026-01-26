import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Check, Ban, ListFilter, Hash, Gamepad2, Layers } from 'lucide-react';
import '../styles/TagFilter.css';

interface TagFilterProps {
  // Пропсы для Жанров
  allGenres: string[];
  selectedGenres: string[];
  excludedGenres: string[];
  onGenreToggle: (genre: string) => void;

  // Пропсы для Тегов и Поджанров
  allTags: string[];
  allSubgenres: string[];
  selectedTags: string[];
  excludedTags: string[];
  onTagToggle: (tag: string) => void;

  // --- НОВЫЕ ПРОПСЫ ---
  selectedCoop: string;
  onCoopChange: (coop: string) => void;
  
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  allGenres, selectedGenres, excludedGenres, onGenreToggle,
  allTags, allSubgenres, selectedTags, excludedTags, onTagToggle,
  selectedCoop, onCoopChange,
  sortBy, onSortChange
}) => {
  // Состояния открытия секций
  const [isGenresOpen, setGenresOpen] = useState(true);
  const [isSubgenresOpen, setSubgenresOpen] = useState(false);
  const [isTagsOpen, setTagsOpen] = useState(false);

  // Состояния поиска
  const [genreSearch, setGenreSearch] = useState('');
  const [subgenreSearch, setSubgenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Универсальная функция рендера секции
  const renderSection = (
    title: string,
    items: string[],
    isOpen: boolean,
    toggleOpen: () => void,
    searchValue: string,
    setSearchValue: (val: string) => void,
    selectedList: string[],
    excludedList: string[],
    onToggle: (item: string) => void,
    icon: React.ReactNode
  ) => {
    const filteredItems = items.filter(item => 
      item.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <div className="filter-section">
        {/* Заголовок секции */}
        <button className="filter-header" onClick={toggleOpen}>
          <div className="filter-title-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon}
            <span>{title}</span>
            <span className="count-badge" style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>
              {items.length}
            </span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Контент секции */}
        {isOpen && (
          <div className="filter-content">
            {/* Поле поиска */}
            <div className="search-input-wrapper">
              <Search size={14} className="search-icon" style={{ opacity: 0.5 }} />
              <input 
                type="text" 
                className="tag-search-input"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            {/* Облако кнопок */}
            <div className="tags-cloud">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const isSelected = selectedList.includes(item);
                  const isExcluded = excludedList.includes(item);
                  
                  let btnClass = "filter-tag";
                  if (isSelected) btnClass += " active";
                  else if (isExcluded) btnClass += " excluded";

                  return (
                    <button
                      key={item}
                      className={btnClass}
                      onClick={() => onToggle(item)}
                      title={isSelected ? "Click to exclude" : isExcluded ? "Click to reset" : "Click to include"}
                    >
                      {item}
                    </button>
                  );
                })
              ) : (
                <div style={{ padding: '8px', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
                  No matches
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tag-filter-container">
      
      {/* --- БЛОК 1: GAME MODE --- */}
      <div className="filter-group">
        <div className="filter-group-title">Game Mode</div>
        <select 
          className="custom-select"
          value={selectedCoop}
          onChange={(e) => onCoopChange(e.target.value)}
        >
          <option value="All">All Modes</option>
          <option value="Single">Single Player</option>
          <option value="Multiplayer">Multiplayer</option>
          <option value="Co-op">Co-op</option>
          <option value="Split Screen">Split Screen</option>
          <option value="Co-op & Multiplayer">Co-op & Multiplayer</option>
        </select>
      </div>

      {/* --- БЛОК 2: SORT BY --- */}
      <div className="filter-group">
        <div className="filter-group-title">Sort By</div>
        <select 
          className="custom-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="name">Name (A-Z)</option>
          <option value="genre">Genre</option>
          <option value="coop">Mode</option>
        </select>
      </div>

      <div className="filter-divider" style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />

      {/* --- БЛОК 3: GENRES --- */}
      {renderSection(
        "Genres",
        allGenres,
        isGenresOpen,
        () => setGenresOpen(!isGenresOpen),
        genreSearch,
        setGenreSearch,
        selectedGenres,
        excludedGenres,
        onGenreToggle,
        <Gamepad2 size={16} />
      )}

      {/* --- БЛОК 4: SUBGENRES --- */}
      {renderSection(
        "Subgenres",
        allSubgenres,
        isSubgenresOpen,
        () => setSubgenresOpen(!isSubgenresOpen),
        subgenreSearch,
        setSubgenreSearch,
        selectedTags,
        excludedTags,
        onTagToggle,
        <Layers size={16} />
      )}

      {/* --- БЛОК 5: TAGS --- */}
      {renderSection(
        "Tags",
        allTags,
        isTagsOpen,
        () => setTagsOpen(!isTagsOpen),
        tagSearch,
        setTagSearch,
        selectedTags,
        excludedTags,
        onTagToggle,
        <Hash size={16} />
      )}
    </div>
  );
};

export default TagFilter;
