import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Check, Ban, ListFilter, Hash, Gamepad } from 'lucide-react';
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

  // НОВЫЕ ПРОПСЫ для режима фильтрации
  filterMode: 'AND' | 'OR';
  onFilterModeToggle: () => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  allGenres, selectedGenres, excludedGenres, onGenreToggle,
  allTags, allSubgenres, selectedTags, excludedTags, onTagToggle,
  filterMode, onFilterModeToggle
}) => {
  // Состояния открытия секций
  const [isGenresOpen, setGenresOpen] = useState(true);
  const [isSubgenresOpen, setSubgenresOpen] = useState(true);
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
        <div className="filter-header" onClick={toggleOpen}>
          {icon}
          <span className="filter-title">{title}</span>
          <span className="filter-count">{items.length}</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {isOpen && (
          <div className="filter-content">
            {/* Поле поиска */}
            <div className="search-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="search-input"
              />
              {searchValue && (
                <button
                  className="clear-search"
                  onClick={(e) => { e.stopPropagation(); setSearchValue(''); }}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Облако кнопок */}
            <div className="filter-tags">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const isSelected = selectedList.includes(item);
                  const isExcluded = excludedList.includes(item);

                  let btnClass = "filter-tag";
                  if (isSelected) btnClass += " active";
                  else if (isExcluded) btnClass += " excluded";

                  // Текст подсказки
                  let titleText = "Click to include (Green)";
                  if (isSelected) titleText = "Click to exclude (Red)";
                  if (isExcluded) titleText = "Click to reset";

                  return (
                    <button
                      key={item}
                      className={btnClass}
                      onClick={() => onToggle(item)}
                      title={titleText}
                    >
                      {/* Иконки статуса */}
                      {isSelected && <Check size={12} strokeWidth={3} />}
                      {isExcluded && <Ban size={12} strokeWidth={2.5} />}
                      {item}
                    </button>
                  );
                })
              ) : (
                <div className="no-results">No matches found</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tag-filter">
      {/* НОВЫЙ БЛОК: Переключатель режима фильтрации */}
      <div className="filter-mode-toggle">
        <button
          className={`mode-btn ${filterMode === 'AND' ? 'active' : ''}`}
          onClick={onFilterModeToggle}
          title={filterMode === 'AND' ? 'Current: Show games with ALL selected tags' : 'Current: Show games with ANY selected tag'}
        >
          <ListFilter size={16} />
          <span>Mode: {filterMode}</span>
        </button>
        <div className="mode-description">
          {filterMode === 'AND' 
            ? 'Games must have ALL selected tags' 
            : 'Games must have AT LEAST ONE selected tag'}
        </div>
      </div>

      {/* 1. Секция Жанров */}
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
        <Gamepad size={18} />
      )}

      {/* 2. Секция Поджанров */}
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
        <ListFilter size={18} />
      )}

      {/* 3. Секция Тегов */}
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
        <Hash size={18} />
      )}
    </div>
  );
};

export default TagFilter;
