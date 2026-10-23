"""Build the three v13 directions. Run from any directory; no dependencies.

Shared content is intentional: compare art direction without changing the facts.
Root promotion is a separate, explicit step with promote.py.
"""
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[2]
DRAFTS = ROOT / 'redesign/drafts'
SHARED = '../v13-shared'
RESUME = '../../../DanielAzranResume.pdf'
EMAIL = 'dazran0929@gmail.com'
ARROW = '<span aria-hidden="true">↗</span>'
VARIANTS = {
    'observatory': ('Observatory', 'Engineering with<br>a sense of <em>wonder.</em>', 'An open mind. A dependable system.'),
    'studio': ('Studio', 'A builder’s mind.<br>An editor’s <em>eye.</em>', 'Technical depth. A different perspective.'),
    'skyline': ('Skyline', 'Good systems.<br>A little <em>stardust.</em>', 'Grounded in engineering. Driven by curiosity.'),
}


def finish_icons(page):
    """Draw symbols explicitly; font subsets and platform fallback cannot drop them."""
    paths = {
        '↗': 'M5 19 19 5M5 5h14v14',
        '↘': 'M5 5l14 14M5 19h14V5',
        '→': 'M4 12h16m-7-7 7 7-7 7',
        '↓': 'M12 4v16m-7-7 7 7 7-7',
        '↑': 'M12 20V4m-7 7 7-7 7 7',
        '←': 'M20 12H4m7-7-7 7 7 7',
        '✧': 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
        '✦': 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
        '⌕': 'M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
        '∿': 'M1 12h3l3-8 5 16 4-12 3 4h4',
        '≋': 'M3 6h18M3 12h18M3 18h18',
        '△': 'm12 3 10 18H2Z',
        '◇': 'm12 2 10 10-10 10L2 12Z',
        '▷': 'm7 3 15 9-15 9Z',
    }
    for symbol, path in paths.items():
        page = page.replace(symbol, f'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="{path}"/></svg>')
    return page


def head(theme, title='Daniel Azran — Full-stack Engineer', description=None):
    description = description or 'Full-stack engineer building call ingestion, AI review, and useful products. Explore production systems, Spreed, and real-time swing analysis.'
    return f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="{'light' if theme == 'studio' else 'dark'}">
<meta name="theme-color" content="{'#f4f0e8' if theme == 'studio' else '#101b2b'}">
<title>{escape(title)}</title><meta name="description" content="{escape(description)}">
<meta property="og:title" content="{escape(title)}"><meta property="og:description" content="{escape(description)}">
<meta property="og:type" content="website"><meta property="og:image" content="https://danzran.github.io/redesign/drafts/v13-shared/assets/social.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{SHARED}/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="{SHARED}/assets/font-0.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{SHARED}/assets/font-2.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{SHARED}/assets/font-1.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{SHARED}/fonts.css"><link rel="stylesheet" href="{SHARED}/style.css">
</head><body class="theme-{theme}" id="top">
<noscript><style>.mobile-nav[hidden]{{display:block!important}}.menu-toggle,.demo-play,.swing-play,.reel-play,.copy-email{{display:none!important}}</style></noscript>
<a class="skip" href="#main">Skip to content</a>'''


def nav(home=False):
    prefix = '' if home else 'index.html'
    return f'''<header class="site-header"><div class="nav-wrap wrap">
<a class="brand" href="{prefix or '#top'}" aria-label="da · Daniel Azran, home"><span class="brand-mark" aria-hidden="true">da<span>·</span></span><span class="brand-name">Daniel Azran</span></a>
<nav class="desktop-nav" aria-label="Main navigation"><a href="{prefix}#work">Work</a><a href="{prefix}#experience">Experience</a><a href="{prefix}#about">About</a></nav>
<div class="nav-actions"><a class="resume-link" href="{RESUME}" target="_blank" rel="noopener">Résumé {ARROW}</a><a class="nav-contact" href="{prefix}#contact">Let’s talk <span aria-hidden="true">↗</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav"><span class="menu-icon" aria-hidden="true"></span><span class="sr-only">Menu</span></button></div>
</div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="{prefix}#work">Selected work</a><a href="{prefix}#experience">Experience</a><a href="{prefix}#about">About Daniel</a><a href="{prefix}#contact">Contact</a><a href="{RESUME}" target="_blank" rel="noopener">Download résumé {ARROW}</a></nav></header>'''


def art(theme):
    if theme == 'observatory':
        return f'''<div class="hero-art observatory-art" aria-hidden="true">
<svg class="orbit-lines" viewBox="0 0 600 560" preserveAspectRatio="none"><ellipse cx="300" cy="280" rx="268" ry="180" transform="rotate(-25 300 280)"/><ellipse cx="300" cy="280" rx="278" ry="200" transform="rotate(35 300 280)"/></svg><span class="orbit-star">✦</span>
<div class="art-window"><picture><source media="(max-width: 600px)" srcset="{SHARED}/assets/observatory-small.webp"><img src="{SHARED}/assets/observatory.webp" alt="" width="1536" height="1024" fetchpriority="high"></picture><div class="art-glow"></div><canvas class="atmosphere"></canvas></div>
<span class="art-coordinate">CURIOSITY → POSSIBILITY</span><div class="art-caption"><span class="tiny-star" aria-hidden="true">✧</span> There’s always more to discover.</div></div>'''
    if theme == 'studio':
        return '''<div class="hero-art studio-art" aria-label="Illustration of a call processing pipeline"><div class="studio-grid"></div><div class="studio-orbit"></div><div class="signal-card"><div class="signal-top"><span class="live-dot"></span> SYSTEMS BEHIND THE PHONES</div><div class="signal-wave" aria-hidden="true">''' + ''.join(f'<i style="--h:{12+(i*37)%72}px;--delay:{i*-0.09}s"></i>' for i in range(41)) + '''</div><div class="signal-number">40,000<span>+</span></div><p>calls captured every day</p><div class="signal-flow"><span>Capture</span><i>→</i><span>Transcribe</span><i>→</i><span>Search</span></div></div><div class="studio-note">A little structure.<br>A lot of possibility.<svg viewBox="0 0 120 55" aria-hidden="true"><path d="M8 6q50 55 100 24m-15-8 15 8-8 13"/></svg></div></div>'''
    return '''<div class="hero-art skyline-art"><img src="../v12-sky/assets/orbit/yaw-000.webp" alt="Illustration of Daniel doing a handstand" width="933" height="1400" fetchpriority="high"><span class="skyline-note">A different perspective<br>can change everything.</span></div>'''


def hero(theme):
    _, title, kicker = VARIANTS[theme]
    return f'''<section class="hero wrap" id="hero"><div class="hero-copy">
<p class="eyebrow"><span class="live-dot" aria-hidden="true"></span> FULL-STACK ENGINEER · ML & DATA</p>
<h1>{title}</h1><p class="hero-description">I’m Daniel. I build the systems behind 40,000+ daily calls, turn data into useful tools, and care about how it all feels to use.</p>
<div class="hero-actions"><a class="button primary" href="#work">Explore my work <span aria-hidden="true">↘</span></a><a class="text-link" href="{RESUME}" target="_blank" rel="noopener">View résumé {ARROW}</a></div>
<p class="hero-footnote">Currently building at <strong>Safe Ship Moving Services</strong></p></div>
{art(theme)}<div class="hero-bottom"><span>{kicker}</span><a href="#work">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a></div></section>'''


def impact():
    return '''<section class="impact wrap" aria-label="Production engineering highlights"><div><strong>40,000<span>+</span></strong><p>calls captured daily</p></div><div><strong>Nearly ½</strong><p>reduction in MongoDB costs</p></div><div><strong>5 weeks</strong><p>to build a full-stack partner portal</p></div><a href="safe-ship.html" class="impact-link">The work behind<br>the numbers <span aria-hidden="true">↗</span></a></section>'''


def spreed_demo():
    return '''<div class="spreed-screen"><div class="screen-top"><span class="spreed-wordmark">spreed</span><span class="demo-label">INTERACTIVE PREVIEW</span></div><div class="reader-progress"><i></i></div><div class="reader" aria-hidden="true"><i class="reader-tick top"></i><span class="reader-word"><span>bea</span><b>m</b><span>ed</span></span><i class="reader-tick bottom"></i></div><p class="reader-note">ONE WORD AT A TIME. ALL YOUR ATTENTION.</p><div class="demo-controls"><button class="demo-play" type="button" aria-pressed="false">Play reader <span aria-hidden="true">▷</span></button><span>375 words / min</span></div><div class="quiz"><div class="quiz-meta"><span>Comprehension check</span><span>01 / 04</span></div><h4>How did the text reach you?</h4><div class="quiz-options"><button type="button" data-answer="wrong"><span aria-hidden="true">△</span> All at once</button><button type="button" data-answer="correct"><span aria-hidden="true">◇</span> One word at a time</button></div><p class="quiz-feedback" aria-live="polite">Speed only counts if you understand.</p></div><p class="sr-only">A demonstration of Spreed’s speed reader. Play animates words; pause stops them. Try the comprehension question below.</p></div>'''


def work():
    return f'''<section class="section work-section wrap" id="work"><div class="section-heading"><div><p class="eyebrow">SELECTED WORK</p><h2>Built for a reason.</h2></div><p>Production systems, playful experiments,<br>and the thinking that connects them.</p></div>
<article class="project project-spreed"><div class="project-copy"><p class="project-category"><span class="category-dot"></span> FEATURED PERSONAL PROJECT</p><h3 class="spreed-title">spreed<span aria-hidden="true">↗</span></h3><p class="project-lead">Read faster.<br>Understand more.</p><p>A competitive speed-reading game where words arrive one at a time. Race a friend, join a party, or take the daily challenge. Speed only scores if comprehension holds.</p><div class="project-detail"><h4>The interesting part</h4><p>Matchmaking, Elo, and scoring live in Postgres functions, so the client can’t award itself a win.</p></div><ul class="tags" aria-label="Technologies"><li>React</li><li>TypeScript</li><li>Supabase Realtime</li><li>WebAudio</li></ul><a class="button primary" href="https://spreed-ruby.vercel.app" target="_blank" rel="noopener">Play Spreed {ARROW}</a></div><div class="project-visual spreed-visual">{spreed_demo()}</div></article>
<article class="project project-systems"><div class="project-visual system-visual"><div class="diagram-title"><span class="live-dot"></span> FROM CALL TO CONTEXT</div><div class="pipeline" aria-label="Call ingestion architecture"><div class="pipe-node"><span class="pipe-icon" aria-hidden="true">∿</span><h4>RingCentral</h4><p>Call metadata & recordings</p></div><div class="pipe-connector" aria-hidden="true"><i></i><span>↓</span></div><div class="pipe-node"><span class="pipe-icon" aria-hidden="true">≋</span><h4>Capture & transcribe</h4><p>Python · AssemblyAI</p></div><div class="pipe-connector" aria-hidden="true"><i></i><span>↓</span></div><div class="pipe-split"><div><span class="pipe-small-icon" aria-hidden="true">⌕</span><h4>Searchable calls</h4><p>Find the conversation</p></div><div><span class="pipe-small-icon" aria-hidden="true">✧</span><h4>Sales call review</h4><p>Compliance & coaching</p></div></div></div><span class="diagram-caption">A simplified view of the systems I build.</span></div><div class="project-copy"><p class="project-category">PRODUCTION ENGINEERING · SAFE SHIP</p><h3>The systems<br>behind the phones.</h3><p>A call ingestion pipeline capturing 40,000+ calls a day, searchable recordings, and AI compliance review for sales calls.</p><div class="project-detail"><h4>Beyond the pipeline</h4><p>A partner portal built in five weeks, a 33,000-line API split into 61 modules, and a MongoDB bill cut nearly in half.</p></div><ul class="tags" aria-label="Technologies"><li>Python</li><li>TypeScript</li><li>React</li><li>MongoDB</li></ul><a class="button secondary" href="safe-ship.html">Inside the work <span aria-hidden="true">↗</span></a></div></article>
<article class="project project-golf"><div class="project-copy"><p class="project-category">REAL-TIME SYSTEMS · EXTROPIAN</p><h3>From a swing<br>to a signal.</h3><p>A Flutter app turning wearable Bluetooth sensor data into real-time golf swing feedback. I led the streaming and metric layer in a six-person team.</p><div class="project-detail"><h4>A more dependable connection</h4><p>Cut packet loss from tens to single digits per session, keeping the feedback flowing.</p></div><ul class="tags" aria-label="Technologies"><li>Flutter</li><li>Dart</li><li>Firebase</li><li>Bluetooth</li></ul><a class="button secondary" href="golf.html">Explore the case study <span aria-hidden="true">↗</span></a></div><div class="project-visual golf-visual"><div class="golf-frame"><img class="swing-frame" src="../../assets/golf/g00.webp" alt="Daniel’s golf swing with an illustrative pose-tracking overlay" width="600" height="800"><canvas class="golf-overlay" aria-hidden="true"></canvas><span class="golf-label">POSE STUDY <span aria-hidden="true">↗</span></span><button class="swing-play" type="button" aria-pressed="false">Play swing <span aria-hidden="true">▷</span></button></div><p class="visual-caption">My own swing. Illustrative 2D tracking, not calibrated biomechanics.</p></div></article>
<div class="more-work"><div><p class="eyebrow">A FEW MORE EXPLORATIONS</p><h3>Curiosity, in practice.</h3></div><div class="explorations"><a href="https://github.com/Danzran/Optical-Flow-Tracker" target="_blank" rel="noopener"><span><strong>Optical Flow Tracker</strong><small>Lucas–Kanade point tracking · 30+ FPS</small></span>{ARROW}</a><a href="https://github.com/Danzran/PL-0-Compiler" target="_blank" rel="noopener"><span><strong>PL/0 Compiler</strong><small>Lexer → parser → code generator · C</small></span>{ARROW}</a><a href="https://github.com/Danzran/Mikal-Wix-Sync" target="_blank" rel="noopener"><span><strong>Mikal → Wix Sync</strong><small>Appointment reports into busy blocks</small></span>{ARROW}</a></div></div></section>'''


def experience():
    return '''<section class="section experience-section wrap" id="experience"><div class="section-heading"><div><p class="eyebrow">THE PATH SO FAR</p><h2>A few chapters.<br>One curious mind.</h2></div><p>I’ve worked with systems, signals, and stories.<br>Each taught me a different way to solve a problem.</p></div><div class="experience-list">
<article class="experience-row"><div class="experience-date"><span class="live-dot"></span> CURRENT</div><div><h3>Safe Ship Moving Services</h3><p class="experience-role">Full-stack engineering · Call infrastructure & AI</p></div><p>Call ingestion and search, AI compliance and coaching, partner tooling, and a more maintainable core API.</p></article>
<article class="experience-row"><div class="experience-date">SEP 2024 — MAY 2025</div><div><h3>Extropian</h3><p class="experience-role">Backend Software Developer</p></div><p>Real-time golf swing analysis. Bluetooth streaming, swing metrics, and a cross-platform Flutter app.</p></article>
<article class="experience-row"><div class="experience-date">SEP 2018 — PRESENT</div><div><h3>Independent IT</h3><p class="experience-role">Systems Assembler & IT Technician</p></div><p>Custom desktop builds, small-business networks, and hands-on troubleshooting for real people.</p></article>
<article class="experience-row"><div class="experience-date">AUG 2022 — DEC 2023</div><div><h3>Sonic Locksmith</h3><p class="experience-role">Lockout Technician</p></div><p>Vehicle key programming and on-site diagnostics. Clear thinking and communication under pressure.</p></article>
<article class="experience-row"><div class="experience-date">2014 — 2020</div><div><h3>Independent video editor</h3><p class="experience-role">Editing, compositing & motion</p></div><p>Camera tracking, 3D elements, and a team of up to four editors. Where my eye for detail first found its rhythm.</p></article></div></section>'''


def about():
    return '''<section class="section about-section wrap" id="about"><div class="about-story"><p class="eyebrow">THE PERSON BEHIND THE WORK</p><h2>Serious about the craft.<br><em>Curious about everything.</em></h2><p>I’m a full-stack engineer with a computer science degree from UCF, a focus on machine learning and data, and a habit of following an interesting problem a little further.</p><p>Before software, I spent years editing video. It taught me that what someone experiences matters just as much as what happens behind the scenes. I bring that same care to the systems and interfaces I build.</p><a class="text-link" href="https://github.com/Danzran" target="_blank" rel="noopener">See what I’m working on <span aria-hidden="true">↗</span></a><dl class="about-facts"><div><dt>EDUCATION</dt><dd>B.S. Computer Science<br>University of Central Florida · 3.5 GPA</dd></div><div><dt>TOOLS I REACH FOR</dt><dd>TypeScript, Python, React, Node.js,<br>MongoDB, Flutter, and Firebase</dd></div></dl></div><div class="about-media"><div class="reel-wrap"><video poster="../../assets/video/edit-poster.jpg" preload="none" muted loop playsinline aria-label="Daniel’s original video editing reel"><source src="../../assets/video/edit.webm" type="video/webm"><source src="../../assets/video/edit.mp4" type="video/mp4"></video><button class="reel-play" type="button" aria-pressed="false">Play editing reel <span aria-hidden="true">▷</span></button><span class="reel-label">AN EARLIER CHAPTER</span></div><div class="personal-note"><span aria-hidden="true">✧</span><p>Still chasing that moment when<br>all the pieces click.</p></div></div></section>'''


def contact():
    return f'''<footer class="contact-section" id="contact"><div class="wrap"><p class="eyebrow">HAVE AN INTERESTING PROBLEM?</p><div class="contact-heading"><h2>Let’s build<br>something <em>good.</em></h2><a class="contact-arrow" href="mailto:{EMAIL}" aria-label="Email Daniel Azran">↗</a></div><div class="contact-links"><a class="email-link" href="mailto:{EMAIL}">{EMAIL}</a><button class="copy-email" type="button" data-email="{EMAIL}">Copy email</button><span class="copy-status sr-only" aria-live="polite"></span></div><div class="footer-bottom"><p>© 2026 Daniel Azran <span>Built with care. And curiosity.</span></p><div><a href="https://github.com/Danzran" target="_blank" rel="noopener">GitHub {ARROW}</a><a href="https://linkedin.com/in/danielazran" target="_blank" rel="noopener">LinkedIn {ARROW}</a><a href="{RESUME}" target="_blank" rel="noopener">Résumé {ARROW}</a><a href="#top" aria-label="Back to top">↑</a></div></div></div></footer>'''


def end(theme, sky=False):
    scripts = f'<script type="module" src="{SHARED}/app.js"></script>'
    if sky:
        scripts += f'<script src="../v12-sky/skytex.js"></script><script src="{SHARED}/sky.js"></script>'
    return scripts + '</body></html>'


def case(theme, kind):
    is_ship = kind == 'safe-ship'
    title = 'The systems behind the phones.' if is_ship else 'From a swing to a signal.'
    label = 'SAFE SHIP MOVING SERVICES · PRODUCTION ENGINEERING' if is_ship else 'EXTROPIAN · SEP 2024 — MAY 2025'
    intro = 'Call infrastructure, AI review, and the tools that keep a moving business moving.' if is_ship else 'Turning a stream of wearable sensor data into useful, real-time feedback.'
    common = head(theme, title.rstrip('.') + ' — Daniel Azran') + nav() + f'''<main id="main" class="case-main wrap"><a class="back-link" href="index.html#work">← Back to selected work</a><header class="case-header"><p class="eyebrow">{label}</p><h1>{title}</h1><p>{intro}</p></header>'''
    if is_ship:
        content = '''<div class="case-metrics"><div><strong>40,000+</strong><p>calls captured per day</p></div><div><strong>5 weeks</strong><p>full-stack portal delivery</p></div><div><strong>61 modules</strong><p>from one 33,000-line API file</p></div></div>
<div class="case-layout"><aside><p class="eyebrow">MY CONTRIBUTION</p><p>Call ingestion & search<br>AI compliance & coaching<br>Full-stack partner portal<br>API decomposition</p><p class="eyebrow">CORE TECHNOLOGIES</p><p>TypeScript · Python · React<br>MongoDB · RingCentral<br>AssemblyAI · LLMs</p><p class="case-note">This overview uses public-facing descriptions. Internal code, customer data, and operational details stay private.</p></aside><div class="case-prose">
<section><p class="eyebrow">THE CONTEXT</p><h2>A lot of conversations.<br>A need for clarity.</h2><p>At Safe Ship Moving Services, calls are central to the business. Capturing them is only the beginning: the recordings need to be available, searchable, and useful to the people reviewing sales conversations.</p><p>I build the systems connecting those steps, alongside partner tooling and improvements to the core application.</p></section>
<section><p class="eyebrow">01 / CALL INFRASTRUCTURE</p><h2>From recording to retrieval.</h2><p>I built a pipeline that captures more than 40,000 calls a day in metadata, archives eligible recordings, and makes transcriptions searchable. RingCentral is the call source; AssemblyAI supplies transcription.</p><div class="case-flow"><span>Call metadata<br>& recordings</span><b aria-hidden="true">→</b><span>Archive<br>& transcribe</span><b aria-hidden="true">→</b><span>Search<br>& retrieval</span></div><h3>The engineering focus</h3><p>Capture, transcription, and retrieval are different responsibilities. Treating them as stages makes the pipeline easier to reason about than treating a call as one indivisible operation.</p><p class="case-note">The daily volume refers to call metadata. Recording and transcription volume depends on eligibility; it is not a claim that every one of those calls is recorded or reviewed by AI.</p></section>
<section><p class="eyebrow">02 / MAKING THE DATA USEFUL</p><h2>Review that leads to coaching.</h2><p>On top of the call infrastructure, I built AI compliance scoring and sales coaching. Sales calls are scored against a versioned rubric, and missed criteria become coaching opportunities.</p><h3>Why the rubric matters</h3><p>A model’s output needs an explicit standard to be meaningful. Keeping the rubric versioned makes the review criteria concrete and allows them to evolve deliberately.</p></section>
<section><p class="eyebrow">03 / PARTNER OPERATIONS</p><h2>A portal in five weeks.</h2><p>I built a full-stack partner portal covering invoicing, API keys, and reconciliation. It replaced shared spreadsheet workflows with a dedicated interface and backend.</p><p>This work spans React interfaces and the server-side flows behind them. The goal was practical: give partners and operators a clearer place to do the work.</p></section>
<section><p class="eyebrow">04 / MAINTAINABILITY</p><h2>One large file.<br>Smaller, reviewable changes.</h2><p>I split a 33,000-line jobs API file into 61 focused modules over 18 staged changes. The work made the API easier to navigate while keeping the review surface manageable.</p><div class="refactor-diagram" aria-label="One 33,000-line file became 61 focused modules"><div>33,000 lines<br><small>one route file</small></div><span aria-hidden="true">→</span><div>61 modules<br><small>18 staged changes</small></div></div></section>
<section><p class="eyebrow">ANOTHER OUTCOME</p><h2>A smaller database bill.</h2><p>Alongside that work, I cut the MongoDB bill nearly in half. I keep the public figure relative rather than publishing internal spending amounts.</p></section>
<section class="case-takeaway"><p class="eyebrow">THE THREAD THROUGH IT ALL</p><h2>Make the work easier<br>to understand.</h2><p>Searchable conversations, explicit review criteria, a dedicated partner portal, and focused modules all point toward the same goal: systems that people can work with and engineers can keep improving.</p></section></div></div>'''
    else:
        content = '''<div class="case-layout golf-case"><aside><p class="eyebrow">MY ROLE</p><p>Backend Software Developer<br>Bluetooth streaming & metrics<br>Six-person Agile team</p><p class="eyebrow">STACK</p><p>Flutter · Dart · Firebase<br>Bluetooth · MediaPipe study</p></aside><div class="case-prose"><section><h2>Feedback while it matters.</h2><p>At Extropian, I worked on a cross-platform Flutter app that analyzed golf swing metrics from wearable sensor data. The app delivered feedback in real time, rather than making the user wait until the session was over.</p></section><section><h2>Keep the signal flowing.</h2><p>I led the Bluetooth data streaming layer and swing metric calculations. That work cut packet loss from tens to single digits per session, enabling more dependable, low-latency feedback.</p><div class="case-flow"><span>Wearable<br>sensor</span><b aria-hidden="true">→</b><span>Bluetooth<br>stream</span><b aria-hidden="true">→</b><span>Flutter app<br>& metrics</span></div><p>The team used Git and Jira to coordinate work across six people.</p></section><section><h2>A closer look at the motion.</h2><p>For this portfolio, I ran my own swing through a MediaPipe pose model and paired the data with stylized video frames. This is a separate visual study, not a screenshot of the production wearable app.</p><div class="case-swing golf-frame"><img class="swing-frame" src="../../assets/golf/g00.webp" alt="Daniel’s golf swing, illustrated for a pose-tracking study" width="600" height="800"><canvas class="golf-overlay" aria-hidden="true"></canvas><button class="swing-play" type="button" aria-pressed="false">Play swing <span aria-hidden="true">▷</span></button></div><p class="case-note">The overlay is illustrative 2D pose tracking. Perspective, occlusion, and estimated club positions limit precision. It should not be read as calibrated biomechanics or a measured performance score.</p></section><section><h2>The part I carried forward.</h2><p>Real-time feedback depends on the quality of the path from the sensor to the interface. The streaming layer deserves as much care as the visible result.</p></section></div></div>'''
    return common + content + '<a class="button secondary case-back" href="index.html#work">← Back to all work</a></main>' + contact() + end(theme)


def build():
    # Keep the existing living world intact, with a lower frame cap and a pause hook.
    sky = (DRAFTS / 'v12-sky/sky.js').read_text()
    sky = sky.replace('if (now - last < 15.5) return;', 'if (now - last < 33) return;')
    sky = sky.replace('if (!running) return;', 'if (!running || ambientPaused) return;')
    sky = sky.replace('let prog01 = 0,', "let ambientPaused = false;\ndocument.addEventListener('portfolio:motion', event => { const wasPaused = ambientPaused; ambientPaused = event.detail.paused; if (wasPaused && !ambientPaused && !document.hidden) { last = performance.now(); requestAnimationFrame(frame); } });\nlet prog01 = 0,")
    start = sky.index('function staticSky()')
    sky_end = sky.index('let gl = null;')
    fallback = sky[start:sky_end].replace('    requestAnimationFrame(paint);\n', '')
    fallback = fallback.replace('  requestAnimationFrame(paint);', "  addEventListener('scroll', paint, {passive:true});\n  addEventListener('resize', () => { dims(); lastS = -1; paint(); });\n  paint();")
    sky = sky[:start] + fallback + sky[sky_end:]
    (DRAFTS / 'v13-shared/sky.js').write_text(sky)
    for theme in VARIANTS:
        dest = DRAFTS / f'v13-{theme}'
        dest.mkdir(exist_ok=True)
        sky = '<canvas id="sky" aria-hidden="true"></canvas>' if theme == 'skyline' else ''
        page = head(theme) + sky + nav(home=True) + '<main id="main">' + hero(theme) + impact() + work() + experience() + about() + '</main>' + contact() + end(theme, sky=theme == 'skyline')
        (dest / 'index.html').write_text(finish_icons(page))
        for kind in ['safe-ship', 'golf']:
            (dest / f'{kind}.html').write_text(finish_icons(case(theme, kind)))
    print('Built three directions, each with two case studies.')


if __name__ == '__main__':
    build()
