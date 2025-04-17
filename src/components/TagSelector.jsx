import React from "react";

const tagColors = [
  "#9b23ea", "#5f72bd", "#e74c3c", "#f1c40f", "#27ae60", "#2980b9", "#e67e22"
];

export default function TagSelector({ tags, selectedTags, onChange, allowCreate = true }) {
  const [input, setInput] = React.useState("");

  function handleInput(e) {
    setInput(e.target.value);
  }
  function handleKeyDown(e) {
    if (e.key === "Enter" && input.trim()) {
      if (!tags.includes(input.trim())) {
        onChange([...selectedTags, input.trim()]);
      }
      setInput("");
      e.preventDefault();
    }
  }
  function handleTagClick(tag) {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  }

  return (
    <div className="tag-selector">
      <div className="tag-list">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className={`tag-chip${selectedTags.includes(tag) ? " selected" : ""}`}
            style={{ background: tagColors[i % tagColors.length] }}
            onClick={() => handleTagClick(tag)}
            tabIndex={0}
            aria-label={`Tag ${tag}`}
          >
            {tag}
          </span>
        ))}
        {allowCreate && (
          <input
            className="tag-input"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Add tag"
            aria-label="Add tag"
          />
        )}
      </div>
    </div>
  );
}
