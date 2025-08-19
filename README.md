# ChatBot

<div align="center">
  <img src="./images/preview.png" alt="ChatBot preview" width="1200" />
</div>

**ChatBot** is an open-source, production-oriented chatbot reference implementation inspired by modern conversational UIs such as ChatGPT and Gemini. It demonstrates a modular architecture, session management, persistent storage, and third-party API integrations (Discord OAuth2, Google Gemini, GROQ). Use this repository to learn, prototype, or extend a real-world chatbot architecture.

For a live working example, visit: [https://chat.admibot.xyz](https://chat.admibot.xyz)

---

## Key features

* Modular, production-style code organization
* User sessions with persistent storage
* Discord OAuth2 login support
* Google Gemini API integration
* GROQ integration
* CDN hooks for custom user icons
* Deployment & tunnel guides (Cloudflare Tunnels)
* Production-ready patterns for experimentation and learning

---

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Project setup](#project-setup)
3. [Environment variables (`.env.local`)](#environment-variables-envlocal)
4. [Configuration (`public/config.yml`)](#configuration-publicconfigyml)
5. [MongoDB: step-by-step](#mongodb-step-by-step)
6. [Google Gemini API key](#google-gemini-api-key)
7. [GROQ API key](#groq-api-key)
8. [Discord OAuth2 setup](#discord-oauth2-setup)
9. [Install, build & run](#install-build--run)
10. [Cloudflare Tunnel (Zero Trust) — quick guide](#cloudflare-tunnel-zero-trust---quick-guide)
11. [Notes, security & best practices](#notes-security--best-practices)
12. [Support / More projects](#support--more-projects)

---

## Prerequisites

* Recommended OS: **Ubuntu / Debian** (Windows can be used but requires additional build tools for Next.js).
* Node.js: **v20 or v21** (use `node -v` to confirm).
* A domain added to Cloudflare (required if you plan to expose your local instance via Cloudflare Tunnels).
* A MongoDB Atlas account (or any MongoDB instance reachable from your server).
* Accounts/keys for Google Gemini and GROQ (see sections below).
* A Discord Application for OAuth2 (see section below).

---

## Project setup

### 1. Clone the repository

```bash
git clone https://github.com/HasenDev/ChatBot.git
cd ChatBot
```

### 2. Create and populate environment variables

Create `.env.local` in the project root and add the variables listed in the next section. Keep this file private — **do not** commit it to source control.

---

## Environment variables (`.env.local`)

Create `.env.local` with the following content (replace placeholder values with your credentials):

```env
# Discord Application client ID (replace with your own)
DISCORD_CLIENT_ID=00000000000000

# Discord application client Secret (replace with your own)
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Secret for NextAuth authentication (replace with a strong random string)
NEXTAUTH_SECRET=replace_with_a_strong_random_secret

# URL where your Next.js app is hosted (e.g. https://chat.example.com)
NEXTAUTH_URL=https://ex.com

# MongoDB connection string (replace with your own credentials)
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"

# Discord bot token (replace with your bot's token)
DISCORD_BOT_TOKEN="your_discord_bot_token_here"

# Google Gemini API key (replace with a valid key from Google Gemini Studio)
GEMINI_API_KEY=replace_with_google_api_key

# GROQ API key for querying your headless CMS (replace with a valid key from https://console.groq.com/playground)
GROQ_API_KEY=replace_with_groq_api_key

# --------------------------------------------------------
# CDN feature: used for uploading custom user icons in settings.
# These are placeholders. Implement your own CDN endpoint or modify lib/UploadCDN.ts.
# --------------------------------------------------------

# CDN upload URL (placeholder)
CDN_UPLOAD_URL=https://cdn.admibot.xyz

# Secret key for CDN uploads (placeholder)
CDN_SECRET_KEY=replace_with_your_own_secret_key
```

**Important:** Use a strong random `NEXTAUTH_SECRET` (e.g., `openssl rand -hex 32`) and never share your `.env.local` publicly.

---

## Configuration (`public/config.yml`)

Edit `public/config.yml` to set branding and static site values:

```yml
siteName: "ChatBot" # Replace with your ChatBot name
iconPath: "https://your.cdn/path/to/icon.webp"
```

Example:

```yml
siteName: "ChatBot by AdmiBot"
iconPath: "https://cdn.example.com/icons/chatbot-300x300.webp"
```

---

## MongoDB — step-by-step

1. Sign in to MongoDB Cloud ([https://cloud.mongodb.com/](https://cloud.mongodb.com/)) and create a project.

<div align="left">
  <img src="./images/new_project.png" alt="MongoDB - New Project" width="500" />
</div>

2. Inside the project click **Create Cluster** → choose **Free Tier** (or another cluster type).

<div align="left">
  <img src="./images/create-cluster.png" alt="MongoDB - Create Cluster" width="500" />
</div>

3. Configure and create the cluster. Wait until the cluster shows **Running**.

<div align="left">
  <img src="./images/creating-cluster.png" alt="MongoDB - Creating Cluster" width="500" />
</div>

4. Click **Connect** for the cluster and follow the steps:

* Create a **database user** (username + password) and note them.
* Under **Network Access** add your IP (or allow access from anywhere while testing — **not** recommended for production).
* Choose **Connect your application** and copy the connection string (select the Node.js driver).

Each step screenshot is shown below.

<div align="center">
  <img src="./images/step-1-creating.png" alt="MongoDB - Step 1" width="500" />
</div>

<div align="center">
  <img src="./images/step-2-creating.png" alt="MongoDB - Step 2" width="500" />
</div>

<div align="center">
  <img src="./images/step-3-creating.png" alt="MongoDB - Step 3" width="500" />
</div>

5. Paste the connection string into `MONGODB_URI` in `.env.local` and replace `<username>`, `<password>`, and `<dbname>`.

---

## Google Gemini API key

1. Visit Google Gemini Studio (e.g., [https://aistudio.google.com/](https://aistudio.google.com/)) and sign in to your Google account.
2. Create or select a Google Cloud project.
3. Generate an API key (follow the UI: **Get API Key** → **Create API Key**).
4. Restrict the API key (recommended): restrict by IP and API usage in Google Cloud Console.
5. Put the key into `GEMINI_API_KEY` in `.env.local`.

---

## GROQ API key

1. Log in to GROQ Console ([https://console.groq.com/playground](https://console.groq.com/playground)).
2. Go to **API Keys** → **Create API Key**, name it, complete any required CAPTCHAs, then create.
3. Copy the generated key into `GROQ_API_KEY` in `.env.local`.
4. Now you can use models like ChatGPT-OSS, DeepSeek and LLama

---

## Discord OAuth2 setup

1. Open the Discord Developer Portal ([https://discord.com/developers/applications](https://discord.com/developers/applications)) and log in.
2. Create a **New Application**, name it and save.
3. In OAuth2 settings:

   * Copy **Client ID** → set `DISCORD_CLIENT_ID` in `.env.local`.
   * Click **Reset Secret** (or **Client Secret**) → copy and set `DISCORD_CLIENT_SECRET` in `.env.local`.
4. Add **Redirect URI** for NextAuth:

```
https://yourappdomain.com/api/auth/callback/discord
```

5. Set `NEXTAUTH_URL` to the public URL of your app and use a secure `NEXTAUTH_SECRET`.

---

## Install, build & run

Ensure Node.js v20/21 is installed.

```bash
# Install dependencies
npm install

# Build the Next.js app
npm run build

# Start the server (default port used by this project shown below)
npm run start
```

By default the application serves on **port 9700**. Visit `http://localhost:9700` to verify.
If you change the port in your runtime configuration, update any tunneling or reverse-proxy settings accordingly.

---

## Cloudflare Tunnel (Zero Trust) — quick guide

> This guide shows how to expose a local instance through Cloudflare Zero Trust Tunnels (`cloudflared`). It assumes you have a domain added to your Cloudflare account.

1. Sign in to your Cloudflare account at [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. In the left sidebar scroll and click **Zero Trust**.
3. Once Zero Trust loads, click **Network** in the Zero Trust sidebar.
4. Select **Tunnels** → **Create a Tunnel** (or **New Tunnel**).
5. Choose Cloudflare (the UI option to create a new tunnel), then select your operating system and architecture when prompted.
6. Cloudflare will display a generated install command for `cloudflared`. Run that command on your server to install `cloudflared`.
7. After installation, Cloudflare will show a service install command that looks like:

```text
sudo cloudflared service install eyJhIjoiNm.....
```

Execute the `sudo cloudflared service install ...` command on your server. This registers the tunnel as a system service and starts it.

8. Click **Next** in the Cloudflare UI. You will be prompted to create a hostname. Provide:

* **Hostname:** the subdomain you want, e.g. `chat.example.com`
* **Type:** `HTTP`
* **URL:** `http://<local-ip>:9700`

Notes:

* You can try `http://localhost:9700` first. If the hostname doesn’t route correctly, determine your machine’s local IP:

  * Linux/macOS: run `ip a` (or `ifconfig`)
  * Windows: run `ipconfig`
* Use the local IP (e.g., `http://192.168.1.100:9700`) when the tunnel needs to target a specific network interface.
* Requirements: your domain must be added to Cloudflare; the tunnel steps are available after `npm run start` and the app is listening on the chosen port.

When complete, Cloudflare will create DNS records and route traffic from your chosen hostname through the tunnel to your local app. Verify by visiting your hostname in a browser.

---

## Notes, security & best practices

* Never commit `.env.local` to source control. Use secret managers for production.
* For production use, the repository requires a license key from the Owner. This project is explicitly limited to personal, educational, or non-commercial use unless you obtain authorization.
* Use HTTPS endpoints for any public-facing hostnames. Cloudflare provides TLS termination for tunnels.
* Rotate API keys and credentials periodically. Keep least privilege on all keys.
* If you expose the app to the Internet, harden your app (rate limiting, input validation, secure CSP headers, etc.).
* Replace placeholder CDN upload endpoints with your own implementation and secure server-side validation in `lib/UploadCDN.ts`.

---

## Support / More projects

If you find this project useful, consider starring the repository. For more projects and tools from the AdmiBot team, see:

* AdmiBot: [https://admibot.xyz](https://admibot.xyz) — An all-in-one Discord Bot and toolkit.

---

**Acknowledgements**
This project is authored and maintained by Hassen / the AdmiBot Team. Use responsibly and follow the license terms above.
