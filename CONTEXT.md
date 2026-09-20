# DataNova

A multi-page product site template: marketing pages, a support hub with CMS-edited documentation, and forms that work out of the box. This glossary names the concepts the code is organised around.

## Language

### Support hub

**Support Document**:
A Markdoc entry under `src/content/` that readers browse in the support hub. Articles and reference docs are both support documents.
_Avoid_: post, entry, page (a page renders a document)

**Doc Collection**:
One of the named groups a support document belongs to: `articles` or `reference`. A document's id is unique within its collection, not across collections.
_Avoid_: category, section

**Support Resource**:
One of the lists the support hub offers – articles, reference, whitepapers or sample spreadsheets. Doc collections are the support resources whose items are support documents.
_Avoid_: category, section

### Product

**Edition**:
A purchasable tier of DataNova Core – Essential or Advanced – with its own blurb, price and download. The subscription license sells the Advanced edition monthly.
_Avoid_: tier, version, plan

### Forms

**Form Declaration**:
The single description of a form – its fields, which are required, and which delivery target receives it – from which the markup, the browser-side validation and the posting behaviour are produced.
_Avoid_: schema, form config

**Delivery Target**:
The named destination a form's submissions are posted to from the browser: `contact` or `newsletter`, each configured as a Formspree (or similar) URL. Several forms may share one target; the contact and quote forms both deliver to `contact`.
_Avoid_: webhook, endpoint (that is the URL a target resolves to, not the target)

**Demo Mode**:
The state of a delivery target with no URL configured: the form validates in the browser and shows a success message, but nothing is sent, so the template works before any account exists.

**Honeypot**:
The hidden `website` field on every form. A submission that fills it is treated as a bot and silently accepted without delivery.
_Avoid_: spam trap, captcha

### Navigation

**Mega Menu**:
A navbar dropdown made of sections of links, with an optional intro line, that highlights itself when the current page is under its path prefix.
_Avoid_: dropdown, nav group

**Navigation Tree**:
The one typed object holding every mega menu, top-level link and breadcrumb root. Menus, footer link columns, the 404 resource list and support breadcrumbs are all views of it.
_Avoid_: menu data, nav config
