import React, { useState, useRef } from 'react';
import './Select.scss';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
}

const Select: React.FC<SelectProps> = ({ options }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setIsDropdownOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && searchTerm === '' && selectedOptions.length > 0) {
      removeOption(selectedOptions.length - 1);
    }
  };

  const selectOption = (option: Option) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const newSearchTerm = [
      searchTerm.slice(0, cursorPosition),
      option.label,
      searchTerm.slice(cursorPosition)
    ].join(' ');
    setSearchTerm(newSearchTerm);
    setSelectedOptions([...selectedOptions, option]);
    setIsDropdownOpen(true); // Keep dropdown open after selection
  };

  const removeOption = (index: number) => {
    const newSelectedOptions = selectedOptions.filter((_, i) => i !== index);
    setSelectedOptions(newSelectedOptions);
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="select-container">
      <div className="select-input">
        <div className="tags">
          {selectedOptions.map((option, index) => (
            <span key={`${option.value}-${index}`} className="tag">
              {option.label}
              <button onClick={() => removeOption(index)}>x</button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
        </div>
      </div>
      {isDropdownOpen && (
        <div className="dropdown-content">
          {filteredOptions.map(option => (
            <div
              key={option.value}
              className="dropdown-item"
              onClick={() => selectOption(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;