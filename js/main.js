/* ===== hololive Dreams 攻略站 主脚本 ===== */

(function () {
  "use strict";

  // ===== 导航栏滚动效果 =====
  function initNavbarScroll() {
    var navbar = document.querySelector(".navbar");
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ===== 阅读进度条 =====
  function initReadingProgress() {
    var progressBar = document.querySelector(".reading-progress");
    if (!progressBar) return;

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + "%";
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // ===== 目录高亮联动 =====
  function initTocHighlight() {
    var tocLinks = document.querySelectorAll(".toc-list a[href^='#']");
    if (tocLinks.length === 0) return;

    var headings = [];
    tocLinks.forEach(function (link) {
      var id = link.getAttribute("href").substring(1);
      var heading = document.getElementById(id);
      if (heading) {
        headings.push({ id: id, element: heading, link: link });
      }
    });

    if (headings.length === 0) return;

    function onScroll() {
      var scrollPosition = window.scrollY + 120;
      var currentId = headings[0].id;

      for (var i = 0; i < headings.length; i++) {
        if (headings[i].element.offsetTop <= scrollPosition) {
          currentId = headings[i].id;
        }
      }

      tocLinks.forEach(function (link) {
        link.classList.remove("active");
      });

      var activeLink = document.querySelector(
        '.toc-list a[href="#' + currentId + '"]'
      );
      if (activeLink) {
        activeLink.classList.add("active");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ===== 平滑滚动 =====
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (href === "#" || href.length <= 1) return;

        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offsetTop =
            target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // ===== 搜索功能（前端过滤演示） =====
  function initSearch() {
    var searchInput = document.getElementById("globalSearch");
    var searchForm = document.getElementById("searchForm");
    if (!searchForm) return;

    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var query = searchInput ? searchInput.value.trim() : "";
      if (query) {
        window.location.href =
          "guides.html?q=" + encodeURIComponent(query);
      }
    });

    // 从 URL 读取搜索词并填充
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && searchInput) {
      searchInput.value = q;
    }
  }

  // ===== Guide filters, search, and pagination =====
  function initGuideDirectory() {
    var grid = document.getElementById("guideGrid");
    var pagination = document.getElementById("guidePagination");
    if (!grid || !pagination) return;

    var cards = Array.prototype.slice.call(
      grid.querySelectorAll(".guide-card")
    );
    var filterBtns = document.querySelectorAll("[data-filter]");
    var searchInput = document.getElementById("guideSearch");
    var searchForm = document.getElementById("searchFormMain");
    var countEl = document.getElementById("guideCount");
    var emptyState = document.getElementById("guideEmptyState");
    var pageSize = 3;
    var params = new URLSearchParams(window.location.search);
    var activeCategory = params.get("cat") || "all";
    var searchQuery = params.get("q") || "";
    var currentPage = Math.max(1, parseInt(params.get("page") || "1", 10));

    if (searchInput) searchInput.value = searchQuery;

    function setActiveFilter() {
      filterBtns.forEach(function (btn) {
        var isActive = btn.getAttribute("data-filter") === activeCategory;
        btn.classList.toggle("active", isActive);
        btn.classList.toggle("bg-indigo-500", isActive);
        btn.classList.toggle("text-white", isActive);
        btn.classList.toggle("bg-white", !isActive);
        btn.classList.toggle("text-gray-600", !isActive);
        btn.classList.toggle("hover:text-indigo-600", !isActive);
      });
    }

    function getFilteredCards() {
      var normalizedQuery = searchQuery.toLowerCase();
      return cards.filter(function (card) {
        var categoryMatches =
          activeCategory === "all" ||
          card.getAttribute("data-category") === activeCategory;
        var searchMatches =
          !normalizedQuery ||
          card.textContent.toLowerCase().indexOf(normalizedQuery) !== -1;
        return categoryMatches && searchMatches;
      });
    }

    function updateUrl() {
      var next = new URLSearchParams();
      if (activeCategory !== "all") next.set("cat", activeCategory);
      if (searchQuery) next.set("q", searchQuery);
      if (currentPage > 1) next.set("page", String(currentPage));
      var query = next.toString();
      window.history.replaceState(null, "", "guides.html" + (query ? "?" + query : ""));
    }

    function makeButton(label, page, ariaLabel, disabled, active) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "pagination-btn" + (active ? " active" : "");
      button.innerHTML = label;
      if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
      if (active) button.setAttribute("aria-current", "page");
      button.disabled = disabled;
      if (disabled) {
        button.classList.add("opacity-40", "cursor-not-allowed");
      } else {
        button.addEventListener("click", function () {
          currentPage = page;
          render(true);
        });
      }
      return button;
    }

    function render(shouldScroll) {
      var filtered = getFilteredCards();
      var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      currentPage = Math.min(Math.max(1, currentPage), totalPages);
      var startIndex = (currentPage - 1) * pageSize;
      var visibleCards = filtered.slice(startIndex, startIndex + pageSize);

      cards.forEach(function (card) {
        card.style.display = visibleCards.indexOf(card) !== -1 ? "" : "none";
      });
      if (countEl) countEl.textContent = String(filtered.length);
      if (emptyState) emptyState.classList.toggle("hidden", filtered.length !== 0);

      pagination.innerHTML = "";
      if (filtered.length > pageSize) {
        pagination.appendChild(makeButton("&#8249;", currentPage - 1, "Previous page", currentPage === 1, false));
        for (var page = 1; page <= totalPages; page++) {
          pagination.appendChild(makeButton(String(page), page, "Page " + page, false, page === currentPage));
        }
        pagination.appendChild(makeButton("&#8250;", currentPage + 1, "Next page", currentPage === totalPages, false));
      }

      setActiveFilter();
      updateUrl();
      if (shouldScroll) {
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCategory = this.getAttribute("data-filter") || "all";
        currentPage = 1;
        render(false);
      });
    });

    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        searchQuery = searchInput ? searchInput.value.trim() : "";
        currentPage = 1;
        render(false);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchQuery = this.value.trim();
        currentPage = 1;
        render(false);
      });
    }

    render(false);
  }

  // ===== 移动端菜单切换 =====
  function initMobileMenu() {
    var menuBtn = document.getElementById("mobileMenuBtn");
    var mobileMenu = document.getElementById("mobileMenu");
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener("click", function () {
      var isHidden = mobileMenu.classList.contains("hidden");
      if (isHidden) {
        mobileMenu.classList.remove("hidden");
      } else {
        mobileMenu.classList.add("hidden");
      }
    });
  }

  // ===== 图片懒加载回退（对不支持原生懒加载的浏览器） =====
  function initLazyImages() {
    if ("loading" in HTMLImageElement.prototype) return;

    var lazyImages = document.querySelectorAll("img[loading='lazy']");
    if (lazyImages.length === 0) return;

    // 简单的 IntersectionObserver 回退
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            observer.unobserve(img);
          }
        });
      });

      lazyImages.forEach(function (img) {
        observer.observe(img);
      });
    }
  }

  // ===== 初始化 =====
  function init() {
    initNavbarScroll();
    initReadingProgress();
    initTocHighlight();
    initSmoothScroll();
    initSearch();
    initGuideDirectory();
    initMobileMenu();
    initLazyImages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
