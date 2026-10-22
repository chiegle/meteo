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
    // RÉORGANISATION FLUIDE & ANTI-COLLISION DES ONGLETS (FLIP DOM SWAP)
    // Zéro risque de superposition ou d'onglet bloqué
    // ========================================================
    let longPressTimer = null;
    let draggedBtn = null;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let suppressClick = false;

    function initTabDragAndDrop() {
      if (!tabsNav) return;

      // Empêcher tout drag d'image natif du navigateur
      tabsNav.querySelectorAll("img").forEach(img => {
        img.setAttribute("draggable", "false");
        img.addEventListener("dragstart", (e) => e.preventDefault());
      });

      tabsNav.querySelectorAll(".tab-nav-btn").forEach(btn => {
        btn.setAttribute("draggable", "false");
        btn.addEventListener("dragstart", (e) => e.preventDefault());
        btn.addEventListener("pointerdown", onPointerDown);
      });

      function onPointerDown(e) {
        const btn = e.target.closest(".tab-nav-btn");
        if (!btn || (e.button !== 0 && e.pointerType === "mouse")) return;

        draggedBtn = btn;
        startX = e.clientX;
        startY = e.clientY;
        isDragging = false;
        suppressClick = false;

        window.addEventListener("pointermove", onPointerMove, { passive: false });
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);

        clearTimeout(longPressTimer);
        // Déclenchement réactif à 140ms
        longPressTimer = setTimeout(() => {
          startDrag();
        }, 140);
      }

      function startDrag() {
        if (!draggedBtn) return;
        isDragging = true;
        suppressClick = true;

        if (navigator.vibrate) {
          try { navigator.vibrate(25); } catch (_) {}
        }

        draggedBtn.classList.add("tab-dragging");
      }

      function onPointerMove(e) {
        if (!draggedBtn) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!isDragging) {
          // Si déplacement horizontal net, démarrer le drag immédiatement
          if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
            clearTimeout(longPressTimer);
            startDrag();
          } else if (Math.abs(dy) > 10) {
            // Défilement vertical de la page -> annuler
            cancelDrag();
            return;
          } else {
            return;
          }
        }

        e.preventDefault();

        // Trouver le bouton sous le curseur
        const allBtns = Array.from(tabsNav.querySelectorAll(".tab-nav-btn"));
        const targetBtn = allBtns.find(b => {
          if (b === draggedBtn) return false;
          const rect = b.getBoundingClientRect();
          return e.clientX >= rect.left && e.clientX <= rect.right;
        });

        if (targetBtn) {
          // FLIP DOM Swap instantané sans aucune collision
          const rectsBefore = allBtns.map(b => b.getBoundingClientRect());

          const draggedIdx = allBtns.indexOf(draggedBtn);
          const targetIdx = allBtns.indexOf(targetBtn);

          if (draggedIdx < targetIdx) {
            tabsNav.insertBefore(draggedBtn, targetBtn.nextSibling);
          } else {
            tabsNav.insertBefore(draggedBtn, targetBtn);
          }

          const allBtnsAfter = Array.from(tabsNav.querySelectorAll(".tab-nav-btn"));
          const rectsAfter = allBtnsAfter.map(b => b.getBoundingClientRect());

          // Transition FLIP fluide sur les frères déplacés
          allBtnsAfter.forEach((b, idx) => {
            if (b === draggedBtn) return;
            const prevIdx = allBtns.indexOf(b);
            if (prevIdx === -1) return;
            const diffX = rectsBefore[prevIdx].left - rectsAfter[idx].left;
            if (diffX !== 0) {
              b.style.transform = `translateX(${diffX}px)`;
              b.style.transition = "none";
              requestAnimationFrame(() => {
                b.style.transition = "transform 0.2s cubic-bezier(0.2, 0, 0, 1)";
                b.style.transform = "";
              });
            }
          });
        }
      }

      function onPointerUp(e) {
        clearTimeout(longPressTimer);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);

        if (isDragging && draggedBtn) {
          draggedBtn.classList.remove("tab-dragging");
          saveTabsOrder();
          setTimeout(() => {
            suppressClick = false;
            isDragging = false;
            draggedBtn = null;
          }, 60);
        } else {
          cancelDrag();
        }
      }

      function cancelDrag() {
        clearTimeout(longPressTimer);
        if (draggedBtn) {
          draggedBtn.classList.remove("tab-dragging");
        }
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        isDragging = false;
        draggedBtn = null;
      }

      // Clic normal sur n'importe quelle partie du bouton (icône ou texte) pour changer d'onglet
      tabsNav.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-nav-btn");
        if (!btn) return;
        if (suppressClick || isDragging) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        switchTab(btn.dataset.tab, true);
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