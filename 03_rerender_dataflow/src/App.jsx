import { useState } from 'react'
import './index.css'

let nextId = 4

// --- TodoInput: 새 할 일 입력 폼 ---
// onAdd는 부모(TodoApp)에서 내려온 콜백
// 입력값(value)은 이 컴포넌트만 알면 되므로 내부 state로 관리
function TodoInput({ onAdd }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
  }

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <input
        className="todo-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="새 할 일을 입력하세요..."
      />
      <button type="submit" className="add-btn">추가</button>
    </form>
  )
}

// --- FilterBar: 필터 선택 탭 ---
function FilterBar({ filter, onChange, counts }) {
  const tabs = [
    { value: 'all',    label: `전체 (${counts.all})` },
    { value: 'active', label: `미완료 (${counts.active})` },
    { value: 'done',   label: `완료 (${counts.done})` },
  ]
  return (
    <div className="filter-bar">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`filter-btn ${filter === tab.value ? 'active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// --- TodoItem: 개별 할 일 항목 ---
// todos 배열 state는 부모(TodoApp)가 소유
// 자식은 onToggle, onDelete 콜백으로 부모에게 변경을 요청
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className={`todo-item ${todo.done ? 'done' : ''}`}>
      <label className="todo-check">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
        />
        <span className="checkmark"></span>
      </label>
      <span className="todo-text">{todo.text}</span>
      <button className="delete-btn" onClick={() => onDelete(todo.id)}>×</button>
    </div>
  )
}

// --- TodoApp: 상태를 소유하는 부모 컴포넌트 ---
// todos와 filter 상태를 여기서 관리하는 이유:
//   TodoInput, FilterBar, TodoItem 모두 같은 todos 데이터를 필요로 한다.
//   여러 컴포넌트가 공유하는 state는 공통 부모로 올린다 (State Lifting).
export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'React 컴포넌트 이해하기', done: true },
    { id: 2, text: 'Props와 State 구분하기',   done: true },
    { id: 3, text: '데이터 흐름 실습하기',      done: false },
  ])
  const [filter, setFilter] = useState('all')

  // 추가 — 새 배열을 만들어 교체 (불변성 유지)
  function handleAdd(text) {
    setTodos([...todos, { id: nextId++, text, done: false }])
  }

  // 완료 토글
  function handleToggle(id) {
    setTodos(todos.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    ))
  }

  // 삭제
  function handleDelete(id) {
    setTodos(todos.filter((t) => t.id !== id))
  }

  // 완료 항목 전체 삭제
  function handleClearDone() {
    setTodos(todos.filter((t) => !t.done))
  }

  // 파생 데이터 — state에서 계산, 별도 state 불필요
  const counts = {
    all:    todos.length,
    active: todos.filter((t) => !t.done).length,
    done:   todos.filter((t) => t.done).length,
  }

  // 필터에 따라 보여줄 목록
  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.done
    if (filter === 'done')   return t.done
    return true
  })

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">할 일 목록</h1>

        <TodoInput onAdd={handleAdd} />

        <FilterBar filter={filter} onChange={setFilter} counts={counts} />

        <div className="todo-list">
          {filtered.length === 0 ? (
            <p className="empty">
              {filter === 'done' ? '완료된 항목이 없습니다.' : '할 일을 추가해보세요! 🎯'}
            </p>
          ) : (
            filtered.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {counts.done > 0 && (
          <button className="clear-btn" onClick={handleClearDone}>
            완료 항목 모두 삭제 ({counts.done}개)
          </button>
        )}
      </div>
    </div>
  )
}
