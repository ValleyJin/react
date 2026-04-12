# 3강: 리렌더링과 데이터 흐름

## 학습 목표

1. **단방향 데이터 흐름** — 데이터는 부모에서 자식으로만 흐름을 이해한다.
2. **State Lifting** — 여러 컴포넌트가 공유하는 상태는 공통 부모로 올린다.
3. **조건부 렌더링** — 상태에 따라 다른 UI를 표시하는 패턴을 익힌다.
4. **리스트 렌더링** — 배열을 `map()`으로 UI로 변환하고, `key`가 왜 필요한지 이해한다.

---

## 예제 프로젝트 개요

**할 일 목록 (Todo List)**

- 추가, 완료 토글, 삭제, 필터링(전체/미완료/완료) 기능을 가진 완전한 Todo 앱이다.
- `TodoApp`(부모)이 상태를 소유하고, 자식 컴포넌트들에게 props로 전달한다.
- State Lifting의 필요성을 실제 구조로 체험한다.

---

## 핵심 개념 설명

### 단방향 데이터 흐름

```
TodoApp (state 소유)
  ↓ props (데이터)         ↑ 콜백 (변경 요청)
  TodoInput               onAdd
  FilterBar               onFilterChange
  TodoList → TodoItem     onToggle, onDelete
```

- 데이터는 **위에서 아래로(부모 → 자식)** 흐른다.
- 자식이 상태를 바꾸려면 **부모가 준 콜백 함수를 호출**해야 한다.

### State Lifting (상태 끌어올리기)

두 컴포넌트가 **같은 상태를 공유**해야 할 때, 그 상태를 **가장 가까운 공통 부모**로 올린다.

```jsx
// FilterBar와 TodoList 모두 filter 상태를 필요로 한다.
// → filter를 공통 부모인 TodoApp으로 올린다.

function TodoApp() {
  const [filter, setFilter] = useState('all')  // 공통 부모가 소유

  return (
    <>
      <FilterBar filter={filter} onFilterChange={setFilter} />
      <TodoList todos={todos} filter={filter} ... />
    </>
  )
}
```

### 배열 State 업데이트 — 불변성

React에서 배열(또는 객체) state는 **직접 수정하지 않고** 새 배열을 만들어서 교체한다.

```js
// ❌ 직접 수정 — React가 변화를 감지하지 못한다
todos.push({ id: 4, text: '...', done: false })
setTodos(todos)

// ✅ 새 배열 생성 — React가 변화를 감지하고 리렌더링한다
setTodos([...todos, { id: 4, text: '...', done: false }])
```

### 리스트 렌더링과 key

```jsx
{todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} />
))}
```

- `key`는 React가 각 항목을 구별하기 위한 식별자다.
- 배열 index를 key로 쓰면 항목 순서가 바뀔 때 버그가 생길 수 있다.
- **고유한 id**를 key로 사용하는 것이 안전하다.

### 조건부 렌더링 패턴

```jsx
// 패턴 1: && — 조건이 참일 때만 렌더링
{doneCount > 0 && <button>완료 삭제</button>}

// 패턴 2: 삼항 연산자 — 둘 중 하나 렌더링
{isLoading ? <Spinner /> : <Content />}

// 패턴 3: 빠른 반환 — 컴포넌트 전체를 대체
if (todos.length === 0) return <EmptyMessage />
```

---

## 파일 구조

```
03_rerender_dataflow/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx    # 모든 컴포넌트 포함 (TodoApp + 자식들)
    └── index.css
```

> 왜 모두 App.jsx 하나에 넣었나?
> 컴포넌트 간 데이터 흐름을 **파일 이동 없이 한눈에 보기** 위해서다.
> `TodoInput → TodoApp → TodoList`로 이어지는 props 흐름을
> 스크롤 하나로 추적할 수 있어야 학습 효과가 높다.

---

## 코드 설명

### TodoApp — 상태 소유 부모

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([...])
  const [filter, setFilter] = useState('all')

  function handleAdd(text) {
    setTodos([...todos, { id: nextId++, text, done: false }])
  }
  function handleToggle(id) {
    setTodos(todos.map((t) => t.id === id ? { ...t, done: !t.done } : t))
  }
  function handleDelete(id) {
    setTodos(todos.filter((t) => t.id !== id))
  }
  ...
}
```

- `todos`와 `filter` 두 상태를 소유한다.
- 상태 변경 함수(`handleAdd`, `handleToggle`, `handleDelete`)를 정의해 자식에게 props로 전달한다.

### TodoInput — 자식이 부모에게 보고하는 방법

```jsx
function TodoInput({ onAdd }) {
  const [value, setValue] = useState('')  // 입력값은 이 컴포넌트 내부 상태

  function handleSubmit(e) {
    e.preventDefault()
    onAdd(value.trim())  // 부모 함수 호출 → 부모 state 변경
    setValue('')
  }
  ...
}
```

- `onAdd`는 부모에서 내려온 콜백이다.
- `value`(입력창 텍스트)는 TodoInput만 알면 되므로 내부 state로 관리한다.
- **"누가 이 상태를 알아야 하는가?"** 가 state 위치 결정의 핵심 질문이다.

---

## 학생이 실수하기 쉬운 포인트

### 1. 배열 state를 직접 변경한다

```js
// ❌ 잘못된 방법
todos.push(newItem)
setTodos(todos)  // 같은 참조 → React가 변화를 감지 못함

// ✅ 새 배열로 교체
setTodos([...todos, newItem])
```

### 2. key를 index로 사용한다

```jsx
// ❌ 항목 순서가 바뀌면 버그 발생 가능
{todos.map((todo, index) => <TodoItem key={index} ... />)}

// ✅ 고유한 id 사용
{todos.map((todo) => <TodoItem key={todo.id} ... />)}
```

### 3. 파생 데이터를 별도 state로 만든다

```js
// ❌ 불필요한 state — todos에서 계산할 수 있다
const [doneCount, setDoneCount] = useState(0)

// ✅ 렌더링할 때마다 계산 (파생 데이터)
const doneCount = todos.filter((t) => t.done).length
```

### 4. state를 잘못된 위치에 둔다

```jsx
// ❌ filter를 TodoList 안에 두면 FilterBar가 접근할 수 없다
function TodoList() {
  const [filter, setFilter] = useState('all')  // FilterBar가 모름!
}

// ✅ 공통 부모 TodoApp에 둬야 FilterBar와 TodoList 모두 사용 가능
function TodoApp() {
  const [filter, setFilter] = useState('all')
}
```

---

## 실습 과제

### 과제 1: 우선순위 추가
할 일 항목에 "높음 / 보통 / 낮음" 우선순위를 추가하라.
- 항목 추가 시 우선순위 선택을 할 수 있어야 한다.
- 우선순위에 따라 다른 색상 뱃지를 표시하라.

### 과제 2: 편집 기능
각 할 일 항목 옆에 "수정" 버튼을 추가하라.
- 버튼 클릭 시 텍스트가 input으로 바뀌고 수정 가능해야 한다.
- 수정 완료 후 Enter를 누르면 저장된다.

### 과제 3 (도전): 드래그 없이 순서 변경
"위로" / "아래로" 버튼으로 항목 순서를 바꿀 수 있게 만들어라.
- 배열 내에서 항목의 위치를 바꾸는 로직을 작성해보라.
- key가 index가 아닌 id여야 하는 이유를 이 과정에서 직접 체험하라.

---

## 다음 강의로 이어지는 연결

3강까지는 **렌더링 로직**에 집중했다 — 상태가 UI에 반영되는 흐름.

실제 앱에서는 **API 호출, 타이머, 구독** 같은 작업이 필요하다.
이것들은 렌더링 외부에서 일어나는 **부수 효과(Side Effect)**다.

4강에서는 `useEffect`로 부수 효과를 관리하고,
반복되는 로직을 **Custom Hook**으로 추출하는 방법을 배운다.

> 핵심 질문: "이 로직은 **렌더링의 일부**인가, **렌더링 외부에서 일어나는 일**인가?"

---

## 실행 방법

```bash
cd 03_rerender_dataflow
npm install
npm run dev
```
