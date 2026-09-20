---
layout: case-study
title: "Protodash: Scaling AI prototyping across a design organization"
headline: "Protodash: Giving teams leverage with AI"
description: "How I built an internal AI prototyping system that gave designers, product managers, and engineers a faster path from an idea to a realistic, shareable product experience."
site: Stripe
slug: stripe-protodash
standalone: true
when: 2026
date: 2026-05-01
last_modified_at: 2026-09-19
image: /images/protodash.jpg
image_name: protodash
image_width: 1280
image_height: 720
image_widths: "320,640,1024"
youtube_id: hQFEAZK__q0
youtube_title: "The internal AI tool that's transforming how Stripe designs products"
videos_label: "Protodash demonstrations"
videos:
  - id: hQFEAZK__q0
    title: "The internal AI tool that's transforming how Stripe designs products"
    caption: "Building a prototype live with Claire Vo on How I AI, and walking through how Protodash evolved."
  - id: JKc2J8Thkoo
    title: "Inside Stripe's Design Team: Moving Fast Without Sacrificing Quality"
    caption: "Designer Fund's AI in Design Report 2026. Ryan Spencer and Sadhika Billa one-shot a fraud dashboard in Protodash Studio from 1:40."
tag: AI Leadership
seo:
  type: Article
---
AI leadership isn't just telling a team to start using AI. The interesting work is creating the conditions for people to use it confidently, at the quality bar your company expects, in ways that actually change how they work.

Protodash grew out of a broader interest in [using AI to shorten the distance between an idea and something you can experience](/2025/05/23/co-designing-with-ai/). I built it as a side project, and it spread on its own: Designer Fund and Foundation Capital's *AI in Design Report 2026* later described it as one of "Stripe's most widely used internal AI tools."

## Why generic AI prototypes missed the quality bar

I started building Protodash after seeing designers experiment with off-the-shelf AI prototyping tools in reviews. They were fast, but the results often landed in an uncanny valley: the wrong fonts, strange navigation, and what we started calling “blurple slop.” Stripe already had a high-quality, predictable design system, so it felt obvious that AI should be able to build with those real components instead of imagining its own version of our product.

## Building a realistic AI prototyping system

I built much of Protodash with AI, using my engineering background to set the architecture and steer it toward the quality bar I wanted. The first version combined a React shell, Stripe's Sail design system, an MCP integration, and a fairly opinionated bundle of rules that taught AI how to use the project—and stopped it from hallucinating when it couldn't. My goal was to lower the barrier until a designer only needed to know how to run a single command. From there, I connected it to Stripe's dev box infrastructure so a complete, shareable environment could be ready in about two minutes. Eventually, I built Protodash Studio: a browser-based layer where anyone can create, remix, review, and iterate on a prototype without opening a code editor at all.

## Scaling AI leverage beyond the design team

The leverage comes from giving that capability to the whole team. Designers can get 80–90% of the way to a realistic experience quickly, then spend their time on the taste and craft that elevates it. PMs became some of the most active users, unblocking themselves to explore ideas, test with users earlier, and communicate more clearly with designers. Engineers picked it up too. Anyone can contribute back to Protodash, too; designers now send pull requests that evolve the tool around the way they want to work.

Because the prototypes run in code, teams can explore realistic data, empty states, internationalization, different business models, and complete multi-step flows without constructing every state by hand. Reviews happen inside the clickable prototype, where feedback can be summarized and sent back to the AI as the next round of work.

## What it looks like in practice

The fraud and risk teams have leaned on Protodash more than most. In the Designer Fund video, Ryan Spencer and Sadhika Billa open Protodash Studio, pick the dashboard frame—search, account selector, navigation, all the chrome that makes a prototype feel like Stripe—and ask for “a live fraud dashboard that monitors my payments.” The first response is a working dashboard: fraud rate, blocked payments, protected revenue, trends over time and by category, flagged transactions with risk levels, all built from Sail components and fully interactive. As Ryan puts it, putting that in front of a user “is a much more rich experience because they can actually feel the different components of it, versus a static screen.” They use it to share concepts with each other and to test with real users before anything is built.

That depth is also why, on one Radar project, a high-fidelity Protodash prototype became the source of truth for engineering—the first time I had seen that happen in my career as a design manager.

## Moving the culture toward demos, not memos

Protodash became a practical way to move our culture toward “demos, not memos.” More importantly, it showed what becomes possible when design leaders can build precise, opinionated tools for their teams: you don't have to wait for an off-the-shelf product or a fully staffed internal-tools team to change how the work gets done.

It was never mandated. It spread because it solved a problem people already had, and because Stripe's design culture—what Katie Dill calls “setting the table to enable the party”—leaves room for someone to, in Ryan Spencer's words, “find time in my day, or maybe night, to mock this thing up and make it a possible tool for other people.” The report's advice to design leaders is to “walk the talk”: build something with AI yourself. Protodash is what that looked like for me.

The organizational impact was highlighted in the [*AI in Design Report 2026*](https://stateofaidesign.com/chapters/tools), which featured Protodash as an example of enterprise design teams building shared AI infrastructure, and in the report's [Stripe case study](https://stateofaidesign.com/cases/stripe):

<figure class="not-prose my-8 rounded-xl border border-sky-400/20 bg-sky-400/5 p-5 sm:p-6">
  <blockquote class="text-lg leading-relaxed text-slate-100">
    “Our team built ProtoDash, an AI-powered product playground with Stripe’s design system baked in. Now anyone can build a realistic prototype in minutes.”
  </blockquote>
  <figcaption class="mt-4 text-sm text-slate-300">— Katie Dill, Head of Design at Stripe</figcaption>
</figure>

<figure class="not-prose my-8 rounded-xl border border-sky-400/20 bg-sky-400/5 p-5 sm:p-6">
  <blockquote class="text-lg leading-relaxed text-slate-100">
    “It was built as a passion project from Owen… it wasn't a mandated thing. He just decided to build this to make it a lot easier for not just designers, but also engineers and product managers.”
  </blockquote>
  <figcaption class="mt-4 text-sm text-slate-300">— Sadhika Billa, Staff Product Designer at Stripe</figcaption>
</figure>

That experience sharpened three principles I now bring to AI work: start with a real point of friction rather than a mandate to use the technology; connect AI to the actual systems and standards that define quality; and use the time it saves to increase exploration and critique, not lower the craft bar. AI can maintain momentum, but taste, accountability, and deciding which problem matters still belong to people.

I joined Claire Vo on [*How I AI*](https://www.lennysnewsletter.com/p/this-week-on-how-i-ai-the-internal) to walk through how Protodash evolved, build a prototype live, and talk about what changes when a company can make tools that fit the way its teams actually work.
