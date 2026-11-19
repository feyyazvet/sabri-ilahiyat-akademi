import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { hasArabic, speakArabic } from '../utils/studyHelpers';

/**
 * Metin içinde Arapça + <u>altı çizili</u> bölümleri okunaklı şekilde render eder.
 */
function RichMixedText({ text }) {
  if (!text) return null;
  // Split around <u>...</u> if present
  const parts = text.split(/(<u>.*?<\/u>)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('<u>') && part.endsWith('</u>')) {
          const inner = part.slice(3, -4);
          return <u key={idx}>{inner}</u>;
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
}

export default function QuestionCard({
  question,
  indexInSession,
  totalInSession,
  sessionBadge,
  answerEntry,
  studyMode,
  isExamSubmitted,
  isFavorite,
  onToggleFavorite,
  onSelectOption,
  onCheckConfirm,
  onPrev,
  onNext,
  questionsList,
  answersMap,
  favoritesList,
  onJumpTo,
  courseColor,
}) {
  const isRevealed =
    Boolean(answerEntry?.checked) || (studyMode === 'exam' && isExamSubmitted);
  const selectedOpt = answerEntry?.selected || null;

  const hasPromptArabic = hasArabic(question.arabicPrompt);
  const hasStemArabic = hasArabic(question.stem);
  const fullArabicSpeechText = [question.arabicPrompt, hasStemArabic ? question.stem : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Question Card */}
      <div className="glass-card" style={{ padding: '1.35rem 1.45rem' }}>
        {/* Card Header: Test X/5 – Soru Y/20 + Meta + Star + Audio */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.9rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '1.08rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {sessionBadge} – Soru {indexInSession + 1}/{totalInSession}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: 'var(--text-muted)',
                marginTop: '0.2rem',
              }}
            >
              {question.sourceMeta}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            {(hasPromptArabic || hasStemArabic) && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.42rem 0.7rem', fontSize: '0.76rem' }}
                onClick={() => speakArabic(fullArabicSpeechText)}
                title="Arapça metni sesli dinle"
              >
                <Volume2 size={15} color="#10b981" />
                <span>Dinle</span>
              </button>
            )}

            <button
              type="button"
              className="btn-secondary"
              style={{
                padding: '0.42rem 0.6rem',
                borderColor: isFavorite ? 'rgba(245, 158, 11, 0.5)' : undefined,
                background: isFavorite ? 'rgba(245, 158, 11, 0.14)' : undefined,
              }}
              onClick={() => onToggleFavorite(question.id)}
              title={isFavorite ? 'Yıldızlı sorulardan çıkar' : 'Zor/önemli soru olarak yıldızla'}
            >
              <Star
                size={16}
                color={isFavorite ? '#f59e0b' : 'var(--text-muted)'}
                fill={isFavorite ? '#f59e0b' : 'none'}
              />
            </button>
          </div>
        </div>

        {/* Canceled Question Notice */}
        {question.isCanceled && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              background: 'var(--warning-soft)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: '0.9rem',
            }}
          >
            <AlertCircle size={16} />
            <span>
              Bu soru Anadolu Üniversitesi AÖF resmi cevap anahtarında İptal (İ) edilmiştir;
              otomatik doğru kabul edilir.
            </span>
          </div>
        )}

        {/* Dedicated Arabic Prompt Block (if present) */}
        {question.arabicPrompt && (
          <div className="arabic-prompt-box">
            {question.arabicPrompt.split('\n').map((line, idx) => (
              <div key={idx} className="arabic-text" dir="rtl">
                <RichMixedText text={line} />
              </div>
            ))}
          </div>
        )}

        {/* Question Stem */}
        <div
          style={{
            fontSize: '1.02rem',
            fontWeight: 700,
            lineHeight: 1.65,
            color: 'var(--text-primary)',
            marginBottom: '1.15rem',
          }}
        >
          <RichMixedText text={question.stem} />
        </div>

        {/* Options A-E */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {(['A', 'B', 'C', 'D', 'E']).map((letter) => {
            const optText = question.options[letter];
            const isSelected = selectedOpt === letter;
            const isCorrectOpt = question.correctAnswer === letter;
            const optArabic = hasArabic(optText);

            let stateClass = '';
            if (isRevealed) {
              if (isCorrectOpt) stateClass = 'is-correct';
              else if (isSelected && !isCorrectOpt) stateClass = 'is-wrong';
            } else if (isSelected) {
              stateClass = 'selected';
            }

            return (
              <button
                key={letter}
                type="button"
                disabled={isRevealed || question.isCanceled}
                className={`option-btn ${stateClass}`}
                onClick={() => onSelectOption(question.id, letter)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span className="option-badge">{letter}</span>
                  <span
                    className={optArabic ? 'arabic-text' : ''}
                    style={
                      optArabic
                        ? { fontSize: 'calc(1.32rem * var(--arabic-scale))', lineHeight: 1.85 }
                        : { fontSize: '0.93rem', fontWeight: 500, lineHeight: 1.5 }
                    }
                    dir={optArabic ? 'rtl' : 'ltr'}
                  >
                    {optText}
                  </span>
                </div>

                {isRevealed && isCorrectOpt && (
                  <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />
                )}
                {isRevealed && isSelected && !isCorrectOpt && (
                  <XCircle size={20} color="#f43f5e" style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm Button for "Seç & Kontrol Et" mode + Next/Prev Navigation */}
        <div
          style={{
            marginTop: '1.2rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            disabled={indexInSession === 0}
            onClick={onPrev}
          >
            <ChevronLeft size={16} />
            <span>Önceki</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {studyMode === 'confirm' && !isRevealed && !question.isCanceled && (
              <button
                type="button"
                className="btn-primary"
                disabled={!selectedOpt}
                onClick={() => onCheckConfirm(question.id)}
              >
                <span>Cevabımı kontrol et</span>
                <ChevronRight size={16} />
              </button>
            )}

            {indexInSession < totalInSession - 1 && (
              <button
                type="button"
                className={isRevealed || studyMode !== 'confirm' ? 'btn-primary' : 'btn-secondary'}
                onClick={onNext}
              >
                <span>Sonraki Soru</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Map 1..N */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.65rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Soru Haritası ({totalInSession} Soru)
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Kısayollar: <strong>A-E</strong> (veya 1-5) Seç • <strong>Enter</strong> Kontrol Et •{' '}
            <strong>← / →</strong> Gezin
          </span>
        </div>

        <div className="qmap-grid">
          {questionsList.map((q, idx) => {
            const ans = answersMap[q.id];
            const isCur = idx === indexInSession;
            const isStar = favoritesList.includes(q.id);
            const qRev = Boolean(ans?.checked) || (studyMode === 'exam' && isExamSubmitted);

            let cellClass = 'qmap-cell';
            if (isCur) cellClass += ' current';
            if (q.isCanceled || (qRev && ans?.selected)) {
              if (q.isCanceled || ans?.selected === q.correctAnswer) cellClass += ' q-correct';
              else cellClass += ' q-wrong';
            } else if (ans?.selected) {
              cellClass += ' q-selected';
            }

            return (
              <button
                key={q.id}
                type="button"
                className={cellClass}
                onClick={() => onJumpTo(idx)}
                style={
                  isCur && !cellClass.includes('q-')
                    ? { borderColor: courseColor }
                    : undefined
                }
                title={`${idx + 1}. Soru`}
              >
                {idx + 1}
                {isStar && <span className="qmap-star-dot" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
