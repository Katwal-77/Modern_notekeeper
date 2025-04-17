import React from "react";
import ThemeToggle from "./ThemeToggle";
import DropboxSync from "./DropboxSync";

export default function FeaturePanel(props) {
  return (
    <section className="feature-panel">
      <div className="feature-toolbar" style={{ display: "flex", gap: "10px" }}>
        <div className="feature-group">
          <ThemeToggle />
          <button className="lock-btn" title="Lock app" onClick={props.onLock}>🔒</button>
          <button className="change-pw-btn" title="Change password" onClick={props.onChangePw}>🔑</button>
        </div>
        <div className="feature-group">
          <button className="export-btn" title="Export notes as JSON" onClick={props.onExport}>⬇️ Export</button>
          <label className="import-btn" title="Import notes from JSON">
            ⬆️ Import
            <input type="file" accept="application/json" style={{ display: "none" }} onChange={props.onImport} />
          </label>
        </div>
        <div className="feature-group">
          <DropboxSync {...props} compact />
        </div>
        <div className="feature-group">
          {props.badges && props.BADGES && props.BADGES.filter(badge => props.badges.includes(badge.key)).map(badge => (
            <span key={badge.key} className="badge" title={badge.desc}>{badge.icon}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
