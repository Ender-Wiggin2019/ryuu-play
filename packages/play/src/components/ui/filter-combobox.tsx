import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type FilterOption = {
  label: string;
  value: string;
};

type FilterComboboxProps = {
  className?: string;
  emptyText?: string;
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  options: FilterOption[];
  placeholder: string;
  searchPlaceholder?: string;
  value: string | string[];
};

function isSelected(value: string | string[], optionValue: string): boolean {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
}

export function FilterCombobox(props: FilterComboboxProps): JSX.Element {
  const {
    className,
    emptyText = 'No items found.',
    multiple = false,
    onChange,
    options,
    placeholder,
    searchPlaceholder = 'Search...',
    value
  } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return options;
    }
    return options.filter(option => option.label.toLowerCase().includes(keyword));
  }, [options, query]);

  const selectedOptions = useMemo(() => {
    return options.filter(option => isSelected(value, option.value));
  }, [options, value]);

  const toggleValue = (optionValue: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      onChange(
        current.includes(optionValue)
          ? current.filter(item => item !== optionValue)
          : current.concat(optionValue)
      );
      return;
    }

    onChange(optionValue);
    setOpen(false);
  };

  const clearValue = () => {
    onChange(multiple ? [] : '');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="h-auto min-h-10 w-full justify-between px-3 py-2"
        onClick={() => setOpen(current => !current)}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-left">
          {selectedOptions.length === 0 && (
            <span className="truncate text-sm text-muted-foreground">{placeholder}</span>
          )}
          {multiple && selectedOptions.length > 0 && selectedOptions.map(option => (
            <Badge key={option.value} variant="secondary" className="max-w-full truncate">
              {option.label}
            </Badge>
          ))}
          {!multiple && selectedOptions[0] && (
            <span className="truncate text-sm">{selectedOptions[0].label}</span>
          )}
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="border-b p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-auto p-1">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
            )}
            {filteredOptions.map(option => {
              const selected = isSelected(value, option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                    selected && 'bg-accent/60'
                  )}
                  onClick={() => toggleValue(option.value)}
                >
                  <span className="flex size-4 items-center justify-center">
                    {selected && <Check className="size-4" />}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t p-2">
            <span className="text-xs text-muted-foreground">
              {multiple ? `${selectedOptions.length} selected` : selectedOptions[0]?.label || 'Nothing selected'}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={clearValue}>
              <X className="mr-1 size-4" />
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

