(function () {
  "use strict";

  const all = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const one = (selector, scope = document) => scope.querySelector(selector);

  function showToast(message) {
    const toast = one("#demo-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function selectTab(targetId, moveFocus) {
    const selected = one(`[data-tab-target="${targetId}"]`);
    if (!selected) return;
    const group = selected.closest("[role='tablist']");
    all("[data-tab-target]", group).forEach((button) => {
      const active = button === selected;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    all(".tab-panel").forEach((panel) => {
      panel.hidden = panel.id !== targetId;
    });
    const title = selected.dataset.pageTitle;
    const summary = selected.dataset.pageSummary;
    if (title && one("#view-title")) one("#view-title").textContent = title;
    if (summary && one("#view-summary")) one("#view-summary").textContent = summary;
    if (moveFocus) selected.focus();
  }

  all("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => selectTab(button.dataset.tabTarget, false));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      const tabs = all("[data-tab-target]", button.closest("[role='tablist']"));
      let next = tabs.indexOf(button);
      if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (next + 1) % tabs.length;
      if (["ArrowUp", "ArrowLeft"].includes(event.key)) next = (next - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      event.preventDefault();
      selectTab(tabs[next].dataset.tabTarget, true);
    });
  });

  all("[data-open-dialog]").forEach((button) => {
    button.addEventListener("click", () => openDialog(one(`#${button.dataset.openDialog}`)));
  });

  all("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest("dialog")));
  });

  all("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });

  all("[data-detail]").forEach((trigger) => {
    const showDetail = (event) => {
      if (event.target.closest("[data-demo-action]")) return;
      const template = one(`#${trigger.dataset.detail}`);
      const dialog = one("#detail-dialog");
      const body = one("[data-detail-body]", dialog);
      const title = one("[data-detail-title]", dialog);
      if (!template || !dialog || !body) return;
      title.textContent = template.dataset.title || "Feature detail";
      body.innerHTML = template.innerHTML;
      openDialog(dialog);
    };
    trigger.addEventListener("click", showDetail);
    if (!trigger.matches("button, a")) {
      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        showDetail(event);
      });
    }
  });

  all("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const container = button.closest("[data-filter-group]");
      all("[data-filter]", container).forEach((item) => item.classList.toggle("active", item === button));
      const value = button.dataset.filter;
      all("[data-filter-value]", container.parentElement).forEach((item) => {
        item.hidden = value !== "all" && item.dataset.filterValue !== value;
      });
    });
  });

  all("[data-demo-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const message = button.dataset.demoAction;
      if (button.dataset.nextLabel) {
        button.textContent = button.dataset.nextLabel;
        button.classList.remove("solid-button");
        button.classList.add("outline-button");
      }
      showToast(message);
    });
  });

  const regionSelect = one("#region-select");
  if (regionSelect) {
    const regionCopy = {
      north: { stats: ["2", "2", "1"], team: "Team Indigo", lead: "Sofia M.", support: "Maya K.", label: "North" },
      west: { stats: ["3", "2", "2"], team: "Team Ember", lead: "Amara J.", support: "Leo B.", label: "West" },
      global: { stats: ["6", "6", "3"], team: "All sample teams", lead: "Regional view", support: "Shared coverage", label: "All hubs" }
    };
    regionSelect.addEventListener("change", () => {
      const view = regionCopy[regionSelect.value];
      all("[data-region-stat]").forEach((stat, index) => { stat.textContent = view.stats[index]; });
      if (one("[data-active-team]")) one("[data-active-team]").textContent = view.team;
      if (one("[data-active-lead]")) one("[data-active-lead]").textContent = view.lead;
      if (one("[data-active-support]")) one("[data-active-support]").textContent = view.support;
      all(".schedule-column h4 span").forEach((label) => { label.textContent = view.label; });
      showToast(`View updated with synthetic ${regionSelect.options[regionSelect.selectedIndex].text} coverage data.`);
    });
  }

  const countdown = one("[data-shift-countdown]");
  if (countdown) {
    let seconds = (2 * 60 * 60) + (18 * 60) + 42;
    window.setInterval(() => {
      seconds = seconds > 0 ? seconds - 1 : (8 * 60 * 60);
      const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const remainder = String(seconds % 60).padStart(2, "0");
      countdown.textContent = `${hours}:${minutes}:${remainder}`;
    }, 1000);
  }

  const rotaBody = one("#rota-body");
  if (rotaBody) {
    const people = ["Maya K.", "Sofia M.", "Daniel R.", "Noah T."];
    const times = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
    times.forEach((time) => {
      const row = document.createElement("tr");
      const timeCell = document.createElement("th");
      timeCell.scope = "row";
      timeCell.textContent = time;
      row.append(timeCell);
      for (let index = 0; index < 6; index += 1) {
        const cell = document.createElement("td");
        const select = document.createElement("select");
        select.className = "shift-slot";
        select.setAttribute("aria-label", `${time} assignment slot ${index + 1}`);
        ["—", ...people].forEach((name) => {
          const option = document.createElement("option");
          option.textContent = name;
          select.append(option);
        });
        select.addEventListener("change", () => select.classList.toggle("filled", select.value !== "—"));
        cell.append(select);
        row.append(cell);
      }
      rotaBody.append(row);
    });

    all("[data-planner-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const slots = all(".shift-slot");
        if (button.dataset.plannerAction === "populate") {
          slots.forEach((slot, index) => {
            const column = index % 6;
            slot.value = column === 2 || column === 5 ? "—" : people[(index + Math.floor(index / 6)) % people.length];
            slot.classList.toggle("filled", slot.value !== "—");
          });
          showToast("The fictional rota was auto-populated using sample availability.");
        }
        if (button.dataset.plannerAction === "clear" || button.dataset.plannerAction === "reset") {
          slots.forEach((slot) => { slot.value = "—"; slot.classList.remove("filled"); });
          if (button.dataset.plannerAction === "reset") {
            all("#shift-team, #shift-lead, #support-lead, #extra-member").forEach((select) => { select.selectedIndex = 0; });
          }
          showToast(button.dataset.plannerAction === "reset" ? "All sample shift inputs were reset." : "The sample rota was cleared.");
        }
      });
    });
  }

  const extraMember = one("#extra-member");
  if (extraMember) {
    extraMember.addEventListener("change", () => {
      if (extraMember.selectedIndex === 0) return;
      showToast(`${extraMember.value} was added to the fictional team.`);
    });
  }

  const addSampleActivity = one("#add-sample-activity");
  if (addSampleActivity) {
    addSampleActivity.addEventListener("click", () => {
      const slot = one("[data-live-activity-slot]");
      const person = one("#activity-person").value;
      const type = one("#activity-type").value;
      const start = one("#activity-start").value;
      const end = one("#activity-end").value;
      if (!slot) return;
      slot.classList.remove("empty");
      const label = document.createElement("span");
      label.textContent = "Projects";
      const items = document.createElement("div");
      const activity = document.createElement("span");
      activity.className = "activity-chip orange";
      activity.textContent = `${person} · ${type} · ${start}–${end}`;
      items.append(activity);
      slot.replaceChildren(label, items);
    });
  }

  const readinessSearch = one("#readiness-search");
  if (readinessSearch) {
    readinessSearch.addEventListener("input", () => {
      const term = readinessSearch.value.trim().toLowerCase();
      all("[data-readiness-row]").forEach((row) => { row.hidden = !row.textContent.toLowerCase().includes(term); });
    });
  }

  all("[data-report-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      all("[data-report-filter]").forEach((item) => item.classList.toggle("active", item === button));
      const filter = button.dataset.reportFilter;
      let visible = 0;
      all("[data-report-region]").forEach((row) => {
        row.hidden = filter !== "all" && row.dataset.reportRegion !== filter;
        if (!row.hidden) visible += 1;
      });
      if (one("[data-report-count]")) one("[data-report-count]").textContent = String(visible);
    });
  });

  const adminForm = one("#admin-form");
  if (adminForm) {
    adminForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const alias = one("#admin-alias").value.trim();
      const hubs = all("input[name='hub']:checked", adminForm).map((input) => input.value);
      if (!alias || hubs.length === 0) {
        showToast("Add a fictional alias and select at least one sample hub.");
        return;
      }
      const row = document.createElement("tr");
      const values = [alias, "", `${Math.min(6, hubs.length + 2)} pages`, "portfolio.demo", "New sample", ""];
      values.forEach((value, index) => {
        const cell = document.createElement("td");
        if (index === 0) {
          const strong = document.createElement("strong");
          strong.textContent = value;
          cell.append(strong);
        } else if (index === 1) {
          hubs.forEach((hub) => {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = hub;
            cell.append(tag);
          });
        } else if (index === 5) {
          const edit = document.createElement("button");
          edit.type = "button";
          edit.className = "mini-action";
          edit.textContent = "Edit";
          edit.addEventListener("click", () => showToast("Editing is simulated in this portfolio preview."));
          const revoke = document.createElement("button");
          revoke.type = "button";
          revoke.className = "mini-action danger";
          revoke.textContent = "Revoke";
          revoke.addEventListener("click", () => showToast("Access removal is simulated; no account was changed."));
          cell.append(edit, revoke);
        } else {
          cell.textContent = value;
        }
        row.append(cell);
      });
      one("#admin-table-body").prepend(row);
      adminForm.reset();
      one("input[name='hub']", adminForm).checked = true;
      showToast("A fictional administrator was added to this local preview.");
    });
  }

  const plannedWorkCategory = one("#request-category");
  const equipmentSystem = one("#equipment-system");
  const plannedWorkEquipment = {
    cooling: [
      ["ahu", "AHU"],
      ["crahu", "CRAHU"],
      ["air_conditioning_system", "Air conditioning system"],
      ["cooling_pump", "Cooling pump"],
      ["heat_exchanger", "Heat exchanger"]
    ],
    power: [
      ["generator", "Generator"],
      ["ups", "UPS"],
      ["power_distribution_unit", "Power distribution unit"],
      ["transformer", "Transformer"],
      ["switchgear", "Switchgear"]
    ],
    network: [
      ["network_rack", "Network rack"],
      ["core_switch", "Core switch"],
      ["router", "Router"],
      ["patch_panel", "Patch panel"],
      ["fibre_distribution_panel", "Fibre distribution panel"]
    ]
  };

  function selectedLabel(select) {
    return select && select.selectedIndex >= 0 ? select.options[select.selectedIndex].text : "";
  }

  function jsonDisplay(value) {
    return JSON.stringify(value || "");
  }

  function syncPlannedWorkOutput() {
    if (!plannedWorkCategory || !equipmentSystem) return;
    const reference = one("#request-ref").value.trim();
    const area = one("#area-identifier").value.trim();
    const plannedDate = one("#request-date").value;
    const equipmentLabel = selectedLabel(equipmentSystem);
    const categoryLabel = selectedLabel(plannedWorkCategory);

    const outputValues = {
      "#output-reference": reference,
      "#output-category": plannedWorkCategory.value,
      "#output-equipment": equipmentSystem.value,
      "#output-area": area,
      "#output-date": plannedDate
    };
    Object.entries(outputValues).forEach(([selector, value]) => {
      const target = one(selector);
      if (target) target.textContent = jsonDisplay(value);
    });

    const textValues = {
      "#review-equipment": equipmentLabel,
      "#review-area": area,
      "#log-reference": reference,
      "#log-category": categoryLabel,
      "#log-equipment": equipmentLabel,
      "#log-area": area
    };
    Object.entries(textValues).forEach(([selector, value]) => {
      const target = one(selector);
      if (target) target.textContent = value;
    });
  }

  if (plannedWorkCategory && equipmentSystem) {
    plannedWorkCategory.addEventListener("change", () => {
      equipmentSystem.replaceChildren();
      plannedWorkEquipment[plannedWorkCategory.value].forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        equipmentSystem.append(option);
      });
      syncPlannedWorkOutput();
    });
    equipmentSystem.addEventListener("change", syncPlannedWorkOutput);
    all("#request-ref, #request-date, #area-identifier").forEach((input) => input.addEventListener("input", syncPlannedWorkOutput));
    syncPlannedWorkOutput();
  }

  const runAnalysis = one("#run-analysis");
  if (runAnalysis) {
    runAnalysis.addEventListener("click", () => {
      syncPlannedWorkOutput();
      runAnalysis.disabled = true;
      runAnalysis.textContent = "Analysing sample…";
      window.setTimeout(() => {
        runAnalysis.disabled = false;
        runAnalysis.textContent = "Run sample analysis";
        all("[data-analysis-result]").forEach((item) => item.classList.add("done"));
        selectTab("ai-review", false);
        showToast("Synthetic request analysed. No operational system was contacted.");
      }, 650);
    });
  }

  const buildOutput = one("#build-output");
  if (buildOutput) {
    buildOutput.addEventListener("click", () => {
      syncPlannedWorkOutput();
      selectTab("structured-output", false);
      showToast("A demonstration payload was generated from synthetic inputs.");
    });
  }

  const submitSample = one("#submit-sample");
  if (submitSample) {
    submitSample.addEventListener("click", () => {
      syncPlannedWorkOutput();
      const newRow = one("#new-log-row");
      if (newRow) newRow.hidden = false;
      selectTab("submission-log", false);
      showToast("Demo API submission recorded with area and equipment fields. No external request was sent.");
    });
  }

  const bridgeStatus = one("#bridge-status-select");
  if (bridgeStatus) {
    bridgeStatus.addEventListener("change", () => {
      const selectedStatus = bridgeStatus.options[bridgeStatus.selectedIndex].text;
      const badge = one("#bridge-status-badge");
      if (badge) {
        badge.textContent = selectedStatus;
        badge.className = `status ${bridgeStatus.value}`;
      }
      const notificationStatus = one("#bridge-notification-status");
      if (notificationStatus) notificationStatus.textContent = selectedStatus;
      showToast("Synthetic event status updated and a notification preview was prepared.");
    });
  }

  const riskAlerts = {
    "weather-ca": { severity: "Extreme", severityClass: "extreme", title: "Blizzard conditions", area: "Canada · Northern regions", issued: "02 Sep · 14:10 UTC", expires: "03 Sep · 06:00 UTC", type: "Weather alert" },
    "weather-ie": { severity: "Severe", severityClass: "severe", title: "Wind and coastal flooding", area: "Ireland · Western counties", issued: "02 Sep · 15:25 UTC", expires: "03 Sep · 02:00 UTC", type: "Weather alert" },
    "crisis-fr": { severity: "Severe", severityClass: "severe", title: "Road-access disruption", area: "France · Central urban districts", issued: "02 Sep · 16:40 UTC", expires: "Review at 20:00 UTC", type: "Crisis alert" },
    "weather-br": { severity: "Severe", severityClass: "severe", title: "Heavy rainfall", area: "Brazil · Coastal states", issued: "02 Sep · 13:50 UTC", expires: "02 Sep · 23:45 UTC", type: "Weather alert" },
    "weather-jp": { severity: "Extreme", severityClass: "extreme", title: "Tropical storm", area: "Japan · Southern prefectures", issued: "02 Sep · 12:20 UTC", expires: "03 Sep · 11:30 UTC", type: "Weather alert" },
    "crisis-za": { severity: "Extreme", severityClass: "extreme", title: "Regional transport blockade", area: "South Africa · Selected metropolitan corridors", issued: "02 Sep · 17:05 UTC", expires: "Review at 04:00 UTC", type: "Crisis alert" }
  };

  all("[data-alert-id]").forEach((marker) => {
    marker.addEventListener("click", () => {
      const alert = riskAlerts[marker.dataset.alertId];
      const card = one("#map-alert-card");
      if (!alert || !card) return;
      card.hidden = false;
      one("#map-alert-severity").textContent = alert.severity;
      one("#map-alert-severity").className = `severity-badge ${alert.severityClass}`;
      one("#map-alert-title").textContent = alert.title;
      one("#map-alert-area").textContent = alert.area;
      one("#map-alert-issued").textContent = alert.issued;
      one("#map-alert-expires").textContent = alert.expires;
      one("#map-alert-type").textContent = alert.type;
      all("[data-alert-id]").forEach((item) => item.removeAttribute("aria-current"));
      marker.setAttribute("aria-current", "true");
    });
  });

  const closeMapAlert = one("#close-map-alert");
  if (closeMapAlert) {
    closeMapAlert.addEventListener("click", () => {
      const card = one("#map-alert-card");
      if (card) card.hidden = true;
      all("[data-alert-id]").forEach((marker) => marker.removeAttribute("aria-current"));
    });
  }

  function selectAlertTab(tab, moveFocus) {
    all("[data-alert-tab]").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    all(".alert-table-panel").forEach((panel) => {
      panel.hidden = panel.id !== tab.dataset.alertTab;
    });
    if (moveFocus) tab.focus();
  }

  all("[data-alert-tab]").forEach((tab) => {
    tab.addEventListener("click", () => selectAlertTab(tab, false));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      const tabs = all("[data-alert-tab]");
      let next = tabs.indexOf(tab);
      if (event.key === "ArrowRight") next = (next + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (next - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      event.preventDefault();
      selectAlertTab(tabs[next], true);
    });
  });

  const refreshAlerts = one("#refresh-alerts");
  if (refreshAlerts) {
    refreshAlerts.addEventListener("click", () => {
      one("#risk-update-time").textContent = "Updated moments ago";
      showToast("Fictional weather and crisis alert data refreshed.");
    });
  }
})();
