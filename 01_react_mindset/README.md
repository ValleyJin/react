# 1강: 리액트의 사고방식

## 학습 목표

1. **선언형 프로그래밍**이 무엇인지, 명령형 방식과 어떻게 다른지 이해한다.
2. **UI = f(state)** 공식을 통해 React의 렌더링 모델을 체득한다.
3. 상태(state)가 바뀌면 React가 UI를 자동으로 다시 계산한다는 흐름을 눈으로 확인한다.

---

## 예제 프로젝트 개요

**좋아요 버튼** — 클릭할 때마다 좋아요 수가 바뀌는 간단한 UI

- 바닐라 JS(명령형)와 React(선언형) 코드를 **나란히 비교**한다.
- `useState`로 상태를 관리하고, 상태가 바뀌면 React가 자동으로 화면을 갱신함을 보여준다.
- DOM을 직접 조작하는 코드가 전혀 없음을 강조한다.

---

## 핵심 개념 설명

### 명령형 vs 선언형

| 구분 | 명령형 (바닐라 JS) | 선언형 (React) |
|------|-------------------|----------------|
| 관점 | **어떻게** 바꿀지 | **무엇이** 되어야 하는지 |
| DOM | 개발자가 직접 수정 | React가 알아서 처리 |
| 상태 | 변수가 코드 곳곳에 흩어짐 | 컴포넌트 내부에서 한 곳 관리 |
| 복잡도 | 로직이 복잡해질수록 버그 위험 ↑ | 상태만 관리하면 UI는 React 책임 |

### UI = f(state)

```
state (데이터)  →  f (컴포넌트 함수)  →  UI (화면)
```

- `state`가 바뀌면 React는 `f`(컴포넌트)를 **다시 실행**해 새 UI를 계산한다.
- 개발자는 "DOM을 어떻게 바꿀까"가 아니라 "**지금 상태가 무엇인가**"에만 집중한다.

### useState 기초

```js
const [likes, setLikes] = useState(0)
//      ↑ 현재 값       ↑ 값을 바꾸는 함수   ↑ 초기값
```

- `setLikes(새값)`을 호출하면 React가 컴포넌트를 **다시 렌더링**한다.
- 직접 `likes = 1` 처럼 변수를 바꾸면 **렌더링이 일어나지 않는다**.

---

## 파일 구조

```
01_react_mindset/
├── index.html          # HTML 진입점
├── package.json        # 의존성 설정
├── vite.config.js      # Vite 설정
└── src/
    ├── main.jsx        # React 앱 마운트
    ├── App.jsx         # 전체 예제 (3개 섹션)
    └── index.css       # 스타일
```

> 왜 파일을 나누지 않았나?
> 이 강의의 목표는 React 코드 흐름을 한눈에 보는 것이다.
> 파일이 여러 개면 "어디서 뭘 가져오는지"에 주의가 분산된다.
> `App.jsx` 하나에 모두 담아 위에서 아래로 읽으면 전체 구조가 보이게 했다.

---

## 전체 코드

`src/App.jsx` 파일을 참고하라.

---

## 코드 설명

### CompareSection 컴포넌트
바닐라 JS와 React 코드를 **나란히 보여주는** 설명용 섹션.
- 바닐라 JS: `addEventListener` + DOM 직접 수정
- React: `useState` + 상태만 바꾸면 UI가 따라옴

### FormulaSection 컴포넌트
`UI = f(state)` 공식을 시각적으로 설명하는 섹션.
4단계로 React 렌더링 모델의 흐름을 설명한다.

### LikeButtonDemo 컴포넌트
실제로 작동하는 좋아요 버튼.

```jsx
const [likes, setLikes] = useState(0)
const [liked, setLiked] = useState(false)

function handleClick() {
  if (!liked) {
    setLikes(likes + 1)  // 상태 변경 → 리렌더링 발생
    setLiked(true)
  } else {
    setLikes(likes - 1)
    setLiked(false)
  }
}
```

- 두 개의 상태(`likes`, `liked`)가 각각 다른 역할을 한다.
- 클릭 핸들러는 상태만 바꾼다. DOM 조작 코드가 없다.
- JSX 안의 `{liked ? '❤️ ...' : '🤍 ...'}` — 상태에 따라 UI가 자동으로 달라진다.

---

## 학생이 실수하기 쉬운 포인트

### 1. 상태를 직접 변경하려 한다
```js
// ❌ 잘못된 방법 — 렌더링이 일어나지 않는다
likes = likes + 1

// ✅ 올바른 방법 — setLikes가 React에게 "다시 그려라"고 알린다
setLikes(likes + 1)
```

### 2. useState의 반환값 구조를 헷갈린다
```js
// ❌ 잘못된 구조분해
const { likes, setLikes } = useState(0)  // 객체가 아니다!

// ✅ 올바른 구조분해 (배열)
const [likes, setLikes] = useState(0)
```

### 3. JSX는 HTML이 아니다
```jsx
// ❌ HTML 속성명을 그대로 쓴다
<div class="box">        // HTML
<button onclick={...}>   // HTML

// ✅ JSX 속성명을 사용한다
<div className="box">    // JSX
<button onClick={...}>   // JSX
```

---

## 실습 과제

### 과제 1: 카운터 만들기
`LikeButtonDemo`를 참고해서 "+1 / -1" 버튼이 있는 카운터를 만들어보라.
- 숫자가 0 미만으로 내려가지 않도록 조건을 추가하라.
- 숫자가 0이면 글자 색이 회색, 양수면 파란색이 되도록 스타일을 연결하라.

### 과제 2: 토글 버튼
"열기 / 닫기" 버튼 하나로 텍스트가 보이거나 숨겨지는 컴포넌트를 만들어보라.
- `isOpen` 상태(boolean)를 사용하라.
- 버튼 텍스트도 상태에 따라 바뀌어야 한다.

### 과제 3 (도전): 바닐라 JS로 만들어보기
같은 좋아요 버튼을 `index.html` 하나에 바닐라 JS로 구현해보라.
- React와 비교해서 어떤 점이 다른지 느껴보라.

---

## 다음 강의로 이어지는 연결

이 강의에서는 `useState`를 **맛보기** 수준으로만 사용했다.  
2강에서는 컴포넌트를 **재사용 가능한 단위**로 분리하는 법,  
props로 **외부에서 데이터를 받는 법**,  
그리고 state와 props의 차이를 본격적으로 배운다.

> 핵심 질문: "이 컴포넌트에서 **변하는 것**은 무엇이고, **변하지 않는 것**은 무엇인가?"

---

## 실행 방법

```bash
cd 01_react_mindset
npm install
npm run dev
```
