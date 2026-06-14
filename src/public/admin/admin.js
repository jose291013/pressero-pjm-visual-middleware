const state = {
  engines: [],
  organizations: [],
  selectedEngineId: null,
  negotiatedEngine: null
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
  npQuantityTiers: document.getElementById("npQuantityTiers"),
  npPreviewButton: document.getElementById("npPreviewButton"),
  npOptionPicker: document.getElementById("npOptionPicker"),
  npSelectedCount: document.getElementById("npSelectedCount"),
  npCombinationCount: document.getElementById("npCombinationCount"),
  npTierCount: document.getElementById("npTierCount"),
  npColumnCount: document.getElementById("npColumnCount"),
  npPreviewColumns: document.getElementById("npPreviewColumns")
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
}

function setView(viewName) {
  els.views.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === viewName);
  });

  els.viewLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === viewName);
  });

  els.pageTitle.textContent =
    viewName === "negotiated-prices" ? "Prix negocies" : "Catalogue PJM";
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
}

function renderNegotiatedEngineSelect() {
  const options = state.engines.map((engine) => ({
    value: engine.id,
    label: engine.name
  }));
  renderSelectOptions(els.npEngineSelect, options, "Choisir un moteur");
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
  els.npPriceGroupSelect.innerHTML = '<option value="">Choisir un groupe</option>';

  for (const mapping of engine?.priceGroupMappings ?? []) {
    const item = document.createElement("option");
    item.value = mapping.enginePriceGroupIntegrationId;
    item.textContent = mapping.priceGroup?.name || mapping.enginePriceGroupIntegrationId;
    els.npPriceGroupSelect.appendChild(item);
  }

  if (els.npPriceGroupSelect.options.length > 1) {
    els.npPriceGroupSelect.selectedIndex = 1;
  }
}

function renderNegotiatedOptions(engine) {
  const options = engine?.options ?? [];
  els.npOptionPicker.innerHTML = "";

  if (!options.length) {
    els.npOptionPicker.innerHTML = '<div class="empty-state">Aucune option disponible pour ce moteur.</div>';
    updateNegotiatedSelectedCount();
    return;
  }

  for (const option of options) {
    const item = document.createElement("article");
    item.className = "option-picker-item";

    const choices = option.choices ?? [];
    item.innerHTML = `
      <strong class="option-picker-title">${html(option.displayName || option.name)}</strong>
      <div class="choice-checks">
        ${choices.map((choice) => `
          <label class="choice-check">
            <input type="checkbox"
              data-option-id="${html(option.id)}"
              data-option-name="${html(option.displayName || option.name)}"
              data-option-pjm-key="${html(option.pjmId)}"
              data-choice-id="${html(choice.id)}"
              data-choice-name="${html(choice.name)}"
              data-choice-value="${html(choice.value)}">
            <span>${html(choice.name)}</span>
          </label>
        `).join("")}
      </div>
    `;
    els.npOptionPicker.appendChild(item);
  }

  els.npOptionPicker.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", updateNegotiatedSelectedCount);
  });
  updateNegotiatedSelectedCount();
}

function readNegotiatedSelections() {
  const selectedByOption = new Map();
  const selected = els.npOptionPicker.querySelectorAll("input[type='checkbox']:checked");

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
  const selectedCount = els.npOptionPicker.querySelectorAll("input[type='checkbox']:checked").length;
  els.npSelectedCount.textContent = `${selectedCount.toLocaleString("fr-FR")} choix`;
}

async function loadNegotiatedEngine() {
  const engineId = els.npEngineSelect.value;
  state.negotiatedEngine = null;
  renderNegotiatedPriceGroups(null);
  renderNegotiatedOptions(null);

  if (!engineId) return;

  els.negotiatedStatus.textContent = "Chargement";

  try {
    const response = await getJson(`/pjm-sync/admin/price-engines/${encodeURIComponent(engineId)}`);
    state.negotiatedEngine = response.data;
    renderNegotiatedPriceGroups(state.negotiatedEngine);
    renderNegotiatedOptions(state.negotiatedEngine);
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
    optionSelections
  };
}

function renderPreview(plan) {
  els.npCombinationCount.textContent = `${Number(plan.combinationCount || 0).toLocaleString("fr-FR")} lignes`;
  els.npTierCount.textContent = Number(plan.quantities?.length || 0).toLocaleString("fr-FR");
  els.npColumnCount.textContent = Number(plan.columns?.length || 0).toLocaleString("fr-FR");
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

async function previewNegotiatedPrices() {
  els.negotiatedStatus.textContent = "Preview";

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
  }
}

async function loadDashboard() {
  setBusyButtons(true);
  els.detailStatus.textContent = "Chargement";

  try {
    const [summaryResponse, enginesResponse, organizationsResponse] = await Promise.all([
      getJson("/pjm-sync/admin/summary"),
      getJson("/pjm-sync/admin/price-engines"),
      getJson("/pjm-sync/admin/organizations")
    ]);

    renderSummary(summaryResponse.data);
    state.engines = enginesResponse.data ?? [];
    state.organizations = organizationsResponse.data ?? [];
    renderFilters();

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
els.npPreviewButton.addEventListener("click", previewNegotiatedPrices);
els.viewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setView(link.dataset.viewLink);
  });
});

loadDashboard();
