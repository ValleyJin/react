import { useState, useEffect } from 'react'
import { useTimer } from './hooks/useTimer'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useFormField } from './hooks/useFormField'

// ============================================================
// 4강: Hooks와 로직 분리
//
// 핵심 개념:
//   1. useEffect: 렌더링 외부의 부수 효과 처리 (타이머, API, 이벤트 리스너 등)
//   2. 잘못된 useEffect vs 올바른 useEffect 비교
//   3. Custom Hook: 반복되는 상태 로직을 함수로 추출
// ============================================================

// -------------------------------------------------------
// 섹션 1: useEffect 잘못된 사용 vs 올바른 사용 비교
// -------------------------------------------------------
function UseEffectCompare() {
  return (
    <div className="section">
      <span className="badge badge-effect">useEffect</span>
      <h2>useEffect — 렌더링과 부수 효과의 분리</h2>

      <p>
        <code>useEffect</code>는 렌더링 이후에 실행되는 <strong>부수 효과(side effect)</strong>를 처리한다.<br />
        부수 효과: API 호출, 타이머, DOM 직접 접근, 이벤트 리스너 등
      </p>

      <div className="compare-grid" style={{ marginTop: 16 }}>

        {/* 잘못된 사용 예시 */}
        <div className="compare-box bad">
          <h3>❌ 잘못된 사용</h3>
          <pre>{`function BadTimer() {
  const [sec, setSec] = useState(0)

  // 렌더링할 때마다 새 interval이 쌓인다!
  // 의존성 배열이 없으면 매 렌더링마다 실행
  useEffect(() => {
    setInterval(() => {
      setSec((s) => s + 1)
    }, 1000)
    // cleanup이 없음 → 메모리 누수
  })

  return <div>{sec}</div>
}`}</pre>
          <p style={{ fontSize: '0.82rem', color: '#c53030' }}>
            문제: interval이 누적되어 숫자가 점점 빠르게 증가한다.
          </p>
        </div>

        {/* 올바른 사용 예시 */}
        <div className="compare-box good">
          <h3>✅ 올바른 사용</h3>
          <pre>{`function GoodTimer() {
  const [sec, setSec] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSec((s) => s + 1)
    }, 1000)

    // cleanup: 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(id)
  }, []) // [] = 마운트될 때 한 번만 실행

  return <div>{sec}</div>
}`}</pre>
          <p style={{ fontSize: '0.82rem', color: '#276749' }}>
            핵심: cleanup 함수로 interval을 정리한다.
            의존성 배열 <code>[]</code>로 한 번만 실행한다.
          </p>
        </div>

      </div>

      <div style={{ marginTop: 16 }}>
        <h3>useEffect 의존성 배열 규칙</h3>
        <br />
        <pre>{`useEffect(() => { ... })         // 매 렌더링마다 실행 (거의 사용 안 함)
useEffect(() => { ... }, [])     // 마운트될 때 딱 한 번 실행
useEffect(() => { ... }, [id])   // id가 바뀔 때마다 실행`}</pre>
      </div>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 2: useTimer Custom Hook 사용 예제
// -------------------------------------------------------
function TimerSection() {
  // 타이머 로직은 useTimer Hook으로 완전히 분리되어 있다.
  // 이 컴포넌트는 UI만 담당한다.
  const { seconds, isRunning, start, stop, reset } = useTimer()

  // 60초 이상이면 경고 색상
  const isWarning = seconds >= 60

  // 초 → mm:ss 형식으로 변환
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs    = String(seconds % 60).padStart(2, '0')

  return (
    <div className="section">
      <span className="badge badge-hook">Custom Hook</span>
      <h2>useTimer — 타이머 로직을 Hook으로 분리</h2>
      <p>
        <code>useTimer</code>는 타이머 상태와 useEffect를 내부적으로 관리한다.
        이 컴포넌트는 UI만 담당하고, 타이머 동작은 Hook에게 위임한다.
      </p>

      <div className={`timer-display ${isWarning ? 'warning' : ''}`}>
        {minutes}:{secs}
        {isWarning && ' ⚠️'}
      </div>

      <div className="btn-row">
        {!isRunning
          ? <button className="btn-start" onClick={start}>▶ 시작</button>
          : <button className="btn-stop"  onClick={stop}>⏸ 정지</button>
        }
        <button className="btn-reset" onClick={reset}>↺ 초기화</button>
      </div>

      <div className="note" style={{ marginTop: 16 }}>
        <strong>Hook 파일 위치:</strong> <code>src/hooks/useTimer.js</code><br />
        컴포넌트 코드를 보면 setInterval, clearInterval이 전혀 없다.
        타이머 로직은 Hook 안에 완전히 캡슐화되어 있다.
      </div>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 3: useLocalStorage Custom Hook 사용 예제
// -------------------------------------------------------
function LocalStorageSection() {
  // useState와 동일하게 사용하지만, 새로고침해도 값이 유지된다!
  const [nickname, setNickname] = useLocalStorage('lecture4-nickname', '')

  return (
    <div className="section">
      <span className="badge badge-hook">Custom Hook</span>
      <h2>useLocalStorage — 저장소 동기화를 Hook으로 분리</h2>
      <p>
        페이지를 새로고침해도 입력한 값이 유지된다.
        <code>useState</code>와 인터페이스가 동일해서 교체가 쉽다.
      </p>

      <div className="ls-demo">
        <input
          className="ls-input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력하세요..."
        />
        <button className="btn-reset" onClick={() => setNickname('')}>지우기</button>
      </div>

      {nickname && (
        <p style={{ marginTop: 10 }}>
          안녕하세요, <strong>{nickname}</strong>님! 🎉 (새로고침해도 유지됩니다)
        </p>
      )}

      <p className="ls-hint">
        개발자 도구 → Application → Local Storage에서 실제로 저장되는 것을 확인해보라.
      </p>

      <div className="note" style={{ marginTop: 12 }}>
        <strong>Hook 파일 위치:</strong> <code>src/hooks/useLocalStorage.js</code><br />
        localStorage 읽기/쓰기 로직이 Hook 안에 숨어 있다.
        사용하는 컴포넌트는 <code>useState</code>와 똑같이 쓰면 된다.
      </div>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 4: useFormField Custom Hook 사용 예제
// -------------------------------------------------------

// 유효성 검사 함수들 (순수 함수로 별도 정의 — 테스트하기 쉽다)
const validateEmail = (v) => {
  if (!v) return '이메일을 입력하세요.'
  if (!v.includes('@')) return '올바른 이메일 형식이 아닙니다.'
  return ''  // 에러 없음
}
const validateName = (v) => {
  if (!v) return '이름을 입력하세요.'
  if (v.length < 2) return '이름은 2자 이상이어야 합니다.'
  return ''
}

function FormSection() {
  const nameField  = useFormField('', validateName)
  const emailField = useFormField('', validateEmail)
  const [submitted, setSubmitted] = useState(false)

  const isValid = !validateName(nameField.value) && !validateEmail(emailField.value)

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    setSubmitted(true)
  }

  function handleReset() {
    nameField.reset()
    emailField.reset()
    setSubmitted(false)
  }

  return (
    <div className="section">
      <span className="badge badge-hook">Custom Hook</span>
      <h2>useFormField — 입력 폼 로직을 Hook으로 분리</h2>
      <p>
        각 입력 필드의 값, 유효성 검사, 터치 여부를 <code>useFormField</code>로 관리한다.
        컴포넌트 코드에는 입력값 처리 로직이 없다.
      </p>

      <form className="form-demo" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">이름</label>
          <input
            className={`form-input ${nameField.error ? 'error' : ''}`}
            placeholder="이름을 입력하세요"
            {...nameField.inputProps}  // value, onChange, onBlur를 한 번에 spread
          />
          {nameField.error && <p className="form-error">{nameField.error}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">이메일</label>
          <input
            className={`form-input ${emailField.error ? 'error' : ''}`}
            placeholder="email@example.com"
            {...emailField.inputProps}
          />
          {emailField.error && <p className="form-error">{emailField.error}</p>}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="form-submit" disabled={!isValid}>
            제출
          </button>
          <button type="button" className="btn-reset" onClick={handleReset}>
            초기화
          </button>
        </div>
      </form>

      {submitted && (
        <div className="form-result">
          ✅ 제출 완료! 이름: <strong>{nameField.value}</strong>, 이메일: <strong>{emailField.value}</strong>
        </div>
      )}

      <div className="note" style={{ marginTop: 12 }}>
        <strong>Hook 파일 위치:</strong> <code>src/hooks/useFormField.js</code><br />
        폼이 입력 필드가 10개라도 <code>useFormField</code>를 10번 호출하면 된다.
        유효성 검사 로직이 중복되지 않는다.
      </div>
    </div>
  )
}

// -------------------------------------------------------
// 섹션 5: 온라인 상태 감지 (useEffect + 이벤트 리스너)
// -------------------------------------------------------
function OnlineStatusSection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // 브라우저 온라인/오프라인 이벤트 리스너를 등록한다
    function handleOnline()  { setIsOnline(true) }
    function handleOffline() { setIsOnline(false) }

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    // cleanup: 컴포넌트가 사라질 때 이벤트 리스너를 제거한다
    // 제거하지 않으면 이미 사라진 컴포넌트에서 state를 변경하려 해 경고가 발생한다
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])  // 마운트될 때 한 번만 리스너를 등록한다

  return (
    <div className="section">
      <span className="badge badge-effect">useEffect + Cleanup</span>
      <h2>온라인 상태 감지 — 이벤트 리스너 cleanup</h2>
      <p>useEffect에서 이벤트 리스너를 등록하고, cleanup 함수로 반드시 제거한다.</p>

      <div className={`status-pill ${isOnline ? 'online' : 'offline'}`}>
        <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
        {isOnline ? '온라인 상태입니다' : '오프라인 상태입니다'}
      </div>

      <p className="note">
        개발자 도구 → Network 탭 → "Offline"으로 바꾸면 오프라인 상태가 감지된다.<br />
        cleanup 함수가 없으면 컴포넌트가 언마운트된 후에도 리스너가 남아 메모리 누수가 생긴다.
      </p>
    </div>
  )
}

// -------------------------------------------------------
// 메인 App
// -------------------------------------------------------
export default function App() {
  return (
    <div className="page">
      <h1>4강: Hooks와 로직 분리</h1>
      <p className="subtitle">useEffect · cleanup · Custom Hook (useTimer, useLocalStorage, useFormField)</p>

      <UseEffectCompare />
      <TimerSection />
      <OnlineStatusSection />
      <LocalStorageSection />
      <FormSection />
    </div>
  )
}
