"use client";

import { useState, useMemo } from "react";
import { faIconsLibrary } from "@/Utils/faIconsLibrary";
import { getCategoryIcon } from "@/Utils/categoryIconMap";
import { X } from "lucide-react";

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onSelectIcon,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) return faIconsLibrary;

    const term = searchTerm.toLowerCase();
    return faIconsLibrary.filter(
      (icon) =>
        icon.label.toLowerCase().includes(term) ||
        icon.name.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  const handleSelectIcon = (iconName: string) => {
    onSelectIcon(iconName);
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Icon</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search icons (e.g., heart, star, diamond)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            autoFocus
          />
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {filteredIcons.map((icon) => {
            const IconComponent = getCategoryIcon(icon.name);
            const isSelected = selectedIcon === icon.name;

            return (
              <button
                key={icon.name}
                onClick={() => handleSelectIcon(icon.name)}
                title={`${icon.label} (${icon.name})`}
                className={`p-3 rounded border-2 transition ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {IconComponent ? (
                  <IconComponent className="mx-auto text-2xl" />
                ) : (
                  <div className="text-xs text-gray-400">N/A</div>
                )}
              </button>
            );
          })}
        </div>

        {filteredIcons.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No icons found matching `&quot;`{searchTerm}`&quot;`
          </div>
        )}
      </div>
    </div>
  );
};

export default IconPicker;
