<script lang="ts">
  let { title, subtitle, action } = $props<{
    title: string;
    subtitle?: string;
    action?: { label: string; href: string };
  }>();
</script>

<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-bold text-foreground">
      {title}
    </h1>
    {#if subtitle}
      <p class="text-sm text-muted-foreground mt-0.5">
        {subtitle}
      </p>
    {/if}
  </div>
  {#if action}
    <a
      href={action.href}
      class="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer"
    >
      {action.label}
    </a>
  {/if}
</div>
