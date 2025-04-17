import React, { useState, useRef, useEffect } from "react";
import TagSelector from "./TagSelector";
import jsPDF from "jspdf";

function Note({ id, title, content, tags, checklist = [], reminder, onDelete, onEdit, editing, onSaveEdit, onTogglePin, onArchive, archived, pinned, allTags, highlightText, search, selected, onSelect }) {
  const [editMode, setEditMode] = useState(editing);
  const [editNote, setEditNote] = useState({ title, content, tags, checklist, reminder });
  const [copied, setCopied] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const noteRef = useRef(null);

  useEffect(() => {
    setEditMode(editing);
    setEditNote({ title, content, tags, checklist, reminder });
    if (editing && noteRef.current) noteRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [editing, title, content, tags, checklist, reminder]);

  function handleDelete() {
    // Only delete if this note is selected
    if (selected) onDelete(id);
  }

  function handleEdit() {
    setEditMode(true);
    onEdit(id);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setEditNote(prev => ({ ...prev, [name]: value }));
  }

  function handleReminderChange(e) {
    setEditNote(prev => ({ ...prev, reminder: e.target.value }));
  }

  function handleTagsChange(selectedTags) {
    setEditNote(prev => ({ ...prev, tags: selectedTags }));
  }

  function handleChecklistChange(idx, checked) {
    setEditNote(prev => ({
      ...prev,
      checklist: prev.checklist.map((item, i) => i === idx ? { ...item, checked } : item)
    }));
  }

  function handleChecklistText(idx, text) {
    setEditNote(prev => ({
      ...prev,
      checklist: prev.checklist.map((item, i) => i === idx ? { ...item, text } : item)
    }));
  }

  function addChecklistItem() {
    setEditNote(prev => ({
      ...prev,
      checklist: [...(prev.checklist || []), { text: "", checked: false }]
    }));
  }

  function removeChecklistItem(idx) {
    setEditNote(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== idx)
    }));
  }

  function handleSave() {
    if (!editNote.title.trim() && !editNote.content.trim() && (!editNote.checklist || editNote.checklist.length === 0)) return;
    onSaveEdit(id, editNote);
    setEditMode(false);
  }

  function handleCancel() {
    setEditMode(false);
    setEditNote({ title, content, tags, checklist, reminder });
    onSaveEdit(id, { title, content, tags, checklist, reminder });
  }

  function getPlainText() {
    let txt = `Title: ${title}\n`;
    if (content) txt += `Content: ${content}\n`;
    if (checklist && checklist.length > 0) {
      txt += 'Checklist:\n';
      checklist.forEach(item => {
        txt += `- [${item.checked ? 'x' : ' '}] ${item.text}\n`;
      });
    }
    if (tags && tags.length > 0) txt += `Tags: ${tags.join(", ")}`;
    if (reminder) txt += `\nReminder: ${reminder}`;
    return txt;
  }

  function handleCopy() {
    navigator.clipboard.writeText(getPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  function handleExportTxt() {
    const blob = new Blob([getPlainText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportPdf() {
    const doc = new jsPDF();
    let y = 15;
    doc.setFontSize(16);
    doc.text(title || 'Untitled Note', 10, y);
    y += 10;
    doc.setFontSize(12);
    if (content) {
      const lines = doc.splitTextToSize(content, 180);
      doc.text('Content:', 10, y);
      y += 7;
      doc.text(lines, 12, y);
      y += lines.length * 7;
    }
    if (checklist && checklist.length > 0) {
      doc.text('Checklist:', 10, y);
      y += 7;
      checklist.forEach(item => {
        doc.text(`- [${item.checked ? 'x' : ' '}] ${item.text}`, 12, y);
        y += 7;
      });
    }
    if (tags && tags.length > 0) {
      doc.text(`Tags: ${tags.join(', ')}`, 10, y);
      y += 7;
    }
    if (reminder) {
      doc.text(`Reminder: ${reminder}`, 10, y);
      y += 7;
    }
    doc.save(`${title || 'note'}.pdf`);
    setPdfExported(true);
    setTimeout(() => setPdfExported(false), 1400);
  }

  // Reminder display helpers
  const isOverdue = reminder && new Date(reminder) < new Date();

  return (
    <div className={`note-card fade-in${archived ? " archived" : ""}${selected ? " selected" : ""}`} ref={noteRef}>
      <div className="note-card-header">
        <input
          type="checkbox"
          className="note-select-checkbox"
          checked={!!selected}
          onChange={() => onSelect(id)}
          aria-label={selected ? "Deselect note" : "Select note"}
        />
        <div className="note-title-section">
          <h1 className="note-title">{highlightText ? highlightText(title, search) : title}</h1>
          {pinned && <span className="note-pin" title="Pinned">📌</span>}
        </div>
        <div className="note-tags">
          {(tags || []).map(tag => (
            <span key={tag} className="tag-chip" tabIndex={-1}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="note-card-content">
        <p className="note-content">{highlightText ? highlightText(content, search) : content}</p>
        {(checklist && checklist.length > 0) && (
          <ul className="checklist-view">
            {checklist.map((item, idx) => (
              <li key={idx} className={item.checked ? "checked" : ""}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  readOnly
                  tabIndex={-1}
                />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        )}
        {reminder && (
          <div className={`reminder-view${isOverdue ? " overdue" : ""}`} title={isOverdue ? "Reminder overdue!" : "Reminder set"}>
            <span className="reminder-bell">⏰</span>
            <span className="reminder-time">{new Date(reminder).toLocaleString()}</span>
            {isOverdue && <span className="reminder-overdue-label">(Overdue)</span>}
          </div>
        )}
      </div>
      <div className="note-card-actions">
        {/* Only show delete button as enabled if selected */}
        <button className="icon-btn delete-btn" onClick={handleDelete} aria-label="Delete note" title={selected ? "Delete" : "Select to delete"} disabled={!selected}><span>🗑️</span></button>
        <button className="icon-btn edit-btn" onClick={handleEdit} aria-label="Edit note" title="Edit"><span>✎</span></button>
        <button
          className={`icon-btn ${archived ? "unarchive-btn" : "archive-btn"}`}
          onClick={() => onArchive(id)}
          aria-label={archived ? "Unarchive note" : "Archive note"}
          title={archived ? "Unarchive" : "Archive"}
        >
          <span>{archived ? "↩️" : "🗄️"}</span>
        </button>
        <button className="icon-btn copy-btn" onClick={handleCopy} aria-label="Copy note to clipboard" title="Copy">
          <span>{copied ? "✓" : "📋"}</span>
        </button>
        <button className="icon-btn export-btn" onClick={handleExportTxt} aria-label="Export note as text" title="Export as TXT"><span>⬇️</span> TXT</button>
        <button className="icon-btn export-btn" onClick={handleExportPdf} aria-label="Export note as PDF" title="Export as PDF"><span>{pdfExported ? "✓" : "⬇️"}</span> PDF</button>
      </div>
    </div>
  );
}

export default Note;
