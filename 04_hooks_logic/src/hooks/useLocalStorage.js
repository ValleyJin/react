// ============================================================
// Custom Hook: useLocalStorage
//
// localStorage와 동기화되는 state를 만드는 Custom Hook이다.
// useState와 똑같이 사용하되, 페이지를 새로고침해도 값이 유지된다.
//
// 사용법:
//   const [name, setName] = useLocalStorage('username', '')
//   → useState와 동일한 인터페이스, localStorage에 자동 저장
// ============================================================

import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  // 1. 초기값: localStorage에 저장된 값이 있으면 그걸 쓰고, 없으면 initialValue
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  // 2. value가 바뀔 때마다 localStorage에 동기화한다
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage가 없는 환경(예: 시크릿 모드 용량 초과)에서도 앱이 동작해야 한다
    }
  }, [key, value])

  return [value, setValue]
}
