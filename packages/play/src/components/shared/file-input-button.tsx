import { ChangeEvent, useId } from 'react';

import { Button } from '@/components/ui/button';

type FileInputButtonProps = {
  accept?: string;
  className?: string;
  disabled?: boolean;
  label: string;
  onSelect: (file: File) => Promise<void> | void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
};

export function FileInputButton({
  accept,
  className,
  disabled,
  label,
  onSelect,
  variant = 'outline'
}: FileInputButtonProps): JSX.Element {
  const inputId = useId();

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await onSelect(file);
    event.target.value = '';
  };

  return (
    <label htmlFor={inputId} className={className}>
      <input
        id={inputId}
        className="hidden"
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={event => void onChange(event)}
      />
      <Button asChild variant={variant} disabled={disabled}>
        <span>{label}</span>
      </Button>
    </label>
  );
}
