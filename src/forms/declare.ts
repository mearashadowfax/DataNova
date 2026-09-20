/**
 * A form is declared once as a list of fields. The same declaration renders
 * the markup (`JsonForm.astro`) and tells the client script where to post,
 * so the form and its delivery cannot drift apart.
 */

import type { DeliveryTarget } from './delivery';

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

export interface FormDeclaration {
  /** Identifies the form in the page and in delivered payloads. */
  name: string;
  fields: readonly FieldSpec[];
  /** Which delivery target receives submissions. */
  deliverTo: DeliveryTarget;
  messages: {
    legend: string;
    submit: string;
    submitting: string;
    sent: string;
  };
}

type FormInput = Omit<FormDeclaration, 'messages'> & {
  messages: Partial<FormDeclaration['messages']> &
    Pick<FormDeclaration['messages'], 'legend' | 'sent'>;
};

/** Declare a form, filling in the default button copy. */
export function declareForm(input: FormInput): FormDeclaration {
  return {
    ...input,
    messages: {
      submit: 'Submit',
      submitting: 'Sending…',
      ...input.messages,
    },
  };
}

/** Single-line inputs: the only fields an inline form can render. */
export function isTextInput(
  field: FieldSpec
): field is FieldSpec & { kind: 'text' | 'email' } {
  return field.kind === 'text' || field.kind === 'email';
}
