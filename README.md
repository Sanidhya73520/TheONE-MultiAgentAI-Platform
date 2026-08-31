# The ONE

## Multi-Agent AI Platform

The ONE is a multi-agent AI platform designed to handle different types of user requests through specialized AI agents for **web search, document retrieval, and code generation**.

The platform uses a dedicated router agent to analyze incoming queries and dynamically delegate them to the most appropriate specialized agent. It combines **LangGraph, LangChain, RAG, Qdrant, Redis, Docker, and AWS** to provide a scalable and context-aware AI workflow.

## Overview

Instead of relying on a single general-purpose AI workflow, The ONE follows a multi-agent architecture where each agent is responsible for a specific task.

```text
                         User Query
                             |
                             v
                      ┌──────────────┐
                      │ Router Agent │
                      └───────┬──────┘
                              |
             ┌────────────────┼────────────────┐
             |                |                |
             v                v                v
       ┌───────────┐   ┌──────────────┐   ┌──────────────┐
       │ Web Search│   │   Document   │   │    Code      │
       │   Agent   │   │  Retrieval   │   │  Generation  │
       └───────────┘   │    Agent     │   │    Agent     │
                       └──────┬───────┘   └──────────────┘
                              |
                              v
                       ┌─────────────┐
                       │   Qdrant    │
                       │ Vector Store│
                       └─────────────┘

                         ┌─────────┐
                         │  Redis  │
                         │  Memory │
                         └─────────┘



Key Features
Multi-Agent Architecture

The platform includes specialized agents for:

Web Search for retrieving information from the web
Document Retrieval for answering questions using indexed documents
Code Generation for programming and development-related requests
Router Agent for intelligently directing queries to the appropriate agent
Retrieval-Augmented Generation

The document retrieval workflow uses Retrieval-Augmented Generation (RAG) to provide relevant context to the AI before generating a response.

Documents
    |
    v
Processing & Embeddings
    |
    v
Qdrant Vector Database
    |
    v
Relevant Context
    |
    v
AI Agent
    |
    v
Generated Response


Documents
    |
    v
Processing & Embeddings
    |
    v
Qdrant Vector Database
    |
    v
Relevant Context
    |
    v
AI Agent
    |
    v
Generated Response


System Architecture

                         ┌──────────────┐
                         │     User     │
                         └──────┬───────┘
                                |
                                v
                     ┌────────────────────┐
                     │   Application UI   │
                     └─────────┬──────────┘
                               |
                               v
                     ┌────────────────────┐
                     │    Router Agent    │
                     │     LangGraph      │
                     └─────────┬──────────┘
                               |
             ┌─────────────────┼─────────────────┐
             |                 |                 |
             v                 v                 v
      ┌────────────┐   ┌──────────────┐   ┌──────────────┐
      │ Web Search │   │   Document   │   │     Code     │
      │    Agent   │   │  Retrieval   │   │  Generation  │
      └────────────┘   │    Agent     │   │    Agent     │
                       └──────┬───────┘   └──────────────┘
                              |
                              v
                       ┌─────────────┐
                       │   Qdrant    │
                       │ Vector Store│
                       └─────────────┘

                              +
                       ┌─────────────┐
                       │    Redis    │
                       │ Memory /    │
                       │ Rate Limit  │
                       └─────────────┘
                              |
                              v
                       ┌─────────────┐
                       │   Docker    │
                       └──────┬──────┘
                              |
                              v
                 ┌─────────────────────────┐
                 │          AWS            │
                 │ ECS + S3 + CloudFront   │
                 └─────────────────────────┘

Author

Sanidhya Kamthan

Computer Science Engineering
