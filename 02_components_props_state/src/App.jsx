import { useState } from 'react'
import './index.css'

// 팀원 데이터 — 고정 상수 (props로 넘겨줄 재료)
const MEMBERS = [
  { id: 1, name: '김민준', role: '프론트엔드', emoji: '👨‍💻', skills: ['React', 'TypeScript', 'CSS'] },
  { id: 2, name: '이서연', role: '백엔드',     emoji: '👩‍💻', skills: ['Node.js', 'PostgreSQL', 'Docker'] },
  { id: 3, name: '박도윤', role: 'UI 디자이너',emoji: '🎨',   skills: ['Figma', 'Tailwind', 'Motion'] },
  { id: 4, name: '최지우', role: '데이터 분석',emoji: '📊',   skills: ['Python', 'SQL', 'Tableau'] },
]

// --- ProfileCard 컴포넌트 ---
// props: 외부(부모)에서 받는 값 — name, role, emoji, skills, likes, onLike
// 같은 컴포넌트를 여러 번 재사용할 수 있는 이유가 바로 props 덕분이다
function ProfileCard({ name, role, emoji, skills, likes, onLike }) {
  // isExpanded: 이 카드만 알면 되는 내부 상태 → 다른 카드에 영향 없음
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="card">
      <div className="card-top">
        <div className="avatar">{emoji}</div>
        <div className="card-info">
          <div className="card-name">{name}</div>
          <div className="card-role">{role}</div>
        </div>
        {/* 좋아요 버튼 — onLike는 부모에서 내려온 함수 */}
        <button
          className={`like-btn ${likes > 0 ? 'liked' : ''}`}
          onClick={onLike}
        >
          ❤️ {likes}
        </button>
      </div>

      {/* 스킬 태그들 — skills 배열을 map으로 렌더링 */}
      <div className="skills">
        {skills.map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>

      {/* 더보기 — 카드 내부 state로 관리 (다른 카드와 독립적) */}
      <button
        className="expand-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▲ 접기' : '▼ 자세히 보기'}
      </button>

      {isExpanded && (
        <div className="card-detail">
          <p>👋 안녕하세요! <strong>{name}</strong>입니다.</p>
          <p>현재 <strong>{role}</strong> 포지션에서 일하고 있어요.</p>
          <p>주로 {skills.join(', ')}을(를) 사용합니다.</p>
        </div>
      )}
    </div>
  )
}

// --- 검색창 컴포넌트 ---
// query, onChange를 props로 받는다 (제어 컴포넌트 패턴)
function SearchBar({ query, onChange }) {
  return (
    <div className="search-wrap">
      <input
        className="search-input"
        type="text"
        placeholder="이름 또는 역할로 검색..."
        value={query}           // state가 input 값을 제어
        onChange={(e) => onChange(e.target.value)}
      />
      {query && (
        <button className="clear-btn" onClick={() => onChange('')}>✕</button>
      )}
    </div>
  )
}

// --- 메인 앱 ---
export default function App() {
  // likes: 팀원별 좋아요 수 — { id: count } 형태
  const [likes, setLikes] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 })

  // query: 검색어 state
  const [query, setQuery] = useState('')

  // 검색 필터링 — query가 바뀔 때마다 재계산 (별도 state 필요 없음)
  const filtered = MEMBERS.filter(
    (m) =>
      m.name.includes(query) ||
      m.role.includes(query) ||
      m.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
  )

  function handleLike(id) {
    setLikes((prev) => ({ ...prev, [id]: prev[id] + 1 }))
  }

  const totalLikes = Object.values(likes).reduce((a, b) => a + b, 0)

  return (
    <div className="app">
      <div className="container">
        {/* 헤더 */}
        <div className="header">
          <div>
            <h1 className="title">우리 팀 소개</h1>
            <p className="subtitle">팀원 {MEMBERS.length}명 · 좋아요 {totalLikes}개</p>
          </div>
        </div>

        {/* 검색창 */}
        <SearchBar query={query} onChange={setQuery} />

        {/* 검색 결과 없음 */}
        {filtered.length === 0 && (
          <p className="empty">"{query}"에 해당하는 팀원이 없습니다.</p>
        )}

        {/* 명함 그리드 — 같은 ProfileCard 컴포넌트를 데이터만 바꿔 4번 렌더링 */}
        <div className="grid">
          {filtered.map((member) => (
            <ProfileCard
              key={member.id}
              name={member.name}
              role={member.role}
              emoji={member.emoji}
              skills={member.skills}
              likes={likes[member.id]}
              onLike={() => handleLike(member.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
