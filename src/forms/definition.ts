import { z } from 'zod';
import type { DeliveryTarget } from '@/config';
import type { RateLimitPolicy } from '@/utils/rate-limit';

/**
 * A form is declared once as a list of fields. The same declaration renders
 * the markup (`JsonForm.astro`) and derives the server-side schema
 * (`formSchema`), so what the browser requires and what the endpoint accepts
 * cannot drift apart.
 */

interface FieldBase {
  name: string;
  label: string;
  required?: boolean;
  autocomplete?: string;
}

export type FieldSpec =
  | (FieldBase & { kind: 'text' | 'email' | 'textarea'; maxLength: number })
  | (FieldBase & { kind: 'select'; options: readonly [string, ...string[]] });

/** Name of the hidden field bots fill in and humans never see. */
export const HONEYPOT_FIELD = 'website';

export interface FormDefinition {
  /** Identifies the form in delivered payloads and rate-limit buckets. */
  name: string;
  /** Route the browser posts JSON to. */
  endpoint: string;
  fields: readonly FieldSpec[];
  /** Which configured webhook receives submissions. */
  deliverTo: DeliveryTarget;
  rateLimit: RateLimitPolicy;
  messages: {
    legend: string;
    submit: string;
    submitting: string;
    sent: string;
    invalid: string;
  };
}

type FormInput = Omit<FormDefinition, 'rateLimit' | 'messages'> & {
  rateLimit?: Partial<Omit<RateLimitPolicy, 'name'>>;
  messages: Partial<FormDefinition['messages']> &
    Pick<FormDefinition['messages'], 'legend' | 'sent'>;
};

export function defineForm(input: FormInput): FormDefinition {
  return {
    ...input,
    rateLimit: {
      name: `form:${input.name}`,
      limit: input.rateLimit?.limit ?? 5,
      windowMs: input.rateLimit?.windowMs ?? 60_000,
    },
    messages: {
      submit: 'Submit',
      submitting: 'Sending…',
      invalid: 'Invalid form data.',
      ...input.messages,
    },
  };
}

function fieldSchema(field: FieldSpec): z.ZodType {
  switch (field.kind) {
    case 'email': {
      const email = z.email().max(field.maxLength);
      return field.required ? email : email.optional();
    }
    case 'select': {
      const options = z.enum(field.options);
      return field.required ? options : options.optional();
    }
    default: {
      const text = z.string().trim().max(field.maxLength);
      return field.required ? text.min(1) : text.optional();
    }
  }
}

/** The Zod object a submission must satisfy, including the honeypot. */
export function formSchema(form: FormDefinition) {
  const shape: Record<string, z.ZodType> = {
    [HONEYPOT_FIELD]: z.string().optional(),
  };
  for (const field of form.fields) {
    shape[field.name] = fieldSchema(field);
  }
  return z.object(shape);
}
