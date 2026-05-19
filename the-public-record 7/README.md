# The Public Record

A satirical online newspaper. Vanilla HTML/CSS/JS with a Decap CMS admin panel at `/admin` for writing articles in a rich web editor.

## Writing articles

Visit `https://the-public-records.com/admin` (or whatever your domain ends up being), log in with the email account you set up in Netlify Identity, and use the editor to add or edit articles. Click *New Article* to add one; click an existing article to edit it. When you save, your changes get committed to the GitHub repo and Netlify redeploys the site within ~60 seconds.

## File layout

```
the-public-record/
├── index.html                Homepage
├── blog.html                 Listing page (?cat=, ?q=)
├── article.html              Single article template (?slug=)
├── about.html                About / editorial voice
├── submit.html               Submit a Tip form
├── admin/
│   ├── index.html            Decap CMS shell
│   └── config.yml            Article schema + CMS config
├── assets/
│   ├── css/styles.css        All styles. Design tokens at the top.
│   ├── js/main.js            Renders cards + articles, handles filter/search
│   └── data/articles.json    Article content (CMS writes here)
├── netlify.toml              Build + redirect config
├── .gitignore
└── README.md
```

## Customizing the design

All tokens live at the top of `assets/css/styles.css` under `:root { … }`:

| Token             | What it controls                                       |
| ----------------- | ------------------------------------------------------ |
| `--paper`         | Page background (newsprint cream)                      |
| `--ink`           | Primary text color                                     |
| `--red`           | Masthead accent, pull quotes, hover state              |
| `--navy`          | Category tags, newsletter band                         |
| `--gold`          | Satire-disclaimer rule, editor picks                   |
| `--serif-display` | Headline font (Playfair Display)                       |
| `--serif-body`    | Body font (Source Serif 4)                             |
| `--sans`          | UI / nav / metadata (Inter)                            |

Change a value and every page updates.

## Adding categories

To add a new section like "Sports":

1. In `admin/config.yml`, add `{ label: "Sports", value: "sports" }` under the `category` field's `options`.
2. In `assets/js/main.js`, add `"sports": "Sports"` to the `categoryLabel` map.
3. In `assets/css/styles.css`, optionally add `.card[data-cat="sports"] { border-top-color: var(--green); }`.
4. In each HTML page's nav, add `<li><a href="blog.html?cat=sports">Sports</a></li>`.

## Hooking up the newsletter form

The newsletter and tip forms currently fake-submit with a deadpan confirmation. To make them real, in each HTML file change `<form class="newsletter__form" data-newsletter>` to point at your provider (Buttondown, Mailchimp embed, Formspree, etc.).

## Satire notice

The Public Record is a satire publication. All placeholder articles included in this scaffolding are fictional.
