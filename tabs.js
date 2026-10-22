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
      safety: document.getElementById("safetySection")
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
            }
          });
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
    // RÉORGANISATION PAR APPUI LONG (TOUCH & SOURIS)
    // ========================================================
    let longPressTimer = null;
    let draggedBtn = null;
    let isDraggingTab = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let suppressNextClick = false;

    function initTabDragAndDrop() {
      if (!tabsNav) return;

      tabButtons.forEach(btn => {
        btn.addEventListener("pointerdown", (e) => {
          if (e.button !== 0 && e.pointerType === "mouse") return;
          dragStartX = e.clientX;
          dragStartY = e.clientY;
          isDraggingTab = false;
          draggedBtn = btn;

          clearTimeout(longPressTimer);
          longPressTimer = setTimeout(() => {
            // Déclenchement de l'appui long
            isDraggingTab = true;
            suppressNextClick = true;
            draggedBtn.classList.add("tab-dragging");
            if (navigator.vibrate) {
              try { navigator.vibrate(40); } catch (_) {}
            }
          }, 320);
        });

        btn.addEventListener("pointermove", (e) => {
          const dx = Math.abs(e.clientX - dragStartX);
          const dy = Math.abs(e.clientY - dragStartY);

          if (!isDraggingTab) {
            // Si on a bougé de plus de 8px avant les 320ms, c'est un défilement normal
            if (dx > 8 || dy > 8) {
              clearTimeout(longPressTimer);
            }
            return;
          }

          // En mode drag actif : empêcher le défilement et réorganiser
          e.preventDefault();
          const currentTarget = document.elementFromPoint(e.clientX, e.clientY);
          const siblingBtn = currentTarget ? currentTarget.closest(".tab-nav-btn") : null;

          if (siblingBtn && siblingBtn !== draggedBtn && siblingBtn.parentElement === tabsNav) {
            const rect = siblingBtn.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            if (e.clientX < midX) {
              tabsNav.insertBefore(draggedBtn, siblingBtn);
            } else {
              tabsNav.insertBefore(draggedBtn, siblingBtn.nextSibling);
            }
          }
        });

        const endDrag = () => {
          clearTimeout(longPressTimer);
          if (isDraggingTab && draggedBtn) {
            draggedBtn.classList.remove("tab-dragging");
            isDraggingTab = false;
            saveTabsOrder();
            // Maintenir la suppression du clic pendant un court instant
            setTimeout(() => {
              suppressNextClick = false;
              draggedBtn = null;
            }, 180);
          } else {
            draggedBtn = null;
          }
        };

        btn.addEventListener("pointerup", endDrag);
        btn.addEventListener("pointercancel", endDrag);

        // Clic normal pour changer d'onglet
        btn.addEventListener("click", (e) => {
          if (suppressNextClick || isDraggingTab) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          switchTab(btn.dataset.tab, true);
        });
      });
    }

    initTabDragAndDrop();

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