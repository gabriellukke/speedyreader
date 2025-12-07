<script lang="ts">
  import { t } from '$lib/i18n';
  import { settingsStore, type Theme, type FontFamily } from '$lib/stores/settingsStore';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import * as Dialog from '$lib/components/ui/dialog';

  let settings = $state($settingsStore);
  let showResetDialog = $state(false);

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

  function handlePauseCommaEnabled(e: Event) {
    const target = e.target as HTMLInputElement;
    settingsStore.setPauseAfterComma({
      ...settings.pauseAfterComma,
      enabled: target.checked
    });
  }

  function handlePauseCommaDuration(e: Event) {
    const target = e.target as HTMLInputElement;
    settingsStore.setPauseAfterComma({
      ...settings.pauseAfterComma,
      duration: parseInt(target.value, 10) || 0
    });
  }

  function handlePausePeriodEnabled(e: Event) {
    const target = e.target as HTMLInputElement;
    settingsStore.setPauseAfterPeriod({
      ...settings.pauseAfterPeriod,
      enabled: target.checked
    });
  }

  function handlePausePeriodDuration(e: Event) {
    const target = e.target as HTMLInputElement;
    settingsStore.setPauseAfterPeriod({
      ...settings.pauseAfterPeriod,
      duration: parseInt(target.value, 10) || 0
    });
  }

  function handlePauseParagraphEnabled(e: Event) {
    const target = e.target as HTMLInputElement;
    settingsStore.setPauseAfterParagraph({
      ...settings.pauseAfterParagraph,
      enabled: target.checked
    });
  }

  function handlePauseParagraphDuration(e: Event) {
    const target = e.target as HTMLInputElement;
    settingsStore.setPauseAfterParagraph({
      ...settings.pauseAfterParagraph,
      duration: parseInt(target.value, 10) || 0
    });
  }

  function handleResetClick() {
    showResetDialog = true;
  }

  function handleResetConfirm() {
    settingsStore.reset();
    showResetDialog = false;
  }
</script>

<svelte:head>
  <title>{$t('settings.title')} - SpeedyReader</title>
</svelte:head>

<main class="min-h-screen bg-background text-foreground">
  <div class="container mx-auto px-4 py-8 max-w-2xl safe-area-content">
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

        <div class="space-y-4 pt-2">
          <h3 class="text-sm font-semibold text-foreground">Pause Settings</h3>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                id="pauseComma"
                checked={settings.pauseAfterComma.enabled}
                onchange={handlePauseCommaEnabled}
                class="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <label
                for="pauseComma"
                class="flex-1 text-sm font-medium text-foreground cursor-pointer"
              >
                {$t('settings.pauseAfterComma')}
              </label>
              <input
                type="number"
                min="0"
                max="2000"
                step="50"
                value={settings.pauseAfterComma.duration}
                oninput={handlePauseCommaDuration}
                disabled={!settings.pauseAfterComma.enabled}
                class="w-20 px-2 py-1 rounded border border-border bg-card text-card-foreground
                  text-sm disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span class="text-xs text-muted-foreground">ms</span>
            </div>

            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                id="pausePeriod"
                checked={settings.pauseAfterPeriod.enabled}
                onchange={handlePausePeriodEnabled}
                class="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <label
                for="pausePeriod"
                class="flex-1 text-sm font-medium text-foreground cursor-pointer"
              >
                {$t('settings.pauseAfterPeriod')}
              </label>
              <input
                type="number"
                min="0"
                max="2000"
                step="50"
                value={settings.pauseAfterPeriod.duration}
                oninput={handlePausePeriodDuration}
                disabled={!settings.pauseAfterPeriod.enabled}
                class="w-20 px-2 py-1 rounded border border-border bg-card text-card-foreground
                  text-sm disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span class="text-xs text-muted-foreground">ms</span>
            </div>

            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                id="pauseParagraph"
                checked={settings.pauseAfterParagraph.enabled}
                onchange={handlePauseParagraphEnabled}
                class="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <label
                for="pauseParagraph"
                class="flex-1 text-sm font-medium text-foreground cursor-pointer"
              >
                {$t('settings.pauseAfterParagraph')}
              </label>
              <input
                type="number"
                min="0"
                max="2000"
                step="50"
                value={settings.pauseAfterParagraph.duration}
                oninput={handlePauseParagraphDuration}
                disabled={!settings.pauseAfterParagraph.enabled}
                class="w-20 px-2 py-1 rounded border border-border bg-card text-card-foreground
                  text-sm disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span class="text-xs text-muted-foreground">ms</span>
            </div>
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
          onclick={handleResetClick}
          class="px-4 py-2 rounded-lg border border-destructive text-destructive
            hover:bg-destructive hover:text-white transition-colors text-sm font-medium cursor-pointer"
        >
          {$t('settings.reset')}
        </button>
      </section>
    </div>
  </div>
</main>

<!-- Reset Confirmation Dialog -->
<Dialog.Root bind:open={showResetDialog}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{$t('settings.reset')}</Dialog.Title>
      <Dialog.Description>{$t('settings.resetConfirm')}</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <button
        onclick={() => (showResetDialog = false)}
        class="px-4 py-2 rounded-lg border border-border bg-card text-card-foreground
          hover:bg-accent transition-colors text-sm font-medium cursor-pointer"
      >
        {$t('home.cancel')}
      </button>
      <button
        onclick={handleResetConfirm}
        class="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground
          hover:bg-destructive/90 transition-colors text-sm font-medium cursor-pointer"
      >
        {$t('settings.reset')}
      </button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
