# Setup walkthrough — get the admin panel live

The site is already running on Netlify via drag-and-drop. To unlock the `/admin` panel where you write and publish articles, the deploy needs to come from a GitHub repo instead. Once that's wired up, writing an article takes about 5 minutes in a Google-Docs-style editor that you reach at `the-public-records.com/admin`.

Total time: about 40 minutes. Most of it is account creation and clicking through Netlify settings, none of it is hard.

---

## Step 1 — Create a GitHub account (≈3 min)

GitHub is where your site's files will live. The CMS commits new articles to this repo, and Netlify watches the repo for changes.

1. Go to **[github.com/signup](https://github.com/signup)**.
2. Use the same email you used for Netlify. Pick any username.
3. Verify your email when GitHub sends the confirmation.

That's it — you don't need to learn Git or use the command line. Everything from here is point-and-click in the GitHub website.

---

## Step 2 — Create a new repo and upload the project (≈5 min)

1. Click the **+** in the top-right of GitHub → **New repository**.
2. Repository name: `the-public-record`.
3. Set it to **Public**. (Private repos require a paid Netlify plan for the CMS.)
4. Leave everything else default. Click **Create repository**.
5. On the new repo's page, click the **"uploading an existing file"** link. (It's small, in the middle of the page.)
6. **Drag the entire `the-public-record` folder** from your Mac onto the upload zone. Wait for the green checkmarks next to every file — it should be about 15 files.
7. Scroll down. In the "Commit changes" box, type `initial commit` for the message. Click **Commit changes**.

Refresh the repo page. You should see `index.html`, `admin/`, `assets/`, `netlify.toml`, etc.

---

## Step 3 — Connect Netlify to the GitHub repo (≈5 min)

This swaps the deploy source from "I drag a folder" to "Netlify watches GitHub." Your live URL and domain stay exactly the same.

1. Open your Netlify dashboard → click your site (the one that's currently live).
2. **Site configuration → Build & deploy → Continuous deployment → Link site to Git**.
3. Choose **GitHub**, authorize Netlify when prompted.
4. Pick the `the-public-record` repository.
5. Build settings — leave everything blank:
   - **Branch to deploy:** `main`
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.` *(just a period — meaning the repo root)*
6. Click **Save**.

Netlify will run a deploy and within ~30 seconds your site is now deploying from GitHub. Visit your live URL — should look identical to before.

---

## Step 4 — Enable Netlify Identity (≈3 min)

Identity is the login system for the admin panel. Free, takes one click.

1. In your site's Netlify dashboard → **Integrations** (in the left sidebar) → search for **Identity** → **Enable Identity**.

   *(Older Netlify dashboards put this under a top-level "Identity" tab — same toggle, different location.)*

2. Once Identity is enabled, click **Settings and usage** → scroll to **Registration**.
3. Change **Registration preferences** to **Invite only**. This stops random people from signing up for editor access.
4. Scroll to **External providers** (optional). If you want to log in with Google instead of email/password, click **Add provider → Google**.

---

## Step 5 — Enable Git Gateway (≈2 min)

Git Gateway lets the admin panel commit articles to GitHub without you needing a personal access token.

1. Same Identity settings page → scroll to **Services** → **Git Gateway** → click **Enable Git Gateway**.
2. It auto-detects your linked GitHub repo and authorizes itself.

---

## Step 6 — Invite yourself as an editor (≈2 min)

Even though it's your own site, you need to send yourself an invite so Identity has a user record for you.

1. Same Identity page → **Identity** tab at the top → **Invite users** button.
2. Enter your email → **Send**.
3. Check your inbox for the invite email from Netlify. Click the **Accept the invite** link.
4. You'll land back on your site with a small popup asking you to set a password. Set one.
5. You're now logged in.

---

## Step 7 — Visit /admin and write your first article (≈5 min)

1. Go to `https://the-public-records.com/admin` (or whatever your live URL is + `/admin`).
2. Log in with the email and password you just set.
3. The Decap CMS interface loads. You'll see an **Articles** collection with one entry — "Articles" — click it.
4. Inside, you'll see the list of all 12 starter articles. Click any one to edit, or click **New Articles** at the top right to start a new one.
5. Each article has fields: slug, headline, deck, section, author, date, read time, hero image, excerpt, lead-story toggle, and body. The body editor is rich-text — bold/italic buttons, headings, quotes, lists, links, images.
6. When you're done, click **Publish → Publish now** (or **Save** if you're using the editorial workflow).
7. Behind the scenes, the CMS commits your changes to GitHub. Netlify sees the commit and redeploys. Within ~60 seconds, the live site shows your edit.

---

## How publishing feels from now on

Every time you want to post:

1. Open `the-public-records.com/admin` in any browser, on any device.
2. Click **New Articles → New entry** (or edit an existing one).
3. Fill in the fields. Drag an image into the editor if you want one.
4. Click **Publish now**.
5. Wait ~60 seconds. Refresh the homepage. Article is live.

No file editing. No re-uploading. No Squarespace.

---

## When it goes wrong

**"I went to /admin and got a 'Config error: Couldn't load CMS config' message."** — Your `admin/config.yml` file didn't get uploaded to GitHub, or it's malformed. Check the repo on GitHub: click `admin/` and confirm `config.yml` is there.

**"I went to /admin and the page is blank or just shows a login button that doesn't work."** — Git Gateway probably isn't enabled. Go back to Step 5.

**"I logged in but I can't see any articles."** — The repo doesn't contain `assets/data/articles.json`, or it has different content than expected. Check the file exists in your GitHub repo.

**"I published an article but the live site still shows the old version."** — Check Netlify's **Deploys** tab. You should see a fresh deploy triggered by your commit. If it's been more than 2 minutes, the deploy might have failed — click the deploy to see the log.

**"I accidentally deleted an article."** — Every change is a Git commit, so nothing is truly gone. In GitHub, go to **Commits** on the repo, find the one before your delete, and you can restore the file. Or just write the article again.
