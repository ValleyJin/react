import { useState, useEffect } from 'react'
import { useCountdown } from './hooks/useCountdown'
import { useLocalStorage } from './hooks/useLocalStorage'
import './index.css'

// 뽀모도로 모드 설정
const MODES = {
  work:       { label: '집중',    seconds: 25 * 60, color: '#e53e3e', bg: '#fff5f5' },
  shortBreak: { label: '짧은 휴식', seconds:  5 * 60, color: '#38a169', bg: '#f0fff4' },
  longBreak:  { label: '긴 휴식',  seconds: 15 * 60, color: '#3182ce', bg: '#ebf8ff' },
}

// 초 → mm:ss 형식 변환
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

// --- 세션 기록 아이템 ---
function SessionItem({ session, index }) {
  return (
    <div className="session-item">
      <span className="session-index">#{index + 1}</span>
      <span className="session-mode" style={{ color: MODES[session.mode].color }}>
        {MODES[session.mode].label}
      </span>
      <span className="session-time">{session.completedAt}</span>
    </div>
  )
}

// --- 메인 앱 ---
export default function App() {
  const [mode, setMode] = useState('work')
  const currentMode = MODES[mode]

  // useCountdown: 타이머 로직이 Hook 안에 캡슐화되어 있다
  // 이 컴포넌트는 setInterval/clearInterval을 직접 다루지 않는다
  const { seconds, isRunning, start, pause, reset } = useCountdown(currentMode.seconds)

  // useLocalStorage: 새로고침해도 세션 기록이 유지된다
  const [sessions, setSessions] = useLocalStorage('pomodoro-sessions', [])

  // useEffect: 타이머가 0이 되면 완료 알림 + 세션 기록
  useEffect(() => {
    if (seconds === 0 && !isRunning) {
      // 이미 세션이 있고, 방금 완료된 경우만 기록
      const last = sessions[0]
      const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      if (!last || last.completedAt !== now) {
        setSessions((prev) => [{ mode, completedAt: now }, ...prev.slice(0, 19)])
      }
    }
  }, [seconds, isRunning])

  // useEffect: 탭 제목을 타이머에 맞게 업데이트 (부수 효과)
  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(seconds)} — ${currentMode.label}`
      : '🍅 뽀모도로 타이머'
    return () => { document.title = '🍅 뽀모도로 타이머' }
  }, [seconds, isRunning, currentMode.label])

  function handleModeChange(newMode) {
    setMode(newMode)
    reset(MODES[newMode].seconds)
  }

  function handleClearSessions() {
    setSessions([])
  }

  const workSessions = sessions.filter((s) => s.mode === 'work').length

  return (
    <div className="app" style={{ background: currentMode.bg }}>
      <div className="container">
        <h1 className="title">🍅 뽀모도로 타이머</h1>

        {/* 모드 선택 */}
        <div className="mode-tabs">
          {Object.entries(MODES).map(([key, val]) => (
            <button
              key={key}
              className={`mode-tab ${mode === key ? 'active' : ''}`}
              style={mode === key ? { background: val.color, color: 'white' } : {}}
              onClick={() => handleModeChange(key)}
            >
              {val.label}
            </button>
          ))}
        </div>

        {/* 타이머 디스플레이 */}
        <div className="timer-display" style={{ color: currentMode.color }}>
          {formatTime(seconds)}
        </div>

        {/* 진행 바 */}
        <div className="progress-track">
          <div
            className="progress-bar"
            style={{
              width: `${(1 - seconds / currentMode.seconds) * 100}%`,
              background: currentMode.color,
            }}
          />
        </div>

        {/* 컨트롤 버튼 */}
        <div className="controls">
          {!isRunning ? (
            <button
              className="control-btn start"
              style={{ background: currentMode.color }}
              onClick={start}
              disabled={seconds === 0}
            >
              ▶ 시작
            </button>
          ) : (
            <button className="control-btn pause" onClick={pause}>
              ⏸ 일시정지
            </button>
          )}
          <button className="control-btn reset" onClick={() => reset()}>
            ↺ 초기화
          </button>
        </div>

        {/* 오늘 집중 세션 수 */}
        <p className="session-count">
          오늘 완료한 집중 세션: <strong style={{ color: currentMode.color }}>{workSessions}개</strong>
        </p>

        {/* 세션 기록 */}
        {sessions.length > 0 && (
          <div className="session-log">
            <div className="session-log-header">
              <h2 className="session-log-title">세션 기록</h2>
              <button className="clear-btn" onClick={handleClearSessions}>지우기</button>
            </div>
            {sessions.map((session, i) => (
              <SessionItem key={i} session={session} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
