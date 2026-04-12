# React 입문 강의 — 5강 시리즈

> "문법 나열이 아니라, React의 사고방식을 익히는 강의"

---

## 강의 구조

| 폴더 | 강의 | 핵심 질문 |
|------|------|----------|
| `01_react_mindset/` | 1강: 리액트의 사고방식 | 상태가 바뀌면 UI는 어떻게 되는가? |
| `02_components_props_state/` | 2강: 컴포넌트, Props, State | props와 state의 차이는 무엇인가? |
| `03_rerender_dataflow/` | 3강: 리렌더링과 데이터 흐름 | 이 상태를 누가 소유해야 하는가? |
| `04_hooks_logic/` | 4강: Hooks와 로직 분리 | 렌더링 로직과 부수 효과를 어떻게 분리하는가? |
| `05_performance_design/` | 5강: 성능 최적화와 설계 전략 | 구조 문제인가, 최적화 문제인가? |

---

## 실행 방법

각 강의 폴더 안에서 독립 실행한다.

```bash
# 예: 1강 실행
cd 01_react_mindset
npm install
npm run dev
```

---

## 5강 전체 요약표

| 구분 | 1강 | 2강 | 3강 | 4강 | 5강 |
|------|-----|-----|-----|-----|-----|
| **강의 제목** | 리액트의 사고방식 | 컴포넌트, Props, State | 리렌더링과 데이터 흐름 | Hooks와 로직 분리 | 성능 최적화와 설계 전략 |
| **핵심 개념** | UI = f(state), 선언형 UI | 컴포넌트 재사용, props vs state | 단방향 데이터 흐름, State Lifting | useEffect, Custom Hook | memo, useMemo, useCallback, 구조 우선 |
| **대표 예제** | 좋아요 버튼 (명령형 vs 선언형 비교) | 프로필 카드 + 카운터 + 토글 + 입력 | 할 일 목록 (필터링, CRUD) | 타이머·폼·localStorage Custom Hook | 렌더 카운터, 소수 계산기 최적화 비교 |
| **자주 하는 실수** | `likes = likes + 1` (직접 변경) | `onClick={setCount(count+1)}` (즉시 실행) | `todos.push()`로 배열 직접 변경 | useEffect에 cleanup 함수 없음 | 모든 컴포넌트에 memo 붙이기 |
| **실무 연결** | React 선언형 사고로 전환 | 컴포넌트 라이브러리 구조 이해 | Redux, Zustand 등 상태 관리 기초 | API 호출 패턴, react-query 이해 | React DevTools Profiler, 대규모 앱 설계 |

---

## 3가지 핵심 학습 목표

### 1. UI를 상태의 결과로 보는 사고방식
```
상태(data)가 바뀐다 → React가 컴포넌트 함수를 다시 실행한다 → 새 UI가 화면에 나타난다
```
DOM을 직접 조작하지 않는다. 상태만 바꾸면 UI는 React가 책임진다.

### 2. 데이터 흐름과 렌더링의 관계 이해
```
부모 state → props → 자식 UI
자식의 이벤트 → 콜백 함수 호출 → 부모 state 변경 → 리렌더링
```
데이터는 위에서 아래로, 이벤트는 아래에서 위로.

### 3. 로직을 분리하고 재사용하는 실무 감각
```
컴포넌트 = UI 선언
Custom Hook = 상태 로직
순수 함수 = 계산/변환 로직
```
각 레이어가 하나의 역할만 담당하면 테스트와 재사용이 쉬워진다.

---

## 강의 간 연결 흐름

```
1강: 상태 변경 → UI 자동 갱신 (선언형)
  ↓
2강: 컴포넌트 분리 → props(외부) / state(내부) 구분
  ↓
3강: 여러 컴포넌트 → state를 공통 부모로 올리기 (State Lifting)
  ↓
4강: 부수 효과 분리 → useEffect / Custom Hook으로 로직 캡슐화
  ↓
5강: 성능 최적화 → 구조 먼저, 측정 후 memo/useMemo/useCallback 적용
```

---

## 강의별 빠른 참고

### 핵심 API 한눈에 보기

| API | 강의 | 한 줄 설명 |
|-----|------|-----------|
| `useState` | 1~3강 | 컴포넌트 내부 상태 관리 |
| `useEffect` | 4강 | 렌더링 외부 부수 효과 처리 |
| `useRef` | 4~5강 | 렌더링 없이 값 기억 / DOM 접근 |
| `React.memo` | 5강 | props 변경 없으면 리렌더링 스킵 |
| `useMemo` | 5강 | 비싼 계산 결과 캐싱 |
| `useCallback` | 5강 | 함수 참조 안정화 |
| Custom Hook | 4강 | `use`로 시작하는 로직 분리 함수 |

### 상태 위치 결정 원칙

```
이 상태를 한 컴포넌트만 사용한다    → 그 컴포넌트 안에 둔다
두 컴포넌트가 같은 상태를 사용한다  → 공통 부모로 올린다 (State Lifting)
상태가 너무 많이 올라간다            → 전역 상태 관리 라이브러리 도입 고려
```

---

*Vite + React 18 · JavaScript · 각 강의 독립 실행 가능*
