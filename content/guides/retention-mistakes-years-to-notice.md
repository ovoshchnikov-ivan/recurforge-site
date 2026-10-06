---
title: "Retention mistakes that took me years to notice"
slug: "retention-mistakes-years-to-notice"
category: guides
description: "Five retention mistakes from fourteen years of lifecycle work: a segment that reached everyone, a formula wrong for two years, and a list nobody cleaned."
keyword: "retention mistakes"
tags: [email-marketing, deliverability, analytics, automation]
date: 2026-10-06
draft: false
og_image: ""
---

My first commercial email went to a hundred and something people at once. Every address went into the To: field in Gmail, and when I pressed send, each recipient received the full list of everyone else's address along with the offer.

That one taught me something inside an hour. The retention mistakes that actually cost money were nothing like it — they took years to surface, and at the time each one looked like a reasonable decision made by a competent person. These are the other five, roughly in the order of how long it took me to see them.

## I picked the platform on the wrong question

Setting up email from scratch for an online casino, I had to choose a sending platform. I chose one that delivers mail reliably and does very little else, because the thing I was worried about was whether messages would arrive.

They arrived. Then the work moved on to segmentation, the platform had almost none, and we built our own — a service written in-house to do what another product on the market was already doing out of the box. Engineering time went into rebuilding a feature we could have bought. I had not heard of Customer.io yet.

The right question was how much automation the programme would need in two years and whether the platform could carry it. Delivery is the floor. Everything that makes a lifecycle programme worth running sits above it, and you commit to a platform before you know the shape of what you will be running on it.

## A rule I treated as a law

Value before the ask. Earn attention with something useful, then ask for the sale. I believed it enough to write content for a gambling audience — where slot machines came from, how the mechanics changed over the decades. The letters were decent. I liked them.

Emails that said deposit now and get a bonus beat them badly enough that there was no point running the comparison again.

The rule holds often enough to be worth teaching. It is a default, and someone along the way forgot to label it as one. Where people arrive with a specific intent and the offer is the thing they came for, the offer is the value, and wrapping it in an article is a slower way of making the same offer. The same goes for most of what gets taught as email principle — one job per email, keep it short, a thousand recipients per variant before you conclude anything. I have broken all of those since, on purpose, and in each case the context was the argument.

## The segment that was not a segment

In an esports product I built a segment for a campaign meant to reach a narrow group. The condition did not hold, the platform sent to everyone on the base, and roughly ten times the usual volume left in a single run.

I built that segment, and nobody else was going to catch it, because the programme had no step at which somebody looks at the recipient count and asks whether that number makes sense. A send an order of magnitude larger than every send before it went out exactly like any other.

Google Postmaster had the sending domain at Bad inside a day. Open rate fell to 5%. Mail that had been landing in inboxes for months stopped landing.

What brought it back was that 5%. When a domain has to be rebuilt, the people who opened anyway during the worst of it are the most valuable addresses you own — they are proof, to the providers, that somebody wants this mail. You send only to them, you keep the volume low, and you climb back slowly on the engagement signal they produce. It worked. It took weeks of sending to a fraction of the audience while everything else waited.

The lesson is not that I should write segments more carefully, although I should. Broken conditions are ordinary; a programme where a broken condition reaches the entire base unchallenged is a design choice. A ceiling on recipients per send, set once, would have turned a two-month recovery into a confusing afternoon.

## Two years on a number that divided the wrong things

An education company measured a channel's conversion rate by counting every registration that arrived with a UTM tag saying it came from the contact base, then dividing by the number of messages sent in one channel.

It took me longer than it should have to see what is wrong with that sentence, and I only got to look at it because my remit widened. I had email. When the other channels came to me as well, I recalculated by hand, and the fraction fell apart.

The top of it collected conversions produced by every channel the company ran. The bottom counted the sends of a single one. That channel was being credited with work done by all the others, and the less of it we sent, the better it appeared to perform.

Nothing about the number looked broken. It was stable, it went into the monthly report, and it pointed consistently in one direction — so the sending strategy followed it, for at least two years. Volume, build time and attention went where the fraction said the returns were.

No dashboard raises a flag on a formula that has been wrong since the day somebody wrote it. Dashboards check values, and the values were fine. A number that is wrong in a stable way is far more dangerous than one that jumps around, because the jumpy one gets investigated.

Whatever you divide, the top and the bottom have to describe the same population. That is the whole rule, it fits in one sentence, and two years of strategy went past without anybody checking it, me included.

## The list nobody had cleaned

A company sends to every address it has ever collected, because nobody there knows that mailbox providers decide where mail lands by watching who engages with it. There is no laziness in this and usually no argument. The knowledge is specialist, the damage is delayed, and for a long stretch nothing looks wrong at all: more addresses, more sends, a bigger number in the report.

Then the dead addresses bounce on every run. The people who stopped caring years ago never open. The providers draw the obvious conclusion about a sender whose mail nobody wants, and the consequence arrives all at once — reputation down in Postmaster, inbox placement gone, mail in spam at scale, and an open rate that collapses across the whole base including the people who did want to hear from you.

I have been brought in on this more than once, most recently at a subscription video product, and by the time I get there the question is no longer whether to clean the list. It is whether the domain can be saved. It usually can. You stop sending to everything, you suppress what has not engaged instead of pretending it might, and you rebuild the reputation on the narrow group that still opens — the same move that got me out of my own mess in the esports product. We did exactly that, and the base came back.

What makes this the most common mistake on the list is that nobody ever experiences it as a decision. Nobody sits in a meeting and chooses to damage the domain. They inherit a list, they send to it, and the bill arrives two years later addressed to whoever is doing the job by then.

---

There are more of these than fit in one article. The ones about frequency, about benchmarks borrowed from somebody else's business, and about what happens to a programme when the person who built it leaves are separate posts, and I will get to them.

What these five have in common is that none of them was carelessness. Every one was a defensible decision made by a competent person, and every one sent its bill a year or two later, quietly, into a number nobody was watching for that reason. Some I made. Some were already running when I arrived, which changes who to be annoyed at and nothing else about the work.

The one thing that would have caught any of them sooner is a written record of what somebody believed when they decided, and what they expected to see if they were right. That record is the first thing to go when the week gets full.

[RecurForge](/) exists because I kept losing it. The form below is still the only working part of this site — leave an address if you want to hear when that changes.
