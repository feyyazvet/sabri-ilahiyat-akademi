import React from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Play,
  Shuffle,
  Star,
  Zap,
} from 'lucide-react';

export default function OverviewDashboard({
  courses,
  progressState,
  wrongPoolIds,
  favoriteIds,
  onSelectExam,
  onSelectWrongPool,
  onSelectMixedQuiz,
}) {
  const allQuestions = courses.flatMap((c) => c.exams.flatMap((ex) => ex.questions));
  const answers = progressState.answers || {};

  let totalSolved = 0;
  let totalCorrect = 0;
  for (const q of allQuestions) {
    const a = answers[q.id];
    if (a?.checked) {
      totalSolved += 1;
      if (q.isCanceled || a.selected === q.correctAnswer) totalCorrect += 1;
    }
  }
  const overallAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-10%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.25)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50%',
            right: '-10%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.22)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              className="pill"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
              }}
            >
              <Zap size={13} /> 0ms Anında Cevap &amp; Öğretim Motoru
            </span>
            <span
              className="pill"
              style={{
                background: 'rgba(59, 130, 246, 0.16)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              600 Çıkmış AÖF İlahiyat Sorusu
            </span>
          </div>

          <h1
            style={{
              margin: '0.55rem 0 0.35rem',
              fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Hoş Geldin! Hızlı &amp; Öğretici AÖF Çalışma Üssü
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              lineHeight: 1.6,
            }}
          >
            PDF yükleyip yapay zeka cevabı beklemeye son! Tüm 6 dersin son 5 yıla ait çıkmış AÖF
            soruları, harekeli Arapça metinler, sesli telaffuz ve her şıkkın <em>"bu ne anlama gelir?"</em>{' '}
            açıklaması burada milisaniyeler içinde hazır.
          </p>

          {/* Summary Mini Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.7rem',
              marginTop: '1.1rem',
            }}
          >
            <div className="stat-box">
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
                {totalSolved}
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/600</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Çözülen Soru
              </div>
            </div>

            <div className="stat-box">
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa' }}>
                %{overallAccuracy}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Genel Başarı
              </div>
            </div>

            <div className="stat-box">
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: wrongPoolIds.length > 0 ? '#fb7185' : '#34d399',
                }}
              >
                {wrongPoolIds.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Yanlış Havuzu
              </div>
            </div>

            <div className="stat-box">
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24' }}>
                {favoriteIds.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Yıldızlı Soru
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Course Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(305px, 1fr))',
          gap: '0.9rem',
        }}
      >
        {courses.map((course) => {
          const qs = course.exams.flatMap((e) => e.questions);
          const solved = qs.filter((q) => answers[q.id]?.checked).length;
          const correct = qs.filter(
            (q) =>
              answers[q.id]?.checked &&
              (q.isCanceled || answers[q.id].selected === q.correctAnswer)
          ).length;
          const wrongCount = qs.filter((q) => wrongPoolIds.includes(q.id)).length;
          const pct = Math.round((solved / qs.length) * 100);
          const acc = solved > 0 ? Math.round((correct / solved) * 100) : 0;

          return (
            <div
              key={course.id}
              className="glass-card"
              style={{
                padding: '1.15rem 1.2rem',
                borderTop: `3px solid ${course.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.85rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    className="pill"
                    style={{
                      background: `${course.color}20`,
                      color: course.color,
                      border: `1px solid ${course.color}40`,
                    }}
                  >
                    {course.code} • 5 Sınav
                  </span>

                  {solved > 0 && (
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: acc >= 70 ? '#34d399' : '#fbbf24',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Award size={14} /> %{acc} Başarı
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    margin: '0.55rem 0 0.28rem',
                    fontSize: '1.08rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                  }}
                >
                  {course.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                  }}
                >
                  {course.description}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  <span>İlerleme: {solved}/100 soru</span>
                  <span>%{pct}</span>
                </div>
                <div
                  style={{
                    height: '6px',
                    borderRadius: '999px',
                    background: 'var(--bg-elevated)',
                    overflow: 'hidden',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: course.color,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '0.52rem 0.75rem',
                      fontSize: '0.8rem',
                      background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)`,
                      boxShadow: `0 6px 16px -6px ${course.color}88`,
                    }}
                    onClick={() => onSelectExam(course.id, course.exams[0].id)}
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Testlere Başla</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '0.52rem 0.68rem', fontSize: '0.78rem' }}
                    onClick={() => onSelectMixedQuiz(course.id)}
                    title="100 sorudan rastgele 20 soruluk karma deneme"
                  >
                    <Shuffle size={14} color={course.color} />
                    <span>Karma</span>
                  </button>

                  {wrongCount > 0 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{
                        padding: '0.52rem 0.68rem',
                        fontSize: '0.78rem',
                        color: '#fb7185',
                        borderColor: 'rgba(244, 63, 94, 0.35)',
                      }}
                      onClick={() => onSelectWrongPool(course.id)}
                      title="Bu dersteki yanlışlarını hemen çöz"
                    >
                      <AlertTriangle size={14} />
                      <span>{wrongCount}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <Flame size={20} color="#f59e0b" />
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Akıllı Çalışma Tavsiyesi:</strong>{' '}
            İlk turda <strong style={{ color: '#34d399' }}>Anında Kontrol (0ms)</strong> modunda
            hızla ilerle; yanlış yaptığın sorular otomatik olarak dersin{' '}
            <strong style={{ color: '#fb7185' }}>Yanlış Havuzu</strong>na birikir. Sınava yakın
            sadece yanlış havuzunu ve Karma Denemeyi çözerek 100/100 hedefle!
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={14} color="#10b981" /> İlerleme cihazında otomatik kaydedilir
        </span>
      </div>
    </div>
  );
}
