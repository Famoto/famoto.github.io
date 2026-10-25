// Adds a copy-to-clipboard button to every code block.
// (The language label is plain CSS; see sass/parts/_code.scss.)

const icon = (body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" ${extra}>${body}</svg>`;
const ICONS = {
  copy: icon(
    '<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6" />',
  ),
  done: icon('<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />'),
  failed: icon('<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />'),
};

for (const pre of document.querySelectorAll("pre > code")) {
  const block = pre.parentElement;
  const wrapper = document.createElement("div");
  wrapper.className = "code-block";
  block.replaceWith(wrapper);

  const button = document.createElement("button");
  button.className = "clipboard-button";
  button.type = "button";
  button.ariaLabel = "Copy code to clipboard";
  button.innerHTML = ICONS.copy;
  wrapper.append(block, button);

  button.addEventListener("click", async () => {
    let state = "done";
    try {
      const copy = pre.cloneNode(true);
      copy.querySelectorAll(".giallo-ln").forEach((n) => n.remove()); // line numbers
      await navigator.clipboard.writeText(copy.textContent.trimEnd());
    } catch (error) {
      console.error("Failed to copy text:", error);
      state = "failed";
    }
    button.innerHTML = ICONS[state];
    setTimeout(() => (button.innerHTML = ICONS.copy), 2000);
  });
}
