const state = {
  engines: [],
  organizations: [],
  selectedEngineId: null,
  negotiatedEngine: null,
  negotiatedOptions: [],
  negotiatedCompatibility: null,
  directPricePreview: null,
  existingProfiles: [],
  editingExistingProfileId: null,
  multiCombinations: [],
  presseroConfigs: [],
  presseroNegotiatedProfiles: []
};

const els = {
  pageTitle: document.getElementById("pageTitle"),
  viewLinks: document.querySelectorAll("[data-view-link]"),
  views: document.querySelectorAll("[data-view]"),
  syncButton: document.getElementById("syncButton"),
  syncStatus: document.getElementById("syncStatus"),
  refreshButton: document.getElementById("refreshButton"),
  search: document.getElementById("engineSearch"),
  tableBody: document.getElementById("engineTableBody"),
  metricEngines: document.getElementById("metricEngines"),
  metricGroups: document.getElementById("metricGroups"),
  metricCategories: document.getElementById("metricCategories"),
  organizationFilter: document.getElementById("organizationFilter"),
  categoryFilter: document.getElementById("categoryFilter"),
  priceGroupFilter: document.getElementById("priceGroupFilter"),
  engineCountLabel: document.getElementById("engineCountLabel"),
  detailTitle: document.getElementById("detailTitle"),
  detailStatus: document.getElementById("detailStatus"),
  detailPjmId: document.getElementById("detailPjmId"),
  detailMappingsCount: document.getElementById("detailMappingsCount"),
  detailOptionsCount: document.getElementById("detailOptionsCount"),
  mappingList: document.getElementById("mappingList"),
  optionList: document.getElementById("optionList"),
  negotiatedStatus: document.getElementById("negotiatedStatus"),
  npClientId: document.getElementById("npClientId"),
  npOrganizationName: document.getElementById("npOrganizationName"),
  npEngineSelect: document.getElementById("npEngineSelect"),
  npPriceGroupSelect: document.getElementById("npPriceGroupSelect"),
  npProfileMode: document.getElementById("npProfileMode"),
  npVisibilityMode: document.getElementById("npVisibilityMode"),
  npQuantityTiers: document.getElementById("npQuantityTiers"),
  npPricingMode: document.getElementById("npPricingMode"),
  npTierFormula: document.getElementById("npTierFormula"),
  npFormulaTokenSelect: document.getElementById("npFormulaTokenSelect"),
  npInsertFormulaToken: document.getElementById("npInsertFormulaToken"),
  npPreviewButton: document.getElementById("npPreviewButton"),
  npValidateButton: document.getElementById("npValidateButton"),
  npExportButton: document.getElementById("npExportButton"),
  npOptionPicker: document.getElementById("npOptionPicker"),
  npParameterList: document.getElementById("npParameterList"),
  npParameterCount: document.getElementById("npParameterCount"),
  npSelectedCount: document.getElementById("npSelectedCount"),
  npCombinationCount: document.getElementById("npCombinationCount"),
  npTierCount: document.getElementById("npTierCount"),
  npColumnCount: document.getElementById("npColumnCount"),
  npCompatibleCount: document.getElementById("npCompatibleCount"),
  npIncompatibleCount: document.getElementById("npIncompatibleCount"),
  npPreviewColumns: document.getElementById("npPreviewColumns"),
  npExistingProfileCount: document.getElementById("npExistingProfileCount"),
  npExistingProfileList: document.getElementById("npExistingProfileList"),
  npDirectStatus: document.getElementById("npDirectStatus"),
  npDirectPriceList: document.getElementById("npDirectPriceList"),
  npDirectPreviewButton: document.getElementById("npDirectPreviewButton"),
  npDirectSaveButton: document.getElementById("npDirectSaveButton"),
  npAddCombinationButton: document.getElementById("npAddCombinationButton"),
  npMultiSaveButton: document.getElementById("npMultiSaveButton"),
  npMultiCount: document.getElementById("npMultiCount"),
  npMultiList: document.getElementById("npMultiList"),
  npMisIdResult: document.getElementById("npMisIdResult"),
  pcStatus: document.getElementById("pcStatus"),
  pcForm: document.getElementById("pcForm"),
  pcConfigId: document.getElementById("pcConfigId"),
  pcMisProductId: document.getElementById("pcMisProductId"),
  pcName: document.getElementById("pcName"),
  pcOrganizationId: document.getElementById("pcOrganizationId"),
  pcOrganizationName: document.getElementById("pcOrganizationName"),
  pcEngineSelect: document.getElementById("pcEngineSelect"),
  pcPriceGroupSelect: document.getElementById("pcPriceGroupSelect"),
  pcPricingMode: document.getElementById("pcPricingMode"),
  pcNegotiatedProfileSelect: document.getElementById("pcNegotiatedProfileSelect"),
  pcNotes: document.getElementById("pcNotes"),
  pcSaveButton: document.getElementById("pcSaveButton"),
  pcResetButton: document.getElementById("pcResetButton"),
  pcConfigCount: document.getElementById("pcConfigCount"),
  pcConfigList: document.getElementById("pcConfigList")
};

async function getJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
}

async function readErrorMessage(response) {
  const fallback = `HTTP ${response.status}`;

  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await response.json();
      return summarizeError(body?.error || body?.message || fallback);
    }

    const body = await response.text();
    const parsed = new DOMParser().parseFromString(body, "text/html");
    const visibleText = parsed.body?.textContent || body;
    return summarizeError(visibleText || fallback);
  } catch (_error) {
    return fallback;
  }
}

function summarizeError(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function text(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function html(value, fallback = "-") {
  return text(value, fallback)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setMetric(element, value) {
  element.textContent = Number(value || 0).toLocaleString("fr-FR");
}

function setSyncStatus(message, kind = "") {
  els.syncStatus.textContent = message;
  els.syncStatus.classList.toggle("is-error", kind === "error");
  els.syncStatus.classList.toggle("is-success", kind === "success");
}

function setBusyButtons(isBusy) {
  els.refreshButton.disabled = isBusy;
  els.syncButton.disabled = isBusy;
  els.npPreviewButton.disabled = isBusy;
  els.npValidateButton.disabled = isBusy;
  els.npExportButton.disabled = isBusy;
  els.npDirectPreviewButton.disabled = isBusy;
  els.npDirectSaveButton.disabled = isBusy;
  els.npAddCombinationButton.disabled = isBusy;
  els.npMultiSaveButton.disabled = isBusy;
  els.pcSaveButton.disabled = isBusy;
  els.pcResetButton.disabled = isBusy;
}

function setView(viewName) {
  els.views.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === viewName);
  });

  els.viewLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === viewName);
  });

  els.pageTitle.textContent =
    viewName === "negotiated-prices"
      ? "Prix negocies"
      : viewName === "pressero-products"
        ? "Produits Pressero"
        : "Catalogue PJM";
}

function renderSummary(summary) {
  setMetric(els.metricEngines, summary.priceEngines);
  setMetric(els.metricGroups, summary.priceGroups);
  setMetric(els.metricCategories, summary.productCategories);
}

function uniqueOptions(items) {
  return Array.from(items.values()).sort((left, right) => {
    return left.label.localeCompare(right.label, "fr", { sensitivity: "base" });
  });
}

function renderSelectOptions(select, options, allLabel) {
  const currentValue = select.value;
  select.innerHTML = `<option value="">${html(allLabel)}</option>`;

  for (const option of options) {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    select.appendChild(item);
  }

  if (Array.from(select.options).some((option) => option.value === currentValue)) {
    select.value = currentValue;
  }
}

function renderFilters() {
  const categories = new Map();
  const priceGroups = new Map();

  for (const engine of state.engines) {
    if (engine.productCategory) {
      categories.set(engine.productCategory.id, {
        value: engine.productCategory.id,
        label: engine.productCategory.name
      });
    }

    for (const mapping of engine.priceGroupMappings ?? []) {
      const priceGroup = mapping.priceGroup;
      if (!priceGroup) continue;
      priceGroups.set(priceGroup.id, {
        value: priceGroup.id,
        label: priceGroup.name
      });
    }
  }

  renderSelectOptions(
    els.organizationFilter,
    state.organizations.map((organization) => ({
      value: organization.clientId,
      label: organization.name || organization.clientId
    })),
    "Toutes"
  );
  renderSelectOptions(els.categoryFilter, uniqueOptions(categories), "Toutes");
  renderSelectOptions(els.priceGroupFilter, uniqueOptions(priceGroups), "Tous");
  renderNegotiatedEngineSelect();
  renderPresseroEngineSelect();
}

function renderNegotiatedEngineSelect() {
  const options = state.engines.map((engine) => ({
    value: engine.id,
    label: engine.name
  }));
  renderSelectOptions(els.npEngineSelect, options, "Choisir un moteur");
}

function renderPresseroEngineSelect() {
  const options = state.engines.map((engine) => ({
    value: engine.id,
    label: engine.name
  }));
  renderSelectOptions(els.pcEngineSelect, options, "Choisir un moteur");
}

function findEngine(engineId) {
  return state.engines.find((engine) => engine.id === engineId) || null;
}

function renderPriceGroupSelect(select, engine, placeholder = "Choisir un groupe") {
  const currentValue = select.value;
  select.innerHTML = `<option value="">${html(placeholder)}</option>`;

  for (const mapping of engine?.priceGroupMappings ?? []) {
    const item = document.createElement("option");
    item.value = mapping.enginePriceGroupIntegrationId;
    item.textContent = mapping.priceGroup?.name || mapping.enginePriceGroupIntegrationId;
    select.appendChild(item);
  }

  if (Array.from(select.options).some((option) => option.value === currentValue)) {
    select.value = currentValue;
  } else if (select.options.length > 1) {
    select.selectedIndex = 1;
  }
}

function engineMatchesFilters(engine) {
  const query = els.search.value.trim().toLowerCase();
  const organizationId = els.organizationFilter.value;
  const categoryId = els.categoryFilter.value;
  const priceGroupId = els.priceGroupFilter.value;

  if (query && !`${engine.name} ${engine.pjmId}`.toLowerCase().includes(query)) {
    return false;
  }

  if (categoryId && engine.productCategory?.id !== categoryId) {
    return false;
  }

  if (
    priceGroupId &&
    !(engine.priceGroupMappings ?? []).some((mapping) => {
      return mapping.priceGroup?.id === priceGroupId;
    })
  ) {
    return false;
  }

  if (organizationId) {
    const organization = state.organizations.find((item) => item.clientId === organizationId);
    const priceEngineIds = organization?.priceEngineIds ?? [];
    if (priceEngineIds.length && !priceEngineIds.includes(engine.id)) {
      return false;
    }
  }

  return true;
}

function filteredEngines() {
  return state.engines.filter(engineMatchesFilters);
}

function renderEngineRows() {
  const engines = filteredEngines();
  els.tableBody.innerHTML = "";
  els.engineCountLabel.textContent = `${engines.length.toLocaleString("fr-FR")} / ${state.engines.length.toLocaleString("fr-FR")}`;

  if (!engines.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="3" class="empty-state">Aucun moteur</td>';
    els.tableBody.appendChild(row);
    return;
  }

  for (const engine of engines) {
    const row = document.createElement("tr");
    row.tabIndex = 0;
    row.className = engine.id === state.selectedEngineId ? "is-selected" : "";
    row.dataset.engineId = engine.id;
    row.innerHTML = `
      <td>
        <span class="engine-name">${html(engine.name)}</span>
        <span class="engine-id">${html(engine.pjmId)}</span>
      </td>
      <td>${engine._count?.priceGroupMappings ?? engine.priceGroupMappings?.length ?? 0}</td>
      <td>${engine._count?.options ?? 0}</td>
    `;
    row.addEventListener("click", () => selectEngine(engine.id));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectEngine(engine.id);
      }
    });
    els.tableBody.appendChild(row);
  }
}

function applyFilters() {
  const engines = filteredEngines();
  const selectedIsVisible = engines.some((engine) => engine.id === state.selectedEngineId);

  if (selectedIsVisible) {
    renderEngineRows();
    return;
  }

  if (engines[0]) {
    selectEngine(engines[0].id);
    return;
  }

  state.selectedEngineId = null;
  renderEngineRows();
  renderEmptyDetail();
}

function renderEmptyDetail() {
  els.detailTitle.textContent = "Detail moteur";
  els.detailStatus.textContent = "Pret";
  els.detailPjmId.textContent = "-";
  els.detailMappingsCount.textContent = "0";
  els.detailOptionsCount.textContent = "0";
  els.mappingList.innerHTML = '<li class="empty-state">Aucun groupe</li>';
  els.optionList.innerHTML = '<div class="empty-state">Aucune option</div>';
}

function renderEngineDetail(engine) {
  els.detailTitle.textContent = text(engine.name, "Detail moteur");
  els.detailStatus.textContent = engine.isActive ? "Actif" : "Inactif";
  els.detailPjmId.textContent = text(engine.pjmId);
  els.detailMappingsCount.textContent = String(engine.priceGroupMappings?.length ?? 0);
  els.detailOptionsCount.textContent = String(engine.options?.length ?? 0);

  els.mappingList.innerHTML = "";
  const mappings = engine.priceGroupMappings ?? [];
  if (!mappings.length) {
    els.mappingList.innerHTML = '<li class="empty-state">Aucun groupe</li>';
  } else {
    for (const mapping of mappings) {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>${html(mapping.priceGroup?.name)}</strong>
        <span>${html(mapping.enginePriceGroupIntegrationId)}</span>
      `;
      els.mappingList.appendChild(item);
    }
  }

  els.optionList.innerHTML = "";
  const options = engine.options ?? [];
  if (!options.length) {
    els.optionList.innerHTML = '<div class="empty-state">Aucune option</div>';
    return;
  }

  for (const option of options) {
    const item = document.createElement("article");
    item.className = "option-item";
    const choices = option.choices ?? [];
    item.innerHTML = `
      <strong>${html(option.displayName || option.name)}</strong>
      <span>${html(option.pjmId)} - ${choices.length} choix</span>
      <div class="choice-row">
        ${choices.map((choice) => `<span class="choice-chip">${html(choice.name)}</span>`).join("")}
      </div>
    `;
    els.optionList.appendChild(item);
  }
}

async function selectEngine(engineId) {
  state.selectedEngineId = engineId;
  renderEngineRows();
  els.detailStatus.textContent = "Chargement";

  try {
    const response = await getJson(`/pjm-sync/admin/price-engines/${encodeURIComponent(engineId)}`);
    renderEngineDetail(response.data);
  } catch (error) {
    els.detailStatus.textContent = "Erreur";
    els.optionList.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  }
}

function renderNegotiatedPriceGroups(engine) {
  renderPriceGroupSelect(els.npPriceGroupSelect, engine);
}

function extractOptionPjmKey(value) {
  return text(value, "")
    .split(":")
    .filter(Boolean)
    .pop() || text(value, "");
}

function choiceSelectionKey(optionPjmKey, choiceValue) {
  return `${optionPjmKey}\u0000${choiceValue}`;
}

function normalizeNegotiatedOption(option) {
  const optionPjmKey =
    option.pjmKey || extractOptionPjmKey(option.pjmId || option.optionId || option.id);
  const optionId = option.optionId || option.id || option.pjmId || optionPjmKey;

  return {
    optionId,
    optionName: option.optionName || option.displayName || option.name || optionPjmKey,
    pjmKey: optionPjmKey,
    choices: (option.choices ?? []).map((choice) => ({
      choiceId: choice.choiceId || choice.id || choice.pjmId || choice.value,
      choiceName: choice.choiceName || choice.name || choice.label || choice.value,
      pjmValue: text(choice.pjmValue ?? choice.value ?? choice.id ?? choice.choiceId, "")
    }))
  };
}

function getNegotiatedSourceOptions(engine = state.negotiatedEngine) {
  return state.negotiatedOptions.length
    ? state.negotiatedOptions
    : engine?.options ?? [];
}

function collectCalculationParameters(engine = state.negotiatedEngine) {
  const seen = new Set();

  return getNegotiatedSourceOptions(engine)
    .map(normalizeNegotiatedOption)
    .filter((option) => option.optionId && option.pjmKey && option.choices.length === 0)
    .filter((option) => {
      const key = `${option.optionId}\u0000${option.pjmKey}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((option) => ({
      key: option.optionId,
      label: option.optionName,
      pjmKey: option.pjmKey
    }));
}

function normalizeFormulaToken(value) {
  return text(value, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function readFormulaTokens() {
  const tokens = new Set();
  const matches = els.npTierFormula.value.matchAll(/\{([^{}]+)\}/g);

  for (const match of matches) {
    tokens.add(normalizeFormulaToken(match[1]));
  }

  return tokens;
}

function readFixedParameterValues() {
  const values = new Map();
  els.npParameterList.querySelectorAll("[data-parameter-fixed-value]").forEach((input) => {
    values.set(input.dataset.parameterKey, input.value);
  });
  return values;
}

function decorateCalculationParameters(parameters) {
  const formulaTokens = readFormulaTokens();
  const fixedValues = readFixedParameterValues();

  return parameters.map((parameter) => {
    const role = formulaTokens.has(normalizeFormulaToken(parameter.label))
      ? "clientVariable"
      : "adminFixed";

    return {
      ...parameter,
      role,
      fixedValue: role === "adminFixed"
        ? fixedValues.get(parameter.key) ?? ""
        : ""
    };
  });
}

function renderParameterList(parameters) {
  const decoratedParameters = decorateCalculationParameters(parameters);
  els.npParameterCount.textContent = decoratedParameters.length.toLocaleString("fr-FR");
  els.npParameterList.innerHTML = "";

  if (!decoratedParameters.length) {
    els.npParameterList.innerHTML = '<div class="empty-state">Aucun parametre libre.</div>';
    return;
  }

  for (const parameter of decoratedParameters) {
    const item = document.createElement("article");
    item.className = "parameter-item";

    if (parameter.role === "clientVariable") {
      item.innerHTML = `
        <div class="parameter-item-head">
          <strong class="option-picker-title">${html(parameter.label)}</strong>
          <span class="parameter-badge">Variable client</span>
        </div>
        <small>${html(parameter.pjmKey)}</small>
      `;
    } else {
      item.innerHTML = `
        <div class="parameter-item-head">
          <strong class="option-picker-title">${html(parameter.label)}</strong>
          <span class="parameter-badge is-fixed">Valeur fixe</span>
        </div>
        <input type="text"
          data-parameter-fixed-value
          data-parameter-key="${html(parameter.key)}"
          value="${html(parameter.fixedValue)}"
          placeholder="Valeur PJM">
        <small>${html(parameter.pjmKey)}</small>
      `;
    }

    els.npParameterList.appendChild(item);
  }

  els.npParameterList.querySelectorAll("[data-parameter-fixed-value]").forEach((input) => {
    input.addEventListener("input", clearNegotiatedCompatibility);
  });
}

function renderCalculationParameters(engine = state.negotiatedEngine) {
  const selectedValue = els.npFormulaTokenSelect.value;
  const parameters = collectCalculationParameters(engine);
  renderParameterList(parameters);

  els.npFormulaTokenSelect.innerHTML = '<option value="">Aucun parametre</option>';

  for (const parameter of parameters) {
    const item = document.createElement("option");
    item.value = parameter.key;
    item.textContent = parameter.label;
    item.dataset.label = parameter.label;
    item.dataset.pjmKey = parameter.pjmKey;
    els.npFormulaTokenSelect.appendChild(item);
  }

  if (selectedValue) {
    els.npFormulaTokenSelect.value = selectedValue;
  }
}

function insertFormulaToken() {
  const selected = els.npFormulaTokenSelect.selectedOptions[0];
  if (!selected?.value) return;

  const token = `{${selected.dataset.label || selected.textContent}}`;
  const input = els.npTierFormula;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = `${input.value.slice(0, start)}${token}${input.value.slice(end)}`;
  input.focus();
  input.selectionStart = start + token.length;
  input.selectionEnd = start + token.length;
  clearNegotiatedCompatibility();
  renderCalculationParameters();
}

function collectSelectedChoiceKeys() {
  const keys = new Set();
  const selected = els.npOptionPicker.querySelectorAll("[data-negotiated-choice]:checked");

  selected.forEach((checkbox) => {
    keys.add(choiceSelectionKey(checkbox.dataset.optionPjmKey, checkbox.dataset.choiceValue));
  });

  return keys;
}

function optionHasSelection(option, selectedChoiceKeys) {
  return option.choices.some((choice) => {
    return selectedChoiceKeys.has(choiceSelectionKey(option.pjmKey, choice.pjmValue));
  });
}

function getVisibleNegotiatedOptions(options, selectedChoiceKeys) {
  const visible = [];

  for (const option of options) {
    visible.push(option);

    if (!optionHasSelection(option, selectedChoiceKeys)) {
      break;
    }
  }

  return visible;
}

function buildCompatibilitySelections() {
  return readNegotiatedSelections().map((option) => ({
    pjmKey: option.pjmKey,
    pjmValue: option.choices[0]?.pjmValue
  })).filter((selection) => selection.pjmKey && selection.pjmValue);
}

function renderNegotiatedOptions(engine, selectedChoiceKeys = new Set()) {
  const sourceOptions = getNegotiatedSourceOptions(engine);
  const options = sourceOptions
    .map(normalizeNegotiatedOption)
    .filter((option) => option.choices.length > 0);
  const visibleOptions = getVisibleNegotiatedOptions(options, selectedChoiceKeys);
  els.npOptionPicker.innerHTML = "";
  renderCalculationParameters(engine);

  if (!options.length) {
    els.npOptionPicker.innerHTML = '<div class="empty-state">Aucune option disponible pour ce moteur.</div>';
    updateNegotiatedSelectedCount();
    return;
  }

  for (const option of visibleOptions) {
    const item = document.createElement("article");
    item.className = "option-picker-item";

    const choices = option.choices ?? [];
    item.innerHTML = `
      <strong class="option-picker-title">${html(option.optionName)}</strong>
      <div class="choice-checks">
        ${choices.map((choice) => `
          <label class="choice-check">
            <input type="radio"
              name="np-option-${html(option.optionId)}"
              ${selectedChoiceKeys.has(choiceSelectionKey(option.pjmKey, choice.pjmValue)) ? "checked" : ""}
              data-negotiated-choice
              data-option-id="${html(option.optionId)}"
              data-option-name="${html(option.optionName)}"
              data-option-pjm-key="${html(option.pjmKey)}"
              data-choice-id="${html(choice.choiceId)}"
              data-choice-name="${html(choice.choiceName)}"
              data-choice-value="${html(choice.pjmValue)}">
            <span>${html(choice.choiceName)}</span>
          </label>
        `).join("")}
      </div>
    `;
    els.npOptionPicker.appendChild(item);
  }

  els.npOptionPicker.querySelectorAll("[data-negotiated-choice]").forEach((checkbox) => {
    checkbox.addEventListener("change", refreshCompatibleNegotiatedOptions);
  });
  updateNegotiatedSelectedCount();
}

function readNegotiatedSelections() {
  const selectedByOption = new Map();
  const selected = els.npOptionPicker.querySelectorAll("[data-negotiated-choice]:checked");

  selected.forEach((checkbox) => {
    const optionId = checkbox.dataset.optionId;
    const existing = selectedByOption.get(optionId) ?? {
      optionId,
      optionName: checkbox.dataset.optionName,
      pjmKey: checkbox.dataset.optionPjmKey,
      choices: []
    };

    existing.choices.push({
      choiceId: checkbox.dataset.choiceId,
      choiceName: checkbox.dataset.choiceName,
      pjmValue: checkbox.dataset.choiceValue
    });
    selectedByOption.set(optionId, existing);
  });

  return Array.from(selectedByOption.values());
}

function updateNegotiatedSelectedCount() {
  const selectedCount = els.npOptionPicker.querySelectorAll("[data-negotiated-choice]:checked").length;
  els.npSelectedCount.textContent = `${selectedCount.toLocaleString("fr-FR")} choix`;
}

async function refreshCompatibleNegotiatedOptions() {
  updateNegotiatedSelectedCount();
  clearNegotiatedCompatibility();
  const selectedChoiceKeys = collectSelectedChoiceKeys();

  if (!state.negotiatedEngine || !els.npPriceGroupSelect.value) {
    renderNegotiatedOptions(state.negotiatedEngine, selectedChoiceKeys);
    return;
  }

  els.negotiatedStatus.textContent = "Compatibilite";

  try {
    const response = await getJson("/negotiated-prices/compatible-options", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        enginePriceGroupIntegrationId: els.npPriceGroupSelect.value,
        selections: buildCompatibilitySelections()
      })
    });

    state.negotiatedOptions = response.data?.options ?? [];
    renderNegotiatedOptions(state.negotiatedEngine, selectedChoiceKeys);
    els.negotiatedStatus.textContent = "Pret";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    els.npOptionPicker.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  }
}

async function loadNegotiatedEngine() {
  const engineId = els.npEngineSelect.value;
  state.negotiatedEngine = null;
  state.negotiatedOptions = [];
  state.existingProfiles = [];
  state.editingExistingProfileId = null;
  clearMultiCombinations();
  renderNegotiatedPriceGroups(null);
  renderNegotiatedOptions(null);
  renderCalculationParameters(null);
  renderExistingProfiles();

  if (!engineId) return;

  els.negotiatedStatus.textContent = "Chargement";

  try {
    const response = await getJson(`/pjm-sync/admin/price-engines/${encodeURIComponent(engineId)}`);
    state.negotiatedEngine = response.data;
    renderNegotiatedPriceGroups(state.negotiatedEngine);
    await refreshCompatibleNegotiatedOptions();
    await loadExistingProfiles();
    els.negotiatedStatus.textContent = "Pret";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    els.npOptionPicker.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  }
}

function findSelectedPriceGroupName() {
  const selected = els.npPriceGroupSelect.selectedOptions[0];
  return selected ? selected.textContent : "";
}

function buildPricingBasisPayload() {
  const mode = els.npPricingMode.value === "areaM2" ? "areaM2" : "quantity";
  const formula = els.npTierFormula.value.trim();
  const parameters = decorateCalculationParameters(collectCalculationParameters());

  if (mode === "areaM2" && !formula) {
    throw new Error("La formule de calcul m2 est obligatoire.");
  }

  const missingFixedParameter = parameters.find((parameter) => {
    return parameter.role === "adminFixed" && !parameter.fixedValue.trim();
  });

  if (missingFixedParameter) {
    throw new Error(`Renseignez la valeur fixe: ${missingFixedParameter.label}.`);
  }

  return {
    mode,
    formula,
    parameters
  };
}

function buildPreviewPayload() {
  if (!els.npClientId.value.trim()) {
    throw new Error("Organisation ID est obligatoire.");
  }

  if (!state.negotiatedEngine) {
    throw new Error("Choisissez un moteur PJM.");
  }

  if (!els.npPriceGroupSelect.value) {
    throw new Error("Choisissez un groupe de prix.");
  }

  const optionSelections = readNegotiatedSelections();
  if (!optionSelections.length) {
    throw new Error("Selectionnez au moins un choix d'option.");
  }

  return {
    clientId: els.npClientId.value.trim(),
    organizationName: els.npOrganizationName.value.trim(),
    priceEngineId: state.negotiatedEngine.id,
    priceEngineName: state.negotiatedEngine.name,
    enginePriceGroupIntegrationId: els.npPriceGroupSelect.value,
    priceGroupName: findSelectedPriceGroupName(),
    quantityTiersText: els.npQuantityTiers.value,
    pricingBasis: buildPricingBasisPayload(),
    optionSelections
  };
}

function buildPayloadSignature(payload) {
  return JSON.stringify(payload);
}

function showDirectSaveMessage(message, kind = "success") {
  els.npMisIdResult.textContent = message;
  els.npMisIdResult.classList.add("is-visible");
  els.npMisIdResult.classList.toggle("is-error", kind === "error");
  els.npMisIdResult.scrollIntoView({ block: "nearest" });
}

function clearDirectSaveMessage() {
  els.npMisIdResult.textContent = "";
  els.npMisIdResult.classList.remove("is-visible", "is-error");
}

function readVisibilityMode() {
  return els.npVisibilityMode.value === "selectable" ? "selectable" : "hidden";
}

function buildDirectSavePayload() {
  return {
    ...buildPreviewPayload(),
    profileMode: "single",
    visibilityMode: readVisibilityMode(),
    directPrices: readDirectPrices()
  };
}

function currentExistingProfilesUrl() {
  const clientId = els.npClientId.value.trim();
  const priceEngineId = state.negotiatedEngine?.id;
  const enginePriceGroupIntegrationId = els.npPriceGroupSelect.value;

  if (!clientId || !priceEngineId || !enginePriceGroupIntegrationId) {
    return null;
  }

  const params = new URLSearchParams({
    clientId,
    priceEngineId,
    enginePriceGroupIntegrationId
  });
  return `/negotiated-prices/profiles?${params.toString()}`;
}

function existingCombinationKeys() {
  return new Set(
    state.existingProfiles.flatMap((profile) => {
      return (profile.combinations ?? []).map((combination) => combination.combinationKey);
    })
  );
}

function findExistingProfile(profileId) {
  return state.existingProfiles.find((profile) => profile.id === profileId) || null;
}

function formatStoredPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value);
}

function renderExistingTierEditor(profile) {
  const tierRows = (profile.combinations ?? []).flatMap((combination, combinationIndex) => {
    return (combination.tiers ?? []).map((tier) => `
      <label class="existing-tier-row">
        <span>
          <strong>${html(combination.label || `Combinaison ${combinationIndex + 1}`)}</strong>
          <small>Palier ${html(tier.tierValue)} | PJM ${html(formatStoredPrice(tier.pjmPrice))}</small>
        </span>
        <input
          type="number"
          step="0.01"
          value="${html(tier.negotiatedPrice ?? "")}"
          data-existing-tier-id="${html(tier.id)}"
        />
      </label>
    `);
  }).join("");

  return `
    <div class="existing-profile-editor">
      <label>
        <span>Options cote client</span>
        <select data-existing-visibility="${html(profile.id)}">
          <option value="hidden" ${profile.visibilityMode === "hidden" ? "selected" : ""}>Masquees</option>
          <option value="selectable" ${profile.visibilityMode === "selectable" ? "selected" : ""}>Selectionnables</option>
        </select>
      </label>
      <div class="existing-tier-list">
        ${tierRows || '<div class="empty-state">Aucun palier enregistre.</div>'}
      </div>
      <div class="existing-profile-actions">
        <button type="button" class="secondary" data-existing-action="cancel">Annuler</button>
        <button type="button" data-existing-action="save" data-profile-id="${html(profile.id)}">Enregistrer</button>
      </div>
    </div>
  `;
}

function renderExistingProfiles() {
  els.npExistingProfileCount.textContent = state.existingProfiles.length.toLocaleString("fr-FR");
  els.npExistingProfileList.innerHTML = "";

  if (!currentExistingProfilesUrl()) {
    els.npExistingProfileList.innerHTML =
      '<div class="empty-state">Selectionnez une organisation, un moteur et un groupe pour voir les MIS ID existants.</div>';
    return;
  }

  if (!state.existingProfiles.length) {
    els.npExistingProfileList.innerHTML =
      '<div class="empty-state">Aucun MIS ID existant pour ce contexte.</div>';
    return;
  }

  for (const profile of state.existingProfiles) {
    const item = document.createElement("article");
    item.className = "existing-profile-item";
    const combinations = profile.combinations ?? [];
    const isEditing = state.editingExistingProfileId === profile.id;
    item.innerHTML = `
      <div>
        <strong>${html(profile.misId)}</strong>
        <div class="existing-profile-meta">
          <span>${html(profile.profileMode)}</span>
          <span>${html(profile.visibilityMode)}</span>
          <span>${html(String(profile.combinationCount))} combinaisons</span>
          <span>${html(String(profile.tierCount))} paliers</span>
        </div>
      </div>
      <div class="existing-combination-list">
        ${combinations.map((combination) => `
          <span>${html(combination.label || combination.optionSummary || combination.combinationKey)}</span>
        `).join("")}
      </div>
      ${isEditing ? renderExistingTierEditor(profile) : ""}
      <div class="existing-profile-actions">
        <button type="button" class="secondary" data-existing-action="edit" data-profile-id="${html(profile.id)}">
          Modifier
        </button>
        <button type="button" class="danger" data-existing-action="delete" data-profile-id="${html(profile.id)}">
          Supprimer
        </button>
      </div>
    `;
    els.npExistingProfileList.appendChild(item);
  }
}

async function loadExistingProfiles() {
  const url = currentExistingProfilesUrl();

  if (!url) {
    state.existingProfiles = [];
    state.editingExistingProfileId = null;
    renderExistingProfiles();
    return;
  }

  try {
    const response = await getJson(url);
    state.existingProfiles = response.data ?? [];
    if (
      state.editingExistingProfileId &&
      !state.existingProfiles.some((profile) => profile.id === state.editingExistingProfileId)
    ) {
      state.editingExistingProfileId = null;
    }
    renderExistingProfiles();
  } catch (error) {
    state.existingProfiles = [];
    state.editingExistingProfileId = null;
    els.npExistingProfileCount.textContent = "Erreur";
    els.npExistingProfileList.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  }
}

function buildExistingProfileUpdatePayload(profileId) {
  const profile = findExistingProfile(profileId);
  if (!profile) {
    throw new Error("MIS ID introuvable dans la liste chargee.");
  }

  const visibility = els.npExistingProfileList.querySelector(
    `[data-existing-visibility="${profileId}"]`
  );

  return {
    visibilityMode: visibility?.value === "selectable" ? "selectable" : "hidden",
    combinations: (profile.combinations ?? []).map((combination) => ({
      id: combination.id,
      tiers: (combination.tiers ?? []).map((tier) => {
        const input = els.npExistingProfileList.querySelector(
          `[data-existing-tier-id="${tier.id}"]`
        );
        const rawValue = input?.value?.trim() ?? "";
        return {
          id: tier.id,
          negotiatedPrice: rawValue === "" ? null : Number(rawValue)
        };
      })
    }))
  };
}

async function saveExistingProfile(profileId) {
  els.negotiatedStatus.textContent = "Enregistrement";
  setBusyButtons(true);

  try {
    await getJson(`/negotiated-prices/profiles/${encodeURIComponent(profileId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildExistingProfileUpdatePayload(profileId))
    });
    state.editingExistingProfileId = null;
    showDirectSaveMessage("MIS ID mis a jour.");
    await loadExistingProfiles();
    els.negotiatedStatus.textContent = "Enregistre";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    showDirectSaveMessage(error.message, "error");
  } finally {
    setBusyButtons(false);
  }
}

async function deleteExistingProfile(profileId) {
  const profile = findExistingProfile(profileId);
  if (!profile) {
    showDirectSaveMessage("MIS ID introuvable dans la liste chargee.", "error");
    return;
  }

  if (!window.confirm(`Supprimer le MIS ID ${profile.misId} ?`)) {
    return;
  }

  els.negotiatedStatus.textContent = "Suppression";
  setBusyButtons(true);

  try {
    await getJson(`/negotiated-prices/profiles/${encodeURIComponent(profileId)}`, {
      method: "DELETE"
    });
    state.editingExistingProfileId = null;
    showDirectSaveMessage(`MIS ID supprime: ${profile.misId}`);
    await loadExistingProfiles();
    els.negotiatedStatus.textContent = "Supprime";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    showDirectSaveMessage(error.message, "error");
  } finally {
    setBusyButtons(false);
  }
}

async function handleExistingProfileAction(event) {
  const button = event.target.closest("[data-existing-action]");
  if (!button) return;

  const action = button.dataset.existingAction;
  const profileId = button.dataset.profileId;

  if (action === "cancel") {
    state.editingExistingProfileId = null;
    renderExistingProfiles();
    return;
  }

  if (!profileId) return;

  if (action === "edit") {
    state.editingExistingProfileId = profileId;
    renderExistingProfiles();
    return;
  }

  if (action === "save") {
    await saveExistingProfile(profileId);
    return;
  }

  if (action === "delete") {
    await deleteExistingProfile(profileId);
  }
}

function buildMultiSignature(payload) {
  return buildPayloadSignature({
    clientId: payload.clientId,
    priceEngineId: payload.priceEngineId,
    enginePriceGroupIntegrationId: payload.enginePriceGroupIntegrationId,
    quantityTiersText: payload.quantityTiersText,
    pricingBasis: payload.pricingBasis,
    optionSelections: payload.optionSelections
  });
}

function buildCombinationLabel(payload) {
  const labels = payload.optionSelections.flatMap((option) => {
    return option.choices.map((choice) => `${option.optionName}: ${choice.choiceName}`);
  });
  return labels.join(" | ") || payload.priceEngineName;
}

function assertDirectPricesReady(directPrices) {
  if (!directPrices.length) {
    throw new Error("Calculez les paliers PJM avant d'ajouter la combinaison.");
  }

  const missingPrice = directPrices.find((price) => {
    return price.negotiatedPrice === null || price.negotiatedPrice === undefined;
  });

  if (missingPrice) {
    throw new Error(`Prix negocie manquant pour le palier ${missingPrice.quantity}.`);
  }
}

function renderMultiCombinations() {
  els.npMultiCount.textContent = state.multiCombinations.length.toLocaleString("fr-FR");
  els.npMultiList.innerHTML = "";

  if (!state.multiCombinations.length) {
    els.npMultiList.innerHTML =
      '<div class="empty-state">Ajoutez plusieurs combinaisons pour creer un MIS ID global.</div>';
    return;
  }

  state.multiCombinations.forEach((combination, index) => {
    const item = document.createElement("article");
    item.className = "multi-combination-item";
    item.innerHTML = `
      <div>
        <strong>${html(combination.label)}</strong>
        <span>${html(combination.payload.directPrices.length)} paliers negocies</span>
      </div>
      <button class="multi-remove-button" type="button" data-remove-multi-index="${index}" title="Retirer" aria-label="Retirer">x</button>
    `;
    els.npMultiList.appendChild(item);
  });

  els.npMultiList.querySelectorAll("[data-remove-multi-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.multiCombinations.splice(Number(button.dataset.removeMultiIndex), 1);
      renderMultiCombinations();
    });
  });
}

function clearMultiCombinations() {
  state.multiCombinations = [];
  renderMultiCombinations();
}

function clearNegotiatedCompatibility() {
  state.negotiatedCompatibility = null;
  state.directPricePreview = null;
  els.npCompatibleCount.textContent = "-";
  els.npIncompatibleCount.textContent = "-";
  els.npDirectStatus.textContent = "Non calcule";
  clearDirectSaveMessage();
  els.npDirectPriceList.innerHTML =
    '<div class="empty-state">Calculez les paliers PJM pour saisir les prix negocies.</div>';
}

function renderPreview(plan) {
  els.npCombinationCount.textContent = `${Number(plan.combinationCount || 0).toLocaleString("fr-FR")} lignes`;
  els.npTierCount.textContent = Number(plan.quantities?.length || 0).toLocaleString("fr-FR");
  els.npColumnCount.textContent = Number(plan.columns?.length || 0).toLocaleString("fr-FR");
  clearNegotiatedCompatibility();
  els.npPreviewColumns.innerHTML = "";

  for (const column of plan.columns ?? []) {
    const item = document.createElement("span");
    item.className = "column-chip";
    if (column.kind === "pjmPrice") item.classList.add("is-price");
    if (column.kind === "negotiatedPrice") item.classList.add("is-negotiated");
    item.textContent = column.label;
    els.npPreviewColumns.appendChild(item);
  }
}

function renderCompatibilityValidation(result) {
  els.npCompatibleCount.textContent = Number(
    result.compatibleCombinationCount || 0
  ).toLocaleString("fr-FR");
  els.npIncompatibleCount.textContent = Number(
    result.incompatibleCombinationCount || 0
  ).toLocaleString("fr-FR");

  const rawCount = Number(result.rawCombinationCount || 0).toLocaleString("fr-FR");
  const requestCount = Number(result.pjmRequestCount || 0).toLocaleString("fr-FR");
  els.npPreviewColumns.innerHTML = `
    <span class="column-chip is-negotiated">${html(rawCount)} combinaisons brutes</span>
    <span class="column-chip is-price">${html(requestCount)} appels PJM</span>
  `;
}

async function requestCompatibilityValidation(payload) {
  const response = await getJson("/negotiated-prices/validate-combinations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const signature = buildPayloadSignature(payload);
  state.negotiatedCompatibility = {
    signature,
    result: response.data
  };
  renderCompatibilityValidation(response.data);
  return response.data;
}

async function ensureCompatibilityValidation(payload) {
  const signature = buildPayloadSignature(payload);

  if (state.negotiatedCompatibility?.signature === signature) {
    return state.negotiatedCompatibility.result;
  }

  els.negotiatedStatus.textContent = "Verification";
  return requestCompatibilityValidation(payload);
}

function buildExportPayload(payload, validation) {
  return {
    ...payload,
    compatibilityFilter: {
      rawCombinationCount: validation.rawCombinationCount,
      compatibleCombinationCount: validation.compatibleCombinationCount,
      incompatibleCombinationCount: validation.incompatibleCombinationCount,
      compatibleCombinationKeys: validation.compatibleCombinationKeys
    }
  };
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function renderDirectPricePreview(result) {
  state.directPricePreview = result;
  els.npDirectStatus.textContent = `${Number(result.tiers?.length || 0).toLocaleString("fr-FR")} paliers`;
  els.npDirectPriceList.innerHTML = "";
  clearDirectSaveMessage();

  if (!result.tiers?.length) {
    els.npDirectPriceList.innerHTML = '<div class="empty-state">Aucun palier a afficher.</div>';
    return;
  }

  for (const tier of result.tiers) {
    const row = document.createElement("div");
    row.className = "direct-price-row";
    row.innerHTML = `
      <strong>${html(String(tier.quantity))}</strong>
      <span title="${html(tier.warning || "")}">PJM ${html(formatMoney(tier.pjmPrice))}</span>
      <input type="number"
        min="0"
        step="0.01"
        data-direct-negotiated-price
        data-direct-quantity="${html(String(tier.quantity))}"
        data-direct-pjm-price="${html(tier.pjmPrice === null || tier.pjmPrice === undefined ? "" : String(tier.pjmPrice))}"
        placeholder="Prix negocie">
    `;
    els.npDirectPriceList.appendChild(row);
  }
}

function readDirectPrices() {
  return Array.from(
    els.npDirectPriceList.querySelectorAll("[data-direct-negotiated-price]")
  ).map((input) => ({
    quantity: Number(input.dataset.directQuantity),
    pjmPrice: input.dataset.directPjmPrice
      ? Number(input.dataset.directPjmPrice)
      : null,
    negotiatedPrice: input.value === "" ? null : Number(input.value)
  }));
}

async function previewDirectPrices() {
  els.negotiatedStatus.textContent = "Calcul PJM";
  setBusyButtons(true);

  try {
    const response = await getJson("/negotiated-prices/direct-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildPreviewPayload())
    });
    renderDirectPricePreview(response.data);
    els.negotiatedStatus.textContent = response.data?.warnings?.length ? "A verifier" : "Pret";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    els.npDirectPriceList.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  } finally {
    setBusyButtons(false);
  }
}

async function saveDirectPrices() {
  els.negotiatedStatus.textContent = "Enregistrement";
  setBusyButtons(true);

  try {
    if (!state.directPricePreview) {
      const response = await getJson("/negotiated-prices/direct-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(buildPreviewPayload())
      });
      renderDirectPricePreview(response.data);
    }

    const response = await getJson("/negotiated-prices/direct-save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildDirectSavePayload())
    });
    const misId = response.data?.misId;
    if (!misId) {
      throw new Error("Enregistrement effectue sans MISID retourne.");
    }

    showDirectSaveMessage(`MISID: ${misId}`);
    await loadExistingProfiles();
    els.npDirectStatus.textContent = "Enregistre";
    els.negotiatedStatus.textContent = "Enregistre";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    showDirectSaveMessage(error.message, "error");
  } finally {
    setBusyButtons(false);
  }
}

function addCurrentCombinationToMulti() {
  try {
    if (!state.directPricePreview) {
      throw new Error("Calculez les paliers PJM avant d'ajouter la combinaison.");
    }

    const payload = buildDirectSavePayload();
    assertDirectPricesReady(payload.directPrices);
    if (
      state.directPricePreview?.combinationKey &&
      existingCombinationKeys().has(state.directPricePreview.combinationKey)
    ) {
      throw new Error("Cette combinaison existe deja dans un MIS ID existant.");
    }

    const signature = buildMultiSignature(payload);

    if (state.multiCombinations.some((combination) => combination.signature === signature)) {
      throw new Error("Cette combinaison est deja dans le MIS ID.");
    }

    state.multiCombinations.push({
      signature,
      label: buildCombinationLabel(payload),
      payload: {
        ...payload,
        label: buildCombinationLabel(payload)
      }
    });
    renderMultiCombinations();
    els.npProfileMode.value = "multi";
    els.negotiatedStatus.textContent = "Ajoute";
    clearDirectSaveMessage();
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    showDirectSaveMessage(error.message, "error");
  }
}

function buildMultiSavePayload() {
  if (!state.multiCombinations.length) {
    throw new Error("Ajoutez au moins une combinaison au MIS ID.");
  }

  const first = state.multiCombinations[0].payload;
  return {
    clientId: first.clientId,
    organizationName: first.organizationName,
    priceEngineId: first.priceEngineId,
    priceEngineName: first.priceEngineName,
    enginePriceGroupIntegrationId: first.enginePriceGroupIntegrationId,
    priceGroupName: first.priceGroupName,
    visibilityMode: readVisibilityMode(),
    combinations: state.multiCombinations.map((combination) => combination.payload)
  };
}

async function saveMultiCombinations() {
  els.negotiatedStatus.textContent = "Enregistrement";
  setBusyButtons(true);

  try {
    const response = await getJson("/negotiated-prices/multi-save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildMultiSavePayload())
    });
    const misId = response.data?.misId;
    if (!misId) {
      throw new Error("Enregistrement effectue sans MISID retourne.");
    }

    showDirectSaveMessage(
      `MISID: ${misId} (${response.data?.combinationsSaved ?? state.multiCombinations.length} combinaisons)`
    );
    await loadExistingProfiles();
    els.npDirectStatus.textContent = "Enregistre";
    els.negotiatedStatus.textContent = "Enregistre";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    showDirectSaveMessage(error.message, "error");
  } finally {
    setBusyButtons(false);
  }
}

async function previewNegotiatedPrices() {
  els.negotiatedStatus.textContent = "Preview";
  setBusyButtons(true);

  try {
    const response = await getJson("/negotiated-prices/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildPreviewPayload())
    });
    renderPreview(response.data);
    els.negotiatedStatus.textContent = "Pret";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    els.npPreviewColumns.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  } finally {
    setBusyButtons(false);
  }
}

async function validateNegotiatedCompatibility() {
  els.negotiatedStatus.textContent = "Verification";
  setBusyButtons(true);

  try {
    await requestCompatibilityValidation(buildPreviewPayload());
    els.negotiatedStatus.textContent = "Pret";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    els.npPreviewColumns.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  } finally {
    setBusyButtons(false);
  }
}

function readDownloadFileName(response) {
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  return match?.[1] || "prix-negocies.xlsx";
}

async function exportNegotiatedPrices() {
  els.negotiatedStatus.textContent = "Export";
  setBusyButtons(true);

  try {
    const payload = buildPreviewPayload();
    const validation = await ensureCompatibilityValidation(payload);

    if (!validation.compatibleCombinationCount) {
      throw new Error("Aucune combinaison compatible a exporter.");
    }

    els.negotiatedStatus.textContent = "Export";
    const response = await fetch("/negotiated-prices/export", {
      method: "POST",
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildExportPayload(payload, validation))
    });

    if (!response.ok) {
      const message = await readErrorMessage(response);
      throw new Error(message || `HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = readDownloadFileName(response);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    els.negotiatedStatus.textContent = "Pret";
  } catch (error) {
    els.negotiatedStatus.textContent = "Erreur";
    els.npPreviewColumns.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  } finally {
    setBusyButtons(false);
  }
}

function resetPresseroConfigForm() {
  els.pcConfigId.value = "";
  els.pcMisProductId.value = "";
  els.pcName.value = "";
  els.pcOrganizationId.value = "";
  els.pcOrganizationName.value = "";
  els.pcEngineSelect.value = "";
  els.pcPriceGroupSelect.innerHTML = '<option value="">Choisir un groupe</option>';
  els.pcPricingMode.value = "pjmLive";
  els.pcNegotiatedProfileSelect.innerHTML = '<option value="">Aucune grille negociee</option>';
  els.pcNotes.value = "";
  state.presseroNegotiatedProfiles = [];
  els.pcStatus.textContent = "Pret";
}

function renderPresseroConfigs() {
  els.pcConfigCount.textContent = state.presseroConfigs.length.toLocaleString("fr-FR");
  els.pcConfigList.innerHTML = "";

  if (!state.presseroConfigs.length) {
    els.pcConfigList.innerHTML = '<div class="empty-state">Aucune configuration Pressero.</div>';
    return;
  }

  for (const config of state.presseroConfigs) {
    const item = document.createElement("article");
    item.className = "pressero-config-item";
    item.innerHTML = `
      <div>
        <strong>${html(config.misProductId)}</strong>
        <span>${html(config.name)} | ${html(config.pricingMode === "negotiated" ? "Prix negocie" : "PJM standard")}</span>
        <small>${html(config.organizationIntegrationId)} | ${html(config.priceEngineName)} | ${html(config.priceGroupName)}</small>
        ${config.negotiatedPricingMisId ? `<small>Grille negociee interne: ${html(config.negotiatedPricingMisId)}</small>` : ""}
      </div>
      <div class="pressero-config-actions">
        <button type="button" class="secondary" data-pc-action="copy" data-config-id="${html(config.id)}">Copier</button>
        <button type="button" class="secondary" data-pc-action="edit" data-config-id="${html(config.id)}">Modifier</button>
        <button type="button" class="danger" data-pc-action="delete" data-config-id="${html(config.id)}">Supprimer</button>
      </div>
    `;
    els.pcConfigList.appendChild(item);
  }
}

async function loadPresseroProductConfigs() {
  try {
    const response = await getJson("/pressero-config/admin/product-configs");
    state.presseroConfigs = response.data ?? [];
    renderPresseroConfigs();
  } catch (error) {
    els.pcConfigCount.textContent = "Erreur";
    els.pcConfigList.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  }
}

function currentPresseroContextUrl() {
  const clientId = els.pcOrganizationId.value.trim();
  const priceEngineId = els.pcEngineSelect.value;
  const enginePriceGroupIntegrationId = els.pcPriceGroupSelect.value;

  if (!clientId || !priceEngineId || !enginePriceGroupIntegrationId) {
    return null;
  }

  const params = new URLSearchParams({
    clientId,
    priceEngineId,
    enginePriceGroupIntegrationId
  });
  return `/negotiated-prices/profiles?${params.toString()}`;
}

async function loadPresseroNegotiatedProfiles(selectedProfileId = "") {
  els.pcNegotiatedProfileSelect.innerHTML = '<option value="">Aucune grille negociee</option>';
  state.presseroNegotiatedProfiles = [];

  if (els.pcPricingMode.value !== "negotiated") {
    return;
  }

  const url = currentPresseroContextUrl();
  if (!url) {
    return;
  }

  try {
    const response = await getJson(url);
    state.presseroNegotiatedProfiles = response.data ?? [];
    for (const profile of state.presseroNegotiatedProfiles) {
      const item = document.createElement("option");
      item.value = profile.id;
      item.textContent = `${profile.misId} (${profile.combinationCount} combinaisons)`;
      els.pcNegotiatedProfileSelect.appendChild(item);
    }

    if (
      selectedProfileId &&
      Array.from(els.pcNegotiatedProfileSelect.options).some((option) => {
        return option.value === selectedProfileId;
      })
    ) {
      els.pcNegotiatedProfileSelect.value = selectedProfileId;
    }
  } catch (error) {
    els.pcNegotiatedProfileSelect.innerHTML =
      `<option value="">Erreur: ${html(error.message)}</option>`;
  }
}

function buildPresseroConfigPayload() {
  const selectedPriceGroup = els.pcPriceGroupSelect.selectedOptions[0];
  return {
    misProductId: els.pcMisProductId.value.trim(),
    name: els.pcName.value.trim(),
    pricingMode: els.pcPricingMode.value === "negotiated" ? "negotiated" : "pjmLive",
    organizationIntegrationId: els.pcOrganizationId.value.trim(),
    organizationName: els.pcOrganizationName.value.trim(),
    priceEngineId: els.pcEngineSelect.value,
    enginePriceGroupIntegrationId: els.pcPriceGroupSelect.value,
    priceGroupName: selectedPriceGroup?.textContent || "",
    negotiatedProfileId:
      els.pcPricingMode.value === "negotiated" ? els.pcNegotiatedProfileSelect.value : null,
    notes: els.pcNotes.value.trim()
  };
}

async function savePresseroConfig(event) {
  event.preventDefault();
  els.pcStatus.textContent = "Enregistrement";
  setBusyButtons(true);

  try {
    const configId = els.pcConfigId.value;
    const response = await getJson(
      configId
        ? `/pressero-config/admin/product-configs/${encodeURIComponent(configId)}`
        : "/pressero-config/admin/product-configs",
      {
        method: configId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(buildPresseroConfigPayload())
      }
    );

    els.pcConfigId.value = response.data?.id ?? "";
    els.pcMisProductId.value = response.data?.misProductId ?? "";
    els.pcStatus.textContent = "Enregistre";
    await loadPresseroProductConfigs();
  } catch (error) {
    els.pcStatus.textContent = "Erreur";
    els.pcConfigList.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  } finally {
    setBusyButtons(false);
  }
}

async function editPresseroConfig(configId) {
  const config = state.presseroConfigs.find((item) => item.id === configId);
  if (!config) return;

  els.pcConfigId.value = config.id;
  els.pcMisProductId.value = config.misProductId;
  els.pcName.value = config.name;
  els.pcOrganizationId.value = config.organizationIntegrationId;
  els.pcOrganizationName.value = config.organizationName ?? "";
  els.pcEngineSelect.value = config.priceEngineId;
  renderPriceGroupSelect(els.pcPriceGroupSelect, findEngine(config.priceEngineId));
  els.pcPriceGroupSelect.value = config.enginePriceGroupIntegrationId;
  els.pcPricingMode.value = config.pricingMode;
  els.pcNotes.value = config.notes ?? "";
  await loadPresseroNegotiatedProfiles(config.negotiatedProfileId ?? "");
  els.pcStatus.textContent = "Edition";
}

async function deletePresseroConfig(configId) {
  const config = state.presseroConfigs.find((item) => item.id === configId);
  if (!config) return;

  if (!window.confirm(`Supprimer la configuration ${config.misProductId} ?`)) {
    return;
  }

  els.pcStatus.textContent = "Suppression";
  setBusyButtons(true);

  try {
    await getJson(`/pressero-config/admin/product-configs/${encodeURIComponent(configId)}`, {
      method: "DELETE"
    });
    if (els.pcConfigId.value === configId) {
      resetPresseroConfigForm();
    }
    await loadPresseroProductConfigs();
    els.pcStatus.textContent = "Supprime";
  } catch (error) {
    els.pcStatus.textContent = "Erreur";
    els.pcConfigList.innerHTML = `<div class="error-state">${html(error.message)}</div>`;
  } finally {
    setBusyButtons(false);
  }
}

async function copyPresseroMisProductId(configId) {
  const config = state.presseroConfigs.find((item) => item.id === configId);
  if (!config) return;

  try {
    await navigator.clipboard.writeText(config.misProductId);
    els.pcStatus.textContent = "Copie";
  } catch (_error) {
    els.pcStatus.textContent = config.misProductId;
  }
}

async function handlePresseroConfigAction(event) {
  const button = event.target.closest("[data-pc-action]");
  if (!button) return;

  const configId = button.dataset.configId;
  if (!configId) return;

  if (button.dataset.pcAction === "edit") {
    await editPresseroConfig(configId);
    return;
  }

  if (button.dataset.pcAction === "copy") {
    await copyPresseroMisProductId(configId);
    return;
  }

  if (button.dataset.pcAction === "delete") {
    await deletePresseroConfig(configId);
  }
}

async function loadDashboard() {
  setBusyButtons(true);
  els.detailStatus.textContent = "Chargement";

  try {
    const [
      summaryResponse,
      enginesResponse,
      organizationsResponse,
      presseroConfigsResponse
    ] = await Promise.all([
      getJson("/pjm-sync/admin/summary"),
      getJson("/pjm-sync/admin/price-engines"),
      getJson("/pjm-sync/admin/organizations"),
      getJson("/pressero-config/admin/product-configs")
    ]);

    renderSummary(summaryResponse.data);
    state.engines = enginesResponse.data ?? [];
    state.organizations = organizationsResponse.data ?? [];
    state.presseroConfigs = presseroConfigsResponse.data ?? [];
    renderFilters();
    renderPresseroConfigs();

    if (!state.selectedEngineId && state.engines[0]) {
      state.selectedEngineId = state.engines[0].id;
    }

    renderEngineRows();

    if (state.selectedEngineId) {
      await selectEngine(state.selectedEngineId);
    } else {
      renderEmptyDetail();
    }
  } catch (error) {
    els.tableBody.innerHTML = `<tr><td colspan="3" class="error-state">${html(error.message)}</td></tr>`;
    renderEmptyDetail();
    els.detailStatus.textContent = "Erreur";
  } finally {
    setBusyButtons(false);
  }
}

async function runPjmUpdate() {
  setBusyButtons(true);
  setSyncStatus("Synchronisation PJM en cours");
  els.detailStatus.textContent = "Sync";

  try {
    const response = await getJson("/pjm-sync/admin/sync", {
      method: "POST"
    });
    const result = response.data || {};
    setSyncStatus(
      `Sync terminee: ${Number(result.enginesProcessed || 0).toLocaleString("fr-FR")} moteurs, ${Number(result.mappingsProcessed || 0).toLocaleString("fr-FR")} mappings`,
      "success"
    );
    await loadDashboard();
  } catch (error) {
    setSyncStatus(error.message, "error");
    els.detailStatus.textContent = "Erreur";
  } finally {
    setBusyButtons(false);
  }
}

els.syncButton.addEventListener("click", runPjmUpdate);
els.refreshButton.addEventListener("click", loadDashboard);
els.search.addEventListener("input", applyFilters);
els.organizationFilter.addEventListener("change", applyFilters);
els.categoryFilter.addEventListener("change", applyFilters);
els.priceGroupFilter.addEventListener("change", applyFilters);
els.npEngineSelect.addEventListener("change", loadNegotiatedEngine);
els.npPriceGroupSelect.addEventListener("change", () => {
  clearMultiCombinations();
  state.negotiatedOptions = [];
  state.existingProfiles = [];
  state.editingExistingProfileId = null;
  renderPreview({ columns: [], quantities: [], combinationCount: 0 });
  renderExistingProfiles();
  refreshCompatibleNegotiatedOptions();
  loadExistingProfiles();
});
[
  els.npClientId,
  els.npOrganizationName,
  els.npQuantityTiers,
  els.npPricingMode,
  els.npTierFormula
].forEach((field) => {
  field.addEventListener("input", () => {
    clearNegotiatedCompatibility();
    clearMultiCombinations();
    if (field === els.npClientId) {
      state.editingExistingProfileId = null;
      loadExistingProfiles();
    }
  });
  field.addEventListener("change", () => {
    clearNegotiatedCompatibility();
    clearMultiCombinations();
    if (field === els.npClientId) {
      state.editingExistingProfileId = null;
      loadExistingProfiles();
    }
  });
});
els.npTierFormula.addEventListener("input", () => renderCalculationParameters());
els.npTierFormula.addEventListener("change", () => renderCalculationParameters());
els.npInsertFormulaToken.addEventListener("click", insertFormulaToken);
els.npPreviewButton.addEventListener("click", previewNegotiatedPrices);
els.npValidateButton.addEventListener("click", validateNegotiatedCompatibility);
els.npExportButton.addEventListener("click", exportNegotiatedPrices);
els.npDirectPreviewButton.addEventListener("click", previewDirectPrices);
els.npDirectSaveButton.addEventListener("click", saveDirectPrices);
els.npAddCombinationButton.addEventListener("click", addCurrentCombinationToMulti);
els.npMultiSaveButton.addEventListener("click", saveMultiCombinations);
els.npExistingProfileList.addEventListener("click", handleExistingProfileAction);
els.pcForm.addEventListener("submit", savePresseroConfig);
els.pcResetButton.addEventListener("click", resetPresseroConfigForm);
els.pcConfigList.addEventListener("click", handlePresseroConfigAction);
els.pcEngineSelect.addEventListener("change", () => {
  renderPriceGroupSelect(els.pcPriceGroupSelect, findEngine(els.pcEngineSelect.value));
  loadPresseroNegotiatedProfiles();
});
[
  els.pcOrganizationId,
  els.pcPriceGroupSelect,
  els.pcPricingMode
].forEach((field) => {
  field.addEventListener("input", () => loadPresseroNegotiatedProfiles());
  field.addEventListener("change", () => loadPresseroNegotiatedProfiles());
});
els.viewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setView(link.dataset.viewLink);
  });
});

renderMultiCombinations();
loadDashboard();
