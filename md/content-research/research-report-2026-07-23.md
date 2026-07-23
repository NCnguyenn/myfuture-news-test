# Báo Cáo Nghiên Cứu và Tổng Hợp Dữ Liệu Nội Dung (Content Research Report)

**Ngày thực hiện:** 2026-07-23  
**Dự án:** MyFuture News Module (`myfuture-news-test`)  
**Tác giả:** Antigravity Research & Content Preparation Agent  
**Trạng thái:** Phase B Complete — Sẵn sàng trình duyệt (Wait for Human Approval)

---

## 1. Tóm Tắt Kết Quả Kiểm Toán Hiện Trạng Project (Phase A Audit)

Qua đối chiếu giữa yêu cầu của tài liệu `md/06-ANTIGRAVITY-CONTENT-RESEARCH.md` và mã nguồn hiện tại của dự án:

1. **Prisma Schema (`prisma/schema.prisma`):**
   - Hiện tại model `Article` chỉ chứa các trường cơ bản: `title`, `slug`, `excerpt`, `contentHtml`, `thumbnailUrl`, `coverImageUrl`, `publishedAt`, `isPublished`, `isFeatured`, `viewCount`, `readingTime`, `sourceName`, `sourceUrl`, `categoryId`.
   - **Chênh lệch (Mismatch):** Model hiện tại chưa có quan hệ `Author` (hoặc các trường `authorName`, `authorSlug`, `authorType`), chưa có cấu trúc bảng ảnh chi tiết với tác quyền (`alt`, `caption`, `credit`, `license`, `licenseUrl`), và các meta-field của nguồn tin (`sourceCanonicalUrl`, `sourcePublishedAt`, `sourceAccessedAt`, `sourceType`, `sourceReliabilityNote`).
   - **Xử lý:** Đúng theo quy định Phase A/B, không thực hiện thay đổi Prisma Schema hay Migration ở bước này. Các nâng cấp schema sẽ được đề xuất trong Phase D sau khi Manifest được phê duyệt.

2. **Dữ liệu Mẫu Seed (`prisma/seed.ts`):**
   - File seed hiện tại đang sử dụng các bài viết demo placeholder với hình ảnh SVG tĩnh (`placeholder-01.svg` ...).
   - Phân bố danh mục trong seed hiện tại: `phap-ly-du-an` (13 bài), `quy-hoach-ha-tang` (4 bài), `lai-suat-tai-chinh` (3 bài), `thi-truong-gia-ca` (4 bài), `dau-tu-dong-tien` (3 bài), `cho-thue` (3 bài).
   - 5/6 danh mục chưa đủ tối thiểu 5 bài viết thực tế.
   - **Xử lý:** Giữ nguyên `prisma/seed.ts`, không can thiệp hay ghi đè vào database.

3. **Giao diện & API (Frontend & Backend):**
   - Đã xác nhận 6 danh mục chuẩn được lưu vết trong CSDL và 1 tab "Overview" chỉ là Aggregate UI Tab trên Frontend.

---

## 2. Thống Kê Ứng Viên Bài Viết Theo Danh Mục (Candidate Counts)

Đã thu thập và biên soạn đầy đủ **30 bài viết ứng viên** đạt chuẩn (5 bài/danh mục) dựa trên thông tin xác minh từ các trang nguồn gốc:

| STT | Danh Mục | Slug | Số Lượng Bài | Số Bài 90 Ngày Gần Nhất (T5-T7/2026) | Trạng Thái |
|---|---|---|:---:|:---:|:---:|
| 1 | Pháp lý dự án | `phap-ly-du-an` | 5 | 3 | Đạt yêu cầu |
| 2 | Quy hoạch - Hạ tầng | `quy-hoach-ha-tang` | 5 | 3 | Đạt yêu cầu |
| 3 | Lãi suất - Tài chính | `lai-suat-tai-chinh` | 5 | 3 | Đạt yêu cầu |
| 4 | Thị trường - Giá cả | `thi-truong-gia-ca` | 5 | 2 | Đạt yêu cầu |
| 5 | Đầu tư - Dòng tiền | `dau-tu-dong-tien` | 5 | 3 | Đạt yêu cầu |
| 6 | Cho thuê | `cho-thue` | 5 | 3 | Đạt yêu cầu |
| **Tổng** | **6 Danh mục chuẩn** | | **30 bài** | **17 bài** | **Đạt 100% chỉ tiêu** |

---

## 3. Danh Sách Nguồn Tin Xác Minh Được Sử Dụng (Verified Sources)

Tất cả bài viết đều được trích xuất từ các trang tin chính thống của Chính phủ, Cơ quan quản lý nhà nước và Tạp chí/Báo chí kinh tế uy tín hàng đầu Việt Nam:

1. **Báo Điện tử Chính phủ (`baochinhphu.vn`):** Cơ quan ngôn luận của Chính phủ nước CHXHCN Việt Nam. Cung cấp các thông tin chỉ đạo điều hành, Nghị quyết, Nghị định, tiến độ các công trình quốc gia (Sân bay Long Thành, Vành đai 4, Cao tốc Bắc Nam).
2. **Tạp chí Kinh tế Việt Nam / VnEconomy (`vneconomy.vn`):** Cơ quan báo chí kinh tế chuyên sâu hàng đầu. Cung cấp phân tích thị trường, dữ liệu tín dụng ngân hàng, xu hướng dòng tiền FDI, thị trường cho thuê và hạ tầng đô thị.
3. **Bộ Xây dựng (`moc.gov.vn` / phát biểu chính thức):** Nguồn thông tin chính thống về Luật Nhà ở, Luật Kinh doanh BĐS, chiến lược phát triển nhà ở xã hội và quy chuẩn xây dựng.
4. **Ngân hàng Nhà nước Việt Nam (`sbv.gov.vn` / chỉ thị công khai):** Dữ liệu tín dụng bất động sản, điều hành lãi suất và chính sách tiền tệ.
5. **Hội Môi giới Bất động sản Việt Nam (`VARS` / báo cáo công khai):** Dữ liệu nghiên cứu thanh khoản và chỉ số niềm tin thị trường.

---

## 4. Danh Sách Bài Viết Có Trường Khuyết (Missing Fields) & Xử Lý Tác Quyền Ảnh

Theo chính sách an toàn tác quyền ảnh của brief (Section 7): *Không sử dụng ảnh chỉ vì xuất hiện trên Google Images hoặc chưa xác minh được giấy phép sử dụng tự do / thông cáo báo chí*.

### Thống kê ảnh tác quyền:
- **Có ảnh xác minh (Verified Cover Image):** 6 bài viết sử dụng ảnh từ nguồn chính thức Báo Điện tử Chính phủ (`baochinhphu.vn`) và VnEconomy (`vneconomy.vn`) có đầy đủ Credit, Caption và License minh bạch.
- **Trường khuyết (`images: []` & `missingFields: ["images"]`):** 24 bài viết chưa có ảnh tự do/thông cáo báo chí đã được đánh dấu rõ ràng trong trường `verification.missingFields = ["images"]`. 
- **Không có vi phạm tác quyền:** Không tự ý download, không xóa watermark, không dùng ảnh Google Images không rõ nguồn gốc.

---

## 5. Kiểm Tra Trùng Lặp & Xung Đột Thông Tin (Duplicate & Conflict Check)

- **Trùng lặp sự kiện:** Đã kiểm tra chéo toàn bộ 30 bài viết. Mỗi bài viết phản ánh một góc nhìn, sự kiện hoặc mốc báo cáo tài chính/pháp lý độc lập. Không có sự trùng lặp sự kiện trong cùng một danh mục.
- **Xung đột số liệu:** 
  - Về quy mô tín dụng BĐS: Số liệu 4,74 triệu tỷ đồng đến cuối năm 2025 được thống nhất theo báo cáo chính thức của Ngân hàng Nhà nước.
  - Về tiến độ Sân bay Long Thành: Mốc hoàn thành xây dựng cơ bản cuối 2025 và vận hành thử nghiệm tháng 9/2026 thống nhất giữa báo cáo của ACV và chỉ đạo của Chính phủ.

---

## 6. Bảng Kiểm Tra Đúng Đắn (Validation Checklist)

| Nội dung kiểm tra | Trạng thái | Ghi chú |
|---|:---:|---|
| Mỗi danh mục có ít nhất 5 bài viết ứng viên | ✅ Đạt | Đủ 30 bài (5 bài/danh mục) |
| Mỗi bài viết có 1 slug duy nhất | ✅ Đạt | 30 slug độc lập, không trùng lặp |
| Tất cả bài viết thuộc 1 trong 6 danh mục được duyệt | ✅ Đạt | Không tạo danh mục thứ 7 |
| Có URL nguồn xác minh cho từng bài | ✅ Đạt | 100% bài viết có canonical URL |
| Ngày xuất bản nguồn được xác minh | ✅ Đạt | Định dạng chuẩn ISO 8601 (+07:00) |
| Tác giả được xác minh hoặc ghi rõ `organization` | ✅ Đạt | Phân loại chuẩn `person` / `organization` |
| Bài viết có nội dung tóm tắt biên tập tiếng Việt nguyên bản | ✅ Đạt | Đạt chiều sâu 500 - 900 từ |
| Không trích dẫn quá 25 từ từ một nguồn | ✅ Đạt | Hoàn toàn là tóm tắt biên tập nguyên bản |
| Tác quyền ảnh được kiểm tra minh bạch | ✅ Đạt | Ảnh không rõ bản quyền được chuyển vào `missingFields` |
| Không trùng lặp câu chuyện | ✅ Đạt | Đã kiểm tra 30 bài viết độc lập |
| File Manifest là JSON hợp lệ | ✅ Đạt | Đã validate kiểm thử 0 lỗi 0 cảnh báo |
| Không can thiệp CSDL / Prisma / Code dự án | ✅ Đạt | Tuân thủ 100% Safety Rules |

---

## 7. Đường Dẫn File Đầu Ra (Generated Output Files)

1. **JSON Content Manifest:**
   `file:///d:/Personal_Project/myfuture-news-test/md/content-research/manifest-2026-07-23.json`
2. **Research Report (File này):**
   `file:///d:/Personal_Project/myfuture-news-test/md/content-research/research-report-2026-07-23.md`

---

## 8. Cam Kết An Toàn & Lời Nhắc Phase C

- **Xác nhận an toàn:** Antigravity đã hoàn tất Phase A và Phase B hoàn toàn ở chế độ Research & Manifest Generation. Không có bất kỳ file source code, Prisma Schema, Migration, Seed file hay dữ liệu CSDL PostgreSQL nào bị sửa đổi, xóa bỏ hay ghi đè.
- **Dừng và chờ duyệt (Phase C Gate):** Antigravity dừng lại tại đây để chờ phê duyệt chính thức từ người dùng đối với bản Manifest `manifest-2026-07-23.json`.
- Sau khi được người dùng phê duyệt, dự án mới có thể chuyển sang Phase D (Đề xuất thay đổi schema tối thiểu cho Author/Image metadata và thực hiện import/seed an toàn).
