import React, { ChangeEvent, useEffect, useState } from 'react';
import { Search } from 'lucide-react'; // Убедитесь, что lucide-react установлен, иначе удалите иконку
import { useDebounce } from '../hooks/useDebounce';
import '../styles/SearchBar.css';

interface SearchBarProps {
  value: string;                  // Добавили обязательное поле value
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  // Локальное состояние для мгновенного отклика инпута
  const [localValue, setLocalValue] = useState(value);

  // Синхронизация при изменении пропса извне (например, при сбросе фильтров)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="search-bar">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        className="search-input"
        placeholder="Search games..."
        value={localValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
