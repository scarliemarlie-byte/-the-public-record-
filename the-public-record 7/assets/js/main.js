/* ===========================================================
   The Public Record — front-end behavior
   Loads articles.json (managed by the /admin CMS), renders
   homepage, listing, and article pages. Body fields are
   Markdown, rendered with marked.js (loaded via CDN in HTML).
   =========================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     State + helpers
     ---------------------------------------------------------- */
  let ARTICLES = [];

  function categoryLabel(slug) {
    return ({
      "politics":   "Politics",
      "culture":    "Culture",
      "weird-news": "Weird News",
      "internet":   "Internet",
      "lifestyle":  "Lifestyle",
      "opinion":    "Opinion"
    })[slug] || slug;
  }
  function getImagePath(image) {
    if (!image) return "";

    let src = String(image).trim().replace(/^['"]|['"]$/g, "").replace(/\\/g, "/");
    if (!src) return "";
    if (/^(https?:|data:|blob:)/i.test(src)) return src;

    const absoluteAssets = "/assets/img/";
    const relativeAssets = "assets/img/";
    let index = src.indexOf(absoluteAssets);
    if (index > -1) return src.slice(index);

    index = src.indexOf(relativeAssets);
    if (index > -1) return "/" + src.slice(index);

    if (src.startsWith("/")) return src;
    return absoluteAssets + src.replace(/^\/+/, "");
  }

  function markdownImageSrc(raw) {
    let src = String(raw || "").trim();
    if (!src) return "";

    const wrapped = src.match(/^<([^>]+)>/);
    if (wrapped) return wrapped[1].trim();

    // Strip optional Markdown image titles: ![](photo.jpg "Caption")
    return src.replace(/\s+(['"]).*\1\s*$/, "").trim();
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso + "T12:00:00");
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch (e) { return iso; }
  }

  function byCategory(cat) {
    return ARTICLES.filter(function (a) { return a.category === cat; });
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function renderMarkdown(md) {
  if (!md) return "";

  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_, alt, src) {
    src = markdownImageSrc(src);
    return '<img src="' + encodeURI(getImagePath(src)) + '" alt="' + escapeHtml(alt || "") + '">';
  });

  if (window.marked && typeof window.marked.parse === "function") {
    // marked v4+
    window.marked.setOptions({ gfm: true, breaks: false });
    return window.marked.parse(md);
  }

  // Fallback: very minimal paragraph conversion if marked failed to load
  return md.split(/\n{2,}/).map(function (p) {
    return "<p>" + escapeHtml(p).replace(/\n/g, "<br>") + "</p>";
  }).join("");
}

  /* ----------------------------------------------------------
     Dateline + mobile nav
     ---------------------------------------------------------- */
  function updateDateline() {
    const el = document.querySelector("[data-dateline]");
    if (!el) return;
    el.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    });
  }

  function bindNavToggle() {
    const btn = document.querySelector(".nav__toggle");
    const list = document.querySelector(".nav__list");
    if (!btn || !list) return;
    btn.addEventListener("click", function () {
      const open = list.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  /* ----------------------------------------------------------
     Card rendering
     ---------------------------------------------------------- */
  function cardHTML(article, opts) {
    opts = opts || {};
    const cat = escapeHtml(article.category);
    const label = categoryLabel(article.category);
    const date = formatDate(article.date);
    const href = "article.html?slug=" + encodeURIComponent(article.slug);
    const kickerColor =
      cat === "politics" ? "kicker--red" :
      cat === "weird-news" ? "kicker--gold" :
      cat === "internet" ? "kicker--green" : "";
    const mediaStyle = article.image
      ? ' style="background-image:url(' + encodeURI(getImagePath(article.image)) + ');background-size:cover;background-position:center;"'
      : "";

    return (
      '<article class="card' + (opts.row ? " card--row" : "") + '" data-cat="' + cat + '">' +
        '<a href="' + href + '" class="card__media"' + mediaStyle + ' aria-label="' + escapeHtml(article.title) + '"></a>' +
        '<div class="card__body">' +
          '<span class="card__cat kicker ' + kickerColor + '">' + escapeHtml(label) + '</span>' +
          '<h3 class="card__title"><a href="' + href + '">' + escapeHtml(article.title) + '</a></h3>' +
          (opts.excerpt !== false ? '<p class="card__excerpt">' + escapeHtml(article.excerpt) + '</p>' : "") +
          '<div class="card__meta">' + escapeHtml(article.author) + ' · ' + date + (article.readTime ? ' · ' + escapeHtml(article.readTime) : "") + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  /* ----------------------------------------------------------
     Homepage
     ---------------------------------------------------------- */
  function renderHomepage() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    if (!ARTICLES.length) {
      hero.innerHTML = '<p style="padding:48px 0;font-style:italic;color:var(--ink-mute);">No articles yet. Add one in <a href="admin/">the admin</a>.</p>';
      return;
    }

    const lead = ARTICLES.find(function (a) { return a.featured; }) || ARTICLES[0];
    const rest = ARTICLES.filter(function (a) { return a.slug !== lead.slug; });

    const leadHref = "article.html?slug=" + encodeURIComponent(lead.slug);
    const heroStyle = lead.image
      ? ' style="background-image:url(' + encodeURI(getImagePath(lead.image)) + ');background-size:cover;background-position:center;"'
      : "";

    hero.innerHTML =
      '<a class="hero__media" href="' + leadHref + '"' + heroStyle + ' aria-label="' + escapeHtml(lead.title) + '"></a>' +
      '<div class="hero__body">' +
        '<span class="kicker kicker--red">' + escapeHtml(categoryLabel(lead.category)) + ' · Lead story</span>' +
        '<h1 class="hero__title"><a href="' + leadHref + '">' + escapeHtml(lead.title) + '</a></h1>' +
        '<p class="hero__deck">' + escapeHtml(lead.deck) + '</p>' +
        '<div class="hero__byline">By <strong>' + escapeHtml(lead.author) + '</strong> · ' + formatDate(lead.date) + (lead.readTime ? ' · ' + escapeHtml(lead.readTime) : "") + '</div>' +
      '</div>';

    const latestEl = document.querySelector("[data-latest]");
    if (latestEl) {
      latestEl.innerHTML = rest.slice(0, 6).map(function (a) { return cardHTML(a); }).join("");
    }

    const trendEl = document.querySelector("[data-trending]");
    if (trendEl) {
      trendEl.innerHTML = rest.slice(0, 5).map(function (a, i) {
        return '<li><span class="headline-list__num">' + (i + 1) + '</span>' +
               '<a href="article.html?slug=' + encodeURIComponent(a.slug) + '">' + escapeHtml(a.title) + '</a></li>';
      }).join("");
    }

    const picksEl = document.querySelector("[data-picks]");
    if (picksEl) {
      picksEl.innerHTML = rest.slice(2, 6).map(function (a) {
        return '<li><a href="article.html?slug=' + encodeURIComponent(a.slug) + '">' + escapeHtml(a.title) + '</a></li>';
      }).join("");
    }

    const catStrip = document.querySelector("[data-cat-strip]");
    if (catStrip) {
      const cats = [
        { slug: "politics",   label: "Politics" },
        { slug: "culture",    label: "Culture" },
        { slug: "weird-news", label: "Weird News" }
      ];
      catStrip.innerHTML = cats.map(function (c) {
        const items = byCategory(c.slug).slice(0, 4);
        return (
          '<div class="cat-col">' +
            '<h3><a href="blog.html?cat=' + c.slug + '">' + c.label + '</a></h3>' +
            '<ul>' + items.map(function (a) {
              return '<li><a href="article.html?slug=' + encodeURIComponent(a.slug) + '">' + escapeHtml(a.title) + '</a></li>';
            }).join("") + '</ul>' +
            '<a class="cat-col__more" href="blog.html?cat=' + c.slug + '">More in ' + c.label + ' →</a>' +
          '</div>'
        );
      }).join("");
    }
  }

  /* ----------------------------------------------------------
     Listing page (blog.html)
     ---------------------------------------------------------- */
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  let listingState = { cat: "all", q: "", shown: 6, perPage: 6 };

  function renderListing() {
    const grid = document.querySelector("[data-listing]");
    if (!grid) return;

    let filtered = ARTICLES.slice();
    if (listingState.cat !== "all") {
      filtered = filtered.filter(function (a) { return a.category === listingState.cat; });
    }
    if (listingState.q) {
      const q = listingState.q.toLowerCase();
      filtered = filtered.filter(function (a) {
        return a.title.toLowerCase().indexOf(q) > -1 ||
               (a.deck && a.deck.toLowerCase().indexOf(q) > -1) ||
               (a.author && a.author.toLowerCase().indexOf(q) > -1);
      });
    }

    const slice = filtered.slice(0, listingState.shown);
    grid.innerHTML = slice.length
      ? slice.map(function (a) { return cardHTML(a); }).join("")
      : '<p class="listing-empty">No stories match. Try a different category or search term — or, frankly, lower your expectations.</p>';

    const more = document.querySelector("[data-load-more]");
    if (more) {
      slice.length >= filtered.length
        ? more.setAttribute("hidden", "hidden")
        : more.removeAttribute("hidden");
    }

    document.querySelectorAll("[data-filter-chip]").forEach(function (chip) {
      chip.setAttribute("aria-pressed",
        chip.getAttribute("data-filter-chip") === listingState.cat ? "true" : "false");
    });

    const sub = document.querySelector("[data-listing-sub]");
    if (sub) {
      sub.textContent = listingState.cat === "all"
        ? "Every story we've printed, in reverse chronological denial."
        : "Everything we've filed under " + categoryLabel(listingState.cat) + ".";
    }

    const params = new URLSearchParams();
    if (listingState.cat !== "all") params.set("cat", listingState.cat);
    if (listingState.q) params.set("q", listingState.q);
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? "?" + qs : ""));
  }

  function bindListing() {
    const grid = document.querySelector("[data-listing]");
    if (!grid) return;

    const cat = getQueryParam("cat");
    const q   = getQueryParam("q");
    if (cat) listingState.cat = cat;
    if (q)   listingState.q   = q;

    const search = document.querySelector("[data-search]");
    if (search) {
      search.value = listingState.q;
      let to;
      search.addEventListener("input", function (e) {
        clearTimeout(to);
        to = setTimeout(function () {
          listingState.q = e.target.value.trim();
          listingState.shown = listingState.perPage;
          renderListing();
        }, 150);
      });
    }

    document.querySelectorAll("[data-filter-chip]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        listingState.cat = chip.getAttribute("data-filter-chip");
        listingState.shown = listingState.perPage;
        renderListing();
      });
    });

    const more = document.querySelector("[data-load-more]");
    if (more) {
      more.addEventListener("click", function () {
        listingState.shown += listingState.perPage;
        renderListing();
      });
    }

    renderListing();
  }

  /* ----------------------------------------------------------
     Article page
     ---------------------------------------------------------- */
  function renderArticle() {
    const root = document.querySelector("[data-article]");
    if (!root) return;
    if (!ARTICLES.length) return;

    const slug = getQueryParam("slug");
    const article = (slug && ARTICLES.find(function (a) { return a.slug === slug; })) || ARTICLES[0];
    if (!article) return;

    document.title = article.title + " · The Public Record";

    const set = function (sel, val) {
      const el = root.querySelector(sel);
      if (el) el.textContent = val;
    };
    set("[data-title]", article.title);
    set("[data-deck]", article.deck);
    set("[data-cat]", categoryLabel(article.category));
    set("[data-author]", article.author);
    set("[data-date]", formatDate(article.date));
    set("[data-read]", article.readTime || "");

    const bodyEl = root.querySelector("[data-body]");
    if (bodyEl) bodyEl.innerHTML = renderMarkdown(article.body);

    const heroEl = root.querySelector("[data-article-hero]");
    if (heroEl && article.image) {
      heroEl.style.backgroundImage = 'url("' + encodeURI(getImagePath(article.image)) + '")';
      heroEl.style.backgroundSize = "cover";
      heroEl.style.backgroundPosition = "center";
    }

    const catLink = root.querySelector("[data-cat-link]");
    if (catLink) catLink.href = "blog.html?cat=" + encodeURIComponent(article.category);

    const relEl = root.querySelector("[data-related]");
    if (relEl) {
      const rel = ARTICLES.filter(function (a) { return a.slug !== article.slug; }).slice(0, 3);
      relEl.innerHTML = rel.map(function (a) { return cardHTML(a); }).join("");
    }
  }

  /* ----------------------------------------------------------
     Forms
     ---------------------------------------------------------- */
  function bindNewsletter() {
    const form = document.querySelector("[data-newsletter]");
    if (!form) return;
    const status = form.querySelector(".newsletter__status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      if (!email) return;
      form.reset();
      if (status) status.textContent = "Subscribed. Expect a newsletter sometime between Friday and never.";
    });
  }

  function bindTipForm() {
    const form = document.querySelector("[data-tip-form]");
    if (!form) return;
    const status = form.querySelector(".tip-form__status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.reset();
      if (status) status.textContent = "Tip received. Our intern will pretend to read it shortly.";
    });
  }

  /* ----------------------------------------------------------
     Data load + boot
     ---------------------------------------------------------- */
  function loadArticles() {
    return fetch("assets/data/articles.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (json) {
        const list = (json && json.articles) || [];
        // Sort newest first by date
        list.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
        ARTICLES = list;
      })
      .catch(function (err) {
        console.error("Could not load articles.json:", err);
        ARTICLES = [];
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateDateline();
    bindNavToggle();
    bindNewsletter();
    bindTipForm();

    loadArticles().then(function () {
      renderHomepage();
      bindListing();
      renderArticle();
    });
  });
})();
