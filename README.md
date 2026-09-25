# AI Work Companion

Build a modern responsive SaaS web app called **AI Workplace Productivity Assistant**.

Create a **frontend-only application with no backend, database, authentication, or external API setup**. Use the AI capabilities available in the Lovable environment to generate responses dynamically.

### Design

* Clean, modern, professional SaaS aesthetic
* Colour palette: **dusty pink + ivory**, with dark brown/charcoal text
* Rounded cards, subtle shadows, elegant spacing and modern typography
* Fully responsive for desktop, tablet and mobile
* Left sidebar navigation with icons:

  * Dashboard
  * Smart Email
  * Meeting Notes
  * Task Planner
* Add a simple profile/settings area

### Dashboard

Create a welcoming dashboard with:

* “Good morning 👋”
* Short productivity overview
* Three feature cards:

  1. Smart Email Generator
  2. Meeting Notes Summarizer
  3. AI Task Planner
* Recent activity section
* Quick-action buttons

### Smart Email Generator

Create a form with:

* Email purpose
* Recipient/audience
* Key points
* Desired outcome
* Tone: **Formal, Friendly, Persuasive**
* Length: Concise, Standard, Detailed

Generate a **unique AI-written professional email based on the user's inputs**, not placeholder/generic text.

The generated email must be:

* Editable
* Copyable
* Regeneratable
* Clearly structured with subject and body

Use this prompt structure internally:
“You are a professional workplace communication assistant. Write an email using the user's purpose, audience, key points, desired outcome, tone and length. Do not invent facts. Produce clear, professional workplace communication.”

### Meeting Notes Summarizer

Provide a large text area where users can paste lengthy meeting notes.

Generate an AI response containing:

* **Meeting Summary**
* **Key Decisions**
* **Action Items**
* **Deadlines**
* **Follow-ups**

The output must be based specifically on the user's notes, editable, copyable and regeneratable.

Prompt structure:
“You are a workplace meeting assistant. Analyse the provided meeting notes and identify the main discussion points, decisions, action items, responsible people and deadlines. Do not invent information. Clearly separate confirmed information from missing information.”

### AI Task Planner

Allow users to enter:

* Goal
* Tasks
* Deadline
* Available working hours
* Priority

Let users choose **Daily** or **Weekly** planning.

Generate an AI-created schedule that:

* Prioritises tasks
* Organises tasks logically
* Allocates realistic time blocks
* Identifies urgent tasks
* Includes deadlines
* Explains prioritisation briefly

Make every generated task editable and allow users to mark tasks complete.

Prompt structure:
“You are an AI productivity planner. Organise the user's tasks into a realistic daily or weekly schedule based only on the information provided. Prioritise tasks according to urgency, importance and deadlines. Do not invent deadlines or commitments.”

### AI Output Experience

All AI results must appear in attractive editable cards.

Include:

* Edit
* Copy
* Regenerate
* Save locally

Use **localStorage only** for saved outputs/preferences. Do not create a backend.

### Responsible AI

Display this disclaimer below AI-generated content:

“AI-generated content may contain errors or omissions. Review and verify important information before using it. You remain responsible for final decisions and workplace communications.”

### Important

Do not create a backend, database, authentication system, payment system or unnecessary integrations.

Do not use static placeholder responses. The three tools must produce **dynamic AI-generated outputs based on the user's actual input**.

Prioritise a polished, functional MVP with excellent UX, responsive design and the dusty-pink-and-ivory visual identity.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fe8dd54d-b594-43fb-91cd-483de71e0daa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
