/**
 * JinWatch - Luxury Watch Store Clone
 * Main Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Support products override from Admin Panel
  let rawData = window.JINWATCH_DATA || window.PHONGWATCH_DATA || { products: [], collections: [], by_collection: {} };
  try {
    const savedProductsOverride = localStorage.getItem('JINWATCH_DATA_OVERRIDE') || localStorage.getItem('PHONGWATCH_DATA_OVERRIDE');
    if (savedProductsOverride) {
      const parsed = JSON.parse(savedProductsOverride);
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        rawData = parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load products override from localStorage", e);
  }
  const data = rawData;
  
  // Ensure shop configuration is applied
  if (typeof window.applyShopConfig === 'function') {
    window.applyShopConfig();
  }
  
  // State
  let cart = JSON.parse(localStorage.getItem('jinwatch_cart') || localStorage.getItem('phongwatch_cart') || '[]');
  let currentSlide = 0;
  let slideInterval = null;

  // Filter State
  let filterState = {
    keyword: '',
    priceMin: 0,
    priceMax: Infinity,
    priceLabel: 'Tất cả mức giá',
    brand: 'all',
    gender: 'all',
    sort: 'default'
  };

  // Cache Elements
  const searchInput = document.getElementById('searchInput');
  const searchCategory = document.getElementById('searchCategory');
  const searchDropdown = document.getElementById('searchDropdown');
  const cartTopBadge = document.getElementById('cartTopBadge');
  const cartMainBadge = document.getElementById('cartMainBadge');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const quickViewModal = document.getElementById('quickViewModal');
  const checkoutModal = document.getElementById('checkoutModal');
  const policyModal = document.getElementById('policyModal');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const toastContainer = document.getElementById('toastContainer');

  // Fallback image helper
  const defaultWatchImage = 'assets/slider-1.png';

  // Format currency
  function formatMoney(amount) {
    if (!amount) return '0₫';
    return amount.toLocaleString('vi-VN') + '₫';
  }

  // ==========================================
  // 1. RENDER COLLECTIONS & PRODUCTS
  // ==========================================
  function createProductCardHTML(product) {
    const saleBadge = product.sale ? `<div class="product-badge-sale">${product.sale}</div>` : '';
    const newBadge = product.is_new ? `<div class="product-badge-new">NEW</div>` : '';
    const origPrice = (product.original_price && product.original_price !== product.price) 
      ? `<span class="original-price">${product.original_price}</span>` : '';
    
    // Star rating
    const stars = Array(product.rating || 5).fill('<i class="fa fa-star"></i>').join('');

    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-img-wrapper" onclick="window.location.href='product.html?id=${product.id}'">
          ${saleBadge}
          ${newBadge}
          <img class="product-img" src="${product.image}" alt="${product.name}" 
               loading="lazy" onerror="this.src='${defaultWatchImage}'">
          <div class="product-quick-actions" onclick="event.stopPropagation()">
            <button class="quick-action-btn" title="Xem nhanh" onclick="window.app.openQuickView('${product.id}')">
              <i class="fa fa-eye"></i>
            </button>
            <button class="quick-action-btn wide-btn" onclick="window.app.addToCart('${product.id}'); window.app.toggleCartDrawer(true);">
              <i class="fa fa-shopping-cart"></i> Mua ngay
            </button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-vendor">${product.vendor}</div>
          <a href="product.html?id=${product.id}" class="product-name" title="${product.name}">
            ${product.name}
          </a>
          <div class="product-stars">
            ${stars}
            <span class="reviews-count">(${product.reviews_count || 5})</span>
          </div>
          <div class="product-price-box">
            <span class="current-price">${product.price}</span>
            ${origPrice}
          </div>
        </div>
      </div>
    `;
  }

  // Render Collection Carousels
  function renderCollectionCarousels() {
    const carouselConfigs = [
      { containerId: 'olymPianusTrack', key: 'OLYM PIANUS', limit: 12 },
      { containerId: 'carnivalTrack', key: 'CARNIVAL', limit: 12 },
      { containerId: 'carnivalNuTrack', key: 'ĐỒNG HỒ NỮ CARNIVAL', limit: 12 },
      { containerId: 'bentleyTrack', key: 'ĐỒNG HỒ BENTLEY', limit: 8 }
    ];

    carouselConfigs.forEach(cfg => {
      const container = document.getElementById(cfg.containerId);
      if (!container) return;
      const prods = data.by_collection[cfg.key] || [];
      const itemsToRender = prods.slice(0, cfg.limit);
      container.innerHTML = itemsToRender.map(p => `
        <div class="carousel-slide">
          ${createProductCardHTML(p)}
        </div>
      `).join('');
    });
  }

  // Render Collection Grids
  function renderCollectionGrids() {
    // Alexander Ferros
    const afContainer = document.getElementById('alexanderFerrosGrid');
    if (afContainer) {
      const prods = data.by_collection['ALEXANDER FERROS'] || [];
      afContainer.innerHTML = prods.slice(0, 16).map(createProductCardHTML).join('');
    }

    // Seiko
    const seikoContainer = document.getElementById('seikoGrid');
    if (seikoContainer) {
      const prods = data.by_collection['SEIKO'] || [];
      seikoContainer.innerHTML = prods.slice(0, 16).map(createProductCardHTML).join('');
    }

    // Sun and Moon (Showcase with Side Banner)
    const sunMoonContainer = document.getElementById('sunMoonGrid');
    if (sunMoonContainer) {
      const prods = data.by_collection['SUN AND MOON'] || [];
      sunMoonContainer.innerHTML = prods.slice(0, 9).map(createProductCardHTML).join('');
    }

    // Tissot (Showcase with Side Banner)
    const tissotContainer = document.getElementById('tissotGrid');
    if (tissotContainer) {
      const prods = data.by_collection['TISSOT - THUỴ SỸ'] || [];
      tissotContainer.innerHTML = prods.slice(0, 9).map(createProductCardHTML).join('');
    }

    // Women's Watch (Showcase with Side Banner)
    const womenWatchContainer = document.getElementById('womenWatchGrid');
    if (womenWatchContainer) {
      const prods = data.products.filter(p => p.gender === 'Nữ' || p.collection.includes('NỮ'));
      womenWatchContainer.innerHTML = prods.slice(0, 9).map(createProductCardHTML).join('');
    }
  }

  // ==========================================
  // 2. HERO SLIDER LOGIC
  // ==========================================
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('sliderDots');

  function initHeroSlider() {
    if (!slides.length) return;
    
    // Create dots
    if (dotsContainer) {
      dotsContainer.innerHTML = Array.from(slides).map((_, i) => `
        <div class="slider-dot ${i === 0 ? 'active' : ''}" onclick="window.app.goToSlide(${i})"></div>
      `).join('');
    }

    startSlideTimer();

    const sliderSection = document.getElementById('heroSlider');
    if (sliderSection) {
      sliderSection.addEventListener('mouseenter', stopSlideTimer);
      sliderSection.addEventListener('mouseleave', startSlideTimer);
    }
  }

  function goToSlide(idx) {
    if (idx < 0) idx = slides.length - 1;
    if (idx >= slides.length) idx = 0;
    
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === idx);
    });

    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    currentSlide = idx;
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startSlideTimer() {
    stopSlideTimer();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopSlideTimer() {
    if (slideInterval) clearInterval(slideInterval);
  }

  // ==========================================
  // 3. CAROUSEL ARROW CONTROLS
  // ==========================================
  window.appSlideCarousel = function(trackId, direction) {
    const track = document.getElementById(trackId);
    if (!track) return;
    
    const slide = track.querySelector('.carousel-slide');
    if (!slide) return;
    
    const slideWidth = slide.offsetWidth + 20; // 20px gap
    const visibleWidth = track.parentElement.offsetWidth;
    const maxScroll = track.scrollWidth - visibleWidth;
    
    let currentTransform = 0;
    const match = track.style.transform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
    if (match) {
      currentTransform = parseFloat(match[1]);
    }
    
    let nextTransform = currentTransform + (direction === 'next' ? -slideWidth * 2 : slideWidth * 2);
    if (nextTransform < -maxScroll) nextTransform = -maxScroll;
    if (nextTransform > 0) nextTransform = 0;
    
    track.style.transform = `translateX(${nextTransform}px)`;
  };

  // ==========================================
  // 4. SMART SEARCH
  // ==========================================
  function initSmartSearch() {
    if (!searchInput) return;

    let debounceTimer = null;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(e.target.value.trim());
      }, 250);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        filterCatalog(searchInput.value.trim());
      }
    });

    if (searchCategory) {
      searchCategory.addEventListener('change', () => {
        if (searchInput.value.trim()) {
          performSearch(searchInput.value.trim());
        }
      });
    }

    // Close search dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) {
        if (searchDropdown) searchDropdown.classList.remove('active');
      }
    });
  }

  function performSearch(query) {
    if (!searchDropdown) return;
    
    if (!query) {
      searchDropdown.classList.remove('active');
      searchDropdown.innerHTML = '';
      return;
    }

    let cat = searchCategory ? searchCategory.value : '0';
    const qLower = query.toLowerCase();

    // If query targets a different brand than selected dropdown category, relax category filter to prevent conflict
    if (cat !== '0') {
      const knownBrands = ['CARNIVAL', 'ALEXANDER FERROS', 'OLYM PIANUS', 'BENTLEY', 'SEIKO', 'CITIZEN', 'ORIENT', 'TISSOT'];
      const queryMatchesOtherBrand = knownBrands.some(b => b.toLowerCase() !== cat.toLowerCase() && qLower.includes(b.toLowerCase()));
      if (queryMatchesOtherBrand) {
        cat = '0';
      }
    }

    let filtered = data.products.filter(p => {
      const matchName = p.name.toLowerCase().includes(qLower);
      const matchVendor = p.vendor.toLowerCase().includes(qLower);
      const matchCollection = p.collection.toLowerCase().includes(qLower);
      
      let matchCat = true;
      if (cat !== '0') {
        matchCat = p.collection.toLowerCase().includes(cat.toLowerCase()) || 
                   p.vendor.toLowerCase().includes(cat.toLowerCase());
      }
      
      return (matchName || matchVendor || matchCollection) && matchCat;
    });

    if (filtered.length === 0) {
      searchDropdown.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #6c757d; font-size: 13px;">
          Không tìm thấy sản phẩm nào phù hợp với "<strong>${escapeHtml(query)}</strong>"
        </div>
      `;
      searchDropdown.classList.add('active');
      return;
    }

    const itemsHTML = filtered.slice(0, 6).map(p => `
      <div class="search-result-item" onclick="window.location.href='product.html?id=${p.id}'">
        <img class="search-result-img" src="${p.image}" alt="${p.name}" onerror="this.src='${defaultWatchImage}'">
        <div class="search-result-info">
          <div class="search-result-title">${highlightQuery(p.name, query)}</div>
          <div class="search-result-meta">
            <span class="search-result-price">${p.price}</span>
            <span class="search-result-vendor">${p.vendor}</span>
          </div>
        </div>
      </div>
    `).join('');

    searchDropdown.innerHTML = `
      ${itemsHTML}
      <div class="search-footer" onclick="window.app.filterCatalog('${escapeHtml(query)}')">
        Xem tất cả ${filtered.length} kết quả tìm kiếm <i class="fa fa-angle-right"></i>
      </div>
    `;
    searchDropdown.classList.add('active');
  }

  function highlightQuery(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span style="color: var(--color-primary); font-weight:700;">$1</span>');
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==========================================
  // 5. PRICE & ADVANCED CATALOG FILTERING
  // ==========================================
  function setPriceFilter(min, max, btnEl) {
    filterState.priceMin = min;
    filterState.priceMax = max;
    filterState.priceLabel = btnEl ? btnEl.textContent.trim() : '';
    
    document.querySelectorAll('#priceFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    
    applyFilters();
  }

  function setBrandFilter(brand, btnEl) {
    filterState.brand = brand;
    filterState.keyword = '';
    if (searchInput) searchInput.value = '';
    
    document.querySelectorAll('#brandFilterPills .filter-pill').forEach(b => {
      const match = (brand === 'all' && b.textContent.includes('Tất cả')) ||
                    (brand !== 'all' && b.textContent.toUpperCase().includes(brand.toUpperCase()));
      b.classList.toggle('active', match);
    });
    if (btnEl) btnEl.classList.add('active');

    // Also sync searchCategory dropdown if brand exists as an option
    if (searchCategory) {
      const opt = Array.from(searchCategory.options).find(o => o.value.toUpperCase() === brand.toUpperCase());
      searchCategory.value = opt ? opt.value : '0';
    }
    
    applyFilters();
  }

  function setGenderFilter(gender, btnEl) {
    filterState.gender = gender;
    document.querySelectorAll('#genderFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    
    applyFilters();
  }

  function applySort(sortVal) {
    filterState.sort = sortVal;
    applyFilters();
  }

  function resetFilters() {
    filterState = {
      keyword: '',
      priceMin: 0,
      priceMax: Infinity,
      priceLabel: 'Tất cả mức giá',
      brand: 'all',
      gender: 'all',
      sort: 'default'
    };

    if (searchInput) searchInput.value = '';
    if (searchCategory) searchCategory.value = '0';

    document.querySelectorAll('#priceFilterPills .filter-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
    document.querySelectorAll('#brandFilterPills .filter-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
    document.querySelectorAll('#genderFilterPills .filter-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';

    const filteredSection = document.getElementById('filteredProductsSection');
    const filterStatusBar = document.getElementById('filterStatusBar');
    if (filteredSection) filteredSection.style.display = 'none';
    if (filterStatusBar) filterStatusBar.style.display = 'none';

    showToast('Đã xóa tất cả bộ lọc, hiển thị danh mục mặc định.');
  }

  function applyFilters() {
    const hasKeyword = Boolean(filterState.keyword && filterState.keyword.trim().length > 0);
    const isFiltering = filterState.priceMin > 0 || 
                        filterState.priceMax < Infinity || 
                        filterState.brand !== 'all' || 
                        filterState.gender !== 'all' || 
                        filterState.sort !== 'default' ||
                        hasKeyword;

    const filteredSection = document.getElementById('filteredProductsSection');
    const filterStatusBar = document.getElementById('filterStatusBar');
    const filteredGrid = document.getElementById('filteredProductsGrid');
    const sectionTag = document.getElementById('filteredSectionTag');
    const sectionTitle = document.getElementById('filteredSectionTitle');

    if (!isFiltering) {
      if (filteredSection) filteredSection.style.display = 'none';
      if (filterStatusBar) filterStatusBar.style.display = 'none';
      return;
    }

    let results = data.products.filter(p => {
      // 1. Price
      const inPrice = p.price_num >= filterState.priceMin && p.price_num < filterState.priceMax;
      
      // 2. Brand
      let inBrand = true;
      if (filterState.brand !== 'all') {
        const b = filterState.brand.toUpperCase();
        inBrand = p.vendor.toUpperCase().includes(b) || 
                  p.collection.toUpperCase().includes(b) ||
                  p.name.toUpperCase().includes(b);
      }
      
      // 3. Gender
      let inGender = true;
      if (filterState.gender !== 'all') {
        inGender = p.gender === filterState.gender || (filterState.gender === 'Nữ' && p.collection.includes('NỮ'));
      }

      // 4. Keyword / Search
      let inKeyword = true;
      if (hasKeyword) {
        const q = filterState.keyword.trim().toLowerCase();
        inKeyword = p.name.toLowerCase().includes(q) ||
                    p.vendor.toLowerCase().includes(q) ||
                    p.collection.toLowerCase().includes(q) ||
                    (p.id && String(p.id).toLowerCase().includes(q));
      }

      return inPrice && inBrand && inGender && inKeyword;
    });

    // 4. Sort
    if (filterState.sort === 'price-asc') {
      results.sort((a, b) => a.price_num - b.price_num);
    } else if (filterState.sort === 'price-desc') {
      results.sort((a, b) => b.price_num - a.price_num);
    } else if (filterState.sort === 'discount-desc') {
      results.sort((a, b) => (b.original_price_num - b.price_num) - (a.original_price_num - a.price_num));
    } else if (filterState.sort === 'name-asc') {
      const cleanName = (str) => {
        return (str || '')
          .replace(/^\s*[\(\[\{][^\)\]\}]+[\)\]\}]\s*/g, '')
          .trim();
      };
      results.sort((a, b) => cleanName(a.name).localeCompare(cleanName(b.name), 'vi', { sensitivity: 'base' }));
    }

    if (filteredSection && filteredGrid) {
      filteredSection.style.display = 'block';

      // Update Section Header Titles based on what is being searched/filtered
      if (hasKeyword) {
        if (sectionTag) sectionTag.textContent = 'KẾT QUẢ TÌM KIẾM';
        if (sectionTitle) sectionTitle.textContent = `TỪ KHÓA: "${filterState.keyword.toUpperCase()}"`;
      } else if (filterState.brand !== 'all') {
        if (sectionTag) sectionTag.textContent = 'BỘ SƯU TẬP THƯƠNG HIỆU';
        if (sectionTitle) sectionTitle.textContent = `ĐỒNG HỒ ${filterState.brand.toUpperCase()}`;
      } else if (filterState.priceMin > 0 || filterState.priceMax < Infinity) {
        if (sectionTag) sectionTag.textContent = 'LỌC THEO PHÂN KHÚC GIÁ';
        if (sectionTitle) sectionTitle.textContent = `MỨC GIÁ: ${filterState.priceLabel.toUpperCase()}`;
      } else if (filterState.sort === 'name-asc') {
        if (sectionTag) sectionTag.textContent = 'DANH SÁCH SẢN PHẨM';
        if (sectionTitle) sectionTitle.textContent = 'SẮP XẾP THEO TÊN: A - Z';
      } else {
        if (sectionTag) sectionTag.textContent = 'KẾT QUẢ TÌM KIẾM THEO BỘ LỌC';
        if (sectionTitle) sectionTitle.textContent = 'DANH SÁCH SẢN PHẨM PHÙ HỢP';
      }

      if (results.length === 0) {
        let emptyTitle = 'Sản phẩm đang được cập nhật';
        let emptyDesc = 'Hiện tại danh mục sản phẩm đang được JinWatch cập nhật thêm các mẫu mới. Quý khách vui lòng liên hệ hotline để được hỗ trợ đặt hàng theo yêu cầu.';
        let emptyIcon = 'fa-clock-rotate-left';

        if (filterState.priceMin >= 20000000) {
          emptyTitle = 'Sản phẩm đang được cập nhật';
          emptyDesc = 'Phân khúc đồng hồ cao cấp <strong>Trên 20 triệu</strong> đang được cập nhật liên tục. Quý khách có nhu cầu đặt các mẫu cao cấp Thụy Sĩ/Nhật Bản vui lòng liên hệ trực tiếp JinWatch để nhận báo giá ưu đãi.';
          emptyIcon = 'fa-crown';
        } else if (filterState.brand !== 'all') {
          emptyTitle = 'Sản phẩm đang được cập nhật';
          emptyDesc = `Danh mục thương hiệu <strong>${escapeHtml(filterState.brand)}</strong> đang được bổ sung thêm sản phẩm mới. Quý khách vui lòng liên hệ hotline/Zalo để được kiểm tra kho & đặt mẫu sớm nhất.`;
          emptyIcon = 'fa-gem';
        } else if (hasKeyword) {
          emptyTitle = 'Sản phẩm đang được cập nhật';
          emptyDesc = `Chưa có sẵn mẫu đồng hồ khớp với từ khóa "<strong>${escapeHtml(filterState.keyword)}</strong>". JinWatch nhận tìm kiếm & order mọi mẫu đồng hồ chính hãng theo yêu cầu.`;
          emptyIcon = 'fa-magnifying-glass';
        }

        filteredGrid.innerHTML = `
          <div class="empty-filter-state" style="grid-column: 1/-1; text-align:center; padding:50px 20px; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1; margin:20px 0;">
            <div style="width:70px; height:70px; line-height:70px; border-radius:50%; background:#fff; box-shadow:0 4px 15px rgba(0,0,0,0.06); margin:0 auto 16px; font-size:30px; color:var(--color-gold);">
              <i class="fa ${emptyIcon}"></i>
            </div>
            <h3 style="font-family:var(--font-heading); font-size:22px; color:#1e293b; margin-bottom:10px;">
              ${emptyTitle}
            </h3>
            <p style="color:#64748b; font-size:14.5px; max-width:560px; margin:0 auto 22px; line-height:1.6;">
              ${emptyDesc}
            </p>
            <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
              <a href="tel:0932123473" class="btn-luxury" style="padding:10px 22px; font-size:13px; display:inline-flex; align-items:center; gap:8px;">
                <i class="fa fa-phone-volume"></i> Gọi Hotline 0932.1234.73
              </a>
              <a href="https://zalo.me/0845013619" target="_blank" rel="noopener noreferrer" class="btn-outline-gold" style="padding:10px 22px; font-size:13px; display:inline-flex; align-items:center; gap:8px;">
                <i class="fa fa-comment-dots"></i> Chat Zalo 0845.0136.19
              </a>
              <button onclick="window.app.resetFilters()" class="btn-secondary" style="padding:10px 18px; font-size:13px; cursor:pointer;">
                <i class="fa fa-rotate-left"></i> Xem tất cả sản phẩm
              </button>
            </div>
          </div>
        `;
      } else {
        filteredGrid.innerHTML = results.map(createProductCardHTML).join('');
      }

      // Update status bar
      if (filterStatusBar) {
        filterStatusBar.style.display = 'flex';
        const statusText = document.getElementById('filterStatusText');
        if (statusText) {
          const brandText = filterState.brand !== 'all' ? ` • Hãng: ${filterState.brand}` : '';
          const genderText = filterState.gender !== 'all' ? ` • Dành cho: ${filterState.gender}` : '';
          const kwText = hasKeyword ? ` • Từ khóa: "${escapeHtml(filterState.keyword)}"` : '';
          const sortText = filterState.sort === 'name-asc' ? ' • Sắp xếp: Tên A - Z' : 
                           filterState.sort === 'price-asc' ? ' • Sắp xếp: Giá thấp đến cao' :
                           filterState.sort === 'price-desc' ? ' • Sắp xếp: Giá cao đến thấp' :
                           filterState.sort === 'discount-desc' ? ' • Sắp xếp: Giảm giá nhiều nhất' : '';
          statusText.innerHTML = `Tìm thấy <strong>${results.length}</strong> sản phẩm (${filterState.priceLabel}${brandText}${genderText}${kwText}${sortText})`;
        }
      }

      // Smooth scroll to results
      filteredSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ==========================================
  // 6. SHOPPING CART LOGIC
  // ==========================================
  function saveCart() {
    localStorage.setItem('jinwatch_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(productId, qty = 1) {
    const product = data.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        price_num: product.price_num,
        image: product.image,
        vendor: product.vendor,
        quantity: qty
      });
    }

    saveCart();
    showToast(`Đã thêm <strong>${product.name.substring(0, 32)}...</strong> vào giỏ hàng!`, 'success');
  }

  function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
    }
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
  }

  function calculateCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price_num * item.quantity), 0);
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = calculateCartTotal();

    if (cartTopBadge) cartTopBadge.textContent = totalCount;
    if (cartMainBadge) cartMainBadge.textContent = totalCount;
    const cartBottomBadge = document.getElementById('cartBottomBadge');
    if (cartBottomBadge) cartBottomBadge.textContent = totalCount;
    if (cartSubtotalEl) cartSubtotalEl.textContent = formatMoney(subtotal);

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <i class="fa fa-shopping-basket"></i>
          <h4>Giỏ hàng của bạn đang trống</h4>
          <p>Hãy lựa chọn sản phẩm yêu thích của bạn!</p>
        </div>
      `;
    } else {
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='${defaultWatchImage}'">
          <div class="cart-item-info">
            <div class="cart-item-title" title="${item.name}">${item.name}</div>
            <div class="cart-item-price">${formatMoney(item.price_num)}</div>
            <div class="cart-item-controls">
              <div class="quantity-control">
                <button class="qty-btn" onclick="window.app.updateQuantity('${item.id}', -1)">-</button>
                <input class="qty-input" type="text" value="${item.quantity}" readonly>
                <button class="qty-btn" onclick="window.app.updateQuantity('${item.id}', 1)">+</button>
              </div>
              <button class="cart-item-del-btn" title="Xóa" onclick="window.app.removeFromCart('${item.id}')">
                <i class="fa fa-trash"></i> Xóa
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  function toggleCartDrawer(show) {
    if (!cartDrawerOverlay) return;
    if (typeof show === 'boolean') {
      cartDrawerOverlay.classList.toggle('active', show);
    } else {
      cartDrawerOverlay.classList.toggle('active');
    }
  }

  // ==========================================
  // 7. QUICK VIEW MODAL
  // ==========================================
  let currentQvProduct = null;
  let qvQuantity = 1;

  function openQuickView(productId) {
    const product = data.products.find(p => p.id === productId);
    if (!product || !quickViewModal) return;

    currentQvProduct = product;
    qvQuantity = 1;

    const qvImg = document.getElementById('qvImg');
    const qvVendor = document.getElementById('qvVendor');
    const qvTitle = document.getElementById('qvTitle');
    const qvSku = document.getElementById('qvSku');
    const qvCurrentPrice = document.getElementById('qvCurrentPrice');
    const qvDetailLink = document.getElementById('qvDetailLink');

    if (qvImg) qvImg.src = product.image;
    if (qvVendor) qvVendor.textContent = product.vendor;
    if (qvTitle) qvTitle.textContent = product.name;
    if (qvSku) qvSku.textContent = product.id;
    if (qvCurrentPrice) qvCurrentPrice.textContent = product.price;
    if (qvDetailLink) qvDetailLink.href = `product.html?id=${product.id}`;

    const origPriceEl = document.getElementById('qvOrigPrice');
    const saveTextEl = document.getElementById('qvSaveText');

    if (product.original_price && product.original_price !== product.price) {
      if (origPriceEl) {
        origPriceEl.textContent = product.original_price;
        origPriceEl.style.display = 'inline';
      }
      const savings = product.original_price_num - product.price_num;
      if (savings > 0 && saveTextEl) {
        saveTextEl.textContent = `(Tiết kiệm ${formatMoney(savings)})`;
        saveTextEl.style.display = 'inline';
      }
    } else {
      if (origPriceEl) origPriceEl.style.display = 'none';
      if (saveTextEl) saveTextEl.style.display = 'none';
    }

    const qvQtyInput = document.getElementById('qvQtyInput');
    if (qvQtyInput) qvQtyInput.value = qvQuantity;

    quickViewModal.classList.add('active');
  }

  function closeQuickView() {
    if (quickViewModal) quickViewModal.classList.remove('active');
  }

  function changeQvQty(delta) {
    qvQuantity += delta;
    if (qvQuantity < 1) qvQuantity = 1;
    const qvQtyInput = document.getElementById('qvQtyInput');
    if (qvQtyInput) qvQtyInput.value = qvQuantity;
  }

  function addCurrentQvToCart() {
    if (!currentQvProduct) return;
    addToCart(currentQvProduct.id, qvQuantity);
    closeQuickView();
    toggleCartDrawer(true);
  }

  // ==========================================
  // 8. CHECKOUT ORDER SIMULATION
  // ==========================================
  function openCheckout() {
    if (cart.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'warning');
      return;
    }
    toggleCartDrawer(false);
    
    // Fill checkout summary
    const checkoutSummary = document.getElementById('checkoutItemsSummary');
    if (checkoutSummary) {
      checkoutSummary.innerHTML = cart.map(i => `
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
          <span>${i.name.substring(0, 30)}... x <strong>${i.quantity}</strong></span>
          <span style="font-weight:700; color:var(--color-primary);">${formatMoney(i.price_num * i.quantity)}</span>
        </div>
      `).join('');
    }
    const checkoutTotal = document.getElementById('checkoutTotalAmount');
    if (checkoutTotal) checkoutTotal.textContent = formatMoney(calculateCartTotal());

    if (checkoutModal) checkoutModal.classList.add('active');
  }

  function closeCheckout() {
    if (checkoutModal) checkoutModal.classList.remove('active');
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('orderName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const address = document.getElementById('orderAddress').value.trim();

    if (!name || !phone || !address) {
      showToast('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng!', 'warning');
      return;
    }

    const orderId = 'JW-' + Math.floor(100000 + Math.random() * 900000);
    const totalStr = formatMoney(calculateCartTotal());

    // Show success dialog
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutSuccess = document.getElementById('checkoutSuccess');
    if (checkoutForm && checkoutSuccess) {
      checkoutForm.style.display = 'none';
      checkoutSuccess.style.display = 'block';
      const orderIdEl = document.getElementById('confirmedOrderId');
      const orderTotalEl = document.getElementById('confirmedOrderTotal');
      if (orderIdEl) orderIdEl.textContent = orderId;
      if (orderTotalEl) orderTotalEl.textContent = totalStr;
    }

    // Clear cart
    cart = [];
    saveCart();
  }

  function resetCheckoutView() {
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutSuccess = document.getElementById('checkoutSuccess');
    if (checkoutForm && checkoutSuccess) {
      checkoutForm.reset();
      checkoutForm.style.display = 'block';
      checkoutSuccess.style.display = 'none';
    }
    closeCheckout();
  }

  // ==========================================
  // 9. POLICY MODAL
  // ==========================================
  const policies = {
    'bao-hanh': {
      title: 'CHÍNH SÁCH VÀ ĐIỀU KHOẢN BẢO HÀNH',
      content: `
        <p><strong>1. Thời gian bảo hành:</strong></p>
        <p>- Bảo hành chính hãng từ 2 đến 5 năm tùy thương hiệu (Carnival, Olym Pianus, Seiko, Tissot, Bentley...).</p>
        <p>- Miễn phí thay pin trọn đời đối với tất cả các dòng đồng hồ Quartz.</p>
        <p>- Hỗ trợ bảo dưỡng lau dầu máy cơ định kỳ 3 năm miễn phí.</p>
        <br>
        <p><strong>2. Điều kiện bảo hành:</strong></p>
        <p>- Bảo hành các lỗi kỹ thuật về máy của nhà sản xuất (chạy sai giờ, ngưng hoạt động, lỗi linh kiện bên trong).</p>
        <p>- Đồng hồ còn đầy đủ sổ thẻ/hóa đơn bảo hành của JinWatch.</p>
        <p>- Không bảo hành đối với các trường hợp va chạm ngoại lực làm nứt vỡ kính, tự ý sửa chữa tại nơi khác không thuộc ủy quyền.</p>
      `
    },
    'van-chuyen': {
      title: 'CHÍNH SÁCH VẬN CHUYỂN & GIAO NHẬN',
      content: `
        <p><strong>1. Phí giao hàng:</strong></p>
        <p>- MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC (Freeship 100%) cho mọi đơn hàng đồng hồ chính hãng tại JinWatch.</p>
        <br>
        <p><strong>2. Thời gian nhận hàng:</strong></p>
        <p>- Khu vực nội thành TP. Hồ Chí Minh: Giao hàng hỏa tốc trong vòng 2 - 4 giờ.</p>
        <p>- Các tỉnh thành khác: Nhận hàng từ 1 - 3 ngày làm việc qua bưu tá Viettel Post / GHTK uy tín.</p>
        <br>
        <p><strong>3. Quyền lợi kiểm tra hàng (ĐỒNG KIỂM):</strong></p>
        <p>- Quý khách ĐƯỢC QUYỀN MỞ HỘP KIỂM TRA ĐỒNG HỒ trước khi thanh toán tiền cho nhân viên giao hàng.</p>
        <p>- Đúng mẫu mã, nguyên seal, đầy đủ hộp sổ thẻ bảo hành mới nhận hàng.</p>
      `
    },
    'doi-tra': {
      title: 'CHÍNH SÁCH ĐỔI TRẢ SẢN PHẨM',
      content: `
        <p><strong>1. Thời hạn đổi trả:</strong></p>
        <p>- Đổi mới 1 - 1 trong vòng 7 ngày đầu tiên nếu sản phẩm phát sinh lỗi từ nhà sản xuất.</p>
        <br>
        <p><strong>2. Điều kiện áp dụng:</strong></p>
        <p>- Đồng hồ chưa qua sử dụng, chưa cắt mắt dây, còn nguyên vẹn nilon dán bảo vệ (seal) và phụ kiện đi kèm.</p>
        <p>- Hộp đựng, túi xách, sổ hướng dẫn và thẻ bảo hành còn nguyên vẹn.</p>
      `
    },
    'thanh-toan': {
      title: 'CHÍNH SÁCH THANH TOÁN',
      content: `
        <p><strong>1. Thanh toán khi nhận hàng (COD):</strong></p>
        <p>- Quý khách nhận hàng tại nhà, kiểm tra hàng hài lòng rồi thanh toán trực tiếp cho bưu tá giao hàng.</p>
        <br>
        <p><strong>2. Chuyển khoản ngân hàng:</strong></p>
        <p>- Chuyển khoản qua số tài khoản chính thức của JinWatch với nội dung: [Tên khách hàng] + [SĐT].</p>
        <p>- Quý khách vui lòng liên hệ Hotline: <strong>0932.1234.73</strong> hoặc Zalo: <strong>0845.0136.19</strong> để nhận số tài khoản xác thực.</p>
      `
    },
    'huong-dan': {
      title: 'HƯỚNG DẪN SỬ DỤNG & BẢO QUẢN ĐỒNG HỒ',
      content: `
        <p><strong>1. Hướng dẫn chỉnh giờ & lịch ngày:</strong></p>
        <p>- Rút núm chỉnh giờ nhẹ nhàng ra nấc 1 để chỉnh lịch ngày (nếu có), rút nấc 2 để chỉnh giờ/phút.</p>
        <p>- <em>Lưu ý quan trọng:</em> Tuyệt đối không chỉnh lịch ngày trong khung giờ từ 21h00 đến 03h00 sáng vì đây là thời điểm bánh răng nhảy lịch tự động, chỉnh giờ lúc này có thể làm gãy bánh răng lịch.</p>
        <br>
        <p><strong>2. Quy tắc chống nước:</strong></p>
        <p>- Mức 30m - 50m: Đi mưa, rửa tay thoải mái. Không mang khi tắm nước nóng, xông hơi sauna.</p>
        <p>- Luôn đóng chặt núm vặn trước khi tiếp xúc với nước để tránh nước lọt vào thân máy.</p>
        <br>
        <p><strong>3. Cách bảo quản & lên cót đồng hồ cơ (Automatic):</strong></p>
        <p>- Đeo đồng hồ tối thiểu 8 tiếng mỗi ngày để bộ máy tự động nạp đủ năng lượng cót.</p>
        <p>- Tránh để đồng hồ gần các vật có từ trường mạnh (loa đài, nam châm, lò vi sóng, tủ lạnh) để tránh nhiễm từ chạy sai giờ.</p>
      `
    },
    'dong-kiem': {
      title: 'CHÍNH SÁCH ĐỒNG KIỂM KHI NHẬN HÀNG',
      content: `
        <p><strong>1. Quyền lợi kiểm tra hàng trước thanh toán (100% Đồng kiểm):</strong></p>
        <p>- Khách hàng mua sắm tại JinWatch ĐƯỢC QUYỀN MỞ HỘP KIỂM TRA ĐỒNG HỒ trước sự chứng kiến của nhân viên bưu tá giao hàng.</p>
        <br>
        <p><strong>2. Các bước kiểm tra hàng:</strong></p>
        <p>- Kiểm tra đúng mẫu mã, màu sắc, thương hiệu và mã sản phẩm đã đặt.</p>
        <p>- Kiểm tra đồng hồ còn nguyên seal nilon bảo vệ, không trầy xước, nứt vỡ.</p>
        <p>- Kiểm tra đầy đủ phụ kiện: Hộp đựng cao cấp, túi xách, sổ thẻ bảo hành chính hãng có đóng dấu của JinWatch.</p>
        <br>
        <p><strong>3. Xử lý khi không ưng ý hoặc sai lệch:</strong></p>
        <p>- Nếu sản phẩm không đúng như cam kết, quý khách có quyền từ chối nhận hàng và KHÔNG MẤT BẤT KỲ CHI PHÍ NÀO.</p>
      `
    }
  };

  function openPolicy(policyKey) {
    const p = policies[policyKey] || policies['bao-hanh'];
    if (!policyModal) return;

    const brandName = window.SHOP_CONFIG?.brand?.name || 'Jin Watch';
    const hotline = window.SHOP_CONFIG?.contact?.hotlineDisplay || '0932.1234.73';
    const zalo = window.SHOP_CONFIG?.contact?.zaloDisplay || '0845.0136.19';

    let content = (p.content || '')
      .replace(/PhongWatch/g, brandName)
      .replace(/JinWatch/g, brandName)
      .replace(/0888\.477\.774/g, hotline)
      .replace(/0932\.1234\.73/g, hotline)
      .replace(/0988\.922\.330/g, zalo)
      .replace(/0845\.0136\.19/g, zalo);

    const pTitle = document.getElementById('policyTitle');
    const pBody = document.getElementById('policyBody');
    if (pTitle) pTitle.textContent = p.title;
    if (pBody) pBody.innerHTML = content;
    policyModal.classList.add('active');
  }

  function closePolicy() {
    if (policyModal) policyModal.classList.remove('active');
  }

  // ==========================================
  // 10. TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '<i class="fa fa-info-circle"></i>';
    if (type === 'success') icon = '<i class="fa fa-check-circle"></i>';
    if (type === 'warning') icon = '<i class="fa fa-exclamation-triangle"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ==========================================
  // 11. MOBILE MENU DRAWER
  // ==========================================
  function toggleMobileMenu(show) {
    if (!mobileNavDrawer) return;
    const overlay = document.getElementById('mobileNavOverlay');
    const willShow = (typeof show === 'boolean') ? show : !mobileNavDrawer.classList.contains('active');
    mobileNavDrawer.classList.toggle('active', willShow);
    if (overlay) overlay.classList.toggle('active', willShow);
    document.body.style.overflow = willShow ? 'hidden' : '';
  }

  window.focusMobileSearch = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      setTimeout(() => {
        searchInput.focus();
        searchInput.classList.add('focused-pulse');
        setTimeout(() => searchInput.classList.remove('focused-pulse'), 1500);
      }, 350);
    }
  };

  window.toggleMobileSubmenu = function(el) {
    const parent = el.closest('.mobile-menu-item');
    if (!parent) return;
    const submenu = parent.querySelector('.mobile-submenu');
    if (submenu) {
      submenu.classList.toggle('open');
      const icon = el.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-plus');
        icon.classList.toggle('fa-minus');
      }
    }
  };

  // Scroll to section helper
  window.scrollToSection = function(sectionId) {
    const sec = document.getElementById(sectionId);
    if (sec) {
      toggleMobileMenu(false);
      sec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter Catalog by Brand/Keyword
  function filterCatalog(term) {
    if (searchDropdown) searchDropdown.classList.remove('active');
    if (!term || typeof term !== 'string') return;
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    const termUpper = cleanTerm.toUpperCase();

    // 1. Check price queries
    if (cleanTerm.toLowerCase().includes('triệu') || cleanTerm.toLowerCase().includes('trieu')) {
      if (cleanTerm.includes('trên 20') || cleanTerm.includes('tren 20') || cleanTerm.includes('> 20') || cleanTerm.includes('>20')) {
        const pills = document.querySelectorAll('#priceFilterPills .filter-pill');
        setPriceFilter(20000000, Infinity, pills[5] || null);
        return;
      } else if (cleanTerm.includes('10 - 20') || cleanTerm.includes('trên 10') || cleanTerm.includes('tren 10')) {
        const pills = document.querySelectorAll('#priceFilterPills .filter-pill');
        setPriceFilter(10000000, 20000000, pills[4] || null);
        return;
      } else if (cleanTerm.includes('5 - 10') || cleanTerm.includes('5-10')) {
        const pills = document.querySelectorAll('#priceFilterPills .filter-pill');
        setPriceFilter(5000000, 10000000, pills[3] || null);
        return;
      } else if (cleanTerm.includes('3 - 5') || cleanTerm.includes('3-5')) {
        const pills = document.querySelectorAll('#priceFilterPills .filter-pill');
        setPriceFilter(3000000, 5000000, pills[2] || null);
        return;
      } else if (cleanTerm.includes('1 - 3') || cleanTerm.includes('dưới 3') || cleanTerm.includes('duoi 3')) {
        const pills = document.querySelectorAll('#priceFilterPills .filter-pill');
        setPriceFilter(0, 3000000, pills[1] || null);
        return;
      }
    }

    // 2. Check if term matches known watch brands
    const allBrands = [
      'OLYM PIANUS', 'CARNIVAL', 'ALEXANDER FERROS', 'BENTLEY', 'SEIKO', 'ORIENT', 'TISSOT', 'CITIZEN',
      'BULOVA', 'CASIO', 'OLYMPIA STAR', 'SRWATCH',
      'LONGINES', 'FREDERIQUE CONSTANT', 'MOVADO', 'MAURICE LACROIX', 'MIDO', 'OMEGA X SWATCH', 'OMEGA', 'OGIVAL',
      'THOMAS EARNSHAW', 'INVICTA', 'FOSSIL', 'EMPORIO ARMANI', 'JUST CAVALLI', 'GUESS'
    ];

    const matchedBrand = allBrands.find(b => termUpper === b || termUpper.startsWith(b) || termUpper.includes(b));
    if (matchedBrand) {
      if (termUpper.includes('NỮ')) {
        filterState.gender = 'Nữ';
        document.querySelectorAll('#genderFilterPills .filter-pill').forEach((b, i) => b.classList.toggle('active', i === 2));
      } else if (termUpper.includes('NAM')) {
        filterState.gender = 'Nam';
        document.querySelectorAll('#genderFilterPills .filter-pill').forEach((b, i) => b.classList.toggle('active', i === 1));
      } else {
        filterState.gender = 'all';
        document.querySelectorAll('#genderFilterPills .filter-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
      }

      filterState.keyword = '';
      if (searchInput) searchInput.value = '';
      const brandBtn = Array.from(document.querySelectorAll('#brandFilterPills .filter-pill'))
        .find(b => b.textContent.toUpperCase().includes(matchedBrand));
      setBrandFilter(matchedBrand, brandBtn);
      return;
    }

    // 3. Gender queries
    if (termUpper === 'ĐỒNG HỒ NỮ' || termUpper === 'NỮ') {
      const pills = document.querySelectorAll('#genderFilterPills .filter-pill');
      setGenderFilter('Nữ', pills[2] || null);
      return;
    } else if (termUpper === 'ĐỒNG HỒ NAM' || termUpper === 'NAM') {
      const pills = document.querySelectorAll('#genderFilterPills .filter-pill');
      setGenderFilter('Nam', pills[1] || null);
      return;
    }

    // 4. General Keyword Search (e.g. Tissot PRX, Sapphire, Lộ cơ, 8231G...)
    filterState.keyword = cleanTerm;
    // Check if dropdown had conflicting brand category, reset if conflicting
    if (searchCategory && searchCategory.value !== '0') {
      const catVal = searchCategory.value.toUpperCase();
      if (!termUpper.includes(catVal)) {
        searchCategory.value = '0';
      }
    }
    applyFilters();
  }

  // Scroll listener for Back to Top
  window.addEventListener('scroll', () => {
    if (!backToTopBtn) return;
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  // Expose global methods for HTML event handlers
  window.app = {
    addToCart,
    openQuickView,
    closeQuickView,
    changeQvQty,
    addCurrentQvToCart,
    updateQuantity,
    removeFromCart,
    toggleCartDrawer,
    openCheckout,
    closeCheckout,
    handleCheckoutSubmit,
    resetCheckoutView,
    openPolicy,
    closePolicy,
    goToSlide,
    nextSlide,
    prevSlide,
    toggleMobileMenu,
    filterCatalog,
    setPriceFilter,
    setBrandFilter,
    setGenderFilter,
    applySort,
    resetFilters
  };

  // Initialize all features
  renderCollectionCarousels();
  renderCollectionGrids();
  initHeroSlider();
  initSmartSearch();
  updateCartUI();
});
