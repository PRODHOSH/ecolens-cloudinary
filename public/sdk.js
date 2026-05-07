(() => {
  const script =
    document.currentScript ||
    document.querySelector('script[data-cloud][src*="/sdk.js"]');

  if (!script) {
    return;
  }

  const cloudName = script.getAttribute("data-cloud");
  const transform = script.getAttribute("data-transform") || "f_auto,q_auto";
  const selector = script.getAttribute("data-selector") || "img";
  const skipAttr = script.getAttribute("data-skip") || "data-ecolens-skip";

  const hasCloud = Boolean(cloudName);
  if (!hasCloud) {
    console.warn("EcoLens SDK: data-cloud is missing. Falling back to jsDelivr for GitHub assets only.");
  }

  const cloudPrefix = hasCloud
    ? "https://res.cloudinary.com/" + cloudName + "/image/fetch/" + transform + "/"
    : "";

  const toAbsolute = (value) => {
    if (!value) return null;
    if (value.startsWith("data:") || value.startsWith("blob:")) return null;
    try {
      return new URL(value, document.baseURI).toString();
    } catch {
      return null;
    }
  };

  const toJsDelivr = (absoluteUrl) => {
    if (absoluteUrl.startsWith("https://cdn.jsdelivr.net/gh/")) {
      return absoluteUrl;
    }

    const rawMatch = absoluteUrl.match(
      /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/
    );
    if (rawMatch) {
      return `https://cdn.jsdelivr.net/gh/${rawMatch[1]}/${rawMatch[2]}@${rawMatch[3]}/${rawMatch[4]}`;
    }

    const blobMatch = absoluteUrl.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/
    );
    if (blobMatch) {
      return `https://cdn.jsdelivr.net/gh/${blobMatch[1]}/${blobMatch[2]}@${blobMatch[3]}/${blobMatch[4]}`;
    }

    return null;
  };

  const buildOptimized = (value) => {
    const absolute = toAbsolute(value);
    if (!absolute) return null;
    if (hasCloud) {
      if (absolute.includes("res.cloudinary.com/" + cloudName)) return absolute;
      return cloudPrefix + encodeURIComponent(absolute);
    }

    return toJsDelivr(absolute) || absolute;
  };

  const rewriteAttr = (el, attr) => {
    const value = el.getAttribute(attr);
    if (!value) return;
    const optimized = buildOptimized(value);
    if (optimized) {
      el.setAttribute(attr, optimized);
    }
  };

  const rewriteSrcset = (el, attr) => {
    const value = el.getAttribute(attr);
    if (!value) return;
    const updated = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const parts = entry.split(/\s+/);
        const optimized = buildOptimized(parts[0]);
        if (!optimized) return entry;
        return [optimized, ...parts.slice(1)].join(" ");
      })
      .join(", ");
    if (updated) {
      el.setAttribute(attr, updated);
    }
  };

  const optimizeImage = (img) => {
    if (img.hasAttribute(skipAttr)) return;
    rewriteAttr(img, "src");
    rewriteAttr(img, "data-src");
    rewriteSrcset(img, "srcset");
    rewriteSrcset(img, "data-srcset");
  };

  const optimizePicture = (picture) => {
    picture.querySelectorAll("source").forEach((source) => {
      rewriteSrcset(source, "srcset");
      rewriteSrcset(source, "data-srcset");
      rewriteAttr(source, "src");
    });
  };

  const optimizeInlineBackground = (el) => {
    const style = el.getAttribute("style");
    if (!style || style.indexOf("url(") === -1) return;
    const urlRegex = /url\(\s*['\"]?([^'\")\s]+)['\"]?\s*\)/gi;
    let updated = style;
    let match;
    while ((match = urlRegex.exec(style)) !== null) {
      const optimized = buildOptimized(match[1]);
      if (optimized) {
        updated = updated.replace(match[1], optimized);
      }
    }
    if (updated !== style) {
      el.setAttribute("style", updated);
    }
  };

  const run = (root) => {
    root.querySelectorAll(selector).forEach(optimizeImage);
    root.querySelectorAll("picture").forEach(optimizePicture);
    root.querySelectorAll('[style*="background"]').forEach(optimizeInlineBackground);
  };

  window.EcoLens = window.EcoLens || {};
  window.EcoLens.optimize = () => run(document);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => run(document));
  } else {
    run(document);
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches && node.matches(selector)) {
          optimizeImage(node);
        }
        node.querySelectorAll?.(selector).forEach(optimizeImage);
        if (node.matches?.("picture")) {
          optimizePicture(node);
        }
        node.querySelectorAll?.("picture").forEach(optimizePicture);
        if (node.matches?.('[style*="background"]')) {
          optimizeInlineBackground(node);
        }
        node.querySelectorAll?.('[style*="background"]').forEach(optimizeInlineBackground);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
