// Custom Hook: useCountdown
// 카운트다운 타이머 로직을 컴포넌트에서 분리한다.
// useEffect(setInterval)와 cleanup을 이 Hook이 모두 책임진다.

import { useState, useEffect, useRef } from 'react'

export function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            // 0이 되면 자동 정지
            setIsRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    // cleanup: isRunning이 바뀌거나 컴포넌트가 사라질 때 interval 정리
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  function start() { if (seconds > 0) setIsRunning(true) }
  function pause() { setIsRunning(false) }
  function reset(newSeconds) {
    setIsRunning(false)
    setSeconds(newSeconds ?? initialSeconds)
  }

  return { seconds, isRunning, start, pause, reset }
}
