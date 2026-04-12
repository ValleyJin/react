# 5강: 성능 최적화와 설계 전략

## 학습 목표

1. **React.memo** — props가 바뀌지 않으면 리렌더링을 스킵하는 원리를 이해한다.
2. **useMemo** — 비싼 계산 결과를 캐싱하고, 언제 필요한지 판단한다.
3. **useCallback** — 함수 참조를 안정화하고, memo와 함께 사용하는 상황을 이해한다.
4. **구조 문제와 최적화 문제를 구분**하고, 올바른 순서로 접근하는 감각을 기른다.

---

## 예제 프로젝트 개요

**렌더 카운터 + 소수 계산기 + 최적화 비교 데모**

- 렌더 횟수를 실시간으로 시각화해 최적화 효과를 직접 눈으로 확인한다.
- 실제로 느린 계산(소수 찾기)으로 useMemo의 효과를 측정한다.
- 구조 개선(State Colocation)이 memo 없이도 성능을 개선함을 코드로 보여준다.

---

## 핵심 개념 설명

### React.memo

컴포넌트를 `memo()`로 감싸면, React는 **props가 바뀌었는지 먼저 확인**한다.
이전과 동일한 props면 리렌더링을 건너뛴다.

```jsx
const MyComponent = memo(function MyComponent({ name }) {
  return <div>{name}</div>
})
```

**언제 사용하나?**
- 부모가 자주 리렌더링되는데
- 해당 자식의 props는 거의 바뀌지 않고
- 자식이 렌더링하기 무거울 때

### useMemo

계산 결과를 **메모이제이션**한다. 의존성이 바뀌지 않으면 이전 결과를 재사용한다.

```jsx
const result = useMemo(() => {
  return heavyCalculation(input)  // input이 바뀔 때만 재실행
}, [input])
```

**언제 사용하나?**
- 실제로 느린 계산이 있고 (측정 필수)
- 불필요하게 자주 재실행될 때

### useCallback

함수 참조를 안정화한다. 의존성이 바뀌지 않으면 **이전 함수 객체를 그대로 반환**한다.

```jsx
const handleAdd = useCallback(() => {
  setItems(prev => [...prev, newItem])
}, [newItem])
```

**언제 사용하나?**
- `memo`로 감싼 자식에게 함수를 props로 내릴 때
- 해당 함수를 다른 `useEffect`의 의존성으로 사용할 때

### 구조 우선 원칙 (State Colocation)

```jsx
// ✅ 상태를 실제로 사용하는 컴포넌트 가까이 둔다
function SearchSection() {
  const [query, setQuery] = useState('')
  return <>
    <SearchInput value={query} onChange={setQuery} />
    <Results query={query} />
  </>
}

// Header, Sidebar는 query를 모르기 때문에 리렌더링되지 않는다
```

memo 없이도 올바른 구조만으로 불필요한 리렌더링을 막을 수 있다.

---

## 파일 구조

```
05_performance_design/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx   # 모든 섹션 (5개 섹션)
    └── index.css
```

### vite.config.js 설명

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

| 줄 | 설명 |
|----|------|
| `import { defineConfig }` | 타입 힌트와 자동완성을 제공하는 Vite 헬퍼 함수 |
| `import react` | JSX 변환 + Fast Refresh를 담당하는 React 공식 플러그인 |
| `defineConfig({ ... })` | 설정 객체를 감싸는 래퍼 (없어도 동작하지만 IDE 지원을 위해 사용) |
| `plugins: [react()]` | React 플러그인 등록 — 없으면 JSX를 파싱하지 못해 에러 발생 |

**이 파일은 개발자 코드 어디에서도 import하지 않는다.**
`vite.config.js`는 Vite 실행 엔진이 자동으로 찾아 읽는 약속된 파일이다.

```bash
npm run dev   →   Vite가 실행되면서 vite.config.js를 자동으로 탐색해 읽는다
```

파일 이름이 반드시 `vite.config.js`이어야 하는 이유도 이 약속 때문이다.
`my-vite-config.js`처럼 이름을 바꾸면 Vite가 찾지 못한다.

`@vitejs/plugin-react`가 제공하는 **Fast Refresh** 덕분에, 코드를 수정할 때
페이지 전체를 새로고침하지 않고 변경된 컴포넌트만 즉시 반영된다.
개발 중 state가 유지된 채로 UI가 업데이트되는 것이 이 플러그인 덕분이다.

#### 설치 vs 등록 — 헷갈리기 쉬운 개념

"플러그인 등록"과 "플러그인 설치"는 다른 개념이다.

| 구분 | 시점 | 명령어 | 결과 |
|------|------|--------|------|
| **설치** | `npm install` 실행 시 | `npm install` | `node_modules/` 안에 파일이 생긴다 |
| **등록** | `vite.config.js` 작성 시 | (코드 작성) | Vite가 해당 플러그인을 실제로 사용한다 |

비유하자면:

- **설치** = 앱스토어에서 카카오톡을 다운로드 (파일이 폰에 존재)
- **등록** = 카카오톡을 기본 메신저로 설정 (실제로 사용하도록 연결)

앱이 깔려 있어도 기본 메신저로 설정하지 않으면 동작하지 않는 것처럼,
플러그인도 `npm install`로 설치만 하고 `plugins`에 넣지 않으면 Vite가 사용하지 않는다.

```json
// package.json — 설치 목록 (npm install로 파일을 받아두는 것)
"devDependencies": {
  "@vitejs/plugin-react": "^4.2.1"
}
```

```js
// vite.config.js — 등록 (설치된 플러그인을 실제로 Vite에 연결하는 것)
import react from '@vitejs/plugin-react'  // 설치된 플러그인을 불러오고
plugins: [react()]                         // Vite에게 "이걸 써라"고 연결
```

---

## 코드 설명

### 렌더 카운터 (useRenderCount)

```jsx
function useRenderCount() {
  const count = useRef(0)
  count.current += 1  // ref는 값이 바뀌어도 리렌더링을 유발하지 않는다
  return count.current
}
```

`useRef`는 렌더링을 유발하지 않으면서 값을 기억한다. 렌더 횟수 추적에 적합하다.

### useMemo 비교

```jsx
// 매 렌더링마다 재계산
const withoutMemo = findPrimesUpTo(limit)

// limit이 바뀔 때만 재계산
const withMemo = useMemo(() => findPrimesUpTo(limit), [limit])
```

"관계없는 state 변경" 버튼을 클릭하면 `withoutMemo`는 재계산되지만 `withMemo`는 캐싱값을 반환한다.

---

## 학생이 실수하기 쉬운 포인트

### 1. 모든 컴포넌트에 memo를 붙인다

```jsx
// ❌ 불필요한 최적화 — memo도 비용이 있다
export default memo(function SimpleText({ text }) {
  return <p>{text}</p>  // 이런 단순한 컴포넌트에는 memo가 오히려 느릴 수 있다
})
```

### 2. useMemo를 단순한 계산에도 사용한다

```jsx
// ❌ 과도한 최적화
const doubled = useMemo(() => count * 2, [count])

// ✅ 단순한 계산은 그냥 쓴다
const doubled = count * 2
```

### 3. useCallback 없이 memo를 사용한다

```jsx
// ❌ onAdd가 매 렌더링마다 새로 생성되므로 memo가 의미없다
const Child = memo(({ onAdd }) => <button onClick={onAdd}>추가</button>)

function Parent() {
  const onAdd = () => setItems([...items, '새 항목'])  // 매번 새 함수
  return <Child onAdd={onAdd} />
}

// ✅ useCallback으로 함수 참조 안정화
const onAdd = useCallback(() => setItems(prev => [...prev, '새 항목']), [])
```

### 4. 구조 문제를 memo로 해결하려 한다

```jsx
// ❌ 상태 위치가 잘못된 채로 memo만 붙인다
// memo를 붙여봤자 부모 state가 바뀌면 props도 바뀌어 리렌더링된다

// ✅ 먼저 상태를 올바른 위치로 내린다 (State Colocation)
// 그러면 memo 없이도 불필요한 리렌더링이 줄어든다
```

---

## 실습 과제

### 과제 1: 렌더 카운터 직접 만들기
`useRenderCount` Hook 없이, 직접 `useRef`를 사용해 렌더 횟수를 표시하는 컴포넌트를 만들어보라.
- 왜 `useState` 대신 `useRef`를 사용하는지 설명할 수 있어야 한다.

### 과제 2: 필터링 최적화
3강의 Todo 앱에서 `useMemo`로 필터링 결과를 최적화하라.

```js
const filtered = useMemo(
  () => todos.filter(todo => matchesFilter(todo, filter)),
  [todos, filter]
)
```

- todos가 1000개 이상일 때 차이가 생기는지 확인해보라.

### 과제 3 (도전): 최적화 전/후 측정
5강 예제의 `MemoSection`에서 React DevTools Profiler를 사용해
- memo 없을 때와 있을 때의 렌더 시간을 실제로 측정하고
- 어느 상황에서 차이가 유의미한지 분석해보라.

---

## 5강 전체 마무리

이 강의를 통해 배운 것:

| 강의 | 핵심 사고방식 |
|------|-------------|
| 1강 | UI = f(state) — 상태가 바뀌면 React가 UI를 다시 계산한다 |
| 2강 | props(외부)와 state(내부)를 구분한다 |
| 3강 | 상태 위치가 컴포넌트 구조를 결정한다 |
| 4강 | 렌더링 로직과 부수 효과를 분리한다 |
| 5강 | 구조를 먼저 잡고, 측정한 후에 최적화한다 |

---

## 실행 방법

```bash
cd 05_performance_design
npm install
npm run dev
```
