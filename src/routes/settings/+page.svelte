<script lang="ts">
  import { t } from '$lib/i18n';
  import { settingsStore, type Theme, type FontFamily } from '$lib/stores/settingsStore';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

  let settings = $state($settingsStore);

  $effect(() => {
    settings = $settingsStore;
  });

  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: 'settings.themeSystem' },
    { value: 'light', label: 'settings.themeLight' },
    { value: 'dark', label: 'settings.themeDark' },
    { value: 'sepia', label: 'settings.themeSepia' }
  ];

  const fonts: { value: FontFamily; label: string }[] = [
    { value: 'system', label: 'settings.fontSystem' },
    { value: 'serif', label: 'settings.fontSerif' },
    { value: 'mono', label: 'settings.fontMono' }
  ];

  function handleThemeChange(theme: Theme) {
    settingsStore.setTheme(theme);
  }

  function handleFontChange(font: FontFamily) {
    settingsStore.setFontFamily(font);
  }

  function handleFontSizeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    settingsStore.setFontSize(parseInt(target.value, 10));
  }

  function handleWpmChange(e: Event) {
    const target = e.target as HTMLInputElement;
    settingsStore.setDefaultWpm(parseInt(target.value, 10));
  }

  function handleReset() {
    if (confirm($t('settings.resetConfirm'))) {
      settingsStore.reset();
    }
  }
</script>

<svelte:head>
  <title>{$t('settings.title')} - SpeedyReader</title>
</svelte:head>

<main class="min-h-screen bg-background text-foreground">
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-2xl font-bold mb-8">{$t('settings.title')}</h1>

    <div class="space-y-8">
      <!-- Appearance Section -->
      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-foreground border-b border-border pb-2">
          {$t('settings.appearance')}
        </h2>

        <div class="space-y-3">
          <span class="block text-sm font-medium text-muted-foreground">
            {$t('settings.theme')}
          </span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {#each themes as theme}
              <button
                onclick={() => handleThemeChange(theme.value)}
                class="px-4 py-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer
                  {settings.theme === theme.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-card-foreground hover:bg-accent'}"
              >
                {$t(theme.label)}
              </button>
            {/each}
          </div>
        </div>
      </section>

      <!-- Reader Section -->
      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-foreground border-b border-border pb-2">
          {$t('settings.reader')}
        </h2>

        <div class="space-y-3">
          <span class="block text-sm font-medium text-muted-foreground">
            {$t('settings.fontFamily')}
          </span>
          <div class="grid grid-cols-3 gap-2">
            {#each fonts as font}
              <button
                onclick={() => handleFontChange(font.value)}
                class="px-4 py-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer
                  {settings.fontFamily === font.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-card-foreground hover:bg-accent'}"
              >
                {$t(font.label)}
              </button>
            {/each}
          </div>
        </div>

        <div class="space-y-3">
          <label for="fontSize" class="block text-sm font-medium text-muted-foreground">
            {$t('settings.fontSize')}: {settings.fontSize}%
          </label>
          <input
            id="fontSize"
            type="range"
            min="50"
            max="200"
            step="10"
            value={settings.fontSize}
            oninput={handleFontSizeChange}
            class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>50%</span>
            <span>100%</span>
            <span>200%</span>
          </div>
        </div>

        <div class="space-y-3">
          <label for="defaultWpm" class="block text-sm font-medium text-muted-foreground">
            {$t('settings.defaultWpm')}: {settings.defaultWpm}
          </label>
          <input
            id="defaultWpm"
            type="range"
            min="100"
            max="1000"
            step="50"
            value={settings.defaultWpm}
            oninput={handleWpmChange}
            class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>100</span>
            <span>500</span>
            <span>1000</span>
          </div>
        </div>
      </section>

      <!-- Language Section -->
      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-foreground border-b border-border pb-2">
          {$t('settings.language')}
        </h2>

        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">{$t('nav.language')}</span>
          <LanguageSwitcher />
        </div>
      </section>

      <!-- Reset Section -->
      <section class="pt-4 border-t border-border">
        <button
          onclick={handleReset}
          class="px-4 py-2 rounded-lg border border-destructive text-destructive
            hover:bg-destructive hover:text-white transition-colors text-sm font-medium cursor-pointer"
        >
          {$t('settings.reset')}
        </button>
      </section>
    </div>
  </div>
</main>
