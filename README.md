# 🎥 Stage Stream Backend

**Backend Project for Stage Stream:** An all-in-one zero-latency streaming solution built on MediaMTX.

---

## 🚀 **Setup**

Follow the [Setup Guide](https://stagestream.jxnxsdev.me/setup) for detailed instructions.

---

## 🔧 **Building the Project (Developement)**

### Requirements:

- **NodeJS**: Version 20 or newer
- **TypeScript**

### Steps:

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Build the Project**:  
   Run the TypeScript compiler:

   ```bash
   npm tsc
   ```

   To enable watch mode for automatic rebuilds:

   ```bash
   npm tsc -w
   ```

3. **Start the Server**:  
   After building, navigate to the `/build` directory and start the server:
   ```bash
   node build
   ```

---

## ⚙️ **Environment Variables and Configuration**

There are two ways to configure the environment:

1. **Edit the `defaults.json` file**: Located in the `src/` directory.
2. **Set Environment Variables**: Use your system or `.env` file.

### Supported Environment Variables:

#### General Settings

| Variable       | Description                             |
| -------------- | --------------------------------------- |
| **WEB_PORT**   | Port for the Express server to bind to. |
| **JWT_SECRET** | Secret for JSON Web Tokens.             |

#### Database Configuration

| Variable           | Description                                          |
| ------------------ | ---------------------------------------------------- |
| **USE_MYSQL**      | Enable MySQL (`true` for MySQL, `false` for SQLite). |
| **MYSQL_HOST**     | Host IP or domain for the MySQL database.            |
| **MYSQL_USER**     | Username for MySQL login.                            |
| **MYSQL_PASSWORD** | Password for the MySQL user.                         |
| **MYSQL_DATABASE** | Database name in MySQL.                              |
| **SQLITE_PATH**    | Filepath for the SQLite database.                    |
| **SQLITE_FILE**    | Filename for the SQLite database.                    |

#### Admin Credentials

| Variable           | Description                     |
| ------------------ | ------------------------------- |
| **ADMIN_USERNAME** | Username for the admin account. |
| **ADMIN_PASSWORD** | Password for the admin account. |

#### Logging and Media Configuration

| Variable      | Description              |
| ------------- | ------------------------ |
| **LOG_PATH**  | Filepath for log files.  |
| **VIDEO_URL** | URL where MediaMTX runs. |
| **VIDEO_API** | URL for MediaMTX's API.  |

#### Frontend Configuration

| Variable          | Description                       |
| ----------------- | --------------------------------- |
| **FRONT_END_URL** | URL where the frontend is hosted. |

---

## 📂 **Output**

The compiled project will be placed in the `/build` folder. You can start the server directly from there.

---

This ensures the table is clear and the README stays fully enclosed within the code block. Let me know if you need further changes!
