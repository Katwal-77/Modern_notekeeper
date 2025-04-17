import React, { useState } from "react";

// Dropbox JS SDK via CDN (for browser)
const DROPBOX_SDK_URL = "https://unpkg.com/dropbox/dist/Dropbox-sdk.min.js";

function loadDropboxSdk(cb) {
  if (window.Dropbox) return cb();
  const script = document.createElement("script");
  script.src = DROPBOX_SDK_URL;
  script.onload = cb;
  document.body.appendChild(script);
}

export default function DropboxSync({ data, onRestore, compact }) {
  const [token, setToken] = useState(localStorage.getItem("keeper-dropbox-token") || "");
  const [status, setStatus] = useState("");

  function handleTokenChange(e) {
    setToken(e.target.value);
    localStorage.setItem("keeper-dropbox-token", e.target.value);
  }

  function uploadToDropbox() {
    if (!token) return alert("Please enter your Dropbox access token.");
    loadDropboxSdk(() => {
      const dbx = new window.Dropbox.Dropbox({ accessToken: token });
      setStatus("Uploading...");
      dbx.filesUpload({
        path: "/keeper-notes-backup.json",
        contents: JSON.stringify(data, null, 2),
        mode: { ".tag": "overwrite" }
      })
        .then(() => setStatus("Backup uploaded to Dropbox!"))
        .catch(err => setStatus("Upload failed: " + err.message));
    });
  }

  function downloadFromDropbox() {
    if (!token) return alert("Please enter your Dropbox access token.");
    loadDropboxSdk(() => {
      const dbx = new window.Dropbox.Dropbox({ accessToken: token });
      setStatus("Downloading...");
      dbx.filesDownload({ path: "/keeper-notes-backup.json" })
        .then(res => {
          const reader = new FileReader();
          reader.onload = evt => {
            try {
              const json = JSON.parse(evt.target.result);
              onRestore(json);
              setStatus("Backup restored from Dropbox!");
            } catch {
              setStatus("Downloaded file is invalid/corrupt.");
            }
          };
          reader.readAsText(res.fileBlob);
        })
        .catch(err => setStatus("Download failed: " + err.message));
    });
  }

  // Modern, horizontal, compact UI
  return (
    <div className={`dropbox-sync${compact ? ' dropbox-sync-compact' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 8 : 16,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: compact ? '0.25em 0.7em' : '1em 1.5em',
        marginLeft: compact ? 18 : 0,
        boxShadow: compact ? 'none' : '0 2px 10px 0 rgba(0,0,0,0.07)',
        minWidth: compact ? 0 : 260,
        maxWidth: compact ? 320 : 420
      }}
    >
      <span style={{fontWeight:600, fontSize:'1em', color:'var(--accent,#f7b731)', marginRight:6, letterSpacing:'0.01em'}}>Dropbox</span>
      <input
        type="text"
        value={token}
        onChange={handleTokenChange}
        placeholder="Access token"
        style={{
          width: compact ? 100 : '100%',
          minWidth: 80,
          marginBottom: 0,
          fontSize:'0.97em',
          padding:'0.36em 0.7em',
          borderRadius:6,
          border:'1px solid #e0e0e0',
          background:'rgba(255,255,255,0.95)',
          color:'#222',
          outline:'none',
          boxShadow:'0 1px 4px 0 rgba(0,0,0,0.03)'
        }}
      />
      <button onClick={uploadToDropbox} title="Backup to Dropbox"
        style={{
          fontSize:'1.08em',
          padding:'0.28em 0.75em',
          marginLeft:2,
          background:'var(--accent,#f7b731)',
          color:'#222',
          border:'none',
          borderRadius:6,
          boxShadow:'0 1px 3px 0 rgba(0,0,0,0.07)',
          transition:'background 0.2s',
          cursor:'pointer',
          display:'flex',
          alignItems:'center'
        }}
      >⬆️</button>
      <button onClick={downloadFromDropbox} title="Restore from Dropbox"
        style={{
          fontSize:'1.08em',
          padding:'0.28em 0.75em',
          marginLeft:2,
          background:'var(--accent,#f7b731)',
          color:'#222',
          border:'none',
          borderRadius:6,
          boxShadow:'0 1px 3px 0 rgba(0,0,0,0.07)',
          transition:'background 0.2s',
          cursor:'pointer',
          display:'flex',
          alignItems:'center'
        }}
      >⬇️</button>
      <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer" title="Get Dropbox access token"
        style={{
          fontSize:'1.08em',
          marginLeft:6,
          color:'var(--accent,#f7b731)',
          textDecoration:'none',
          display:'flex',
          alignItems:'center'
        }}
      >🔑</a>
      {status && <div style={{ fontSize:'0.93em',marginLeft:10,color:'#888',display:'inline-block',minWidth:110 }}>{status}</div>}
    </div>
  );
}
