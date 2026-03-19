import { useRef, useEffect } from 'react';
import { RULES_SECTIONS } from '../data/rulesContent.js';

export function RulesModal({ open, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="rules-modal"
      onClick={handleBackdropClick}
      onClose={onClose}
    >
      <div className="rules-modal-content">
        <div className="rules-modal-header">
          <h2>📜 Reglas del Juego</h2>
          <button
            className="btn btn-ghost rules-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="rules-modal-body">
          {RULES_SECTIONS.map((section, i) => (
            <div key={i} className="rules-section">
              <h3 className="rules-section-title">
                {section.emoji} {section.title}
              </h3>
              <ul>
                {section.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </dialog>
  );
}
