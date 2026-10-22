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
    // RÉORGANISATION FLUIDE & ANTI-COLLISION DES ONGLETS (120 FPS)
    // Calcul exact par permutation et cumul des largeurs réelles
    // ========================================================
    let longPressTimer = null;
    let draggedBtn = null;
    let isDraggingTab = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let suppressNextClick = false;
    let allTabs = [];
    let initialLefts = [];
    let initialWidths = [];
    let initialCenters = [];
    let startIndex = -1;
    let currentTargetIndex = -1;
    let currentPermutation = [];
    const TAB_GAP = 8;

    function initTabDragAndDrop() {
      if (!tabsNav) return;

      // Empêcher tout drag d'image natif du navigateur
      tabsNav.querySelectorAll(".tab-nav-btn").forEach(btn => {
        btn.addEventListener("dragstart", (e) => e.preventDefault());
      });

      tabsNav.addEventListener("pointerdown", (e) => {
        const btn = e.target.closest(".tab-nav-btn");
        if (!btn || (e.button !== 0 && e.pointerType === "mouse")) return;

        draggedBtn = btn;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        isDraggingTab = false;
        suppressNextClick = false;

        clearTimeout(longPressTimer);
        // Déclenchement réactif (140ms) pour une réactivité instantanée
        longPressTimer = setTimeout(() => {
          startDragging(e, btn);
        }, 140);
      });

      function startDragging(e, btn) {
        if (!draggedBtn || draggedBtn !== btn) return;
        isDraggingTab = true;
        suppressNextClick = true;

        if (navigator.vibrate) {
          try { navigator.vibrate(25); } catch (_) {}
        }

        try {
          btn.setPointerCapture(e.pointerId);
        } catch (_) {}

        allTabs = Array.from(tabsNav.querySelectorAll(".tab-nav-btn"));
        startIndex = allTabs.indexOf(btn);
        currentTargetIndex = startIndex;
        currentPermutation = [...allTabs];

        // Mesure exacte des positions géométriques réelles de chaque onglet
        const containerLeft = tabsNav.getBoundingClientRect().left + tabsNav.scrollLeft;
        initialLefts = allTabs.map(t => t.getBoundingClientRect().left + tabsNav.scrollLeft - containerLeft);
        initialWidths = allTabs.map(t => t.offsetWidth);
        initialCenters = initialLefts.map((l, i) => l + initialWidths[i] / 2);

        btn.classList.add("tab-dragging");
        btn.style.position = "relative";
        btn.style.zIndex = "100";
        btn.style.transform = "translate3d(0, 0, 0) scale(1.06)";

        allTabs.forEach((t, i) => {
          if (i !== startIndex) {
            t.style.transition = "transform 0.22s cubic-bezier(0.2, 0, 0, 1)";
          }
        });
      }

      tabsNav.addEventListener("pointermove", (e) => {
        if (!draggedBtn) return;

        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        if (!isDraggingTab) {
          // Détection d'un glissement horizontal net avant le timeout
          if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            clearTimeout(longPressTimer);
            startDragging(e, draggedBtn);
          } else if (Math.abs(dy) > 12) {
            clearTimeout(longPressTimer);
            return;
          } else {
            return;
          }
        }

        e.preventDefault();

        // 1. L'onglet dragué suit le doigt en direct à 120 FPS
        draggedBtn.style.transform = `translate3d(${dx}px, 0, 0) scale(1.06)`;

        // 2. Trouver l'index de destination en testant le chevauchement avec les centres
        const draggedVisualCenter = initialCenters[startIndex] + dx;
        let newTargetIndex = startIndex;

        if (dx > 0) {
          // Déplacement vers la droite
          for (let i = startIndex + 1; i < allTabs.length; i++) {
            if (draggedVisualCenter > initialCenters[i] - initialWidths[i] * 0.25) {
              newTargetIndex = i;
            }
          }
        } else if (dx < 0) {
          // Déplacement vers la gauche
          for (let i = startIndex - 1; i >= 0; i--) {
            if (draggedVisualCenter < initialCenters[i] + initialWidths[i] * 0.25) {
              newTargetIndex = i;
            }
          }
        }

        newTargetIndex = Math.max(0, Math.min(allTabs.length - 1, newTargetIndex));
        currentTargetIndex = newTargetIndex;

        // 3. Calculer la permutation exacte pour éliminer tout risque de chevauchement visuel
        const permutation = [...allTabs];
        permutation.splice(startIndex, 1);
        permutation.splice(currentTargetIndex, 0, draggedBtn);
        currentPermutation = permutation;

        // 4. Déterminer l'abscisse slotX réelle de chaque élément dans la nouvelle permutation
        let slotX = initialLefts[0];
        permutation.forEach((tab) => {
          const tabOrigIdx = allTabs.indexOf(tab);
          const origLeft = initialLefts[tabOrigIdx];
          const targetOffset = slotX - origLeft;

          if (tab !== draggedBtn) {
            tab.style.transform = targetOffset !== 0 ? `translate3d(${targetOffset}px, 0, 0)` : "";
          }

          slotX += initialWidths[tabOrigIdx] + TAB_GAP;
        });
      });

      const finishDrag = (e) => {
        clearTimeout(longPressTimer);

        if (!draggedBtn) return;
        const activeBtn = draggedBtn;
        const wasDragging = isDraggingTab;

        if (wasDragging) {
          try {
            if (e && e.pointerId) activeBtn.releasePointerCapture(e.pointerId);
          } catch (_) {}

          // Calcul de la position finale exacte du slot d'arrivée
          let finalSlotX = initialLefts[0];
          for (let i = 0; i < currentPermutation.length; i++) {
            const tab = currentPermutation[i];
            const tabOrigIdx = allTabs.indexOf(tab);
            if (tab === activeBtn) break;
            finalSlotX += initialWidths[tabOrigIdx] + TAB_GAP;
          }

          const finalOffset = finalSlotX - initialLefts[startIndex];

          activeBtn.classList.remove("tab-dragging");
          activeBtn.classList.add("tab-dropping");
          activeBtn.style.transform = `translate3d(${finalOffset}px, 0, 0) scale(1)`;

          setTimeout(() => {
            // Réorganisation DOM propre selon l'ordre exact de la permutation
            currentPermutation.forEach(tab => {
              tabsNav.appendChild(tab);
            });

            // Réinitialisation intégrale des styles inline
            allTabs.forEach(t => {
              t.style.transform = "";
              t.style.transition = "";
              t.style.position = "";
              t.style.zIndex = "";
            });
            activeBtn.classList.remove("tab-dropping");

            saveTabsOrder();

            setTimeout(() => {
              suppressNextClick = false;
              isDraggingTab = false;
              draggedBtn = null;
            }, 80);
          }, 180);
        } else {
          draggedBtn = null;
        }
      };

      tabsNav.addEventListener("pointerup", finishDrag);
      tabsNav.addEventListener("pointercancel", finishDrag);

      // Clic normal sur n'importe quelle partie du bouton (icône ou texte) pour changer d'onglet
      tabsNav.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-nav-btn");
        if (!btn) return;
        if (suppressNextClick || isDraggingTab) {
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