// client/src/components/forms/FormField.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  disabled,
  rows = 3,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {type === 'textarea' ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={error ? 'border-destructive' : ''}
          data-testid={`input-${name}`}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={error ? 'border-destructive' : ''}
          data-testid={`input-${name}`}
        />
      )}
      
      {error && (
        <div className="flex items-center gap-1 text-destructive text-sm">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
