import { useState } from 'react'

// ============================================================
// 2강: 컴포넌트, Props, State
//
// 핵심 개념:
//   - 컴포넌트: UI를 재사용 가능한 함수 단위로 쪼갠 것
//   - props: 부모가 자식에게 넘겨주는 값 (외부에서 받는 것, 읽기 전용)
//   - state: 컴포넌트 내부에서 관리하는 값 (내부에서 바꾸는 것)
//   - 이벤트 처리: 사용자 행동에 반응하는 방법
// ============================================================

// -------------------------------------------------------
// 섹션 1: Props — 외부에서 받는 값
// ProfileCard는 데이터를 props로 받아 동일한 구조로 여러 번 렌더링된다.
// -------------------------------------------------------

// props를 받아 카드를 그리는 재사용 가능한 컴포넌트
// name, role, emoji, color, skills 모두 외부(부모)에서 넘어온 값이다.
// 이 컴포넌트 안에서는 이 값들을 바꿀 수 없다 → "읽기 전용"
function ProfileCard({ name, role, emoji, color, skills }) {
  return (
    <div className="profile-card">
      {/* emoji와 color는 props로 받은 값을 그대로 표시한다 */}
      <div className="avatar" style={{ background: color }}>
        {emoji}
      </div>
      <div className="profile-name">{name}</div>
      <div className="profile-role">{role}</div>
      <div className="profile-skills">
        {/* 배열 props를 map으로 렌더링 */}
        {skills.map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>
    </div>
  )
}

// 같은 ProfileCard 컴포넌트에 다른 props를 넣어 3번 재사용한다.
// "컴포넌트는 틀(함수), props는 그 틀에 넣는 재료"
function PropsSection() {
  const members = [
    { name: '김민준', role: '프론트엔드', emoji: '👨‍💻', color: '#bee3f8', skills: ['React', 'CSS'] },
    { name: '이서연', role: '백엔드', emoji: '👩‍💻', color: '#c6f6d5', skills: ['Node.js', 'DB'] },
    { name: '박도윤', role: 'DevOps', emoji: '🧑‍🔧', color: '#fefcbf', skills: ['Docker', 'CI/CD'] },
  ]

  return (
    <div className="section">
      <span className="badge badge-props">Props</span>
      <h2>컴포넌트 재사용 — Props로 데이터를 넣는다</h2>
      <p>같은 ProfileCard 컴포넌트에 다른 데이터(props)를 넣어 세 번 사용한다.</p>

      {/* 같은 ProfileCard를 3번 사용, 각각 다른 props */}
      <div className="card-grid">
        {members.map((member) => (
          // key는 React가 리스트 항목을 구별하기 위해 반드시 필요하다
          <ProfileCard key={member.name} {...member} />
        ))}
      </div>

      <p className="note">
        ProfileCard는 props를 받기만 한다. 내부에서 name이나 role을 바꾸는 코드가 없다.
        이것이 props의 핵심: 외부에서 받고, 내부에서 읽기만 한다.
      </p>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 2: State — 내부에서 바꾸는 값
// 카운터: 버튼 클릭으로 count가 바뀐다.
// -------------------------------------------------------

function CounterSection() {
  // count는 이 컴포넌트 안에서만 관리하는 상태 (state)
  // 부모가 넘겨주는 게 아니라, 이 컴포넌트 자신이 소유한다.
  const [count, setCount] = useState(0)

  return (
    <div className="section">
      <span className="badge badge-state">State</span>
      <h2>카운터 — State로 내부 값을 바꾼다</h2>
      <p>count는 이 컴포넌트가 소유한 상태다. 버튼이 setCount를 호출해 상태를 변경한다.</p>

      <div className="demo-row">
        <div className="counter-display">{count}</div>
        <div className="btn-group">
          {/* onClick에 함수를 넘긴다 — 클릭 시 setCount 호출 */}
          <button className="btn-primary" onClick={() => setCount(count + 1)}>+1</button>
          <button className="btn-danger"  onClick={() => setCount(count - 1)}>−1</button>
          {/* 초기화: setCount(0)으로 state를 원래 값으로 돌린다 */}
          <button className="btn-neutral" onClick={() => setCount(0)}>초기화</button>
        </div>
      </div>

      <p className="note">
        count는 props가 아니다 — 부모가 준 게 아니라, 이 컴포넌트가 스스로 만들고 관리한다.
        setCount를 호출하면 React가 이 컴포넌트를 다시 렌더링한다.
      </p>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 3: 이벤트 처리 — 토글과 입력
// -------------------------------------------------------

// 토글: boolean 상태 하나로 컨텐츠를 보이거나 숨긴다.
function ToggleDemo() {
  // isOpen이 true면 컨텐츠를 보여주고, false면 숨긴다.
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ marginBottom: 24 }}>
      <h3>토글 버튼</h3>

      {/* 버튼 클릭 시 isOpen을 반전(toggle)한다 */}
      <button
        className={`toggle-btn ${isOpen ? 'on' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '🔼 닫기' : '🔽 펼치기'}
      </button>

      {/* isOpen이 true일 때만 컨텐츠를 렌더링 — 조건부 렌더링 */}
      {isOpen && (
        <div className="toggle-content">
          🎉 숨겨진 내용이 나타났습니다!<br />
          <code>isOpen</code> 상태가 <strong>true</strong>일 때만 이 부분이 렌더링된다.
        </div>
      )}
    </div>
  )
}

// 입력 필드: 입력값을 state로 관리한다 (제어 컴포넌트 패턴)
function InputDemo() {
  // text는 input의 현재 값을 담는 state
  const [text, setText] = useState('')

  return (
    <div>
      <h3>텍스트 입력 (제어 컴포넌트)</h3>
      {/*
        value={text}        → state가 input의 값을 제어한다
        onChange={...}      → 입력이 바뀔 때 state를 업데이트한다
        이 패턴을 "제어 컴포넌트(Controlled Component)"라 한다.
      */}
      <input
        className="text-input"
        type="text"
        placeholder="여기에 입력하세요..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="input-preview">
        {text
          ? <><strong>입력값:</strong> {text} <span style={{ color: '#a0aec0' }}>({text.length}자)</span></>
          : <span style={{ color: '#a0aec0' }}>입력하면 여기에 실시간으로 표시됩니다.</span>
        }
      </div>
    </div>
  )
}

function EventSection() {
  return (
    <div className="section">
      <span className="badge badge-event">이벤트</span>
      <h2>이벤트 처리 — 토글 & 입력</h2>
      <ToggleDemo />
      <InputDemo />
    </div>
  )
}

// -------------------------------------------------------
// 섹션 4: Props vs State 비교표
// -------------------------------------------------------

function CompareSection() {
  return (
    <div className="section">
      <h2>Props vs State 한눈에 비교</h2>
      <table className="compare-table">
        <thead>
          <tr>
            <th>구분</th>
            <th>Props</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>출처</td>
            <td>부모 컴포넌트에서 받는다</td>
            <td>컴포넌트 내부에서 만든다</td>
          </tr>
          <tr>
            <td>변경 가능?</td>
            <td>❌ 읽기 전용 (변경 불가)</td>
            <td>✅ setXxx() 함수로 변경</td>
          </tr>
          <tr>
            <td>변경 시 결과</td>
            <td>부모가 props를 바꾸면 재렌더링</td>
            <td>setXxx() 호출 시 재렌더링</td>
          </tr>
          <tr>
            <td>사용 목적</td>
            <td>컴포넌트를 재사용 가능하게 만들기</td>
            <td>컴포넌트 내부의 동적 데이터 관리</td>
          </tr>
          <tr>
            <td>비유</td>
            <td>함수의 매개변수</td>
            <td>함수 내부의 지역 변수 (단, React가 기억)</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// -------------------------------------------------------
// 메인 앱
// -------------------------------------------------------
export default function App() {
  return (
    <div className="page">
      <h1>2강: 컴포넌트, Props, State</h1>
      <p className="subtitle">재사용 가능한 컴포넌트 · Props(외부) · State(내부) · 이벤트 처리</p>

      <PropsSection />
      <CounterSection />
      <EventSection />
      <CompareSection />
    </div>
  )
}
