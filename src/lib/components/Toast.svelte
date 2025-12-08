<script lang="ts">
  import { toastStore, type Toast } from '$lib/stores/toastStore';
  import { quintOut } from 'svelte/easing';
  import type { TransitionConfig } from 'svelte/transition';
  import { onMount } from 'svelte';

  let toasts = $state<Toast[]>([]);
  let isMobile = $state(true);

  toastStore.subscribe((value) => {
    toasts = value;
  });

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 640;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  function toastTransition(
    _node: Element,
    params: { duration?: number; direction?: 'up' | 'down' } = {}
  ): TransitionConfig {
    const { duration = 300, direction = 'down' } = params;

    return {
      duration,
      easing: quintOut,
      css: (t, u) => {
        const opacity = t;
        const y = direction === 'down' ? 20 * u : -20 * u;
        return `opacity: ${opacity}; transform: translateY(${y}px);`;
      }
    };
  }

  function getIcon(type: Toast['type']) {
    switch (type) {
      case 'success':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
      case 'error':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
      case 'warning':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`;
      case 'info':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;
    }
  }

  function getColors(type: Toast['type']) {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-500';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-500';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
    }
  }
</script>

<div class="toast-container fixed z-50 flex flex-col gap-2 pointer-events-none">
  {#each toasts as toast (toast.id)}
    <div
      transition:toastTransition={{ duration: 300, direction: isMobile ? 'down' : 'up' }}
      class="pointer-events-auto rounded-lg border shadow-lg p-4 {getColors(toast.type)}"
    >
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {@html getIcon(toast.type)}
        </svg>
        <p class="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onclick={() => toastStore.dismiss(toast.id)}
          class="shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="Dismiss"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    /* Mobile: bottom positioning with safe area */
    bottom: calc(1rem + max(env(safe-area-inset-bottom), 0px));
    left: 1rem;
    right: 1rem;
    width: auto;
    max-width: none;
    top: auto;
  }

  @media (min-width: 640px) {
    .toast-container {
      /* Desktop: top positioning below header */
      top: calc(max(env(safe-area-inset-top), 0px) + 3.5rem + 1rem);
      bottom: auto;
      left: auto;
      right: calc(1rem + max(env(safe-area-inset-right), 0px));
      width: auto;
      max-width: 24rem;
    }
  }
</style>
