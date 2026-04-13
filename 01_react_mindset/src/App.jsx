import { useState } from 'react'
import './index.css'

// 기분 데이터 — 이 배열 자체는 절대 바뀌지 않는다 (상수)
// React에서 "변하는 것(state)"과 "변하지 않는 것(상수)"을 구분하는 것이 첫 번째 습관이다
const MOODS = [
  { id: 1, emoji: '😄', label: '최고', bg: '#fefcbf', color: '#744210', msg: '오늘 정말 좋은 하루네요! 계속 이 기분 유지해요 🎉' },
  { id: 2, emoji: '🙂', label: '좋음',  bg: '#c6f6d5', color: '#22543d', msg: '괜찮은 하루를 보내고 있군요. 잘 하고 있어요 👍' },
  { id: 3, emoji: '😐', label: '보통',  bg: '#e2e8f0', color: '#4a5568', msg: '평범한 하루도 소중해요. 그것으로 충분합니다.' },
  { id: 4, emoji: '😔', label: '별로',  bg: '#fed7d7', color: '#742a2a', msg: '힘든 하루군요. 오늘 수고 많았어요 🍵' },
  { id: 5, emoji: '😤', label: '화남',  bg: '#fbb6ce', color: '#702459', msg: '많이 지치셨군요. 잠깐 쉬어가도 괜찮아요.' },
]

// --- 기분 선택 버튼 컴포넌트 ---
// mood, isSelected, onClick 세 가지 props를 받는다
// 이 컴포넌트는 받은 데이터를 표시할 뿐, 자체 state가 없다
function MoodButton({ mood, isSelected, onClick }) {
  return (
    <button
      className={`mood-btn ${isSelected ? 'selected' : ''}`}
      style={isSelected ? { background: mood.bg, borderColor: mood.color } : {}}
      onClick={() => onClick(mood)}
    >
      <span className="mood-emoji">{mood.emoji}</span>
      <span className="mood-label">{mood.label}</span>
    </button>
  )
}

// --- 기록 아이템 컴포넌트 ---
function HistoryItem({ entry }) {
  return (
    <div className="history-item" style={{ borderLeft: `3px solid ${entry.mood.color}` }}>
      <span className="history-emoji">{entry.mood.emoji}</span>
      <span className="history-mood">{entry.mood.label}</span>
      <span className="history-time">{entry.time}</span>
    </div>
  )
}

// --- 메인 앱 ---
export default function App() {
  // selectedMood: 현재 선택된 기분 객체 (null = 선택 안 됨)
  // → 이 하나의 state가 배경색, 메시지, 버튼 스타일을 모두 결정한다 (UI = f(state))
  const [selectedMood, setSelectedMood] = useState(null)

  // history: 기록된 기분 목록
  const [history, setHistory] = useState([])

  function handleSelect(mood) {
    // 같은 버튼을 다시 누르면 선택 해제
    setSelectedMood(prev => prev?.id === mood.id ? null : mood)
  }

  function handleSave() {
    if (!selectedMood) return
    setHistory(prev => [
      {
        mood: selectedMood,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ])
    setSelectedMood(null)
  }

  return (
    // selectedMood가 바뀌면 배경색이 자동으로 바뀐다 — UI = f(state) 체험
    <div
      className="app"
      style={{ background: selectedMood?.bg ?? '#f7f8fa' }}
    >
      <div className="container">
        <h1 className="title">오늘 기분이 어때요?</h1>
        <p className="subtitle">지금 기분을 선택하세요</p>

        {/* 기분 버튼 목록 */}
        <div className="mood-grid">
          {MOODS.map((mood) => (
            <MoodButton
              key={mood.id}
              mood={mood}
              isSelected={selectedMood?.id === mood.id}
              onClick={handleSelect}
            />
          ))}
        </div>

        {/* 선택된 기분 메시지 영역 — selectedMood 상태에 따라 조건부 렌더링 */}
        <div className="message-area">
          {selectedMood ? (
            <>
              <p className="message" style={{ color: selectedMood.color }}>
                {selectedMood.msg}
              </p>
              <button className="save-btn" onClick={handleSave}>
                기록하기
              </button>
            </>
          ) : (
            <p className="placeholder">기분을 선택하면 메시지가 나타납니다</p>
          )}
        </div>

        {/* 기록 이력 — history 배열을 map으로 렌더링 */}
        {history.length > 0 && (
          <div className="history">
            <h2 className="history-title">오늘의 기록 ({history.length}개)</h2>
            {history.map((entry, i) => (
              <HistoryItem key={i} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
