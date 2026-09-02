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
      ireland: ["8", "6", "1", "1"],
      emea: ["21", "16", "3", "2"],
      global: ["48", "36", "7", "5"]
    };
    regionSelect.addEventListener("change", () => {
      const values = regionCopy[regionSelect.value];
      all("[data-region-stat]").forEach((stat, index) => { stat.textContent = values[index]; });
      showToast(`View updated with synthetic ${regionSelect.options[regionSelect.selectedIndex].text} coverage data.`);
    });
  }

  const runAnalysis = one("#run-analysis");
  if (runAnalysis) {
    runAnalysis.addEventListener("click", () => {
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
      selectTab("structured-output", false);
      showToast("A demonstration payload was generated from synthetic inputs.");
    });
  }

  const submitSample = one("#submit-sample");
  if (submitSample) {
    submitSample.addEventListener("click", () => {
      const newRow = one("#new-log-row");
      if (newRow) newRow.hidden = false;
      selectTab("submission-log", false);
      showToast("Demo submission recorded locally. No API call was made.");
    });
  }

  const bridgeStatus = one("#bridge-status-select");
  if (bridgeStatus) {
    bridgeStatus.addEventListener("change", () => {
      const badge = one("#bridge-status-badge");
      if (badge) {
        badge.textContent = bridgeStatus.options[bridgeStatus.selectedIndex].text;
        badge.className = `status ${bridgeStatus.value}`;
      }
      showToast("Synthetic event status updated and a notification preview was prepared.");
    });
  }
})();
