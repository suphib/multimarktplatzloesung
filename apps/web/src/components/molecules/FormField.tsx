import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type BaseProps = {
  label: string;
  error?: string;
  id?: string;
};

type InputFieldProps = BaseProps & {
  type?: 'text' | 'number' | 'date' | 'password';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

type TextareaFieldProps = BaseProps & {
  type: 'textarea';
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

type SelectFieldProps = BaseProps & {
  type: 'select';
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>;

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, error, id, type = 'text', ...rest } = props;
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  const baseClasses =
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100';
  const errorClasses = error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600';

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          className={`${baseClasses} ${errorClasses} min-h-[80px]`}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : type === 'select' ? (
        <select
          id={fieldId}
          className={`${baseClasses} ${errorClasses}`}
          {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {(props as SelectFieldProps).options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          type={type}
          className={`${baseClasses} ${errorClasses}`}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
