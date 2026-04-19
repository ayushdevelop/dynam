"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function FormRenderer() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/forms/${id}`);
        if (!res.ok) throw new Error("Form not found");
        const data = await res.json();
        setForm(data);
        
        // Init answers state
        const initialAnswers = {};
        data.fields.forEach(f => {
          if (f.type === 'checkbox') initialAnswers[f.id] = [];
          else initialAnswers[f.id] = "";
        });
        setAnswers(initialAnswers);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchForm();
  }, [id]);

  const handleTextChange = (fieldId, value) => {
    setAnswers({ ...answers, [fieldId]: value });
  };

  const handleCheckboxChange = (fieldId, option, isChecked) => {
    setAnswers(prev => {
      const current = prev[fieldId] || [];
      if (isChecked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter(o => o !== option) };
      }
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // Verification logic manually since some fields might be required
      for (const field of form.fields) {
        if (field.required) {
          const val = answers[field.id];
          if (!val || (Array.isArray(val) && val.length === 0)) {
            alert(`Field "${field.label}" is required.`);
            return setSubmitting(false);
          }
        }
      }

      const res = await fetch(`http://localhost:5000/api/forms/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit form.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container text-center mt-8"><p>Loading form...</p></div>;
  if (error) return <div className="container text-center mt-8 card"><h2 style={{color: 'var(--danger)'}}>Error</h2><p>{error}</p></div>;

  if (submitted) {
    return (
      <main className="container animate-slide-up text-center">
        <div className="card">
          <h2>✅ Response Submitted</h2>
          <p className="mb-8">Your response has been successfully recorded.</p>
          <Link href="/" className="btn btn-secondary">Create your own Form</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container animate-slide-up">
      <div className="card mb-8 text-center" style={{ borderBottom: '4px solid var(--accent)' }}>
        <h1>{form.title}</h1>
        {form.description && <p style={{fontSize: '1.1rem'}}>{form.description}</p>}
      </div>

      <form onSubmit={submitForm}>
        {form.fields.map((field, idx) => (
          <div key={field.id} className="card mb-4 animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <label className="label" style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
              {field.label} {field.required && <span style={{color: 'var(--danger)'}}>*</span>}
            </label>
            
            {field.type === 'text' && (
              <input 
                className="input" 
                value={answers[field.id] || ''} 
                onChange={(e) => handleTextChange(field.id, e.target.value)} 
                required={field.required}
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea 
                className="textarea" 
                value={answers[field.id] || ''} 
                onChange={(e) => handleTextChange(field.id, e.target.value)} 
                required={field.required}
              />
            )}

            {field.type === 'select' && (
              <select 
                className="select" 
                value={answers[field.id] || ''} 
                onChange={(e) => handleTextChange(field.id, e.target.value)} 
                required={field.required}
              >
                <option value="" disabled>Select an option</option>
                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}

            {field.type === 'radio' && (
              <div className="radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {field.options.map(opt => (
                  <label key={opt} className="check-wrapper">
                    <input 
                      type="radio" 
                      name={`field-${field.id}`}
                      className="check-input"
                      value={opt}
                      checked={answers[field.id] === opt}
                      onChange={(e) => handleTextChange(field.id, e.target.value)}
                      required={field.required && !answers[field.id]}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {field.type === 'checkbox' && (
              <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {field.options.map(opt => (
                  <label key={opt} className="check-wrapper">
                    <input 
                      type="checkbox" 
                      className="check-input"
                      checked={(answers[field.id] || []).includes(opt)}
                      onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="text-center mt-8 animate-slide-up" style={{ animationDelay: `${form.fields.length * 0.05}s` }}>
          <button type="submit" className="btn" style={{ width: '100%', maxWidth: '300px', padding: '1rem', fontSize: '1.1rem' }} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </main>
  );
}
