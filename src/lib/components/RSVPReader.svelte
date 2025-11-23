<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import SpeedControls from './SpeedControls.svelte';

	interface Props {
		text: string;
		initialWpm?: number;
	}

	let { text, initialWpm = 300 }: Props = $props();

	let words = $state<string[]>([]);
	let currentIndex = $state(0);
	let wpm = $state(initialWpm);
	let isPlaying = $state(false);
	let intervalId: number | null = null;

	// Split text into words
	$effect(() => {
		if (text) {
			words = text.trim().split(/\s+/).filter(word => word.length > 0);
		}
	});

	const play = () => {
		if (currentIndex >= words.length) {
			currentIndex = 0;
		}
		isPlaying = true;
		startInterval();
	};

	const pause = () => {
		isPlaying = false;
		stopInterval();
	};

	const togglePlayPause = () => {
		if (isPlaying) {
			pause();
		} else {
			play();
		}
	};

	const nextWord = () => {
		if (currentIndex < words.length - 1) {
			currentIndex++;
		}
	};

	const prevWord = () => {
		if (currentIndex > 0) {
			currentIndex--;
		}
	};

	const restart = () => {
		currentIndex = 0;
		pause();
	};

	const handleWpmChange = (newWpm: number) => {
		wpm = newWpm;
		if (isPlaying) {
			stopInterval();
			startInterval();
		}
	};

	const startInterval = () => {
		const interval = 60000 / wpm;
		intervalId = window.setInterval(() => {
			if (currentIndex < words.length - 1) {
				currentIndex++;
			} else {
				pause();
			}
		}, interval);
	};

	const stopInterval = () => {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	};

	onDestroy(() => {
		stopInterval();
	});
</script>

<div class="flex flex-col items-center justify-center w-full h-full min-h-[60vh] px-4">
	<!-- Word Display -->
	<div class="mb-8 md:mb-12 text-center">
		<div class="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight min-h-[80px] md:min-h-[120px] flex items-center justify-center">
			{words[currentIndex] || ''}
		</div>
	</div>

	<!-- Progress -->
	<div class="mb-6 text-sm md:text-base text-gray-600 dark:text-gray-400">
		Word {currentIndex + 1} of {words.length}
	</div>

	<!-- Controls -->
	<SpeedControls
		{wpm}
		{isPlaying}
		onPlayPause={togglePlayPause}
		onPrev={prevWord}
		onNext={nextWord}
		onRestart={restart}
		onWpmChange={handleWpmChange}
	/>
</div>
