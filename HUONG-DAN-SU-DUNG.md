# 📖 HƯỚNG DẪN QUẢN TRỊ & BÀN GIAO WEBSITE PHONGWATCH

> **Dành cho:** Chủ cửa hàng, Quản trị viên website và Đội ngũ kỹ thuật bàn giao.  
> **Phiên bản:** PhongWatch Luxury Store v2.0  
> **Kiến trúc:** Zero-Dependency (Chạy trực tiếp trên mọi Server/Hosting, không cần cài đặt Node.js hay Database MySQL phức tạp).

---

## 📁 1. Cấu Trúc Thư Mục Source Code

Toàn bộ source code được tổ chức khoa học, phân tách rõ ràng giữa **Giao diện (Frontend)**, **Dữ liệu sản phẩm (Data)**, **Cấu hình thương hiệu (Config)** và **Trang quản trị (Admin Panel)**:

```text
website/
├── index.html              # Trang chủ: Đầy đủ 9 bộ sưu tập, slider, mega menu, bộ lọc giá, giỏ hàng
├── product.html            # Trang chi tiết sản phẩm: Gallery ảnh, thông số kỹ thuật, bảo hành 5 năm
├── admin.html              # TRANG QUẢN TRỊ: Thêm/sửa/xóa sản phẩm, đổi logo, đổi màu sắc, xuất file
│
├── config.js               # ⭐ FILE CẤU HÌNH TRUNG TÂM: Tên shop, logo, màu sắc, hotline, zalo, địa chỉ
│
├── data/
│   ├── products.js         # Danh mục 143+ mẫu đồng hồ (Olym Pianus, Carnival, Bentley, Seiko, Tissot...)
│   └── products.json       # Bản sao lưu định dạng JSON thuần để dự phòng hoặc tích hợp backend
│
├── css/
│   ├── style.css           # Toàn bộ CSS phong cách Luxury, chuẩn font tiếng Việt 100%
│   └── admin.css           # CSS giao diện bảng điều khiển quản trị viên
│
├── js/
│   ├── app.js              # Logic bán hàng: Giỏ hàng, lọc sản phẩm, tìm kiếm thông minh, đặt hàng
│   └── admin.js            # Logic trang quản trị: CRUD sản phẩm, chọn màu, xuất file cập nhật
│
├── assets/                 # Thư mục chứa hình ảnh, banner, icon tải về
└── HUONG-DAN-SU-DUNG.md    # Tài liệu hướng dẫn bàn giao chi tiết này
```

---

## 🎨 2. Cách Sử Dụng Trang Quản Trị `admin.html` (Không Cần Biết Code)

Chủ shop chỉ cần mở file `admin.html` trên trình duyệt (hoặc truy cập `https://tenmiencuaban.com/admin.html` sau khi up lên server):

### 🔑 Bước 1: Đăng Nhập Quản Trị
- **Mật mã mặc định:** `admin123`
- *(Chủ shop có thể đổi mật khẩu mới bất cứ lúc nào tại mục **"Đổi Mật Khẩu Admin"** ở menu bên trái)*.

---

### 🎨 Bước 2: Thay Đổi Màu Sắc & Nhận Diện Thương Hiệu (Tab "Giao Diện & Thương Hiệu")
1. **Đổi Màu Sắc Giao Diện:**
   - **Màu chủ đạo (Primary Color):** Chọn màu đỏ Ruby mặc định, hoặc click vào các mẫu màu có sẵn: *Xanh Sapphire, Đen Luxury Gold, Xanh Emerald, Nâu Hổ Phách...* hoặc tự chọn mã màu bất kỳ qua Color Picker.
   - **Màu vàng kim (Gold Accent):** Đổi màu viền hoàng gia, icon vương miện, số sao đánh giá.
   - Có khung **Live Preview** bên dưới để nhìn thấy ngay mẫu giao diện đổi màu theo thời gian thực!
2. **Đổi Logo & Thông Tin Cửa Hàng (Tự Động Đồng Bộ 100% Toàn Web):**
   - **Tên shop & Thương hiệu:** Đổi tên (ví dụ `JinWATCH`), hệ thống tự cập nhật logo chữ, menu trượt mobile, chân trang copyright và tiêu đề tab trình duyệt.
   - **Hotline:** Nhập số hotline hiển thị (ví dụ `0845.013.619`), hệ thống **tự động cập nhật tất cả**:
     - Số hotline trên thanh topbar đầu trang.
     - Ô tư vấn hotline trên header.
     - Nút gọi nổi tròn góc dưới màn hình (`float-btn`).
     - Thanh điều hướng gọi nhanh dưới đáy màn hình điện thoại (`mobile-bottom-nav`).
     - Ô tư vấn kích cỡ ở trang chi tiết sản phẩm.
     - Danh sách hotline ở chân trang footer.
   - **Zalo (Đồng Bộ Tuyệt Đối):** Chỉ cần nhập số Zalo (ví dụ `0845013619`), hệ thống sẽ **tự động sinh link `https://zalo.me/0845013619`** và cập nhật cho:
     - Nút chat Zalo nổi góc dưới bên phải màn hình (cả link, tiêu đề và tooltip hiển thị khi rê chuột).
     - Nút Zalo trong danh sách mạng xã hội ở chân trang footer.
     - Số Zalo hiển thị và link bấm nhắn Zalo ở thanh topbar đầu trang.
     - Mục liên hệ Zalo trong popup chính sách thanh toán.
   - **Fanpage Facebook & Messenger:** Nhập link Fanpage, hệ thống tự đồng bộ cả nút Facebook và nút chat Messenger nổi.
   - **Địa chỉ & Google Maps:** Nhập địa chỉ và mã nhúng iframe, tự động cập nhật bản đồ chỉ đường ở chân trang.
3. Bấm **"💾 Lưu Cấu Hình Giao Diện"** để lưu lại.

---

### 📦 Bước 3: Thêm / Sửa / Xóa Sản Phẩm (Tab "Quản Lý Sản Phẩm")
- **Thêm sản phẩm mới & Đăng nhiều ảnh góc cạnh:**
  1. Bấm nút **"+ Thêm Sản Phẩm Mới"**.
  2. Nhập Tên đồng hồ, chọn Thương hiệu (Carnival, Olym Pianus, Bentley, Seiko, Tissot...), chọn Danh mục hiển thị.
  3. Nhập Giá bán (ví dụ gõ `6800000` hệ thống tự định dạng thành `6,800,000₫`).
  4. Nhập Giá gốc / Giá niêm yết (hệ thống sẽ tự động tính ra tỷ lệ % giảm giá, ví dụ `-24%`).
  5. **Ảnh đại diện chính (Cover Image):** Chọn 1 ảnh mặt trước đại diện hiển thị ở danh sách sản phẩm.
  6. **📸 Bộ Sưu Tập Nhiều Hình Ảnh (Góc Cạnh Đồng Hồ):**
     - Bấm nút **"+ Thêm nhiều ảnh từ máy"** để chọn cùng lúc nhiều góc chụp (mặt kính sapphire, mặt đáy lộ cơ, núm vặn ren, khóa bướm, lên tay thực tế...).
     - Hoặc dán link ảnh góc cạnh vào ô và bấm **"Thêm Link"**.
     - Có thể xóa bớt góc chụp bất kỳ bằng cách bấm nút `X` màu đỏ trên thumbnail.
  7. Chọn tình trạng (Còn hàng / Tạm hết hàng), giới tính (Nam / Nữ / Cặp đôi).
  8. Bấm **"Lưu Sản Phẩm"**.
- **Sửa sản phẩm:** Bấm biểu tượng cây bút ✏️ tại dòng sản phẩm cần sửa để thay đổi thông tin, bổ sung thêm góc chụp hoặc cập nhật giá.
- **Xóa sản phẩm:** Bấm biểu tượng thùng rác 🗑️ để xóa mẫu đã ngừng kinh doanh.
- **Tìm kiếm & Lọc:** Hỗ trợ tìm nhanh theo tên, mã SKU, lọc theo hãng hoặc theo kho hàng.
- **Khôi phục gốc:** Nếu lỡ thao tác nhầm, có nút **"Khôi phục 143 mẫu gốc"** để đưa toàn bộ danh mục về trạng thái chuẩn ban đầu.

---

### 💾 Bước 4: Xuất File Cập Nhật Lên Server (Tab "Xuất File & Triển Khai Server")
Sau khi chỉnh sửa xong, để các khách hàng bên ngoài internet nhìn thấy thay đổi:
1. Bấm nút **"📥 Tải Về config.js"** -> Lưu về máy tính.
2. Bấm nút **"📥 Tải Về data/products.js"** -> Lưu về máy tính.
3. Đăng nhập vào hosting/server, dán đè file `config.js` vào thư mục gốc và dán đè file `products.js` vào thư mục `data/` của website.
4. **Xong!** Website của bạn đã được cập nhật hoàn toàn mới mà không cần khởi động lại server.

---

## 🛠️ 3. Cách Can Thiệp Bằng Code (Dành Cho Kỹ Thuật Viên)

Nếu muốn sửa trực tiếp bằng file code mà không qua giao diện:

### A. Chỉnh sửa thông tin shop & màu sắc trong `config.js`
Mở file [config.js](file:///c:/Users/13520/Documents/personal/projects/website/config.js) bằng VS Code hoặc Notepad:
```javascript
window.SHOP_CONFIG = {
  brand: {
    name: "PHONGWATCH",
    tagline: "ĐỒNG HỒ CHÍNH HÃNG",
    slogan: "Men's Watch - Đồng Hồ Chính Hãng Giá Tốt",
    logoUrl: "https://ten-mien-cua-ban/logo.png"
  },
  theme: {
    primaryColor: "#d61114",  // Đổi màu chủ đạo tại đây
    goldColor: "#c89b3c"       // Đổi màu vàng kim tại đây
  },
  contact: {
    hotlineDisplay: "0888.477.774",
    hotlineTel: "0888477774",
    zaloDisplay: "0988.922.330",
    zaloLink: "https://zalo.me/0988922330",
    email: "phongwatch.hcm@gmail.com",
    address: "357 Bình Thành, P. Bình Hưng Hòa B, Q. Bình Tân, TP. Hồ Chí Minh"
  }
};
```
Mọi thay đổi trong file này sẽ **tự động áp dụng đồng bộ** cho cả `index.html` và `product.html`.

### B. Chỉnh sửa sản phẩm trong `data/products.js`
Mở file [data/products.js](file:///c:/Users/13520/Documents/personal/projects/website/data/products.js):
Mỗi sản phẩm hỗ trợ trường `images` chứa danh sách nhiều góc ảnh khác nhau:
```javascript
{
  "id": "1035326344",
  "name": "Olym Pianus Fusion OP990-45ADDGS-GL-T ( OP990-45 )",
  "vendor": "OLYM PIANUS",
  "collection": "OLYM PIANUS",
  "price": "6,700,000₫",
  "price_num": 6700000,
  "original_price": "8,800,000₫",
  "original_price_num": 8800000,
  "sale": "-24%",
  "image": "assets/products/p_1035326344.jpg",
  "images": [
    "assets/products/p_1035326344.jpg", // Ảnh mặt trước chính diện
    "assets/products/p_1033689647.jpg", // Góc cạnh núm vặn
    "assets/products/p_1033689880.jpg", // Đáy lộ máy
    "assets/products/p_1038492338.jpg"  // Lên tay thực tế
  ],
  "in_stock": true,
  "gender": "Nam"
}
```

---

## 🚀 4. Hướng Dẫn Phát Hành (Deploy) & Quản Lý Hình Ảnh

### 📸 A. Vấn Đề Hình Ảnh Sản Phẩm Đã Được Xử Lý Triệt Để:
- **Tình trạng trước đây:** Ảnh sản phẩm trỏ về link server của trang gốc (`hstatic.net`). Khi deploy sang server khác, nếu trang gốc đổi link hoặc chặn Hotlinking (HTTP 403 Forbidden), ảnh sẽ bị lỗi hiển thị.
- **Giải pháp đã thực hiện:** 
  - Toàn bộ **143 hình ảnh sản phẩm** và tất cả logo, banner đã được **tải 100% về thư mục cục bộ `assets/products/`** trong source code.
  - Tổng dung lượng toàn bộ ảnh chỉ khoảng **~1.7 MB** (rất nhẹ, tải siêu nhanh).
  - Khi bạn deploy lên bất kỳ hosting nào (DigitalOcean, Vercel, Cloudflare Pages, Netlify...), toàn bộ ảnh đều đi cùng với source code.
  - **Lợi ích:** 100% tự chủ, website không bao giờ bị phụ thuộc vào trang gốc, không sợ chết link, tốc độ load ảnh nhanh gấp đôi nhờ lưu trữ nội bộ.

---

### 🌐 B. Hướng Dẫn Deploy Lên Từng Nền Tảng:

#### Cách 1: Triển Khai Trên Cloudflare Pages (Miễn phí vĩnh viễn, CDN mạnh nhất thế giới)
1. Đăng nhập vào tài khoản [Cloudflare Dashboard](https://dash.cloudflare.com/) &gt; chọn **Workers & Pages** &gt; chọn **Pages** &gt; chọn **Upload Assets**.
2. Đặt tên dự án (ví dụ: `phongwatch`).
3. Kéo thả toàn bộ thư mục `website` vào Cloudflare Pages.
4. Bấm **Deploy site** &gt; Xong trong 5 giây! Cloudflare cung cấp SSL HTTPS miễn phí, CDN chống DDoS cực mạnh và không giới hạn băng thông.

### 🚀 B. Các Phương Án Triển Khai Website Lên Server / Hosting

#### 🥇 Cách 1: Triển Khai Tự Động Với Cloudflare Pages (KHUYÊN DÙNG SỐ 1 - 100% MIỄN PHÍ)

Cloudflare Pages là giải pháp tối ưu nhất cho website PhongWatch / JinWatch vì:
- **Tự Động Hóa 100% (CI/CD):** Mỗi lần bạn đẩy code lên GitHub hoặc nhấn nút lưu trên trang Admin, Cloudflare Pages sẽ **tự động deploy bản mới nhất sau 15-30 giây**!
- **Tốc Độ Siêu Tốc:** Toàn bộ hình ảnh, CSS, JS được lưu trên mạng lưới Edge CDN của Cloudflare (có máy chủ tại Hà Nội và TP.HCM), giúp mở trang gần như tức thì.
- **Bảo Mật & Miễn Phí:** Miễn phí băng thông không giới hạn, miễn phí chứng chỉ SSL HTTPS, chống DDoS tự động.

---

##### 📌 Bước 1: Kết Nối Cloudflare Pages Với GitHub Repository (Làm 1 lần duy nhất)

1. Đăng nhập hoặc đăng ký tài khoản tại [dash.cloudflare.com](https://dash.cloudflare.com).
2. Tại menu bên trái, chọn **Workers & Pages** &rarr; Bấm **Create application** &rarr; Chọn tab **Pages**.
3. Bấm nút **Connect to Git**.
4. Chọn tài khoản GitHub của bạn (nếu là lần đầu, cấp quyền cho Cloudflare truy cập repository).
5. Chọn kho lưu trữ: <code class="code-badge">hanzozo2202/jinwatch-web</code> &rarr; Bấm **Begin setup**.
6. Điền cấu hình xây dựng (Build settings):
   - **Project name:** `jinwatch-web` (hoặc tên tùy thích).
   - **Production branch:** `main`.
   - **Framework preset:** `None` *(vì website viết bằng HTML/CSS/JS thuần)*.
   - **Build command:** *(để trống)*.
   - **Build output directory:** `/` *(hoặc để trống)*.
7. Bấm **Save and Deploy**.
8. Chờ khoảng 20 giây, Cloudflare sẽ cấp cho bạn tên miền miễn phí dạng:  
   👉 `https://jinwatch-web.pages.dev` (hoặc bạn có thể gắn tên miền riêng `.vn` / `.com` vào mục Custom Domains cực kỳ dễ dàng).

---

##### ⚡ Cách 1: Tự Động Deploy Mỗi Lần Push Code Từ Máy Tính (Dành Cho Lập Trình Viên)

Mỗi lần bạn sửa đổi code hoặc hình ảnh trên máy tính:
```bash
git add .
git commit -m "Cập nhật tính năng mới"
git push jin main
```
Ngay sau khi lệnh `git push` hoàn tất, Cloudflare Pages sẽ tự động nhận diện commit mới, kéo code về và phát hành bản mới ra toàn cầu mà bạn không cần phải làm thêm bất kỳ thao tác nào!

---

##### 🚀 Cách 2: Tự Động Deploy Mỗi Khi Đổi Config / Sản Phẩm Trực Tiếp Từ Admin (1-Click Auto Deploy)

Bạn muốn đổi số điện thoại, đổi link Zalo, đổi giá hay thêm đồng hồ mới từ giao diện `admin.html` (thậm chí dùng trên điện thoại) mà **không cần mở máy tính gõ lệnh Git**?

Trang `admin.html` đã tích hợp sẵn tính năng **1-Click Auto Deploy lên Cloudflare**:
1. **Lấy GitHub Token (chỉ làm 1 lần mất 30 giây):**
   - Vào [GitHub Personal Access Tokens](https://github.com/settings/tokens/new?scopes=repo&description=PhongWatch_Admin_Deploy).
   - Đặt thời hạn (Expiration) ví dụ `90 days` hoặc `No expiration`.
   - Tích chọn quyền `repo` (Full control of private repositories).
   - Kéo xuống dưới cùng bấm nút xanh **Generate token** &rarr; Copy đoạn mã token (bắt đầu bằng `ghp_...`).
2. **Cấu hình trên trang Admin:**
   - Mở `admin.html` &rarr; vào Tab **"Xuất File & Triển Khai Server"**.
   - Tại ô **GitHub Personal Access Token**, dán mã token vừa copy vào &rarr; bấm **Lưu**. *(Mã token được lưu an toàn tuyệt đối trong trình duyệt của bạn)*.
3. **Kích hoạt Deploy:**
   - Mỗi lần bạn đổi SĐT/Zalo/Màu sắc: Bấm **[🚀 ĐẨY CONFIG LÊN GITHUB & AUTO DEPLOY]**.
   - Nếu bạn thêm/sửa sản phẩm: Bấm **[📦 ĐẨY CẢ CONFIG & SẢN PHẨM LÊN GITHUB]**.
   - Khung Terminal bên dưới sẽ báo ngay:
     ```text
     [08:50:10] Đang tạo commit file config.js lên GitHub...
     [08:50:12] ✅ Đã commit config.js thành công (Commit: a1b2c3d)!
     [08:50:13] 🚀 Cloudflare Pages đang tự động nhận diện và Build website toàn cầu...
     ```
   - Sau 15 - 30 giây, vào lại link `https://jinwatch-web.pages.dev` là toàn bộ cấu hình mới đã hiển thị cho mọi khách hàng!

---

#### Cách 2: Triển Khai Trên Vercel / Netlify

#### Cách 3: Triển Khai Trên DigitalOcean
- **Phương án App Platform (Dễ nhất):**
  1. Đẩy code lên GitHub repository.
  2. Vào DigitalOcean &gt; chọn **App Platform** &gt; chọn kho lưu trữ GitHub của bạn.
  3. Chọn loại ứng dụng là **Static Site** (Miễn phí tới 3 site tĩnh trên DigitalOcean).
  4. Bấm Deploy: DigitalOcean sẽ tự động build và cấp domain HTTPS.
- **Phương án Droplet VPS (Nginx / Linux):**
  1. Tạo một Droplet Ubuntu (gói 4-6$/tháng).
  2. Copy toàn bộ thư mục `website` vào `/var/www/phongwatch`.
  3. Cấu hình Nginx trỏ vào thư mục đó:
     ```nginx
     server {
         listen 80;
         server_name phongwatch.vn www.phongwatch.vn;
         root /var/www/phongwatch;
         index index.html;

         location / {
             try_files $uri $uri/ /index.html;
         }

         # Caching tĩnh cho hình ảnh giúp tải nhanh tối đa
         location ~* \.(jpg|jpeg|png|gif|ico|webp|svg)$ {
             expires 30d;
             add_header Cache-Control "public, no-transform";
         }

         gzip on;
         gzip_types text/plain text/css application/javascript application/json image/svg+xml;
     }
     ```

#### Cách 4: Hosting Truyền Thống (cPanel / DirectAdmin)
1. Nén thư mục `website` thành file `.zip`.
2. Mở cPanel &gt; File Manager &gt; vào `public_html` &gt; Upload và Giải nén (Extract) tại đây.
3. Truy cập tên miền: Website chạy ngay lập tức mà không cần bất kỳ cấu hình nào khác!

---

### 🖼️ C. Cách Xử Lý Khi Thêm Ảnh Sản Phẩm Mới Trong Tương Lai:
Khi chủ cửa hàng thêm đồng hồ mới qua trang quản trị `admin.html`:
- **Cách 1 (Đơn giản nhất):** Bấm nút **"Chọn File Từ Máy"**, hệ thống sẽ tự động chuyển ảnh thành mã Base64 an toàn lưu trực tiếp vào sản phẩm mà không cần thuê server upload riêng.
- **Cách 2:** Copy file ảnh mới bỏ vào thư mục `assets/products/ten-anh.jpg`, rồi nhập đường dẫn `assets/products/ten-anh.jpg` vào ô ảnh.
- **Cách 3 (Khi có hàng chục nghìn sản phẩm):** Có thể upload ảnh lên các dịch vụ CDN lưu trữ hình ảnh chuyên dụng (như Cloudflare R2, Cloudinary, Imgur, AWS S3) rồi dán đường link vào.

---

## ✨ 5. Các Tính Năng Nổi Bật Sẵn Có Trên Website

1. **📱 Chuẩn Giao Diện Mobile-First Tối Ưu Cho Điện Thoại:**
   - **Thanh điều hướng dưới đáy (Sticky Bottom Bar):** 5 nút thao tác nhanh (Trang chủ, Lọc giá, Tìm kiếm, Giỏ hàng có badge số lượng, Hotline) ghim sát đáy màn hình như một ứng dụng Native App thực thụ.
   - **Thanh chốt đơn tức thì (Sticky Buy Bar trên `product.html`):** Khi xem chi tiết sản phẩm trên điện thoại, nút **"⚡ MUA NGAY"** màu đỏ nổi bật luôn nằm trong tầm tay người dùng giúp tăng tối đa tỷ lệ chốt đơn (conversion rate).
   - **Menu vuốt trượt (Off-Canvas Drawer):** Kèm lớp phủ mờ (backdrop blur) đóng mở êm ái, hỗ trợ xem nhanh danh mục đa cấp.
   - **Lưới sản phẩm 2 cột chuẩn smartphone:** Hình ảnh vuông tỉ lệ 1:1, thẻ giá rõ nét, chữ không bị vỡ hoặc che khuất.
   - **Thanh chip lọc giá cuộn ngang (Swipeable Chips):** Lọc theo tầm giá siêu mượt mà không chiếm diện tích dọc màn hình.
   - **Khắc phục lỗi iOS Safari Auto-Zoom:** Mọi trường nhập liệu đều được tinh chỉnh font chuẩn để trình duyệt không bị giật zoom khi chạm.
2. **💎 Giao Diện Chuẩn Luxury Watch:** Phong cách thẩm mỹ sang trọng, hiệu ứng chuyển cảnh mượt mà, hỗ trợ 100% tiếng Việt không lỗi font chữ.
3. **🔍 Trang Chi Tiết Sản Phẩm Riêng Biệt (`product.html`):** Xem bộ sưu tập ảnh thumbnail góc cạnh, thông số cỗ máy, mặt kính Sapphire, cam kết bảo hành 5 năm toàn diện, chính sách đổi trả 7 ngày.
4. **💰 Bộ Lọc Đa Năng:** Lọc giá theo từng phân khúc (Dưới 3 triệu, 3-5 triệu, 5-10 triệu, 10-20 triệu, Trên 20 triệu), lọc theo thương hiệu, lọc theo giới tính.
5. **⚡ Tìm Kiếm Thông Minh (Live Search):** Gợi ý kết quả ngay khi người dùng gõ phím kèm ảnh thumbnail và giá tiền.
6. **🛒 Giỏ Hàng & Đặt Hàng Trực Tuyến:** Giỏ hàng lưu trữ tự động trên máy khách, form đặt hàng sinh mã đơn hàng chuẩn `PW-XXXXXX` chuyên nghiệp.
7. **🛠️ Bảng Điều Khiển Quản Trị `admin.html`:** Cho phép chủ cửa hàng toàn quyền thêm/sửa/xóa sản phẩm, đổi màu sắc và thông tin mà không cần phụ thuộc vào lập trình viên.

---
*Biên soạn bởi Linh Vo - Sẵn sàng bàn giao cho khách hàng!*
