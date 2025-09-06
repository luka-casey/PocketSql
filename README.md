# PocketSQL API

PocketSQL is a lightweight, keyboard-first web UI + API for running SQL queries.
It was created for minimal systems (think: ClockworkPi **uConsole** on **ARM64**) where heavy tools like MySQL Workbench or SSMS are too big or mouse-driven. It works just as well on any machine that can run .NET and MariaDB/MySQL.

PocketSQL focuses on:

* Small-screen-friendly UI
* Keyboard-first workflow (useful when the mouse is limited)
* Lightweight footprint for ARM64 devices

---

## Features

* Run ad-hoc SQL queries against MariaDB / MySQL
* Simple, responsive UI designed for small screens
* Keyboard shortcuts and minimal mouse dependence
* Bulky desktop DB tools not required

---

## Prerequisites

* [.NET SDK (7+)](https://dotnet.microsoft.com/download)
* [Node.js (LTS)](https://nodejs.org/)
* MariaDB or MySQL (server accessible to the app)

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

## Configuration

Configure your database connection in the backend configuration (e.g. `appsettings.json` or environment variables). Example `appsettings.json` snippet:

```json
{
  "ConnectionStrings": {
    "Default": "Server=127.0.0.1;Port=3306;Database=mydb;User=myuser;Password=mypassword;"
  }
}
```

Make sure your MariaDB/MySQL server is running and accessible from the machine where the PocketSQL API runs.

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

Add a `LICENSE` file for your preferred license (MIT is a common choice).

---

## A note

This project started as a personal tool to get a compact, keyboard-friendly SQL UI running on the ClockworkPi uConsole. If you find it useful, drop a star ⭐ and feedback is welcome!

---

If you want, I can:

* Add a quick table of keyboard shortcuts,
* Draft `appsettings.Development.json` and `.env` examples,
* Or format this as a GitHub README file ready to paste into your repo. Which would you like?
