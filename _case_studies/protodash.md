---
layout: case-study
title: "Protodash: Scaling AI prototyping across a design organization"
headline: "Protodash: Giving teams leverage with AI"
description: "How I built an internal AI prototyping system that gave designers and product managers a faster path from an idea to a realistic, shareable product experience."
site: Stripe
slug: stripe-protodash
standalone: true
when: 2026
date: 2026-05-01
last_modified_at: 2026-08-22
image: /images/protodash.jpg
image_name: protodash
image_width: 1280
image_height: 720
image_widths: "320,640,1024"
youtube_id: hQFEAZK__q0
youtube_title: "The internal AI tool that's transforming how Stripe designs products"
tag: AI Leadership
seo:
  type: Article
---
AI leadership isn't just telling a team to start using AI. The interesting work is creating the conditions for people to use it confidently, at the quality bar your company expects, in ways that actually change how they work.

Protodash grew out of a broader interest in [using AI to shorten the distance between an idea and something you can experience](/2025/05/23/co-designing-with-ai/).

## Why generic AI prototypes missed the quality bar

I started building Protodash after seeing designers experiment with off-the-shelf AI prototyping tools in reviews. They were fast, but the results often landed in an uncanny valley: the wrong fonts, strange navigation, and what we started calling “blurple slop.” Stripe already had a high-quality, predictable design system, so it felt obvious that AI should be able to build with those real components instead of imagining its own version of our product.

## Building a realistic AI prototyping system

I built much of Protodash with AI, using my engineering background to set the architecture and steer it toward the quality bar I wanted. The first version combined a React shell, Stripe's Sail design system, an MCP integration, and a fairly opinionated bundle of rules that taught AI how to use the project—and stopped it from hallucinating when it couldn't. My goal was to lower the barrier until a designer only needed to know how to run a single command. From there, I connected it to Stripe's dev box infrastructure so a complete, shareable environment could be ready in about two minutes. Eventually, I built Protodash Studio: a browser-based layer where anyone can create, remix, review, and iterate on a prototype without opening a code editor at all.

## Scaling AI leverage beyond the design team

The leverage comes from giving that capability to the whole team. Designers can get 80–90% of the way to a realistic experience quickly, then spend their time on the taste and craft that elevates it. PMs became some of the most active users, unblocking themselves to explore ideas, test with users earlier, and communicate more clearly with designers. Anyone can contribute back to Protodash, too; designers now send pull requests that evolve the tool around the way they want to work.

Because the prototypes run in code, teams can explore realistic data, empty states, internationalization, different business models, and complete multi-step flows without constructing every state by hand. Reviews happen inside the clickable prototype, where feedback can be summarized and sent back to the AI as the next round of work. On one Radar project, a high-fidelity Protodash prototype became the source of truth for engineering—the first time I had seen that happen in my career as a design manager.

## Moving the culture toward demos, not memos

Protodash became a practical way to move our culture toward “demos, not memos.” More importantly, it showed what becomes possible when design leaders can build precise, opinionated tools for their teams: you don't have to wait for an off-the-shelf product or a fully staffed internal-tools team to change how the work gets done.

The organizational impact was later highlighted in Designer Fund and Foundation Capital's [*AI in Design Report 2026*](https://stateofaidesign.com/chapters/tools), which featured Protodash as an example of enterprise design teams building shared AI infrastructure:

<figure class="not-prose my-8 rounded-xl border border-sky-400/20 bg-sky-400/5 p-5 sm:p-6">
  <blockquote class="text-lg leading-relaxed text-slate-100">
    “Our team built ProtoDash, an AI-powered product playground with Stripe’s design system baked in. Now anyone can build a realistic prototype in minutes.”
  </blockquote>
  <figcaption class="mt-4 text-sm text-slate-300">— Katie Dill, Head of Design at Stripe</figcaption>
</figure>

That experience sharpened three principles I now bring to AI work: start with a real point of friction rather than a mandate to use the technology; connect AI to the actual systems and standards that define quality; and use the time it saves to increase exploration and critique, not lower the craft bar. AI can maintain momentum, but taste, accountability, and deciding which problem matters still belong to people.

I joined Claire Vo on [*How I AI*](https://www.lennysnewsletter.com/p/this-week-on-how-i-ai-the-internal) to walk through how Protodash evolved, build a prototype live, and talk about what changes when a company can make tools that fit the way its teams actually work.
