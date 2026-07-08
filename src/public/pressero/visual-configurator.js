(function () {
  "use strict";

  if (window.__PRESSERO_PJM_VISUAL_CONFIGURATOR__) return;
  window.__PRESSERO_PJM_VISUAL_CONFIGURATOR__ = true;

  var script = document.currentScript;
  var runtimeConfig = window.PresseroPjmVisualConfig || {};
  var rootId = "pressero-pjm-visual-configurator";
  var state = {
    config: null,
    bindings: [],
    renderTimer: null,
    observer: null,
    isRendering: false,
    shieldTimer: null
  };

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function readScriptOrigin() {
    if (!script || !script.src) return window.location.origin;
    try {
      return new URL(script.src).origin;
    } catch (_error) {
      return window.location.origin;
    }
  }

  function readMisProductId() {
    var params = new URLSearchParams(window.location.search);
    return runtimeConfig.misProductId ||
      (script && script.dataset ? script.dataset.misProductId : "") ||
      params.get("misProductId") ||
      document.body.getAttribute("data-mis-product-id") ||
      "";
  }

  function buildConfigUrl(misProductId) {
    var baseUrl = String(runtimeConfig.baseUrl || readScriptOrigin()).replace(/\/+$/, "");
    return baseUrl +
      "/pressero-config/public/products/" +
      encodeURIComponent(misProductId) +
      "/visual-config";
  }

  function injectStyles() {
    if (document.getElementById("pressero-pjm-visual-styles")) return;

    var style = document.createElement("style");
    style.id = "pressero-pjm-visual-styles";
    style.textContent = [
      "#pressero-pjm-visual-configurator{display:block;background:#fff;border:1px solid #d7deea;border-radius:8px;padding:16px;margin:0 0 18px 0;box-sizing:border-box}",
      "#pressero-pjm-visual-configurator[hidden]{display:none!important}",
      ".ppv-title{margin:0 0 14px 0;font-size:20px;font-weight:700;color:#111827}",
      ".ppv-section{margin:0 0 18px 0}",
      ".ppv-section:last-child{margin-bottom:0}",
      ".ppv-label{display:block;margin:0 0 8px 0;font-size:14px;font-weight:700;color:#1f2937}",
      ".ppv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:10px}",
      ".ppv-choice{display:flex;min-height:116px;align-items:center;justify-content:center;flex-direction:column;gap:8px;padding:9px;border:2px solid #d7deea;border-radius:8px;background:#fff;color:#111827;cursor:pointer;text-align:center;box-sizing:border-box}",
      ".ppv-choice:hover{border-color:#2563eb}",
      ".ppv-choice.is-selected{border-color:#16833a;box-shadow:0 0 0 3px rgba(22,131,58,.14)}",
      ".ppv-choice img{display:block;width:76px;height:76px;object-fit:contain;pointer-events:none}",
      ".ppv-choice span{font-size:13px;line-height:1.2;font-weight:600}",
      ".ppv-native-hidden{position:absolute!important;left:-99999px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}",
      ".ppv-generic-quantity-hidden{display:none!important}",
      ".ppv-warning{font-size:13px;color:#b45309;margin:6px 0 0 0}",
      "html.ppv-active.lock-scroll,body.ppv-active.lock-scroll{overflow:auto!important;position:static!important}",
      "body.ppv-active.pc-busy{cursor:auto!important}",
      "body.ppv-active #uiLock,body.ppv-active #pcGlobalNavOverlay,body.ppv-active #myCustomLoaderLocal,body.ppv-active .k-loading-mask,body.ppv-active .k-loading-image,body.ppv-active .k-loading-color{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}",
      "body.ppv-active #pressero-pjm-visual-configurator .k-loading-mask,body.ppv-active #pressero-pjm-visual-configurator .k-loading-image,body.ppv-active #pressero-pjm-visual-configurator .k-loading-color{display:none!important}"
    ].join("");
    document.head.appendChild(style);
  }

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  }

  function findInsertAnchor() {
    return document.querySelector("[data-pressero-pjm-visual-anchor]") ||
      document.getElementById("calcParmInputs") ||
      document.querySelector("[id*='pricing'], [class*='pricing']") ||
      document.querySelector("form") ||
      document.body.firstElementChild;
  }

  function findPricingContainer(anchor) {
    if (!anchor || !anchor.closest) return null;
    return anchor.closest("#pricingArea,#pricingEngineArea,.pricingArea,.pricingEngineArea,.calculatorInputs,.calculatorResults");
  }

  function visualInsertTarget(anchor) {
    var pricingContainer = findPricingContainer(anchor);
    if (pricingContainer && pricingContainer.parentNode) {
      return pricingContainer;
    }
    return anchor;
  }

  function placeRoot(root) {
    var anchor = findInsertAnchor();
    var target = visualInsertTarget(anchor);
    if (target && target.parentNode && root.nextSibling !== target) {
      target.parentNode.insertBefore(root, target);
    } else if (!root.parentNode) {
      document.body.prepend(root);
    }
  }

  function ensureRoot() {
    var root = document.getElementById(rootId);
    if (root) {
      placeRoot(root);
      return root;
    }

    root = document.createElement("div");
    root.id = rootId;
    root.hidden = true;
    root.setAttribute("data-no-ui-lock", "1");

    placeRoot(root);

    return root;
  }

  function hardShield() {
    document.documentElement.classList.add("ppv-active");
    document.body.classList.add("ppv-active");
    document.documentElement.classList.remove("lock-scroll");
    document.body.classList.remove("lock-scroll");
    document.body.classList.remove("pc-busy");

    ["uiLock", "pcGlobalNavOverlay", "myCustomLoaderLocal"].forEach(function (id) {
      var element = document.getElementById(id);
      if (!element) return;
      element.classList.remove("active");
      element.setAttribute("aria-hidden", "true");
      element.style.setProperty("display", "none", "important");
      element.style.setProperty("opacity", "0", "important");
      element.style.setProperty("visibility", "hidden", "important");
      element.style.setProperty("pointer-events", "none", "important");
    });
  }

  function startTemporaryShield() {
    hardShield();
    window.clearInterval(state.shieldTimer);
    var startedAt = Date.now();
    state.shieldTimer = window.setInterval(function () {
      hardShield();
      if (Date.now() - startedAt > 2200) {
        window.clearInterval(state.shieldTimer);
        state.shieldTimer = null;
      }
    }, 80);
  }

  function restoreScroll(left, top) {
    window.scrollTo(left, top);
  }

  function optionValues(select) {
    return Array.prototype.map.call(select.options || [], function (option) {
      return [
        normalize(option.value),
        normalize(option.textContent)
      ];
    }).reduce(function (all, values) {
      return all.concat(values);
    }, []);
  }

  function choiceValues(choice) {
    return [
      choice.value,
      choice.pjmId,
      choice.label
    ].concat(choice.valueAliases || [])
      .map(normalize)
      .filter(Boolean);
  }

  function nativeOptionTokens(option) {
    return [
      option.value,
      option.textContent
    ].map(normalize).filter(Boolean);
  }

  function labelForSelector(id) {
    if (!id) return null;
    if (window.CSS && typeof window.CSS.escape === "function") {
      return "label[for='" + window.CSS.escape(id) + "']";
    }
    return "label[for='" + String(id).replace(/'/g, "\\'") + "']";
  }

  function labelNearField(field) {
    var id = field.id;
    var selector = labelForSelector(id);
    var label = selector ? document.querySelector(selector) : null;
    if (label) return label.textContent || "";

    var group = field.closest("li,.form-group,.field,div");
    var groupLabel = group ? group.querySelector("label") : null;
    return groupLabel ? groupLabel.textContent || "" : "";
  }

  function scoreSelectForOption(select, option) {
    var values = optionValues(select);
    var matchingValues = option.choices.filter(function (choice) {
      return choiceValues(choice).some(function (value) {
        return values.indexOf(value) >= 0;
      });
    }).length;

    var label = normalize(labelNearField(select));
    var labelScore = label &&
      (label.indexOf(normalize(option.label)) >= 0 ||
        label.indexOf(normalize(option.name)) >= 0)
      ? 2
      : 0;

    return matchingValues * 10 + labelScore;
  }

  function findNativeField(option) {
    var selects = Array.prototype.slice.call(document.querySelectorAll("select"));
    var best = selects
      .map(function (select) {
        return {
          select: select,
          score: scoreSelectForOption(select, option)
        };
      })
      .sort(function (left, right) {
        return right.score - left.score;
      })[0];

    return best && best.score > 0 ? best.select : null;
  }

  function nativeFieldGroup(field) {
    return field.closest("li,.form-group,.field") || field.parentElement;
  }

  function markNativeField(field) {
    var group = nativeFieldGroup(field);
    if (group) {
      group.classList.add("ppv-native-hidden");
    } else {
      field.classList.add("ppv-native-hidden");
    }
  }

  function isQuantityOption(option) {
    var label = normalize([
      option.label,
      option.name,
      option.optionType
    ].join(" "));
    return label.indexOf("quantity") >= 0 ||
      label.indexOf("quantite") >= 0 ||
      label.indexOf("exemplaire") >= 0;
  }

  function hideGenericQuantityField() {
    var inputs = Array.prototype.slice.call(
      document.querySelectorAll("input:not([type='hidden']), select")
    );

    inputs.forEach(function (input) {
      var group = nativeFieldGroup(input);
      var label = normalize(labelNearField(input));
      if (group && label === "quantity") {
        group.classList.add("ppv-generic-quantity-hidden");
      }
    });
  }

  function hasPjmQuantityField() {
    var inputs = Array.prototype.slice.call(
      document.querySelectorAll("input:not([type='hidden']), select")
    );

    return inputs.some(function (input) {
      var label = normalize(labelNearField(input));
      return label !== "quantity" &&
        (label.indexOf("quantite") >= 0 ||
          label.indexOf("exemplaire") >= 0);
    });
  }

  function setNativeValue(field, value) {
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;

    field.value = String(value);
    Array.prototype.forEach.call(field.options || [], function (option) {
      option.selected = String(option.value) === String(value);
    });

    startTemporaryShield();
    field.dispatchEvent(new Event("change", { bubbles: true }));
    restoreScroll(scrollLeft, scrollTop);
    window.setTimeout(function () {
      restoreScroll(scrollLeft, scrollTop);
      hardShield();
    }, 0);
    window.setTimeout(function () {
      restoreScroll(scrollLeft, scrollTop);
      hardShield();
    }, 120);
    window.setTimeout(function () {
      restoreScroll(scrollLeft, scrollTop);
      hardShield();
    }, 450);
  }

  function resolveNativeValue(field, choice) {
    var aliases = choiceValues(choice);
    var nativeOption = Array.prototype.find.call(field.options || [], function (option) {
      return nativeOptionTokens(option).some(function (value) {
        return aliases.indexOf(value) >= 0;
      });
    });

    return nativeOption ? nativeOption.value : choice.value;
  }

  function hasNativeChoice(field, choice) {
    var aliases = choiceValues(choice);
    return Array.prototype.some.call(field.options || [], function (option) {
      return nativeOptionTokens(option).some(function (value) {
        return aliases.indexOf(value) >= 0;
      });
    });
  }

  function visibleChoicesForNativeField(field, choices) {
    if (!field || !field.options || !field.options.length) {
      return choices;
    }

    return choices.filter(function (choice) {
      return hasNativeChoice(field, choice);
    });
  }

  function isNeutralChoice(choice) {
    var values = choiceValues(choice).concat([
      choice.label,
      choice.name,
      choice.value
    ]).map(normalize).filter(Boolean);

    return values.some(function (value) {
      return [
        "aucun",
        "none",
        "no",
        "non",
        "sans",
        "select",
        "--select--",
        "choisir"
      ].indexOf(value) >= 0;
    });
  }

  function shouldHideVisualOption(choices) {
    return choices.length === 1 && isNeutralChoice(choices[0]);
  }

  function syncSelection(section, field) {
    var value = String(field.value || "");
    section.querySelectorAll(".ppv-choice").forEach(function (button) {
      var selected = button.getAttribute("data-native-value") === value;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function renderChoice(choice, field, section) {
    var nativeValue = resolveNativeValue(field, choice);
    var button = document.createElement("button");
    button.type = "button";
    button.className = "ppv-choice";
    button.setAttribute("data-value", choice.value);
    button.setAttribute("data-native-value", nativeValue);
    button.setAttribute("aria-pressed", "false");

    if (choice.image && choice.image.url) {
      var image = document.createElement("img");
      image.src = choice.image.url;
      image.alt = choice.image.altText || choice.label;
      image.loading = "lazy";
      button.appendChild(image);
    }

    var label = document.createElement("span");
    label.textContent = choice.label;
    button.appendChild(label);

    button.addEventListener("click", function (event) {
      event.preventDefault();
      setNativeValue(field, nativeValue);
      syncSelection(section, field);
    });

    return button;
  }

  function renderOption(option, root) {
    var field = findNativeField(option);
    if (!field) return null;

    var visibleChoices = visibleChoicesForNativeField(field, option.choices);
    if (shouldHideVisualOption(visibleChoices)) {
      markNativeField(field);
      return null;
    }

    var section = document.createElement("section");
    section.className = "ppv-section";
    section.setAttribute("data-option-id", option.pjmId);

    var label = document.createElement("strong");
    label.className = "ppv-label";
    label.textContent = option.label || option.name;
    section.appendChild(label);

    var grid = document.createElement("div");
    grid.className = "ppv-grid";
    visibleChoices.forEach(function (choice) {
      grid.appendChild(renderChoice(choice, field, section));
    });

    if (!grid.children.length) {
      return null;
    }

    markNativeField(field);

    section.appendChild(grid);
    root.appendChild(section);

    field.addEventListener("change", function () {
      syncSelection(section, field);
    });
    syncSelection(section, field);

    state.bindings.push({
      option: option,
      field: field
    });

    return section;
  }

  function renderConfig(config) {
    state.isRendering = true;
    hardShield();
    var root = ensureRoot();
    root.innerHTML = "";
    state.bindings = [];

    var title = document.createElement("h2");
    title.className = "ppv-title";
    title.textContent = config.name || "Configuration";
    root.appendChild(title);

    (config.options || []).forEach(function (option) {
      renderOption(option, root);
    });

    if ((config.options || []).some(isQuantityOption) || hasPjmQuantityField()) {
      hideGenericQuantityField();
    }

    if (!state.bindings.length) {
      var warning = document.createElement("p");
      warning.className = "ppv-warning";
      warning.textContent = "Aucune option visuelle ne correspond aux champs Pressero de cette page.";
      root.appendChild(warning);
    }

    root.hidden = false;
    window.setTimeout(function () {
      state.isRendering = false;
    }, 0);
  }

  function scheduleRender() {
    if (!state.config || state.isRendering) return;

    window.clearTimeout(state.renderTimer);
    state.renderTimer = window.setTimeout(function () {
      renderConfig(state.config);
    }, 250);
  }

  function observePresseroRerenders() {
    if (state.observer || !document.body || typeof MutationObserver !== "function") {
      return;
    }

    state.observer = new MutationObserver(function (mutations) {
      if (state.isRendering) return;

      var shouldRender = mutations.some(function (mutation) {
        return mutation.type === "childList" &&
          (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0);
      });

      if (shouldRender) {
        scheduleRender();
      }
    });
    state.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async function load() {
    injectStyles();
    hardShield();
    var misProductId = readMisProductId();
    if (!misProductId) return;

    var response = await fetch(buildConfigUrl(misProductId), {
      credentials: "omit",
      headers: {
        Accept: "application/json"
      }
    });
    if (!response.ok) return;

    var payload = await response.json();
    state.config = payload.data || payload;
    renderConfig(state.config);
    observePresseroRerenders();
  }

  onReady(function () {
    load().catch(function (_error) {
      ensureRoot().hidden = true;
    });
  });
})();
