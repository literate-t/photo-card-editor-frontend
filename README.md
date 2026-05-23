## 3D Photo Card Editor (Frontend)

웹 브라우저에서 3D 포토카드를 제작하고 편집하는 프론트엔드 애플리케이션입니다. 외부 3D 렌더링 엔진에 의존하지 않고 브라우저 네이티브 기술인 CSS 3D Transform을 활용하여 렌더링 성능을 최적화했습니다.

### 기술 스택

- **Core**: React, Vite, TypeScript
- **Styling**: Tailwindcss v4, CSS 3D
- **Infrastructure**: Vercel, Cloudflare

### Key Features

- **3D 인터랙션**: CSS `transform: rotate3d` 및 `perspective` 속성을 조합한 틸트 및 회전 효과 구현
- **라우팅 최적화**: History API의 `replace` 옵션을 적용하여 페이지 전환 시 이전 렌더링 상태 노출 및 뒤로 가기 스택 충돌 방지.
- **다중 레이어 편집**: 캔버스 내 독립적인 레이어 추가 및 리사이즈 핸들 구성

### Architecture

- Cloudflare DNS를 통한 도메인 라우팅 및 트래픽 제어.
- Vercel Edge Network를 활용한 정적 파일 빌드 및 글로벌 배포.

### Getting Started

```bash
# 의존성 패키지 설치
yarn install

# 로컬 개발 서버 실행
yarn dev
```
