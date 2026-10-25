// Search UI on top of Pagefind (https://pagefind.app), which `npm run build`
// indexes into /pagefind/. Nothing is downloaded until the search box is first
// focused or used.

const input = document.getElementById("search");
const panel = document.querySelector(".search-results");
const list = panel?.querySelector(".search-results__items");
const MAX_ITEMS = 10;

if (input && panel && list) {
  const root = new URL("../", import.meta.url);
  let pagefind;
  let current = "";

  const load = () =>
    (pagefind ??= import(new URL("pagefind/pagefind.js", root))
      .then(async (pf) => {
        await pf.options({ baseUrl: root.pathname });
        return pf;
      })
      .catch((error) => {
        pagefind = undefined; // allow a retry on the next keystroke
        throw error;
      }));

  const open = () => (panel.style.display = "block");
  const close = () => (panel.style.display = "none");

  const message = (text) => {
    const li = document.createElement("li");
    li.className = "search-results__item search-results__no-results";
    li.textContent = text;
    list.replaceChildren(li);
  };

  const renderHit = (hit) => {
    const link = document.createElement("a");
    link.href = hit.url;
    link.textContent = hit.meta.title || hit.url;

    const excerpt = document.createElement("section");
    excerpt.innerHTML = hit.excerpt; // HTML-escaped by Pagefind, with <mark> around matches

    const item = document.createElement("article");
    item.className = "search-results__item";
    item.append(link, excerpt);

    const li = document.createElement("li");
    li.append(item);
    return li;
  };

  const run = async () => {
    const term = input.value.trim();
    if (term === current) return;
    current = term;
    if (!term) {
      close();
      list.replaceChildren();
      return;
    }
    open();
    try {
      const pf = await load();
      const search = await pf.debouncedSearch(term, {}, 150);
      if (search === null) return; // superseded by a newer keystroke
      const hits = await Promise.all(
        search.results.slice(0, MAX_ITEMS).map((result) => result.data()),
      );
      if (term !== current) return;
      if (hits.length) list.replaceChildren(...hits.map(renderHit));
      else message("No results found...");
    } catch (error) {
      console.error("Search failed:", error);
      if (term === current) message("Search is unavailable right now.");
    }
  };

  input.addEventListener("focus", () => load().catch(() => {}), { once: true });
  input.addEventListener("input", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) open();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      close();
      input.value = "";
      current = "";
      input.blur();
    } else if (e.key === "/" && !e.target.closest("input, textarea, [contenteditable]")) {
      e.preventDefault();
      input.focus();
    }
  });

  window.addEventListener("click", (e) => {
    if (e.target !== input && !panel.contains(e.target)) close();
  });
}
