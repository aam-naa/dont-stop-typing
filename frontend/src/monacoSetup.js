/* ─── vendor Monaco instead of fetching it from a CDN ────────────────────────
 *
 * @monaco-editor/loader defaults to
 *   paths.vs = https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs
 * so with no network the editor never renders at all — and it silently runs a
 * different version (0.55.1) than the one in node_modules (0.56.0).
 *
 * Importing monaco directly and handing it to loader.config() pins it to the
 * installed copy and makes the editor work offline. The worker wiring is
 * required once you do that: without it Monaco falls back to running language
 * services on the main thread and logs warnings.
 *
 * The worker specifiers look odd because monaco-editor's exports map is
 *   "./*": "./esm/vs/*.js"
 * so the conventional "monaco-editor/esm/vs/..." path would resolve to
 * esm/vs/esm/vs/... and fail. The subpath is relative to esm/vs already.
 * ─────────────────────────────────────────────────────────────────────────── */

import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/editor/editor.worker?worker";
import cssWorker from "monaco-editor/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/language/html/html.worker?worker";

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });
