import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Check, Ban, ListFilter, Hash, Gamepad, Settings2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Убедись, что путь правильный!
import '../styles/TagFilter.css';

interface TagFilterProps {
  allGenres: string[]; selectedGenres: string[]; excludedGenres: string[]; onGenreToggle: (genre: string) => void;
  allTags: string[]; allSubgenres: string[]; selectedTags: string[]; excludedTags: string[]; onTagToggle: (tag: string) => void;
  filterMode: 'AND' | 'OR';
  onToggleMode: () => void;
}

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
  // Сохраняем состояние секций
  const [sectionsState, setSectionsState] = useLocalStorage<SectionsState>('tagFilterSections_v1', {
    genres: true, subgenres: true, tags: false
  });

  const [genreSearch, setGenreSearch] = useState('');
  const [subgenreSearch, setSubgenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const toggleSection = (key: keyof SectionsState) => {
      setSectionsState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSection = (title: string, items: string[], key: keyof SectionsState, search: string, setSearch: (v:string)=>void, sel: string[], excl: string[], onToggle: (v:string)=>void, icon: React.ReactNode) => {
    const isOpen = sectionsState[key];
    const filtered = items.filter(i => i.toLowerCase().includes(search.toLowerCase()));

    return (
      <div className="filter-section">
        <div className="filter-header" onClick={() => toggleSection(key)}>
           <div className="filter-title">{icon}<span>{title}</span><span className="count-badge">{items.length}</span></div>
           {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {isOpen && (
          <div className="filter-body">
            <div className="filter-search">
              <Search size={14} />
              <input type="text" placeholder={`Find ${title}...`} value={search} onChange={e => setSearch(e.target.value)} onClick={e => e.stopPropagation()} />
              {search && <button className="clear-search" onClick={e => {e.stopPropagation(); setSearch('')}}>×</button>}
            </div>
            <div className="tags-cloud">
              {filtered.length > 0 ? filtered.map(item => {
                  const isSel = sel.includes(item);
                  const isExcl = excl.includes(item);
                  let cls = "filter-tag" + (isSel ? " active" : "") + (isExcl ? " excluded" : "");
                  return (
                    <button key={item} className={cls} onClick={() => onToggle(item)}>
                      {isSel && <Check size={12} strokeWidth={3} />}
                      {isExcl && <Ban size={12} strokeWidth={3} />}
                      {item}
                    </button>
                  );
              }) : <div className="no-results">No matches</div>}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tag-filter-container">
      {/* Переключатель режимов */}
      <div className="filter-mode-control" style={{ padding: '0 10px 15px', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>
            <Settings2 size={14} /><span>Search Logic (Tags)</span>
         </div>
         <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: '6px', padding: '2px' }}>
            <button onClick={onToggleMode} style={{ flex: 1, padding: '6px', background: filterMode === 'AND' ? '#3b82f6' : 'transparent', color: filterMode === 'AND' ? 'white' : '#666', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Strict (AND)</button>
            <button onClick={onToggleMode} style={{ flex: 1, padding: '6px', background: filterMode === 'OR' ? '#3b82f6' : 'transparent', color: filterMode === 'OR' ? 'white' : '#666', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Flexible (OR)</button>
         </div>
      </div>

      {renderSection("Genres", allGenres, 'genres', genreSearch, setGenreSearch, selectedGenres, excludedGenres, onGenreToggle, <Gamepad size={18} />)}
      {renderSection("Subgenres", allSubgenres, 'subgenres', subgenreSearch, setSubgenreSearch, selectedTags, excludedTags, onTagToggle, <ListFilter size={18} />)}
      {renderSection("Tags", allTags, 'tags', tagSearch, setTagSearch, selectedTags, excludedTags, onTagToggle, <Hash size={18} />)}
    </div>
  );
};
export default TagFilter;
