import { useState } from 'react'

// ============================================================
// 1강: 리액트의 사고방식
// 핵심 메시지: UI = f(state)
//   상태(state)가 바뀌면 React가 UI를 다시 계산(렌더링)한다.
//   개발자는 "어떻게 DOM을 바꿀지"가 아니라
//   "지금 상태가 무엇인지"만 선언하면 된다.
// ============================================================

// --- 섹션 1: 명령형 vs 선언형 비교 설명 ---
function CompareSection() {
  return (
    <div className="section">
      <span className="label label-vanilla">개념 비교</span>
      <h2>명령형(Imperative) vs 선언형(Declarative)</h2>

      <div className="compare-grid">
        {/* 왼쪽: 바닐라 JS 방식 (명령형) */}
        <div className="compare-box">
          <h3>🍦 바닐라 JS (명령형)</h3>
          <p>"어떻게 바꿀지" 직접 지시</p>
          <pre>{`// 클릭할 때마다 DOM을 직접 수정
const btn = document.querySelector('#like-btn')
const count = document.querySelector('#count')
let likes = 0

btn.addEventListener('click', () => {
  likes++
  // 개발자가 직접 DOM을 업데이트
  count.textContent = likes + '개'
  btn.textContent = '❤️ ' + likes
  if (likes > 0) {
    btn.style.background = 'red'
  }
})`}</pre>
          <p className="note">문제: 상태와 UI가 흩어져 있어 복잡해질수록 관리가 어렵다.</p>
        </div>

        {/* 오른쪽: React 방식 (선언형) */}
        <div className="compare-box">
          <h3>⚛️ React (선언형)</h3>
          <p>"지금 상태가 무엇인지" 선언</p>
          <pre>{`// 상태만 바꾸면 React가 UI를 다시 그린다
function LikeButton() {
  const [likes, setLikes] = useState(0)

  return (
    <button onClick={() => setLikes(likes + 1)}>
      ❤️ {likes}개
    </button>
  )
  // DOM 조작 코드가 없다!
  // likes가 바뀌면 React가 알아서 재렌더링
}`}</pre>
          <p className="note">장점: 상태 하나만 관리하면 UI는 React가 책임진다.</p>
        </div>
      </div>
    </div>
  )
}

// --- 섹션 2: UI = f(state) 공식 설명 ---
function FormulaSection() {
  return (
    <div className="section">
      <span className="label label-react">핵심 공식</span>
      <h2>UI = f(state)</h2>
      <div className="formula-box">
        UI &nbsp;=&nbsp; f ( state )
      </div>
      <br />
      <ul className="steps">
        <li>state는 현재 앱의 "상태 데이터"다 (좋아요 수, 로그인 여부, 입력값 등)</li>
        <li>f는 React 컴포넌트 함수다 — 상태를 받아 UI를 반환한다</li>
        <li>state가 바뀌면 React가 f를 다시 실행해 새 UI를 계산한다</li>
        <li>개발자는 DOM 조작 대신 "state를 어떻게 관리할지"에만 집중한다</li>
      </ul>
    </div>
  )
}

// --- 섹션 3: 실제 동작 예제 (좋아요 버튼) ---
function LikeButtonDemo() {
  // useState: 컴포넌트 안에서 관리하는 상태 변수
  // likes      → 현재 좋아요 수 (state)
  // setLikes   → 상태를 바꾸는 함수 (이걸 호출하면 리렌더링 발생)
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)

  function handleClick() {
    // 상태를 바꾼다 → React가 이 컴포넌트를 다시 실행한다
    if (!liked) {
      setLikes(likes + 1)
      setLiked(true)
    } else {
      setLikes(likes - 1)
      setLiked(false)
    }
  }

  // JSX: 현재 상태(likes, liked)를 기반으로 UI를 선언
  // React는 상태가 바뀔 때마다 아래 return을 다시 실행해 화면을 갱신한다
  return (
    <div className="section">
      <span className="label label-react">라이브 데모</span>
      <h2>좋아요 버튼 — 상태가 바뀌면 UI가 바뀐다</h2>

      <div className="demo-area">
        <div className="like-count">{likes}개</div>

        {/* liked 상태에 따라 버튼 스타일이 자동으로 달라진다 */}
        <button
          className={`btn-like ${liked ? 'liked' : ''}`}
          onClick={handleClick}
        >
          {liked ? '❤️ 좋아요 취소' : '🤍 좋아요'}
        </button>

        <div className="state-display">
          현재 state: likes = <span className="highlight">{likes}</span>,
          liked = <span className="highlight">{liked.toString()}</span>
        </div>
      </div>

      <br />
      <ul className="steps">
        <li>버튼 클릭 → <code>setLikes()</code> 호출</li>
        <li>React가 새 state를 감지하고 이 컴포넌트를 다시 실행</li>
        <li>새 state 값으로 JSX가 다시 계산되어 화면에 반영</li>
        <li>개발자는 DOM을 직접 건드리지 않았다</li>
      </ul>

      <div className="note" style={{ marginTop: 16 }}>
        버튼을 눌러 좋아요 수가 바뀌는 것을 확인하라.
        DOM 조작 코드 없이 <code>setLikes</code> 하나로 UI가 바뀐다.
      </div>
    </div>
  )
}

// --- 메인 앱 ---
export default function App() {
  return (
    <div className="page">
      <h1>1강: 리액트의 사고방식</h1>
      <p className="subtitle">선언형 UI · 컴포넌트 · UI = f(state)</p>

      <CompareSection />
      <FormulaSection />
      <LikeButtonDemo />
    </div>
  )
}
