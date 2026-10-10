<script setup lang="ts">
export type MascotExpression = 'happy' | 'cheer' | 'think' | 'oops' | 'wave';

withDefaults(defineProps<{ expression?: MascotExpression; animated?: boolean }>(), {
  expression: 'happy',
  animated: false,
});
</script>

<template>
  <svg
    viewBox="0 0 120 120"
    class="mascot"
    :class="[`mascot-${expression}`, animated ? 'motion-safe:animate-float' : '']"
    role="img"
    aria-label="Lingo, la mascotte de LinguaGo"
  >
    <g class="mascot-tail">
      <path d="M30 92c-10 6-16 16-14 24 6-2 12-8 16-16z" fill="#f59e0b" />
      <path d="M38 96c-8 8-10 18-6 24 5-4 9-12 10-20z" fill="#2563eb" />
    </g>
    <ellipse cx="60" cy="74" rx="36" ry="38" fill="#3b82f6" />
    <ellipse cx="62" cy="88" rx="21" ry="20" fill="#fde047" />
    <path
      class="mascot-wing"
      d="M86 66c12 4 18 16 14 30-6-2-12-8-16-18-2-5-2-9 2-12z"
      fill="#2563eb"
    />
    <circle cx="60" cy="46" r="31" fill="#3b82f6" />
    <path d="M44 20c-2-8 2-14 8-16-1 5 0 9 2 12z" fill="#f59e0b" />
    <path d="M56 16c0-9 5-14 11-15-2 5-2 10 0 14z" fill="#3b82f6" />
    <path d="M66 20c3-7 9-10 14-9-4 4-6 8-6 12z" fill="#f59e0b" />
    <ellipse cx="60" cy="54" rx="22" ry="18" fill="#dbeafe" />
    <ellipse cx="42" cy="60" rx="5" ry="3" fill="#fb7185" opacity="0.55" />
    <ellipse cx="78" cy="60" rx="5" ry="3" fill="#fb7185" opacity="0.55" />

    <g class="mascot-eyes-open">
      <circle cx="49" cy="46" r="8" fill="#fff" />
      <circle cx="71" cy="46" r="8" fill="#fff" />
      <g class="mascot-pupils">
        <circle cx="50" cy="47" r="4" fill="#0f172a" />
        <circle cx="72" cy="47" r="4" fill="#0f172a" />
        <circle cx="51.5" cy="45.5" r="1.4" fill="#fff" />
        <circle cx="73.5" cy="45.5" r="1.4" fill="#fff" />
      </g>
    </g>
    <g
      class="mascot-eyes-closed"
      fill="none"
      stroke="#0f172a"
      stroke-width="3"
      stroke-linecap="round"
    >
      <path d="M43 47c3-5 9-5 12 0" />
      <path d="M65 47c3-5 9-5 12 0" />
    </g>
    <g class="mascot-brows" fill="none" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round">
      <path class="mascot-brow-left" d="M42 35l12-2" />
      <path class="mascot-brow-right" d="M66 33l12 2" />
    </g>

    <path d="M48 58q12-7 24 0l-12 14z" fill="#f59e0b" />
    <path d="M52 63l8 9 8-9q-8 3-16 0z" fill="#d97706" />

    <g class="mascot-sweat">
      <path d="M94 36c-4 6-4 10 0 12 4-2 4-6 0-12z" fill="#60a5fa" />
    </g>
    <g class="mascot-star" fill="#fde047">
      <path d="M100 14l2.6 6 6.4.6-4.8 4.3 1.4 6.4-5.6-3.4-5.6 3.4 1.4-6.4-4.8-4.3 6.4-.6z" />
    </g>
    <g class="mascot-hand">
      <path d="M22 60c-8-6-12-14-8-20 5 2 10 8 12 16z" fill="#2563eb" />
    </g>

    <ellipse cx="50" cy="112" rx="8" ry="4" fill="#f59e0b" />
    <ellipse cx="70" cy="112" rx="8" ry="4" fill="#f59e0b" />
  </svg>
</template>

<style scoped>
.mascot-eyes-closed,
.mascot-brows,
.mascot-sweat,
.mascot-star,
.mascot-hand {
  display: none;
}
.mascot-cheer .mascot-eyes-open {
  display: none;
}
.mascot-cheer .mascot-eyes-closed,
.mascot-cheer .mascot-star {
  display: block;
}
.mascot-think .mascot-pupils {
  transform: translate(2px, -3px);
}
.mascot-think .mascot-brows {
  display: block;
}
.mascot-think .mascot-brow-right {
  transform: translateY(-3px) rotate(-8deg);
  transform-origin: 72px 34px;
}
.mascot-oops .mascot-pupils {
  transform: translate(-1px, 2px);
}
.mascot-oops .mascot-brows,
.mascot-oops .mascot-sweat {
  display: block;
}
.mascot-oops .mascot-brow-left {
  transform: rotate(14deg);
  transform-origin: 48px 34px;
}
.mascot-oops .mascot-brow-right {
  transform: rotate(-14deg);
  transform-origin: 72px 34px;
}
.mascot-wave .mascot-hand {
  display: block;
  transform-origin: 24px 58px;
}
@media (prefers-reduced-motion: no-preference) {
  .mascot-wave .mascot-hand {
    animation: mascot-wave 1.2s ease-in-out infinite;
  }
  .mascot-cheer .mascot-star {
    animation: mascot-twinkle 1.4s ease-in-out infinite;
    transform-origin: 102px 22px;
  }
}
@keyframes mascot-wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-25deg);
  }
}
@keyframes mascot-twinkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.25) rotate(15deg);
  }
}
</style>
