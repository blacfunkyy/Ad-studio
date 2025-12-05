import React, { ReactNode } from 'react';

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  isTextArea?: boolean;
  icon?: ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  isTextArea = false,
  icon,
}) => {
  const baseClasses = "w-full bg-white border border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300";
  const paddingClass = icon ? "pl-11 pr-4 py-3" : "px-4 py-3";

  return (
    <div className="w-full group">
      <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">
        {label} {required && <span className="text-indigo-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                {icon}
            </div>
        )}
        {isTextArea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            required={required}
            rows={3}
            className={`${baseClasses} px-4 py-3 min-h-[80px] resize-y`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            required={required}
            className={`${baseClasses} ${paddingClass}`}
          />
        )}
      </div>
    </div>
  );
};

export default Input;