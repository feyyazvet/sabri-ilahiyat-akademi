import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import coursesData from './data/coursesData.json';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './components/OverviewDashboard';
import ScoreBoard from './components/ScoreBoard';
import QuestionCard from './components/QuestionCard';
import TeachingPanel from './components/TeachingPanel';
import SearchModal from './components/SearchModal';
import { computeSessionStats } from './utils/studyHelpers';

const STORAGE_KEY = 'sabri_ilahiyat_akademi_v1';

const DEFAULT_PROGRESS = {
  answers: {},
  wrongPool: [],
  firstRoundScores: {},
  favorites: [],
  studyMode: 'instant',
  deductQuarter: false,
  lightTheme: false,
  arabicScale: 1,
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [expandedCourseId, setExpandedCourseId] = useState('arapca');
  const [activeView, setActiveView] = useState({ type: 'overview' }); // overview | exam | wrongPool | mixed | favorites
  const [questionIndex, setQuestionIndex] = useState(0);

  // Ephemeral session states for Wrong Pool, Mixed Quiz, and Exam Simulation
  const [mixedQuestionIds, setMixedQuestionIds] = useState([]);
  const [transientAnswers, setTransientAnswers] = useState({});
  const [examTimerSeconds, setExamTimerSeconds] = useState(30 * 60);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Persist progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  // Apply theme class & Arabic scale CSS variable
  useEffect(() => {
    if (progress.lightTheme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    document.documentElement.style.setProperty('--arabic-scale', String(progress.arabicScale || 1));
  }, [progress.lightTheme, progress.arabicScale]);

  // Exam timer countdown
  useEffect(() => {
    if (
      activeView.type === 'overview' ||
      progress.studyMode !== 'exam' ||
      isExamSubmitted
    ) {
      return;
    }
    const timer = setInterval(() => {
      setExamTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsExamSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeView.type, progress.studyMode, isExamSubmitted]);

  // Build quick lookup map for all 600 questions
  const questionLookup = useMemo(() => {
    const map = {};
    for (const course of coursesData) {
      for (const exam of course.exams) {
        for (const q of exam.questions) {
          map[q.id] = { course, exam, question: q };
        }
      }
    }
    return map;
  }, []);

  // Determine active course & session questions list
  const sessionData = useMemo(() => {
    if (activeView.type === 'overview') return null;
    const course = coursesData.find((c) => c.id === activeView.courseId) || coursesData[0];

    if (activeView.type === 'exam') {
      const exam = course.exams.find((e) => e.id === activeView.examId) || course.exams[0];
      return {
        course,
        exam,
        questions: exam.questions,
        title: exam.title,
        subtitle: `${course.description}`,
        badge: `Test ${exam.testNumber}/5`,
        pdfFile: exam.pdfFile,
        usesPersistentAnswers: progress.studyMode !== 'exam',
      };
    }

    if (activeView.type === 'wrongPool') {
      const courseQIds = new Set(course.exams.flatMap((e) => e.questions.map((q) => q.id)));
      const poolQs = progress.wrongPool
        .filter((id) => courseQIds.has(id) && questionLookup[id])
        .map((id) => questionLookup[id].question);

      return {
        course,
        exam: null,
        questions: poolQs,
        title: `${course.title} • Yanlış Havuzu Tekrarı`,
        subtitle: 'Yanlış yaptığın soruları doğru çözdükçe havuzdan otomatik temizlenir.',
        badge: 'Yanlış Havuzu',
        pdfFile: null,
        usesPersistentAnswers: false,
      };
    }

    if (activeView.type === 'mixed') {
      const mixedQs = mixedQuestionIds
        .map((id) => questionLookup[id]?.question)
        .filter(Boolean);
      return {
        course,
        exam: null,
        questions: mixedQs,
        title: `${course.title} • Karma 20 Soru Denemesi`,
        subtitle: 'Son 5 yılın 100 soruluk havuzundan rastgele seçilmiş 20 soru.',
        badge: 'Karma Deneme',
        pdfFile: null,
        usesPersistentAnswers: false,
      };
    }

    if (activeView.type === 'favorites') {
      const courseQIds = new Set(course.exams.flatMap((e) => e.questions.map((q) => q.id)));
      const favQs = progress.favorites
        .filter((id) => courseQIds.has(id) && questionLookup[id])
        .map((id) => questionLookup[id].question);
      return {
        course,
        exam: null,
        questions: favQs,
        title: `${course.title} • Yıldızlı Sorular`,
        subtitle: 'Önemli veya zor olarak işaretlediğin sorular.',
        badge: 'Favoriler',
        pdfFile: null,
        usesPersistentAnswers: false,
      };
    }

    return null;
  }, [activeView, progress.wrongPool, progress.favorites, progress.studyMode, mixedQuestionIds, questionLookup]);

  const activeAnswersMap = sessionData?.usesPersistentAnswers
    ? progress.answers
    : transientAnswers;

  const currentQuestion = sessionData?.questions[questionIndex] || null;

  // Compute live session stats
  const sessionStats = useMemo(() => {
    if (!sessionData) return null;
    if (progress.studyMode === 'exam' && !isExamSubmitted) {
      // In exam simulation before submission, count selected answers as pending
      const total = sessionData.questions.length;
      const selectedCount = sessionData.questions.filter(
        (q) => Boolean(transientAnswers[q.id]?.selected)
      ).length;
      return {
        total,
        correct: 0,
        wrong: 0,
        pendingSelected: selectedCount,
        remaining: total - selectedCount,
        net: 0,
        netDisplay: '—',
        score: 0,
        answered: selectedCount,
      };
    }

    // If exam is submitted, treat all selected entries as checked
    const effectiveMap =
      progress.studyMode === 'exam' && isExamSubmitted
        ? Object.fromEntries(
            Object.entries(transientAnswers).map(([k, v]) => [k, { ...v, checked: true }])
          )
        : activeAnswersMap;

    return computeSessionStats(
      sessionData.questions,
      effectiveMap,
      progress.deductQuarter
    );
  }, [sessionData, activeAnswersMap, transientAnswers, progress.studyMode, progress.deductQuarter, isExamSubmitted]);

  // Count course-level wrong pool
  const activeCourseWrongCount = useMemo(() => {
    if (!sessionData) return 0;
    const ids = new Set(sessionData.course.exams.flatMap((e) => e.questions.map((q) => q.id)));
    return progress.wrongPool.filter((id) => ids.has(id)).length;
  }, [sessionData, progress.wrongPool]);

  // Update wrong pool & fixed score when a question is checked
  const recordCheckedOutcome = useCallback(
    (question, selectedLetter, currentAnswersSnapshot) => {
      const isCorrect = question.isCanceled || selectedLetter === question.correctAnswer;

      setProgress((prev) => {
        let nextWrongPool = [...prev.wrongPool];
        if (!isCorrect && !nextWrongPool.includes(question.id)) {
          nextWrongPool.push(question.id);
        } else if (isCorrect && activeView.type === 'wrongPool') {
          nextWrongPool = nextWrongPool.filter((id) => id !== question.id);
        }

        // Check if current exam just reached 20/20 checked for firstRoundScores
        let nextFirstScores = { ...prev.firstRoundScores };
        if (activeView.type === 'exam' && prev.studyMode !== 'exam') {
          const info = questionLookup[question.id];
          if (info && typeof nextFirstScores[info.exam.id] !== 'number') {
            const all20Checked = info.exam.questions.every(
              (eq) => eq.isCanceled || eq.id === question.id || currentAnswersSnapshot[eq.id]?.checked
            );
            if (all20Checked) {
              const mergedAnswers = {
                ...currentAnswersSnapshot,
                [question.id]: { selected: selectedLetter, checked: true },
              };
              const st = computeSessionStats(info.exam.questions, mergedAnswers, prev.deductQuarter);
              nextFirstScores[info.exam.id] = st.score;
            }
          }
        }

        return {
          ...prev,
          wrongPool: nextWrongPool,
          firstRoundScores: nextFirstScores,
        };
      });
    },
    [activeView.type, questionLookup]
  );

  const handleSelectOption = useCallback(
    (questionId, letter) => {
      if (!sessionData) return;
      const q = sessionData.questions.find((item) => item.id === questionId);
      if (!q || q.isCanceled) return;

      const isInstant = progress.studyMode === 'instant';
      const entry = { selected: letter, checked: isInstant };

      if (sessionData.usesPersistentAnswers) {
        const snapshot = { ...progress.answers, [questionId]: entry };
        setProgress((prev) => ({
          ...prev,
          answers: { ...prev.answers, [questionId]: entry },
        }));
        if (isInstant) {
          recordCheckedOutcome(q, letter, snapshot);
        }
      } else {
        setTransientAnswers((prev) => ({
          ...prev,
          [questionId]: entry,
        }));
        if (isInstant) {
          recordCheckedOutcome(q, letter, transientAnswers);
        }
      }
    },
    [sessionData, progress.studyMode, progress.answers, transientAnswers, recordCheckedOutcome]
  );

  const handleCheckConfirm = useCallback(
    (questionId) => {
      if (!sessionData) return;
      const q = sessionData.questions.find((item) => item.id === questionId);
      if (!q) return;

      if (sessionData.usesPersistentAnswers) {
        const cur = progress.answers[questionId];
        if (!cur?.selected) return;
        const snapshot = {
          ...progress.answers,
          [questionId]: { ...cur, checked: true },
        };
        setProgress((prev) => ({
          ...prev,
          answers: snapshot,
        }));
        recordCheckedOutcome(q, cur.selected, snapshot);
      } else {
        const cur = transientAnswers[questionId];
        if (!cur?.selected) return;
        const snapshot = {
          ...transientAnswers,
          [questionId]: { ...cur, checked: true },
        };
        setTransientAnswers(snapshot);
        recordCheckedOutcome(q, cur.selected, snapshot);
      }
    },
    [sessionData, progress.answers, transientAnswers, recordCheckedOutcome]
  );

  const handleFinishExamSimulation = useCallback(() => {
    if (!sessionData) return;
    setIsExamSubmitted(true);
    // Add wrong answers to wrongPool
    setProgress((prev) => {
      const nextWrong = [...prev.wrongPool];
      for (const q of sessionData.questions) {
        const ans = transientAnswers[q.id];
        if (ans?.selected && !q.isCanceled && ans.selected !== q.correctAnswer) {
          if (!nextWrong.includes(q.id)) nextWrong.push(q.id);
        }
      }
      return { ...prev, wrongPool: nextWrong };
    });
  }, [sessionData, transientAnswers]);

  // Navigation Handlers
  const openExam = useCallback((courseId, examId, startIdx = 0) => {
    setExpandedCourseId(courseId);
    setActiveView({ type: 'exam', courseId, examId });
    setQuestionIndex(startIdx);
    setTransientAnswers({});
    setIsExamSubmitted(false);
    setExamTimerSeconds(30 * 60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openWrongPool = useCallback((courseId) => {
    setExpandedCourseId(courseId);
    setActiveView({ type: 'wrongPool', courseId });
    setQuestionIndex(0);
    setTransientAnswers({});
    setIsExamSubmitted(false);
    setExamTimerSeconds(30 * 60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openMixedQuiz = useCallback((courseId) => {
    const course = coursesData.find((c) => c.id === courseId);
    if (!course) return;
    const allIds = course.exams.flatMap((e) => e.questions.map((q) => q.id));
    const shuffled = [...allIds].sort(() => Math.random() - 0.5).slice(0, 20);
    setExpandedCourseId(courseId);
    setMixedQuestionIds(shuffled);
    setActiveView({ type: 'mixed', courseId });
    setQuestionIndex(0);
    setTransientAnswers({});
    setIsExamSubmitted(false);
    setExamTimerSeconds(30 * 60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openFavorites = useCallback((courseId) => {
    setExpandedCourseId(courseId);
    setActiveView({ type: 'favorites', courseId });
    setQuestionIndex(0);
    setTransientAnswers({});
    setIsExamSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleResetSession = useCallback(() => {
    if (!sessionData) return;
    if (activeView.type === 'exam') {
      // Save current score before clearing if at least 1 question answered
      const currentStats = computeSessionStats(
        sessionData.questions,
        progress.answers,
        progress.deductQuarter
      );
      const qIds = new Set(sessionData.questions.map((q) => q.id));
      setProgress((prev) => {
        const nextAns = { ...prev.answers };
        for (const id of qIds) delete nextAns[id];
        const nextScores = { ...prev.firstRoundScores };
        if (currentStats.answered > 0 && typeof nextScores[sessionData.exam.id] !== 'number') {
          nextScores[sessionData.exam.id] = currentStats.score;
        }
        return {
          ...prev,
          answers: nextAns,
          firstRoundScores: nextScores,
        };
      });
    } else if (activeView.type === 'mixed') {
      openMixedQuiz(sessionData.course.id);
      return;
    }
    setTransientAnswers({});
    setIsExamSubmitted(false);
    setExamTimerSeconds(30 * 60);
    setQuestionIndex(0);
  }, [sessionData, activeView.type, progress.answers, progress.deductQuarter, openMixedQuiz]);

  const handleToggleFavorite = useCallback((questionId) => {
    setProgress((prev) => {
      const exists = prev.favorites.includes(questionId);
      return {
        ...prev,
        favorites: exists
          ? prev.favorites.filter((id) => id !== questionId)
          : [...prev.favorites, questionId],
      };
    });
  }, []);

  const handleResetAll = useCallback(() => {
    if (window.confirm('Tüm derslerdeki çözümlerin, puanların ve yanlış havuzun sıfırlansın mı?')) {
      setProgress((prev) => ({
        ...DEFAULT_PROGRESS,
        lightTheme: prev.lightTheme,
        arabicScale: prev.arabicScale,
      }));
      setTransientAnswers({});
      setActiveView({ type: 'overview' });
    }
  }, []);

  // Keyboard Shortcuts: Ctrl+K, A-E, 1-5, Enter, Arrows
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }
      if (searchOpen) {
        if (e.key === 'Escape') setSearchOpen(false);
        return;
      }
      if (!sessionData || !currentQuestion) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const keyUpper = e.key.toUpperCase();
      const numToLetter = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' };
      const chosenLetter = ['A', 'B', 'C', 'D', 'E'].includes(keyUpper)
        ? keyUpper
        : numToLetter[e.key] || null;

      const curAns = activeAnswersMap[currentQuestion.id];
      const isRev = Boolean(curAns?.checked) || (progress.studyMode === 'exam' && isExamSubmitted);

      if (chosenLetter && !isRev && !currentQuestion.isCanceled) {
        e.preventDefault();
        handleSelectOption(currentQuestion.id, chosenLetter);
      } else if (e.key === 'Enter') {
        if (progress.studyMode === 'confirm' && !isRev && curAns?.selected) {
          e.preventDefault();
          handleCheckConfirm(currentQuestion.id);
        } else if (questionIndex < sessionData.questions.length - 1) {
          e.preventDefault();
          setQuestionIndex((i) => i + 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (questionIndex < sessionData.questions.length - 1) {
          setQuestionIndex((i) => i + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (questionIndex > 0) {
          setQuestionIndex((i) => i - 1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    searchOpen,
    sessionData,
    currentQuestion,
    activeAnswersMap,
    progress.studyMode,
    isExamSubmitted,
    questionIndex,
    handleSelectOption,
    handleCheckConfirm,
  ]);

  // Adjust questionIndex if wrongPool shrinks
  useEffect(() => {
    if (sessionData && questionIndex >= sessionData.questions.length && sessionData.questions.length > 0) {
      setQuestionIndex(sessionData.questions.length - 1);
    }
  }, [sessionData, questionIndex]);

  const currentAnswerEntry = currentQuestion ? activeAnswersMap[currentQuestion.id] : null;
  const effectiveTeachingEntry = currentQuestion?.isCanceled
    ? { selected: 'İ', checked: true }
    : progress.studyMode === 'exam' && isExamSubmitted && currentQuestion
    ? { selected: currentAnswerEntry?.selected || 'Boş', checked: true }
    : currentAnswerEntry;

  return (
    <div className="app-shell">
      <Sidebar
        courses={coursesData}
        expandedCourseId={expandedCourseId}
        onToggleCourse={(cid) =>
          setExpandedCourseId((prev) => (prev === cid ? null : cid))
        }
        activeView={activeView}
        onSelectOverview={() => setActiveView({ type: 'overview' })}
        onSelectExam={openExam}
        onSelectWrongPool={openWrongPool}
        onSelectMixedQuiz={openMixedQuiz}
        onSelectFavorites={openFavorites}
        progressState={progress}
        wrongPoolIds={progress.wrongPool}
        favoriteIds={progress.favorites}
        lightTheme={progress.lightTheme}
        onToggleTheme={() =>
          setProgress((p) => ({ ...p, lightTheme: !p.lightTheme }))
        }
        onOpenSearch={() => setSearchOpen(true)}
        onResetAll={handleResetAll}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-area">
        {/* Sticky Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
            <button
              type="button"
              className="mobile-only btn-secondary"
              style={{ padding: '0.45rem 0.6rem' }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Menüyü Aç"
            >
              <Menu size={18} />
            </button>

            {activeView.type !== 'overview' && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.42rem 0.7rem', fontSize: '0.78rem' }}
                onClick={() => setActiveView({ type: 'overview' })}
              >
                <ArrowLeft size={15} />
                <span>Dersler</span>
              </button>
            )}

            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {sessionData ? `${sessionData.course.title} • ${sessionData.badge}` : 'Genel Bakış & 6 Ders'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.42rem 0.75rem', fontSize: '0.78rem' }}
              onClick={() => setSearchOpen(true)}
            >
              <Search size={15} color="var(--brand-primary)" />
              <span className="hide-xs">Ara</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.42rem 0.55rem' }}
              onClick={() =>
                setProgress((p) => ({ ...p, lightTheme: !p.lightTheme }))
              }
              aria-label="Tema Değiştir"
            >
              {progress.lightTheme ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </header>

        {/* Main Content Container */}
        <div className="content-container">
          {activeView.type === 'overview' || !sessionData ? (
            <OverviewDashboard
              courses={coursesData}
              progressState={progress}
              wrongPoolIds={progress.wrongPool}
              favoriteIds={progress.favorites}
              onSelectExam={openExam}
              onSelectWrongPool={openWrongPool}
              onSelectMixedQuiz={openMixedQuiz}
            />
          ) : (
            <>
              <ScoreBoard
                course={sessionData.course}
                sessionTitle={sessionData.title}
                sessionSubtitle={sessionData.subtitle}
                stats={sessionStats}
                fixedScore={
                  sessionData.exam
                    ? progress.firstRoundScores?.[sessionData.exam.id]
                    : undefined
                }
                wrongPoolCount={activeCourseWrongCount}
                onStartWrongPool={() => openWrongPool(sessionData.course.id)}
                studyMode={progress.studyMode}
                onChangeStudyMode={(mode) => {
                  setProgress((p) => ({ ...p, studyMode: mode }));
                  setIsExamSubmitted(false);
                  setExamTimerSeconds(30 * 60);
                }}
                deductQuarter={progress.deductQuarter}
                onToggleDeductQuarter={() =>
                  setProgress((p) => ({ ...p, deductQuarter: !p.deductQuarter }))
                }
                onResetSession={handleResetSession}
                pdfFile={sessionData.pdfFile}
                isArabicCourse={sessionData.course.id === 'arapca'}
                arabicScale={progress.arabicScale}
                onChangeArabicScale={(val) =>
                  setProgress((p) => ({ ...p, arabicScale: val }))
                }
                examTimerSeconds={examTimerSeconds}
                isExamSubmitted={isExamSubmitted}
                onFinishExamSimulation={handleFinishExamSimulation}
              />

              {sessionData.questions.length === 0 ? (
                <div
                  className="glass-card"
                  style={{
                    padding: '2.8rem 1.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.8rem',
                  }}
                >
                  <CheckCircle2 size={46} color="#10b981" />
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    Harika! Bu liste şu an tertemiz.
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '460px' }}>
                    {activeView.type === 'wrongPool'
                      ? `${sessionData.course.title} dersinde bekleyen yanlış sorun kalmadı. Yeni bir çıkmış test veya Karma Deneme çözebilirsin!`
                      : 'Bu listede henüz soru bulunmuyor.'}
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => openExam(sessionData.course.id, sessionData.course.exams[0].id)}
                  >
                    Test 1/5 ile Devam Et
                  </button>
                </div>
              ) : (
                <>
                  <QuestionCard
                    question={currentQuestion}
                    indexInSession={questionIndex}
                    totalInSession={sessionData.questions.length}
                    sessionBadge={sessionData.badge}
                    answerEntry={currentAnswerEntry}
                    studyMode={progress.studyMode}
                    isExamSubmitted={isExamSubmitted}
                    isFavorite={progress.favorites.includes(currentQuestion.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectOption={handleSelectOption}
                    onCheckConfirm={handleCheckConfirm}
                    onPrev={() => setQuestionIndex((i) => Math.max(0, i - 1))}
                    onNext={() =>
                      setQuestionIndex((i) =>
                        Math.min(sessionData.questions.length - 1, i + 1)
                      )
                    }
                    questionsList={sessionData.questions}
                    answersMap={activeAnswersMap}
                    favoritesList={progress.favorites}
                    onJumpTo={(idx) => setQuestionIndex(idx)}
                    courseColor={sessionData.course.color}
                  />

                  <TeachingPanel
                    question={currentQuestion}
                    answerEntry={effectiveTeachingEntry}
                    isWrongPoolMode={activeView.type === 'wrongPool'}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        courses={coursesData}
        onJumpToQuestion={openExam}
      />
    </div>
  );
}
