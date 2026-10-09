/**
 * PHONGWATCH ADMIN CONTROL PANEL SCRIPT (js/admin.js)
 * Full CRUD for Products, Theme & Brand Management, 1-Click Export
 */

(function () {
  'use strict';

  // 1. Authentication State
  const AUTH_KEY = 'phongwatch_admin_auth';
  const PASSCODE_KEY = 'phongwatch_admin_passcode';
  const DEFAULT_PASSCODE = 'admin123';

  // 2. Data State
  let productsData = { collections: [], products: [] };
  let shopConfig = {};
  let currentEditingProductId = null;
  let currentPage = 1;
  const itemsPerPage = 12;

  // 3. Initialize Admin Panel
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadData();
    initEventListeners();
    renderOverview();
    renderThemeSettings();
    renderProductsTable();
    updateThemePreview();
  });

  // --- Authentication Helpers ---
  function checkAuth() {
    const isAuthed = sessionStorage.getItem(AUTH_KEY);
    const authModal = document.getElementById('authModal');
    if (isAuthed === 'true') {
      if (authModal) authModal.classList.remove('active');
    } else {
      if (authModal) authModal.classList.add('active');
    }
  }

  window.verifyAdminPasscode = function () {
    const input = document.getElementById('adminPasscodeInput');
    const entered = input ? input.value.trim() : '';
    const storedPasscode = localStorage.getItem(PASSCODE_KEY) || DEFAULT_PASSCODE;

    if (entered === storedPasscode) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.classList.remove('active');
      showToast('Đăng nhập quản trị thành công!', 'success');
    } else {
      showToast('Mật khẩu quản trị không chính xác!', 'danger');
      if (input) input.focus();
    }
  };

  window.adminLogout = function () {
    sessionStorage.removeItem(AUTH_KEY);
    checkAuth();
  };

  window.changeAdminPasscode = function () {
    const current = prompt('Nhập mật khẩu hiện tại:');
    const stored = localStorage.getItem(PASSCODE_KEY) || DEFAULT_PASSCODE;
    if (current !== stored) {
      alert('Mật khẩu hiện tại không đúng!');
      return;
    }
    const newPass = prompt('Nhập mật khẩu mới:');
    if (newPass && newPass.trim().length >= 4) {
      localStorage.setItem(PASSCODE_KEY, newPass.trim());
      alert('Đổi mật khẩu thành công! Mật khẩu mới của bạn là: ' + newPass.trim());
    } else if (newPass) {
      alert('Mật khẩu mới phải có ít nhất 4 ký tự!');
    }
  };

  // --- Data Loading & Synchronization ---
  function loadData() {
    // A. Load Products: Ưu tiên localStorage override, sau đó tới window.PHONGWATCH_DATA
    const savedProducts = localStorage.getItem('PHONGWATCH_DATA_OVERRIDE');
    if (savedProducts) {
      try {
        productsData = JSON.parse(savedProducts);
      } catch (e) {
        productsData = window.PHONGWATCH_DATA || { collections: [], products: [] };
      }
    } else if (window.PHONGWATCH_DATA) {
      productsData = JSON.parse(JSON.stringify(window.PHONGWATCH_DATA));
    }

    // B. Load Config: Ưu tiên localStorage override, sau đó tới window.SHOP_CONFIG
    const savedConfig = localStorage.getItem('SHOP_CONFIG_OVERRIDE');
    if (savedConfig) {
      try {
        shopConfig = JSON.parse(savedConfig);
      } catch (e) {
        shopConfig = window.SHOP_CONFIG || {};
      }
    } else if (window.SHOP_CONFIG) {
      shopConfig = JSON.parse(JSON.stringify(window.SHOP_CONFIG));
    }
  }

  function saveProductsToStorage() {
    localStorage.setItem('PHONGWATCH_DATA_OVERRIDE', JSON.stringify(productsData));
    updateStats();
  }

  function saveConfigToStorage() {
    localStorage.setItem('SHOP_CONFIG_OVERRIDE', JSON.stringify(shopConfig));
    if (typeof window.applyShopConfig === 'function') {
      window.applyShopConfig();
    }
  }

  // --- Tab Navigation ---
  window.switchTab = function (tabId, clickedEl) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-sidebar .nav-item').forEach(item => item.classList.remove('active'));

    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');

    if (clickedEl) clickedEl.classList.add('active');

    // Update topbar title
    const titleEl = document.getElementById('currentTabTitle');
    if (titleEl && clickedEl) {
      const span = clickedEl.querySelector('span');
      if (span) titleEl.textContent = span.textContent;
    }

    // Close mobile sidebar if open
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) sidebar.classList.remove('open');
  };

  window.toggleMobileSidebar = function () {
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) sidebar.classList.toggle('open');
  };

  // --- 1. OVERVIEW TAB ---
  function renderOverview() {
    updateStats();
  }

  function updateStats() {
    const totalProdEl = document.getElementById('statTotalProducts');
    const totalCollEl = document.getElementById('statTotalCollections');
    const inStockEl = document.getElementById('statInStock');
    const outStockEl = document.getElementById('statOutStock');

    const products = productsData.products || [];
    const inStockCount = products.filter(p => p.in_stock !== false).length;
    const outStockCount = products.length - inStockCount;

    if (totalProdEl) totalProdEl.textContent = products.length;
    if (totalCollEl) totalCollEl.textContent = (productsData.collections || []).length;
    if (inStockEl) inStockEl.textContent = inStockCount;
    if (outStockEl) outStockEl.textContent = outStockCount;

    const badgeStatus = document.getElementById('overviewConfigStatus');
    if (badgeStatus) {
      const hasOverride = localStorage.getItem('SHOP_CONFIG_OVERRIDE') || localStorage.getItem('PHONGWATCH_DATA_OVERRIDE');
      if (hasOverride) {
        badgeStatus.innerHTML = '<span class="badge" style="background:#fef3c7; color:#92400e;"><i class="fa fa-pen"></i> Có tùy chỉnh đang lưu</span>';
      } else {
        badgeStatus.innerHTML = '<span class="badge" style="background:#d1fae5; color:#065f46;"><i class="fa fa-check"></i> Đang đồng bộ mặc định</span>';
      }
    }
  }

  // --- 2. BRAND & THEME SETTINGS ---
  function renderThemeSettings() {
    if (!shopConfig) return;

    // Fill Theme Colors
    const primaryPicker = document.getElementById('themePrimaryColor');
    const primaryHex = document.getElementById('themePrimaryHex');
    const goldPicker = document.getElementById('themeGoldColor');
    const goldHex = document.getElementById('themeGoldHex');

    if (primaryPicker && shopConfig.theme) {
      primaryPicker.value = shopConfig.theme.primaryColor || '#d61114';
      if (primaryHex) primaryHex.value = primaryPicker.value;
    }
    if (goldPicker && shopConfig.theme) {
      goldPicker.value = shopConfig.theme.goldColor || '#c89b3c';
      if (goldHex) goldHex.value = goldPicker.value;
    }

    // Fill Brand Info
    if (shopConfig.brand) {
      setVal('cfgBrandName', shopConfig.brand.name);
      setVal('cfgTagline', shopConfig.brand.tagline);
      setVal('cfgSlogan', shopConfig.brand.slogan);
      setVal('cfgLogoUrl', shopConfig.brand.logoUrl);
      setVal('cfgFaviconUrl', shopConfig.brand.faviconUrl);
    }

    // Fill Contact Info
    if (shopConfig.contact) {
      setVal('cfgHotline', shopConfig.contact.hotlineDisplay);
      setVal('cfgHotlineTel', shopConfig.contact.hotlineTel);
      setVal('cfgZalo', shopConfig.contact.zaloDisplay);
      setVal('cfgZaloLink', shopConfig.contact.zaloLink);
      setVal('cfgEmail', shopConfig.contact.email);
      setVal('cfgAddress', shopConfig.contact.address);
      setVal('cfgAddressNote', shopConfig.contact.addressNote);
      setVal('cfgMapUrl', shopConfig.contact.mapEmbedUrl);
      setVal('cfgFacebook', shopConfig.contact.facebookPage);
      setVal('cfgMessenger', shopConfig.contact.messenger);
    }

    // Fill SEO
    if (shopConfig.seo) {
      setVal('cfgSeoTitle', shopConfig.seo.title);
      setVal('cfgSeoDesc', shopConfig.seo.metaDescription);
      setVal('cfgSeoKeywords', shopConfig.seo.keywords);
    }
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  window.setPrimaryPreset = function (color) {
    const picker = document.getElementById('themePrimaryColor');
    const hex = document.getElementById('themePrimaryHex');
    if (picker) picker.value = color;
    if (hex) hex.value = color;
    updateThemePreview();
  };

  window.setGoldPreset = function (color) {
    const picker = document.getElementById('themeGoldColor');
    const hex = document.getElementById('themeGoldHex');
    if (picker) picker.value = color;
    if (hex) hex.value = color;
    updateThemePreview();
  };

  function updateThemePreview() {
    const primary = document.getElementById('themePrimaryColor')?.value || '#d61114';
    const gold = document.getElementById('themeGoldColor')?.value || '#c89b3c';

    const pDemoBtn = document.getElementById('previewPrimaryBtn');
    const pDemoBadge = document.getElementById('previewPrimaryBadge');
    const pDemoGold = document.getElementById('previewGoldText');
    const pDemoBar = document.getElementById('previewHeaderBar');

    if (pDemoBtn) pDemoBtn.style.backgroundColor = primary;
    if (pDemoBadge) pDemoBadge.style.backgroundColor = primary;
    if (pDemoGold) pDemoGold.style.color = gold;
    if (pDemoBar) pDemoBar.style.borderTop = `3px solid ${primary}`;
  }

  window.saveThemeAndBrandConfig = function () {
    const primaryColor = document.getElementById('themePrimaryColor')?.value || '#d61114';
    const goldColor = document.getElementById('themeGoldColor')?.value || '#c89b3c';

    shopConfig = {
      ...shopConfig,
      brand: {
        name: getVal('cfgBrandName') || 'PHONGWATCH',
        tagline: getVal('cfgTagline') || 'ĐỒNG HỒ CHÍNH HÃNG',
        slogan: getVal('cfgSlogan') || "Men's Watch - Đồng Hồ Chính Hãng Giá Tốt",
        logoUrl: getVal('cfgLogoUrl') || 'https://theme.hstatic.net/1000223154/1001363986/14/logo_large.png?v=133',
        faviconUrl: getVal('cfgFaviconUrl') || 'https://theme.hstatic.net/1000223154/1001363986/14/favicon.png?v=133',
        shareFbImage: shopConfig.brand?.shareFbImage || ''
      },
      theme: {
        primaryColor: primaryColor,
        primaryHover: adjustBrightness(primaryColor, -20),
        primaryLight: adjustBrightness(primaryColor, 90),
        goldColor: goldColor,
        goldLight: adjustBrightness(goldColor, 40),
        goldDark: adjustBrightness(goldColor, -20)
      },
      contact: {
        hotlineDisplay: getVal('cfgHotline') || '0888.477.774',
        hotlineTel: getVal('cfgHotlineTel') || '0888477774',
        zaloDisplay: getVal('cfgZalo') || '0988.922.330',
        zaloLink: getVal('cfgZaloLink') || 'https://zalo.me/0988922330',
        email: getVal('cfgEmail') || 'phongwatch.hcm@gmail.com',
        address: getVal('cfgAddress') || '357 Bình Thành, P. Bình Hưng Hòa B, Q. Bình Tân, TP. Hồ Chí Minh',
        addressNote: getVal('cfgAddressNote') || '(Tất cả các mẫu vui lòng liên hệ trước để đặt hàng)',
        mapEmbedUrl: getVal('cfgMapUrl') || '',
        facebookPage: getVal('cfgFacebook') || 'https://www.facebook.com/PhongWatches',
        messenger: getVal('cfgMessenger') || 'https://m.me/PhongWatches'
      },
      seo: {
        title: getVal('cfgSeoTitle') || 'Đồng Hồ Chính Hãng – PhongWatch',
        metaDescription: getVal('cfgSeoDesc') || '',
        keywords: getVal('cfgSeoKeywords') || ''
      }
    };

    saveConfigToStorage();
    showToast('Đã lưu cấu hình thương hiệu và màu sắc thành công!', 'success');
  };

  // Helper color brightness adjust
  function adjustBrightness(hex, percent) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    let num = parseInt(hex, 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // --- 3. PRODUCTS MANAGEMENT ---
  function getFilteredProducts() {
    const searchVal = (document.getElementById('productSearchInput')?.value || '').toLowerCase().trim();
    const vendorVal = document.getElementById('filterVendorSelect')?.value || 'all';
    const collectionVal = document.getElementById('filterCollectionSelect')?.value || 'all';
    const stockVal = document.getElementById('filterStockSelect')?.value || 'all';

    return (productsData.products || []).filter(product => {
      // Search by name or id
      if (searchVal) {
        const matchName = product.name.toLowerCase().includes(searchVal);
        const matchId = String(product.id).toLowerCase().includes(searchVal);
        if (!matchName && !matchId) return false;
      }
      // Vendor
      if (vendorVal !== 'all' && product.vendor !== vendorVal) return false;
      // Collection
      if (collectionVal !== 'all' && product.collection !== collectionVal) return false;
      // Stock
      if (stockVal === 'in_stock' && product.in_stock === false) return false;
      if (stockVal === 'out_of_stock' && product.in_stock !== false) return false;

      return true;
    });
  }

  window.renderProductsTable = function (page = 1) {
    currentPage = page;
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const filtered = getFilteredProducts();
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    // Update count labels
    const countInfo = document.getElementById('productCountInfo');
    if (countInfo) {
      countInfo.textContent = `Hiển thị ${paginatedItems.length} trên tổng số ${totalCount} sản phẩm`;
    }

    if (paginatedItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
            <i class="fa fa-box-open" style="font-size: 32px; margin-bottom: 10px; display: block; color: #cbd5e1;"></i>
            Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
          </td>
        </tr>
      `;
      renderPaginationControls(0, 1);
      return;
    }

    tbody.innerHTML = paginatedItems.map(p => {
      const isOutStock = p.in_stock === false;
      const stockBadge = isOutStock 
        ? '<span class="badge badge-out-stock">Tạm hết</span>' 
        : '<span class="badge badge-in-stock">Còn hàng</span>';

      return `
        <tr>
          <td style="text-align: center;">
            <img class="product-thumb" src="${p.image}" alt="${p.name}" 
                 onerror="this.src='https://theme.hstatic.net/1000223154/1001363986/14/slideshow_1_medium.png?v=133'">
          </td>
          <td class="product-name-cell">
            <div class="p-title">${p.name}</div>
            <div class="p-sku">Mã: <strong>#${p.id}</strong> | Giới tính: ${p.gender || 'Nam'}</div>
          </td>
          <td><span class="badge badge-vendor">${p.vendor || 'Chính hãng'}</span></td>
          <td style="font-size: 12px; color: #475569;">${p.collection || '--'}</td>
          <td>
            <div style="font-weight: 700; color: #d61114;">${p.price}</div>
            ${p.original_price && p.original_price !== p.price ? `<div style="font-size: 11px; text-decoration: line-through; color: #94a3b8;">${p.original_price}</div>` : ''}
          </td>
          <td>${stockBadge}</td>
          <td>
            <div class="table-actions">
              <a href="product.html?id=${p.id}" target="_blank" class="btn btn-secondary btn-sm" title="Xem trên web">
                <i class="fa fa-eye"></i>
              </a>
              <button class="btn btn-primary btn-sm" onclick="window.openEditProductModal('${p.id}')" title="Sửa">
                <i class="fa fa-pencil"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="window.deleteProduct('${p.id}')" title="Xóa">
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    renderPaginationControls(totalPages, currentPage);
  };

  function renderPaginationControls(totalPages, current) {
    const container = document.getElementById('paginationControls');
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '';
    html += `<button class="btn btn-secondary btn-sm" ${current === 1 ? 'disabled' : ''} onclick="window.renderProductsTable(${current - 1})"><i class="fa fa-angle-left"></i> Trước</button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
        html += `<button class="btn btn-sm ${i === current ? 'btn-primary' : 'btn-secondary'}" onclick="window.renderProductsTable(${i})">${i}</button>`;
      } else if (i === current - 3 || i === current + 3) {
        html += `<span style="padding: 4px 6px; color: #94a3b8;">...</span>`;
      }
    }

    html += `<button class="btn btn-secondary btn-sm" ${current === totalPages ? 'disabled' : ''} onclick="window.renderProductsTable(${current + 1})">Sau <i class="fa fa-angle-right"></i></button>`;
    container.innerHTML = html;
  }

  // --- ADD / EDIT PRODUCT MODAL ---
  window.openAddProductModal = function () {
    currentEditingProductId = null;
    document.getElementById('productModalTitle').textContent = 'Thêm Sản Phẩm Mới';
    
    // Auto generate ID
    const newId = 'PW' + Date.now().toString().slice(-7);
    setVal('prodId', newId);
    setVal('prodName', '');
    setVal('prodVendor', 'OLYM PIANUS');
    setVal('prodCollection', 'OLYM PIANUS');
    setVal('prodPriceNum', '');
    setVal('prodOrigPriceNum', '');
    setVal('prodImage', '');
    setVal('prodGender', 'Nam');
    setVal('prodStock', 'true');
    setVal('prodRating', '5');
    setVal('prodReviews', '12');

    document.getElementById('productModalOverlay').classList.add('active');
  };

  window.openEditProductModal = function (productId) {
    const p = productsData.products.find(item => String(item.id) === String(productId));
    if (!p) return;

    currentEditingProductId = productId;
    document.getElementById('productModalTitle').textContent = `Chỉnh Sửa Sản Phẩm #${p.id}`;

    setVal('prodId', p.id);
    setVal('prodName', p.name);
    setVal('prodVendor', p.vendor || 'OLYM PIANUS');
    setVal('prodCollection', p.collection || 'OLYM PIANUS');
    setVal('prodPriceNum', p.price_num || '');
    setVal('prodOrigPriceNum', p.original_price_num || '');
    setVal('prodImage', p.image || '');
    setVal('prodGender', p.gender || 'Nam');
    setVal('prodStock', p.in_stock === false ? 'false' : 'true');
    setVal('prodRating', p.rating || 5);
    setVal('prodReviews', p.reviews_count || 10);

    document.getElementById('productModalOverlay').classList.add('active');
  };

  window.closeProductModal = function () {
    document.getElementById('productModalOverlay').classList.remove('active');
    currentEditingProductId = null;
  };

  window.saveProductForm = function () {
    const id = getVal('prodId');
    const name = getVal('prodName');
    const vendor = getVal('prodVendor');
    const collection = getVal('prodCollection');
    const priceNum = parseInt(getVal('prodPriceNum'), 10);
    const origPriceNum = parseInt(getVal('prodOrigPriceNum'), 10) || priceNum;
    const image = getVal('prodImage') || 'https://theme.hstatic.net/1000223154/1001363986/14/slideshow_1_medium.png?v=133';
    const gender = getVal('prodGender');
    const inStock = document.getElementById('prodStock')?.value === 'true';
    const rating = parseInt(getVal('prodRating'), 10) || 5;
    const reviewsCount = parseInt(getVal('prodReviews'), 10) || 10;

    if (!name) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Vui lòng nhập giá bán hợp lệ!');
      return;
    }

    // Format currency string
    const priceFormatted = priceNum.toLocaleString('vi-VN') + '₫';
    const origPriceFormatted = origPriceNum.toLocaleString('vi-VN') + '₫';

    // Calculate sale percent
    let saleBadge = '';
    if (origPriceNum > priceNum) {
      const discount = Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);
      saleBadge = `-${discount}%`;
    }

    const newProd = {
      id: id,
      name: name,
      vendor: vendor,
      collection: collection,
      price: priceFormatted,
      price_num: priceNum,
      original_price: origPriceFormatted,
      original_price_num: origPriceNum,
      sale: saleBadge,
      image: image,
      link: `/products/${id}`,
      rating: rating,
      reviews_count: reviewsCount,
      is_new: false,
      in_stock: inStock,
      gender: gender
    };

    if (currentEditingProductId) {
      // Update existing
      const index = productsData.products.findIndex(p => String(p.id) === String(currentEditingProductId));
      if (index !== -1) {
        productsData.products[index] = { ...productsData.products[index], ...newProd };
        showToast(`Đã cập nhật sản phẩm #${id}!`, 'success');
      }
    } else {
      // Add new to beginning of array
      productsData.products.unshift(newProd);
      showToast(`Đã thêm sản phẩm "${name}" thành công!`, 'success');
    }

    saveProductsToStorage();
    closeProductModal();
    renderProductsTable(1);
  };

  window.deleteProduct = function (productId) {
    const p = productsData.products.find(item => String(item.id) === String(productId));
    const pName = p ? p.name : productId;

    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm:\n"${pName}"?`)) {
      return;
    }

    productsData.products = productsData.products.filter(item => String(item.id) !== String(productId));
    saveProductsToStorage();
    renderProductsTable(currentPage);
    showToast(`Đã xóa sản phẩm #${productId}!`, 'warning');
  };

  // Upload local image from disk (converts to Base64)
  window.handleLocalImageUpload = function (event, targetInputId) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const input = document.getElementById(targetInputId);
      if (input) {
        input.value = e.target.result;
        showToast('Đã tải ảnh lên thành công!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // --- RESET TO DEFAULTS ---
  window.resetProductsToDefault = function () {
    if (!confirm('Bạn có chắc muốn KHÔI PHỤC lại danh sách 143 sản phẩm gốc ban đầu?\nMọi sản phẩm tự tạo sẽ bị xóa.')) {
      return;
    }
    localStorage.removeItem('PHONGWATCH_DATA_OVERRIDE');
    if (window.PHONGWATCH_DATA) {
      productsData = JSON.parse(JSON.stringify(window.PHONGWATCH_DATA));
    }
    renderProductsTable(1);
    updateStats();
    showToast('Đã khôi phục danh mục sản phẩm gốc ban đầu!', 'success');
  };

  window.resetConfigToDefault = function () {
    if (!confirm('Bạn có chắc muốn KHÔI PHỤC lại giao diện và màu sắc gốc ban đầu?')) {
      return;
    }
    localStorage.removeItem('SHOP_CONFIG_OVERRIDE');
    if (window.DEFAULT_SHOP_CONFIG) {
      shopConfig = JSON.parse(JSON.stringify(window.DEFAULT_SHOP_CONFIG));
    }
    renderThemeSettings();
    updateThemePreview();
    if (typeof window.applyShopConfig === 'function') {
      window.applyShopConfig();
    }
    showToast('Đã khôi phục cài đặt giao diện gốc ban đầu!', 'success');
  };

  // --- 4. EXPORT FILES FOR SERVER DEPLOYMENT ---
  window.downloadConfigFile = function () {
    const fileContent = `/**
 * PHONGWATCH - LUXURY WATCH STORE
 * Central Configuration File (config.js)
 * Generated from Admin Panel: ${new Date().toLocaleString('vi-VN')}
 */

(function () {
  'use strict';

  const SHOP_CONFIG = ${JSON.stringify(shopConfig, null, 2)};

  window.SHOP_CONFIG = SHOP_CONFIG;
  window.DEFAULT_SHOP_CONFIG = SHOP_CONFIG;

  function applyThemeColors(theme) {
    if (!theme) return;
    const root = document.documentElement;
    if (theme.primaryColor) {
      root.style.setProperty('--color-primary', theme.primaryColor);
      root.style.setProperty('--color-primary-hover', theme.primaryHover || theme.primaryColor);
      root.style.setProperty('--color-primary-light', theme.primaryLight || '#fff0f0');
    }
    if (theme.goldColor) {
      root.style.setProperty('--color-gold', theme.goldColor);
      root.style.setProperty('--color-gold-light', theme.goldLight || theme.goldColor);
      root.style.setProperty('--color-gold-dark', theme.goldDark || theme.goldColor);
      root.style.setProperty('--shadow-gold', \`0 4px 15px \${theme.goldColor}40\`);
    }
  }

  function applyConfigToDOM() {
    const config = window.SHOP_CONFIG;
    if (!config) return;

    applyThemeColors(config.theme);

    const favicon = document.querySelector("link[rel*='icon']");
    if (favicon && config.brand.faviconUrl) {
      favicon.href = config.brand.faviconUrl;
    }

    const logos = document.querySelectorAll('.site-logo-img');
    logos.forEach(img => {
      if (config.brand.logoUrl) {
        img.src = config.brand.logoUrl;
        img.alt = config.brand.name || 'Logo';
      }
    });

    const logoBrands = document.querySelectorAll('.logo-brand');
    logoBrands.forEach(el => {
      el.innerHTML = \`\${config.brand.name || 'PHONG<span>WATCH</span>'}\`;
    });

    const logoTaglines = document.querySelectorAll('.logo-tagline');
    logoTaglines.forEach(el => {
      el.textContent = config.brand.tagline || 'ĐỒNG HỒ CHÍNH HÃNG';
    });

    const slogans = document.querySelectorAll('.header-top-left .slogan');
    slogans.forEach(el => {
      el.innerHTML = \`<i class="fa fa-gem text-gold"></i> \${config.brand.slogan || "Men's Watch - Đồng Hồ Chính Hãng Giá Tốt"}\`;
    });

    const hotlineCallLinks = document.querySelectorAll('.topbar-hotline-link, a[href^="tel:"]');
    hotlineCallLinks.forEach(a => {
      if (a.closest('.header-hotline-box')) {
        a.href = \`tel:\${config.contact.hotlineTel}\`;
        const strong = a.querySelector('strong');
        if (strong) strong.textContent = config.contact.hotlineDisplay;
      } else if (a.closest('.header-top-left')) {
        a.href = \`tel:\${config.contact.hotlineTel}\`;
        a.innerHTML = \`<i class="fa fa-phone-volume text-gold"></i> <strong>\${config.contact.hotlineDisplay}</strong> (Gọi Điện) - <strong>\${config.contact.zaloDisplay}</strong> (Zalo)\`;
      } else if (a.closest('.footer-contact-list')) {
        a.href = \`tel:\${config.contact.hotlineTel}\`;
        a.innerHTML = \`<strong>\${config.contact.hotlineDisplay}</strong> (Gọi điện) - <strong>\${config.contact.zaloDisplay}</strong> (Nhắn Zalo)\`;
      }
    });

    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(a => {
      a.href = \`mailto:\${config.contact.email}\`;
      if (a.closest('.header-top-left')) {
        a.innerHTML = \`<i class="fa fa-envelope text-gold"></i> \${config.contact.email}\`;
      } else if (a.closest('.footer-contact-list')) {
        a.textContent = config.contact.email;
      }
    });

    const addressItems = document.querySelectorAll('.footer-contact-list li');
    if (addressItems.length > 0) {
      const firstLiSpan = addressItems[0].querySelector('span');
      if (firstLiSpan) {
        firstLiSpan.innerHTML = \`\${config.contact.address}<br><em style="color:#e9ecef; font-size:12px;">\${config.contact.addressNote}</em>\`;
      }
    }

    const mapFrame = document.querySelector('.footer-map-frame');
    if (mapFrame && config.contact.mapEmbedUrl) {
      mapFrame.src = config.contact.mapEmbedUrl;
    }

    const fbLinks = document.querySelectorAll('a[title="Facebook"], a.social-btn[href*="facebook.com"]');
    fbLinks.forEach(a => { a.href = config.contact.facebookPage; });

    const msgrLinks = document.querySelectorAll('a[title="Messenger"], a.social-btn[href*="m.me"]');
    msgrLinks.forEach(a => { a.href = config.contact.messenger; });

    const zaloLinks = document.querySelectorAll('a[title="Zalo"], a.social-btn[href*="zalo.me"]');
    zaloLinks.forEach(a => { a.href = config.contact.zaloLink; });
  }

  applyThemeColors(SHOP_CONFIG.theme);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyConfigToDOM);
  } else {
    applyConfigToDOM();
  }

  window.applyShopConfig = applyConfigToDOM;
  window.updateShopTheme = applyThemeColors;
})();
`;

    triggerDownload('config.js', fileContent);
    showToast('Đang tải file config.js xuống máy tính của bạn...', 'success');
  };

  window.downloadProductsJsFile = function () {
    const fileContent = `/**
 * PHONGWATCH - LUXURY WATCH CATALOG
 * Complete Products Catalog (data/products.js)
 * Generated from Admin Panel: ${new Date().toLocaleString('vi-VN')}
 */

window.PHONGWATCH_DATA = ${JSON.stringify(productsData, null, 2)};
`;

    triggerDownload('products.js', fileContent);
    showToast('Đang tải file products.js xuống máy tính của bạn...', 'success');
  };

  window.downloadProductsJsonFile = function () {
    const fileContent = JSON.stringify(productsData, null, 2);
    triggerDownload('products.json', fileContent);
    showToast('Đang tải file products.json xuống máy tính của bạn...', 'success');
  };

  function triggerDownload(filename, text) {
    const blob = new Blob([text], { type: 'application/javascript;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'danger') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Event Listeners Init ---
  function initEventListeners() {
    // Color Pickers
    const primaryPicker = document.getElementById('themePrimaryColor');
    const primaryHex = document.getElementById('themePrimaryHex');
    if (primaryPicker) {
      primaryPicker.addEventListener('input', (e) => {
        if (primaryHex) primaryHex.value = e.target.value;
        updateThemePreview();
      });
    }
    if (primaryHex) {
      primaryHex.addEventListener('change', (e) => {
        if (primaryPicker && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
          primaryPicker.value = e.target.value;
          updateThemePreview();
        }
      });
    }

    const goldPicker = document.getElementById('themeGoldColor');
    const goldHex = document.getElementById('themeGoldHex');
    if (goldPicker) {
      goldPicker.addEventListener('input', (e) => {
        if (goldHex) goldHex.value = e.target.value;
        updateThemePreview();
      });
    }
    if (goldHex) {
      goldHex.addEventListener('change', (e) => {
        if (goldPicker && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
          goldPicker.value = e.target.value;
          updateThemePreview();
        }
      });
    }

    // Search and Filters for Products
    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => renderProductsTable(1));
    }
    const filterVendor = document.getElementById('filterVendorSelect');
    if (filterVendor) {
      filterVendor.addEventListener('change', () => renderProductsTable(1));
    }
    const filterCollection = document.getElementById('filterCollectionSelect');
    if (filterCollection) {
      filterCollection.addEventListener('change', () => renderProductsTable(1));
    }
    const filterStock = document.getElementById('filterStockSelect');
    if (filterStock) {
      filterStock.addEventListener('change', () => renderProductsTable(1));
    }
  }

})();
