<script lang="ts">
  import type { Theme } from '$lib/stores/settingsStore';
  import { t } from '$lib/i18n';

  let { selectedTheme, onChange } = $props<{
    selectedTheme: Theme;
    onChange: (theme: Theme) => void;
  }>();

  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: 'settings.themeSystem' },
    { value: 'light', label: 'settings.themeLight' },
    { value: 'dark', label: 'settings.themeDark' },
    { value: 'sepia', label: 'settings.themeSepia' }
  ];
</script>

<div class="space-y-3">
  <span class="block text-sm font-medium text-muted-foreground">
    {$t('settings.theme')}
  </span>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {#each themes as theme}
      <button
        onclick={() => onChange(theme.value)}
        class="px-4 py-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer
          {selectedTheme === theme.value
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-card-foreground hover:bg-accent'}"
      >
        {$t(theme.label)}
      </button>
    {/each}
  </div>
</div>
