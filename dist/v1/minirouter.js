// minirouter.js v1
class minirouterjs {
  constructor(base = "", hashMode = false) {
    this.routes = [];
    this.baseUrl = base;
    this.hashMode = hashMode;
    this.notFoundCallback = null;
    this.beforeHook = null;
    this.afterHook = null;

    new MutationObserver(() => this.updateLinks()).observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.init();
  }

  init() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("a");
      const isSameDomain = (linkElement) => new URL(linkElement.href, window.location.origin).host === window.location.host;
      
      console.log(isSameDomain(target));
      if (target && target.href) {
        if (
          target.hasAttribute("data-router") && target.getAttribute("data-router") === "false"
          || isSameDomain(target) == false
          || target.hasAttribute("target") && target.getAttribute("target") === "_blank"
        ) {
          return;
        }
        event.preventDefault();
        this.handleLinkClick(target);
      }
    });

    window.addEventListener("popstate", () => {
      if(this.hashMode){
        if (document.querySelectorAll(`[href="${window.location.hash}"][data-router="false"]`).length > 0) return false;
      }
      
      this.handleNavigation(window.location.pathname + window.location.search);
    });

    window.addEventListener("DOMContentLoaded", () => {
      let path = window.location.pathname;

      if (this.hashMode) {
        if (window.location.hash) {
          path = window.location.hash.replace("#", "");
        } else {
          path = "/";
        }
      }

      this.go(path+window.location.search);
    });
  }

  updateLinks() {
    let hash = this.hashMode ? "/#" : "";
    document.querySelectorAll("a[href]").forEach((a) => {
      if(a.hasAttribute("data-router") && a.getAttribute("data-router") === "false"){
        return;
      }

      if (
        !a.getAttribute("href").startsWith("http") &&
        !a.getAttribute("href").startsWith(this.baseUrl)
      ) {
        if (
          a.getAttribute("href").startsWith("./") ||
          a.getAttribute("href").startsWith("../")
        ) {
          a.href = hash + this.baseUrl + "/" + a.getAttribute("href");
        } else {
          a.href = hash + this.baseUrl + a.getAttribute("href");
        }
      } else {
        if (
          this.hashMode &&
          !a.getAttribute("href").startsWith("/#/") &&
          !a.getAttribute("href").startsWith("./") &&
          !a.getAttribute("href").startsWith("../")
        ) {
          a.href = hash + this.baseUrl + a.getAttribute("href");
        }
      }
    });
  }

  go(path, target) {
    if (!path.startsWith("http") && !path.startsWith(this.baseUrl)) {
      if (path.startsWith("./") || path.startsWith("../")) {
        path = this.baseUrl + "/" + path;
      } else {
        path = this.baseUrl + path;
      }
    }

    if (this.hashMode) {
      path = `#${path}`;
    }

    this.navigate(path, target);
  }

  handleLinkClick(target) {
    const href = target.href;
    const path = this.getPathFromHref(href);

    if (path.startsWith(this.baseUrl)) {
      this.navigate(path, target);
    } else {
      window.location.href = href;
    }
  }

  handleNavigation(path) {
    if (this.beforeHook && this.beforeHook(path) === false) {
      return;
    }

    if (this.hashMode && window.location.hash) {
      path = window.location.hash.replace("#", "");
    }
    this.route(path.replace(this.baseUrl, ""));
  }

  getPathFromHref(href) {
    const url = new URL(href, window.location.origin);
    let path = this.hashMode ? url.hash.replace("#", "") : url.pathname;

    if (url.search) {
      path += url.search;
    }

    return path;
  }

  navigate(path, target) {
    if (this.beforeHook && this.beforeHook(path) === false) {
      return;
    }

    if (this.hashMode) {
      path = path.replace("/#/", "");
    }

    if (this.hashMode) {
      path = path.startsWith("#") ? path.slice(1) : path;
      history.pushState({}, "", `#${path}`);
    } else {
      history.pushState({}, "", path);
    }

    let pathRoute = path.replace(this.baseUrl, "") || "/";
    this.route(pathRoute, target);
  }

  route(path, target) {
    for (const { pattern, callback } of this.routes) {
      const match = this.matchRoute(pattern, path);
      if (match) {
        callback(match, target);

        if (this.afterHook) {
          this.afterHook(path, target);
        }
        return;
      }
    }

    if (this.notFoundCallback) {
      this.notFoundCallback(path, target);
    } else {
      console.log(`No route matched for: ${path}`);
    }
  }

  matchRoute(pattern, path) {
    const [patternPath, patternQuery] = pattern.split("?");
    const [pathWithParams, queryString] = path.split("?");

    const regex = new RegExp(
      "^" + patternPath.replace(/:\w+/g, "([^/]+)") + "$"
    );
    const match = pathWithParams.match(regex);

    if (match) {
      const params = {
        param: path,
        query: {},
      };

      const keys = patternPath.match(/:\w+/g) || [];
      keys.forEach((key, index) => {
        params[key.substring(1)] = match[index + 1];
      });

      if (queryString) {
        const queryParams = new URLSearchParams(queryString);
        for (const [key, value] of queryParams) {
          params.query[key] = value;
        }
      }

      return params;
    }

    return null;
  }

  set(pattern, callback) {
    this.routes.push({ pattern, callback });
  }

  setNotFound(callback) {
    this.notFoundCallback = callback;
  }

  setBefore(callback) {
    this.beforeHook = callback;
  }

  setAfter(callback) {
    this.afterHook = callback;
  }

  escapeHTML(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  unescapeHTML(escaped) {
    return escaped
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }
}