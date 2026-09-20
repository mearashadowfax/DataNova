import { HONEYPOT_FIELD } from '@/forms/declare';

/**
 * Binds every `<form data-form>` on the page: posts its fields as JSON to
 * the delivery target's URL in `data-endpoint`, or pretends to when it is
 * empty (demo mode). Shows progress in `[data-form-status]`,
 * toggles `[data-form-submit]`, and grows textareas with their content.
 */
export function bindJsonForms(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLFormElement>('form[data-form]')
    .forEach(bindJsonForm);
}

function bindJsonForm(form: HTMLFormElement): void {
  if (form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  const endpoint = form.dataset.endpoint?.trim() || null;
  const submittingLabel = form.dataset.submittingLabel || 'Sending…';
  const sentMessage =
    form.dataset.sentMessage || 'Thanks! Your message has been sent.';
  const demoMessage = form.dataset.demoMessage || sentMessage;
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

    // Bots get the same answer as humans so they cannot tell they were dropped.
    const honeypot = payload[HONEYPOT_FIELD];
    if (typeof honeypot === 'string' && honeypot.trim()) {
      setStatus(sentMessage, 'success');
      form.reset();
      return;
    }
    delete payload[HONEYPOT_FIELD];

    setStatus(submittingLabel, 'pending');
    if (submit) {
      submit.disabled = true;
      submit.textContent = submittingLabel;
    }

    try {
      if (!endpoint) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setStatus(demoMessage, 'success');
      } else {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...payload, form: form.dataset.form }),
        });
        if (!response.ok) {
          throw new Error('Request failed. Please try again.');
        }
        setStatus(sentMessage, 'success');
      }
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
