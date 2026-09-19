import type { FormResponse } from '@/forms/submit';

/**
 * Binds every `<form data-form data-endpoint>` on the page: posts its fields as
 * JSON, shows the server's message in `[data-form-status]`, and toggles the
 * `[data-form-submit]` button. Textareas grow with their content.
 */
export function bindJsonForms(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLFormElement>('form[data-form][data-endpoint]')
    .forEach(bindJsonForm);
}

function bindJsonForm(form: HTMLFormElement): void {
  if (form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  const endpoint = form.dataset.endpoint!;
  const submittingLabel = form.dataset.submittingLabel || 'Sending…';
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-form-submit]');
  const defaultSubmitLabel = submit?.textContent ?? '';

  form.querySelectorAll('textarea').forEach(autoGrow);

  const setStatus = (text: string, tone: 'pending' | 'success' | 'error') => {
    if (!status) return;
    status.classList.remove(
      'hidden',
      'text-slate-600',
      'text-teal-800',
      'text-red-600'
    );
    status.classList.add(
      tone === 'pending'
        ? 'text-slate-600'
        : tone === 'success'
          ? 'text-teal-800'
          : 'text-red-600'
    );
    status.textContent = text;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus(submittingLabel, 'pending');
    if (submit) {
      submit.disabled = true;
      submit.textContent = submittingLabel;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response
        .json()
        .catch(() => null)) as FormResponse | null;

      if (!response.ok || !data || !data.ok) {
        throw new Error((data && !data.ok && data.error) || 'Request failed');
      }

      setStatus(data.message, 'success');
      form.reset();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Something went wrong.',
        'error'
      );
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = defaultSubmitLabel;
      }
    }
  });
}

function autoGrow(textarea: HTMLTextAreaElement): void {
  const resize = () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 3}px`;
  };
  resize();
  textarea.addEventListener('input', resize);
}
