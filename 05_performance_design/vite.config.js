// vite.config.js는 Vite 번들러의 설정 파일입니다.
// 실제로는 개발자 코드 어디에서도 import하지 않습니다.
// vite.config.js는 Vite 실행 엔진이 자동으로 읽는 약속된 파일입니다.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
