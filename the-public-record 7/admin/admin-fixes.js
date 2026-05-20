(function () {
  "use strict";

  function slugify(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeImagePath(value) {
    if (!value) return value;

    var src = String(value).trim().replace(/^['"]|['"]$/g, "").replace(/\\/g, "/");
    if (!src || /^(https?:|data:|blob:)/i.test(src)) return src;

    var absoluteAssets = "/assets/img/";
    var relativeAssets = "assets/img/";
    var index = src.indexOf(absoluteAssets);
    if (index > -1) return src.slice(index);

    index = src.indexOf(relativeAssets);
    if (index > -1) return "/" + src.slice(index);

    if (src.charAt(0) === "/") return src;
    return absoluteAssets + src.replace(/^\/+/, "");
  }

  function normalizeArticle(article) {
    if (!article || typeof article.get !== "function") return article;

    var next = article;
    if (!next.get("slug") && next.get("title")) {
      next = next.set("slug", slugify(next.get("title")));
    }
    if (next.get("image")) {
      next = next.set("image", normalizeImagePath(next.get("image")));
    }

    return next;
  }

  function registerAdminFixes() {
    if (!window.CMS) return;

    window.CMS.registerEventListener({
      name: "preSave",
      handler: function (_ref) {
        var entry = _ref.entry;
        var data = entry.get("data");
        var articles = data && data.get("articles");
        if (!articles || typeof articles.map !== "function") return data;

        return data.set("articles", articles.map(normalizeArticle));
      }
    });
  }

  registerAdminFixes();
})();
