# Báo cáo nghiên cứu và xác minh nội dung Codex — 2026-07-23

**Dự án:** MyFuture News  
**Phạm vi:** Phase A và Phase B  
**Trạng thái:** Đạt validator tự động; chờ duyệt Phase C

## 1. Kết quả audit

- Database/schema hiện chỉ có đúng 6 category; `Overview` là tab tổng hợp phía UI.
- `Article` hiện chưa có model/field có cấu trúc cho author, evidence và image-license; các trường nghiên cứu được giữ trong manifest, không đưa vào schema ở phase này.
- Seed hiện là dữ liệu demo gồm 29 bài published và 1 draft; không được thay đổi hay nhập dữ liệu trong phase này.
- Artifact Antigravity được giữ nguyên và chỉ được dùng làm blacklist/cảnh báo chất lượng, không được tin cậy hay import.

## 2. Số lượng theo danh mục

| Danh mục | Slug | Bài chấp nhận | Trong 90 ngày gần nhất |
|---|---|---:|---:|
| Pháp lý dự án | `phap-ly-du-an` | 5 | 3 |
| Quy hoạch - Hạ tầng | `quy-hoach-ha-tang` | 5 | 5 |
| Lãi suất - Tài chính | `lai-suat-tai-chinh` | 5 | 5 |
| Thị trường - Giá cả | `thi-truong-gia-ca` | 5 | 5 |
| Đầu tư - Dòng tiền | `dau-tu-dong-tien` | 5 | 5 |
| Cho thuê | `cho-thue` | 5 | 5 |

## 3. Thống kê nguồn và nội dung

- URL candidate đã kiểm tra: 36
- Nguồn được chấp nhận: 30
- Nguồn bị loại: 6
- Tổng bài được chấp nhận: 30
- Khoảng độ dài body thực tế: 583–696 từ
- Bài dưới 500 từ: 0
- Author cá nhân: 15
- Author tổ chức: 15
- Author unknown: 0
- Image plan licensed: 0
- Generated cover plan: 30
- Generated inline-image plan: 30

## 4. Trường thiếu hoặc chưa chắc chắn

- `hai-luat-nha-o-kinh-doanh-bat-dong-san-sua-doi-cap-bach-2026`: dateModified
- `nghi-dinh-147-2026-xu-ly-du-an-ton-dong-dat-dai`: dateModified
- `novaland-tphcm-buoc-tien-phap-ly-nghia-vu-tai-chinh-so-hong`: dateModified
- `tam-nhom-chinh-sach-sua-luat-kinh-doanh-bat-dong-san-2026`: dateModified
- `nghia-vu-phong-chong-rua-tien-kinh-doanh-bat-dong-san-2026`: dateModified
- `de-xuat-nam-tuyen-quoc-lo-tieu-chuan-cao-toc-quy-hoach-2050`: dateModified
- `san-bay-long-thanh-180-ngay-tang-toc-khai-thac-thang-12-2026`: dateModified
- `bo-xay-dung-siet-tien-do-giai-ngan-ha-tang-giao-thong-2026`: dateModified
- `nam-du-an-ha-tang-nguy-co-khong-hoan-thanh-dung-han-2026`: dateModified
- `hon-3800-km-cao-toc-khai-thac-38-du-an-dang-dau-tu-2026`: dateModified

## 5. Xung đột dữ kiện

- Không ghi nhận xung đột dữ kiện chưa được giải quyết.

## 6. Kết quả validator

- **Passed:** `true`
- Slug bài duy nhất: 30
- Canonical source URL duy nhất: 30
- Source validation HTTP 200: 30
- Cảnh báo: 1
- Lỗi: 0

### Cảnh báo

- source_unavailable: https://www.nso.gov.vn/du-lieu-va-so-lieu-thong-ke/2026/07/thong-cao-bao-chi-ve-tinh-hinh-kinh-te-xa-hoi-quy-ii-va-sau-thang-dau-nam-2026/ — Nguồn Cục Thống kê phù hợp ưu tiên nhưng trả 502 khi mở trực tiếp, nên bị loại và thay bằng nguồn chính thức tải được.



## 7. Git và ranh giới an toàn

- Tracked files thay đổi (unstaged): (không có)
- Staged files: (không có)
- Untracked files:
```text
?? md/06-ANTIGRAVITY-CONTENT-RESEARCH.md
?? md/content-research/build_clean_manifest.py
?? md/content-research/build_data.py
?? md/content-research/build_full_manifest.py
?? md/content-research/manifest-2026-07-23.json
?? md/content-research/manifest-codex-2026-07-23.json
?? md/content-research/research-report-2026-07-23.md
?? md/content-research/research-report-codex-2026-07-23.md
?? md/content-research/source-validation-codex-2026-07-23.json
```
- Không sửa Prisma schema, migration, seed, frontend, backend, package manifests, test, PostgreSQL hoặc Redis.
- Không tải hoặc tạo ảnh.
- Chỉ tạo ba artifact Codex trong `md/content-research/`.

## 8. Cổng duyệt Phase C

Dừng tại đây để người phụ trách kiểm tra manifest, nguồn, nội dung biên tập và image plan. Không tiến hành schema, migration, seed, import, database, frontend/backend, image generation, Git staging hoặc commit nếu chưa có phê duyệt rõ ràng.
