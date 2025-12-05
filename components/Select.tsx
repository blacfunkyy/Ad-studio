import React from 'react';

type Option = string | { value: string; label: string };

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

const Select: React.FC<SelectProps> = ({ label, value, onChange, options }) => {
  return (
    <div className="w-full group">
      <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl shadow-sm pl-4 pr-10 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 appearance-none hover:border-gray-300 cursor-pointer"
        >
            {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            return (
                <option key={value} value={value} className="bg-white text-gray-900 py-2">
                {label}
                </option>
            )
            })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-indigo-500 transition-colors">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;