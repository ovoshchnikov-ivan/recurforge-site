---
title: "Involuntary churn was half the problem"
slug: "involuntary-churn-was-half-the-problem"
category: case-studies
description: "A subscription video service assumed people were leaving on purpose. Involuntary churn — failed cards, silent retries — turned out to be half of it."
keyword: "involuntary churn"
tags: [churn, subscriptions, automation]
date: 2026-08-12
draft: true
og_image: ""
---

A subscription video service came to me convinced it had a product problem. Cancellations were up eleven percent quarter on quarter, the team had a roadmap full of features meant to fix it, and nobody had looked at how those cancellations actually happened. Involuntary churn — subscriptions that ended because a payment failed, not because anyone decided anything — was 48% of the total.

This is a draft article used to check the blog build. The numbers are illustrative.

## What the data said

The first thing worth separating is intent. A cancellation initiated in the account settings is a decision. A subscription that lapses because an expired card was retried three times over four days and then abandoned is an accident that looks identical in the churn report.

Once the two were split, the shape of the problem changed completely:

| Segment | Share of churn | Recovered within 30 days |
|---|---|---|
| Cancelled in-app | 52% | 4% |
| Card declined, no contact | 31% | 6% |
| Card expired, no contact | 17% | 9% |

Nearly half the churn had never been communicated to anyone. The dunning emails existed, but they were sent from a transactional template nobody had opened since launch, and two of the three were landing in Promotions.

### The retry schedule was the wrong shape

The billing system retried on days 1, 2 and 4, then gave up. Card issuers decline for reasons that resolve on a calendar — a salary date, a refreshed limit — and four days does not reach the next one.

## What we changed

- Retries moved to days 1, 3, 7 and 14, with the last attempt deliberately after most payday cycles.
- Each retry got its own message, in the same voice as the rest of the product, with a one-tap update link.
- The final message said plainly what would happen and when, rather than "action required".

> The most expensive email in a subscription business is the one that tells someone their card failed and reads like it was written by a bank.

## What happened

Recovery on declined cards moved from 6% to 23% over the following two months. No feature shipped. Nobody's mind was changed about the product.

## What to take from this

Before anything else, split churn by intent. If you cannot do that in your reporting today, that is the first thing to fix — every retention decision made on a blended number is a decision made half blind.
