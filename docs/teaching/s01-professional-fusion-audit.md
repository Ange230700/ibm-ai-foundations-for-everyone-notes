# S01 Professional Fusion Audit

## Status

- **Session:** S01 — Understanding AI / Comprendre l’IA
- **Current duration:** 60 minutes
- **Current slide count:** 30 per language
- **Target duration:** 60 minutes
- **Target slide count for first fusion refactor:** 30 per language
- **Audience:** professionals and learners with no technical prerequisite
- **Parent curriculum contract:** `ai-for-everyone-professional-curriculum.md`
- **Implementation state:** audit only; no S01 teaching source has been modified yet.

## 1. Refactor objective

Refactor S01 so that it remains a rigorous and accessible introduction to artificial intelligence
while making professional relevance visible from the beginning of the session.

The refactor must not simply add workplace material to the existing 60-minute session.

It should redistribute emphasis:

- preserve the essential AI mental model;
- reduce projected technical density where deeper detail can live in presenter notes or reference material;
- introduce capabilities and limitations earlier;
- teach learners how to judge whether an AI tool fits a professional need;
- broaden transfer beyond the fictional cocoa cooperative;
- preserve explicit human responsibility;
- end with professional transfer rather than recall alone.

## 2. Current strengths to preserve

Preserve the following characteristics of the existing S01:

- IBM/Coursera source attribution and AI-generation disclosure;
- 60-minute instructor-led format;
- bilingual structural alignment;
- fictional cocoa cooperative near Soubré as the continuous anchor case;
- accessible definition of artificial intelligence;
- augmented-intelligence and human-responsibility framing;
- predictive versus generative AI distinction;
- machine-learning foundations;
- deep learning at an appropriate conceptual level;
- foundation models and large language models;
- the cooperative sequence linking operational problem, AI technique, workflow and human decision;
- measurable business-use framing;
- generative-AI risk;
- fairness, accountability and human oversight;
- practical governance.

## 3. Content to compress or progressively disclose

### AI capability labels

ANI, AGI and ASI may remain, but the projected lesson should emphasize the practical distinction:

> Current AI may appear broadly capable while still operating with important limitations.

The labels are secondary to that professional understanding.

### Evolution of AI systems

Retain the progression from explicit rules to learned models and generative systems without turning
the slide into a historical taxonomy lesson.

### Machine-learning modes

Supervised, unsupervised and reinforcement learning remain useful reference concepts.

The live session should emphasize that different problems, data and expected outcomes require
different approaches.

Detailed distinctions may move to presenter notes.

### Neural networks and deep learning

Retain the conceptual relationship between neural networks, deep learning and modern AI.

Avoid mathematical or implementation detail that is unnecessary for a non-technical professional.

### Language, speech, vision and multimodality

Present these primarily as capabilities a professional may encounter.

Terminology follows the practical capability instead of leading it.

### Infrastructure

The Soubré case requires discussion of intermittent connectivity and local continuity.

Cloud, edge and IoT terminology should receive only the depth needed to understand that operational
constraint.

### Agents

Introduce agents and automation without treating agent design as an S01 mastery objective.

### Retrieval-Augmented Generation

Frame the topic first as a professional question:

> How can an assistant work from approved company documents rather than relying only on its general
> model knowledge?

Introduce the term Retrieval-Augmented Generation only after that problem is clear.

## 4. Professional elements to strengthen

### Capabilities and limitations

S01 should explicitly distinguish common useful capabilities from common failure modes early in the
session.

Learners should understand that a fluent or plausible response is not automatically correct.

### Tool selection

S01 should give learners a simple way to examine an AI tool before using it for work.

Questions should include:

- What task must be completed?
- Does the tool need to draft, analyze, or consult documents?
- What information would need to be provided?
- Is that information sensitive or restricted?
- Does the result require verification or approval?
- Is the tool authorized for the intended professional context?

### Transfer across professions

The cocoa cooperative remains the anchor case.

Short transfer examples should also make the lesson recognizable in contexts such as:

- administration;
- customer service;
- entrepreneurship;
- finance;
- human resources;
- operations;
- project management;
- sales.

No learner should need knowledge of cocoa production to understand the lesson.

### Confidentiality

S01 should establish the habit of asking whether information is authorized for use with an AI tool
before convenience or speed is considered.

The dedicated treatment remains in S06.

### Professional transfer check

The final S01 activity should combine knowledge checking with three transfer questions:

```text
WHAT DID I LEARN?
WHERE COULD I USE IT?
WHAT MUST I CHECK BEFORE I USE IT?
```

## 5. Proposed 30-slide structure

|   # | Proposed topic                                      | Treatment                                 |
| --: | --------------------------------------------------- | ----------------------------------------- |
|  01 | AI Foundations for Everyone                         | Keep                                      |
|  02 | What you will be able to do                         | Reframe professionally                    |
|  03 | Where could AI help at work?                        | Broaden opening and introduce anchor case |
|  04 | What is artificial intelligence?                    | Keep                                      |
|  05 | AI supports human work                              | Keep                                      |
|  06 | What AI can do — and where it can fail              | New fusion emphasis                       |
|  07 | Predictive versus generative AI                     | Keep                                      |
|  08 | From rules to learned models                        | Compress                                  |
|  09 | Machine learning                                    | Keep                                      |
|  10 | How machines learn from examples                    | Compress machine-learning modes           |
|  11 | Deep learning without the mathematics               | Simplify                                  |
|  12 | Foundation models and LLMs                          | Keep                                      |
|  13 | Text, images, audio and multimodal AI               | Merge capability framing                  |
|  14 | What conversational AI actually knows               | Reframe limitations and context           |
|  15 | Choosing an AI tool for the job                     | New professional skill                    |
|  16 | AI across everyday professions                      | New transfer emphasis                     |
|  17 | Cooperative: problem and available data             | Refine                                    |
|  18 | Cooperative: match task to AI capability            | Keep                                      |
|  19 | Cooperative: working with intermittent connectivity | Keep                                      |
|  20 | Cooperative: what AI may and may not decide         | Keep                                      |
|  21 | From an AI idea to a bounded use case               | Refine                                    |
|  22 | Generative AI in everyday work                      | Broaden                                   |
|  23 | Agents and automation                               | Keep introductory                         |
|  24 | When AI needs approved documents                    | Reframe RAG                               |
|  25 | Adoption requires people, data and rules            | Keep                                      |
|  26 | What information can I safely provide?              | Strengthen confidentiality                |
|  27 | Errors, hallucinations and other risks              | Strengthen                                |
|  28 | Fairness, accountability and oversight              | Keep                                      |
|  29 | Practical governance: who checks what?              | Reframe                                   |
|  30 | Learn → use → check                                 | Professional transfer check               |

## 6. S01 scope boundary

S01 introduces professional AI literacy.

It does not attempt to teach:

- detailed prompt engineering;
- complete prompt templates;
- advanced generative-AI production workflows;
- deep agent design;
- implementation-level machine learning;
- formal security governance;
- the final end-to-end professional workflow.

Those topics remain available to later sessions.

The full five-question operating framework:

```text
RESULT → CONTEXT → INSTRUCTION → SAFETY → VERIFICATION
```

should be reinforced progressively across the program rather than taught as an isolated S01
framework.

## 7. Implementation order

The S01 fusion should proceed in this order:

1. approve this audit;
2. revise the bilingual S01 60-minute content contract;
3. update the French and English teaching Markdown together;
4. update affected visuals;
5. update tests if the approved contract changes their expectations;
6. regenerate PDF and PPTX derivatives;
7. run semantic and visual verification;
8. regenerate animated PowerPoint copies;
9. perform bilingual human review;
10. rehearse the 60-minute delivery.

No generated artifact should be treated as authoritative over the approved Markdown sources and
content contract.
