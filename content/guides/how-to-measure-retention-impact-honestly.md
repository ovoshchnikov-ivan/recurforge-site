---
title: "How to measure retention impact honestly"
slug: "how-to-measure-retention-impact-honestly"
category: guides
description: "Most retention wins are reported against a baseline that was never fair. Here is how to measure retention impact in a way that survives being questioned."
keyword: "measure retention impact"
tags: [analytics, experimentation, churn]
date: 2026-09-02
draft: true
og_image: ""
---

If you want to measure retention impact honestly, the hard part is not the statistics. It is that almost every convenient baseline flatters the thing you just shipped, and nobody in the room has an incentive to say so.

This is a draft article used to check the blog build.

## The three baselines that lie

### Before and after

The most common one. You shipped a new onboarding flow in March, retention in April is better than February, therefore the flow worked. Except February had a pricing test in it, March had a seasonal peak, and the cohort that signed up in April came from a different channel mix.

### The engaged-user comparison

People who opened the new email retained better than people who did not. They also retained better before the email existed. Opening the email is a symptom of intent, not a cause of retention.

### The self-selected cohort

Users who enabled the new feature stayed longer. The people who go and find a new feature in settings are, definitionally, not a random sample of your users.

## What actually works

In rough order of how much you should trust the answer:

1. **A holdout.** Withhold the change from a random slice and compare. Expensive in patience, cheap in everything else.
2. **A switchback.** Alternate the change on and off across time windows. Useful when a permanent holdout is not practical.
3. **A matched cohort.** Compare against users who look the same on the dimensions that predict retention, chosen before you look at the outcome.
4. **A pre-registered before-and-after.** Write down the expected effect, the window, and the confounders you know about, before the change ships.

Anything below that line is a story, and it should be labelled as one when it is presented.

## Size the window before you start

Retention effects show up late. A change to a day-one experience can take sixty days to become visible in a renewal number, which means the report written on day fourteen is measuring noise.

```
minimum window = time to the outcome you care about
               + one full cycle of that outcome
```

For a monthly subscription that is usually two billing cycles. For an annual one, you will be using a leading indicator whether you like it or not — pick it deliberately and say out loud that it is a proxy.

## The one habit worth building

Write the analysis plan before the change ships. Not the full document — five lines: what you expect to move, by roughly how much, in what window, measured against what, and what result would make you say it did not work.

The last line is the one that makes the rest honest.
