# -Chatbot-with-Memory-Local-RAG-React-LocalStorage-
This project is a lightweight AI-style chatbot built entirely on the frontend. It lets you upload any text (product descriptions, specs, notes, guides, manuals), stores them locally as a knowledge base, and answers your questions by pulling only the relevant lines—not the entire document.
🚀 What the App Does

Here’s the simple idea.

Your chatbot normally forgets everything.
This one doesn’t.

You paste information into the Knowledge Base, and the model uses a local retrieval layer to answer questions intelligently.

The flow is:

You upload any text (product specs, docs, facts).

The app stores it in LocalStorage.

When you ask a question:

It breaks the documents into sentences

Scores them based on how closely they match your query

Picks the best ones

Summarizes them into a natural answer

You get answers that are short, clean, and directly based on your documents.

✨ Key Features
🧠 Local Memory

Everything you upload stays available across sessions using LocalStorage.

📄 Add Unlimited Documents

Each document gets stored with:

A title

Content

Timestamp

You can view, delete, or clear them anytime.

🔍 RAG-style Retrieval

The app:

Breaks your docs into sentences

Scores them based on your question

Picks the most relevant ones

Creates a concise answer instead of dumping whole text

💬 Chat Interface

A chat-like UI with:

Typing indicator

User + assistant bubbles

“Used knowledge base” badge for transparency

🎯 Smart Summaries

Price questions return only the price.
Battery questions return only battery details.
Underwater questions return only waterproof depth.

📦 Zero Backend

Everything runs in your browser.
Perfect for demos and local AI apps.

🛠 Tech Stack

React

Next.js App Router

TailwindCSS

Lucide Icons

LocalStorage

No server

No database

No APIs

🧪 How to Use

Go to the sidebar.

Click the red Upload button.

Paste product text / notes / descriptions / PDFs converted to text.

Ask questions like:

"what is the price"

"how deep can it go underwater"

"what is the battery life"

"what are the key features"

The chatbot answers using only the relevant parts of your docs.
⚙️ How It Works (Short Version)

Retrieval
Each document is split into sentences.
Each sentence is scored by matching keywords from your query.

Summarization
Special rules make common queries more accurate:

"price" → extract only currency

"battery" → compress battery info

"underwater" → simplify depth line

Final Output
You get one clean answer, not a block dump.
