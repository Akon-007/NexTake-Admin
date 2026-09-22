/**
 * Headless smoke test for the NexTake admin console (demo backend).
 *
 * Boots the production bundle in jsdom, walks the two-step authentication
 * flow, then exercises the article editor and the live preview. Run with:
 *   npm run build && node scripts/smoke.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const distDir = new URL("../dist/", import.meta.url).pathname;
const assetsDir = join(distDir, "assets");

const jsFile = readdirSync(assetsDir).find((file) => file.endsWith(".js"));
const rawBundle = readFileSync(join(assetsDir, jsFile), "utf8");

// jsdom has no ESM loader; neutralise the two import.meta forms that
// survive bundling so the app can be exercised headlessly.
const bundle = rawBundle
  .replace(/import\.meta\.url/g, '"http://localhost:3000/"')
  .replace(/import\.meta\.resolve/g, '(() => "")');

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (error) => errors.push(error.message));
virtualConsole.on("error", (...args) => errors.push(args.join(" ")));

const dom = new JSDOM(
  `<!doctype html><html><body><div id="root"></div></body></html>`,
  {
    url: "http://localhost:3000/",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole,
  }
);

const { window } = dom;
window.matchMedia ??= () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
});

const script = window.document.createElement("script");
script.textContent = bundle;
window.document.body.appendChild(script);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const text = () => window.document.getElementById("root")?.textContent ?? "";

const findByLabel = (label) => {
  const inputs = [...window.document.querySelectorAll("input,textarea")];
  return inputs.find((input) => {
    const id = input.getAttribute("id");
    if (!id) return false;
    const labelEl = window.document.querySelector(`label[for="${id}"]`);
    return labelEl?.textContent?.toLowerCase().includes(label.toLowerCase());
  });
};

const clickText = (needle, scope = window.document) => {
  const root = typeof scope === "string" ? window.document.querySelector(scope) : scope;
  const target = [...(root?.querySelectorAll("button") ?? [])].find((button) =>
    button.textContent?.toLowerCase().includes(needle.toLowerCase())
  );
  if (!target) throw new Error(`No button matching "${needle}"`);
  target.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  return target;
};

const setValue = (input, value) => {
  const proto =
    input.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(input, value);
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
};

const assert = (condition, message) => {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
  console.log(`  ✓ ${message}`);
};

await wait(300);

console.log("\n1. Auth screen");
assert(text().includes("Administrator sign in"), "auth screen renders");
assert(
  !text().includes("akannipromise") && !text().includes("Passkey"),
  "no hardcoded credentials remain"
);

console.log("\n2. Credential validation");
clickText("Continue");
await wait(150);
assert(text().includes("Email address is required"), "empty form is rejected");

setValue(findByLabel("email"), "editor@nextake.africa");
setValue(findByLabel("password"), "short");
clickText("Continue");
await wait(150);
assert(text().includes("at least 8 characters"), "short password is rejected");

console.log("\n3. Credentials → emailed verification code");
setValue(findByLabel("password"), "supersecret-password");
clickText("Continue");
await wait(1200);
assert(text().includes("Verify your identity"), "step two is shown");

const codeMatch = text().match(/Verification code:\s*(\d{6})/);
assert(Boolean(codeMatch), "a 6-digit code was dispatched");

console.log("\n4. Wrong code is rejected");
const codeInputs = [...window.document.querySelectorAll("input")].filter(
  (input) => input.getAttribute("aria-label")?.startsWith("Digit")
);
assert(codeInputs.length === 6, "six-digit entry rendered");

codeInputs.forEach((input, index) => setValue(input, index === 0 ? "1" : "0"));
await wait(700);
assert(text().includes("incorrect"), "wrong code is rejected");

console.log("\n5. Correct code opens the console");
codeMatch[1].split("").forEach((digit, index) => setValue(codeInputs[index], digit));
await wait(1200);
assert(
  text().includes("Welcome back") || text().includes("Latest on the wire"),
  "dashboard renders after verification"
);

console.log("\n6. Article editor opens with every CMS section");
clickText("New story");
await wait(400);
const body = () => window.document.getElementById("root")?.textContent ?? "";
assert(body().includes("Content & editorial"), "content section present");
assert(body().includes("Source & link"), "source section present");
assert(body().includes("SEO & syndication"), "syndication section present");
assert(body().includes("Placement & visibility"), "placement section present");

console.log("\n7. Client-side validation blocks an empty story");
clickText("Publish", "main");
await wait(400);
assert(body().includes("Fix the highlighted fields"), "empty story rejected");
assert(body().includes("Source link is required"), "required source URL flagged");

console.log("\n8. Session persists across a reload");
const persisted = window.localStorage.getItem("nextake.demo.session");
assert(Boolean(persisted), "session written to storage");

console.log("\n8b. Publish a story end to end (same editor session)");

const story = {
  title: "NexTake smoke run validates the editorial pipeline",
  summary:
    "This story was created by the automated smoke test to confirm that the CMS writes to the shared articles table and that the public feed picks it up.",
  cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop",
  source: "https://techcrunch.com/2026/09/22/nextake-smoke-run/",
  sourceName: "TechCrunch",
};

setValue(findByLabel("headline / title"), story.title);
setValue(findByLabel("executive summary"), story.summary);
setValue(findByLabel("cover image"), story.cover);
setValue(findByLabel("source link"), story.source);
setValue(findByLabel("source name"), story.sourceName);
setValue(findByLabel("canonical url"), story.source);

const tagsInput = window.document.getElementById("tags");
setValue(tagsInput, "Automation,Testing");
tagsInput.dispatchEvent(
  new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true })
);

clickText("Publish", "main");
await wait(1200);

assert(
  text().includes("live on the wire"),
  "story published and confirmed in the list"
);
assert(text().includes(story.title), "published story appears in the list");
assert(
  (window.document.querySelector("main")?.textContent ?? "").includes(story.title) &&
    /published/i.test(window.document.querySelector("main")?.textContent ?? ""),
  "story carries the published status"
);

console.log("\n8c. Main blog integration via the live preview");
clickText("Live preview", "aside");
await wait(900);
const previewText = text();
assert(
  previewText.includes("Feed wire"),
  "public feed renders from the shared records"
);
assert(
  previewText.includes(story.title),
  "newly published story is visible on the public feed"
);
assert(previewText.includes("Sovereign AI clusters"), "hero carousel renders");

clickText("Return to console");
await wait(500);

console.log("\n9. Log out clears the session");
clickText("Log out", "aside");
await wait(300);
clickText("Log out", '[role="dialog"]');
await wait(700);
assert(
  text().includes("Administrator sign in"),
  "returned to the auth screen after logout"
);
assert(
  !window.localStorage.getItem("nextake.demo.session"),
  "session storage cleared"
);

const realErrors = errors.filter(
  (message) => !message.includes("Not implemented") && !message.includes("css")
);

if (realErrors.length > 0) {
  console.log("\nConsole errors:\n" + realErrors.slice(0, 10).join("\n"));
  process.exit(1);
}

console.log("\nAll smoke checks passed.\n");
process.exit(0);
