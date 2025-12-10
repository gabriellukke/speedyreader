<script lang="ts">
  import { t } from '$lib/i18n';
  import { settingsStore, type Theme, type FontFamily } from '$lib/stores/settingsStore';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import ThemeSelector from '$lib/components/settings/ThemeSelector.svelte';
  import FontSelector from '$lib/components/settings/FontSelector.svelte';
  import SliderControl from '$lib/components/settings/SliderControl.svelte';
  import PauseSettings from '$lib/components/settings/PauseSettings.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

  let settings = $state($settingsStore);
  let showResetDialog = $state(false);

  $effect(() => {
    settings = $settingsStore;
  });

  const handleThemeChange = (theme: Theme) => settingsStore.setTheme(theme);
  const handleFontChange = (font: FontFamily) => settingsStore.setFontFamily(font);
  const handleFontSizeChange = (value: number) => settingsStore.setFontSize(value);
  const handleWpmChange = (value: number) => settingsStore.setDefaultWpm(value);

  const handlePauseUpdate = (key: string, value: { enabled: boolean; duration: number }) => {
    if (key === 'pauseAfterComma') settingsStore.setPauseAfterComma(value);
    if (key === 'pauseAfterPeriod') settingsStore.setPauseAfterPeriod(value);
    if (key === 'pauseAfterParagraph') settingsStore.setPauseAfterParagraph(value);
  };

  const handleResetConfirm = () => {
    settingsStore.reset();
    showResetDialog = false;
  };
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
        <ThemeSelector selectedTheme={settings.theme} onChange={handleThemeChange} />
      </section>

      <!-- Reader Section -->
      <section class="space-y-4">
        <h2 class="text-lg font-semibold text-foreground border-b border-border pb-2">
          {$t('settings.reader')}
        </h2>

        <FontSelector selectedFont={settings.fontFamily} onChange={handleFontChange} />

        <SliderControl
          label={$t('settings.fontSize')}
          value={settings.fontSize}
          min={50}
          max={200}
          step={10}
          unit="%"
          onChange={handleFontSizeChange}
        />

        <SliderControl
          label={$t('settings.defaultWpm')}
          value={settings.defaultWpm}
          min={100}
          max={1000}
          step={50}
          onChange={handleWpmChange}
        />

        <PauseSettings {settings} onUpdate={handlePauseUpdate} />
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
          onclick={() => (showResetDialog = true)}
          class="px-4 py-2 rounded-lg border border-destructive text-destructive
            hover:bg-destructive hover:text-white transition-colors text-sm font-medium cursor-pointer"
        >
          {$t('settings.reset')}
        </button>
      </section>
    </div>
  </div>
</main>

<ConfirmDialog
  bind:open={showResetDialog}
  title={$t('settings.reset')}
  description={$t('settings.resetConfirm')}
  confirmLabel={$t('settings.reset')}
  cancelLabel={$t('home.cancel')}
  onConfirm={handleResetConfirm}
  destructive={true}
/>
