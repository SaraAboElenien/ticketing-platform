/**
 * Input — form input with label, optional left icon, and inline error.
 * Uses field-input styling (TicketHub dark theme). Compatible with react-hook-form register().
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Left-side icon (emoji or character) for field-input style */
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, id, className = '', ...rest }, ref) => {
    const inputId = id || rest.name;
    const inputClass = `
      field-input block w-full py-[13px] pr-4 text-[0.9rem]
      disabled:cursor-not-allowed disabled:opacity-60
      ${icon ? 'pl-[3.25rem]' : 'pl-4'}
      ${error ? 'border-[rgba(248,81,73,.5)]' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-[0.8rem] font-medium text-[rgba(248,249,255,.45)] mb-2 tracking-[0.01em]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[0.9rem] pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClass}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...rest}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-[0.8rem] text-[#F87171] mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
