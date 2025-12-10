<script lang="ts">
  import type { FontFamily } from '$lib/stores/settingsStore';
  import { t } from '$lib/i18n';

  let { selectedFont, onChange } = $props<{
    selectedFont: FontFamily;
    onChange: (font: FontFamily) => void;
  }>();

  const fonts: { value: FontFamily; label: string }[] = [
    { value: 'system', label: 'settings.fontSystem' },
    { value: 'serif', label: 'settings.fontSerif' },
    { value: 'mono', label: 'settings.fontMono' }
  ];
</script>

<div class="space-y-3">
  <span class="block text-sm font-medium text-muted-foreground">
    {$t('settings.fontFamily')}
  </span>
  <div class="grid grid-cols-3 gap-2">
    {#each fonts as font}
      <button
        onclick={() => onChange(font.value)}
        class="px-4 py-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer
          {selectedFont === font.value
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-card-foreground hover:bg-accent'}"
      >
        {$t(font.label)}
      </button>
    {/each}
  </div>
</div>
