/**
 * JINWATCH ADMIN CONTROL PANEL SCRIPT (js/admin.js)
 * Full CRUD for Products, Theme & Brand Management, 1-Click Export
 */

(function () {
  'use strict';

  // 1. Authentication State
  const AUTH_KEY = 'jinwatch_admin_auth';
  const PASSCODE_HASH_KEY = 'jinwatch_admin_pass_hash';
  // SHA-256 hash của mật khẩu mặc định 'admin123' (Không lưu mật khẩu dạng plain-text)
  const DEFAULT_PASSCODE_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
  const LOCKOUT_KEY = 'jinwatch_admin_lockout';
  const ATTEMPTS_KEY = 'jinwatch_admin_fail_attempts';

  // 2. Data State
  let productsData = { collections: [], products: [] };
  let shopConfig = {};
  let currentEditingProductId = null;
  let currentPage = 1;
  const itemsPerPage = 12;

  // --- Cryptography & Security Helpers ---
  async function computeSha256(text) {
    if (window.crypto && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hash = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hash));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return text;
  }

  function checkLockoutStatus() {
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
    const now = Date.now();
    const btnUnlock = document.getElementById('btnAdminUnlock');
    const inputPass = document.getElementById('adminPasscodeInput');
    const msg = document.getElementById('authAttemptsMsg');

    if (lockoutUntil > now) {
      const remainingMinutes = Math.ceil((lockoutUntil - now) / 60000);
      if (btnUnlock) btnUnlock.disabled = true;
      if (inputPass) inputPass.disabled = true;
      if (msg) {
        msg.style.color = 'var(--admin-danger)';
        msg.innerHTML = `<i class="fa fa-ban"></i> Đã thử sai quá 5 lần. Tạm khóa ${remainingMinutes} phút!`;
      }
      return true;
    } else {
      if (btnUnlock) btnUnlock.disabled = false;
      if (inputPass) inputPass.disabled = false;
      return false;
    }
  }

  // 3. Initialize Admin Panel
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadData();
    initEventListeners();
    renderOverview();
    renderThemeSettings();
    renderProductsTable();
    updateThemePreview();
    loadGitHubDeploySettings();
  });

  // --- Authentication Helpers ---
  function checkAuth() {
    const isAuthed = sessionStorage.getItem(AUTH_KEY);
    const authModal = document.getElementById('authModal');
    const mainLayout = document.getElementById('adminMainLayout') || document.querySelector('.admin-layout');

    if (isAuthed === 'true') {
      if (authModal) {
        authModal.classList.remove('active');
        authModal.style.display = 'none';
      }
      if (mainLayout) {
        mainLayout.style.display = 'flex';
        mainLayout.style.visibility = 'visible';
        mainLayout.style.opacity = '1';
      }
    } else {
      if (authModal) {
        authModal.classList.add('active');
        authModal.style.display = 'flex';
      }
      checkLockoutStatus();
    }
  }

  window.verifyAdminPasscode = async function () {
    if (checkLockoutStatus()) return;

    const input = document.getElementById('adminPasscodeInput');
    const entered = input ? input.value.trim() : '';
    if (!entered) {
      showToast('Vui lòng nhập mật mã quản trị!', 'warning');
      if (input) input.focus();
      return;
    }

    let enteredHash = '';
    try {
      enteredHash = await computeSha256(entered);
    } catch (e) {
      enteredHash = entered;
    }

    const storedHash = localStorage.getItem(PASSCODE_HASH_KEY);
    const storedPlain = localStorage.getItem('jinwatch_admin_passcode');

    // Matching condition: matches SHA-256 hash OR default hash OR default plain 'admin123' OR custom plain
    const isSuccess = (entered === 'admin123') ||
                      (enteredHash === DEFAULT_PASSCODE_HASH) ||
                      (storedHash && enteredHash === storedHash) ||
                      (storedPlain && entered === storedPlain);

    if (isSuccess) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);

      const authModal = document.getElementById('authModal');
      const mainLayout = document.getElementById('adminMainLayout') || document.querySelector('.admin-layout');
      if (authModal) {
        authModal.classList.remove('active');
        authModal.style.display = 'none';
      }
      if (mainLayout) {
        mainLayout.style.display = 'flex';
        mainLayout.style.visibility = 'visible';
        mainLayout.style.opacity = '1';
      }

      // Re-render components to guarantee full UI visibility
      renderOverview();
      renderThemeSettings();
      renderProductsTable(1);
      updateThemePreview();

      showToast('Đăng nhập quản trị thành công!', 'success');
    } else {
      let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
      localStorage.setItem(ATTEMPTS_KEY, attempts.toString());

      if (attempts >= 5) {
        localStorage.setItem(LOCKOUT_KEY, (Date.now() + 15 * 60 * 1000).toString());
        checkLockoutStatus();
        showToast('Bạn đã nhập sai 5 lần! Bảng quản trị bị khóa 15 phút.', 'danger');
      } else {
        const remaining = 5 - attempts;
        showToast(`Mật khẩu không chính xác! Còn ${remaining} lần thử.`, 'danger');
        const msg = document.getElementById('authAttemptsMsg');
        if (msg) {
          msg.style.color = 'var(--admin-danger)';
          msg.innerHTML = `<i class="fa fa-triangle-exclamation"></i> Mật khẩu sai! Còn ${remaining} lần thử trước khi bị khóa.`;
        }
      }
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  };

  window.adminLogout = function () {
    sessionStorage.removeItem(AUTH_KEY);
    checkAuth();
    showToast('Đã đăng xuất khỏi phiên quản trị!', 'info');
  };

  window.changeAdminPasscode = async function () {
    const current = prompt('Nhập mật khẩu hiện tại:');
    if (!current) return;
    const currentHash = await computeSha256(current.trim());
    const storedHash = localStorage.getItem(PASSCODE_HASH_KEY) || DEFAULT_PASSCODE_HASH;

    if (currentHash !== storedHash) {
      alert('Mật khẩu hiện tại không đúng!');
      return;
    }
    const newPass = prompt('Nhập mật khẩu mới (ít nhất 6 ký tự):');
    if (newPass && newPass.trim().length >= 6) {
      const newHash = await computeSha256(newPass.trim());
      localStorage.setItem(PASSCODE_HASH_KEY, newHash);
      alert('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
      showToast('Đã đổi mật khẩu quản trị thành công!', 'success');
    } else if (newPass) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
    }
  };

  // --- Data Loading & Synchronization ---
  function loadData() {
    // A. Load Products: Ưu tiên localStorage override, sau đó tới window.JINWATCH_DATA / window.PHONGWATCH_DATA
    const savedProducts = localStorage.getItem('JINWATCH_DATA_OVERRIDE');
    if (savedProducts) {
      try {
        productsData = JSON.parse(savedProducts);
      } catch (e) {
        productsData = window.JINWATCH_DATA || window.PHONGWATCH_DATA || { collections: [], products: [] };
      }
    } else if (window.JINWATCH_DATA || window.PHONGWATCH_DATA) {
      productsData = JSON.parse(JSON.stringify(window.JINWATCH_DATA || window.PHONGWATCH_DATA));
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
    localStorage.setItem('JINWATCH_DATA_OVERRIDE', JSON.stringify(productsData));
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
      const hasOverride = localStorage.getItem('SHOP_CONFIG_OVERRIDE') || localStorage.getItem('JINWATCH_DATA_OVERRIDE');
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

    const brandName = getVal('cfgBrandName') || 'Jin Watch';
    const hotlineDisplay = getVal('cfgHotline') || '0932.1234.73';
    let hotlineTel = getVal('cfgHotlineTel');
    if (!hotlineTel) {
      hotlineTel = hotlineDisplay.replace(/\D/g, '') || '0932123473';
    }

    const zaloDisplay = getVal('cfgZalo') || '0845.0136.19';
    const cleanZalo = zaloDisplay.replace(/\D/g, '') || '0845013619';
    let zaloLink = getVal('cfgZaloLink');
    if (!zaloLink || !zaloLink.startsWith('http')) {
      zaloLink = `https://zalo.me/${cleanZalo}`;
    }

    const facebookPage = getVal('cfgFacebook') || 'https://www.facebook.com/JinWatchPro';
    let messenger = getVal('cfgMessenger');
    if (!messenger) {
      const fbMatch = facebookPage.match(/facebook\.com\/([a-zA-Z0-9._-]+)/);
      messenger = fbMatch ? `https://m.me/${fbMatch[1]}` : 'https://m.me/JinWatchPro';
    }

    shopConfig = {
      ...shopConfig,
      brand: {
        name: brandName,
        tagline: getVal('cfgTagline') || 'ĐỒNG HỒ CHÍNH HÃNG',
        slogan: getVal('cfgSlogan') || "Men's Watch - Đồng Hồ Chính Hãng Giá Tốt",
        logoUrl: getVal('cfgLogoUrl') || 'assets/logo.png',
        faviconUrl: getVal('cfgFaviconUrl') || 'assets/favicon.png',
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
        hotlineDisplay: hotlineDisplay,
        hotlineTel: hotlineTel,
        zaloDisplay: zaloDisplay,
        zaloLink: zaloLink,
        email: getVal('cfgEmail') || 'jinwatch.hcm@gmail.com',
        address: getVal('cfgAddress') || '357 Bình Thành, P. Bình Hưng Hòa B, Q. Bình Tân, TP. Hồ Chí Minh',
        addressNote: getVal('cfgAddressNote') || '(Tất cả các mẫu vui lòng liên hệ trước để đặt hàng)',
        mapEmbedUrl: getVal('cfgMapUrl') || '',
        facebookPage: facebookPage,
        messenger: messenger
      },
      seo: {
        title: getVal('cfgSeoTitle') || `Đồng Hồ Chính Hãng – ${brandName}`,
        metaDescription: getVal('cfgSeoDesc') || '',
        keywords: getVal('cfgSeoKeywords') || ''
      }
    };

    saveConfigToStorage();
    showToast('Đã lưu cấu hình thương hiệu và màu sắc thành công!', 'success');
  };

  // Real-time synchronization helpers for admin form
  window.autoSyncHotline = function (val) {
    const clean = (val || '').replace(/\D/g, '');
    const telInput = document.getElementById('cfgHotlineTel');
    if (telInput && clean.length >= 8) {
      telInput.value = clean;
    }
  };

  window.autoSyncZalo = function (val) {
    const clean = (val || '').replace(/\D/g, '');
    const linkInput = document.getElementById('cfgZaloLink');
    if (linkInput && clean.length >= 8) {
      linkInput.value = `https://zalo.me/${clean}`;
    }
  };

  window.autoSyncFacebook = function (val) {
    const link = (val || '').trim();
    const msgrInput = document.getElementById('cfgMessenger');
    if (msgrInput && (!msgrInput.value || msgrInput.value.includes('m.me/JinWatchPro'))) {
      const match = link.match(/facebook\.com\/([a-zA-Z0-9._-]+)/);
      if (match) {
        msgrInput.value = `https://m.me/${match[1]}`;
      }
    }
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
                 onerror="this.src='assets/slider-1.png'">
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
  let currentProductImages = [];

  function renderGalleryPreview() {
    const container = document.getElementById('galleryPreviewContainer');
    if (!container) return;

    if (!currentProductImages || currentProductImages.length === 0) {
      container.innerHTML = `
        <div style="font-size: 13px; color: #94a3b8; font-style: italic; padding: 6px 0;">
          <i class="fa fa-circle-info"></i> Chưa có ảnh trong bộ sưu tập. Hệ thống sẽ tự dùng ảnh đại diện chính làm mặc định.
        </div>
      `;
      return;
    }

    container.innerHTML = currentProductImages.map((imgUrl, idx) => `
      <div style="position: relative; width: 64px; height: 64px; border-radius: 8px; border: 2px solid ${idx === 0 ? '#d61114' : '#cbd5e1'}; overflow: hidden; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.06); flex-shrink: 0;" title="${idx === 0 ? 'Ảnh đại diện chính' : `Góc ảnh #${idx + 1}`}">
        <img src="${imgUrl}" alt="Gallery ${idx + 1}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='assets/slider-1.png'">
        ${idx === 0 ? '<span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(214,17,20,0.85); color: #fff; font-size: 9px; text-align: center; line-height: 14px; font-weight: 700;">CHÍNH</span>' : ''}
        <button type="button" onclick="window.removeGalleryImage(${idx})" style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.65); color: #fff; border: none; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='#ef4444'" onmouseout="this.style.background='rgba(0,0,0,0.65)'" title="Xóa ảnh này">
          <i class="fa fa-times"></i>
        </button>
      </div>
    `).join('');
  }

  window.removeGalleryImage = function (index) {
    if (index >= 0 && index < currentProductImages.length) {
      currentProductImages.splice(index, 1);
      if (index === 0 && currentProductImages.length > 0) {
        setVal('prodImage', currentProductImages[0]);
      }
      renderGalleryPreview();
    }
  };

  window.addManualGalleryImage = function () {
    const input = document.getElementById('addGalleryUrlInput');
    const val = input ? input.value.trim() : '';
    if (!val) {
      alert('Vui lòng nhập đường dẫn URL ảnh hoặc tên file ảnh!');
      return;
    }
    currentProductImages.push(val);
    if (!getVal('prodImage')) {
      setVal('prodImage', val);
    }
    if (input) input.value = '';
    renderGalleryPreview();
    showToast('Đã thêm ảnh vào bộ sưu tập!', 'success');
  };

  window.handleMultipleGalleryUpload = function (event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    let loadedCount = 0;
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        showToast(`Ảnh "${file.name}" quá lớn (>2MB), đã bỏ qua.`, 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        currentProductImages.push(e.target.result);
        if (!getVal('prodImage')) {
          setVal('prodImage', e.target.result);
        }
        loadedCount++;
        if (loadedCount === files.length) {
          renderGalleryPreview();
          showToast(`Đã thêm ${loadedCount} ảnh vào bộ sưu tập!`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  window.syncMainImageToGallery = function (val) {
    const trimmed = (val || '').trim();
    if (!trimmed) return;
    if (currentProductImages.length === 0) {
      currentProductImages.push(trimmed);
      renderGalleryPreview();
    } else {
      currentProductImages[0] = trimmed;
      renderGalleryPreview();
    }
  };

  window.openAddProductModal = function () {
    currentEditingProductId = null;
    currentProductImages = [];
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

    renderGalleryPreview();
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

    // Initialize gallery images
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      currentProductImages = [...p.images];
    } else if (p.image) {
      currentProductImages = [p.image];
    } else {
      currentProductImages = [];
    }
    renderGalleryPreview();

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
    let image = getVal('prodImage') || 'assets/slider-1.png';
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

    // Prepare gallery images array
    let finalImages = currentProductImages.length > 0 ? [...currentProductImages] : (image ? [image] : []);
    if (image && (!finalImages.length || finalImages[0] !== image)) {
      finalImages.unshift(image);
    }
    // Remove duplicates while preserving order
    finalImages = [...new Set(finalImages)];
    if (!image && finalImages.length > 0) {
      image = finalImages[0];
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
      images: finalImages,
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
        if (targetInputId === 'prodImage') {
          syncMainImageToGallery(e.target.result);
        }
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
    localStorage.removeItem('JINWATCH_DATA_OVERRIDE');
    if (window.JINWATCH_DATA || window.PHONGWATCH_DATA) {
      productsData = JSON.parse(JSON.stringify(window.JINWATCH_DATA || window.PHONGWATCH_DATA));
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

  // --- 4. EXPORT FILES FOR SERVER DEPLOYMENT & CLOUDFLARE AUTO-DEPLOY ---
  const CF_REPO_KEY = 'jinwatch_cf_repo';
  const CF_BRANCH_KEY = 'jinwatch_cf_branch';
  const CF_TOKEN_KEY = 'jinwatch_cf_tokenPosition';

  window.toggleGithubTokenVisibility = function () {
    const input = document.getElementById('cfGithubToken');
    const eye = document.getElementById('cfTokenEyeIcon');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (eye) eye.className = 'fa fa-eye-slash';
    } else {
      input.type = 'password';
      if (eye) eye.className = 'fa fa-eye';
    }
  };

  window.saveGitHubDeploySettings = function () {
    const repoInput = document.getElementById('cfGithubRepo');
    const branchInput = document.getElementById('cfGithubBranch');
    const tokenInput = document.getElementById('cfGithubToken');

    const repo = repoInput ? repoInput.value.trim() : 'hanzozo2202/jinwatch-web';
    const branch = branchInput ? branchInput.value.trim() : 'main';
    const token = tokenInput ? tokenInput.value.trim() : '';

    localStorage.setItem(CF_REPO_KEY, repo);
    localStorage.setItem(CF_BRANCH_KEY, branch);
    if (token) {
      localStorage.setItem(CF_TOKEN_KEY, token);
    }

    showToast('Đã lưu cấu hình GitHub vào trình duyệt!', 'success');
    logToCfTerminal(`Đã lưu cấu hình: Repo = "${repo}", Branch = "${branch}".`, 'info');
  };

  function loadGitHubDeploySettings() {
    const repoInput = document.getElementById('cfGithubRepo');
    const branchInput = document.getElementById('cfGithubBranch');
    const tokenInput = document.getElementById('cfGithubToken');

    const repo = localStorage.getItem(CF_REPO_KEY) || 'hanzozo2202/jinwatch-web';
    const branch = localStorage.getItem(CF_BRANCH_KEY) || 'main';
    const token = localStorage.getItem(CF_TOKEN_KEY) || '';

    if (repoInput) repoInput.value = repo;
    if (branchInput) branchInput.value = branch;
    if (tokenInput && token) tokenInput.value = token;
  }

  window.clearCfDeployTerminal = function () {
    const term = document.getElementById('cfDeployTerminal');
    const badge = document.getElementById('cfDeployStatusBadge');
    if (term) term.textContent = 'JinWatch Deploy System v2.0 ready.\nNhấn nút "ĐẨY CONFIG LÊN GITHUB & AUTO DEPLOY" để tự động cập nhật website lên Cloudflare Pages.';
    if (badge) {
      badge.textContent = 'Chờ lệnh...';
      badge.style.background = '#e2e8f0';
      badge.style.color = '#475569';
    }
  };

  function logToCfTerminal(message, type = 'info') {
    const term = document.getElementById('cfDeployTerminal');
    const badge = document.getElementById('cfDeployStatusBadge');
    if (!term) return;

    const time = new Date().toLocaleTimeString('vi-VN');
    const formattedMsg = `[${time}] ${message}`;

    term.textContent += '\n' + formattedMsg;
    term.scrollTop = term.scrollHeight;

    if (badge) {
      if (type === 'success') {
        badge.textContent = 'Deploy thành công!';
        badge.style.background = '#10b981';
        badge.style.color = '#fff';
      } else if (type === 'error') {
        badge.textContent = 'Lỗi!';
        badge.style.background = '#ef4444';
        badge.style.color = '#fff';
      } else if (type === 'running') {
        badge.textContent = 'Đang triển khai...';
        badge.style.background = '#f59e0b';
        badge.style.color = '#fff';
      }
    }
  }

  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function generateConfigFileString() {
    return `/**
 * JINWATCH - LUXURY WATCH STORE
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

  function applyConfigToDOM(customConfig) {
    let config = customConfig;
    if (!config) {
      try {
        const saved = localStorage.getItem('SHOP_CONFIG_OVERRIDE');
        if (saved) {
          config = JSON.parse(saved);
        }
      } catch (e) {}
    }
    if (!config) {
      config = window.SHOP_CONFIG;
    }
    if (!config) return;

    // 1. Theme Colors
    applyThemeColors(config.theme);

    // 2. Favicon
    if (config.brand && config.brand.faviconUrl) {
      document.querySelectorAll("link[rel*='icon']").forEach(el => {
        el.href = config.brand.faviconUrl;
      });
    }

    // 3. Brand & Logos
    const brandName = (config.brand && config.brand.name) ? config.brand.name : 'Jin Watch';
    const brandTagline = (config.brand && config.brand.tagline) ? config.brand.tagline : 'ĐỒNG HỒ CHÍNH HÃNG';
    const brandSlogan = (config.brand && config.brand.slogan) ? config.brand.slogan : "Men's Watch - Đồng Hồ Chính Hãng Giá Tốt";

    // All Logo Images
    if (config.brand && config.brand.logoUrl) {
      document.querySelectorAll('.site-logo-img, img[alt*="Logo"], [data-config="logo"]').forEach(img => {
        img.src = config.brand.logoUrl;
        img.alt = brandName + ' Logo';
      });
    }

    // Logo Brand Text (Desktop & Mobile Fallbacks)
    document.querySelectorAll('.logo-brand, [data-config="brand-name"]').forEach(el => {
      if (brandName.toUpperCase().endsWith('WATCH') && brandName.length > 5) {
        const prefix = brandName.substring(0, brandName.length - 5);
        el.innerHTML = \`\${prefix}<span>WATCH</span>\`;
      } else {
        el.textContent = brandName;
      }
    });

    // Mobile Drawer Header Brand Text
    document.querySelectorAll('.mobile-drawer-header div').forEach(el => {
      if (brandName.toUpperCase().endsWith('WATCH') && brandName.length > 5) {
        const prefix = brandName.substring(0, brandName.length - 5);
        el.innerHTML = \`\${prefix}<span style="color:var(--color-primary);">WATCH</span>\`;
      } else {
        el.textContent = brandName;
      }
    });

    // Logo Tagline
    document.querySelectorAll('.logo-tagline, [data-config="brand-tagline"]').forEach(el => {
      el.textContent = brandTagline;
    });

    // Topbar Slogan
    document.querySelectorAll('.header-top-left .slogan, [data-config="brand-slogan"]').forEach(el => {
      el.innerHTML = \`<i class="fa fa-gem text-gold"></i> \${brandSlogan}\`;
    });

    // Footer Copyright Brand
    document.querySelectorAll('.footer-bottom strong, [data-config="copyright-brand"]').forEach(el => {
      el.textContent = brandName;
    });

    // Checkout Modal Order Confirmation Text
    const checkoutNotice = document.querySelector('#checkoutSuccess p');
    if (checkoutNotice) {
      checkoutNotice.innerHTML = \`Nhân viên <strong>\${brandName}</strong> sẽ gọi điện cho quý khách trong vòng <strong>10 phút</strong> để xác nhận và gửi hàng hỏa tốc. Cảm ơn quý khách!\`;
    }

    // 4. CONTACTS: HOTLINE, ZALO, SOCIALS
    if (config.contact) {
      const hotlineDisplay = config.contact.hotlineDisplay || '0932.1234.73';
      const rawTel = config.contact.hotlineTel || hotlineDisplay.replace(/\\D/g, '') || '0932123473';
      const telHref = \`tel:\${rawTel}\`;

      const zaloDisplay = config.contact.zaloDisplay || '0845.0136.19';
      const cleanZalo = zaloDisplay.replace(/\\D/g, '') || '0845013619';
      let zaloLink = config.contact.zaloLink;
      if (!zaloLink || !zaloLink.startsWith('http')) {
        zaloLink = \`https://zalo.me/\${cleanZalo}\`;
      }

      const facebookPage = config.contact.facebookPage || 'https://www.facebook.com/JinWatchPro';
      let messenger = config.contact.messenger;
      if (!messenger) {
        const fbMatch = facebookPage.match(/facebook\\.com\\/([a-zA-Z0-9._-]+)/);
        messenger = fbMatch ? \`https://m.me/\${fbMatch[1]}\` : 'https://m.me/JinWatchPro';
      }

      // --- A. ALL HOTLINE / PHONE LINKS & BUTTONS ---
      document.querySelectorAll('a[href^="tel:"], .phone-btn, .bottom-nav-hotline, [data-config="hotline-link"]').forEach(a => {
        a.href = telHref;

        if (a.closest('.header-hotline-box')) {
          const strong = a.querySelector('strong');
          if (strong) strong.textContent = hotlineDisplay;
          else a.textContent = hotlineDisplay;
        } else if (a.closest('.header-top-left')) {
          // Handled separately below in combined block
        } else if (a.closest('.footer-contact-list')) {
          // Handled separately below in combined block
        } else if (a.closest('.product-detail-layout') || a.parentElement?.textContent?.includes('tư vấn')) {
          a.innerHTML = \`<i class="fa fa-phone"></i> \${hotlineDisplay}\`;
        } else if (a.classList.contains('float-btn') && a.classList.contains('phone-btn')) {
          a.title = \`Gọi ngay \${hotlineDisplay}\`;
          const tip = a.querySelector('.tooltip');
          if (tip) tip.textContent = \`Gọi: \${hotlineDisplay}\`;
        } else if (a.classList.contains('social-btn')) {
          a.title = \`Gọi Hotline: \${hotlineDisplay}\`;
        } else if (a.classList.contains('mobile-bottom-nav-item') || a.classList.contains('mobile-p-action-item')) {
          a.title = \`Gọi Hotline: \${hotlineDisplay}\`;
        }
      });

      // --- B. ALL ZALO LINKS, BUTTONS & TOOLTIPS ---
      document.querySelectorAll('a[href*="zalo.me"], a.zalo-btn, a[title*="Zalo"], a[title*="zalo"], [data-config="zalo-link"]').forEach(a => {
        a.href = zaloLink;
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');

        if (a.classList.contains('float-btn') || a.classList.contains('zalo-btn')) {
          a.title = \`Chat Zalo \${zaloDisplay}\`;
          const tip = a.querySelector('.tooltip');
          if (tip) tip.textContent = \`Chat Zalo: \${zaloDisplay}\`;
        } else if (a.classList.contains('social-btn')) {
          a.title = \`Zalo: \${zaloDisplay}\`;
        }
      });

      // --- C. COMBINED TOPBAR & FOOTER CONTACT BLOCKS ---
      // Header Topbar
      document.querySelectorAll('.header-top-left a[href^="tel:"], .header-top-left [data-config="topbar-contacts"]').forEach(a => {
        a.href = telHref;
        a.innerHTML = \`<i class="fa fa-phone-volume text-gold"></i> <strong>\${hotlineDisplay}</strong> (Gọi Điện) - <span onclick="event.preventDefault(); window.open('\${zaloLink}', '_blank');" style="cursor:pointer;" title="Bấm để chat Zalo"><strong>\${zaloDisplay}</strong> (Zalo)</span>\`;
      });

      // Footer contact list items
      document.querySelectorAll('.footer-contact-list li').forEach((li, idx) => {
        if (idx === 0) {
          const span = li.querySelector('span');
          if (span && config.contact.address) {
            span.innerHTML = \`\${config.contact.address}<br><em style="color:#e9ecef; font-size:12px;">\${config.contact.addressNote || ''}</em>\`;
          }
        } else if (idx === 1 || li.textContent.includes('Gọi điện') || li.textContent.includes('Zalo')) {
          const a = li.querySelector('a');
          if (a) {
            a.href = telHref;
            a.innerHTML = \`<strong>\${hotlineDisplay}</strong> (Gọi điện) - <span onclick="event.preventDefault(); window.open('\${zaloLink}', '_blank');" style="cursor:pointer; text-decoration:underline;" title="Bấm để chat Zalo"><strong>\${zaloDisplay}</strong> (Nhắn Zalo)</span>\`;
          }
        } else if (idx === 2 || li.textContent.includes('@')) {
          const a = li.querySelector('a');
          if (a && config.contact.email) {
            a.href = \`mailto:\${config.contact.email}\`;
            a.textContent = config.contact.email;
          }
        }
      });

      // --- D. ALL FACEBOOK / FANPAGE LINKS ---
      document.querySelectorAll('a[href*="facebook.com"], a[title*="Facebook"], a.facebook-btn, [data-config="facebook-link"]').forEach(a => {
        a.href = facebookPage;
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        if (a.classList.contains('social-btn')) {
          a.title = \`Fanpage Facebook: \${brandName}\`;
        }
      });

      // --- E. ALL MESSENGER LINKS ---
      document.querySelectorAll('a[href*="m.me"], a[title*="Messenger"], a.messenger-btn, [data-config="messenger-link"]').forEach(a => {
        a.href = messenger;
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        if (a.classList.contains('float-btn')) {
          a.title = 'Facebook Messenger';
          const tip = a.querySelector('.tooltip');
          if (tip) tip.textContent = 'Nhắn tin Facebook';
        }
      });

      // --- F. EMAIL LINKS ---
      if (config.contact.email) {
        document.querySelectorAll('a[href^="mailto:"], [data-config="email-link"]').forEach(a => {
          a.href = \`mailto:\${config.contact.email}\`;
          if (a.closest('.header-top-left')) {
            a.innerHTML = \`<i class="fa fa-envelope text-gold"></i> \${config.contact.email}\`;
          } else if (a.closest('.footer-contact-list')) {
            a.textContent = config.contact.email;
          }
        });
      }

      // --- G. GOOGLE MAPS ---
      if (config.contact.mapEmbedUrl) {
        document.querySelectorAll('.footer-map-frame, iframe[title*="Bản đồ"], [data-config="map-frame"]').forEach(frame => {
          frame.src = config.contact.mapEmbedUrl;
        });
      }
    }

    // 5. SEO & PAGE TITLES
    if (config.seo) {
      if (config.seo.title && (document.title.includes('JinWatch') || document.title.includes('PhongWatch'))) {
        document.title = config.seo.title;
      }
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && config.seo.metaDescription) {
        metaDesc.setAttribute('content', config.seo.metaDescription);
      }
    }
  }

  applyThemeColors(SHOP_CONFIG.theme);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyConfigToDOM());
  } else {
    applyConfigToDOM();
  }

  window.applyShopConfig = applyConfigToDOM;
  window.updateShopTheme = applyThemeColors;
})();
`;
  }

  function generateProductsJsFileString() {
    return `/**
 * JINWATCH - LUXURY WATCH CATALOG
 * Complete Products Catalog (data/products.js)
 * Generated from Admin Panel: ${new Date().toLocaleString('vi-VN')}
 */

window.JINWATCH_DATA = ${JSON.stringify(productsData, null, 2)};\nwindow.PHONGWATCH_DATA = window.JINWATCH_DATA;
`;
  }

  // --- GitHub REST API Helper ---
  async function commitFileToGitHub(owner, repo, branch, path, contentStr, commitMessage, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    // Step 1: Get current SHA if file exists
    let sha = null;
    try {
      const getRes = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json'
        }
      });
      if (getRes.status === 200) {
        const getData = await getRes.json();
        sha = getData.sha;
      } else if (getRes.status === 401 || getRes.status === 403) {
        const errData = await getRes.json().catch(() => ({}));
        throw new Error(errData.message || 'GitHub Token không chính xác hoặc không đủ quyền "repo"!');
      }
    } catch (err) {
      if (!err.message || !err.message.includes('404')) {
        throw err;
      }
    }

    // Step 2: PUT commit
    const base64Content = utf8ToBase64(contentStr);
    const body = {
      message: commitMessage,
      content: base64Content,
      branch: branch
    };
    if (sha) {
      body.sha = sha;
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      throw new Error(errData.message || `Lỗi GitHub API HTTP ${putRes.status}`);
    }

    const result = await putRes.json();
    return result;
  }

  // --- 1-Click Trigger Cloudflare Auto Deploy ---
  window.triggerCloudflareDeploy = async function (includeProducts = false) {
    const repoInput = document.getElementById('cfGithubRepo');
    const branchInput = document.getElementById('cfGithubBranch');
    const tokenInput = document.getElementById('cfGithubToken');

    const repoFullName = (repoInput ? repoInput.value.trim() : '') || localStorage.getItem(CF_REPO_KEY) || 'hanzozo2202/jinwatch-web';
    const branch = (branchInput ? branchInput.value.trim() : '') || localStorage.getItem(CF_BRANCH_KEY) || 'main';
    const token = (tokenInput ? tokenInput.value.trim() : '') || localStorage.getItem(CF_TOKEN_KEY);

    if (!token) {
      alert('Vui lòng nhập GitHub Personal Access Token (PAT) để tự động đẩy code!\n\nNếu chưa có, hãy bấm vào link "Tạo token nhanh (30s)" ở trên ô nhập token (chọn quyền "repo").');
      if (tokenInput) tokenInput.focus();
      return;
    }

    const repoParts = repoFullName.split('/');
    if (repoParts.length !== 2) {
      alert('Tên GitHub Repository phải có định dạng "owner/repo" (ví dụ: hanzozo2202/jinwatch-web)!');
      return;
    }
    const [owner, repo] = repoParts;

    // Save settings
    localStorage.setItem(CF_REPO_KEY, repoFullName);
    localStorage.setItem(CF_BRANCH_KEY, branch);
    localStorage.setItem(CF_TOKEN_KEY, token);

    logToCfTerminal('========================================');
    logToCfTerminal(`BẮT ĐẦU QUY TRÌNH AUTO-DEPLOY CLOUDFLARE PAGES...`, 'running');
    logToCfTerminal(`Đích đến: GitHub ${owner}/${repo} (nhánh ${branch})`, 'info');

    try {
      // 1. Commit config.js
      logToCfTerminal(`[1/${includeProducts ? '2' : '1'}] Đang tạo commit file config.js lên GitHub...`, 'running');
      const configStr = generateConfigFileString();
      const configResult = await commitFileToGitHub(
        owner,
        repo,
        branch,
        'config.js',
        configStr,
        `admin: auto deploy config.js via Cloudflare [${new Date().toLocaleString('vi-VN')}]`,
        token
      );
      const commitSha = configResult.commit ? configResult.commit.sha.substring(0, 7) : 'latest';
      logToCfTerminal(`✅ Đã commit config.js thành công (Commit: ${commitSha})!`, 'info');

      // 2. Commit data/products.js if requested
      if (includeProducts) {
        logToCfTerminal(`[2/2] Đang tạo commit file data/products.js lên GitHub...`, 'running');
        const prodJsStr = generateProductsJsFileString();
        const prodResult = await commitFileToGitHub(
          owner,
          repo,
          branch,
          'data/products.js',
          prodJsStr,
          `admin: auto deploy products.js via Cloudflare [${new Date().toLocaleString('vi-VN')}]`,
          token
        );
        const prodSha = prodResult.commit ? prodResult.commit.sha.substring(0, 7) : 'latest';
        logToCfTerminal(`✅ Đã commit data/products.js thành công (Commit: ${prodSha})!`, 'info');
      }

      logToCfTerminal(`🎉 HOÀN TẤT COMMIT LÊN GITHUB!`, 'success');
      logToCfTerminal(`🚀 Cloudflare Pages đang tự động nhận diện commit mới và Build website toàn cầu.`, 'success');
      logToCfTerminal(`⏱️ Website của bạn sẽ cập nhật sau khoảng 15 - 30 giây!`, 'info');
      logToCfTerminal(`🌐 Kiểm tra Cloudflare: https://dash.cloudflare.com`, 'info');
      logToCfTerminal(`========================================`);

      showToast('Đã đẩy lên GitHub thành công! Cloudflare Pages đang tự động triển khai bản mới.', 'success');
    } catch (err) {
      console.error('Lỗi triển khai GitHub / Cloudflare:', err);
      logToCfTerminal(`❌ THẤT BẠI: ${err.message}`, 'error');
      logToCfTerminal(`Gợi ý: Kiểm tra lại Token có quyền "repo" chưa, hoặc kiểm tra kết nối mạng.`, 'error');
      showToast(`Lỗi triển khai: ${err.message}`, 'danger');
    }
  };

  // --- Manual Downloads ---
  window.downloadConfigFile = function () {
    const fileContent = generateConfigFileString();
    triggerDownload('config.js', fileContent);
    showToast('Đang tải file config.js xuống máy tính của bạn...', 'success');
  };

  window.downloadProductsJsFile = function () {
    const fileContent = generateProductsJsFileString();
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
