# coach-training-simulator
Coach Training Simulator
Context

Coach analyzes sales meetings after they happen.
It transcribes conversations, detects key sales markers, and provides structured feedback.

However, sales representatives currently have no way to train before their next meeting.

This project explores how Coach could evolve from a passive feedback tool into an active training platform.

Problem

Today:

sales-plan.json defines what a good sales meeting should look like (9 ordered markers).

meeting-details.json shows what actually happened (6/9 detected markers with scores).

Coach provides post-meeting analysis, but does not help sales reps practice beforehand.

User feedback:

"I want to train with Coach."

The question becomes:

How can we transform static feedback into an interactive training experience?

Proposed Solution

I built a lightweight Interactive Sales Training Simulator.

The simulator:

Loads the sales plan as the training blueprint.

Analyzes previous meeting performance.

Identifies missed or weak markers.

Guides the sales rep through a simulated conversation.

Evaluates responses in real time.

Provides structured feedback per marker.

This turns Coach into a continuous improvement engine, not just an analysis tool.

Product Thinking

Key design decisions:

1. Training is Adaptive

Markers are prioritized based on:

Missed markers in the last meeting

Low-scoring markers

Remaining steps

This ensures training focuses on real weaknesses.

2. The Sales Plan Becomes the Engine

The sales-plan.json is not just displayed.

It powers:

The simulation structure

The evaluation criteria

The progression logic

The plan becomes a programmable framework for skill development.

3. AI as a Simulation Layer

An LLM is used to:

Simulate realistic client responses

Evaluate the sales rep’s answers

Provide structured feedback

AI is not used as magic — it is constrained by the sales plan definitions.

Architecture Overview

High-level modules:

Sales Plan Loader → Loads and structures markers

Meeting Analyzer → Extracts completed vs missed markers

Training Engine → Orchestrates session flow

Simulation Layer → Generates client responses

Evaluation Layer → Scores and gives feedback

The system is intentionally simple and modular.

Technical Choices

Frontend: [Your chosen stack]

Backend: Lightweight API routes

Data: Provided JSON files (no database for MVP)

AI: LLM used for simulation and scoring

The goal was to prioritize clarity and product logic over infrastructure complexity.

What I Would Build With More Time

Voice-based simulation

Real-time coaching during live meetings

Progress tracking across sessions

Dashboard with skill radar chart

Multi-plan support

Team manager insights

How to Run
npm install
npm run dev


Add your OpenAI API key in .env.

Final Thoughts

This project is not just about building a feature.

It explores how Coach could evolve from:

Post-meeting feedback
to
Continuous sales performance training
