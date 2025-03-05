import React, { useState, useEffect, useCallback, memo } from "react";

interface Option {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioSelectorProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  compact?: boolean;
  showDescription?: boolean;
  columns?: number;
}

// Мемоизированный компонент радио-кнопки для оптимизации рендеринга
const RadioOption = memo(
  ({
    option,
    isSelected,
    onClick,
    compact,
    showDescription = true,
  }: {
    option: Option;
    isSelected: boolean;
    onClick: () => void;
    compact?: boolean;
    showDescription?: boolean;
  }) => {
    const hasLongLabel = option.label.length > 10;
    const isDisabled = option.disabled === true;

    return (
      <label
        className={`
          block p-3 rounded-lg border cursor-pointer transition-all relative overflow-hidden
          ${isSelected 
            ? 'border-indigo-300 bg-indigo-50 shadow-sm' 
            : 'border-gray-200 bg-white hover:bg-gray-50'}
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
          ${compact ? 'p-2 text-sm' : ''}
        `}
        onClick={isDisabled ? undefined : onClick}
      >
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="radio"
              name="radio-option"
              checked={isSelected}
              onChange={() => {}}
              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              disabled={isDisabled}
            />
          </div>
          <div className="ml-3 text-sm">
            <div className={`font-medium text-gray-800 ${compact ? 'text-sm' : ''}`}>
              {option.label}
            </div>
            {option.description && showDescription && (
              <p className={`text-gray-500 ${compact ? 'text-xs mt-0.5' : 'mt-1'}`}>
                {option.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Скрытый радио-элемент для доступности и состояния формы */}
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={isSelected}
          onChange={() => {}}
          style={{ position: "absolute", opacity: 0, zIndex: -1 }}
          tabIndex={-1}
          disabled={isDisabled}
        />
      </label>
    );
  }
);

RadioOption.displayName = "RadioOption";

// Основной компонент RadioSelector
export function RadioSelector({
  options,
  value,
  onChange,
  name,
  compact = false,
  showDescription = true,
  columns,
}: RadioSelectorProps) {
  // Состояние для отслеживания рендеринга на клиенте
  const [mounted, setMounted] = useState(false);

  // Эффект для защиты от проблем гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

  // Оптимизированный обработчик изменения с мемоизацией
  const handleOptionClick = useCallback(
    (optionValue: string) => () => {
      // Проверяем, что значение действительно изменилось
      if (value !== optionValue) {
        onChange(optionValue);
      }
    },
    [onChange, value]
  );

  // Определяем стили сетки на основе количества колонок
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: columns 
      ? `repeat(${columns}, 1fr)` 
      : options.length <= 2 
        ? `repeat(${options.length}, 1fr)` 
        : "repeat(auto-fit, minmax(200px, 1fr))",
    gap: compact ? '0.5rem' : '0.75rem'
  };

  if (!mounted) {
    return null; // Не рендерим на сервере для избежания проблем гидратации
  }

  return (
    <div className="animate-fadeIn" style={gridStyle}>
      {options.map((option) => (
        <RadioOption
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onClick={handleOptionClick(option.value)}
          compact={compact}
          showDescription={showDescription}
        />
      ))}
    </div>
  );
}

export default memo(RadioSelector);
