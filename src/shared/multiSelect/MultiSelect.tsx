import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import './MultiSelect.scss'; // Import the SCSS file

interface MultiSelectProps {
  options: string[]; // Array of options to display
  placeholder?: string; // Placeholder text for the input
  maxLines?: number; // Maximum number of lines for the selected values
  allowCustomOptions?: boolean; // Allow users to add custom options
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  placeholder,
  maxLines = 1,
  allowCustomOptions = false, // Default to false
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1); // Track focused position for input
  const [inputWidth, setInputWidth] = useState<number>(2); // Initial width of the input
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedValuesRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hiddenSpanRef = useRef<HTMLSpanElement>(null);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true); // Keep the dropdown open while typing
  };

  // Update input width based on its content
  useEffect(() => {
    if (hiddenSpanRef.current && inputRef.current) {
      // Measure the width of the input's value using a hidden span
      hiddenSpanRef.current.textContent = inputValue || placeholder || '';
      const newWidth = hiddenSpanRef.current.offsetWidth + 4; // Add some padding
      setInputWidth(newWidth);
      inputRef.current.style.width = `${newWidth}px`;
    }
  }, [inputValue, placeholder]);

  // Handle selecting an option
  const handleSelect = (option: string) => {
    if (!selectedValues.includes(option)) {
      const newSelectedValues = [...selectedValues];
      if (focusedIndex !== -1) {
        // Insert the new option at the focused index + 1
        newSelectedValues.splice(focusedIndex + 1, 0, option);
        setFocusedIndex(focusedIndex + 1); // Move focus to the newly inserted option
      } else {
        // Add the new option to the end
        newSelectedValues.push(option);
        setFocusedIndex(newSelectedValues.length - 1); // Move focus to the newly added option
      }
      setSelectedValues(newSelectedValues);
    }
    setInputValue('');
    setIsOpen(true); // Keep the dropdown open
    if (inputRef.current) {
      inputRef.current.focus(); // Keep the input focused
    }
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
    } else if (e.key === 'Enter') {
      if (inputValue.trim() !== '') {
        if (allowCustomOptions && !options.includes(inputValue)) {
          // Add the custom option to the selected values
          handleSelect(inputValue);
        } else if (isOpen && filteredOptions.length > 0) {
          // Select the first filtered option on Enter
          handleSelect(filteredOptions[0]);
        }
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Scroll the selected values container horizontally
      if (selectedValuesRef.current) {
        const scrollAmount = e.key === 'ArrowLeft' ? -50 : 50;
        selectedValuesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Handle mouse click to move the input
  const handleMouseClick = (index: number) => {
    setFocusedIndex(index);
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input when clicking on a selected option
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Use setTimeout to check the active element after the blur event
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false); // Hide the dropdown if focus is outside the component
      }
    }, 0);
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
    <div className="multi-select" ref={dropdownRef}>
      {/* Hidden span to measure the width of the input's value */}
      <span
        ref={hiddenSpanRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          fontSize: 'inherit',
          fontFamily: 'inherit',
        }}
      />
      <div
        className={classNames('selected-values', { 'single-line': maxLines === 1 })}
        ref={selectedValuesRef}
      >
        {/* Render the input before the first selected option if focusedIndex is -1 */}
        {focusedIndex === -1 && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            onFocus={() => setIsOpen(true)}
            className="small-input"
            style={{ width: `${inputWidth}px` }} // Set dynamic width
          />
        )}
        {selectedValues.map((value, index) => (
          <React.Fragment key={index}>
            <div
              className={classNames('selected-value', {
                focused: index === focusedIndex,
              })}
              onClick={() => handleMouseClick(index)}
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
                onBlur={handleInputBlur}
                placeholder={placeholder}
                onFocus={() => setIsOpen(true)}
                className="small-input"
                style={{ width: `${inputWidth}px` }} // Set dynamic width
              />
            )}
          </React.Fragment>
        ))}
        {/* Render the input after the last selected option if focusedIndex is equal to the length */}
        {focusedIndex === selectedValues.length && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            onFocus={() => setIsOpen(true)}
            className="small-input"
            style={{ width: `${inputWidth}px` }} // Set dynamic width
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
          {allowCustomOptions &&
            inputValue.trim() !== '' &&
            !options.includes(inputValue) && (
              <div
                className="option custom-option"
                onClick={() => handleSelect(inputValue)}
              >
                Add "{inputValue}"
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;