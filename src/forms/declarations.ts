import { licenseOptions } from '@/product';
import { declareForm } from './declare';

export const contactForm = declareForm({
  name: 'contact',
  deliverTo: 'contact',
  fields: [
    {
      name: 'name',
      label: 'Name',
      kind: 'text',
      maxLength: 120,
      required: true,
      autocomplete: 'name',
    },
    {
      name: 'email',
      label: 'Email',
      kind: 'email',
      maxLength: 254,
      required: true,
      autocomplete: 'email',
    },
    {
      name: 'message',
      label: 'Message',
      kind: 'textarea',
      maxLength: 5000,
      required: true,
    },
  ],
  messages: {
    legend: 'Contact us',
    sent: 'Thanks! Your message has been sent.',
  },
});

export const quoteForm = declareForm({
  name: 'quote',
  deliverTo: 'contact',
  fields: [
    {
      name: 'name',
      label: 'Name',
      kind: 'text',
      maxLength: 120,
      required: true,
      autocomplete: 'name',
    },
    {
      name: 'company',
      label: 'Company',
      kind: 'text',
      maxLength: 200,
      required: true,
      autocomplete: 'organization',
    },
    {
      name: 'email',
      label: 'Email',
      kind: 'email',
      maxLength: 254,
      required: true,
      autocomplete: 'email',
    },
    {
      name: 'licenseType',
      label: 'License Type',
      kind: 'select',
      required: true,
      options: licenseOptions,
    },
    {
      name: 'message',
      label: 'Message',
      kind: 'textarea',
      maxLength: 5000,
      required: true,
    },
  ],
  messages: {
    legend: 'Request a quote',
    sent: 'Thanks! Your quote request has been sent.',
  },
});

export const newsletterForm = declareForm({
  name: 'newsletter',
  deliverTo: 'newsletter',
  fields: [
    {
      name: 'email',
      label: 'Enter your email',
      kind: 'email',
      maxLength: 254,
      required: true,
      autocomplete: 'email',
    },
  ],
  messages: {
    legend: 'Subscribe to our newsletter',
    sent: 'Thanks for subscribing!',
  },
});
