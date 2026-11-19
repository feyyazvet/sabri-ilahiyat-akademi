import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, BookOpen } from 'lucide-react';
import { hasArabic } from '../utils/studyHelpers';

export default function SearchModal({ isOpen, onClose, courses, onJumpToQuestion }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const matches = [];
    for (const course of courses) {
      for (const exam of course.exams) {
        for (const item of exam.questions) {
          const hay = [
            item.stem,
            item.arabicPrompt,
            item.explanation,
            ...Object.values(item.options),
            ...Object.values(item.optionBreakdowns || {}),
          ]
            .join(' ')
            .toLowerCase();
          if (hay.includes(q)) {
            matches.push({ course, exam, question: item });
            if (matches.length >= 25) return matches;
          }
        }
      }
    }
    return matches;
  }, [courses, query]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '4.5rem 1rem 2rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '78vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.9rem 1.1rem',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <Search size={18} color="var(--brand-primary)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="600 soruda kavram, konu veya Arapça kelime ara (örn: tedvin, mubteda, teyemmüm, tecezzi)..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.94rem',
              outline: 'none',
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.35rem' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1.1rem' }}>
          {query.trim().length < 2 ? (
            <div style={{ textAlign: 'center', padding: '2.2rem 1rem', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Aramaya başlamak için en az 2 harf yaz. Soru kökleri, şıklar ve açıklamalar içinde anında arama yapılır.
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.2rem 1rem', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              "{query}" ile eşleşen soru bulunamadı.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {results.map(({ course, exam, question }) => (
                <button
                  key={question.id}
                  type="button"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '11px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                  onClick={() => {
                    onJumpToQuestion(course.id, exam.id, question.questionNumber - 1);
                    onClose();
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '4px' }}>
                      <span
                        className="pill"
                        style={{
                          background: `${course.color}22`,
                          color: course.color,
                          fontSize: '0.68rem',
                        }}
                      >
                        <BookOpen size={11} /> {course.shortTitle}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {exam.shortTitle} • {question.questionNumber}. Soru
                      </span>
                    </div>

                    {question.arabicPrompt && (
                      <div
                        className="arabic-inline"
                        style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2px' }}
                        dir="rtl"
                      >
                        {question.arabicPrompt.replace(/<\/?u>/g, '').slice(0, 75)}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {question.stem.replace(/<\/?u>/g, '')}
                    </div>
                  </div>

                  <ArrowRight size={16} color="var(--brand-light)" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
