import { defineForm } from './definition';

export const contactForm = defineForm({
  name: 'contact',
  endpoint: '/api/contact',
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

export const quoteForm = defineForm({
  name: 'quote',
  endpoint: '/api/quote',
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
      options: [
        'Essential Edition',
        'Advanced Edition',
        'Subscription License',
        'Other / Unsure',
      ],
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

export const newsletterForm = defineForm({
  name: 'newsletter',
  endpoint: '/api/newsletter',
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
    invalid: 'Please enter a valid email address.',
  },
});
