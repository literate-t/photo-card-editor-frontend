# 포토카드 에디터 프론트엔드

웹 브라우저에서 3D 포토카드를 제작하고 편집하는 프론트엔드 애플리케이션입니다. 외부 3D 렌더링 엔진 없이 CSS 3D Transform만으로 카드 두께·틸트·글레어 효과를 구현하고, Axios 인터셉터 레이어에서 Silent Refresh와 경합 방지를 처리하여 UI 컴포넌트를 인증 로직으로부터 분리했습니다.

## 사용된 기술

| 분류            | 기술                              |
| --------------- | --------------------------------- |
| 프레임워크      | React 19, TypeScript 5, Vite 8    |
| 상태 관리       | Zustand 5                         |
| HTTP 클라이언트 | Axios (인터셉터 기반 인증 레이어) |
| 스타일링        | Tailwind CSS v4, CSS 3D Transform |
| 백엔드 연동     | Supabase JS (이미지 Storage)      |
| 인프라          | Vercel, Cloudflare                |

## 아키텍처 개요

```
브라우저
  ├── phocady.com (Cloudflare DNS)
  │       └── Vercel (React 정적 빌드)
  │               └── React SPA
  │                       │
  │               ┌───────┴──────────┐
  │               ▼                  ▼
  │         useAuthStore        useEditorStore
  │         (인증·토큰)          (레이어·카드)
  │               │                  │
  │               └────────┬─────────┘
  │                        ▼
  │               apiClient (Axios)
  │               ├── Request Interceptor (Bearer 주입)
  │               └── Response Interceptor (401 → refresh → 재시도)
  │                        │
  │             ┌──────────┴──────────┐
  │             ▼                     ▼
  │     api.phocady.com          Supabase Storage
  │     (NestJS REST API)        (카드 이미지 CDN)
  │
  └── /card/:uuid → CardPage (공개 공유 링크)
```

## 기술 주안점

<details>
<summary><b>1. Silent Refresh — 앱 초기화 시 자동 토큰 갱신</b></summary>

페이지를 새로고침하면 메모리에 보관된 Access Token이 사라집니다. 로그인 상태를 복원하기 위해 `App` 마운트 직후 서버에 Refresh Token 쿠키를 보내 Access Token을 재발급받습니다.

#### 초기화 흐름

```
앱 마운트 → POST /auth/refresh  (HttpOnly 쿠키 자동 포함)
  ├── 성공: setAccessToken(token) → setAuthReady()
  └── 실패: setAuthReady()         ← 비로그인 상태로 진행
              ↓
         isAuthReady = true → 라우팅 시작
              ↓
         PrivateRoute: accessToken 없으면 /login 리디렉션
```

- `isAuthReady`가 `false`인 동안 앱 전체를 `null`로 차단 — 인증 상태가 확정되기 전에 라우터가 렌더링되어 잘못된 리디렉션이 발생하는 것을 방지합니다.
- `.catch`에서 아무것도 하지 않는 것이 의도적인 설계입니다. 실패는 곧 비로그인 상태이며, 인가 판단은 `PrivateRoute`에 완전히 위임합니다.
- Access Token은 Zustand 메모리에만 보관합니다. `localStorage`에 저장하지 않으므로 XSS 공격으로 토큰이 탈취되지 않습니다.

</details>

<details>
<summary><b>2. 경합 방지: refreshingPromise 통합</b></summary>

Access Token이 만료된 시점에 여러 API 요청이 동시에 진행 중이라면, 모든 요청이 401을 받고 각자 `/auth/refresh`를 호출할 수 있습니다. 중복 refresh는 서버의 Refresh Token 로테이션 정책과 충돌합니다.

#### 해결 전략

```
요청 A 401 → refreshingPromise 없음 → 새로 생성 → POST /auth/refresh
요청 B 401 → refreshingPromise 존재 → await 대기  ← 중복 호출 없음
요청 C 401 → refreshingPromise 존재 → await 대기
  ↓ refresh 완료 → .finally → refreshingPromise = null
A, B, C 모두 새 토큰으로 원본 요청 재시도
```

- 모듈 스코프의 `refreshingPromise: Promise<string> | null` 변수가 진행 중인 refresh를 추적합니다.
- 첫 번째 401 요청만 새 Promise를 생성하고, 이후 요청들은 동일 Promise를 `await`합니다.
- `_retry` 플래그로 재시도 요청이 다시 인터셉터에서 401 루프에 진입하는 것을 차단합니다.
- `/auth/refresh` 자체가 401을 반환하는 경우는 `isRefreshRequest` 가드로 분기하여 무한 루프를 방지합니다.

</details>

<details>
<summary><b>3. Axios 인터셉터 미들웨어 레이어</b></summary>

UI 컴포넌트와 Zustand 스토어는 토큰 주입·갱신 로직을 전혀 알지 못합니다. 인증과 관련된 모든 처리는 `apiClient` 단에서 투명하게 수행됩니다.

#### 인터셉터 구성

| 인터셉터 | 역할                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| Request  | `useAuthStore.getState().accessToken` 읽어 `Authorization: Bearer` 헤더 자동 주입 |
| Response | 401 감지 → refreshingPromise 통합 refresh → 원본 요청 Config 재사용하여 재시도    |

- `withCredentials: true`로 Axios 인스턴스를 생성하여 HttpOnly Refresh Token 쿠키가 모든 요청에 자동으로 포함됩니다.
- refresh 실패 시 `clearAuth()` 호출 후 `window.location.href = "/login"`으로 강제 이동합니다.
- `useAuthStore.getState()`는 React 렌더링 사이클 밖에서도 Zustand 상태를 직접 읽을 수 있는 방법입니다. 인터셉터는 React Hook을 사용할 수 없으므로 이 방식을 활용합니다.

</details>

<details>
<summary><b>4. CSS 3D 최적화</b></summary>

외부 3D 라이브러리 없이 브라우저 네이티브 CSS만으로 틸트·글레어 인터랙션을 구현하고, 성능 영향을 최소화하기 위한 여러 최적화를 적용했습니다.

#### 렌더링 파이프라인

`perspective: 1000px`(원근 컨텍스트 설정) → `transformStyle: preserve-3d`(자식 요소들이 3D 공간에 배치되도록 허용) → 마우스 위치에 따라 `rotateX / rotateY` 적용

#### willChange 조건부 적용

```typescript
willChange: isHovered ? "transform" : "auto";
```

hover 중에만 GPU 컴포지팅 레이어를 프로모션하고, hover 해제 시 즉시 `"auto"`로 복원합니다. 항상 `willChange: "transform"`을 선언하면 모든 카드가 상시 GPU 레이어를 점유하므로 hover 상태에서만 조건부로 적용합니다.

#### 이벤트 throttle

`mousemove` 핸들러를 `useRafHandler` 훅으로 래핑하여 `requestAnimationFrame`에 동기화합니다. 브라우저는 초당 수백 번의 이벤트를 발생시킬 수 있지만, 화면 갱신은 최대 60fps이므로 rAF 이전에 들어오는 이벤트는 무시합니다.

#### 글레어 효과

Canvas나 WebGL 없이 CSS `linear-gradient` 오버레이로 구현합니다. 마우스 방향각(`Math.atan2`)과 중심까지의 거리(정규화된 벡터 크기)를 실시간 계산하여 각도·불투명도를 결정합니다.

#### transition 조건부 적용

hover 중에는 `transition`을 제거하여 마우스 이동에 즉각 반응하고, hover 해제 후 초기 위치로 복귀할 때만 `transition-transform duration-200`을 적용하여 부드러운 복귀 모션을 제공합니다.

</details>

<details>
<summary><b>5. middleLayers: CSS 3D 카드 두께 구현</b></summary>

3D 카드가 기울어질 때 단면에 시각적 두께가 보여야 실물감이 생깁니다. 앞면과 뒷면 사이에 중간 레이어를 수학적으로 배치하여 이를 구현합니다.

#### 레이어 배치 계산

```
THICKNESS = 8px
앞면   [ translateZ(+4px) ]
레이어1 [ translateZ(+1.3px) ]  ← stride = 8 / (3 + 1) = 2px 간격
레이어2 [ translateZ(-0.7px) ]
레이어3 [ translateZ(-2.7px) ]
뒷면   [ translateZ(-4px) ]
```

- `layerCount = Math.floor(THICKNESS / 2)` — 두께 절반만큼의 레이어 생성
- `stride = THICKNESS / (layerCount + 1)` — 레이어 간 균등 간격 산출
- 각 레이어의 z 위치: `-HALF_THICKNESS + stride * (i + 1)`

#### useMemo 적용

`middleLayers`는 `sideColor`가 변경될 때만 재계산됩니다. `useMemo` 없이는 마우스 이동마다 회전값이 바뀌어 불필요한 레이어 재생성이 발생합니다.

</details>

<details>
<summary><b>6. 이미지 레이어 관리: Blob URL 라이프사이클</b></summary>

로컬 파일을 에디터에 추가할 때부터 서버에 저장될 때까지, 이미지 데이터는 Blob URL → FormData 변환의 라이프사이클을 거칩니다.

#### 타입 시스템

```typescript
BaseLayer          // 공통: id, type, x, y, width, height, rotation, zIndex
  ├── TextLayer    // 추가: content, fontSize, color, fontFamily, textAlign ...
  └── ImageLayer   // 추가: src, blendMode (6종), maskType (none/circle/heart)

type Layer = TextLayer | ImageLayer;
```

`BaseLayer`의 공통 속성을 공유하면서 각 레이어 타입이 독립적인 속성을 가지는 구조입니다.

#### Blob URL 라이프사이클

```
[로컬 파일 추가]
URL.createObjectURL(file) → src = "blob:..." → 에디터 즉시 미리보기

[saveCard() 호출]
blob URL 감지 → fetch(blobUrl).blob() → FormData.append("files", blob, key)
→ src = "image_file_N" (임시 키) → POST /api/card → 서버에서 Supabase URL로 교체

[removeLayer() / clearLayers()]
src.startsWith("blob:") → URL.revokeObjectURL(src) → 브라우저 메모리 즉시 해제
```

- Blob URL은 탭이 닫히기 전까지 브라우저 메모리를 점유합니다. 레이어 삭제·전체 초기화 시 명시적으로 `revokeObjectURL`을 호출하여 메모리 누수를 방지합니다.
- `saveCard()`와 `loadCard(uuid)`를 스토어 내부에 정의합니다. 컴포넌트는 스토어 액션 호출만 담당하고, 비동기 처리·에러 핸들링·상태 전환은 스토어가 캡슐화합니다.

</details>

<details>
<summary><b>7. Zustand 스토어 설계</b></summary>

인증 상태와 에디터 상태를 독립된 스토어로 분리하고, 팩토리 함수로 공통 미들웨어를 일관되게 적용합니다.

#### createStore 팩토리

```typescript
export const createStore = <T extends object>(
  initializer: StateCreator<T, [["zustand/devtools", never]]>,
) => create<T, [["zustand/devtools", never]]>(devtools(initializer));
```

`devtools` 미들웨어를 팩토리에 한 번만 등록하여 모든 스토어에 Redux DevTools 지원을 자동으로 적용합니다.

#### 스토어 분리 전략

| 스토어           | 보관 상태                                              | 관심 컴포넌트                          |
| ---------------- | ------------------------------------------------------ | -------------------------------------- |
| `useAuthStore`   | accessToken, isAuthReady                               | App, PrivateRoute, apiClient           |
| `useEditorStore` | layers, cardId, selectedLayerId, sideColor, isSaving … | EditorCanvas, LayerToolbar, SaveButton |

두 스토어를 분리하면 에디터 컴포넌트가 인증 상태를 구독하지 않고, 인증 로직이 에디터 상태를 알 필요가 없습니다.

#### Access Token 메모리 전용 보관

`accessToken`은 Zustand 상태에만 저장합니다. 새로고침 시 값이 사라지고 Silent Refresh가 복원합니다. `localStorage`나 `sessionStorage`에 저장하지 않으므로 XSS 공격으로 토큰이 탈취되는 경로를 차단합니다.

`useAuthStore.getState()`는 React 컴포넌트 바깥(Axios 인터셉터)에서 Zustand 상태를 읽는 방법으로, Hook 규칙을 위반하지 않으면서 토큰에 접근할 수 있습니다.

</details>

## Getting Started

### Prerequisites

- Node.js v24 LTS

### 환경 변수

`.env.local` 파일을 생성하고 다음 항목을 설정합니다.

```
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

### Local Development

```bash
# 의존성 패키지 설치
yarn install

# 로컬 개발 서버 실행
yarn dev
```
