import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import '../styles/TagFilter.css';

// Интерфейс упрощаем обратно
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

  // Эти пропсы оставляем для совместимости, но не используем внутри
  selectedCoop?: string;
  onCoopChange?: (coop: string) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  allGenres, selectedGenres, excludedGenres, onGenreToggle,
  allTags, allSubgenres, selectedTags, excludedTags, onTagToggle
}) => {
  const [isGenresOpen, setGenresOpen] = useState(true);
  const [isSubgenresOpen, setSubgenresOpen] = useState(false);
  const [isTagsOpen, setTagsOpen] = useState(false);

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
    onToggle: (item: string) => void
  ) => {
    const filteredItems = items.filter(item => 
      item.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <div className="filter-section">
        <button className="filter-header" onClick={toggleOpen}>
          <span>{title} <span style={{ opacity: 0.5 }}>({items.length})</span></span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="filter-content">
            <div className="search-input-wrapper">
              <Search size={14} className="search-icon" />
              <input 
                type="text" 
                className="tag-search-input"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <div className="tags-cloud">
              {filteredItems.map(item => {
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
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tag-filter-container">
      {renderSection("Genres", allGenres, isGenresOpen, () => setGenresOpen(!isGenresOpen), genreSearch, setGenreSearch, selectedGenres, excludedGenres, onGenreToggle)}
      {renderSection("Subgenres", allSubgenres, isSubgenresOpen, () => setSubgenresOpen(!isSubgenresOpen), subgenreSearch, setSubgenreSearch, selectedTags, excludedTags, onTagToggle)}
      {renderSection("Tags", allTags, isTagsOpen, () => setTagsOpen(!isTagsOpen), tagSearch, setTagSearch, selectedTags, excludedTags, onTagToggle)}
    </div>
  );
};

export default TagFilter;
