<script lang="ts">
  import { t } from '$lib/i18n';

  let { title } = $props<{
    title: string;
  }>();
</script>

<header class="shrink-0 border-b border-border safe-area-header">
  <div class="container mx-auto px-4 max-w-5xl">
    <div class="flex items-center justify-between h-14">
      <a
        href="/"
        class="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-md transition-colors text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {$t('reader.back')}
      </a>

      <h1
        class="absolute left-1/2 -translate-x-1/2 text-sm md:text-base font-medium truncate max-w-[200px] md:max-w-md text-muted-foreground"
      >
        {title}
      </h1>

      <a
        href="/library"
        class="flex items-center gap-2 px-3 py-1.5 -mr-3 rounded-md transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <span class="text-sm font-medium hidden sm:inline">{$t('nav.library')}</span>
      </a>
    </div>
  </div>
</header>
