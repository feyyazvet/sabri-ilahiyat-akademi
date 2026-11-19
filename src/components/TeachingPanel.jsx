import React from 'react';
import {
  Bot,
  CheckCircle2,
  XCircle,
  BookOpen,
  Volume2,
  Sparkles,
  Info,
} from 'lucide-react';
import { hasArabic, speakArabic } from '../utils/studyHelpers';

export default function TeachingPanel({ question, answerEntry, isWrongPoolMode }) {
  if (!answerEntry || !answerEntry.checked) return null;

  const isCorrect =
    question.isCanceled || answerEntry.selected === question.correctAnswer;

  return (
    <div
      className="glass-card teaching-panel"
      style={{
        padding: '1.2rem 1.35rem',
        border: isCorrect
          ? '1px solid var(--success-border)'
          : '1px solid var(--danger-border)',
        background: isCorrect
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.09) 0%, var(--bg-glass) 100%)'
          : 'linear-gradient(135deg, rgba(244, 63, 94, 0.09) 0%, var(--bg-glass) 100%)',
      }}
    >
      {/* Status Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.6rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isCorrect ? (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={21} />
            </div>
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.2)',
                color: '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XCircle size={21} />
            </div>
          )}

          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '0.96rem',
                color: isCorrect ? '#34d399' : '#fb7185',
              }}
            >
              {question.isCanceled
                ? 'İptal Edilen Soru (Herkese Doğru Sayılır)'
                : isCorrect
                ? 'Tebrikler! Doğru Cevap'
                : `Yanlış Seçim (${answerEntry.selected}) • Doğru Cevap: ${question.correctAnswer}`}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isCorrect
                ? isWrongPoolMode
                  ? 'Bu soruyu doğru bildiğin için Yanlış Havuzundan temizlendi!'
                  : 'Kavram pekişti — diğer şıkların anlamlarını aşağıdan inceleyebilirsin.'
                : 'Bu soru otomatik olarak Yanlış Havuzuna eklendi; konuyu aşağıdan hemen öğren.'}
            </div>
          </div>
        </div>

        <span
          className="pill"
          style={{
            background: 'rgba(59, 130, 246, 0.14)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <Bot size={13} />
          <span>Anında Hoca Anlatımı (0ms)</span>
        </span>
      </div>

      {/* Main Explanation */}
      <div style={{ marginTop: '0.95rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: 'var(--brand-light)',
            marginBottom: '0.4rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <Sparkles size={14} />
          <span>Konu Özeti &amp; Çözüm Mantığı</span>
        </div>

        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '0.9rem 1.05rem',
            fontSize: '0.9rem',
            lineHeight: 1.65,
            color: 'var(--text-primary)',
          }}
        >
          {question.explanation}
        </div>
      </div>

      {/* Option-by-option Breakdown ("Bu ne anlama gelir?") */}
      <div style={{ marginTop: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#60a5fa',
            marginBottom: '0.55rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <BookOpen size={14} />
          <span>Şık Şık Kavram &amp; Kelime Analizi (Hangisi Ne Demek?)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {(['A', 'B', 'C', 'D', 'E']).map((letter) => {
            const optText = question.options[letter];
            const breakdown = question.optionBreakdowns?.[letter] || '';
            const isTargetCorrect = letter === question.correctAnswer;
            const isUserWrong = !isCorrect && letter === answerEntry.selected;
            const optionHasArabic = hasArabic(optText);

            return (
              <div
                key={letter}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: isTargetCorrect
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : isUserWrong
                    ? '1px solid rgba(244, 63, 94, 0.4)'
                    : '1px solid var(--border-subtle)',
                  background: isTargetCorrect
                    ? 'rgba(16, 185, 129, 0.1)'
                    : isUserWrong
                    ? 'rgba(244, 63, 94, 0.08)'
                    : 'var(--bg-elevated)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flex: 1 }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '7px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      background: isTargetCorrect
                        ? '#10b981'
                        : isUserWrong
                        ? '#f43f5e'
                        : 'rgba(148, 163, 184, 0.15)',
                      color: isTargetCorrect || isUserWrong ? '#ffffff' : 'var(--text-secondary)',
                    }}
                  >
                    {letter}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: isTargetCorrect
                          ? '#34d399'
                          : isUserWrong
                          ? '#fb7185'
                          : 'var(--text-primary)',
                        marginBottom: '2px',
                      }}
                      className={optionHasArabic ? 'arabic-inline' : ''}
                      dir={optionHasArabic ? 'auto' : undefined}
                    >
                      {optText}
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {breakdown || (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Info size={12} /> Seçenek açıklaması mevcut değil.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {optionHasArabic && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '0.32rem 0.45rem', flexShrink: 0 }}
                    onClick={() => speakArabic(optText)}
                    title={`${letter} şıkkını Arapça sesli dinle`}
                    aria-label={`${letter} şıkkını seslendir`}
                  >
                    <Volume2 size={14} color="var(--brand-light)" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
