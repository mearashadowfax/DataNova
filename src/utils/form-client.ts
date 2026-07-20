/**
 * Shared client helper for JSON form posts with loading / success / error UI.
 * Used by contact, quote, and newsletter forms.
 */
export function bindJsonForm(options: {
  formId: string;
  endpoint: string;
  submittingLabel: string;
  defaultSubmitLabel: string;
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
      const response = await fetch(options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      if (status) {
        status.classList.remove('text-slate-600', 'text-red-600');
        status.classList.add('text-teal-800');
        status.textContent = data.message || 'Success!';
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
