---
layout: post
title:  "Co-designing with AI"
description: "How I redesigned my portfolio site by partnering with AI to experiment"
date:   2025-05-23 00:00:00 -0700
image: 
categories: design
--- 
My portfolio site—the one you are reading now—has been online for almost a decade now. As my career, and time went on, it became increasingly impossible to find the time to maintain and even think about modernizing it.

As an experiment and way to learn what AI is capable of, I decided I'd co-redesign this portfolio with AI tools by my side. The biggest barrier _before_ was always getting started; this site was built with Bootstrap 3, Jekyll, and a pretty old-school build pipeline almost 10 years ago now. I could barely remember how it worked, let alone think about how to modernize it without starting from scratch.

![The old site](/images/old-site.png)

Migrating any site, even a small one like this to a modern framework like Tailwind would've been a huge pain in the past—but AI (specifically, Cursor) helped me find momentum and get across that painful barrier in less than an hour. In the past, that migration barrier alone killed my creativity every time.

Then the question became: what do I actually want a refreshed version of my portfolio to look like? What was interesting is, if I'm honest, I struggled to come up with a direction. I probably would have stalled out here in the past—but AI has changed the way you can experiment, too. 

I grabbed V0, and started iterating on ideas for the overall vibe and energy. I knew I wanted _some sort_ of animated, gradient-esque energy, but I _didn't_ want just some generic thing. While I'm confident writing code myself, this type of animated, generative canvas experience is a bit further out of my grasp than I'd like. V0, however, is plenty confident playing in this space. So I experimented—a lot.

![3D Orb Thing](/images/globe.png)

I played with weird ideas for weeks. Blobby gradients. Spinning [3D orbs](https://v0.dev/community/the-orb-RumDfOqDMPi). "Normal" gradient animations. Weird 3D stuff. It was incredible to be able to actually throw an idea out there and see how it would _feel._ Eventually, I found myself gravitating toward an idea that felt fairly unique, and a fit for my experience: [an ASCII-art gradient wave tool](/gradient/).

Once I had a direction, V0 was really great at helping me actually iterate on the overall vibe. I asked it to create a control panel for all of the parameters in the wave so I could play. It could add themes. Entrance animations. Accessibility features. And, even a button to copy the configuration from that playground, ready for dropping into my actual site. V0 even happily helped me figure out how to adapt the React-based output to work in my decidedly not-React-based Jekyll site perfectly.

![V0 generating my wave](/images/ascii-v0.png)

While I probably could have eventually come up with the ASCII-wave in Cursor eventually, V0 is notably better at rapid iteration on well-contained visual ideas like this. It seems to interpret open-ended creativity a lot better, and the iteration feedback loop was tighter. When it was ready to go, I just grabbed the code from there, and went back to the real work in Cursor.

For a personal project like this, iterating with Cursor and V0 was *addictive.* Coming up with an idea, and being able to play with it immediately is incredibly empowering. It's _also_ hard to know when to stop when your AI companion will happily oblige every possible weird idea you can come up with. I probably could have re-launched this site a while ago, but kept finding new ways to tweak it and play. I decided that what you see now is good enough, and I can always iterate on it in public later.

I won't brag that I have the most creative or innovative portfolio ever, but for a design manager that doesn't get to spend as much time as I want in the code anymore, co-designing this site with AI was incredibly liberating. It also helped cement my belief that AI prototyping of ideas is going to unlock a new wave of creativity in the tech industry, especially in my role. We just need to completely reset how we think about the design process, and move towards _showing_ rather than telling through the use of prototypes.

If you're interested in playing with the ASCII art gradient tool that powers the site, head to [the gradient playground.](/gradient) 