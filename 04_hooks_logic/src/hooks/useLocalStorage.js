// Custom Hook: useLocalStorage
// useState와 동일한 인터페이스지만, 새로고침해도 값이 유지된다.

import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  // value가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage 사용 불가 환경에서도 앱이 동작해야 한다
    }
  }, [key, value])

  return [value, setValue]
}
