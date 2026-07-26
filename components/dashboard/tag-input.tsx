import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  allUsedTags: string[];
}

const PREDEFINED_TAGS = [
  "Business",
  "Personal",
  "Rent",
  "School",
  "Medical",
  "Travel",
  "Food",
  "Entertainment",
  "Savings",
];

export function TagInput({ tags, setTags, allUsedTags }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      const filteredSuggestions = allUsedTags.filter(
        (tag) =>
          tag.toLowerCase().includes(value.toLowerCase()) &&
          !tags.includes(tag),
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions(PREDEFINED_TAGS.filter((tag) => !tags.includes(tag)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setInputValue("");
        setSuggestions([]);
      }
    } else if (e.key === "Backspace" && !inputValue) {
      const newTags = tags.slice(0, tags.length - 1);
      setTags(newTags);
    }
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setInputValue("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
  };

  useEffect(() => {
    if (inputValue === "") {
      setSuggestions(PREDEFINED_TAGS.filter((tag) => !tags.includes(tag)));
    }
  }, [tags, inputValue]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="rounded-full hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            setSuggestions(PREDEFINED_TAGS.filter((tag) => !tags.includes(tag)))
          }
          placeholder="Add a tag..."
          className="flex-1 bg-transparent outline-none"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 rounded-md border border-border bg-muted p-2">
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  onClick={() => handleAddTag(suggestion)}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
