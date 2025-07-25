# PocketSql
PocketSQL API
A lightweight .NET 8 Web API that provides a simple HTTP interface for executing SQL queries and inspecting database schemas. Designed for embedded/portable devices like the Clockwork Pi uConsole, but works anywhere.

🚀 Features

✅ Run SQL Queries

Send SELECT, INSERT, UPDATE, DELETE, CREATE TABLE etc.

Returns JSON results or rows affected

✅ Inspect Database Schema

/api/sqlquery/schema returns all tables & columns in the connected database

✅ Clean Query/Handler Pattern

Controllers stay thin

Query handlers encapsulate all DB logic and error handling

✅ CORS + Swagger Ready

Works seamlessly with a React (Vite) frontend

Swagger UI for easy testing

