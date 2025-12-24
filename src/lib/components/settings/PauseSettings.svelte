<script lang="ts">
  import { t } from '$lib/i18n';

  let { settings, onUpdate } = $props<{
    settings: {
      pauseAfterComma: { enabled: boolean; duration: number };
      pauseAfterPeriod: { enabled: boolean; duration: number };
      pauseAfterParagraph: { enabled: boolean; duration: number };
    };
    onUpdate: (key: string, value: { enabled: boolean; duration: number }) => void;
  }>();

  const handleToggle = (key: string, enabled: boolean) => {
    const current = settings[key as keyof typeof settings];
    onUpdate(key, { ...current, enabled });
  };

  const handleDuration = (key: string, duration: number) => {
    const current = settings[key as keyof typeof settings];
    onUpdate(key, { ...current, duration: duration || 0 });
  };
</script>

<div class="space-y-4 pt-2">
  <h3 class="text-sm font-semibold text-foreground">Pause Settings</h3>

  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <input
        type="checkbox"
        id="pauseComma"
        checked={settings.pauseAfterComma.enabled}
        onchange={(e) => handleToggle('pauseAfterComma', (e.target as HTMLInputElement).checked)}
        class="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
      />
      <label for="pauseComma" class="flex-1 text-sm font-medium text-foreground cursor-pointer">
        {$t('settings.pauseAfterComma')}
      </label>
      <input
        type="number"
        min="0"
        max="2000"
        step="50"
        value={settings.pauseAfterComma.duration}
        oninput={(e) => handleDuration('pauseAfterComma', parseInt((e.target as HTMLInputElement).value, 10))}
        disabled={!settings.pauseAfterComma.enabled}
        class="w-20 px-2 py-1 rounded border border-border bg-card text-card-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <span class="text-xs text-muted-foreground">ms</span>
    </div>

    <div class="flex items-center gap-3">
      <input
        type="checkbox"
        id="pausePeriod"
        checked={settings.pauseAfterPeriod.enabled}
        onchange={(e) => handleToggle('pauseAfterPeriod', (e.target as HTMLInputElement).checked)}
        class="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
      />
      <label for="pausePeriod" class="flex-1 text-sm font-medium text-foreground cursor-pointer">
        {$t('settings.pauseAfterPeriod')}
      </label>
      <input
        type="number"
        min="0"
        max="2000"
        step="50"
        value={settings.pauseAfterPeriod.duration}
        oninput={(e) => handleDuration('pauseAfterPeriod', parseInt((e.target as HTMLInputElement).value, 10))}
        disabled={!settings.pauseAfterPeriod.enabled}
        class="w-20 px-2 py-1 rounded border border-border bg-card text-card-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <span class="text-xs text-muted-foreground">ms</span>
    </div>

    <div class="flex items-center gap-3">
      <input
        type="checkbox"
        id="pauseParagraph"
        checked={settings.pauseAfterParagraph.enabled}
        onchange={(e) => handleToggle('pauseAfterParagraph', (e.target as HTMLInputElement).checked)}
        class="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
      />
      <label for="pauseParagraph" class="flex-1 text-sm font-medium text-foreground cursor-pointer">
        {$t('settings.pauseAfterParagraph')}
      </label>
      <input
        type="number"
        min="0"
        max="2000"
        step="50"
        value={settings.pauseAfterParagraph.duration}
        oninput={(e) => handleDuration('pauseAfterParagraph', parseInt((e.target as HTMLInputElement).value, 10))}
        disabled={!settings.pauseAfterParagraph.enabled}
        class="w-20 px-2 py-1 rounded border border-border bg-card text-card-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <span class="text-xs text-muted-foreground">ms</span>
    </div>
  </div>
</div>
