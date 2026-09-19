# DataNova

A multi-page product site template: marketing pages, a support hub with CMS-edited documentation, and forms that work out of the box. This glossary names the concepts the code is organised around.

## Language

### Support hub

**Support Document**:
A Markdoc entry that readers browse in the support hub, edited in Keystatic. Articles and reference docs are both support documents.
_Avoid_: post, entry, page (a page renders a document)

**Doc Collection**:
One of the named groups a support document belongs to: `articles` or `reference`. A document's id is unique within its collection, not across collections.
_Avoid_: category, section

**Feedback**:
A reader's helpful / not-helpful verdict on one support document, counted per document across all readers. Feedback is keyed by the document's collection and id together.
_Avoid_: vote, rating, like

### Forms

**Form Declaration**:
The single description of a form – its fields, which are required, where it posts and where submissions go – from which both the markup and the server-side validation are produced.
_Avoid_: schema (that is one thing derived from it), form config

**Delivery Target**:
The configured destination a form's submissions are forwarded to: `contact` or `newsletter`. Several forms may share one target; the contact and quote forms both deliver to `contact`.
_Avoid_: webhook (one way a target is satisfied), endpoint (that is the route the browser posts to)

**Demo Mode**:
The state of a delivery target that has no webhook configured: submissions are validated and logged but go nowhere, so the template works before any credentials exist.

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
