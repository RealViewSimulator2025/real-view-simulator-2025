'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { QUESTIONS } from '../questions';

export default function InterviewPage() {
  const [step, setStep] = useState('intro'); // intro | asking | recording | reviewing | finished
  const [idx, setIdx] = useState(0);
  const [qa, setQa] = useState([]);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const [permission, setPermission] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const question = useMemo(() => QUESTIONS[idx] ?? null, [idx]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => { setPermission('ok'); stream.getTracks().forEach(t => t.stop()); })
      .catch(() => setPermission('denied'));
  }, []);

  async function speak(text) {
    const res = await fetch('/api/tts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    if (audioRef.current) { audioRef.current.src = url; await audioRef.current.play(); }
  }

  async function startQuestion() {
    setStep('asking');
    await speak(`Question ${idx + 1}. ${question}`);
    setStep('recording');
    await startRecording();
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunksRef.current = [];
    mr.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      await transcribeAnswer(blob);
      stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorderRef.current = mr;
    mr.start();
  }

  function stopRecording() { mediaRecorderRef.current?.stop(); }

  async function transcribeAnswer(blob) {
    setTranscribing(true);
    const res = await fetch('/api/transcribe', {
      method: 'POST', headers: { 'Content-Type': blob.type || 'audio/webm' }, body: blob
    });
    const data = await res.json();
    setTranscribing(false);

    const answerText = data.text || '(no transcript)';
    setQa(prev => [...prev, { q: question, a: answerText }]);

    if (idx < QUESTIONS.length - 1) { setIdx(i => i + 1); setStep('reviewing'); }
    else {
      setStep('finished');
      const fb = await getFeedback([...qa, { q: question, a: answerText }]);
      setFeedback(fb);
    }
  }

  async function getFeedback(allQa) {
    const res = await fetch('/api/score', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qa: allQa })
    });
    const data = await res.json();
    return data.feedback || 'No feedback';
  }

  return (
    <main style={{ maxWidth: 860, margin: '40px auto', padding: 16 }}>
      <audio ref={audioRef} hidden />
      <h1>Real View Simulator – Interview</h1>

      {permission === 'denied' && <p style={{ color: 'red' }}>Mic permission denied. Enable your mic.</p>}

      {step === 'intro' && (
        <>
          <p>We’ll ask {QUESTIONS.length} questions out loud. Answer with your mic. Feedback at the end.</p>
          <button onClick={startQuestion} disabled={!question || permission!=='ok'}>Start Interview</button>
        </>
      )}

      {(step === 'asking' || step === 'recording') && (
        <>
          <h3>Question {idx + 1} of {QUESTIONS.length}</h3>
          <p>{question}</p>
          {step === 'recording' && (
            <>
              <p>Recording… speak when ready.</p>
              <button onClick={stopRecording}>Finish Answer</button>
            </>
          )}
        </>
      )}

      {step === 'reviewing' && (
        <>
          <p>Answer saved. Ready for the next question?</p>
          <button onClick={startQuestion}>Next question</button>
        </>
      )}

      {transcribing && <p>Transcribing your answer…</p>}

      {step === 'finished' && (
        <>
          <h2>Interview Complete</h2>
          <h3>Feedback</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{feedback}</pre>
        </>
      )}

      {!!qa.length && (
        <>
          <h3>Transcript</h3>
          <ul>
            {qa.map(x => (
              <li key={uuid()}>
                <strong>Q:</strong> {x.q}<br />
                <strong>A:</strong> {x.a}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}