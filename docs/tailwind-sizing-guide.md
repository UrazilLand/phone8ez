# Tailwind CSS 사이즈 가이드

이 문서는 프로젝트의 레이아웃 조절에 사용되는 주요 Tailwind CSS 클래스 옵션을 안내합니다.

## `max-width` (최대 너비) 옵션

`max-w-{size}` 형태로 사용하며, 컨테이너의 최대 너비를 제한합니다. 주로 중앙 정렬(`mx-auto`)과 함께 사용됩니다.

| 클래스 이름         | 값 (rem / px)             | 설명                                           |
| ------------------- | ------------------------- | ---------------------------------------------- |
| `max-w-none`        | `none`                    | 최대 너비 제한 없음                            |
| `max-w-xs`          | `20rem` / `320px`         | 아주 작은 화면 (Extra Small)                   |
| `max-w-sm`          | `24rem` / `384px`         | 작은 화면 (Small)                              |
| `max-w-md`          | `28rem` / `448px`         | 중간 화면 (Medium)                             |
| `max-w-lg`          | `32rem` / `512px`         | 큰 화면 (Large)                                |
| `max-w-xl`          | `36rem` / `576px`         | 아주 큰 화면 (Extra Large)                     |
| `max-w-2xl`         | `42rem` / `672px`         | 2X Large                                       |
| `max-w-3xl`         | `48rem` / `768px`         | 3X Large                                       |
| `max-w-4xl`         | `56rem` / `896px`         | 4X Large                                       |
| `max-w-5xl`         | `64rem` / `1024px`        | 5X Large                                       |
| `max-w-6xl`         | `72rem` / `1152px`        | 6X Large                                       |
| `max-w-7xl`         | `80rem` / `1280px`        | 7X Large (일반적인 데스크톱 화면에 적합)       |
| `max-w-full`        | `100%`                    | 부모 요소의 전체 너비                          |
| `max-w-screen-sm`   | `640px`                   | `sm` 브레이크포인트와 동일                     |
| `max-w-screen-md`   | `768px`                   | `md` 브레이크포인트와 동일                     |
| `max-w-screen-lg`   | `1024px`                  | `lg` 브레이크포인트와 동일                     |
| `max-w-screen-xl`   | `1280px`                  | `xl` 브레이크포인트와 동일                     |
| `max-w-screen-2xl`  | `1536px`                  | `2xl` 브레이크포인트와 동일                    |
| `max-w-[...]`       | 임의의 값                 | `max-w-[61rem]` 처럼 대괄호를 사용해 원하는 값을 직접 입력할 수 있습니다. |

## `margin` (바깥쪽 여백) 옵션

`m{direction}-{size}` 형태로 사용합니다. `mx`는 좌우 여백, `my`는 상하 여백을 의미합니다.

| 클래스 이름 | 값 (rem / px) |
| ----------- | ------------- |
| `mx-0`      | `0px`         |
| `mx-px`     | `1px`         |
| `mx-0.5`    | `0.125rem` / `2px` |
| `mx-1`      | `0.25rem` / `4px` |
| `mx-1.5`    | `0.375rem` / `6px` |
| `mx-2`      | `0.5rem` / `8px` |
| `mx-2.5`    | `0.625rem` / `10px` |
| `mx-3`      | `0.75rem` / `12px` |
| `mx-3.5`    | `0.875rem` / `14px` |
| `mx-4`      | `1rem` / `16px` |
| `mx-5`      | `1.25rem` / `20px` |
| `mx-6`      | `1.5rem` / `24px` |
| `mx-8`      | `2rem` / `32px` |
| `mx-10`     | `2.5rem` / `40px` |
| `mx-12`     | `3rem` / `48px` |
| `mx-16`     | `4rem` / `64px` |
| `mx-20`     | `5rem` / `80px` |
| `mx-auto`   | `auto`        | 중앙 정렬 시 사용 |

## 반응형으로 적용하는 법

`{breakpoint}:{class}` 형태로 조합하여 화면 크기별로 다른 스타일을 적용할 수 있습니다.

**예시:**

-   **`className="max-w-md lg:max-w-4xl"`**
    -   기본적으로 최대 너비를 `md` 사이즈로 제한합니다.
    -   `lg` 화면(1024px) 이상부터는 최대 너비를 `4xl`로 확장합니다.

-   **`className="mx-4 sm:mx-8 lg:mx-16"`**
    -   기본적으로 좌우 여백을 `1rem`으로 설정합니다.
    -   `sm` 화면(640px) 이상부터는 여백을 `2rem`으로 늘립니다.
    -   `lg` 화면(1024px) 이상부터는 여백을 `4rem`으로 더 늘립니다. 