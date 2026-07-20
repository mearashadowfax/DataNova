/**
 * Shared client helper for Formspree (or demo-mode) JSON form posts.
 */
export function bindFormspreeForm(options: {
  formId: string;
  endpointEnv: string | undefined;
  submittingLabel: string;
  defaultSubmitLabel: string;
  demoMessage: string;
}): void {
  const form = document.getElementById(
    options.formId
  ) as HTMLFormElement | null;
  if (!form || form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  const status = form.querySelector('[data-form-status]') as HTMLElement | null;
  const submit = form.querySelector(
    '[data-form-submit]'
  ) as HTMLButtonElement | null;

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // Honeypot – bots fill this; humans leave it empty
    if (typeof payload.website === 'string' && payload.website.trim()) {
      if (status) {
        status.classList.remove('hidden', 'text-red-600');
        status.classList.add('text-teal-800');
        status.textContent = 'Thanks! Your message has been sent.';
      }
      form.reset();
      return;
    }

    if (status) {
      status.classList.remove('hidden', 'text-red-600', 'text-teal-800');
      status.classList.add('text-slate-600');
      status.textContent = options.submittingLabel;
    }
    if (submit) {
      submit.disabled = true;
      submit.textContent = options.submittingLabel;
    }

    try {
      const endpoint = options.endpointEnv?.trim();

      if (!endpoint) {
        // Demo mode for the static template when Formspree is not configured
        await new Promise(resolve => setTimeout(resolve, 400));
        if (status) {
          status.classList.remove('text-slate-600', 'text-red-600');
          status.classList.add('text-teal-800');
          status.textContent = options.demoMessage;
        }
        form.reset();
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Request failed. Please try again.');
      }

      if (status) {
        status.classList.remove('text-slate-600', 'text-red-600');
        status.classList.add('text-teal-800');
        status.textContent = 'Thanks! Your message has been sent.';
      }
      form.reset();
    } catch (error) {
      if (status) {
        status.classList.remove('text-slate-600', 'text-teal-800');
        status.classList.add('text-red-600');
        status.textContent =
          error instanceof Error ? error.message : 'Something went wrong.';
      }
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = options.defaultSubmitLabel;
      }
    }
  });
}
