<script>
  // Props for the component; these allow customization of the title, choices, and slug
  export let title;
  export let firstChoice;
  export let secondChoice;
  export let slug;
  // State variables for managing feedback
  let helpful = 0;
  let notHelpful = 0;
  let initialFetch = false;
  let feedbackGiven = false;
  let userChoice = null;

  import { onMount } from "svelte";

  // Lifecycle: Runs once when the component is mounted
  onMount(() => {
    const savedFeedback = JSON.parse(localStorage.getItem("feedback") || "{}");
    feedbackGiven = !!savedFeedback[slug]; // Check if this slug has feedback
    userChoice = savedFeedback[slug] || null;
    fetchFeedback();
  });

  // Fetch the initial feedback data for the given slug
  async function fetchFeedback() {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      helpful = data.helpful || 0;
      notHelpful = data.notHelpful || 0;
      initialFetch = true;
    } catch (error) {
      console.error("Failed to fetch feedback count:", error);
    }
  }

  // Handle user feedback submission for either "helpful" or "notHelpful"
  async function handleFeedback(type) {
    if (feedbackGiven) return;

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedFeedback = await response.json();
      helpful = updatedFeedback.helpful || 0;
      notHelpful = updatedFeedback.notHelpful || 0;

      // Save feedback locally to prevent multiple submissions for this slug
      const savedFeedback = JSON.parse(
        localStorage.getItem("feedback") || "{}",
      );
      savedFeedback[slug] = type;
      localStorage.setItem("feedback", JSON.stringify(savedFeedback));

      feedbackGiven = true;
      userChoice = type;
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  }
</script>

<div class="mt-12 flex flex-col sm:flex-row gap-y-2 items-center justify-center gap-x-2 sm:gap-y-0">
  <h3 class="text-slate-700">{title}</h3>
  <div>
    <button
    type="button"
    on:click={() => handleFeedback("helpful")}
    disabled={feedbackGiven}
    class="group inline-flex items-center gap-x-2 rounded-lg border border-slate-400 px-3 py-2 text-sm font-medium text-slate-700 hover:border-teal-500 hover:bg-teal-500"
    class:bg-teal-500={userChoice === "helpful"}
    class:border-teal-500={userChoice === "helpful"}
  >
    <slot name="helpfulIcon" /> {firstChoice}</button
  >
    <button
    type="button"
    on:click={() => handleFeedback("notHelpful")}
    disabled={feedbackGiven}
    class="group inline-flex items-center gap-x-2 rounded-lg border border-slate-400 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
    class:bg-slate-300={userChoice === "notHelpful"}
  >
    <slot name="notHelpfulIcon" />
    {secondChoice}
  </button>
</div>
</div>

{#if helpful > 0}
  <div class="mt-5 flex items-center justify-center">
    <p class="text-slate-500 text-sm">
      {#if !initialFetch}
        Fetching...
      {:else if helpful === 1}
        1 person found this helpful
      {:else}
        {helpful} people found this helpful
      {/if}
    </p>
  </div>
{/if}
