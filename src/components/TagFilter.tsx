import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Check, Ban, ListFilter, Hash, Gamepad, Settings2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Убедись, что путь к хуку правильный
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

  // Режим поиска
  filterMode: 'AND' | 'OR';
  onToggleMode: () => void;
}

// Интерфейс для состояния секций (свернуто/развернуто)
interface SectionsState {
  genres: boolean;
  subgenres: boolean;
  tags: boolean;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  allGenres, selectedGenres, excludedGenres, onGenreToggle,
  allTags, allSubgenres, selectedTags, excludedTags, onTagToggle,
  filterMode, onToggleMode
}) => {
  // ИСПОЛЬЗУЕМ LOCAL STORAGE ДЛЯ СОХРАНЕНИЯ СОСТОЯНИЯ СЕКЦИЙ
  const [sectionsState, setSectionsState] = useLocalStorage<SectionsState>('tagFilterSections_v1', {
    genres: true,     // По умолчанию открыто
    subgenres: true,  // По умолчанию открыто
    tags: false       // По умолчанию закрыто
  });

  // Состояния поиска оставляем локальными (сбрасываются при перезагрузке)
  const [genreSearch, setGenreSearch] = useState('');
  const [subgenreSearch, setSubgenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Функция переключения видимости секции
  const toggleSection = (section: keyof SectionsState) => {
    setSectionsState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Универсальная функция рендера секции
  const renderSection = (
    title: string,
    items: string[],
    sectionKey: keyof SectionsState, // Ключ секции для доступа к стейту
    searchValue: string,
    setSearchValue: (val: string) => void,
    selectedList: string[],
    excludedList: string[],
    onToggle: (item: string) => void,
    icon: React.ReactNode
  ) => {
    const isOpen = sectionsState[sectionKey];
    
    const filteredItems = items.filter(item => 
      item.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <div className="filter-section">
        <div className="filter-header" onClick={() => toggleSection(sectionKey)}>
           <div className="filter-title">
             {icon}
             <span>{title}</span>
             <span className="count-badge">{items.length}</span>
           </div>
           {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {isOpen && (
          <div className="filter-body">
            {/* Поле поиска */}
            <div className="filter-search">
              <Search size={14} />
              <input 
                type="text" 
                placeholder={`Find ${title}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchValue && (
                <button className="clear-search" onClick={(e) => { e.stopPropagation(); setSearchValue(''); }}>×</button>
              )}
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
                      {isSelected && <Check size={12} strokeWidth={3} />}
                      {isExcluded && <Ban size={12} strokeWidth={3} />}
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
    <div className="tag-filter-container">
      {/* БЛОК ПЕРЕКЛЮЧЕНИЯ РЕЖИМА ПОИСКА */}
      <div className="filter-mode-control" style={{ padding: '0 10px 15px', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>
            <Settings2 size={14} />
            <span>Search Logic (Tags & Subgenres)</span>
         </div>
         <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: '6px', padding: '2px' }}>
            <button 
              onClick={onToggleMode}
              style={{ 
                flex: 1, 
                padding: '6px', 
                background: filterMode === 'AND' ? '#3b82f6' : 'transparent',
                color: filterMode === 'AND' ? 'white' : '#666',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Strict (AND)
            </button>
            <button 
               onClick={onToggleMode}
               style={{ 
                flex: 1, 
                padding: '6px', 
                background: filterMode === 'OR' ? '#3b82f6' : 'transparent',
                color: filterMode === 'OR' ? 'white' : '#666',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Flexible (OR)
            </button>
         </div>
      </div>

      {/* 1. Секция Жанров */}
      {renderSection(
        "Genres",
        allGenres,
        'genres', // Ключ секции
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
        'subgenres', // Ключ секции
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
        'tags', // Ключ секции
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
