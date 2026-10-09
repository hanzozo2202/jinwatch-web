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
2. **Đổi Logo & Thông Tin Cửa Hàng:**
   - Nhập đường dẫn link ảnh Logo, hoặc bấm nút **"Chọn Ảnh"** từ máy tính (hệ thống sẽ tự nhận diện).
   - Đổi Slogan, Tên shop, Hotline, Số Zalo, Email.
   - Đổi Địa chỉ cửa hàng và link nhúng Google Maps iframe.
   - Cài đặt Tiêu đề SEO và Mô tả trang hiển thị trên Google.
3. Bấm **"💾 Lưu Cấu Hình Giao Diện"** để lưu lại.

---

### 📦 Bước 3: Thêm / Sửa / Xóa Sản Phẩm (Tab "Quản Lý Sản Phẩm")
- **Thêm sản phẩm mới:**
  1. Bấm nút **"+ Thêm Sản Phẩm Mới"**.
  2. Nhập Tên đồng hồ, chọn Thương hiệu (Carnival, Olym Pianus, Bentley, Seiko, Tissot...), chọn Danh mục hiển thị.
  3. Nhập Giá bán (ví dụ gõ `6800000` hệ thống tự định dạng thành `6,800,000₫`).
  4. Nhập Giá gốc / Giá niêm yết (hệ thống sẽ tự động tính ra tỷ lệ % giảm giá, ví dụ `-24%`).
  5. Chọn ảnh từ máy tính hoặc dán link ảnh web.
  6. Chọn tình trạng (Còn hàng / Tạm hết hàng), giới tính (Nam / Nữ / Cặp đôi).
  7. Bấm **"Lưu Sản Phẩm"**.
- **Sửa sản phẩm:** Bấm biểu tượng cây bút ✏️ tại dòng sản phẩm cần sửa để thay đổi thông tin hoặc cập nhật giá.
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
Mỗi sản phẩm là một đối tượng JSON chuẩn:
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
  "image": "https://product.hstatic.net/.../image.jpg",
  "in_stock": true,
  "gender": "Nam"
}
```

---

## 🚀 4. Hướng Dẫn Phát Hành (Deploy) Lên Server

### Cách 1: Triển Khai Trên Hosting cPanel / DirectAdmin (Khuyên Dùng Cho Shop)
1. Nén toàn bộ thư mục `website` thành file `.zip`.
2. Đăng nhập vào trang quản trị cPanel của nhà cung cấp hosting (PA Việt Nam, Mắt Bão, INET, Hostinger...).
3. Mở mục **File Manager (Trình Quản Lý Tệp)** &gt; vào thư mục **`public_html`**.
4. Upload file `.zip` lên và chọn **Extract (Giải nén)** trực tiếp tại đây.
5. Truy cập tên miền của bạn: Website chạy ngay lập tức với tốc độ tối đa!

### Cách 2: Triển Khai Miễn Phí Trên Vercel / Netlify (Có HTTPS SSL Tự Động)
1. Truy cập [Netlify Drop](https://app.netlify.com/drop) hoặc [Vercel](https://vercel.com).
2. Kéo thả nguyên thư mục `website` vào giao diện trình duyệt.
3. Trong vòng 10 giây, bạn sẽ nhận được một địa chỉ web hoạt động với chứng chỉ SSL HTTPS hoàn toàn miễn phí.
4. Trỏ tên miền riêng (ví dụ `donghophongwatch.vn`) vào DNS của Netlify/Vercel theo hướng dẫn trên màn hình.

### Cách 3: Chạy Trên Máy Chủ VPS Riêng (Nginx / Linux)
Chỉ cần cấu hình một block Nginx tĩnh đơn giản:
```nginx
server {
    listen 80;
    server_name phongwatch.vn www.phongwatch.vn;
    root /var/www/phongwatch;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Bật nén Gzip giúp website tải siêu nhanh
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
```

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
