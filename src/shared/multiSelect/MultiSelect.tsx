import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import './MultiSelect.scss'; // Import the SCSS file

interface MultiSelectProps {
  options: string[]; // Array of options to display
  placeholder?: string; // Placeholder text for the input
  maxLines?: number; // Maximum number of lines for the selected values
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, placeholder, maxLines = 1 }) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1); // Track focused position for input
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedValuesRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  // Handle selecting an option
  const handleSelect = (option: string) => {
    if (!selectedValues.includes(option)) {
      const newSelectedValues = [...selectedValues];
      if (focusedIndex !== -1) {
        // Insert the new option at the focused index
        newSelectedValues.splice(focusedIndex + 1, 0, option);
      } else {
        // Add the new option to the end
        newSelectedValues.push(option);
      }
      setSelectedValues(newSelectedValues);
    }
    setInputValue('');
    setFocusedIndex(-1); // Reset focus after selection
    // Do not close the dropdown
  };

  // Handle removing a selected option
  const handleRemove = (index: number) => {
    const newSelectedValues = selectedValues.filter((_, i) => i !== index);
    setSelectedValues(newSelectedValues);
    if (focusedIndex >= newSelectedValues.length) {
      setFocusedIndex(newSelectedValues.length - 1); // Adjust focus if removed item was last
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowLeft') {
      // Move input to the left
      if (focusedIndex > -1) {
        setFocusedIndex(focusedIndex - 1);
      }
    } else if (e.key === 'ArrowRight') {
      // Move input to the right
      if (focusedIndex < selectedValues.length - 1) {
        setFocusedIndex(focusedIndex + 1);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && focusedIndex !== -1) {
      // Remove the selected option to the left of the input
      handleRemove(focusedIndex);
      setFocusedIndex(focusedIndex - 1); // Move focus left after removal
    } else if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
      // Select the first filtered option on Enter
      handleSelect(filteredOptions[0]);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Scroll the selected values container horizontally
      if (selectedValuesRef.current) {
        const scrollAmount = e.key === 'ArrowLeft' ? -50 : 50;
        selectedValuesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Focus the input when it moves
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [focusedIndex]);

  // Filter options based on input value and already selected values
  const filteredOptions = options.filter(
    (option) =>
      !selectedValues.includes(option) &&
      option.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="multi-select">
      <div
        className={classNames('selected-values', { 'single-line': maxLines === 1 })}
        ref={selectedValuesRef}
      >
        {selectedValues.map((value, index) => (
          <React.Fragment key={index}>
            <div
              className={classNames('selected-value', {
                focused: index === focusedIndex,
              })}
              onClick={() => setFocusedIndex(index)}
            >
              {value}
              <button onClick={() => handleRemove(index)}>&times;</button>
            </div>
            {index === focusedIndex && (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                onFocus={() => setIsOpen(true)}
                className="small-input"
              />
            )}
          </React.Fragment>
        ))}
        {(focusedIndex === -1 || focusedIndex === selectedValues.length) && (
          <input
            ref={focusedIndex === -1 ? inputRef : undefined}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            onFocus={() => setIsOpen(true)}
            className="small-input"
          />
        )}
      </div>
      {isOpen && (
        <div className="options-list">
          {filteredOptions.map((option) => (
            <div
              key={option}
              className="option"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;