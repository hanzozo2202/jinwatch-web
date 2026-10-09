/**
 * PHONGWATCH - LUXURY WATCH STORE
 * Central Configuration File (config.js)
 * 
 * Người sử dụng có thể chỉnh sửa trực tiếp các thông tin bên dưới:
 * - Thông tin thương hiệu (Tên, Slogan, Logo, Favicon)
 * - Màu sắc giao diện (Màu chủ đạo, Màu vàng kim)
 * - Thông tin liên hệ (Hotline, Zalo, Email, Địa chỉ, Fanpage, Bản đồ)
 * Hoặc sử dụng trang quản trị trực quan tại admin.html
 */

(function () {
  'use strict';

  // 1. Cấu hình mặc định của Website
  const DEFAULT_CONFIG = {
    brand: {
      name: "PHONGWATCH",
      tagline: "ĐỒNG HỒ CHÍNH HÃNG",
      slogan: "Men's Watch - Đồng Hồ Chính Hãng Giá Tốt",
      logoUrl: "https://theme.hstatic.net/1000223154/1001363986/14/logo_large.png?v=133",
      faviconUrl: "https://theme.hstatic.net/1000223154/1001363986/14/favicon.png?v=133",
      shareFbImage: "https://theme.hstatic.net/1000223154/1001363986/14/share_fb_home.png?v=133"
    },
    theme: {
      primaryColor: "#d61114",       // Màu đỏ thương hiệu chủ đạo
      primaryHover: "#b80c0f",       // Màu hover nút bấm
      primaryLight: "#fff0f0",       // Màu nền nhạt
      goldColor: "#c89b3c",          // Màu vàng kim luxury
      goldLight: "#e6c875",          // Màu vàng kim sáng
      goldDark: "#9e7520"            // Màu vàng kim đậm
    },
    contact: {
      hotlineDisplay: "0888.477.774",
      hotlineTel: "0888477774",
      zaloDisplay: "0988.922.330",
      zaloLink: "https://zalo.me/0988922330",
      email: "phongwatch.hcm@gmail.com",
      address: "357 Bình Thành, P. Bình Hưng Hòa B, Q. Bình Tân, TP. Hồ Chí Minh",
      addressNote: "(Tất cả các mẫu vui lòng liên hệ trước để đặt hàng)",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.9809658863846!2d106.58694401427957!3d10.81276829229686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752b9943d3017b%3A0x9b7461a7ddd8be8c!2zMzU3IELDrG5oIFRow6BuaCwgQsOsbmggSMawbmcgSMOyYSBCLCBCw6xuaCBUw6JuLCBI4buTIENow60gTWluaCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1505413433784",
      facebookPage: "https://www.facebook.com/PhongWatches",
      messenger: "https://m.me/PhongWatches"
    },
    seo: {
      title: "Đồng Hồ Chính Hãng – PhongWatch",
      metaDescription: "PhongWatch - Hệ thống phân phối đồng hồ chính hãng giá tốt tại Việt Nam. Carnival, Olym Pianus, Bentley, Seiko, Citizen, Orient, Tissot. Bảo hành 5 năm, đền gấp 10 nếu phát hiện hàng giả.",
      keywords: "phongwatch, đồng hồ chính hãng, đồng hồ nam, đồng hồ nữ, carnival, olym pianus, bentley, seiko, tissot"
    }
  };

  // 2. Kiểm tra xem có cấu hình tùy chỉnh từ localStorage (do admin.html lưu) hay không
  let activeConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  try {
    const savedConfig = localStorage.getItem('SHOP_CONFIG_OVERRIDE');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      activeConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
        brand: { ...DEFAULT_CONFIG.brand, ...(parsed.brand || {}) },
        theme: { ...DEFAULT_CONFIG.theme, ...(parsed.theme || {}) },
        contact: { ...DEFAULT_CONFIG.contact, ...(parsed.contact || {}) },
        seo: { ...DEFAULT_CONFIG.seo, ...(parsed.seo || {}) }
      };
    }
  } catch (e) {
    console.warn("Không thể tải cấu hình tùy chỉnh từ localStorage:", e);
  }

  // Gán vào biến toàn cục
  window.SHOP_CONFIG = activeConfig;
  window.DEFAULT_SHOP_CONFIG = DEFAULT_CONFIG;

  // 3. Hàm áp dụng màu sắc vào CSS Variables (:root)
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
      root.style.setProperty('--shadow-gold', `0 4px 15px ${theme.goldColor}40`);
    }
  }

  // 4. Hàm áp dụng toàn bộ cấu hình vào giao diện HTML
  function applyConfigToDOM() {
    const config = window.SHOP_CONFIG;
    if (!config) return;

    // A. Áp dụng màu sắc
    applyThemeColors(config.theme);

    // B. Áp dụng Logo & Favicon
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
      el.innerHTML = `${config.brand.name || 'PHONG<span>WATCH</span>'}`;
    });

    const logoTaglines = document.querySelectorAll('.logo-tagline');
    logoTaglines.forEach(el => {
      el.textContent = config.brand.tagline || 'ĐỒNG HỒ CHÍNH HÃNG';
    });

    // C. Áp dụng Slogan
    const slogans = document.querySelectorAll('.header-top-left .slogan');
    slogans.forEach(el => {
      el.innerHTML = `<i class="fa fa-gem text-gold"></i> ${config.brand.slogan || "Men's Watch - Đồng Hồ Chính Hãng Giá Tốt"}`;
    });

    // D. Áp dụng Hotline & Zalo
    const hotlineCallLinks = document.querySelectorAll('.topbar-hotline-link, a[href^="tel:"]');
    hotlineCallLinks.forEach(a => {
      if (a.closest('.header-hotline-box')) {
        a.href = `tel:${config.contact.hotlineTel}`;
        const strong = a.querySelector('strong');
        if (strong) strong.textContent = config.contact.hotlineDisplay;
      } else if (a.closest('.header-top-left')) {
        a.href = `tel:${config.contact.hotlineTel}`;
        a.innerHTML = `<i class="fa fa-phone-volume text-gold"></i> <strong>${config.contact.hotlineDisplay}</strong> (Gọi Điện) - <strong>${config.contact.zaloDisplay}</strong> (Zalo)`;
      } else if (a.closest('.footer-contact-list')) {
        a.href = `tel:${config.contact.hotlineTel}`;
        a.innerHTML = `<strong>${config.contact.hotlineDisplay}</strong> (Gọi điện) - <strong>${config.contact.zaloDisplay}</strong> (Nhắn Zalo)`;
      }
    });

    // E. Áp dụng Email
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(a => {
      a.href = `mailto:${config.contact.email}`;
      if (a.closest('.header-top-left')) {
        a.innerHTML = `<i class="fa fa-envelope text-gold"></i> ${config.contact.email}`;
      } else if (a.closest('.footer-contact-list')) {
        a.textContent = config.contact.email;
      }
    });

    // F. Áp dụng Địa chỉ & Bản đồ Google Maps
    const addressItems = document.querySelectorAll('.footer-contact-list li');
    if (addressItems.length > 0) {
      const firstLiSpan = addressItems[0].querySelector('span');
      if (firstLiSpan) {
        firstLiSpan.innerHTML = `${config.contact.address}<br><em style="color:#e9ecef; font-size:12px;">${config.contact.addressNote}</em>`;
      }
    }

    const mapFrame = document.querySelector('.footer-map-frame');
    if (mapFrame && config.contact.mapEmbedUrl) {
      mapFrame.src = config.contact.mapEmbedUrl;
    }

    // G. Áp dụng Mạng xã hội
    const fbLinks = document.querySelectorAll('a[title="Facebook"], a.social-btn[href*="facebook.com"]');
    fbLinks.forEach(a => { a.href = config.contact.facebookPage; });

    const msgrLinks = document.querySelectorAll('a[title="Messenger"], a.social-btn[href*="m.me"]');
    msgrLinks.forEach(a => { a.href = config.contact.messenger; });

    const zaloLinks = document.querySelectorAll('a[title="Zalo"], a.social-btn[href*="zalo.me"]');
    zaloLinks.forEach(a => { a.href = config.contact.zaloLink; });
  }

  // Tự động chạy ngay lập tức khi load file để style không bị giật
  applyThemeColors(activeConfig.theme);

  // Chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyConfigToDOM);
  } else {
    applyConfigToDOM();
  }

  // Export helper functions
  window.applyShopConfig = applyConfigToDOM;
  window.updateShopTheme = applyThemeColors;
})();
