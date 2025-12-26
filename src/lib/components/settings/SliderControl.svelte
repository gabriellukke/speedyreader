<script lang="ts">
  let {
    label,
    value,
    min,
    max,
    step,
    unit = '',
    onChange
  } = $props<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (value: number) => void;
  }>();

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    onChange(parseInt(target.value, 10));
  };
</script>

<div class="space-y-3">
  <label for={label} class="block text-sm font-medium text-muted-foreground">
    {label}: {value}{unit}
  </label>
  <input
    id={label}
    type="range"
    {min}
    {max}
    {step}
    {value}
    oninput={handleInput}
    class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
  />
  <div class="flex justify-between text-xs text-muted-foreground">
    <span>{min}</span>
    <span>{Math.floor((min + max) / 2)}</span>
    <span>{max}</span>
  </div>
</div>
