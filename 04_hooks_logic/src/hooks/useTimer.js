// ============================================================
// Custom Hook: useTimer
//
// 타이머 로직을 컴포넌트에서 분리한 Custom Hook이다.
// 컴포넌트는 UI만 담당하고, 타이머 동작은 여기서 관리한다.
//
// 반환값:
//   seconds  - 현재 경과 초
//   isRunning - 타이머 실행 중 여부
//   start    - 타이머 시작
//   stop     - 타이머 정지
//   reset    - 타이머 초기화
// ============================================================

import { useState, useEffect, useRef } from 'react'

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  // useRef: 렌더링에 영향을 주지 않는 값을 기억할 때 사용
  // intervalId는 화면에 표시할 필요 없으므로 ref로 관리한다
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      // 부수 효과: 타이머 시작 (setInterval은 렌더링 밖의 일)
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      // 정리(cleanup): 타이머 정지
      clearInterval(intervalRef.current)
    }

    // cleanup 함수: useEffect가 다시 실행되거나 컴포넌트가 언마운트될 때 호출된다
    // 이전 interval을 정리하지 않으면 interval이 누적되어 버그가 생긴다
    return () => clearInterval(intervalRef.current)
  }, [isRunning])  // isRunning이 바뀔 때만 이 effect를 재실행한다

  function start() { setIsRunning(true) }
  function stop()  { setIsRunning(false) }
  function reset() {
    setIsRunning(false)
    setSeconds(0)
  }

  return { seconds, isRunning, start, stop, reset }
}
