import React from 'react';
import {
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  Languages,
  ScrollText,
  Landmark,
  HeartHandshake,
  Sparkles,
  Compass,
  RotateCcw,
  AlertTriangle,
  Shuffle,
  Star,
  Sun,
  Moon,
  Search,
  X,
} from 'lucide-react';

const COURSE_ICONS = {
  arapca: Languages,
  hadis: ScrollText,
  tarih: Landmark,
  ahlak: HeartHandshake,
  ibadet: Compass,
  inanc: Sparkles,
};

export default function Sidebar({
  courses,
  expandedCourseId,
  onToggleCourse,
  activeView,
  onSelectOverview,
  onSelectExam,
  onSelectWrongPool,
  onSelectMixedQuiz,
  onSelectFavorites,
  progressState,
  wrongPoolIds,
  favoriteIds,
  lightTheme,
  onToggleTheme,
  onOpenSearch,
  onResetAll,
  isOpen,
  onClose,
}) {
  const totalSolved = Object.values(progressState.answers || {}).filter((a) => a.checked).length;

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Ders Navigasyonu">
        {/* Branding Header with high-contrast white box per global rules */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.1rem 1rem 0.9rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.96)',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            >
              <img
                src="/logo.svg"
                alt="İlahiyat Akademi Logo"
                style={{ height: '32px', width: '32px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                İlahiyat Akademi
              </div>
              <div
                style={{
                  fontSize: '0.71rem',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                AÖF Akıllı Çalışma • {totalSolved}/600
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mobile-only btn-secondary"
            style={{ padding: '0.4rem' }}
            onClick={onClose}
            aria-label="Menüyü Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-scroll">
          {/* Quick Actions: Overview & Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.5rem 0 0.85rem' }}>
            <button
              type="button"
              className={`nav-item-btn ${activeView.type === 'overview' ? 'active' : ''}`}
              onClick={() => {
                onSelectOverview();
                onClose();
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <LayoutDashboard size={17} color="var(--brand-primary)" />
                <span>Genel Bakış &amp; İstatistik</span>
              </span>
              <span
                className="pill"
                style={{
                  background: 'rgba(16, 185, 129, 0.14)',
                  color: 'var(--brand-light)',
                  fontSize: '0.68rem',
                }}
              >
                6 Ders
              </span>
            </button>

            <button
              type="button"
              className="nav-item-btn"
              onClick={() => {
                onOpenSearch();
                onClose();
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Search size={17} color="#60a5fa" />
                <span>600 Soruda Kavram Ara</span>
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                Ctrl+K
              </span>
            </button>
          </div>

          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'var(--text-muted)',
              padding: '0 0.5rem 0.45rem',
            }}
          >
            Dersler &amp; Çıkmış Sınavlar
          </div>

          {/* Collapsible Accordion Course Modules */}
          {courses.map((course) => {
            const Icon = COURSE_ICONS[course.id] || BookOpen;
            const isExpanded = expandedCourseId === course.id;
            const courseQuestionIds = course.exams.flatMap((ex) => ex.questions.map((q) => q.id));
            const courseSolvedCount = courseQuestionIds.filter(
              (id) => progressState.answers?.[id]?.checked
            ).length;
            const courseWrongCount = courseQuestionIds.filter((id) => wrongPoolIds.includes(id)).length;
            const courseFavCount = courseQuestionIds.filter((id) => favoriteIds.includes(id)).length;

            return (
              <div key={course.id} className="accordion-group">
                <button
                  type="button"
                  className={`accordion-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => onToggleCourse(course.id)}
                  style={{
                    borderLeft: isExpanded ? `3px solid ${course.color}` : '3px solid transparent',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: `${course.color}22`,
                        color: course.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} />
                    </span>
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {course.title}
                    </span>
                  </span>

                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: courseSolvedCount === 100 ? '#10b981' : 'var(--text-muted)',
                      }}
                    >
                      {courseSolvedCount}/100
                    </span>
                    <ChevronRight
                      size={15}
                      style={{
                        color: 'var(--text-muted)',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </span>
                </button>

                {isExpanded && (
                  <div
                    className="accordion-children"
                    style={{ borderLeft: `2px solid ${course.color}35` }}
                  >
                    {course.exams.map((exam) => {
                      const isActive =
                        activeView.type === 'exam' && activeView.examId === exam.id;
                      const fixedScore = progressState.firstRoundScores?.[exam.id];
                      const examAnswered = exam.questions.filter(
                        (q) => progressState.answers?.[q.id]?.checked
                      ).length;

                      return (
                        <button
                          key={exam.id}
                          type="button"
                          className={`child-link ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            onSelectExam(course.id, exam.id);
                            onClose();
                          }}
                          style={
                            isActive
                              ? {
                                  background: `${course.color}22`,
                                  border: `1px solid ${course.color}45`,
                                }
                              : undefined
                          }
                        >
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background:
                                  examAnswered === 20
                                    ? '#10b981'
                                    : examAnswered > 0
                                    ? course.color
                                    : 'var(--text-muted)',
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {exam.shortTitle}
                            </span>
                          </span>
                          {typeof fixedScore === 'number' ? (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '0.12rem 0.4rem',
                                borderRadius: '6px',
                                background:
                                  fixedScore >= 70
                                    ? 'rgba(16, 185, 129, 0.16)'
                                    : 'rgba(245, 158, 11, 0.16)',
                                color: fixedScore >= 70 ? '#34d399' : '#fbbf24',
                              }}
                            >
                              {fixedScore}p
                            </span>
                          ) : examAnswered > 0 ? (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {examAnswered}/20
                            </span>
                          ) : null}
                        </button>
                      );
                    })}

                    {/* Course Wrong Pool */}
                    <button
                      type="button"
                      className={`child-link ${
                        activeView.type === 'wrongPool' && activeView.courseId === course.id
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        onSelectWrongPool(course.id);
                        onClose();
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <AlertTriangle size={13} color={courseWrongCount > 0 ? '#f43f5e' : '#10b981'} />
                        <span>Yanlış Havuzu</span>
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.42rem',
                          borderRadius: '999px',
                          background:
                            courseWrongCount > 0
                              ? 'rgba(244, 63, 94, 0.18)'
                              : 'rgba(16, 185, 129, 0.14)',
                          color: courseWrongCount > 0 ? '#fb7185' : '#34d399',
                        }}
                      >
                        {courseWrongCount > 0 ? courseWrongCount : 'Boş'}
                      </span>
                    </button>

                    {/* Course Mixed 20-Q Trial */}
                    <button
                      type="button"
                      className={`child-link ${
                        activeView.type === 'mixed' && activeView.courseId === course.id
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        onSelectMixedQuiz(course.id);
                        onClose();
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Shuffle size={13} color={course.color} />
                        <span>Karma 20 Soru Denemesi</span>
                      </span>
                    </button>

                    {/* Course Favorites */}
                    {courseFavCount > 0 && (
                      <button
                        type="button"
                        className={`child-link ${
                          activeView.type === 'favorites' && activeView.courseId === course.id
                            ? 'active'
                            : ''
                        }`}
                        onClick={() => {
                          onSelectFavorites(course.id);
                          onClose();
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Star size={13} color="#f59e0b" fill="#f59e0b" />
                          <span>Yıldızlı Sorular</span>
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#fbbf24',
                          }}
                        >
                          {courseFavCount}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1, fontSize: '0.76rem', padding: '0.48rem 0.6rem' }}
            onClick={onToggleTheme}
            title="Karanlık / Aydınlık Tema"
          >
            {lightTheme ? <Moon size={14} /> : <Sun size={14} />}
            <span>{lightTheme ? 'Gece Modu' : 'Gündüz Modu'}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.76rem', padding: '0.48rem 0.6rem', color: '#fb7185' }}
            onClick={onResetAll}
            title="Tüm ilerlemeyi sıfırla"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </aside>
    </>
  );
}
