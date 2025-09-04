# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



- Which AI tools you used: Gemini! I was using the webapp instead of the CLI this time to avoid having the AI takeover the code and run with it!

- What you liked/didn't like about them: 

- Any lessons learned or interesting discoveries:

- How they helped (or hindered) your development process: T


AI Generated template:

Stacky Chatbot 🤖
A tiny, single-page chatbot UI built as a work sample for Return Stack. This web app provides a clean, responsive interface to chat with "Stacky," a cheerful AI software engineering intern. The project focuses on core frontend principles: state management, API integration, and creating a polished user experience.

✨ Live Demo
https://stacky-six.vercel.app/

Features Implemented
Real-time Chat: Send messages to the Stacky API and receive replies.

Message History: The full conversation is maintained and displayed, including sender roles and timestamps.

Enter-to-Send: Submit messages by pressing the Enter key or clicking the Send button.

Loading State: The input form is disabled and a "Stacky is typing..." indicator is shown while waiting for an API response.

Error Handling: Displays a friendly error message directly in the UI if the API call fails, allowing the user to try again.

Mobile-First Responsive Design: The layout is optimized for mobile devices and enhanced for a clean, centered view on desktops.

Keyboard Focus: The text input is automatically focused on page load for immediate use.

Technologies Used
Frontend: React

Build Tool: Vite

Styling: Plain CSS with a mobile-first approach

Deployment: Vercel (or Netlify/GitHub Pages)

Getting Started
Follow these instructions to get the project running on your local machine for development and testing purposes.

Prerequisites
You need to have Node.js (version 16 or later) and npm installed on your computer.

Installation & Running Locally
Clone the repository:

git clone [https://github.com/your-username/stacky-chatbot.git](https://github.com/your-username/stacky-chatbot.git)
cd stacky-chatbot

Install NPM packages:

npm install

Run the development server:

npm run dev

The application will be running at http://localhost:5173. The Vite development server will automatically reload the page when you make changes.

Building for Production
To create a production-ready build of the application, run the following command:

npm run build

This will create a dist folder in the project root, containing the optimized static files (HTML, CSS, and JavaScript) for deployment.

AI Tools Experience
For this project, I collaborated with Google's Gemini as my primary AI coding assistant. Here is a reflection on that experience:

What I liked:

Strategic Planning: The initial brainstorming was incredibly helpful. It laid out a clear, step-by-step game plan, which made the timeboxed nature of the project much less daunting.

Conceptual Explanations: When I ran into the inevitable CORS error, the assistant provided a clear analogy (the security guard) that helped me understand the "why" behind the problem, not just the "how" to fix it. This was far more valuable than just getting a code snippet.

Debugging Partner: When my messages weren't displaying, the AI suggested a methodical approach using console.log tracers. This helped me systematically pinpoint the bug (the leftover mock data) instead of guessing randomly.

What could be improved:

(Example:) The AI sometimes generated large blocks of code that needed minor corrections (like the missing curly brace in the CSS). While easy to fix, it highlighted the importance of always reviewing and understanding the generated code rather than blindly trusting it.

How it helped my development process:

The AI acted as a massive accelerator. It handled boilerplate like the initial Vite setup and a full CSS stylesheet, allowing me to focus my time and energy on the core React logic and state management. It also served as an instant "rubber duck," helping me debug issues faster than I would have on my own. It didn't replace my thinking but augmented it, especially when I was stuck.

If I Had One More Hour...
With an additional hour, I would focus on enhancing the user experience and robustness:

Persist Chat History: I would implement localStorage persistence. This would allow a user to refresh the page or close the tab and still have their conversation with Stacky saved, which is a standard feature in modern chat applications.

Add Message Animations: I would use CSS transitions to have new messages fade and slide into view. This small detail would make the chat feel more dynamic and polished.

Implement an Explicit Retry Button: Currently, the user can retry a failed message by resubmitting. I would improve this by showing a dedicated "Retry" button next to the error message that automatically re-sends the last failed message, providing clearer UX.