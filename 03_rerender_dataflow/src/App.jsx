import { useState } from 'react'

// ============================================================
// 3강: 리렌더링과 데이터 흐름
//
// 핵심 개념:
//   1. 단방향 데이터 흐름: 데이터는 부모 → 자식으로만 흐른다.
//   2. State Lifting: 두 컴포넌트가 공유할 state는 공통 부모로 올린다.
//   3. 조건부 렌더링: 상태에 따라 다른 UI를 보여준다.
//   4. 리스트 렌더링 + key: 배열을 UI로 바꾸는 방법.
// ============================================================

// -------------------------------------------------------
// 자식 컴포넌트들 — props를 받아 UI를 그린다
// -------------------------------------------------------

// 할 일 입력 폼 — 부모에게 새 항목을 추가하도록 요청한다
// onAdd는 부모에서 내려온 콜백 함수 (자식 → 부모로 데이터 전달)
function TodoInput({ onAdd }) {
  // 입력값은 이 컴포넌트 내부 상태로 관리 (부모가 알 필요 없음)
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()             // 폼 기본 제출 동작 방지
    const trimmed = value.trim()
    if (!trimmed) return           // 빈 값이면 무시
    onAdd(trimmed)                 // 부모 함수를 호출해 새 항목 추가
    setValue('')                   // 입력창 초기화
  }

  return (
    <form className="add-row" onSubmit={handleSubmit}>
      <input
        className="add-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="할 일을 입력하세요..."
      />
      <button type="submit" className="btn-add">추가</button>
    </form>
  )
}

// 개별 할 일 아이템 — 완료 토글 & 삭제 기능
// todos 배열 상태는 부모가 소유한다.
// 자식은 onToggle, onDelete 콜백으로 부모에게 변경을 요청한다.
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className="todo-item">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}  // 부모에게 완료 상태 변경 요청
      />
      <span className={`todo-text ${todo.done ? 'done' : ''}`}>
        {todo.text}
      </span>
      <button className="btn-del" onClick={() => onDelete(todo.id)}>×</button>
    </div>
  )
}

// 필터 선택 버튼 — 현재 필터를 표시하고, 선택 시 부모에게 알린다
function FilterBar({ filter, onFilterChange }) {
  const options = [
    { value: 'all',    label: '전체' },
    { value: 'active', label: '미완료' },
    { value: 'done',   label: '완료' },
  ]

  return (
    <div className="filter-row">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`filter-btn ${filter === opt.value ? 'active' : ''}`}
          onClick={() => onFilterChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// 할 일 목록 — 필터링된 아이템을 리스트로 렌더링
function TodoList({ todos, filter, onToggle, onDelete }) {
  // filter 상태에 따라 보여줄 항목을 계산한다 (파생 데이터)
  const filtered = todos.filter((todo) => {
    if (filter === 'active') return !todo.done
    if (filter === 'done')   return todo.done
    return true
  })

  // 조건부 렌더링: 목록이 비어 있으면 안내 메시지를 보여준다
  if (filtered.length === 0) {
    return (
      <div className="empty-msg">
        {filter === 'done' ? '완료된 항목이 없습니다.' : '할 일을 추가해보세요! 🎯'}
      </div>
    )
  }

  return (
    <div>
      {/*
        리스트 렌더링: todos 배열의 각 항목을 TodoItem 컴포넌트로 변환
        key: React가 각 항목을 식별하기 위해 반드시 필요하다.
             index 대신 고유한 id를 사용하는 것이 좋다.
      */}
      {filtered.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

// -------------------------------------------------------
// 메인 TodoApp 컴포넌트 — 상태를 소유하는 부모
// -------------------------------------------------------
// 왜 todos와 filter를 여기서 관리하는가?
//   - TodoInput, FilterBar, TodoList 모두 같은 todos 데이터를 필요로 한다.
//   - 여러 자식이 공유하는 state는 그들의 공통 부모로 올려야 한다 (State Lifting).
//   - 데이터는 부모 → 자식으로만 흐른다 (단방향 데이터 흐름).

let nextId = 4  // 고유 id 생성용 카운터

function TodoApp() {
  // todos: 할 일 목록 (배열 state)
  const [todos, setTodos] = useState([
    { id: 1, text: 'React 컴포넌트 공부하기', done: true },
    { id: 2, text: 'Props와 State 차이 이해하기', done: true },
    { id: 3, text: '데이터 흐름 예제 실습하기', done: false },
  ])

  // filter: 현재 선택된 필터 ('all' | 'active' | 'done')
  const [filter, setFilter] = useState('all')

  // 새 항목 추가 — 기존 배열을 직접 수정하지 않고 새 배열을 만든다 (불변성)
  function handleAdd(text) {
    setTodos([...todos, { id: nextId++, text, done: false }])
  }

  // 완료 토글 — id가 일치하는 항목의 done을 반전
  function handleToggle(id) {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ))
  }

  // 항목 삭제 — id가 일치하지 않는 항목만 남긴다
  function handleDelete(id) {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  // 완료 항목 전체 삭제
  function handleClearDone() {
    setTodos(todos.filter((todo) => !todo.done))
  }

  // 파생 데이터: todos에서 계산 — 별도 state로 만들 필요 없다
  const doneCount   = todos.filter((t) => t.done).length
  const activeCount = todos.filter((t) => !t.done).length

  return (
    <div className="todo-panel">
      <h3>📝 할 일 목록</h3>

      {/* 자식에게 상태 변경 함수를 props로 전달한다 */}
      <TodoInput onAdd={handleAdd} />
      <FilterBar filter={filter} onFilterChange={setFilter} />
      <TodoList
        todos={todos}
        filter={filter}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      {/* 완료 항목이 있을 때만 버튼 표시 — 조건부 렌더링 */}
      {doneCount > 0 && (
        <button className="btn-clear" onClick={handleClearDone}>
          완료 항목 삭제 ({doneCount}개)
        </button>
      )}

      <div className="status-bar">
        <span>전체 <strong>{todos.length}</strong></span>
        <span>미완료 <strong>{activeCount}</strong></span>
        <span>완료 <strong>{doneCount}</strong></span>
      </div>
    </div>
  )
}

// -------------------------------------------------------
// State Lifting 설명 패널
// -------------------------------------------------------
function StateLiftingExplainer() {
  return (
    <div className="todo-panel">
      <h3>⬆️ State Lifting (상태 끌어올리기)</h3>
      <p style={{ marginBottom: 12 }}>
        여러 컴포넌트가 같은 데이터를 공유해야 할 때, 그 state를
        <strong> 공통 부모로 올린다.</strong>
      </p>

      <div className="diagram">
        <div>
          <span className="node">TodoApp</span>
          <span className="arrow">←</span>
          <code>todos, filter (state 소유)</code>
        </div>
        <div style={{ paddingLeft: 20 }}>
          ├── <span className="node">TodoInput</span>
          <span className="arrow">←</span>
          <code>onAdd (콜백 props)</code>
        </div>
        <div style={{ paddingLeft: 20 }}>
          ├── <span className="node">FilterBar</span>
          <span className="arrow">←</span>
          <code>filter, onFilterChange (props)</code>
        </div>
        <div style={{ paddingLeft: 20 }}>
          └── <span className="node">TodoList</span>
          <span className="arrow">←</span>
          <code>todos, filter, onToggle, onDelete (props)</code>
        </div>
      </div>

      <h3 style={{ marginBottom: 8 }}>단방향 데이터 흐름</h3>
      <p>데이터는 <strong>부모 → 자식</strong> 방향으로만 흐른다.</p>
      <p style={{ marginTop: 6 }}>자식이 부모 데이터를 바꾸려면 부모가 준 <strong>콜백 함수를 호출</strong>한다.</p>

      <div className="note" style={{ marginTop: 14 }}>
        <strong>왜 단방향인가?</strong><br />
        데이터 흐름이 한 방향이면, 버그가 생겼을 때 "어디서 상태가 바뀌었는지"를
        추적하기 쉽다. 양방향이면 디버깅이 매우 어려워진다.
      </div>

      <h3 style={{ marginTop: 16, marginBottom: 8 }}>조건부 렌더링 패턴</h3>
      <p>이 예제에서 사용된 두 가지 패턴:</p>
      <br />
      <p><code>{'{ condition && <Component /> }'}</code> — 조건이 참일 때만 렌더링</p>
      <p style={{ marginTop: 6 }}><code>{'{ condition ? <A /> : <B /> }'}</code> — 조건에 따라 A 또는 B 렌더링</p>
    </div>
  )
}

// -------------------------------------------------------
// 메인 App
// -------------------------------------------------------
export default function App() {
  return (
    <div className="page">
      <h1>3강: 리렌더링과 데이터 흐름</h1>
      <p className="subtitle">단방향 데이터 흐름 · State Lifting · 조건부/리스트 렌더링</p>

      <div className="section">
        <span className="badge badge-lift">State Lifting</span>
        <h2>할 일 목록 — 상태는 공통 부모가 소유한다</h2>
        <p>
          TodoInput, FilterBar, TodoList는 모두 같은 <code>todos</code> 데이터를 사용한다.
          그래서 todos 상태는 이 세 컴포넌트의 공통 부모인 <code>TodoApp</code>에 있다.
        </p>
        <div className="todo-app">
          <TodoApp />
          <StateLiftingExplainer />
        </div>
      </div>
    </div>
  )
}
