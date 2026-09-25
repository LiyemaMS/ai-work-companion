# AI Workplace Productivity Assistant

## Project Overview

**AI Workplace Productivity Assistant** is a modern, responsive SaaS-style web application designed to help professionals automate common workplace tasks using AI.

The application provides three core productivity tools:

* **Smart Email Generator** – creates professional emails based on user input and selected communication tone.
* **Meeting Notes Summarizer** – converts lengthy meeting notes into concise summaries while identifying decisions, action items and deadlines.
* **AI Task Planner** – organises tasks into daily or weekly schedules and prioritises them based on urgency, importance and deadlines.

The application was designed with a clean, professional interface using a **dusty pink and ivory colour palette**.

This project is **frontend-only** and does not require a backend or database.

---

## Features Implemented

### 📧 Smart Email Generator

* Generate professional workplace emails using AI.
* Supports three communication tones:

  * Formal
  * Friendly
  * Persuasive
* Users can provide:

  * Email purpose
  * Recipient/audience
  * Key points
  * Desired outcome
  * Preferred length
* AI-generated emails are editable.
* Copy and regenerate functionality.
* Structured AI prompt designed to avoid inventing information.

### 📝 Meeting Notes Summarizer

* Allows users to enter lengthy meeting notes.
* AI analyses the provided information.
* Generates:

  * Meeting summary
  * Key decisions
  * Action items
  * Deadlines
  * Follow-up points
* Generated content can be edited.
* Copy and regenerate functionality.
* Designed to distinguish between information provided by the user and information that is unavailable.

### ✅ AI Task Planner

* Create productivity plans using AI.
* Supports:

  * Daily schedules
  * Weekly schedules
* Users can provide goals, tasks, deadlines, working hours and priorities.
* AI organises tasks according to urgency, importance and deadlines.
* Generates structured time blocks.
* Tasks can be edited and marked as completed.

### 🎨 Modern SaaS Dashboard

* Responsive dashboard design.
* Sidebar navigation.
* Clean card-based interface.
* Dusty pink and ivory colour scheme.
* Responsive desktop, tablet and mobile layouts.
* Quick-access feature cards.
* Recent activity section.
* Consistent interface across all productivity tools.

### 🤖 Responsible AI

The application includes a responsible AI disclaimer informing users that AI-generated information may contain errors or omissions and should be reviewed before use.

> **AI-generated content may contain errors or omissions. Review and verify important information before using it. You remain responsible for final decisions and workplace communications.**

### 💾 Local Storage

The application uses browser `localStorage` where appropriate for saving user preferences and outputs.

No external database is required.

---

## Technologies and Tools Used

### Frontend

* **React** – application interface and component architecture
* **TypeScript** – type-safe development
* **HTML5** – application structure
* **CSS / Tailwind CSS** – responsive styling and UI design
* **JavaScript** – application functionality

### AI

* AI-powered structured prompts for:

  * Email generation
  * Meeting summarisation
  * Task planning
* User inputs are incorporated into prompts to generate context-specific responses.

### Development Tools

* **Lovable** – application development and UI generation
* **GitHub** – source-code management and project hosting
* **Vite** – frontend development and build tooling
* **Browser localStorage** – local persistence without a backend

---

## Project Structure

```text
AI-Workplace-Productivity-Assistant/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/ai-workplace-productivity-assistant.git
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Navigate to the Project

```bash
cd ai-workplace-productivity-assistant
```

### 3. Install Dependencies

Make sure you have **Node.js** installed.

Then run:

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will start on a local development URL, usually:

```text
http://localhost:5173
```

Open the URL in your browser to use the application.

### 5. Build for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Usage

### Generate an Email

1. Open **Smart Email** from the sidebar.
2. Enter the purpose and key points of the email.
3. Select a tone:

   * Formal
   * Friendly
   * Persuasive
4. Select the desired length.
5. Generate the email.
6. Review and edit the AI-generated content.
7. Copy or save the final email.

### Summarise Meeting Notes

1. Open **Meeting Notes**.
2. Paste or enter your meeting notes.
3. Select the summarisation option.
4. Generate the AI summary.
5. Review:

   * Summary
   * Decisions
   * Action items
   * Deadlines
   * Follow-ups
6. Edit or copy the results as required.

### Create a Task Plan

1. Open **Task Planner**.
2. Enter your goal and tasks.
3. Add deadlines and available working hours.
4. Select **Daily** or **Weekly**.
5. Generate the AI plan.
6. Review and edit the suggested schedule.
7. Mark completed tasks as finished.

---

## Responsible AI

This application is intended as a productivity aid rather than a replacement for professional judgement.

Users should:

* Verify important information.
* Review AI-generated workplace communications before sending them.
* Confirm deadlines, decisions and action items against the original meeting information.
* Avoid entering confidential or sensitive workplace information unless the environment is approved for that information.
* Treat AI-generated recommendations as suggestions rather than authoritative decisions.

---

## Project Goals

The project aims to demonstrate how AI can be incorporated into everyday professional workflows to:

* Reduce repetitive administrative work.
* Improve workplace communication.
* Make meeting information easier to understand.
* Improve task organisation and prioritisation.
* Provide professionals with an intuitive AI productivity workspace.

---

## Future Improvements

Potential future enhancements include:

* Calendar integration.
* Email platform integration.
* User authentication.
* Cloud-based saved outputs.
* Team collaboration.
* Custom AI prompt templates.
* Advanced task analytics.
* Exporting meeting summaries and task plans.
* Additional communication tones and languages.

---

## License

This project is intended for educational and demonstration purposes.
