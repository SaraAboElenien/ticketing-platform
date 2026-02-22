/**
 * Input — form input with label and inline error display.
 * TicketHub dark theme: bg-bg2, muted placeholder, purple focus ring.
 * Compatible with react-hook-form's register().
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...rest }, ref) => {
    const inputId = id || rest.name;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-[0.82rem] font-medium text-[rgba(248,249,255,.45)] mb-[7px] tracking-[0.01em]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full px-4 py-[13px] bg-bg2 border border-[rgba(255,255,255,.07)] rounded-[10px]
            text-[#F8F9FF] font-outfit text-[0.92rem] outline-none
            placeholder-[rgba(248,249,255,.2)]
            focus:border-[rgba(124,58,237,.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.12)]
            disabled:cursor-not-allowed disabled:opacity-60
            transition-all
            ${error ? 'border-[rgba(248,81,73,.5)] focus:border-danger-500 focus:shadow-[0_0_0_3px_rgba(248,81,73,.2)]' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
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
