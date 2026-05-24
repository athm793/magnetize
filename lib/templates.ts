export interface TemplateTab {
  title: string;
  content: unknown[];
}

export interface Template {
  id: string;
  label: string;
  description: string;
  tabs: TemplateTab[];
}

function h1(text: string, id: string) {
  return { id, type: "heading", props: { level: 1, textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text, styles: {} }], children: [] };
}
function h2(text: string, id: string) {
  return { id, type: "heading", props: { level: 2, textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text, styles: {} }], children: [] };
}
function h3(text: string, id: string) {
  return { id, type: "heading", props: { level: 3, textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text, styles: {} }], children: [] };
}
function p(text: string, id: string) {
  return { id, type: "paragraph", props: { textAlignment: "left", textColor: "default", backgroundColor: "default" }, content: [{ type: "text", text, styles: {} }], children: [] };
}
function bullet(items: string[], baseId: string) {
  return items.map((text, i) => ({
    id: `${baseId}-b${i}`,
    type: "bulletListItem",
    props: { textAlignment: "left", textColor: "default", backgroundColor: "default" },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  }));
}
function numbered(items: string[], baseId: string) {
  return items.map((text, i) => ({
    id: `${baseId}-n${i}`,
    type: "numberedListItem",
    props: { textAlignment: "left", textColor: "default", backgroundColor: "default" },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  }));
}

export const TEMPLATES: Template[] = [
  {
    id: "ultimate-guide",
    label: "Ultimate Guide",
    description: "Deep-dive resource on a topic",
    tabs: [
      {
        title: "Introduction",
        content: [
          h1("The Ultimate Guide to [Your Topic]", "ug-1"),
          p("Welcome to the most comprehensive guide on [Your Topic]. Whether you're just getting started or looking to level up, this guide covers everything you need to know to get real results.", "ug-2"),
          h2("Who This Is For", "ug-3"),
          ...bullet([
            "Beginners who want a clear starting point",
            "Practitioners looking to sharpen their approach",
            "Teams building a repeatable system",
          ], "ug-4"),
          h2("What You'll Learn", "ug-5"),
          ...numbered([
            "The foundational concepts you can't skip",
            "A step-by-step framework you can apply immediately",
            "Common mistakes and how to avoid them",
            "Advanced tactics for faster results",
          ], "ug-6"),
          p("Let's get started.", "ug-7"),
        ],
      },
      {
        title: "The Framework",
        content: [
          h1("A Step-by-Step Framework", "ug-f1"),
          p("This framework has been tested across 100+ companies. It works because it removes guesswork and gives you a repeatable process.", "ug-f2"),
          h2("Step 1: Define Your Goal", "ug-f3"),
          p("Before anything else, get specific about what success looks like. Vague goals produce vague results.", "ug-f4"),
          ...bullet(["Set a single primary metric", "Define your 30/60/90-day targets", "Identify the one constraint holding you back"], "ug-f5"),
          h2("Step 2: Build the Foundation", "ug-f6"),
          p("Most people skip this. Don't. The fundamentals compound.", "ug-f7"),
          ...bullet(["Audit what you already have", "Identify gaps vs. what works", "Document your baseline"], "ug-f8"),
          h2("Step 3: Execute and Iterate", "ug-f9"),
          p("Speed matters more than perfection at this stage. Ship fast, measure, adjust.", "ug-f10"),
          ...numbered(["Run your first test in 48 hours", "Collect feedback from 5+ real users", "Make one improvement based on data", "Repeat weekly"], "ug-f11"),
        ],
      },
      {
        title: "Summary & Next Steps",
        content: [
          h1("Key Takeaways", "ug-s1"),
          p("Here's everything you need to remember from this guide.", "ug-s2"),
          ...bullet([
            "[Key insight 1] — the most important thing to understand",
            "[Key insight 2] — what separates good from great",
            "[Key insight 3] — the action most people skip",
          ], "ug-s3"),
          h2("Your Next 3 Actions", "ug-s4"),
          ...numbered([
            "Complete [specific first action] today",
            "Schedule [specific second action] this week",
            "Book a review session to assess your progress",
          ], "ug-s5"),
          h2("Want Help Implementing This?", "ug-s6"),
          p("If you found this guide useful and want hands-on support, [describe your offer or CTA here]. Fill out the form to get started.", "ug-s7"),
        ],
      },
    ],
  },
  {
    id: "checklist",
    label: "Checklist",
    description: "Step-by-step action list",
    tabs: [
      {
        title: "The Checklist",
        content: [
          h1("[Topic] Checklist — [Number] Steps to [Outcome]", "cl-1"),
          p("Use this checklist before [launching / publishing / starting / sending] to make sure nothing slips through. Print it, bookmark it, or share it with your team.", "cl-2"),
          h2("Phase 1: Preparation", "cl-3"),
          ...bullet([
            "Define your goal and success metric",
            "Confirm your target audience is specific enough",
            "Gather all required assets and information",
            "Review what competitors are doing",
            "Align with stakeholders or decision-makers",
          ], "cl-4"),
          h2("Phase 2: Execution", "cl-5"),
          ...bullet([
            "Complete [Step A] using [specific method]",
            "Complete [Step B] and document the output",
            "Run a quality check against [specific standard]",
            "Get feedback from at least one external person",
            "Make final adjustments based on feedback",
          ], "cl-6"),
          h2("Phase 3: Launch", "cl-7"),
          ...bullet([
            "Confirm all systems are live and tested",
            "Send internal announcement to the team",
            "Monitor results for the first 24 hours",
            "Log what worked and what didn't",
          ], "cl-8"),
        ],
      },
      {
        title: "Pro Tips",
        content: [
          h1("Pro Tips for Maximum Results", "cl-t1"),
          p("These are the things nobody tells you — until now.", "cl-t2"),
          h2("What Most People Get Wrong", "cl-t3"),
          ...bullet([
            "Skipping Phase 1 entirely — the prep work is where 80% of success comes from",
            "Treating every step as equal — prioritize the top 3 items in each phase",
            "Doing this alone — the best results come from a second set of eyes",
          ], "cl-t4"),
          h2("Time-Saving Shortcuts", "cl-t5"),
          ...bullet([
            "Use [Tool/Resource] to automate [specific step]",
            "Batch similar steps together to reduce context-switching",
            "Create a template for [repeated task] so you never start from scratch",
          ], "cl-t6"),
          h2("How to Use This Checklist with a Team", "cl-t7"),
          ...numbered([
            "Assign ownership for each phase before you start",
            "Use a shared doc or project tool so everyone tracks progress",
            "Run a 15-minute sync after Phase 2 before moving to launch",
          ], "cl-t8"),
          p("Questions? [Add your contact info or CTA here]", "cl-t9"),
        ],
      },
    ],
  },
  {
    id: "case-study",
    label: "Case Study",
    description: "Real results and methodology",
    tabs: [
      {
        title: "Overview",
        content: [
          h1("How [Client/Company] Achieved [Result] in [Timeframe]", "cs-1"),
          p("This case study breaks down exactly how [Client] went from [starting point] to [result]. We'll cover the strategy, the execution, the numbers, and the lessons.", "cs-2"),
          h2("The Quick Stats", "cs-3"),
          ...bullet([
            "Timeline: [X weeks / months]",
            "Starting point: [describe the baseline]",
            "Result: [the specific outcome — e.g. 3.2x revenue, 60% faster, $200k pipeline added]",
            "Key driver: [the single most important factor]",
          ], "cs-4"),
          h2("The Challenge", "cs-5"),
          p("[Client] came to us with a specific problem: [describe the problem clearly]. They had tried [what they tried before] but it wasn't working because [root cause].", "cs-6"),
          p("The stakes were high. [Add context — why this mattered, what was at risk].", "cs-7"),
        ],
      },
      {
        title: "The Strategy",
        content: [
          h1("What We Did", "cs-s1"),
          p("Here's the exact playbook we used. Nothing held back.", "cs-s2"),
          h2("Diagnosis First", "cs-s3"),
          p("Before touching anything, we spent [X days] understanding the real problem. Most agencies skip this. It's a mistake.", "cs-s4"),
          ...numbered([
            "Audited [specific area] to find the real constraint",
            "Interviewed [X] customers to understand the buying trigger",
            "Benchmarked performance against [industry standard]",
          ], "cs-s5"),
          h2("The Plan", "cs-s6"),
          p("Based on the diagnosis, we built a 3-phase plan:", "cs-s7"),
          h3("Phase 1 — [Name] (Week 1-2)", "cs-s8"),
          p("[What happened in phase 1. Be specific about the actions taken.]", "cs-s9"),
          h3("Phase 2 — [Name] (Week 3-6)", "cs-s10"),
          p("[What happened in phase 2. Include specific tactics, tools, or changes made.]", "cs-s11"),
          h3("Phase 3 — [Name] (Week 7+)", "cs-s12"),
          p("[The scaling / optimization phase. What was doubled down on, what was cut.]", "cs-s13"),
        ],
      },
      {
        title: "Results & Takeaways",
        content: [
          h1("The Numbers", "cs-r1"),
          ...bullet([
            "[Primary metric]: from [X] to [Y] — [% change]",
            "[Secondary metric]: from [X] to [Y]",
            "[Supporting metric]: [result]",
            "Time to first result: [X days]",
            "Total investment: [X hours / $X]",
          ], "cs-r2"),
          h2("What Made the Difference", "cs-r3"),
          p("If we had to distill it to one thing: [the key insight or lever].", "cs-r4"),
          ...bullet([
            "Speed over perfection — we launched in 2 weeks instead of 2 months",
            "Data before decisions — every change was backed by at least 50 data points",
            "[Third factor specific to this case]",
          ], "cs-r5"),
          h2("What [Client] Said", "cs-r6"),
          p("\"[Add a direct quote from the client here — specific and results-focused, not generic.]\"", "cs-r7"),
          p("— [Name, Title, Company]", "cs-r8"),
          h2("Want the Same Results?", "cs-r9"),
          p("[Your CTA — what should the reader do next? Book a call, download a template, apply for a program]", "cs-r10"),
        ],
      },
    ],
  },
  {
    id: "whitepaper",
    label: "Whitepaper",
    description: "Data-driven research document",
    tabs: [
      {
        title: "Executive Summary",
        content: [
          h1("[Industry / Topic] Report [Year]", "wp-1"),
          p("A research-backed analysis of [topic], based on data from [X companies / respondents / data points] collected in [timeframe].", "wp-2"),
          h2("Key Findings", "wp-3"),
          ...numbered([
            "[Finding 1]: [one sentence summary with a number if possible]",
            "[Finding 2]: [one sentence summary with a number if possible]",
            "[Finding 3]: [one sentence summary with a number if possible]",
            "[Finding 4]: [one sentence summary with a number if possible]",
          ], "wp-4"),
          h2("Implications", "wp-5"),
          p("These findings suggest that [industry/leaders/companies] need to rethink their approach to [topic]. The companies that adapt fastest will [outcome]. Those that don't will [risk].", "wp-6"),
          h2("About This Research", "wp-7"),
          ...bullet([
            "Sample size: [X respondents / data points]",
            "Methodology: [surveys / interviews / data analysis / proprietary dataset]",
            "Period: [date range]",
            "Published by: [Your company / name]",
          ], "wp-8"),
        ],
      },
      {
        title: "Research Findings",
        content: [
          h1("Detailed Findings", "wp-f1"),
          h2("Finding 1: [State the finding as a headline]", "wp-f2"),
          p("[Expand on this finding with 2-3 sentences. Add context, nuance, and what surprised you.]", "wp-f3"),
          p("[Specific data point]: [X%] of respondents reported [specific behavior/outcome].", "wp-f4"),
          h2("Finding 2: [State the finding as a headline]", "wp-f5"),
          p("[Expand on finding 2. What does the data show? What does it mean?]", "wp-f6"),
          ...bullet([
            "[Supporting data point 1]",
            "[Supporting data point 2]",
            "[Supporting data point 3]",
          ], "wp-f7"),
          h2("Finding 3: [State the finding as a headline]", "wp-f8"),
          p("[Expand on finding 3.]", "wp-f9"),
          h2("Finding 4: [State the finding as a headline]", "wp-f10"),
          p("[Expand on finding 4. This is often the most counterintuitive one — lead with the surprise.]", "wp-f11"),
          h2("What the Data Doesn't Show", "wp-f12"),
          p("Every dataset has limits. Ours is no exception. [Describe the limitations honestly — what this research can't tell us, and why.]", "wp-f13"),
        ],
      },
      {
        title: "Recommendations",
        content: [
          h1("What to Do With This", "wp-r1"),
          p("Research without action is just trivia. Here's how to apply these findings.", "wp-r2"),
          h2("For [Audience Segment 1]", "wp-r3"),
          ...numbered([
            "Start by [specific action 1]",
            "Then focus on [specific action 2]",
            "Measure success by tracking [specific metric]",
          ], "wp-r4"),
          h2("For [Audience Segment 2]", "wp-r5"),
          ...numbered([
            "[Recommendation 1 specific to this segment]",
            "[Recommendation 2 specific to this segment]",
            "[Recommendation 3 — the one most people skip]",
          ], "wp-r6"),
          h2("The 90-Day Action Plan", "wp-r7"),
          ...bullet([
            "Days 1–30: [Focus area and key action]",
            "Days 31–60: [Next phase and key action]",
            "Days 61–90: [Optimization phase and key action]",
          ], "wp-r8"),
          h2("Get Expert Help", "wp-r9"),
          p("[Your CTA. Offer a consultation, audit, or specific next step based on these findings.]", "wp-r10"),
        ],
      },
    ],
  },
  {
    id: "swipe-file",
    label: "Swipe File",
    description: "Collection of examples and templates",
    tabs: [
      {
        title: "Templates",
        content: [
          h1("[Topic] Swipe File — [Number] Ready-to-Use Templates", "sf-1"),
          p("Copy, adapt, and deploy. Every template here has been tested and has a clear track record. Change the parts in [brackets] to match your context.", "sf-2"),
          h2("Template 1: [Name / Use Case]", "sf-3"),
          p("Best for: [specific situation where this works well]", "sf-4"),
          p("---", "sf-5"),
          p("[Paste the full template here. Make it as complete as possible — include subject lines, body copy, CTAs, whatever is relevant for your context.]", "sf-6"),
          p("---", "sf-7"),
          p("Why it works: [1-2 sentences explaining the psychology or logic behind this template]", "sf-8"),
          h2("Template 2: [Name / Use Case]", "sf-9"),
          p("Best for: [specific situation]", "sf-10"),
          p("---", "sf-11"),
          p("[Full template text]", "sf-12"),
          p("---", "sf-13"),
          p("Why it works: [explanation]", "sf-14"),
          h2("Template 3: [Name / Use Case]", "sf-15"),
          p("Best for: [specific situation]", "sf-16"),
          p("---", "sf-17"),
          p("[Full template text]", "sf-18"),
          p("---", "sf-19"),
          p("Why it works: [explanation]", "sf-20"),
        ],
      },
      {
        title: "Real Examples",
        content: [
          h1("Real Examples That Worked", "sf-e1"),
          p("These are real examples — not mocked up, not cleaned up. Showing you exactly what performed so you can model it.", "sf-e2"),
          h2("Example 1: [Brief description]", "sf-e3"),
          p("Context: [Who sent/used this, what the goal was, what the result was]", "sf-e4"),
          p("---", "sf-e5"),
          p("[The actual example — paste verbatim if possible]", "sf-e6"),
          p("---", "sf-e7"),
          ...bullet([
            "What made it work: [specific element]",
            "What to steal: [specific thing to replicate]",
            "What to avoid: [specific thing that was risky or situational]",
          ], "sf-e8"),
          h2("Example 2: [Brief description]", "sf-e9"),
          p("Context: [Context]", "sf-e10"),
          p("---", "sf-e11"),
          p("[The actual example]", "sf-e12"),
          p("---", "sf-e13"),
          ...bullet([
            "What made it work: [element]",
            "What to steal: [thing to replicate]",
          ], "sf-e14"),
          h2("Patterns Across All Examples", "sf-e15"),
          p("After studying [X] examples, here's what shows up every time:", "sf-e16"),
          ...numbered([
            "[Pattern 1 — the most common trait of high performers]",
            "[Pattern 2 — the second most common]",
            "[Pattern 3 — the one that surprises most people]",
          ], "sf-e17"),
        ],
      },
    ],
  },
  {
    id: "blank",
    label: "Blank",
    description: "Start from scratch",
    tabs: [
      {
        title: "Introduction",
        content: [],
      },
    ],
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id);
}
