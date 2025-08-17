
# ChatBot

![Preview](./images/preview.png)

**ChatBot** is an open-source chatbot built like a production system, inspired by ChatGPT and Gemini UX/UI. It features a modular design, user sessions, persistent storage, and API integrations, allowing you to learn, experiment, or build your own chatbot while exploring real-world production bot architecture.

For a live working example, visit [ChatBot Demo](https://chat.admibot.xyz).

---

## Features

- Modular chatbot design
- User sessions & persistent storage
- Discord OAuth2 login support
- Google Gemini API integration
- Groq CMS integration
- CDN support for custom user icons
- Production-ready architecture for learning and experimentation

---

## 1. Project Setup

### 1.1 Download the Source Code

Clone or download this repository to your VPS.  
> Recommended OS: **Ubuntu or Debian** (Windows requires additional build tools for Next.js)

```bash
git clone https://github.com/yourusername/chatbot.git
cd chatbot
````

### 1.2 Environment Variables

Create a file named `.env.local` in the project root with the following content:

```env
# Discord Application client ID
DISCORD_CLIENT_ID=00000000000000

# Discord Application client secret
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Secret for NextAuth authentication
NEXTAUTH_SECRET=replace_with_a_strong_random_secret

# URL where your Next.js app is hosted
NEXTAUTH_URL=https://ex.com

# MongoDB connection string
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"

# Discord bot token
DISCORD_BOT_TOKEN="your_discord_bot_token_here"

# Google Gemini API key
GEMINI_API_KEY=replace_with_google_api_key

# GROQ API key
GROQ_API_KEY=replace_with_groq_api_key

# CDN upload URL (placeholder)
CDN_UPLOAD_URL=https://cdn.admibot.xyz

# Secret key for CDN uploads (placeholder)
CDN_SECRET_KEY=replace_with_your_own_secret_key
```

---

### 1.3 Configure `config.yml`

Update the chatbot name and icon in `public/config.yml`:

```yml
siteName: "ChatBot" # Replace with your ChatBot name
iconPath: "https://images-ext-1.discordapp.net/external/bk15l3IluZ9Yd5CbmXwmzRXNLhntA2kTKM9pPsDeKhg/%3Fsize%3D2048/https/cdn.discordapp.com/icons/1293949144540381185/ddf47008e55e143e7af8d112da80d9c8.webp?format=webp&width=300&height=300"
```

---

## 2. MongoDB Setup

1. Visit [MongoDB Cloud](https://cloud.mongodb.com/) and log in or sign up.
2. Create a new organization (if not already).
3. Go to **Projects** → Click **New Project** ![New Project](./images/new_project.png)
4. Enter your project name ![Project Name](./images/name_next.png) → Click **Next** → Click **Create Project**
5. Inside your project, click **Create Cluster** ![Create Cluster](./images/create-cluster.png) → Select **Free Tier** → Click **Create Deployment** ![Creating Cluster](./images/creating-cluster.png)
6. After the cluster is created, click **Connect**:

   * Create a database user and copy the password
   * Click **Choose a connection method** ![Step 1](./images/step-1-creating.png)
   * Click **Drivers** ![Step 2](./images/step-2-creating.png)
   * Copy the connection string ![Step 3](./images/step-3-creating.png) and paste it in `.env.local` under `MONGODB_URI`
   * Add your IP address under **Network Access** → **Allow access from anywhere**

MongoDB is now ready for your app.

---

## 3. Google Gemini API Key

1. Visit [Google Gemini Studio](https://aistudio.google.com/prompts/new_chat) and log in.
2. Click **Get API Key** → **Create API Key** → Choose your Google Cloud project → Click **Create**
3. Copy the generated API key and paste it into `.env.local` under `GEMINI_API_KEY`.

---

## 4. Groq API Key

1. Visit [Groq Playground](https://console.groq.com/playground) and log in.
2. Click **API Keys** → **Create API Key** → Name your key → Complete CAPTCHA → Click **Create**
3. Copy the key and paste it into `.env.local` under `GROQ_API_KEY`.

---

## 5. Discord OAuth2 Setup

1. Visit [Discord Developer Portal](https://discord.com/developers/applications/) and log in.
2. Click **New Application**, choose a name, accept terms, and click **Create**
3. Under **OAuth2**, copy the **Client ID** → paste in `.env.local` as `DISCORD_CLIENT_ID`
4. Click **Reset Secret** → Copy new **Client Secret** → paste in `.env.local` as `DISCORD_CLIENT_SECRET`
5. Add Redirect URI:

```
https://yourappdomain.com/api/auth/callback/discord
```

6. Set `NEXTAUTH_URL` in `.env.local` to your application URL.
7. Set a strong random string for `NEXTAUTH_SECRET`.

---

## 6. Install Dependencies & Build

Ensure you have Node.js v20 or v21 installed. Then:

```bash
npm install
npm run build
```

---

## 7. Start the Application

Run the server on port 9700:

```bash
npm run start
```

Visit `http://localhost:9700` to see your ChatBot in action.

---

### Notes

* The `/images/preview.png` shows a working example interface of the chatbot.
* CDN uploads require your own implementation; placeholders are included for reference.
* Ensure all API keys, database credentials, and secrets are kept secure.

---
**Make sure to star this project if you want to support me in improving it!**

### More Projects:
* [AdmiBot](https://admibot.xyz): All-in-One Discord Bot! Combine multiple bot features into one. Simplify server management and save time. Try it today!
