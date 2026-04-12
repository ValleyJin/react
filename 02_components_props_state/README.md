# 2강: 컴포넌트, Props, State

## 학습 목표

1. **컴포넌트**를 재사용 가능한 함수 단위로 만드는 방법을 이해한다.
2. **Props**는 외부(부모)에서 받는 값, **State**는 내부에서 직접 관리하는 값임을 명확히 구분한다.
3. 이벤트 핸들러를 연결해 사용자 행동에 반응하는 컴포넌트를 만든다.
4. 제어 컴포넌트(Controlled Component) 패턴으로 입력값을 관리한다.

---

## 예제 프로젝트 개요

**팀 프로필 카드 + 카운터 + 토글 + 입력 데모**

- `ProfileCard`: 같은 컴포넌트를 다른 props로 여러 번 재사용한다.
- `CounterSection`: state로 내부 숫자를 관리한다.
- `ToggleDemo`: boolean state로 컨텐츠를 보이거나 숨긴다.
- `InputDemo`: 입력값을 state로 관리하는 제어 컴포넌트 패턴.

---

## 핵심 개념 설명

### 컴포넌트 (Component)

UI를 재사용 가능한 **함수 단위**로 쪼갠 것이다.

```jsx
// 함수명은 반드시 대문자로 시작한다
function ProfileCard({ name, role }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{role}</p>
    </div>
  )
}
```

같은 컴포넌트를 다른 데이터로 여러 번 사용할 수 있다:

```jsx
<ProfileCard name="김민준" role="프론트엔드" />
<ProfileCard name="이서연" role="백엔드" />
```

### Props — 외부에서 받는 값

부모가 자식에게 넘겨주는 데이터. **읽기 전용**이다.

```jsx
// 부모 컴포넌트에서 props 전달
<ProfileCard name="김민준" color="#bee3f8" skills={['React', 'CSS']} />

// 자식 컴포넌트에서 props 수신 (구조분해)
function ProfileCard({ name, color, skills }) {
  return <div style={{ background: color }}>{name}</div>
}
```

> **props를 자식이 직접 바꾸면 안 된다.** 바꾸고 싶으면 부모에게 요청해야 한다.

### State — 내부에서 바꾸는 값

컴포넌트가 직접 소유하고 관리하는 데이터.

```jsx
const [count, setCount] = useState(0)  // 초기값: 0

// 상태 변경 → 자동으로 리렌더링
setCount(count + 1)
```

### 이벤트 처리

```jsx
// onClick에 함수를 전달한다 (함수 호출이 아니라 함수 자체)
<button onClick={() => setCount(count + 1)}>+1</button>

// 인라인 함수 대신 별도 함수로 분리할 수도 있다
function handleClick() {
  setCount(count + 1)
}
<button onClick={handleClick}>+1</button>
```

### 제어 컴포넌트 (Controlled Component)

input의 값을 state로 제어하는 패턴. React가 입력 상태를 완전히 통제한다.

```jsx
const [text, setText] = useState('')

<input
  value={text}                            // state가 input 값을 결정
  onChange={(e) => setText(e.target.value)} // 변경 시 state 업데이트
/>
```

---

## 파일 구조

```
02_components_props_state/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx       # 앱 진입점
    ├── App.jsx        # 모든 섹션 포함 (4개 섹션)
    └── index.css      # 스타일
```

> 왜 파일을 나누지 않았나?
> 2강에서는 여러 컴포넌트가 어떻게 **같은 파일 안에서** 협력하는지를 보여주는 것이 우선이다.
> 컴포넌트 분리는 3강 이후에서 점진적으로 다룬다.

---

## 코드 설명

### ProfileCard — Props 활용

```jsx
function ProfileCard({ name, role, emoji, color, skills }) {
  return (
    <div className="profile-card">
      <div className="avatar" style={{ background: color }}>{emoji}</div>
      <div className="profile-name">{name}</div>
      <div className="profile-role">{role}</div>
      <div className="profile-skills">
        {skills.map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>
    </div>
  )
}
```

- `{ name, role, emoji, color, skills }` — 구조분해로 props를 받는다.
- `style={{ background: color }}` — props 값을 인라인 스타일에 연결한다.
- `skills.map(...)` — 배열 props를 리스트로 렌더링한다. `key`가 필수다.

### CounterSection — State 활용

```jsx
const [count, setCount] = useState(0)

<button onClick={() => setCount(count + 1)}>+1</button>
<button onClick={() => setCount(count - 1)}>−1</button>
<button onClick={() => setCount(0)}>초기화</button>
```

### ToggleDemo — Boolean State

```jsx
const [isOpen, setIsOpen] = useState(false)

<button onClick={() => setIsOpen(!isOpen)}>
  {isOpen ? '닫기' : '펼치기'}
</button>

{isOpen && <div>숨겨진 내용</div>}
```

- `!isOpen` — 현재 값을 반전시킨다.
- `{isOpen && <div>...}` — 조건부 렌더링: `isOpen`이 false면 아무것도 렌더링하지 않는다.

---

## 학생이 실수하기 쉬운 포인트

### 1. props를 자식 컴포넌트 내부에서 직접 변경하려 한다

```jsx
// ❌ 에러 — props는 읽기 전용이다
function ProfileCard({ name }) {
  name = '다른 이름'  // 작동하지 않는다
}

// ✅ 올바른 방법 — 변경이 필요하면 state를 사용하거나 부모에게 콜백으로 요청한다
```

### 2. onClick에 함수 호출 결과를 넣는다

```jsx
// ❌ 잘못된 방법 — 렌더링 시 즉시 실행된다
<button onClick={setCount(count + 1)}>

// ✅ 올바른 방법 — 함수를 전달한다 (클릭 시 실행)
<button onClick={() => setCount(count + 1)}>
```

### 3. state 업데이트가 비동기임을 모른다

```jsx
setCount(count + 1)
console.log(count)  // 아직 이전 값이다 — 업데이트는 다음 렌더링에 반영된다
```

### 4. 컴포넌트 이름을 소문자로 시작한다

```jsx
// ❌ React가 HTML 태그로 인식한다
function profileCard() { ... }
<profileCard />

// ✅ 대문자로 시작해야 React 컴포넌트로 인식한다
function ProfileCard() { ... }
<ProfileCard />
```

---

## 실습 과제

### 과제 1: ProfileCard에 새 항목 추가
`ProfileCard`에 `followers` prop을 추가해 "팔로워: n명"을 표시하라.
- 세 팀원 데이터에 `followers` 값을 추가하라.
- 팔로워가 100명 이상이면 뱃지 색을 다르게 표시하라.

### 과제 2: 글자 수 제한 입력창
`InputDemo`를 수정해서 최대 20자까지만 입력 가능하게 만들어라.
- 남은 글자 수를 "00/20" 형태로 표시하라.
- 20자에 달하면 경고 색으로 바뀌게 하라.

### 과제 3 (도전): 이름 편집 가능 프로필 카드
프로필 카드 아래에 "이름 편집" 버튼을 추가하라.
- 버튼을 누르면 input이 나타나고 이름을 수정할 수 있다.
- 확인 버튼을 누르면 카드에 새 이름이 표시된다.
- state와 props 중 어디서 관리해야 할지 생각해보라.

---

## 다음 강의로 이어지는 연결

2강에서는 각 컴포넌트가 **자기 state를 따로 관리**했다.  
그런데 두 컴포넌트가 **같은 state를 공유**해야 한다면 어떻게 할까?

3강에서는 **상태 위치가 컴포넌트 구조를 결정**하는 원리와,  
부모-자식 간에 데이터가 흐르는 **단방향 데이터 흐름**을 배운다.

> 핵심 질문: "이 상태를 **누가** 소유해야 하는가?"

---

## 실행 방법

```bash
cd 02_components_props_state
npm install
npm run dev
```
