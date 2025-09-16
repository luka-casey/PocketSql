# PocketSQL

PocketSQL is a lightweight, keyboard-first web UI + API for running SQL queries.
It was created for minimal systems (think: ClockworkPi **uConsole** on **ARM64**) where heavy tools like MySQL Workbench or SSMS are too big or mouse-driven. It works just as well on any machine that can run .NET and MariaDB.

* [Featured on the ClockWorkPi Forum](https://forum.clockworkpi.com/t/pocketsql-a-lightweight-and-keyboard-focused-sql-editor-for-uconsole/19664)
<img width="1401" height="729" alt="Screenshot 2025-09-16 at 10 04 58 AM" src="https://github.com/user-attachments/assets/443803ac-1a4d-4cf2-b8f2-b9dda065f3d8" />

PocketSQL focuses on:

* Small-screen-friendly UI
* Keyboard-first workflow
* Lightweight footprint for ARM64 devices

---

## Features

* Run ad-hoc SQL queries against MariaDB
* Simple, responsive UI designed for small screens
* Keyboard shortcuts and minimal mouse dependence
* Bulky desktop DB tools not required

---

## Prerequisites

* [.NET SDK (7+)](https://dotnet.microsoft.com/download)
* [Node.js (LTS)](https://nodejs.org/)
* [MariaDB](https://share.google/k0Jm3wmPyrY4hBMsu)

---

## Installation

1. Clone the repo

```bash
git clone https://github.com/luka-casey/PocketSql
cd PocketSql
```

2. Backend: restore .NET dependencies

```bash
cd PocketSqlApi
dotnet restore
```

3. Frontend: install npm dependencies

```bash
cd ../PocketSqlUI
npm install
```

---

## Configuration

Configure your database connection by creating appsettings.json - Create in PocketsqlApi/configuration 

```json
{
  "ConnectionStrings": {
    "Default": "Server=127.0.0.1;Port=3306;Database=mydb;User=myuser;Password=mypassword;"
  }
}
```

Make sure your MariaDB server is running and accessible from the machine where the PocketSQL API runs.

---

## Run (development)

Run the backend and frontend in separate terminals:

* Backend

```bash
cd PocketSqlApi
dotnet run
```

* Frontend

```bash
cd PocketSqlUI
npm run dev
```

The frontend dev server will proxy requests to the API (check `PocketSqlUI` config if you need to change ports).

---

## Build / Production

* Build the backend:

```bash
cd PocketSqlApi
dotnet publish -c Release -o ./publish
```

* Build the frontend:

```bash
cd PocketSqlUI
npm run build
```

(Serve the built frontend from a static host or configure the API to serve the built files.)

---

## Troubleshooting

* If the frontend can’t reach the API: check ports, proxy settings, and CORS configuration.
* If queries fail: verify your DB connection string and that the DB user has the required privileges.
* On ARM64 devices: ensure you installed an ARM64-compatible .NET runtime and Node build for your platform.

---

## Contributing

Want to help? Great! Open an issue or send a PR. Suggestions for:

* Better keyboard shortcuts
* Smaller-screen UX improvements
* Improved ARM64 packaging / binaries

---

## License



---

## A note

This project started as a personal tool to get a compact, keyboard-friendly SQL UI running on the ClockworkPi uConsole. If you find it useful, drop a star ⭐ and feedback is welcome!

---
