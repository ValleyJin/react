# 4강: Hooks와 로직 분리

## 학습 목표

1. **useEffect**로 렌더링과 부수 효과(side effect)를 분리하는 방법을 이해한다.
2. **cleanup 함수**의 역할 — 타이머, 이벤트 리스너를 올바르게 정리한다.
3. **잘못된 useEffect 패턴**과 올바른 패턴을 비교해 흔한 실수를 피한다.
4. **Custom Hook**으로 반복되는 상태 로직을 분리하고 재사용한다.

---

## 예제 프로젝트 개요

**useEffect 비교 + 3개의 Custom Hook 예제**

| Hook | 역할 |
|------|------|
| `useTimer` | setInterval 기반 스톱워치 로직 캡슐화 |
| `useLocalStorage` | localStorage와 동기화되는 state |
| `useFormField` | 입력값 + 유효성 검사 + 터치 여부 관리 |

---

## 핵심 개념 설명

### 부수 효과 (Side Effect)

렌더링 과정 **외부**에서 일어나는 모든 일:

- API 데이터 가져오기
- 타이머 시작/정지 (`setTimeout`, `setInterval`)
- DOM 이벤트 리스너 등록/해제
- localStorage 읽기/쓰기
- 외부 구독(WebSocket 등)

이런 작업을 **렌더링 함수 안에 직접 쓰면 안 된다** — `useEffect`를 사용해야 한다.

### useEffect 의존성 배열

```js
useEffect(() => { ... })         // 매 렌더링마다 실행 (보통 원하지 않는 동작)
useEffect(() => { ... }, [])     // 마운트될 때 딱 한 번 실행
useEffect(() => { ... }, [url])  // url이 바뀔 때마다 실행
```

### cleanup 함수

```js
useEffect(() => {
  const id = setInterval(() => setSeconds(s => s + 1), 1000)

  // cleanup: 이 effect가 다시 실행되거나 컴포넌트가 사라질 때 호출됨
  return () => clearInterval(id)
}, [])
```

cleanup 없이 interval/리스너를 등록하면 → **메모리 누수** 발생

### Custom Hook 만드는 규칙

```js
// 1. 이름은 반드시 "use"로 시작한다
function useTimer() { ... }

// 2. 내부에서 다른 Hook을 사용할 수 있다
function useTimer() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => { ... }, [])
  return { seconds, ... }
}

// 3. 컴포넌트처럼 사용한다
function TimerUI() {
  const { seconds, start, stop } = useTimer()
  ...
}
```

---

## 파일 구조

```
04_hooks_logic/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                   # UI 컴포넌트들
    └── hooks/
        ├── useTimer.js           # 타이머 로직
        ├── useLocalStorage.js    # localStorage 동기화
        └── useFormField.js       # 폼 필드 로직
```

> 왜 hooks 폴더를 분리했나?
> 4강의 핵심은 "로직과 UI를 분리"하는 것이다.
> `App.jsx`는 UI만 보이고, 로직은 `hooks/` 안에 있다는 구조를 파일 레벨에서도 보여준다.
> 실무에서도 이 패턴을 그대로 사용한다.

---

## 코드 설명

### useTimer.js — setInterval + cleanup

```js
export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)  // id는 화면에 표시 안 하므로 ref로 관리

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)  // cleanup
  }, [isRunning])

  return { seconds, isRunning, start, stop, reset }
}
```

### useLocalStorage.js — 초기값 지연 로드

```js
const [value, setValue] = useState(() => {
  // 함수를 전달하면 초기 렌더링 때만 한 번 실행 (지연 초기화)
  const stored = localStorage.getItem(key)
  return stored !== null ? JSON.parse(stored) : initialValue
})
```

### useFormField.js — touched 패턴

```js
const [touched, setTouched] = useState(false)
const error = touched ? validate(value) : ''  // 한 번 포커스 뗀 이후에만 에러 표시
```

---

## 학생이 실수하기 쉬운 포인트

### 1. cleanup 없이 setInterval을 사용한다

```js
// ❌ 컴포넌트가 여러 번 렌더링되면 interval이 쌓인다
useEffect(() => {
  setInterval(() => setCount(c => c + 1), 1000)
})  // 의존성 배열도 없음

// ✅ cleanup으로 이전 interval 제거
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000)
  return () => clearInterval(id)
}, [])
```

### 2. 의존성 배열에 값을 빠뜨린다

```js
// ❌ url이 바뀌어도 effect가 재실행되지 않는다
useEffect(() => {
  fetch(url).then(...)
}, [])  // url을 의존성에 넣지 않음

// ✅ 사용하는 값을 의존성 배열에 포함한다
useEffect(() => {
  fetch(url).then(...)
}, [url])
```

### 3. useEffect 안에서 async 함수를 직접 사용한다

```js
// ❌ useEffect 콜백에 async를 직접 붙이면 안 된다
useEffect(async () => {
  const data = await fetch(url)  // cleanup 함수 반환이 Promise와 충돌
}, [url])

// ✅ 내부에 async 함수를 정의하고 호출한다
useEffect(() => {
  async function load() {
    const data = await fetch(url)
    setData(data)
  }
  load()
}, [url])
```

### 4. Custom Hook을 조건문 안에서 호출한다

```js
// ❌ Hook은 항상 컴포넌트 최상단에서 호출해야 한다
function MyComponent({ show }) {
  if (show) {
    const timer = useTimer()  // Rules of Hooks 위반!
  }
}

// ✅ 항상 최상단에서 호출
function MyComponent({ show }) {
  const timer = useTimer()
  if (!show) return null
}
```

---

## 실습 과제

### 과제 1: 카운트다운 타이머
`useTimer`를 수정해서 **카운트다운** 기능을 추가하라.
- `useTimer(60)` 처럼 초기 초 수를 받아 0까지 카운트다운한다.
- 0에 도달하면 자동으로 정지하고 "시간 초과!" 메시지를 표시한다.

### 과제 2: useDebounce 만들기
입력할 때마다 API를 호출하지 않고, **입력이 멈춘 후 500ms 뒤에** 실행되는 `useDebounce` Hook을 만들어라.

```js
// 사용 예시
const debouncedQuery = useDebounce(query, 500)
useEffect(() => {
  if (debouncedQuery) fetchResults(debouncedQuery)
}, [debouncedQuery])
```

### 과제 3 (도전): useFetch 만들기
URL을 받아 데이터를 가져오는 `useFetch` Hook을 만들어라.

```js
const { data, loading, error } = useFetch('https://jsonplaceholder.typicode.com/todos/1')
```

- `loading` 중에는 스피너를 보여준다.
- `error`가 있으면 에러 메시지를 보여준다.
- URL이 바뀌면 새로 fetch한다.

---

## 다음 강의로 이어지는 연결

4강에서는 로직을 분리해 **재사용성**을 높이는 방법을 배웠다.

이렇게 잘 설계된 코드도 **렌더링이 너무 자주 일어나거나**, 컴포넌트 트리가 깊어지면 성능 문제가 생길 수 있다.

5강에서는 **성능 최적화**를 다루되, "최적화가 항상 필요한 것은 아니다"는 중요한 원칙을 함께 배운다.

> 핵심 질문: "이 렌더링은 **필요한 렌더링**인가, **불필요한 렌더링**인가?"

---

## 실행 방법

```bash
cd 04_hooks_logic
npm install
npm run dev
```
