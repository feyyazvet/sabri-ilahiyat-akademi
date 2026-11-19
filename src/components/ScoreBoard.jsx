import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Flame,
  RotateCcw,
  Timer,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { formatDuration } from '../utils/studyHelpers';

export default function ScoreBoard({
  course,
  sessionTitle,
  sessionSubtitle,
  stats,
  fixedScore,
  wrongPoolCount,
  onStartWrongPool,
  studyMode,
  onChangeStudyMode,
  deductQuarter,
  onToggleDeductQuarter,
  onResetSession,
  pdfFile,
  isArabicCourse,
  arabicScale,
  onChangeArabicScale,
  examTimerSeconds,
  isExamSubmitted,
  onFinishExamSimulation,
}) {
  const completionPct = stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {/* Glassmorphic Hero Header */}
      <div className="hero-banner">
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-10%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: `${course.color}33`,
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-55%',
            right: '-8%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.2)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.9rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                className="pill"
                style={{
                  background: `${course.color}25`,
                  color: course.color,
                  border: `1px solid ${course.color}45`,
                }}
              >
                {course.code} • {course.title}
              </span>
              {typeof fixedScore === 'number' && (
                <span
                  className="pill"
                  style={{
                    background: 'rgba(16, 185, 129, 0.16)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircle2 size={12} /> Önceki Tur: {fixedScore}/100
                </span>
              )}
            </div>

            <h1
              style={{
                margin: '0.45rem 0 0.2rem',
                fontSize: 'clamp(1.15rem, 2.2vw, 1.45rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              {sessionTitle}
            </h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {sessionSubtitle}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem' }}>
            {isArabicCourse && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  padding: '0.2rem',
                }}
                title="Arapça yazı büyüklüğünü ayarla"
              >
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ border: 'none', padding: '0.32rem 0.55rem', fontSize: '0.75rem' }}
                  onClick={() => onChangeArabicScale(Math.max(0.85, Number((arabicScale - 0.1).toFixed(2))))}
                >
                  A-
                </button>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0 0.3rem', color: 'var(--text-muted)' }}>
                  Arapça
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ border: 'none', padding: '0.32rem 0.55rem', fontSize: '0.75rem' }}
                  onClick={() => onChangeArabicScale(Math.min(1.5, Number((arabicScale + 0.1).toFixed(2))))}
                >
                  A+
                </button>
              </div>
            )}

            {pdfFile && (
              <a
                href={`/pdfs/${encodeURIComponent(pdfFile)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                <FileText size={14} color={course.color} />
                <span>Orijinal PDF</span>
              </a>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={onResetSession}
              title="Bu testteki cevapları temizle ve yeni tura başla"
            >
              <RotateCcw size={14} />
              <span>Yeni Tur</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Strip */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '1rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.6rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.25rem' }}>
              Çalışma Modu:
            </span>
            <button
              type="button"
              className="btn-secondary"
              style={{
                padding: '0.36rem 0.7rem',
                fontSize: '0.76rem',
                background: studyMode === 'instant' ? 'rgba(16, 185, 129, 0.2)' : undefined,
                borderColor: studyMode === 'instant' ? 'var(--brand-primary)' : undefined,
                color: studyMode === 'instant' ? 'var(--brand-light)' : undefined,
              }}
              onClick={() => onChangeStudyMode('instant')}
            >
              <Zap size={13} />
              <span>Anında Kontrol (0ms)</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{
                padding: '0.36rem 0.7rem',
                fontSize: '0.76rem',
                background: studyMode === 'confirm' ? 'rgba(59, 130, 246, 0.2)' : undefined,
                borderColor: studyMode === 'confirm' ? '#3b82f6' : undefined,
                color: studyMode === 'confirm' ? '#60a5fa' : undefined,
              }}
              onClick={() => onChangeStudyMode('confirm')}
            >
              <ShieldCheck size={13} />
              <span>Seç &amp; Kontrol Et</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{
                padding: '0.36rem 0.7rem',
                fontSize: '0.76rem',
                background: studyMode === 'exam' ? 'rgba(245, 158, 11, 0.2)' : undefined,
                borderColor: studyMode === 'exam' ? '#f59e0b' : undefined,
                color: studyMode === 'exam' ? '#fbbf24' : undefined,
              }}
              onClick={() => onChangeStudyMode('exam')}
            >
              <Timer size={13} />
              <span>Sınav Modu (30 dk)</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {studyMode === 'exam' && (
              <>
                <span
                  className="pill"
                  style={{
                    background: examTimerSeconds < 180 ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.16)',
                    color: examTimerSeconds < 180 ? '#fb7185' : '#fbbf24',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <Timer size={13} /> {formatDuration(examTimerSeconds)}
                </span>
                {!isExamSubmitted && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0.36rem 0.85rem', fontSize: '0.76rem' }}
                    onClick={onFinishExamSimulation}
                  >
                    Sınavı Bitir &amp; Değerlendir
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              className="btn-secondary"
              style={{
                padding: '0.34rem 0.65rem',
                fontSize: '0.73rem',
                borderColor: deductQuarter ? 'rgba(59, 130, 246, 0.45)' : undefined,
              }}
              onClick={onToggleDeductQuarter}
              title="AÖF kuralı: 4 yanlış 1 doğruyu götürür hesabını aç/kapa"
            >
              <span>AÖF 4Y=1D: {deductQuarter ? 'Açık' : 'Kapalı'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Round Result Card (Inspired directly by Sabri's WhatsApp screenshot, elevated to Glassmorphic Pro) */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.7rem',
            flexWrap: 'wrap',
            gap: '0.4rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
            <Flame size={16} color="#10b981" />
            <span>Yeni turun güncel sonucu</span>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            İlerleme: {stats.answered}/{stats.total} soru (%{completionPct})
          </span>
        </div>

        {/* 5 Stat Boxes */}
        <div className="stats-grid">
          <div className="stat-box correct">
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
              {stats.correct}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Doğru
            </div>
          </div>

          <div className="stat-box wrong">
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f43f5e' }}>
              {stats.wrong}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Yanlış
            </div>
          </div>

          <div className="stat-box net">
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa' }}>
              {stats.netDisplay}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Net
            </div>
          </div>

          <div className="stat-box">
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stats.remaining}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Kalan
            </div>
          </div>

          <div className="stat-box">
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: stats.score >= 70 ? '#34d399' : stats.score >= 50 ? '#fbbf24' : 'var(--text-primary)',
              }}
            >
              {stats.score}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                /100
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Puan
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            marginTop: '0.75rem',
            height: '6px',
            borderRadius: '999px',
            background: 'var(--bg-elevated)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${completionPct}%`,
              background: `linear-gradient(90deg, ${course.color}, #10b981)`,
              transition: 'width 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>

        {/* Wrong Pool & Previous Score Info Strip */}
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.68rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.6rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Yanlış havuzu:</strong>
            {wrongPoolCount === 0 ? (
              <span style={{ color: '#34d399', fontWeight: 600 }}>Boş (Tebrikler!).</span>
            ) : (
              <span style={{ color: '#fb7185', fontWeight: 700 }}>
                {wrongPoolCount} soru tekrar bekliyor.
              </span>
            )}
            {typeof fixedScore === 'number' && (
              <span>
                Önceki tur sonucu <strong style={{ color: 'var(--text-primary)' }}>{fixedScore}/100</strong> olarak sabit.
              </span>
            )}
          </div>

          {wrongPoolCount > 0 && (
            <button
              type="button"
              className="btn-secondary"
              style={{
                padding: '0.34rem 0.72rem',
                fontSize: '0.76rem',
                background: 'rgba(244, 63, 94, 0.14)',
                borderColor: 'rgba(244, 63, 94, 0.35)',
                color: '#fb7185',
              }}
              onClick={onStartWrongPool}
            >
              <AlertTriangle size={13} />
              <span>Yanlış Havuzunu Çöz ({wrongPoolCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
