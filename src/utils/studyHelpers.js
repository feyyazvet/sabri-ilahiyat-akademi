/**
 * Arapça karakter algılama, seslendirme (TTS) ve sınav puanlama yardımcıları.
 */

export const ARABIC_REGEX = /[\u0600-\u06FF]/;

export function hasArabic(text) {
  return Boolean(text && ARABIC_REGEX.test(text));
}

export function stripHtml(text) {
  return (text || '').replace(/<[^>]+>/g, '');
}

/**
 * Verilen Arapça metni tarayıcı ses sentezleyicisi ile (ar-SA) seslendirir.
 */
export function speakArabic(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  const clean = stripHtml(text)
    .replace(/[-–—_]{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  const voices = window.speechSynthesis.getVoices();
  const arabicVoice =
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ar')) || null;
  if (arabicVoice) {
    utterance.voice = arabicVoice;
  }
  utterance.lang = 'ar-SA';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Bir oturumdaki (test, yanlış havuzu veya karma deneme) Doğru, Yanlış, Net, Kalan ve Puan hesaplaması.
 */
export function computeSessionStats(questions, answersMap, deductQuarter = false) {
  let correct = 0;
  let wrong = 0;
  let pendingSelected = 0;

  for (const q of questions) {
    if (q.isCanceled) {
      correct += 1;
      continue;
    }
    const entry = answersMap[q.id];
    if (!entry) continue;
    if (!entry.checked) {
      if (entry.selected) pendingSelected += 1;
      continue;
    }
    if (entry.selected === q.correctAnswer) {
      correct += 1;
    } else {
      wrong += 1;
    }
  }

  const total = questions.length;
  const remaining = Math.max(0, total - (correct + wrong));
  const rawNet = deductQuarter ? Math.max(0, correct - wrong * 0.25) : correct;
  const netDisplay = Number.isInteger(rawNet) ? String(rawNet) : rawNet.toFixed(2);
  const score = total > 0 ? Math.round((rawNet / total) * 100) : 0;

  return {
    total,
    correct,
    wrong,
    pendingSelected,
    remaining,
    net: rawNet,
    netDisplay,
    score,
    answered: correct + wrong,
  };
}

export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = String(Math.floor(s / 60)).padStart(2, '0');
  const secs = String(s % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}
