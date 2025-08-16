// RadioGroup.jsx
import React from "react";

const RadioGroup = ({ label, name, value, options, onChange }) => {
  return (
    <div className={`flex flex-1 flex-col mt-3 `}>
      <label className="font-medium mb-1">{label}</label>

      <div className={`flex gap-4`}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="accent-blue-500 cursor-pointer"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
