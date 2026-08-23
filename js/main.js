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

  // ===== 分类筛选（guides 页面） =====
  function initCategoryFilter() {
    var filterBtns = document.querySelectorAll("[data-filter]");
    if (filterBtns.length === 0) return;

    var cards = document.querySelectorAll(".guide-card");

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var category = this.getAttribute("data-filter");

        // 更新按钮状态
        filterBtns.forEach(function (b) {
          b.classList.remove("active");
          b.classList.remove("bg-indigo-500");
          b.classList.remove("text-white");
          b.classList.add("bg-white");
          b.classList.add("text-gray-600");
          b.classList.add("hover:text-indigo-600");
        });
        this.classList.add("active");
        this.classList.add("bg-indigo-500");
        this.classList.add("text-white");
        this.classList.remove("bg-white");
        this.classList.remove("text-gray-600");
        this.classList.remove("hover:text-indigo-600");

        // 过滤卡片
        cards.forEach(function (card) {
          var cardCategory = card.getAttribute("data-category");
          if (category === "all" || cardCategory === category) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
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
    initCategoryFilter();
    initMobileMenu();
    initLazyImages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
