import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../ThemeContext";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import TagSelector from "./TagSelector";
import confetti from "canvas-confetti";
import "../keeper.css";
import DropboxSync from "./DropboxSync";
import FeaturePanel from "./FeaturePanel";

const defaultTags = ["Personal", "Work", "Idea", "Urgent", "Todo"];

const BADGES = [
  { key: "first_note", icon: "📝", label: "First Note", desc: "Created your first note!" },
  { key: "ten_notes", icon: "🔟", label: "10 Notes", desc: "Created 10 notes!" },
  { key: "checklist_pro", icon: "✅", label: "Checklist Pro", desc: "Used a checklist for the first time!" },
  { key: "pin_master", icon: "📌", label: "Pin Master", desc: "Pinned your first note!" },
  { key: "archivist", icon: "🗄️", label: "Archivist", desc: "Archived your first note!" },
];

function hashPassword(pw) {
  return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw)).then(buf =>
    Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
  );
}

function PasswordModal({ onUnlock, onSet, mode, error }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  return (
    <div className="pw-modal">
      <div className="pw-modal-content">
        <h2>{mode === "set" ? "Set a Password" : "Unlock Notes"}</h2>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          autoFocus
        />
        {mode === "set" && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={pw2}
            onChange={e => setPw2(e.target.value)}
          />
        )}
        {error && <div className="pw-error">{error}</div>}
        <button
          className="pw-btn"
          onClick={() => {
            if (mode === "set") {
              if (!pw || !pw2 || pw !== pw2) return;
              onSet(pw);
            } else {
              onUnlock(pw);
            }
          }}
        >{mode === "set" ? "Set Password" : "Unlock"}</button>
      </div>
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [tags, setTags] = useState(defaultTags);
  const [filterTags, setFilterTags] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pinned, archived, reminders, overdue
  const [pinnedIds, setPinnedIds] = useState([]);
  const [archivedIds, setArchivedIds] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem("keeper-badges");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [locked, setLocked] = useState(() => !!localStorage.getItem("keeper-pw"));
  const [pwMode, setPwMode] = useState("unlock"); // or "set"
  const [pwError, setPwError] = useState("");
  const [importUndo, setImportUndo] = useState(null);

  // Quotes array for the footer
  const quotes = [
    "The secret of getting ahead is getting started. – Mark Twain",
    "Success is the sum of small efforts, repeated day-in and day-out. – Robert Collier",
    "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
    "Great things are done by a series of small things brought together. – Van Gogh",
    "Dream big. Start small. Act now. – Robin Sharma",
    "Productivity is never an accident. – Paul J. Meyer",
    "You don’t have to be great to start, but you have to start to be great. – Zig Ziglar"
  ];
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * quotes.length));
  function refreshQuote() {
    let idx;
    do {
      idx = Math.floor(Math.random() * quotes.length);
    } while (idx === quoteIdx);
    setQuoteIdx(idx);
  }

  useEffect(() => {
    const savedNotes = localStorage.getItem("keeper-notes");
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    const savedTags = localStorage.getItem("keeper-tags");
    if (savedTags) setTags(JSON.parse(savedTags));
    const savedPinned = localStorage.getItem("keeper-pinned");
    if (savedPinned) setPinnedIds(JSON.parse(savedPinned));
    const savedArchived = localStorage.getItem("keeper-archived");
    if (savedArchived) setArchivedIds(JSON.parse(savedArchived));
  }, []);

  useEffect(() => {
    localStorage.setItem("keeper-notes", JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem("keeper-tags", JSON.stringify(tags));
  }, [tags]);
  useEffect(() => {
    localStorage.setItem("keeper-pinned", JSON.stringify(pinnedIds));
  }, [pinnedIds]);
  useEffect(() => {
    localStorage.setItem("keeper-archived", JSON.stringify(archivedIds));
  }, [archivedIds]);

  // Reminder notification polling
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    let interval;
    function checkReminders() {
      const now = new Date();
      notes.forEach(note => {
        if (note.reminder && !note.reminderNotified && new Date(note.reminder) <= now) {
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('Note Reminder', {
              body: note.title ? `"${note.title}"` : 'A note is due!'
            });
          }
          // Mark as notified
          note.reminderNotified = true;
        }
      });
      // Save updated notes (with notified flags)
      setNotes(prevNotes => prevNotes.map(note => note.reminder && note.reminderNotified ? { ...note } : note));
    }
    interval = setInterval(checkReminders, 30000); // check every 30s
    return () => clearInterval(interval);
  }, [notes]);

  async function handleUnlock(pw) {
    setPwError("");
    const hash = await hashPassword(pw);
    if (hash === localStorage.getItem("keeper-pw")) {
      setLocked(false);
    } else {
      setPwError("Incorrect password");
    }
  }
  async function handleSetPassword(pw) {
    setPwError("");
    const hash = await hashPassword(pw);
    localStorage.setItem("keeper-pw", hash);
    setLocked(false);
  }
  function handleLock() {
    setLocked(true);
    setPwMode("unlock");
  }
  function handleChangePw() {
    setPwMode("set");
    setLocked(true);
  }

  function addNote(newNote) {
    if (!newNote.title.trim() && !newNote.content.trim() && (!newNote.checklist || newNote.checklist.length === 0)) return;
    setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
    setNotes(prevNotes => [{ ...newNote, tags: newNote.tags || [], checklist: newNote.checklist || [], reminderNotified: false }, ...prevNotes]);
    if (newNote.tags) {
      setTags(prevTags => Array.from(new Set([...prevTags, ...newNote.tags])));
    }
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 75,
        origin: { y: 0.25 },
        colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f7b731', '#fff', '#222']
      });
    }, 120);
    if (notes.length === 0) unlockBadge("first_note");
    if (notes.length + 1 === 10) unlockBadge("ten_notes");
    if (newNote.checklist && newNote.checklist.length > 0) unlockBadge("checklist_pro");
  }

  function deleteNote(id) {
    if (!window.confirm('Delete this note? This cannot be undone (unless you use Undo).')) return;
    setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    setPinnedIds(prev => prev.filter(pid => pid !== id));
    setArchivedIds(prev => prev.filter(aid => aid !== id));
    setSelectedNotes(prev => prev.filter(nid => nid !== id));
  }

  function archiveNote(id) {
    setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
    setArchivedIds(prev => [id, ...prev]);
    setPinnedIds(prev => prev.filter(idx => idx !== id));
    if (!badges.includes("archivist")) unlockBadge("archivist");
  }

  function unarchiveNote(id) {
    setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
    setArchivedIds(prev => prev.filter(idx => idx !== id));
  }

  function startEdit(id) {
    setEditingId(id);
  }

  function handleSaveEdit(id, updatedNote) {
    setNotes(prevNotes => prevNotes.map(note =>
      note.id === id ? { ...note, ...updatedNote, reminderNotified: false } : note
    ));
  }

  function editNote(id, updatedNote) {
    setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
    setNotes(prevNotes => prevNotes.map((note, idx) => idx === id ? { ...updatedNote, tags: updatedNote.tags || [], checklist: updatedNote.checklist || [] } : note));
    setEditingId(null);
    if (updatedNote.tags) {
      setTags(prevTags => Array.from(new Set([...prevTags, ...updatedNote.tags])));
    }
  }

  function togglePin(id) {
    setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
    setPinnedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [id, ...prev]);
    if (!badges.includes("pin_master")) unlockBadge("pin_master");
  }

  function undo() {
    if (undoStack.length === 0) return;
    const prev = undoStack[0];
    setNotes(prev.notes);
    setPinnedIds(prev.pinnedIds);
    setArchivedIds(prev.archivedIds);
    setUndoStack(stack => stack.slice(1));
  }

  function unlockBadge(key) {
    if (!badges.includes(key)) {
      setBadges(prev => {
        const next = [...prev, key];
        localStorage.setItem("keeper-badges", JSON.stringify(next));
        return next;
      });
    }
  }

  // Only allow one note to be selected at a time
  function toggleSelectNote(id) {
    setSelectedNotes(prev => prev.includes(id) ? [] : [id]);
  }
  function selectAllVisible() {
    setSelectedNotes(filteredNotes.map(n => n.id));
  }
  function deselectAll() {
    setSelectedNotes([]);
  }
  function bulkArchive() {
    setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
    setArchivedIds(prev => Array.from(new Set([...prev, ...selectedNotes])));
    setPinnedIds(prev => prev.filter(id => !selectedNotes.includes(id)));
    setSelectedNotes([]);
  }
  function bulkUnarchive() {
    setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
    setArchivedIds(prev => prev.filter(id => !selectedNotes.includes(id)));
    setSelectedNotes([]);
  }
  function bulkDelete() {
    if (selectedNotes.length === 0) return; // Do nothing if nothing selected
    if (!window.confirm(`Delete ${selectedNotes.length} selected note(s)? This cannot be undone (unless you use Undo).`)) return;
    setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
    setNotes(prev => prev.filter(note => !selectedNotes.includes(note.id)));
    setArchivedIds(prev => prev.filter(id => !selectedNotes.includes(id)));
    setPinnedIds(prev => prev.filter(id => !selectedNotes.includes(id)));
    setSelectedNotes([]);
  }

  // Full-text search highlight function
  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <span key={i} className="highlight">{part}</span>
        : part
    );
  }

  // Filtering logic
  function filterNotes(note) {
    if (filterTags.length > 0 && (!note.tags || !filterTags.every(tag => note.tags.includes(tag)))) return false;
    if (filterStatus === 'pinned' && !pinnedIds.includes(note.id)) return false;
    if (filterStatus === 'archived' && !archivedIds.includes(note.id)) return false;
    if (filterStatus === 'reminders' && !note.reminder) return false;
    if (filterStatus === 'overdue' && (!note.reminder || new Date(note.reminder) > new Date())) return false;
    if (filterStatus === 'all' && archivedIds.includes(note.id)) return false;
    return true;
  }

  const filteredNotes = notes.filter(filterNotes).filter(note => {
    // Full-text search
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const matchTitle = note.title && note.title.toLowerCase().includes(q);
    const matchContent = note.content && note.content.toLowerCase().includes(q);
    const matchChecklist = note.checklist && note.checklist.some(item => item.text && item.text.toLowerCase().includes(q));
    return matchTitle || matchContent || matchChecklist;
  });

  // Split pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter(note => pinnedIds.includes(note.id));
  const unpinnedNotes = filteredNotes.filter(note => !pinnedIds.includes(note.id));

  // Export notes as JSON
  function handleExportNotes() {
    const data = {
      notes,
      pinnedIds,
      archivedIds,
      tags,
      badges
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keeper-notes-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import notes from JSON
  function handleImportNotes(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!Array.isArray(data.notes)) throw new Error('Invalid file');
        // Save current state for undo
        setImportUndo({
          notes,
          pinnedIds,
          archivedIds,
          tags,
          badges
        });
        if (window.confirm('Replace all current notes with imported notes? (Cancel to merge)')) {
          setNotes(data.notes);
          setPinnedIds(data.pinnedIds || []);
          setArchivedIds(data.archivedIds || []);
          setTags(data.tags || []);
          setBadges(data.badges || []);
        } else {
          // Merge
          setNotes(prev => [...data.notes, ...prev]);
          setPinnedIds(prev => Array.from(new Set([...(data.pinnedIds || []), ...prev])));
          setArchivedIds(prev => Array.from(new Set([...(data.archivedIds || []), ...prev])));
          setTags(prev => Array.from(new Set([...(data.tags || []), ...prev])));
          setBadges(prev => Array.from(new Set([...(data.badges || []), ...prev])));
        }
      } catch {
        alert('Failed to import notes: invalid or corrupt file.');
      }
    };
    reader.readAsText(file);
  }

  function handleUndoImport() {
    if (!importUndo) return;
    setNotes(importUndo.notes);
    setPinnedIds(importUndo.pinnedIds);
    setArchivedIds(importUndo.archivedIds);
    setTags(importUndo.tags);
    setBadges(importUndo.badges);
    setImportUndo(null);
  }

  return (
    <ThemeProvider>
      <div className="keeper-app">
        {locked && <PasswordModal mode={localStorage.getItem("keeper-pw") ? pwMode : "set"} error={pwError} onUnlock={handleUnlock} onSet={handleSetPassword} />}
        {importUndo && (
          <div className="undo-import-bar">
            <span>Notes imported.</span>
            <button className="undo-btn" onClick={handleUndoImport} title="Undo last import">Undo Import</button>
          </div>
        )}
        <Header />
        <FeaturePanel
          data={{ notes, pinnedIds, archivedIds, tags, badges }}
          onRestore={data => {
            setUndoStack(prev => [{ notes, pinnedIds, archivedIds }, ...prev].slice(0, 20));
            setNotes(data.notes || []);
            setPinnedIds(data.pinnedIds || []);
            setArchivedIds(data.archivedIds || []);
            setTags(data.tags || defaultTags);
            setBadges(data.badges || []);
          }}
        >
          <button className="lock-btn" title="Lock app" onClick={handleLock}>🔒</button>
          <button className="change-pw-btn" title="Change password" onClick={handleChangePw}>🔑</button>
          <button className="export-btn" title="Export notes as JSON" onClick={handleExportNotes}>⬇️ Export</button>
          <label className="import-btn" title="Import notes from JSON">
            ⬆️ Import
            <input type="file" accept="application/json" style={{ display: "none" }} onChange={handleImportNotes} />
          </label>
          {BADGES.filter(badge => badges.includes(badge.key)).map(badge => (
            <span key={badge.key} className="badge" title={badge.desc}>{badge.icon}</span>
          ))}
          <DropboxSync
            data={{ notes, pinnedIds, archivedIds, tags, badges }}
            onRestore={json => {
              setImportUndo({ notes, pinnedIds, archivedIds, tags, badges });
              setNotes(json.notes || []);
              setPinnedIds(json.pinnedIds || []);
              setArchivedIds(json.archivedIds || []);
              setTags(json.tags || []);
              setBadges(json.badges || []);
            }}
            compact
          />
        </FeaturePanel>
        {!locked && (
          <>
            {/* Filter Bar */}
            <div className="filter-bar">
              <TagSelector tags={tags} selectedTags={filterTags} onChange={setFilterTags} allowCreate={false} multiSelect />
              <div className="status-filters">
                <button className={filterStatus === 'all' ? 'active' : ''} onClick={() => setFilterStatus('all')}>All</button>
                <button className={filterStatus === 'pinned' ? 'active' : ''} onClick={() => setFilterStatus('pinned')}>Pinned</button>
                <button className={filterStatus === 'archived' ? 'active' : ''} onClick={() => setFilterStatus('archived')}>Archived</button>
                <button className={filterStatus === 'reminders' ? 'active' : ''} onClick={() => setFilterStatus('reminders')}>With Reminders</button>
                <button className={filterStatus === 'overdue' ? 'active' : ''} onClick={() => setFilterStatus('overdue')}>Overdue</button>
              </div>
            </div>
            {/* Bulk Action Bar */}
            {selectedNotes.length > 0 && (
              <div className="bulk-action-bar">
                <span>{selectedNotes.length} selected</span>
                <button onClick={selectAllVisible} title="Select all visible notes">Select all</button>
                <button onClick={deselectAll} title="Deselect all">Deselect</button>
                <button onClick={bulkArchive} title="Archive selected">🗄️ Archive</button>
                <button onClick={bulkUnarchive} title="Unarchive selected">↩️ Unarchive</button>
                <button onClick={bulkDelete} title="Delete selected" className="bulk-delete">🗑️ Delete</button>
              </div>
            )}
            <button className="undo-btn" onClick={undo} disabled={undoStack.length === 0} title="Undo last action" aria-label="Undo last action">↩️ Undo</button>
            <CreateArea onAdd={addNote} search={search} setSearch={setSearch} tags={tags} />
            <div className="notes-grid">
              {pinnedNotes.length > 0 && <div className="pinned-label">📌 Pinned</div>}
              {pinnedNotes.map((noteItem, index) => (
                <Note
                  key={"pinned-" + index}
                  id={noteItem.id}
                  title={noteItem.title}
                  content={noteItem.content}
                  tags={noteItem.tags}
                  checklist={noteItem.checklist}
                  reminder={noteItem.reminder}
                  onDelete={deleteNote}
                  onEdit={startEdit}
                  editing={editingId === notes.indexOf(noteItem)}
                  onSaveEdit={handleSaveEdit}
                  onTogglePin={togglePin}
                  onArchive={archiveNote}
                  pinned={pinnedIds.includes(noteItem.id)}
                  archived={archivedIds.includes(noteItem.id)}
                  allTags={tags}
                  highlightText={highlightText}
                  search={search}
                  selected={selectedNotes.includes(noteItem.id)}
                  onSelect={toggleSelectNote}
                />
              ))}
              {unpinnedNotes.map((noteItem, index) => (
                <Note
                  key={"unpinned-" + index}
                  id={noteItem.id}
                  title={noteItem.title}
                  content={noteItem.content}
                  tags={noteItem.tags}
                  checklist={noteItem.checklist}
                  reminder={noteItem.reminder}
                  onDelete={deleteNote}
                  onEdit={startEdit}
                  editing={editingId === notes.indexOf(noteItem)}
                  onSaveEdit={handleSaveEdit}
                  onTogglePin={togglePin}
                  onArchive={archiveNote}
                  pinned={pinnedIds.includes(noteItem.id)}
                  archived={archivedIds.includes(noteItem.id)}
                  allTags={tags}
                  highlightText={highlightText}
                  search={search}
                  selected={selectedNotes.includes(noteItem.id)}
                  onSelect={toggleSelectNote}
                />
              ))}
            </div>
            {filteredNotes.filter(note => archivedIds.includes(note.id)).length > 0 && (
              <div className="archived-section">
                <div className="archived-label">🗄️ Archived</div>
                <div className="notes-grid">
                  {filteredNotes.filter(note => archivedIds.includes(note.id)).map((noteItem, index) => (
                    <Note
                      key={"archived-" + index}
                      id={noteItem.id}
                      title={noteItem.title}
                      content={noteItem.content}
                      tags={noteItem.tags}
                      checklist={noteItem.checklist}
                      reminder={noteItem.reminder}
                      onDelete={deleteNote}
                      onEdit={startEdit}
                      editing={editingId === notes.indexOf(noteItem)}
                      onSaveEdit={handleSaveEdit}
                      onTogglePin={togglePin}
                      onArchive={unarchiveNote}
                      archived={true}
                      pinned={pinnedIds.includes(noteItem.id)}
                      allTags={tags}
                      highlightText={highlightText}
                      search={search}
                      selected={selectedNotes.includes(noteItem.id)}
                      onSelect={toggleSelectNote}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Footer with quote */}
            <Footer>
              <div className="quote-footer">
                <span className="quote">{quotes[quoteIdx]}</span>
                <button className="refresh-quote-btn" onClick={refreshQuote} aria-label="New quote">🔄</button>
              </div>
            </Footer>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
