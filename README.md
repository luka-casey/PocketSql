PocketSQL API

PocketSQL API is a lightweight .NET 8 Web API for running SQL queries and exploring database schemas.

It’s designed for minimal setups like the Clockwork Pi uConsole, but works on any machine with .NET and MySQL.

Features
Execute SQL Queries
Supports SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, and more.

Fetch Database Schema
Lists all tables and columns in the current database.

Clean Query/Handler Pattern
Keeps controllers thin with reusable query handlers.

Consistent Response Format
All API responses include success/error handling.

Swagger UI
Easily test API endpoints in your browser.

CORS Ready
Works seamlessly with a Vite + React frontend.
