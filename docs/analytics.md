# Analytics and consent

The site uses Google Analytics 4 (Measurement ID `G-R3BMKMWYYB`) and nothing else
for measurement. All of it lives in one file, `assets/consent.js`, which both the
homepage (`index.html`) and every blog page (`site/_includes/base.njk`) include.
Change it there; there is no second copy.

**Nothing from Google's analytics loads before the visitor says yes.** On a first
visit the page shows a bar at the bottom of the screen with two buttons, Accept and
Decline. Until Accept is pressed there is no `gtag.js`, no request to
`googletagmanager.com` or `google-analytics.com`, and no `_ga` cookie. This is
deliberately *not* Google Consent Mode: Consent Mode is for a tag that loads before
the choice, and here the tag never does. Do not "improve" it by loading gtag early.

**The choice** is stored in `localStorage` under the key `rf-consent`, as `granted`
or `denied`. The bar appears only while no choice is stored. Decline is remembered
and gtag stays off on every later visit. If the browser blocks storage the page works
normally and the bar simply asks again on each visit. The "Analytics cookies" link in
the footer of every page reopens the bar; switching from Accept to Decline stops all
further hits for the rest of the visit and deletes the `_ga` cookies.

**What is measured.** Pageviews, from the standard `gtag('config')` call, on the
homepage and every blog page. One conversion event, `email_signup`, with one
parameter, `form_location`: `hero` (top form on the homepage), `footer` (bottom form
on the homepage) or `article` (the form under a blog article). It fires only when the
request to the Google Form actually reached the server. The form posts with
`no-cors`, so the browser cannot see whether Google accepted the entry; a network
failure does not fire the event, but a rejection on Google's side would be
indistinguishable from success. The visitor sees the same "Got it" message either way,
exactly as before analytics. The email address, or any text the visitor typed, is
never sent to GA4 — events go through `window.rfTrack`, which only ever receives fixed
values from the code. In GA4, `email_signup` has to be marked as a key event
(Admin → Events) to count as a conversion.

**The external-domain rule.** Until this change the site loaded nothing from
external domains for tracking. GA4 is now the single exception, and it is conditional
on consent. The `googletagmanager.com` script in `consent.js` is intentional — do not
remove it as a stray third-party request. Separately, and unrelated to consent, every
page still loads its fonts from `fonts.googleapis.com` / `fonts.gstatic.com`; that is
older than this change and is not covered by the consent bar.
