"use client";

import { useState } from "react";
import Link from 'next/link';

export default function Home() {
  const [title, setTitle] = useState("My Awesome Form");
  const [description, setDescription] = useState("Please fill out this quick form.");
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const addField = (type) => {
    const newField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
      options: type === "select" || type === "radio" || type === "checkbox" ? ["Option 1"] : []
    };
    setFields([...fields, newField]);
  };

  const updateField = (id, updates) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateOption = (fieldId, optIndex, value) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        const newOps = [...f.options];
        newOps[optIndex] = value;
        return { ...f, options: newOps };
      }
      return f;
    }));
  };

  const addOption = (fieldId) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, options: [...f.options, `Option ${f.options.length + 1}`] };
      }
      return f;
    }));
  };

  const saveForm = async () => {
    try {
      setSaving(true);
      const res = await fetch("http://localhost:5000/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, fields })
      });
      const data = await res.json();
      if (res.ok) {
        setShareUrl(`${window.location.origin}/f/${data.id}`);
      } else {
        alert("Failed to save form");
      }
    } catch (e) {
      alert("Error saving form: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (shareUrl) {
    return (
      <main className="container animate-slide-up">
        <div className="card text-center">
          <h2>🎉 Form Created Successfully!</h2>
          <p className="mb-4">Your dynamic form is ready to be shared and collected.</p>
          <div className="form-group">
            <input className="input text-center" value={shareUrl} readOnly />
          </div>
          <div className="flex-group" style={{ justifyContent: 'center' }}>
            <Link href={shareUrl} className="btn">
              View Live Form
            </Link>
            <button className="btn btn-secondary" onClick={() => { setShareUrl(""); setFields([]); setTitle("New Form"); }}>
              Create Another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container animate-slide-up">
      <div className="flex-between mb-8">
        <h1>Dynam Builder</h1>
        <button className="btn" onClick={saveForm} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save & Publish'}
        </button>
      </div>

      <div className="card mb-8">
        <div className="form-group">
          <label className="label">Form Title</label>
          <input
            className="input"
            style={{ fontSize: '1.25rem', fontWeight: 600 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group mb-0">
          <label className="label">Description</label>
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <h3>Form Fields</h3>
        <p className="mb-4">Add and configure interactive fields for your form below.</p>
      </div>

      {fields.length === 0 && (
        <div className="card text-center mb-8" style={{ borderStyle: 'dashed' }}>
          <p>No fields added yet. Choose a field type below to start building.</p>
        </div>
      )}

      {fields.map((field, idx) => (
        <div key={field.id} className="field-block animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
          <div className="flex-between mb-4">
            <span className="label" style={{ marginBottom: 0 }}>Field {idx + 1} ({field.type})</span>
            <button className="btn-danger btn" style={{ padding: '0.25rem 0.75rem' }} onClick={() => removeField(field.id)}>
              Delete
            </button>
          </div>

          <div className="form-group">
            <label className="label">Field Label</label>
            <input
              className="input"
              value={field.label}
              onChange={e => updateField(field.id, { label: e.target.value })}
            />
          </div>

          <label className="check-wrapper mb-4">
            <input
              type="checkbox"
              className="check-input"
              checked={field.required}
              onChange={e => updateField(field.id, { required: e.target.checked })}
            />
            Required Field
          </label>

          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
            <div className="mt-4" style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--card-border)' }}>
              <label className="label">Options</label>
              {field.options.map((opt, i) => (
                <div key={i} className="flex-group mb-2" style={{ alignItems: 'center' }}>
                  <input
                    className="input"
                    value={opt}
                    onChange={e => updateOption(field.id, i, e.target.value)}
                  />
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => {
                      const newOps = [...field.options];
                      newOps.splice(i, 1);
                      updateField(field.id, { options: newOps });
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
              <button className="btn btn-secondary mt-2" onClick={() => addOption(field.id)}>+ Add Option</button>
            </div>
          )}
        </div>
      ))}

      <div className="card mt-8 text-center" style={{ background: 'rgba(25, 28, 35, 0.4)' }}>
        <h4 className="mb-4">Add New Field</h4>
        <div className="flex-group" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => addField('text')}>Text Input</button>
          <button className="btn btn-secondary" onClick={() => addField('textarea')}>Long Text</button>
          <button className="btn btn-secondary" onClick={() => addField('select')}>Dropdown</button>
          <button className="btn btn-secondary" onClick={() => addField('radio')}>Radio</button>
          <button className="btn btn-secondary" onClick={() => addField('checkbox')}>Checkboxes</button>
        </div>
      </div>

    </main>
  );
}
