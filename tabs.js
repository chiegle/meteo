// ========================================================
// CONTRÔLEUR DES ONGLETS HORIZONTAUX (tabs.html)
// ========================================================
(function () {
  "use strict";

  const STORAGE_KEY = "meteo_active_tab_horizontal";

  document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-nav-btn");
    const panels = {
      meteociel: document.getElementById("meteocielCitySection"),
      ecmwf: document.getElementById("ecmwfSection"),
      arome: document.getElementById("aromeSection"),
      romma: document.getElementById("rommaSection"),
      meteoblue: document.getElementById("meteoblueSection"),
      safety: document.getElementById("safetySection")
    };

    function switchTab(tabKey, userInitiated = false) {
      if (!panels[tabKey]) tabKey = "meteociel";

      // 1. Mise à jour de l'état actif des boutons d'onglets
      tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === tabKey;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        if (isActive && userInitiated) {
          btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      });

      // 2. Affichage du panneau correspondant et masquage des autres
      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        const isActive = key === tabKey;
        if (isActive) {
          panel.classList.add("active-tab-panel");
          panel.classList.remove("collapsed");
          const body = panel.querySelector(".accordion-body");
          if (body) body.classList.remove("collapsed");
          const header = panel.querySelector(".accordion-header");
          if (header) {
            header.classList.remove("collapsed");
            header.setAttribute("aria-expanded", "true");
          }
        } else {
          panel.classList.remove("active-tab-panel");
        }
      });

      // 3. Forcer le redimensionnement immédiat des graphiques et cartes interactives (Leaflet, Canvas)
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 60);

      // 4. Mémorisation de l'onglet actif
      try {
        localStorage.setItem(STORAGE_KEY, tabKey);
      } catch (_) {}
    }

    // Écouteurs de clics sur les boutons d'onglets
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        switchTab(btn.dataset.tab, true);
      });
    });

    // Chargement de l'onglet par défaut (ou dernier mémorisé)
    let initialTab = "meteociel";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && panels[saved]) initialTab = saved;
    } catch (_) {}

    // Initialisation après léger délai pour laisser app.js instancier les composants
    setTimeout(() => {
      switchTab(initialTab, false);
    }, 120);
  });
})();
