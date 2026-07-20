<script>
  import { onMount } from 'svelte';

  let { title, firstChoice, secondChoice, slug } = $props();

  let helpful = $state(0);
  let notHelpful = $state(0);
  let initialFetch = $state(false);
  let fetchError = $state('');
  let submitError = $state('');
  let submitting = $state(false);
  let feedbackGiven = $state(false);
  let userChoice = $state(null);

  onMount(() => {
    const savedFeedback = JSON.parse(localStorage.getItem('feedback') || '{}');
    feedbackGiven = !!savedFeedback[slug];
    userChoice = savedFeedback[slug] || null;
    fetchFeedback();
  });

  async function fetchFeedback() {
    fetchError = '';
    try {
      const response = await fetch(
        `/api/feedback?slug=${encodeURIComponent(slug)}`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      helpful = data.helpful || 0;
      notHelpful = data.notHelpful || 0;
      initialFetch = true;
    } catch (error) {
      console.error('Failed to fetch feedback count:', error);
      fetchError = 'Could not load feedback counts.';
      initialFetch = true;
    }
  }

  async function handleFeedback(type) {
    if (feedbackGiven || submitting) return;

    submitting = true;
    submitError = '';

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ slug, type }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || `HTTP error! status: ${response.status}`);
      }

      helpful = body.helpful || 0;
      notHelpful = body.notHelpful || 0;

      const savedFeedback = JSON.parse(
        localStorage.getItem('feedback') || '{}'
      );
      savedFeedback[slug] = type;
      localStorage.setItem('feedback', JSON.stringify(savedFeedback));

      feedbackGiven = true;
      userChoice = type;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      submitError =
        error instanceof Error ? error.message : 'Could not submit feedback.';
    } finally {
      submitting = false;
    }
  }
</script>

<div
  class="mt-12 flex flex-col items-center justify-center gap-x-2 gap-y-2 sm:flex-row sm:gap-y-0"
>
  <slot />
  <h3 class="text-slate-700">{title}</h3>
  <div>
    <button
      type="button"
      onclick={() => handleFeedback('helpful')}
      disabled={feedbackGiven || submitting}
      aria-pressed={userChoice === 'helpful'}
      class="group inline-flex items-center gap-x-2 rounded-lg border border-slate-400 px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-500 hover:bg-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
      class:bg-teal-500={userChoice === 'helpful'}
      class:border-teal-500={userChoice === 'helpful'}
    >
      <slot name="helpfulIcon" />
      {firstChoice}
    </button>
    <button
      type="button"
      onclick={() => handleFeedback('notHelpful')}
      disabled={feedbackGiven || submitting}
      aria-pressed={userChoice === 'notHelpful'}
      class="group inline-flex items-center gap-x-2 rounded-lg border border-slate-400 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
      class:bg-slate-300={userChoice === 'notHelpful'}
    >
      <slot name="notHelpfulIcon" />
      {secondChoice}
    </button>
  </div>
</div>

<div class="mt-5 flex items-center justify-center" aria-live="polite">
  <p class="text-sm text-slate-500">
    {#if !initialFetch}
      Fetching feedback…
    {:else if fetchError}
      <span class="text-red-600">{fetchError}</span>
    {:else if submitError}
      <span class="text-red-600">{submitError}</span>
    {:else if submitting}
      Submitting…
    {:else if feedbackGiven}
      Thanks for your feedback!
      {#if helpful === 1}
        1 person found this helpful.
      {:else if helpful > 1}
        {helpful} people found this helpful.
      {/if}
    {:else if helpful === 0}
      Be the first to leave feedback.
    {:else if helpful === 1}
      1 person found this helpful
    {:else}
      {helpful} people found this helpful
    {/if}
  </p>
</div>
