// ========================================================
// CONTRÔLEUR DES ONGLETS HORIZONTAUX (tabs.html)
// Avec réorganisation fluide par appui long & persistance
// ========================================================
(function () {
  "use strict";

  const STORAGE_KEY = "meteo_active_tab_horizontal";
  const TABS_ORDER_KEY = "meteo_tabs_order_v2";

  document.addEventListener("DOMContentLoaded", () => {
    const tabsNav = document.getElementById("horizontalTabsNav") || document.querySelector(".horizontal-tabs-nav");
    const panels = {
      meteociel: document.getElementById("meteocielCitySection"),
      ecmwf: document.getElementById("ecmwfSection"),
      arome: document.getElementById("aromeSection"),
      romma: document.getElementById("rommaSection"),
      meteoblue: document.getElementById("meteoblueSection"),
      safety: document.getElementById("safetySection"),
      webcams: document.getElementById("webcamsSection")
    };

    // 1. Restauration de l'ordre personnalisé des onglets
    function restoreTabsOrder() {
      if (!tabsNav) return;
      try {
        const savedOrder = JSON.parse(localStorage.getItem(TABS_ORDER_KEY));
        if (Array.isArray(savedOrder) && savedOrder.length > 0) {
          const btnMap = {};
          tabsNav.querySelectorAll(".tab-nav-btn").forEach(btn => {
            if (btn.dataset.tab) btnMap[btn.dataset.tab] = btn;
          });
          savedOrder.forEach(tabKey => {
            if (btnMap[tabKey]) {
              tabsNav.appendChild(btnMap[tabKey]);
              delete btnMap[tabKey];
            }
          });
          Object.values(btnMap).forEach(btn => tabsNav.appendChild(btn));
        }
      } catch (err) {
        console.warn("Erreur restauration ordre des onglets:", err);
      }
    }

    restoreTabsOrder();

    let tabButtons = document.querySelectorAll(".tab-nav-btn");

    function saveTabsOrder() {
      if (!tabsNav) return;
      try {
        const order = Array.from(tabsNav.querySelectorAll(".tab-nav-btn"))
          .map(btn => btn.dataset.tab)
          .filter(Boolean);
        localStorage.setItem(TABS_ORDER_KEY, JSON.stringify(order));
      } catch (err) {
        console.warn("Erreur sauvegarde ordre onglets:", err);
      }
    }

    function refreshComponents() {
      if (typeof window.refreshMeteoComponents === "function") {
        window.refreshMeteoComponents();
      }
      window.dispatchEvent(new Event("resize"));
    }

    function switchTab(tabKey, userInitiated = false) {
      if (!panels[tabKey]) tabKey = "meteociel";

      tabButtons = document.querySelectorAll(".tab-nav-btn");

      // Mise à jour de l'état actif des boutons
      tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === tabKey;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        if (isActive && userInitiated) {
          try {
            btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          } catch (_) {}
        }
      });

      // Affichage du panneau correspondant et masquage des autres
      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        const isActive = key === tabKey;
        if (isActive) {
          panel.classList.add("active-tab-panel");
          panel.classList.remove("collapsed");
          panel.style.display = "block";
          const body = panel.querySelector(".accordion-body");
          if (body) {
            body.classList.remove("collapsed");
            body.style.display = "block";
          }
          const header = panel.querySelector(".accordion-header");
          if (header) {
            header.classList.remove("collapsed");
            header.setAttribute("aria-expanded", "true");
          }
        } else {
          panel.classList.remove("active-tab-panel");
          panel.style.display = "none";
        }
      });

      // Forcer le redimensionnement immédiat des graphiques et cartes interactives (Leaflet, Canvas)
      refreshComponents();
      setTimeout(refreshComponents, 80);
      setTimeout(refreshComponents, 250);

      try {
        localStorage.setItem(STORAGE_KEY, tabKey);
      } catch (_) {}
    }

    // ========================================================
    // DOUBLE-CLIC SUR UN ONGLET -> SITE OFFICIEL
    // APPUI LONG SUR UN ONGLET -> POP-UP DE RÉORGANISATION
    // ========================================================
    const TAB_LINK_IDS = {
      meteociel: "meteocielExtLink",
      ecmwf: "yrLink",
      arome: "meteofranceLink",
      romma: "rommaExtLink",
      meteoblue: "meteoblueExtLink",
      webcams: "webcamsExtLink"
    };
    const SAFETY_URL = "https://meteofrance.com/meteo-montagne/alpes-du-nord";

    function getTabExternalUrl(tabKey) {
      if (tabKey === "safety") return SAFETY_URL;
      if (tabKey === "arome") {
        const link = document.getElementById("meteofranceLink");
        if (link && link.href && link.href.includes("meteofrance.com")) {
          return link.href;
        }
        return "https://meteofrance.com/";
      }
      const link = document.getElementById(TAB_LINK_IDS[tabKey]);
      return link && link.href ? link.href : null;
    }

    async function openExternalTab(tabKey) {
      if (!tabKey) return;
      if (tabKey === "arome") {
        if (typeof window.getMeteofranceTargetUrlAsync === "function") {
          try {
            const url = await window.getMeteofranceTargetUrlAsync();
            if (url) {
              window.open(url, "_blank");
              return;
            }
          } catch (_) {}
        }
      }
      const url = getTabExternalUrl(tabKey);
      if (url) {
        window.open(url, "_blank");
      }
    }

    const LONG_PRESS_MS = 500;
    const DOUBLE_TAP_MS = 500;
    let longPressTimer = null;
    let pressStartX = 0;
    let pressStartY = 0;
    let suppressClick = false;
    let lastTapKey = null;
    let lastTapTime = 0;

    function initTabInteractions() {
      if (!tabsNav) return;

      tabsNav.querySelectorAll("img").forEach(img => {
        img.setAttribute("draggable", "false");
        img.addEventListener("dragstart", (e) => e.preventDefault());
      });

      tabsNav.querySelectorAll(".tab-nav-btn").forEach(btn => {
        btn.setAttribute("draggable", "false");
        btn.addEventListener("dragstart", (e) => e.preventDefault());
        btn.addEventListener("contextmenu", (e) => e.preventDefault());
        btn.addEventListener("pointerdown", onPointerDown);
      });

      function clearPress() {
        clearTimeout(longPressTimer);
        longPressTimer = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", clearPress);
        window.removeEventListener("pointercancel", clearPress);
      }

      function onPointerDown(e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        pressStartX = e.clientX;
        pressStartY = e.clientY;
        suppressClick = false;
        clearPress();
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerup", clearPress);
        window.addEventListener("pointercancel", clearPress);
        longPressTimer = setTimeout(() => {
          clearPress();
          suppressClick = true;
          if (navigator.vibrate) {
            try { navigator.vibrate(20); } catch (_) {}
          }
          openReorderPopup();
        }, LONG_PRESS_MS);
      }

      function onPointerMove(e) {
        // Défilement horizontal de la barre -> pas d'appui long
        if (Math.abs(e.clientX - pressStartX) > 10 || Math.abs(e.clientY - pressStartY) > 10) {
          clearPress();
        }
      }

      // Clic : changer d'onglet • Double-clic (ou double tap) : ouvrir le site officiel
      tabsNav.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-nav-btn");
        if (!btn) return;
        if (suppressClick) {
          suppressClick = false;
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const key = btn.dataset.tab;
        const now = Date.now();
        if (lastTapKey === key && now - lastTapTime < DOUBLE_TAP_MS) {
          lastTapKey = null;
          lastTapTime = 0;
          openExternalTab(key);
          return;
        }
        lastTapKey = key;
        lastTapTime = now;
        switchTab(key, true);
      });

      // Double-clic direct à la souris sur PC
      tabsNav.addEventListener("dblclick", (e) => {
        const btn = e.target.closest(".tab-nav-btn");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        lastTapKey = null;
        lastTapTime = 0;
        openExternalTab(btn.dataset.tab);
      });
    }

    // Pop-up de réorganisation des onglets
    function openReorderPopup() {
      if (!tabsNav || document.querySelector(".tabs-reorder-overlay")) return;

      const overlay = document.createElement("div");
      overlay.className = "tabs-reorder-overlay";
      overlay.innerHTML = `
        <div class="tabs-reorder-dialog" role="dialog" aria-modal="true" aria-label="Réorganiser les onglets">
          <div class="tabs-reorder-header">
            <span>Réorganiser les onglets</span>
            <button type="button" class="tabs-reorder-close" aria-label="Fermer">✕</button>
          </div>
          <ul class="tabs-reorder-list"></ul>
          <button type="button" class="tabs-reorder-done">Terminé</button>
        </div>
      `;
      const list = overlay.querySelector(".tabs-reorder-list");

      function renderList(movedKey) {
        const btns = Array.from(tabsNav.querySelectorAll(".tab-nav-btn"));
        list.innerHTML = "";
        btns.forEach((btn, idx) => {
          const img = btn.querySelector("img");
          const label = btn.querySelector("span");
          const li = document.createElement("li");
          li.className = "tabs-reorder-item" + (btn.dataset.tab === movedKey ? " just-moved" : "");
          li.innerHTML = `
            <img src="${img ? img.getAttribute("src") : ""}" alt="">
            <span class="tabs-reorder-name">${label ? label.textContent : btn.dataset.tab}</span>
            <button type="button" class="tabs-reorder-move" data-dir="-1" aria-label="Monter" ${idx === 0 ? "disabled" : ""}>▲</button>
            <button type="button" class="tabs-reorder-move" data-dir="1" aria-label="Descendre" ${idx === btns.length - 1 ? "disabled" : ""}>▼</button>
          `;
          li.querySelectorAll(".tabs-reorder-move").forEach(mv => {
            mv.addEventListener("click", () => {
              const dir = parseInt(mv.dataset.dir, 10);
              const all = Array.from(tabsNav.querySelectorAll(".tab-nav-btn"));
              const i = all.indexOf(btn);
              const j = i + dir;
              if (j < 0 || j >= all.length) return;
              if (dir < 0) tabsNav.insertBefore(btn, all[j]);
              else tabsNav.insertBefore(btn, all[j].nextSibling);
              saveTabsOrder();
              renderList(btn.dataset.tab);
            });
          });
          list.appendChild(li);
        });
      }

      function close() {
        document.removeEventListener("keydown", onKey);
        overlay.remove();
        const active = tabsNav.querySelector(".tab-nav-btn.active");
        if (active) {
          try { active.scrollIntoView({ block: "nearest", inline: "center" }); } catch (_) {}
        }
      }

      function onKey(e) {
        if (e.key === "Escape") close();
      }

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
      });
      overlay.querySelector(".tabs-reorder-close").addEventListener("click", close);
      overlay.querySelector(".tabs-reorder-done").addEventListener("click", close);
      document.addEventListener("keydown", onKey);

      renderList(null);
      document.body.appendChild(overlay);
    }

    initTabInteractions();

    // Empêcher le clic sur les en-têtes d'accords dans la vue par onglet de replier le contenu
    document.querySelectorAll(".tabs-view .module-section .accordion-header").forEach(h => {
      h.addEventListener("click", (e) => {
        if (e.target.closest("a") || e.target.closest("button")) return;
        e.stopImmediatePropagation();
      }, true);
    });

    // Chargement de l'onglet par défaut (ou dernier mémorisé)
    let initialTab = "meteociel";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && panels[saved]) initialTab = saved;
    } catch (_) {}

    switchTab(initialTab, false);
    setTimeout(() => {
      switchTab(initialTab, false);
    }, 150);
  });
})();