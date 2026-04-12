import { useState, useRef, memo, useMemo, useCallback } from 'react'

// ============================================================
// 5강: 성능 최적화와 설계 전략
//
// 핵심 메시지:
//   "최적화는 항상 필요한 것이 아니다.
//    구조 문제를 먼저 해결하고, 측정한 후에 최적화하라."
//
// 다루는 내용:
//   1. 불필요한 리렌더링 확인하기 (렌더 카운터)
//   2. React.memo — 같은 props면 리렌더링 스킵
//   3. useMemo — 비싼 계산 결과를 캐싱
//   4. useCallback — 함수 참조를 안정화
//   5. 구조 문제 vs 최적화 문제 구분
//   6. 최적화 적용 순서 (설계 우선 원칙)
// ============================================================

// -------------------------------------------------------
// 렌더 카운터 유틸: 컴포넌트가 몇 번 렌더링되었는지 추적한다
// -------------------------------------------------------
function useRenderCount() {
  const count = useRef(0)
  count.current += 1
  return count.current
}

// -------------------------------------------------------
// 섹션 1: React.memo — 불필요한 리렌더링 방지
// -------------------------------------------------------

// memo 없는 버전 — 부모가 리렌더링되면 무조건 함께 리렌더링된다
function ChildWithoutMemo({ name }) {
  const renderCount = useRenderCount()
  return (
    <div className="render-panel">
      <h3>❌ memo 없는 자식</h3>
      <p>props: <code>{name}</code></p>
      <div className="render-count">렌더 {renderCount}회</div>
      <p style={{ fontSize: '0.8rem', color: '#718096' }}>
        부모가 리렌더링될 때마다 이 컴포넌트도 리렌더링된다.
        name이 바뀌지 않아도!
      </p>
    </div>
  )
}

// memo로 감싼 버전 — name props가 바뀌지 않으면 리렌더링 스킵
// React.memo는 얕은 비교(shallow comparison)를 수행한다
const ChildWithMemo = memo(function ChildWithMemo({ name }) {
  const renderCount = useRenderCount()
  return (
    <div className="render-panel">
      <h3>✅ memo 있는 자식</h3>
      <p>props: <code>{name}</code></p>
      <div className="render-count" style={{ color: '#38a169' }}>렌더 {renderCount}회</div>
      <p style={{ fontSize: '0.8rem', color: '#718096' }}>
        name이 바뀌지 않으면 부모가 리렌더링돼도 이 컴포넌트는 스킵된다.
      </p>
    </div>
  )
})

function MemoSection() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('React 학습자')
  const parentRenderCount = useRenderCount()

  return (
    <div className="section">
      <span className="badge badge-memo">React.memo</span>
      <h2>memo — 불필요한 리렌더링 방지</h2>
      <p>
        부모 렌더링 횟수: <strong>{parentRenderCount}회</strong> | count: <strong>{count}</strong>
      </p>
      <p style={{ marginTop: 6 }}>
        "count 증가" 버튼을 눌러보라. name은 바뀌지 않는데 두 자식의 렌더 횟수가 어떻게 다른지 비교하라.
      </p>

      <div className="render-demo">
        <ChildWithoutMemo name={name} />
        <ChildWithMemo name={name} />
      </div>

      <div className="btn-row">
        <button className="btn-primary" onClick={() => setCount(c => c + 1)}>
          count 증가 (name은 그대로)
        </button>
        <button className="btn-secondary" onClick={() => setName(name === 'React 학습자' ? '수강생' : 'React 학습자')}>
          name 변경 (두 컴포넌트 모두 리렌더)
        </button>
      </div>

      <div className="warning-box" style={{ marginTop: 16 }}>
        ⚠️ <strong>memo를 모든 컴포넌트에 붙이면 안 된다.</strong><br />
        memo 자체도 비용(props 비교)이 있다. 실제로 불필요한 리렌더링이 측정될 때만 적용하라.
      </div>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 2: useMemo — 비싼 계산 캐싱
// -------------------------------------------------------

// 의도적으로 느린 계산 함수 (소수 찾기)
function findPrimesUpTo(n) {
  const start = performance.now()
  const primes = []
  for (let i = 2; i <= n; i++) {
    let isPrime = true
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) { isPrime = false; break }
    }
    if (isPrime) primes.push(i)
  }
  const elapsed = performance.now() - start
  return { primes, elapsed, count: primes.length }
}

function UseMemoSection() {
  const [limit, setLimit] = useState(5000)
  const [otherCount, setOtherCount] = useState(0)

  // useMemo 없는 버전 — otherCount가 바뀌어도 매번 재계산한다
  const withoutMemo = (() => {
    return findPrimesUpTo(limit)
  })()

  // useMemo 있는 버전 — limit이 바뀔 때만 재계산하고, otherCount 변경 시엔 캐싱값 반환
  const withMemo = useMemo(() => {
    return findPrimesUpTo(limit)
  }, [limit])

  return (
    <div className="section">
      <span className="badge badge-memo">useMemo</span>
      <h2>useMemo — 비싼 계산 결과 캐싱</h2>
      <p>
        소수를 <strong>{limit.toLocaleString()}</strong>까지 찾는 계산은 오래 걸린다.
        "관계없는 버튼"을 눌러 비교해보라.
      </p>

      <div style={{ margin: '14px 0' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>
          한계값: {limit.toLocaleString()}
        </label>
        <input
          type="range" min="1000" max="50000" step="1000"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        />
      </div>

      <div className="perf-demo">
        <div className="perf-panel bad">
          <h3>❌ useMemo 없음</h3>
          <div className="time-display">계산 시간: {withoutMemo.elapsed.toFixed(2)}ms</div>
          <div className="result-display">{withoutMemo.count.toLocaleString()}개</div>
          <p style={{ fontSize: '0.8rem', color: '#c53030' }}>
            관계없는 버튼을 눌러도 매번 재계산한다.
          </p>
        </div>
        <div className="perf-panel good">
          <h3>✅ useMemo 있음</h3>
          <div className="time-display">계산 시간: {withMemo.elapsed.toFixed(2)}ms</div>
          <div className="result-display">{withMemo.count.toLocaleString()}개</div>
          <p style={{ fontSize: '0.8rem', color: '#276749' }}>
            limit이 바뀌지 않으면 계산을 스킵하고 캐싱 값을 반환한다.
          </p>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: 12 }}>
        <button className="btn-secondary" onClick={() => setOtherCount(c => c + 1)}>
          관계없는 state 변경 ({otherCount}회) — useMemo 캐싱 확인
        </button>
      </div>

      <div className="warning-box" style={{ marginTop: 14 }}>
        ⚠️ <strong>모든 계산에 useMemo를 붙이지 마라.</strong><br />
        단순한 filter, map, 덧셈은 useMemo 없이도 충분히 빠르다.
        실제로 느린 계산이 있을 때만 사용하라.
      </div>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 3: useCallback — 함수 참조 안정화
// -------------------------------------------------------

// memo로 감싼 자식 — onAdd 함수 참조가 바뀌면 리렌더링된다
const AddButton = memo(function AddButton({ onAdd, label }) {
  const renderCount = useRenderCount()
  return (
    <div className="render-panel" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: '0.8rem' }}>{label}</p>
      <div className="render-count" style={{ fontSize: '1.2rem', color: '#805ad5' }}>
        렌더 {renderCount}회
      </div>
      <button className="btn-primary" onClick={onAdd}>항목 추가</button>
    </div>
  )
})

function UseCallbackSection() {
  const [items, setItems] = useState([])
  const [other, setOther] = useState(0)

  // useCallback 없는 버전 — 렌더링마다 새 함수 객체가 생성된다
  // memo(AddButton)은 props가 바뀌었다고 판단해 리렌더링한다
  const addItemWithout = () => {
    setItems((prev) => [...prev, `항목 ${prev.length + 1}`])
  }

  // useCallback 있는 버전 — 함수 참조가 안정적으로 유지된다
  // memo(AddButton)은 onAdd가 같은 참조임을 확인하고 리렌더링을 스킵한다
  const addItemWith = useCallback(() => {
    setItems((prev) => [...prev, `항목 ${prev.length + 1}`])
  }, [])  // 의존성 없음 — 항상 같은 함수 참조

  return (
    <div className="section">
      <span className="badge badge-memo">useCallback</span>
      <h2>useCallback — memo와 함께 사용하는 함수 참조 안정화</h2>
      <p>
        "관계없는 state 변경" 버튼을 눌러보라.
        두 AddButton의 렌더 횟수가 다른지 확인하라.
      </p>

      <div className="render-demo" style={{ marginTop: 12 }}>
        <AddButton
          onAdd={addItemWithout}
          label="❌ useCallback 없음 — 매번 새 함수 생성"
        />
        <AddButton
          onAdd={addItemWith}
          label="✅ useCallback 있음 — 함수 참조 유지"
        />
      </div>

      <div className="btn-row" style={{ marginTop: 12 }}>
        <button className="btn-secondary" onClick={() => setOther(c => c + 1)}>
          관계없는 state 변경 ({other}회)
        </button>
      </div>

      {items.length > 0 && (
        <p style={{ marginTop: 10, fontSize: '0.85rem' }}>
          추가된 항목: {items.join(', ')}
        </p>
      )}

      <p className="note">
        useCallback은 <strong>memo로 감싼 자식 컴포넌트</strong>에 함수를 props로 내릴 때 의미가 있다.
        그 외 상황에서는 불필요한 복잡도를 추가할 뿐이다.
      </p>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 4: 구조 문제 vs 최적화 문제
// -------------------------------------------------------
function StructureVsOptimize() {
  const [activeTab, setActiveTab] = useState('bad')

  return (
    <div className="section">
      <span className="badge badge-struct">구조 우선</span>
      <h2>구조 문제를 먼저 해결하라 — 최적화는 그 다음</h2>

      <p>
        최적화 API를 적용하기 전에, <strong>상태 위치와 컴포넌트 구조</strong>를 먼저 점검하라.
        많은 경우, 구조를 올바르게 잡으면 최적화가 필요 없어진다.
      </p>

      <div className="compare-grid" style={{ marginTop: 14 }}>
        <div className="compare-box bad">
          <h3>❌ 구조 문제 — 상태 위치가 잘못됨</h3>
          <pre>{`// 문제: 전체 앱 상태를 최상위에서 관리하면
// 어디서 입력해도 모든 컴포넌트가 리렌더링된다

function App() {
  // input 값을 여기서 관리하면
  const [searchQuery, setSearchQuery] = useState('')
  
  return (
    <>
      <Header />       {/* 검색과 무관한데 리렌더 */}
      <Sidebar />      {/* 검색과 무관한데 리렌더 */}
      <SearchInput     {/* 여기서 입력 */}
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <Results query={searchQuery} />
    </>
  )
}`}</pre>
          <p style={{ fontSize: '0.82rem', color: '#c53030', marginTop: 6 }}>
            searchQuery가 바뀔 때마다 Header, Sidebar도 리렌더링된다.
          </p>
        </div>

        <div className="compare-box good">
          <h3>✅ 구조 개선 — 상태를 필요한 곳 가까이</h3>
          <pre>{`// 개선: SearchQuery 관련 state를
// 그것을 사용하는 컴포넌트로 내린다 (colocation)

function App() {
  return (
    <>
      <Header />    {/* searchQuery 모름 → 리렌더 안 함 */}
      <Sidebar />   {/* searchQuery 모름 → 리렌더 안 함 */}
      <SearchSection />  {/* 여기서만 관리 */}
    </>
  )
}

function SearchSection() {
  // state가 실제로 필요한 곳에 존재한다
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <>
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      <Results query={searchQuery} />
    </>
  )
}`}</pre>
          <p style={{ fontSize: '0.82rem', color: '#276749', marginTop: 6 }}>
            memo 없이도 Header, Sidebar는 리렌더링되지 않는다!
          </p>
        </div>
      </div>

      <div className="warning-box" style={{ marginTop: 14 }}>
        🔑 <strong>핵심 원칙:</strong> 상태를 사용하는 컴포넌트 가까이 두어라 (State Colocation).
        memo, useMemo, useCallback은 구조 개선 이후에 측정하고 필요할 때만 적용하라.
      </div>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 5: 최적화 적용 순서 체크리스트
// -------------------------------------------------------
function OptimizationChecklist() {
  return (
    <div className="section">
      <span className="badge badge-design">설계 전략</span>
      <h2>최적화 적용 전 체크리스트</h2>
      <p>성능 문제가 생겼을 때 이 순서로 점검하라.</p>

      <table className="priority-table">
        <thead>
          <tr>
            <th>순서</th>
            <th>점검 항목</th>
            <th>해결 방법</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="rank-1">① 먼저</td>
            <td>상태가 올바른 위치에 있는가?</td>
            <td>State Colocation — 상태를 사용하는 컴포넌트로 내린다</td>
          </tr>
          <tr>
            <td className="rank-1">① 먼저</td>
            <td>불필요한 state가 있는가?</td>
            <td>파생 데이터(derived data)로 계산할 수 있으면 state를 제거한다</td>
          </tr>
          <tr>
            <td className="rank-2">② 그 다음</td>
            <td>리렌더링 횟수가 실제로 과도한가?</td>
            <td>React DevTools Profiler로 측정 후 React.memo 적용</td>
          </tr>
          <tr>
            <td className="rank-2">② 그 다음</td>
            <td>계산이 실제로 느린가?</td>
            <td>performance.now()로 측정 후 useMemo 적용</td>
          </tr>
          <tr>
            <td className="rank-3">③ 필요 시</td>
            <td>memo 자식에 함수를 props로 내리는가?</td>
            <td>useCallback으로 함수 참조 안정화</td>
          </tr>
          <tr>
            <td className="rank-3">③ 필요 시</td>
            <td>Context로 인한 광범위한 리렌더링인가?</td>
            <td>Context 분리 또는 상태 관리 라이브러리 도입</td>
          </tr>
        </tbody>
      </table>

      <ul className="checklist" style={{ marginTop: 16 }}>
        <li>
          <span className="icon">📏</span>
          <span>
            <strong>측정 없이 최적화하지 마라.</strong>
            느리다고 느껴질 때 React DevTools Profiler를 먼저 켜라.
          </span>
        </li>
        <li>
          <span className="icon">🏗️</span>
          <span>
            <strong>구조 문제는 최적화로 해결되지 않는다.</strong>
            memo를 붙여도 상태 위치가 잘못되면 근본 원인이 해결되지 않는다.
          </span>
        </li>
        <li>
          <span className="icon">🤏</span>
          <span>
            <strong>최적화는 트레이드오프다.</strong>
            코드 복잡도가 올라가고, 버그 가능성이 생긴다.
            실제 이득이 있을 때만 적용하라.
          </span>
        </li>
        <li>
          <span className="icon">🧹</span>
          <span>
            <strong>단순한 것이 빠르다.</strong>
            컴포넌트를 작게 유지하고, state를 최소화하면 자연스럽게 성능이 좋아진다.
          </span>
        </li>
      </ul>
    </div>
  )
}

// -------------------------------------------------------
// 메인 App
// -------------------------------------------------------
export default function App() {
  return (
    <div className="page">
      <h1>5강: 성능 최적화와 설계 전략</h1>
      <p className="subtitle">
        React.memo · useMemo · useCallback · 구조 우선 원칙
      </p>

      <MemoSection />
      <UseMemoSection />
      <UseCallbackSection />
      <StructureVsOptimize />
      <OptimizationChecklist />
    </div>
  )
}
