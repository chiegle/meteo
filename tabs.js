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
    // RÉORGANISATION MODERNE DES ONGLETS (STYLE iOS / 120 FPS)
    // Animation fluide par translation GPU & décalage doux
    // ========================================================
    let longPressTimer = null;
    let draggedBtn = null;
    let isDraggingTab = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let suppressNextClick = false;
    let allTabs = [];
    let initialCenters = [];
    let initialRects = [];
    let startIndex = -1;
    let currentIndex = -1;
    let tabGap = 8;

    function initTabDragAndDrop() {
      if (!tabsNav) return;

      tabsNav.addEventListener("pointerdown", (e) => {
        const btn = e.target.closest(".tab-nav-btn");
        if (!btn || (e.button !== 0 && e.pointerType === "mouse")) return;

        draggedBtn = btn;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        isDraggingTab = false;
        suppressNextClick = false;

        clearTimeout(longPressTimer);
        // Déclenchement réactif (130ms) pour une réactivité instantanée
        longPressTimer = setTimeout(() => {
          startDragging(e, btn);
        }, 130);
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
        currentIndex = startIndex;

        initialRects = allTabs.map(t => t.getBoundingClientRect());
        initialCenters = initialRects.map(r => r.left + r.width / 2);

        if (initialRects.length > 1) {
          tabGap = Math.max(4, initialRects[1].left - initialRects[0].right);
        }

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
          // Si l'utilisateur commence à glisser horizontalement franchement, déclencher le drag
          if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            clearTimeout(longPressTimer);
            startDragging(e, draggedBtn);
          } else if (Math.abs(dy) > 12) {
            // Défilement vertical probable, annuler
            clearTimeout(longPressTimer);
            return;
          } else {
            return;
          }
        }

        e.preventDefault();

        // 1. Déplacer l'onglet dragué sous le doigt à 120 FPS
        draggedBtn.style.transform = `translate3d(${dx}px, 0, 0) scale(1.06)`;

        // 2. Calculer le nouvel index cible en comparant le centre visuel
        const currentVisualCenter = initialCenters[startIndex] + dx;
        let targetIndex = 0;

        for (let i = 0; i < initialCenters.length; i++) {
          if (currentVisualCenter > initialCenters[i]) {
            targetIndex = i;
          }
        }
        targetIndex = Math.max(0, Math.min(allTabs.length - 1, targetIndex));
        currentIndex = targetIndex;

        // 3. Décaler avec élégance tous les autres onglets
        const draggedWidth = initialRects[startIndex].width;
        const shiftAmount = draggedWidth + tabGap;

        allTabs.forEach((t, i) => {
          if (i === startIndex) return;

          let offset = 0;
          if (startIndex < targetIndex) {
            // L'onglet se déplace vers la droite : les onglets intermédiaires glissent vers la gauche
            if (i > startIndex && i <= targetIndex) {
              offset = -shiftAmount;
            }
          } else if (startIndex > targetIndex) {
            // L'onglet se déplace vers la gauche : les onglets intermédiaires glissent vers la droite
            if (i < startIndex && i >= targetIndex) {
              offset = shiftAmount;
            }
          }
          t.style.transform = offset !== 0 ? `translate3d(${offset}px, 0, 0)` : "";
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

          // Calculer le décalage vers le slot cible pour une transition finale fluide
          let finalOffset = 0;
          if (currentIndex !== startIndex) {
            let targetLeft = initialRects[currentIndex].left;
            if (currentIndex > startIndex) {
              targetLeft = initialRects[currentIndex].right - initialRects[startIndex].width;
            }
            finalOffset = targetLeft - initialRects[startIndex].left;
          }

          activeBtn.classList.remove("tab-dragging");
          activeBtn.classList.add("tab-dropping");
          activeBtn.style.transform = `translate3d(${finalOffset}px, 0, 0) scale(1)`;

          setTimeout(() => {
            // Réorganisation du DOM à la fin de l'animation
            if (currentIndex !== startIndex && activeBtn.parentElement === tabsNav) {
              const currentChildren = Array.from(tabsNav.querySelectorAll(".tab-nav-btn"));
              const refNode = currentChildren[currentIndex];
              if (currentIndex > startIndex) {
                tabsNav.insertBefore(activeBtn, refNode.nextSibling);
              } else {
                tabsNav.insertBefore(activeBtn, refNode);
              }
            }

            // Réinitialisation propre de tous les styles inline
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

      // Clic normal sur les onglets pour basculer
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