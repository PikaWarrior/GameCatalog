import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, Check, Ban, ListFilter, Hash, Gamepad } from 'lucide-react';
import '../styles/TagFilter.css';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Используем твой хук

interface TagFilterProps {
  allGenres: string[];
  selectedGenres: string[];
  excludedGenres: string[];
  onGenreToggle: (genre: string) => void;
  allTags: string[];
  allSubgenres: string[];
  selectedTags: string[];
  excludedTags: string[];
  onTagToggle: (tag: string) => void;
  filterMode: 'AND' | 'OR';
  onFilterModeChange: (mode: 'AND' | 'OR') => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  allGenres,
  selectedGenres,
  excludedGenres,
  onGenreToggle,
  allTags,
  allSubgenres,
  selectedTags,
  excludedTags,
  onTagToggle,
  filterMode,
  onFilterModeChange,
}) => {
  // 🆕 Используем useLocalStorage для сохранения состояния секций
  // Если у тебя нет useLocalStorage экспортируемого так, замени на обычный useEffect + localStorage
  
  // Пример с использованием localStorage напрямую (безопаснее, если хук не доступен в этом файле)
  const [isGenresOpen, setGenresOpen] = useState(() => {
    const saved = localStorage.getItem('filter_genres_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [isSubgenresOpen, setSubgenresOpen] = useState(() => {
    const saved = localStorage.getItem('filter_subgenres_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [isTagsOpen, setTagsOpen] = useState(() => {
    const saved = localStorage.getItem('filter_tags_open');
    return saved !== null ? JSON.parse(saved) : false; // Tags закрыты по умолчанию
  });

  // Эффекты для сохранения
  useEffect(() => { localStorage.setItem('filter_genres_open', JSON.stringify(isGenresOpen)); }, [isGenresOpen]);
  useEffect(() => { localStorage.setItem('filter_subgenres_open', JSON.stringify(isSubgenresOpen)); }, [isSubgenresOpen]);
  useEffect(() => { localStorage.setItem('filter_tags_open', JSON.stringify(isTagsOpen)); }, [isTagsOpen]);

  const [genreSearch, setGenreSearch] = useState('');
  const [subgenreSearch, setSubgenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

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
                onChange={e => setSearchValue(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              {searchValue && (
                <button
                  className="clear-search"
                  onClick={e => {
                    e.stopPropagation();
                    setSearchValue('');
                  }}
                >
                  ×
                </button>
              )}
            </div>

            <div className="tags-cloud">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const isSelected = selectedList.includes(item);
                  const isExcluded = excludedList.includes(item);

                  let btnClass = 'filter-tag';
                  if (isSelected) btnClass += ' active';
                  else if (isExcluded) btnClass += ' excluded';

                  let titleText = 'Click to include (Green)';
                  if (isSelected) titleText = 'Click to exclude (Red)';
                  if (isExcluded) titleText = 'Click to reset';

                  return (
                    <button
                      key={item}
                      className={btnClass}
                      onClick={() => onToggle(item)}
                      title={titleText}
                    >
                      {isSelected && <Check size={12} className="tag-icon check" />}
                      {isExcluded && <Ban size={12} className="tag-icon ban" />}
                      <span>{item}</span>
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
      {/* Переключатель AND/OR */}
      <div className="filter-mode-toggle">
        <button
          className={`mode-btn ${filterMode === 'AND' ? 'active' : ''}`}
          onClick={() => onFilterModeChange('AND')}
          title="Показывать только игры с ВСЕМИ выбранными тегами/жанрами"
        >
          Все
        </button>
        <button
          className={`mode-btn ${filterMode === 'OR' ? 'active' : ''}`}
          onClick={() => onFilterModeChange('OR')}
          title="Показывать игры с ЛЮБЫМ из выбранных тегов/жанров"
        >
          Любой
        </button>
      </div>

      {renderSection(
        'Genres',
        allGenres,
        isGenresOpen,
        () => setGenresOpen(!isGenresOpen),
        genreSearch,
        setGenreSearch,
        selectedGenres,
        excludedGenres,
        onGenreToggle,
        <Gamepad size={18} className="section-icon" />
      )}

      {renderSection(
        'Subgenres',
        allSubgenres,
        isSubgenresOpen,
        () => setSubgenresOpen(!isSubgenresOpen),
        subgenreSearch,
        setSubgenreSearch,
        selectedTags,
        excludedTags,
        onTagToggle,
        <ListFilter size={18} className="section-icon" />
      )}

      {renderSection(
        'Tags',
        allTags,
        isTagsOpen,
        () => setTagsOpen(!isTagsOpen),
        tagSearch,
        setTagSearch,
        selectedTags,
        excludedTags,
        onTagToggle,
        <Hash size={18} className="section-icon" />
      )}
    </div>
  );
};

export default TagFilter;
