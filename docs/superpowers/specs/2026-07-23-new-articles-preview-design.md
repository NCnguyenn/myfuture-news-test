# Thiết kế website preview chỉ hiển thị bài viết mới

**Ngày:** 2026-07-23  
**Trạng thái:** Chờ người dùng duyệt spec trước khi triển khai  
**Phạm vi:** Frontend preview, không thay đổi database/API

## 1. Mục tiêu

Website MyFuture News chỉ hiển thị 30 bài viết mới đã được nghiên cứu trong
`md/content-research/manifest-codex-2026-07-23.json`. Toàn bộ bài demo cũ vẫn
được giữ trong database và seed nhưng không xuất hiện trên các trang bản tin
trong chế độ preview.

Preview phải cho phép người dùng duyệt trực quan trang tổng quan, từng chuyên
mục và toàn bộ nội dung chi tiết trước khi quyết định thay đổi schema hoặc nhập
dữ liệu vào database.

## 2. Phương án được chọn

Frontend dùng một content repository chạy phía server để đọc manifest Codex và
chuyển dữ liệu nghiên cứu sang các kiểu dữ liệu mà component tin tức đang sử
dụng. Các trang `/ban-tin`, `/ban-tin/chuyen-muc/[slug]` và
`/ban-tin/[articleSlug]` lấy dữ liệu từ repository này thay vì gọi News API.

Đây là adapter preview tạm thời. Database, Prisma schema, seed và API không bị
thay đổi hoặc xóa. Khi dữ liệu được duyệt và nhập database, các trang có thể
chuyển lại sang API mà không phải thay đổi component trình bày.

## 3. Nguồn nội dung và quy tắc hiển thị

- Chỉ đọc đúng sáu category được duyệt trong manifest Codex.
- Chỉ hiển thị 30 bài có đủ title, slug, excerpt, bodyMarkdown, category,
  datePublished, author đã xác minh, ít nhất một nguồn và evidence.
- Không trộn hoặc fallback sang bài cũ từ API.
- Nếu manifest không tồn tại hoặc không hợp lệ, trang trả lỗi rõ ràng; không tự
  hiển thị dữ liệu cũ.
- Trang tổng quan chọn năm bài mới nhất làm khu vực nổi bật và hiển thị danh
  sách 10 bài mới nhất bên dưới.
- Trang chuyên mục hiển thị năm bài tương ứng; phân trang được giữ ở interface
  nhưng không xuất hiện vì mỗi chuyên mục chỉ có năm bài.
- Trang chi tiết hiển thị tiêu đề, excerpt, category, ngày đăng, tác giả, thời
  gian đọc, nguồn gốc, ảnh cover, nội dung đầy đủ, evidence và bài liên quan.
- Không hiển thị lượt xem giả cho dữ liệu preview.

## 4. Ảnh dùng trong bản demo

Theo lựa chọn của người dùng, ảnh được lấy từ chính bài báo nguồn:

- Mỗi bài dùng ảnh đại diện đầu tiên phù hợp trên trang nguồn làm cover.
- Ảnh được tải vào `apps/web/public/images/news/researched/`; không hotlink để
  tránh trang nguồn chặn tải hoặc thay đổi URL.
- Tạo một manifest ảnh riêng phía frontend chứa article slug, local path,
  original image URL, source page URL và credit quan sát được.
- Nếu một trang nguồn không có ảnh tải được, bài dùng placeholder hiện có và
  được ghi rõ trong manifest ảnh; không lấy ảnh ngẫu nhiên từ nguồn khác.
- Ảnh chỉ phục vụ bản demo nội bộ. Metadata nguồn được giữ để việc thay thế
  bằng ảnh được cấp phép hoặc ảnh tạo mới ở giai đoạn production diễn ra có
  kiểm soát.
- Alt text lấy từ image plan đã biên tập, không lấy filename hoặc caption thô.

## 5. Chuyển Markdown an toàn

`bodyMarkdown` được chuyển sang HTML ở phía server bằng một hàm nhỏ, có phạm vi
đúng với nội dung hiện tại:

- Hỗ trợ heading cấp 2–3, đoạn văn, danh sách và liên kết.
- Escape HTML trước khi dựng markup.
- Chỉ cho liên kết `http` hoặc `https`.
- Không cho phép raw HTML, script, iframe hoặc event handler từ manifest.

Component `ArticleContent` tiếp tục nhận `contentHtml`; vì vậy layout hiện tại
không phụ thuộc vào định dạng lưu nội dung trong manifest.

## 6. Kiến trúc và ranh giới file

- `apps/web/lib/researched-news.ts`: đọc, kiểm tra và truy vấn manifest; cung cấp
  category list, article list, article detail, featured articles và pagination.
- `apps/web/lib/markdown-to-html.ts`: chuyển Markdown giới hạn sang HTML an toàn.
- `apps/web/data/researched-images.ts`: ánh xạ slug sang ảnh local và metadata
  nguồn.
- `apps/web/types/news.ts`: bổ sung author/source/evidence và cho phép dữ liệu
  preview không có view count.
- Các page trong `apps/web/app/ban-tin/`: chuyển từ API client sang repository
  preview.
- Các component news: hiển thị tác giả, nguồn và bỏ lượt xem khi trường này
  không có.
- `apps/web/public/images/news/researched/`: ảnh cover tải từ trang bài gốc.

`apps/web/lib/api-client.ts`, API backend, Prisma và seed vẫn được giữ nguyên để
không làm mất đường quay lại luồng database.

## 7. Giao diện

Giữ hệ thống màu, typography và responsive layout hiện tại để giới hạn phạm vi.
Nâng chất lượng trực quan bằng dữ liệu thật:

- Khu vực nổi bật dùng một cover lớn và bốn bài phụ.
- Card hiển thị ảnh, category, tiêu đề, excerpt, ngày đăng và tác giả.
- Trang chi tiết có dòng byline, nguồn gốc rõ ràng, cover lớn và body đầy đủ.
- Evidence được trình bày cuối bài dưới mục “Nguồn kiểm chứng”.
- Trên màn hình nhỏ, card và metadata tiếp tục co về bố cục một cột hiện có.

Không thiết kế lại header/footer hoặc các phần ngoài module bản tin.

## 8. Xử lý lỗi

- Slug category hoặc article không thuộc manifest trả `notFound()`.
- Ảnh local lỗi tiếp tục dùng `placeholder-default.svg`.
- Article không vượt completeness gate bị loại khỏi repository ngay khi đọc,
  đồng thời test sẽ thất bại nếu tổng số không còn đúng 30.
- Không gọi API làm fallback, nhờ đó bài cũ không thể xuất hiện ngoài ý muốn.

## 9. Kiểm thử và tiêu chí chấp nhận

Sử dụng Node test runner qua `tsx --test`, không thêm test framework mới.

Các test bắt buộc:

1. Repository đọc đúng 6 category và 30 bài.
2. Mỗi category có đúng 5 bài.
3. Không có slug hoặc source URL trùng.
4. Không có URL nguồn nào thuộc manifest Antigravity cũ.
5. Mọi bài đều vượt completeness gate.
6. Query category không thể trả bài thuộc category khác.
7. Query slug cũ/demo trả `undefined`, không gọi API.
8. Markdown renderer escape raw HTML và chặn URL nguy hiểm.
9. Mọi bài có image mapping hoặc placeholder được ghi rõ.
10. Typecheck và production build của web thành công.

QA thủ công sau build:

- Mở trang tổng quan và sáu tab category.
- Mở ít nhất một bài thuộc mỗi category.
- Kiểm tra cover, alt text, tác giả, nguồn, body và evidence.
- Kiểm tra desktop và mobile.
- Xác nhận Network không gọi `/api/articles` hoặc `/api/categories` trên các
  trang bản tin preview.

## 10. Ngoài phạm vi

- Không xóa dữ liệu cũ.
- Không thay đổi database, migration, schema, seed hoặc API.
- Không tạo ảnh AI.
- Không triển khai production.
- Không stage hoặc commit khi chưa có yêu cầu riêng của người dùng.
