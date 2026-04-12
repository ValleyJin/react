// ============================================================
// Custom Hook: useFormField
//
// 단일 입력 필드의 값과 유효성 검사를 관리하는 Custom Hook.
// 이 패턴을 이해하면 react-hook-form 같은 라이브러리의 원리를 알 수 있다.
//
// 사용법:
//   const emailField = useFormField('', (v) => v.includes('@') ? '' : '이메일 형식이 아닙니다')
//   <input {...emailField.inputProps} />
//   {emailField.error && <p>{emailField.error}</p>}
// ============================================================

import { useState } from 'react'

export function useFormField(initialValue = '', validate = () => '') {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)  // 한 번이라도 포커스를 뗐는지

  // 에러: 한 번 터치한 이후에만 표시 (처음부터 에러를 보여주면 UX가 나쁘다)
  const error = touched ? validate(value) : ''

  const inputProps = {
    value,
    onChange: (e) => setValue(e.target.value),
    onBlur: () => setTouched(true),  // 포커스를 떼면 touched를 true로
  }

  function reset() {
    setValue(initialValue)
    setTouched(false)
  }

  return { value, error, touched, inputProps, reset }
}
