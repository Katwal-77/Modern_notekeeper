import React, { useState } from "react";
import TagSelector from "./TagSelector";

function CreateArea({ onAdd, search, setSearch, tags }) {
  const [note, setNote] = useState({
    title: "",
    content: "",
    tags: []
  });
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setNote(prevNote => ({
      ...prevNote,
      [name]: value
    }));
  }

  function handleTagsChange(selectedTags) {
    setNote(prevNote => ({ ...prevNote, tags: selectedTags }));
  }

  function submitNote(event) {
    event.preventDefault();
    if (!note.title.trim() && !note.content.trim()) {
      setError("Note cannot be empty");
      return;
    }
    setError("");
    onAdd(note);
    setNote({ title: "", content: "", tags: [] });
  }

  return (
    <div className="create-area">
      <form autoComplete="off">
        <input
          name="title"
          onChange={handleChange}
          value={note.title}
          placeholder="Title"
          aria-label="Note title"
        />
        <textarea
          name="content"
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows="3"
          aria-label="Note content"
        />
        <TagSelector tags={tags} selectedTags={note.tags} onChange={handleTagsChange} />
        <button
          className="add-btn"
          onClick={submitNote}
          type="submit"
          aria-label="Add note"
        >
          <span className="add-btn-icon">＋</span>
        </button>
        {error && <p className="error-msg">{error}</p>}
      </form>
      <input
        className="search-input"
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search notes..."
        aria-label="Search notes"
      />
    </div>
  );
}

export default CreateArea;
