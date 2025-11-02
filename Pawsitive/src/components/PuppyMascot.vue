<template>
  <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pawsitive Puppy Mascot">
    <defs>
      <linearGradient id="fur" x1="0" x2="1">
        <stop offset="0%" stop-color="#fff1d6"/>
        <stop offset="100%" stop-color="#ffd29a"/>
      </linearGradient>
    </defs>
    <!-- body -->
    <circle cx="130" cy="130" r="92" fill="url(#fur)"/>
    <!-- ears -->
    <ellipse class="wag" cx="70" cy="86" rx="30" ry="26" fill="#7a4b2f"/>
    <ellipse class="wag" cx="190" cy="86" rx="30" ry="26" fill="#7a4b2f"/>
    <!-- eyes -->
    <circle cx="100" cy="120" r="10" fill="#1b1b1f"/>
    <circle cx="160" cy="120" r="10" fill="#1b1b1f"/>
    <!-- nose -->
    <ellipse cx="130" cy="145" rx="12" ry="10" fill="#1b1b1f"/>
    <!-- smile -->
    <path d="M95 165 Q130 190 165 165" fill="none" stroke="#1b1b1f" stroke-width="6" stroke-linecap="round"/>
    <!-- paw -->
    <g transform="translate(110,190)">
      <circle cx="20" cy="12" r="12" fill="#ff9bd3"/>
      <circle cx="6" cy="0" r="6" fill="#ff9bd3"/>
      <circle cx="20" cy="-2" r="6" fill="#ff9bd3"/>
      <circle cx="34" cy="0" r="6" fill="#ff9bd3"/>
    </g>
  </svg>
</template>

<script setup>
// No logic needed
</script>