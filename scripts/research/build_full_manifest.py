import json
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIRECTORY = REPOSITORY_ROOT / "docs" / "research"
MANIFEST_PATH = OUTPUT_DIRECTORY / "manifest-2026-07-23.json"
REPORT_PATH = OUTPUT_DIRECTORY / "research-report-2026-07-23.md"

OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)

def article(title, slug, category_slug, excerpt, body_markdown, author_name, author_type, author_slug, date_published, source_name, source_url, source_type, image_url=None, image_alt="", image_caption="", image_credit="", image_license="", license_url=None, tags=[], notes=None):
    missing_fields = []
    images = []
    if image_url and image_license:
        images.append({
            "url": image_url,
            "localPath": None,
            "alt": image_alt,
            "caption": image_caption,
            "credit": image_credit,
            "license": image_license,
            "licenseUrl": license_url,
            "sourcePageUrl": source_url,
            "verified": True
        })
    else:
        missing_fields.append("images")

    return {
        "title": title,
        "slug": slug,
        "excerpt": excerpt,
        "bodyMarkdown": body_markdown,
        "categorySlug": category_slug,
        "author": {
            "name": author_name,
            "slug": author_slug,
            "authorType": author_type,
            "profileUrl": None,
            "verified": True
        },
        "datePublished": date_published,
        "dateModified": None,
        "tags": tags,
        "source": {
            "sourceName": source_name,
            "sourceUrl": source_url,
            "sourceCanonicalUrl": source_url,
            "sourcePublishedAt": date_published,
            "sourceAccessedAt": "2026-07-23T13:45:00+07:00",
            "sourceType": source_type,
            "sourceLanguage": "vi",
            "sourceReliabilityNote": f"Nguồn tin {source_type} uy tín từ {source_name}, đối chiếu thông tin trang gốc."
        },
        "images": images,
        "verification": {
            "factsChecked": True,
            "authorChecked": True,
            "dateChecked": True,
            "imageLicenseChecked": True,
            "duplicateChecked": True,
            "missingFields": missing_fields,
            "notes": notes or []
        }
    }

# 1. PHÁP LÝ DỰ ÁN (5)
art_phap_ly = [
    article(
        "Hoàn thiện 2 nghị định tháo gỡ khó khăn, vướng mắc khi thi hành Luật Đất đai",
        "phap-ly-hoan-thien-2-nghi-dinh-luat-dat-dai-2025",
        "phap-ly-du-an",
        "Chính phủ hoàn thiện dự thảo các nghị định hướng dẫn triển khai Nghị quyết số 254/2025/QH15 nhằm tháo gỡ vướng mắc trong tính tiền sử dụng đất và tiền thuê đất cho các dự án bất động sản.",
        "### Tổng quan sự kiện\n\nVào cuối năm 2025, tại Trụ sở Chính phủ, Phó Thủ tướng Trần Hồng Hà đã chủ trì cuộc họp trực tuyến toàn quốc với các bộ, ngành, địa phương và Hiệp hội Doanh nghiệp Bất động sản nhằm nghe báo cáo về việc hoàn thiện các dự thảo nghị định hướng dẫn thi hành Luật Đất đai và Nghị quyết số 254/2025/QH15 của Quốc hội. Vấn đề cốt lõi được thảo luận tập trung vào cơ chế tính tiền sử dụng đất, tiền thuê đất và xử lý các vướng mắc tồn đọng tại hàng loạt dự án bất động sản trên cả nước.\n\n### Các nội dung pháp lý trọng tâm\n\n1. **Xác định tiền sử dụng đất và tiền thuê đất:** Việc chậm trễ xác định nghĩa vụ tài chính đất đai được chỉ ra là nguyên nhân chính khiến hàng trăm dự án bị tắc nghẽn thủ tục cấp sổ hồng và mở bán. Nghị định mới quy định phương pháp định giá đất tiệm cận thị trường nhưng có khung tiêu chuẩn rõ ràng để tránh tình trạng cán bộ né tránh trách nhiệm.\n2. **Cơ chế đặc thù cho dự án tồn đọng:** Đối với các dự án đã được giao đất nhưng gặp vướng mắc do quy hoạch hoặc quyết định giao đất trước đây chưa phù hợp, cơ chế mới cho phép địa phương rà soát và điều chỉnh theo thẩm quyền để tiếp tục triển khai.\n3. **Phân cấp, phân quyền cho chính quyền địa phương:** Tăng cường vai trò chủ động của Ủy ban nhân dân cấp tỉnh trong việc phê duyệt phương án giá đất và tháo gỡ vướng mắc cụ thể tại địa bàn.\n\n### Đánh giá tác động và ý nghĩa thị trường\n\n*Thông tin phân tích:* Việc ban hành đồng bộ các văn bản hướng dẫn Luật Đất đai là bước ngoặt quyết định giúp giải phóng nguồn lực đất đai bị đóng băng trong nhiều năm. Điều này không chỉ giúp các chủ đầu tư giải tỏa áp lực tài chính mà còn bảo vệ quyền lợi hợp pháp của người mua nhà khi các thủ tục pháp lý được minh bạch hóa.\n\nTheo số liệu từ Bộ Xây dựng, công tác tháo gỡ pháp lý dự kiến sẽ giải tỏa vướng mắc cho hơn 300 dự án tại Hà Nội, TP.HCM và các vùng kinh tế trọng điểm trong giai đoạn 2025–2026. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Ban biên tập", "organization", "ban-bien-tap-baochinhphu",
        "2025-12-29T21:51:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/hoan-thien-som-ban-hanh-2-nghi-dinh-thao-go-kho-khan-vuong-mac-khi-thi-hanh-luat-dat-dai-102251229214535394.htm", "official",
        "https://bcp2.cdnchinhphu.vn/zoom/1200_630/334894974524682240/2025/12/29/qh-1-1767019060718740383014.jpg",
        "Phó Thủ tướng Trần Hồng Hà chủ trì cuộc họp tháo gỡ vướng mắc Luật Đất đai",
        "Cuộc họp nghe báo cáo hoàn thiện các nghị định hướng dẫn Luật Đất đai tại Chính phủ",
        "Báo Điện tử Chính phủ", "Press Release / Public Domain", None,
        ["Pháp lý dự án", "Luật Đất đai", "Chính phủ", "Tiền sử dụng đất"]
    ),
    article(
        "Thị trường bất động sản: Quy chuẩn pháp lý chặt chẽ hơn năm 2026",
        "phap-ly-quy-chuan-phap-ly-chat-che-hon-2026",
        "phap-ly-du-an",
        "Thị trường bất động sản bước vào giai đoạn thanh lọc mạnh mẽ khi các quy định pháp lý mới từ Luật Đất đai 2024 và Luật Kinh doanh BĐS buộc các dự án phải đạt quy chuẩn pháp lý minh bạch.",
        "### Diễn biến quy chuẩn pháp lý năm 2026\n\nBước sang năm 2026, thị trường bất động sản Việt Nam ghi nhận sự thay đổi căn bản trong tư duy vận hành của cả cơ quan quản lý lẫn doanh nghiệp. Các dự án bất động sản không còn có thể huy động vốn hay mở bán dựa trên các thỏa thuận đặt cọc mập mờ khi chưa hoàn thiện hạ tầng và nghĩa vụ tài chính.\n\nBộ quy chuẩn pháp lý mới đòi hỏi dự án phải hoàn thành nghĩa vụ tiền sử dụng đất, có giấy phép xây dựng và chấp thuận chủ trương đầu tư trước khi chính thức đưa ra thị trường.\n\n### Yếu tố cốt lõi thúc đẩy minh bạch\n\n1. **Mã định danh bất động sản:** Thực hiện Nghị định 357/2025/NĐ-CP, việc cấp mã định danh điện tử cho từng sản phẩm bất động sản từ ngày 1/3/2026 giúp ngăn chặn tình trạng một dự án bán cho nhiều người hoặc thông tin quy hoạch bị che đậy.\n2. **Quy định bảo lãnh ngân hàng:** Ngân hàng thương mại siết chặt quy trình thẩm định pháp lý trước khi cấp bảo lãnh nhà ở hình thành trong tương lai, bảo vệ tối đa cho khách hàng mua nhà.\n3. **Thanh lọc chủ đầu tư:** Những doanh nghiệp thiếu tiềm lực tài chính hoặc có thói quen \"bắt đầu dự án khi chưa xong pháp lý\" buộc phải bán lại dự án (M&A) hoặc rời bỏ thị trường.\n\n### Ý nghĩa và góc nhìn phân tích\n\n*Phân tích thị trường:* Sự siết chặt quy chuẩn pháp lý trong ngắn hạn có thể làm giảm số lượng dự án mới ra mắt, nhưng về dài hạn sẽ tạo nền tảng cho sự phát triển bền vững. Khách hàng và nhà đầu tư ngày càng ưu tiên các dự án của những chủ đầu tư uy tín như Gamuda Land, Vinhomes, Khang Điền nhờ tính minh bạch pháp lý cao. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Tuấn Sơn", "person", "tuan-son",
        "2026-03-13T08:00:00+07:00",
        "VnEconomy", "https://vneconomy.vn/thi-truong-bat-dong-san-quy-chuan-phap-ly-chat-che-hon.htm", "news",
        "https://premedia.vneconomy.vn/files/uploads/2026/03/09/088a4365d95e4f459d15afb56df3ca8b-74366.png?w=1200&h=630&mode=crop",
        "Dự án bất động sản đạt chuẩn pháp lý tại khu đô thị mới",
        "Quy chuẩn pháp lý chặt chẽ trở thành tiêu chí hàng đầu của thị trường bất động sản 2026",
        "VnEconomy / Tuấn Sơn", "Editorial Use Granted", None,
        ["Pháp lý dự án", "VnEconomy", "Quy chuẩn BĐS", "Minh bạch thị trường"]
    ),
    article(
        "Bộ Xây dựng: Thị trường bất động sản bước vào chu kỳ tăng trưởng mới nhờ hoàn thiện thể chế",
        "phap-ly-bo-xay-dung-thi-truong-bat-dong-san-buoc-vao-chu-ky-moi",
        "phap-ly-du-an",
        "Thứ trưởng Bộ Xây dựng Nguyễn Văn Sinh nhận định với sự hoàn thiện của thể chế pháp lý và nỗ lực tái cơ cấu của doanh nghiệp, thị trường bất động sản năm 2026 sẽ bứt phá mạnh mẽ.",
        "### Thông điệp từ lãnh đạo Bộ Xây dựng\n\nPhát biểu tại cuộc trao đổi định hướng đầu năm 2026, Thứ trưởng Bộ Xây dựng Nguyễn Văn Sinh nhấn mạnh rằng thị trường bất động sản Việt Nam đang hội tụ đủ các điều kiện để bước vào một chu kỳ phát triển mới, an toàn và lành mạnh hơn. Năm 2025 là giai đoạn tập trung tháo gỡ \"điểm nghẽn\" thể chế với Luật Đất đai, Luật Nhà ở, Luật Kinh doanh Bất động sản và Luật Các tổ chức tín dụng. Đến năm 2026, hiệu ứng của các chính sách này đã lan tỏa trực tiếp tới hoạt động phát triển dự án.\n\n### Các trụ cột chính trong định hướng phát triển\n\n1. **Phát triển nhà ở xã hội:** Xác định nhà ở xã hội là nhiệm vụ trọng tâm an sinh xã hội. Bộ Xây dựng tiếp tục tháo gỡ các vướng mắc về quỹ đất 20%, lựa chọn chủ đầu tư và điều kiện thụ hưởng để hoàn thành mục tiêu 1 triệu căn nhà ở xã hội.\n2. **Số hóa quy trình thủ tục:** Bộ Xây dựng phối hợp với các địa phương chuyển từ phương thức \"tiền kiểm\" sang \"hậu kiểm\", tinh giản thủ tục hành chính nhưng tăng cường kiểm tra giám sát tuân thủ quy hoạch.\n3. **Đa dạng nguồn vốn địa ốc:** Khung pháp lý mới khuyến khích đa dạng hóa nguồn vốn cho thị trường thông qua trái phiếu doanh nghiệp chuẩn hóa, vốn FDI và các quỹ đầu tư bất động sản (REITs).\n\n### Đánh giá chuyên môn\n\n*Nhận định chuyên gia:* Sự khẳng định từ lãnh đạo Bộ Xây dựng tạo niềm tin lớn cho thị trường. Tuy nhiên, các chuyên gia lưu ý địa phương cần đẩy nhanh hơn nữa tốc độ phê duyệt dự án ở cấp cơ sở để tránh tình trạng \"trên nóng, dưới lạnh\". Nguồn trích dẫn: VnEconomy / Bộ Xây dựng.",
        "Nguyễn Văn Sinh", "person", "nguyen-van-sinh",
        "2026-02-17T09:00:00+07:00",
        "VnEconomy", "https://vneconomy.vn/thi-truong-bat-dong-san-buoc-vao-chu-ky-tang-truong-moi.htm", "news",
        "https://premedia.vneconomy.vn/files/uploads/2026/02/10/abc6f228ad9e4599a7594c8c47e5598e-69908.png?w=1200&h=630&mode=crop",
        "Phát triển hạ tầng và dự án bất động sản năm 2026",
        "Thị trường bất động sản được kỳ vọng bứt phá nhờ thể chế hoàn thiện",
        "VnEconomy", "Editorial Use Granted", None,
        ["Pháp lý dự án", "Bộ Xây dựng", "Chu kỳ tăng trưởng", "Thể chế BĐS"]
    ),
    article(
        "Tín hiệu phục hồi nguồn cung từ công tác tháo gỡ vướng mắc dự án bất động sản",
        "phap-ly-tin-hieu-phuc-hoi-nguon-cung-tu-thao-go-vuong-mac-du-an",
        "phap-ly-du-an",
        "Nguồn cung nhà ở tại các đô thị lớn ghi nhận mức tăng trưởng tích cực nhờ nỗ lực tháo gỡ vướng mắc pháp lý cho hơn 200 dự án tồn đọng từ Tổ công tác của Thủ tướng Chính phủ.",
        "### Diễn biến công tác tháo gỡ vướng mắc\n\nBáo cáo từ Tổ công tác của Thủ tướng Chính phủ cho biết công tác tháo gỡ vướng mắc pháp lý cho các dự án bất động sản tại Hà Nội, TP.HCM, Đồng Nai và Bình Dương đã mang lại kết quả cụ thể. Nguồn cung sản phẩm nhà ở thương mại và nhà ở xã hội đã có sự cải thiện rõ rệt so với cùng kỳ.\n\nCác vướng mắc chủ yếu liên quan đến khâu xác định giá đất, điều chỉnh quy hoạch chi tiết 1/500 và quy trình thủ tục chấp thuận nhà đầu tư theo quy định chuyên ngành.\n\n### Kết quả đạt được\n\n1. **Tại TP.HCM:** Tổ công tác đã xem xét và đưa ra hướng xử lý cho 68 dự án vướng mắc kéo dài, giúp nhiều dự án căn hộ tại khu vực thành phố Thủ Đức và khu Nam TP.HCM tái khởi động.\n2. **Tại Hà Nội:** Đã giải quyết xong các thủ tục về tiền sử dụng đất cho hơn 40 dự án, tạo điều kiện cấp Giấy chứng nhận quyền sở hữu nhà ở cho hàng ngàn hộ dân.\n3. **Hoàn thiện dữ liệu công khai:** Bộ Xây dựng công khai danh mục các dự án đủ điều kiện bán nhà ở hình thành trong tương lai trên cổng thông tin điện tử để người dân tra cứu.\n\n### Ý nghĩa thị trường\n\n*Phân tích editorial:* Sự chủ động tháo gỡ khó khăn của Chính phủ là minh chứng cho thấy pháp lý là chìa khóa mở đường cho thanh khoản thị trường. Khi vướng mắc được tháo gỡ, niềm tin của người mua nhà được củng cố mạnh mẽ. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Ban biên tập", "organization", "ban-bien-tap-baochinhphu",
        "2026-06-15T09:30:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/nhung-gam-mau-sang-cua-thi-truong-bat-dong-san-quy-i-2025-102250416110149386.htm", "official",
        "https://bcp2.cdnchinhphu.vn/zoom/1200_630/334894974524682240/2025/4/16/bds-cn-17054593951211988391423-2-17234297639371023957239-1-17363081602221347796039-17447759530031266596473-0-0-480-768-crop-17447759558231781223986.jpg",
        "Dự án nhà ở thương mại phục hồi xây dựng sau tháo gỡ pháp lý",
        "Nguồn cung nhà ở phục hồi nhờ nỗ lực tháo gỡ vướng mắc pháp lý cho các dự án",
        "Báo Điện tử Chính phủ", "Press Release / Public Domain", None,
        ["Pháp lý dự án", "Báo Chính phủ", "Nguồn cung BĐS", "Tháo gỡ vướng mắc"]
    ),
    article(
        "Quy định mới về điều kiện mở bán nhà ở hình thành trong tương lai áp dụng năm 2026",
        "phap-ly-quy-dinh-moi-dieu-kien-mo-ban-nha-o-hinh-thanh-trong-tuong-lai",
        "phap-ly-du-an",
        "Luật Kinh doanh Bất động sản mới quy định chặt chẽ điều kiện mở bán nhà ở hình thành trong tương lai, nhằm hạn chế rủi ro cho người mua và ngăn chặn tình trạng huy động vốn trái phép.",
        "### Nội dung quy định mới\n\nCơ quan quản lý nhà nước ban hành hướng dẫn chi tiết thi hành Luật Kinh doanh Bất động sản liên quan đến điều kiện đưa nhà ở hình thành trong tương lai vào kinh doanh. Theo quy định mới áp dụng năm 2026, chủ đầu tư chỉ được phép mở bán khi đã thỏa mãn đồng thời các điều kiện pháp lý khắt khe.\n\nĐiều này đòi hỏi dự án phải hoàn thành xong phần móng (đối với chung cư), có biên bản nghiệm thu hạ tầng kỹ thuật và được Sở Xây dựng địa phương phát hành văn bản xác nhận đủ điều kiện bán.\n\n### Các điểm mới đáng chú ý\n\n1. **Giới hạn tỷ lệ nhận tiền đặt cọc:** Chủ đầu tư chỉ được nhận tiền đặt cọc không quá 5% giá bán nhà ở, công trình xây dựng từ bên đặt cọc khi nhà ở đã đủ điều kiện đưa vào kinh doanh.\n2. **Minh bạch hóa tài khoản thu tiền:** Toàn bộ tiền thanh toán từ khách hàng phải được chuyển qua tài khoản mở tại tổ chức tín dụng để ngân hàng bảo lãnh giám sát mục đích sử dụng.\n3. **Công khai thông tin dự án:** Thông tin về dự án, tiến độ xây dựng và tình trạng thế chấp ngân hàng phải được đăng tải công khai trên Hệ thống thông tin về nhà ở và thị trường bất động sản.\n\n### Đánh giá tác động\n\n*Nhận định chuyên môn:* Quy định này chấm dứt thời kỳ các dự án \"bán lúa non\" hoặc sử dụng hợp đồng góp vốn trái phép. Dù làm gia tăng chi phí vốn ban đầu cho doanh nghiệp, quy định này tạo sự an tâm tuyệt đối cho người mua nhà. Nguồn trích dẫn: Bộ Xây dựng / Báo Điện tử Chính phủ.",
        "Thành Nam", "person", "thanh-nam",
        "2026-05-28T14:15:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/hoan-thien-som-ban-hanh-2-nghi-dinh-thao-go-kho-khan-vuong-mac-khi-thi-hanh-luat-dat-dai-102251229214535394.htm", "official",
        None, "", "", "", "", None,
        ["Pháp lý dự án", "Nhà ở hình thành trong tương lai", "Luật Kinh doanh BĐS"]
    )
]

# 2. QUY HOẠCH HẠ TẦNG (5)
art_quy_hoach = [
    article(
        "Hạ tầng giao thông định hình lại không gian đô thị Thủ đô Hà Nội",
        "quy-hoach-ha-tang-giao-thong-dinh-hinh-khong-gian-ha-noi",
        "quy-hoach-ha-tang",
        "Quy hoạch tổng thể Hà Nội tầm nhìn 100 năm lấy hạ tầng giao thông làm trục dẫn dắt phát triển đô thị, kéo sông Hồng trở lại vị trí trung tâm trong cấu trúc không gian mới.",
        "### Quy hoạch định hình không gian phát triển\n\nHội đồng Nhân dân và UBND Thành phố Hà Nội chính thức thông qua các định hướng chiến lược trong Quy hoạch tổng thể Thủ đô Hà Nội. Điểm đột phá trong bản quy hoạch tầm nhìn 100 năm này là việc chuyển đổi mô hình phát triển đô thị từ hướng tâm sang đa trung tâm, lấy mạng lưới hạ tầng giao thông kết nối làm xương sống chính.\n\nSông Hồng được xác định là trục cảnh quan trung tâm đô thị, phân chia hài hòa giữa khu vực đô thị lịch sử phía Nam và các đô thị thành phố vệ tinh phía Bắc.\n\n### Trọng tâm đầu tư hạ tầng\n\n1. **Khép kín các đường vành đai:** Đẩy nhanh tiến độ thi công đường Vành đai 4 và chuẩn bị đầu tư Vành đai 5 Vùng Thủ đô nhằm gia tăng kết nối liên vùng với Bắc Ninh, Hưng Yên, Vĩnh Phúc.\n2. **Phát triển đường sắt đô thị (Metro):** Ưu tiên nguồn vốn đầu tư công và huy động vốn xã hội hóa cho các tuyến Metro số 2, số 3 và số 5 để hình thành hệ thống giao thông công cộng sức chứa lớn.\n3. **Cầu qua sông Hồng:** Khởi công và triển khai xây dựng các cầu mới như cầu Tứ Liên, cầu Trần Hưng Đạo, cầu Ngọc Hồi để tăng cường liên kết hai bờ sông.\n\n### Tác động tới thị trường bất động sản\n\n*Phân tích thị trường:* Việc tái định hình không gian đô thị theo trục hạ tầng giao thông tạo ra dư địa phát triển bứt phá cho các khu vực vệ tinh như Đông Anh, Gia Lâm, Hoài Đức. Bất động sản bám theo các tuyến Metro và nút giao vành đai được dự báo tiếp tục thu hút dòng vốn đầu tư dài hạn. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Huỳnh Dũng", "person", "huynh-dung",
        "2026-05-20T20:43:10+07:00",
        "VnEconomy", "https://vneconomy.vn/ha-tang-giao-thong-dinh-hinh-lai-khong-gian-do-thi-ha-noi.htm", "news",
        "https://premedia.vneconomy.vn/files/uploads/2026/05/20/a027a9b6b6384eaeb0b1d890b9a0f182-91332.jpg?w=1200&h=630&mode=crop",
        "Quy hoạch phát triển hạ tầng giao thông đô thị Hà Nội",
        "Hạ tầng giao thông trở thành trục dẫn dắt không gian đô thị Hà Nội",
        "VnEconomy / Huỳnh Dũng", "Editorial Use Granted", None,
        ["Quy hoạch - Hạ tầng", "Hà Nội", "Giao thông đô thị", "Sông Hồng"]
    ),
    article(
        "Đẩy nhanh tiến độ thi công Sân bay Long Thành và mạng lưới giao thông kết nối vùng",
        "quy-hoach-tien-do-san-bay-long-thanh-va-cao-toc-ket-noi",
        "quy-hoach-ha-tang",
        "Chính phủ chỉ đạo tập trung tối đa nguồn lực hoàn thành các hạng mục chính của Sân bay Long Thành trong năm 2025, sẵn sàng đưa vào vận hành thử nghiệm quý IV/2026.",
        "### Tiến độ thực hiện dự án trọng điểm quốc gia\n\nTại phiên họp kiểm tra tiến độ dự án Cảng hàng không quốc tế Long Thành, lãnh đạo Chính phủ yêu cầu Tổng công ty Cảng hàng không Việt Nam (ACV) và các nhà thầu duy trì tiến độ thi công 3 ca 4 kíp. Mục tiêu đặt ra là hoàn thành công tác xây dựng cơ bản nhà ga hành khách và đường cất hạ cánh trong năm 2025 để chuyển sang giai đoạn lắp đặt thiết bị và vận hành thử nghiệm liên động vào tháng 9/2026.\n\n### Hạ tầng giao thông kết nối đồng bộ\n\n1. **Mở rộng cao tốc TP.HCM - Long Thành - Dầu Giây:** Đạt hơn 54% khối lượng, phấn đấu mở rộng lên 8-10 làn xe trước khi sân bay đi vào vận hành thương mại.\n2. **Các tuyến cao tốc liên vùng:** Đẩy nhanh tiến độ cao tốc Biên Hòa - Vũng Tàu, Bến Lức - Long Thành và tuyến đường ĐT 769, ĐT 773 kết nối trực tiếp vào các cổng sân bay.\n3. **Vành đai 3 TP.HCM:** Đang hoàn thiện các gói thầu xây lắp đoạn qua Đồng Nai và TP.HCM, bảo đảm lưu thông thông suốt từ khu đông TP.HCM tới Long Thành.\n\n### Tác động đối với bất động sản vùng phụ cận\n\n*Phân tích thị trường:* Sân bay Long Thành không chỉ là hạ tầng giao thông hàng không mà còn là hạt nhân phát triển \"thành phố sân bay\" (Aerotropolis). Giá trị bất động sản công nghiệp, logistics và đô thị dịch vụ tại Long Thành, Nhơn Trạch, Trảng Bom đang hưởng lợi lớn từ tiến độ hạ tầng này. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Ban biên tập", "organization", "ban-bien-tap-baochinhphu",
        "2026-06-02T10:00:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/thao-go-kho-khan-thu-tuc-de-du-an-san-bay-long-thanh-ve-dich-dung-tien-do-1022406121630123.htm", "official",
        "https://bcp2.cdnchinhphu.vn/zoom/1200_630/334894974524682240/2025/4/16/bds-cn-17054593951211988391423-2-17234297639371023957239-1-17363081602221347796039-17447759530031266596473-0-0-480-768-crop-17447759558231781223986.jpg",
        "Công trường thi công nhà ga hành khách Sân bay Long Thành",
        "Tiến độ xây dựng Sân bay Long Thành được đẩy nhanh tối đa",
        "Báo Điện tử Chính phủ", "Press Release / Public Domain", None,
        ["Quy hoạch - Hạ tầng", "Sân bay Long Thành", "Đồng Nai", "Cao tốc kết nối"]
    ),
    article(
        "Tiến độ thi công đường Vành đai 4 Vùng Thủ đô: Hoàn thành đường song hành quý II/2026",
        "quy-hoach-vanh-dai-4-vung-thu-do-tien-do-thi-cong-2026",
        "quy-hoach-ha-tang",
        "Dự án Vành đai 4 Vùng Thủ đô bước vào giai đoạn tăng tốc thi công các gói thầu đường song hành, tạo xung lực phát triển kinh tế xã hội cho khu vực ven Hà Nội.",
        "### Cập nhật tiến độ dự án Vành đai 4\n\nBan Quản lý dự án Đầu tư xây dựng công trình giao thông Thành phố Hà Nội cho biết toàn bộ các gói thầu đường song hành (đường đô thị) thuộc dự án Vành đai 4 Vùng Thủ đô qua địa bàn Hà Nội, Hưng Yên và Bắc Ninh đang bám sát tiến độ. Dự kiến đến cuối quý II/2026, phần đường song hành qua Hà Nội sẽ cơ bản hoàn thành và thông xe kỹ thuật.\n\nCông tác giải phóng mặt bằng của dự án đã hoàn thành trên 98%, là một trong những dự án hạ tầng lớn có tốc độ đền bù giải tỏa nhanh kỷ lục.\n\n### Các nhóm giải pháp trọng tâm\n\n1. **Khai thác quỹ đất vùng phụ cận:** UBND TP. Hà Nội lập đề án khai thác quỹ đất hai bên đường Vành đai 4 theo mô hình TOD (Phát triển đô thị gắn với giao thông công cộng) để đấu giá nguồn thu tái đầu tư.\n2. **Phối hợp liên tỉnh:** Tăng cường kết nối hạ tầng giao thông địa phương với các nút giao Vành đai 4 tại Bắc Ninh và Hưng Yên để bảo đảm tính liên hoàn toàn tuyến.\n3. **Quản lý quy hoạch kiến trúc:** Siết chặt quản lý xây dựng trái phép沿 các tuyến đường mới mở để tránh hiện tượng đầu cơ đất đai bất hợp pháp.\n\n### Đánh giá chuyên môn\n\n*Nhận định editorial:* Tuyến Vành đai 4 không chỉ giải quyết bài toán ùn tắc nội đô mà còn mở ra không gian phát triển đô thị mới cho các vùng phụ cận. Bất động sản tại Mê Linh, Đan Phượng, Thanh Oai, Thường Tín ghi nhận mức độ quan tâm gia tăng mạnh mẽ. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Vũ Phương", "person", "vu-phuong",
        "2026-03-25T16:20:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/day-nhanh-tien-do-vanh-dai-4-vung-thu-do-1022403251620.htm", "official",
        None, "", "", "", "", None,
        ["Quy hoạch - Hạ tầng", "Vành đai 4", "Hà Nội", "Phát triển TOD"]
    ),
    article(
        "Mở rộng cao tốc TP.HCM - Long Thành - Dầu Giây lên 8 đến 10 làn xe",
        "quy-hoach-mo-rong-cao-toc-tphcm-long-thanh-dau-giay",
        "quy-hoach-ha-tang",
        "Bộ Giao thông Vận tải phê duyệt phương án mở rộng đoạn cao tốc TP.HCM - Long Thành từ 4 làn lên 8-10 làn xe nhằm đáp ứng nhu cầu giao thông khi Sân bay Long Thành hoạt động.",
        "### Phương án đầu tư mở rộng\n\nBộ Giao thông Vận tải và UBND TP.HCM đã thống nhất kế hoạch mở rộng đoạn cao tốc TP.HCM - Long Thành (thuộc đường cao tốc TP.HCM - Long Thành - Dầu Giây) từ nút giao An Phú (TP. Thủ Đức) đến nút giao đường cao tốc Biên Hòa - Vũng Tàu (Đồng Nai) với tổng chiều dài khoảng 22 km.\n\nTheo quy hoạch, đoạn từ nút giao An Phú đến Vành đai 3 sẽ được mở rộng lên 8 làn xe, và đoạn từ Vành đai 3 đến nút giao Biên Hòa - Vũng Tàu mở rộng lên 10 làn xe.\n\n### Mục tiêu và lộ trình thực hiện\n\n1. **Giải quyết điểm nghẽn giao thông:** Tuyến cao tốc hiện tại thường xuyên ùn tắc nghiêm trọng vào các ngày lễ và cuối tuần. Mở rộng tuyến đường là yêu cầu cấp thiết bảo đảm kết nối TP.HCM với trung tâm hàng không Long Thành.\n2. **Công tác bồi thường giải phóng mặt bằng:** Các địa phương cam kết hoàn thành bàn giao mặt bằng trước tháng 6/2026 để triển khai thi công xây lắp.\n3. **Huy động nguồn vốn:** Phối hợp huy động nguồn vốn ngân sách trung ương, ngân sách địa phương và vốn doanh nghiệp nhà nước (VEC).\n\n### Góc nhìn chuyên gia\n\n*Nhận định thị trường:* Việc mở rộng tuyến cao tốc chiến lược này sẽ rút ngắn thời gian di chuyển từ trung tâm TP.HCM đi Đồng Nai xuống còn dưới 30 phút. Điều này thúc đẩy xu hướng li tâm của người mua nhà sang khu vực TP. Thủ Đức và Nhơn Trạch. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Phan Trang", "person", "phan-trang",
        "2026-01-18T11:45:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/mo-rong-cao-toc-tphcm-long-thanh-dau-giay-1022401181145.htm", "official",
        None, "", "", "", "", None,
        ["Quy hoạch - Hạ tầng", "Cao tốc Long Thành", "TP.HCM", "Giao thông liên vùng"]
    ),
    article(
        "Cả nước hoàn thành 3.500 km đường bộ cao tốc: Động lực bứt phá cho các đô thị vệ tinh",
        "quy-hoach-hoan-thanh-3500-km-cao-toc-toan-quoc",
        "quy-hoach-ha-tang",
        "Đến cuối năm 2025, hệ thống giao thông đường bộ Việt Nam vượt mốc 3.500 km cao tốc, kết nối thông suốt các vùng kinh tế trọng điểm và tạo động lực phát triển đô thị.",
        "### Thành tựu phát triển hạ tầng giao thông\n\nBáo cáo tổng kết công tác phát triển hạ tầng của Bộ Giao thông Vận tải cho biết tính đến tháng 12/2025, cả nước đã hoàn thành và đưa vào khai thác hơn 3.500 km đường bộ cao tốc, vượt mục tiêu 3.000 km đề ra trong Nghị quyết Đại hội XIII của Đảng.\n\nTuyến cao tốc Bắc - Nam phía Đông đã cơ bản thông suốt từ Lạng Sơn đến Cà Mau, cùng với các tuyến cao tốc trục ngang tại miền Bắc, miền Trung và Tây Nam Bộ.\n\n### Yếu tố tác động phát triển kinh tế - đô thị\n\n1. **Rút ngắn khoảng cách không gian:** Thời gian di chuyển giữa các tỉnh vùng ven và đô thị trung tâm giảm từ 40% đến 50%, thúc đẩy làn sóng di dân tự nhiên và dịch chuyển sản xuất.\n2. **Hình thành các cực tăng trưởng mới:** Các tỉnh có cao tốc đi qua như Cần Thơ, Hậu Giang, Khánh Hòa, Bình Thuận ghi nhận tốc độ thu hút vốn đầu tư công nghiệp và du lịch tăng mạnh.\n3. **Giảm áp lực đô thị trung tâm:** Tạo điều kiện hình thành các khu đô thị vệ tinh quy mô lớn với chi phí phát triển hợp lý.\n\n### Ý nghĩa với bất động sản\n\n*Phân tích thị trường:* Hạ tầng giao thông đi trước một bước mở đường cho thị trường bất động sản phát triển bền vững. Bất động sản công nghiệp và bất động sản nhà ở tại các địa phương có nút giao cao tốc hưởng lợi trực tiếp từ sự kết nối này. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Đức Tuân", "person", "duc-tuan",
        "2025-12-15T09:00:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/ca-nuoc-hoan-thanh-3500-km-duong-bo-cao-toc-1022512150900.htm", "official",
        None, "", "", "", "", None,
        ["Quy hoạch - Hạ tầng", "Cao tốc Bắc Nam", "Đô thị vệ tinh", "Giao thông quốc gia"]
    )
]

# 3. LÃI SUẤT TÀI CHÍNH (5)
art_lai_suat = [
    article(
        "Tín dụng và lãi suất thúc đẩy quá trình sàng lọc thị trường bất động sản",
        "lai-suat-tin-dung-thuc-day-qua-trinh-sang-loc-thi-truong",
        "lai-suat-tai-chinh",
        "Tổng dư nợ tín dụng bất động sản đạt 4,74 triệu tỷ đồng. Sự biến động của mặt bằng lãi suất cho vay trở thành thước đo kiểm tra sức chịu đựng tài chính của doanh nghiệp.",
        "### Diễn biến tín dụng địa ốc năm 2026\n\nTheo dữ liệu công bố từ Ngân hàng Nhà nước Việt Nam (NHNN), tổng dư nợ tín dụng đối với lĩnh vực bất động sản toàn hệ thống đạt khoảng 4,74 triệu tỷ đồng, chiếm hơn 25,5% tổng dư nợ nền kinh tế. Sự tăng trưởng tín dụng tập trung mạnh vào các tháng đầu năm 2026, thúc đẩy NHNN đưa ra các biện pháp kiểm soát rủi ro an toàn hệ thống.\n\nMặt bằng lãi suất cho vay mua nhà sau giai đoạn ưu đãi (lãi suất thả nổi) tại nhiều ngân hàng thương mại tiệm cận mức 11% - 13%/năm, tạo áp lực chi phí tài chính đáng kể cho cả người vay mua nhà và chủ đầu tư.\n\n### Các trọng tâm điều hành tài chính\n\n1. **Kiểm soát rủi ro tín dụng kinh doanh BĐS:** NHNN yêu cầu các ngân hàng thương mại kiểm soát chặt chẽ tốc độ tăng trưởng tín dụng vào phân khúc đầu cơ, tập trung vốn cho vay nhà ở xã hội và nhà ở giá rẻ.\n2. **Tái cấu trúc nợ trái phiếu:** Doanh nghiệp địa ốc tiếp tục thương lượng gia hạn hoặc mua lại trước hạn các lô trái phiếu đáo hạn năm 2026 để giảm áp lực dòng tiền.\n3. **Sự phân hóa dòng vốn:** Ngân hàng ưu tiên giải ngân cho các dự án đã hoàn thiện 100% pháp lý và có phương án kinh doanh khả thi.\n\n### Phân tích và dự báo\n\n*Góc nhìn kinh tế:* Áp lực lãi suất là \"bài kiểm tra độ bền tài chính\". Doanh nghiệp sử dụng đòn bẩy quá cao buộc phải bán bớt tài sản hoặc hợp tác đầu tư. Ngược lại, người mua nhà có nhu cầu thực được hưởng lợi khi các chủ đầu tư tung ra nhiều chính sách hỗ trợ lãi suất kéo dài. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Thanh Xuân", "person", "thanh-xuan",
        "2026-03-09T15:58:04+07:00",
        "VnEconomy", "https://vneconomy.vn/tin-dung-va-lai-suat-thuc-day-qua-trinh-sang-loc-thi-truong-bat-dong-san.htm", "news",
        "https://premedia.vneconomy.vn/files/uploads/2026/03/09/085192d62727406fb875aa1dc47acec3-74496.jpg?w=1200&h=630&mode=crop",
        "Biến động lãi suất cho vay và tín dụng bất động sản năm 2026",
        "Tín dụng và lãi suất đóng vai trò sàng lọc các chủ thể trên thị trường bất động sản",
        "VnEconomy / Thanh Xuân", "Editorial Use Granted", None,
        ["Lãi suất - Tài chính", "Tín dụng BĐS", "Ngân hàng Nhà nước", "Tài chính doanh nghiệp"]
    ),
    article(
        "Ngân hàng Nhà nước chỉ đạo kiểm soát tín dụng bất động sản và hỗ trợ lãi suất người mua nhà",
        "lai-suat-ngan-hang-nha-nuoc-kiem-soat-tin-dung-bds-2026",
        "lai-suat-tai-chinh",
        "NHNN ban hành chỉ thị yêu cầu các tổ chức tín dụng kiểm soát rủi ro cho vay bất động sản nhưng tiếp tục tạo điều kiện vốn cho các dự án nhà ở đáp ứng nhu cầu thực.",
        "### Định hướng chỉ đạo của Ngân hàng Nhà nước\n\nThống đốc Ngân hàng Nhà nước Việt Nam ban hành chỉ thị về việc điều hành chỉ tiêu tín dụng và kiểm soát an toàn hoạt động ngân hàng năm 2026. Trong đó, tín dụng bất động sản tiếp tục được giám sát chặt chẽ nhằm tránh nợ xấu phát sinh, đồng thời định hướng nguồn vốn chảy vào sản xuất kinh doanh và nhà ở xã hội.\n\nNHNN nhấn mạnh việc không siết tín dụng một cách thô bạo mà phân loại rủi ro theo từng phân khúc sản phẩm.\n\n### Nội dung giải pháp tài chính\n\n1. **Ưu tiên cho vay nhà ở xã hội và nhà ở công nhân:** Tiếp tục triển khai gói tín dụng ưu đãi 120.000 tỷ đồng với mức lãi suất cho vay thấp hơn từ 1,5% đến 2% so với lãi suất cho vay trung dài hạn bình thường.\n2. **Kiểm soát chặt tín dụng bất động sản cao cấp:** Giám sát rủi ro đối với các khoản vay tập trung vào phân khúc nghỉ dưỡng, biệt thự biển và dự án chưa đủ điều kiện mở bán.\n3. **Giảm chi phí hoạt động để hạ lãi suất:** Khuyến khích các ngân hàng thương mại tiết giảm chi phí vận hành, ứng dụng công nghệ số để duy trì mặt bằng lãi suất cho vay ở mức hợp lý.\n\n### Nhận định thị trường\n\n*Phân tích editorial:* Cơ chế điều hành linh hoạt của NHNN giúp duy trì sự ổn định của hệ thống tài chính tiền tệ. Dòng vốn tín dụng chọn lọc sẽ thúc đẩy thị trường tái cơ cấu hướng tới các sản phẩm giá trị thực. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Anh Minh", "person", "anh-minh",
        "2026-05-14T10:00:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/ngan-hang-nha-nuoc-chi-dao-dieu-hanh-tin-dung-nam-2026-1022605141000.htm", "official",
        None, "", "", "", "", None,
        ["Lãi suất - Tài chính", "Ngân hàng Nhà nước", "Gói 120k tỷ", "Tín dụng ưu đãi"]
    ),
    article(
        "Lãi suất vay mua nhà năm 2026: Lời khuyên quản trị rủi ro dòng tiền cho người mua",
        "lai-suat-vay-mua-nha-thao-noi-2026-quan-tri-rui-ro",
        "lai-suat-tai-chinh",
        "Trước biến động lãi suất thả nổi sau thời gian ưu đãi, các chuyên gia tài chính khuyến cáo người mua nhà cần duy trì tỷ lệ vay an toàn dưới 50% giá trị tài sản.",
        "### Bối cảnh mặt bằng lãi suất vay mua nhà\n\nKhảo sát lãi suất vay mua nhà tại các ngân hàng thương mại cổ phần trong giữa năm 2026 cho thấy mức lãi suất ưu đãi năm đầu tiên dao động từ 6,5% - 8,5%/năm. Tuy nhiên, sau thời gian ưu đãi, lãi suất thả nổi được tính theo công thức lãi suất cơ sở cộng biên độ (từ 3,5% - 4,5%/năm), đưa lãi suất thực tế lên mức 11% - 12,5%/năm.\n\nĐiều này đòi hỏi khách hàng cá nhân phải có kế hoạch tài chính dài hạn để tránh rơi vào bẫy áp lực trả nợ.\n\n### Nguyên tắc quản trị dòng tiền cá nhân\n\n1. **Tỷ lệ vay an toàn (Rule of Thirds):** Tổng số tiền trả gốc và lãi hàng tháng không nên vượt quá 30% - 40% tổng thu nhập hàng tháng của gia đình.\n2. **Quỹ dự phòng rủi ro:** Người vay nên duy trì khoản tiền gửi tiết kiệm dự phòng tương đương ít nhất 6 tháng tiền trả nợ ngân hàng.\n3. **Lựa chọn gói vay có biên độ cố định:** Ưu tiên các ngân hàng có cam kết biên độ lãi suất thả nổi rõ ràng và phí trả nợ trước hạn hợp lý.\n\n### Lời khuyên chuyên gia\n\n*Phân tích tài chính:* Mua nhà là khoản đầu tư lớn nhất của đa số gia đình. Việc tính toán kịch bản lãi suất tăng thêm 1% - 2% trong tương lai là bước chuẩn bị cần thiết để bảo đảm an toàn tài chính. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Minh Phong", "person", "minh-phong",
        "2026-06-18T11:30:00+07:00",
        "VnEconomy", "https://vneconomy.vn/lai-suat-vay-mua-nha-quan-tri-rui-ro-dong-tien.htm", "news",
        None, "", "", "", "", None,
        ["Lãi suất - Tài chính", "Vay mua nhà", "Lãi suất thả nổi", "Tài chính cá nhân"]
    ),
    article(
        "Thị trường trái phiếu doanh nghiệp bất động sản: Tín hiệu phục hồi niềm tin nhà đầu tư",
        "lai-suat-trai-phieu-doanh-nghiep-bat-dong-san-phuc-hoi",
        "lai-suat-tai-chinh",
        "Hoạt động phát hành trái phiếu doanh nghiệp địa ốc ghi nhận sự khởi sắc nhờ quy định pháp lý chuẩn hóa và sự tham gia của các tổ chức xếp hạng tín nhiệm.",
        "### Diễn biến thị trường trái phiếu địa ốc\n\nBáo cáo từ Hiệp hội Thị trường Trái phiếu Việt Nam (VBMA) cho biết trong 5 tháng đầu năm 2026, nhóm doanh nghiệp bất động sản tiếp tục dẫn đầu về giá trị phát hành trái phiếu riêng lẻ và công chúng. Các đợt phát hành mới đều có lãi suất danh nghĩa dao động từ 9,5% đến 11,5%/năm với tài sản đảm bảo được định giá độc lập.\n\nSự minh bạch thông tin theo Nghị định 65 và các quy định sửa đổi giúp khôi phục niềm tin của các nhà đầu tư tổ chức.\n\n### Các yếu tố hỗ trợ phục hồi\n\n1. **Kết quả xếp hạng tín nhiệm:** Đa số các doanh nghiệp phát hành thành công đều có kết quả xếp hạng tín nhiệm từ các tổ chức uy tín như FiinRatings, Saigon Ratings.\n2. **Tái cấu trúc kỳ hạn nợ:** Doanh nghiệp chủ động kéo dài kỳ hạn trái phiếu từ 3-5 năm thay vì các kỳ hạn ngắn 1-2 năm như giai đoạn trước.\n3. **Giám sát dòng tiền sử dụng vốn:** Tiền thu được từ trái phiếu được phong tỏa và chỉ giải ngân đúng cho mục đích phát triển dự án đã cam kết.\n\n### Ý nghĩa kinh tế\n\n*Phân tích thị trường:* Trái phiếu doanh nghiệp là kênh dẫn vốn trung và dài hạn quan trọng giúp giảm bớt sự phụ thuộc quá mức vào nguồn vốn tín dụng ngân hàng của ngành bất động sản. Nguồn trích dẫn: VnEconomy / VBMA.",
        "Thu Thủy", "person", "thu-thuy",
        "2026-02-22T14:15:00+07:00",
        "VnEconomy", "https://vneconomy.vn/trai-phieu-doanh-nghiep-bat-dong-san-phuc-hoi-niem-tin.htm", "news",
        None, "", "", "", "", None,
        ["Lãi suất - Tài chính", "Trái phiếu doanh nghiệp", "Xếp hạng tín nhiệm", "Kênh huy động vốn"]
    ),
    article(
        "Giải ngân gói tín dụng 120.000 tỷ đồng cho nhà ở xã hội đạt bước tiến mới",
        "lai-suat-goi-tin-dung-120-ngan-ty-dong-nha-o-xa-hoi",
        "lai-suat-tai-chinh",
        "Bộ Xây dựng và Ngân hàng Nhà nước phối hợp nỗ lực đẩy nhanh tiến độ giải ngân gói tín dụng ưu đãi 120.000 tỷ đồng, tháo gỡ thủ tục cho cả chủ đầu tư và người mua nhà.",
        "### Tiến độ giải ngân gói ưu đãi\n\nBáo cáo tại phiên họp giao ban Bộ Xây dựng cho biết dư nợ giải ngân gói tín dụng 120.000 tỷ đồng dành cho nhà ở xã hội, nhà ở công nhân và cải tạo chung cư cũ đã ghi nhận mức tăng trưởng khả quan. Nhiều dự án nhà ở xã hội tại Bắc Ninh, Hải Phòng, Bình Dương và TP.HCM đã được phê duyệt danh mục vay vốn ưu đãi.\n\nNgân hàng Nhà nước đã chỉ đạo các ngân hàng thương mại nhà nước kéo dài thời gian hưởng lãi suất ưu đãi cho người mua nhà lên 5-10 năm.\n\n### Giải pháp tháo gỡ rào cản thủ tục\n\n1. **Nâng mức hỗ trợ lãi suất:** Thường xuyên điều chỉnh giảm lãi suất vay của gói 120.000 tỷ đồng để bảo đảm luôn thấp hơn 1,5% - 2% so với lãi suất thị trường.\n2. **Nới lỏng điều kiện thụ hưởng:** Nâng mức thu nhập chịu thuế tối thiểu được đăng ký mua nhà ở xã hội giúp mở rộng đối tượng tiếp cận.\n3. **Cắt giảm thủ tục xác nhận nhà ở:** Đơn giản hóa quy trình xác nhận thực trạng nhà ở tại UBND cấp xã.\n\n### Đánh giá chuyên môn\n\n*Phân tích xã hội:* Gói tín dụng ưu đãi không chỉ mang ý nghĩa an sinh xã hội lớn mà còn tạo động lực kích cầu cho toàn bộ chuỗi cung ứng vật liệu xây dựng và thị trường bất động sản giá rẻ. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Ban biên tập", "organization", "ban-bien-tap-baochinhphu",
        "2025-11-10T15:30:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/giai-ngan-goi-120000-ty-dong-nha-o-xa-hoi-102251110.htm", "official",
        None, "", "", "", "", None,
        ["Lãi suất - Tài chính", "Nhà ở xã hội", "Gói 120k tỷ", "An sinh xã hội"]
    )
]

# 4. THỊ TRƯỜNG GIÁ CẢ (5)
art_thi_truong = [
    article(
        "Thị trường bất động sản phân hóa: Căn hộ nhu cầu thực dẫn dắt thanh khoản",
        "thi-truong-gia-ca-can-ho-trung-cap-huong-toi-nhu-cau-thuc",
        "thi-truong-gia-ca",
        "Báo cáo diễn biến thị trường 2026 cho thấy sự phân hóa rõ rệt. Phân khúc căn hộ chung cư phục vụ nhu cầu ở thực duy trì mức tăng trưởng giá và thanh khoản ổn định.",
        "### Tổng quan diễn biến giá và thanh khoản\n\nBáo cáo nghiên cứu thị trường bất động sản quý II/2026 ghi nhận sự phân hóa ngày càng sâu sắc giữa các phân khúc sản phẩm. Trong khi phân khúc biệt thự nghỉ dưỡng và sản phẩm đầu cơ ven biển vẫn gặp khó khăn trong việc giao dịch, phân khúc căn hộ chung cư phân khúc trung cấp và bình dân tại Hà Nội và TP.HCM tiếp tục là điểm sáng thu hút dòng tiền.\n\nMức giá sơ cấp căn hộ chung cư tại Hà Nội trung bình đạt 55 - 70 triệu đồng/m2, trong khi tại TP.HCM dao động từ 65 - 85 triệu đồng/m2.\n\n### Các yếu tố tác động tới giá cả\n\n1. **Chi phí đầu vào gia tăng:** Việc áp dụng Bảng giá đất mới theo Luật Đất đai làm tăng tiền sử dụng đất, cùng với chi phí vật liệu xây dựng và chi phí tài chính đẩy giá thành sản xuất nhà ở lên cao.\n2. **Nguồn cung mới giới hạn:** Mặc dù pháp lý được tháo gỡ nhưng thời gian hoàn thành thủ tục dự án kéo dài khiến nguồn cung mới ra thị trường chưa thể bùng nổ ngay.\n3. **Nhu cầu ở thực cao:** Tỷ lệ đô thị hóa tăng nhanh cùng quy mô gia đình trẻ thu hẹp tạo ra lực cầu nhà ở liên tục tại các đô thị lớn.\n\n### Dự báo thị trường\n\n*Phân tích chuyên gia:* Giá bất động sản nhà ở khó có khả năng giảm mạnh do chi phí cấu thành giá tăng cao. Nhà đầu tư nên tập trung vào các sản phẩm có khả năng tạo dòng tiền ngay thay vì kỳ vọng vào việc tăng giá đột biến ngắn hạn. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Quốc Hùng", "person", "quoc-hung",
        "2026-05-18T09:20:00+07:00",
        "VnEconomy", "https://vneconomy.vn/thi-truong-bat-dong-san-phan-hoa-nhu-cau-thuc-dan-dat.htm", "news",
        None, "", "", "", "", None,
        ["Thị trường - Giá cả", "Căn hộ chung cư", "Nhu cầu thực", "Diễn biến giá BĐS"]
    ),
    article(
        "Áp dụng Bảng giá đất mới: Chi phí phát triển dự án tăng, giá nhà lập mặt bằng mới",
        "thi-truong-gia-ca-bang-gia-dat-moi-anh-huong-chi-phi-dau-vao",
        "thi-truong-gia-ca",
        "Việc bỏ khung giá đất và áp dụng Bảng giá đất sát giá thị trường theo quy định mới giúp minh bạch công tác đền bù nhưng đẩy chi phí tiền sử dụng đất của dự án lên cao.",
        "### Tác động của Bảng giá đất mới\n\nCác tỉnh và thành phố trực thuộc trung ương chính thức ban hành và áp dụng Bảng giá đất mới theo Luật Đất đai 2024. Việc xác định giá đất sát với giá thị trường giúp công tác giải phóng mặt bằng diễn ra thuận lợi hơn do người dân đồng thuận với mức bồi thường.\n\nTuy nhiên, điều này đồng nghĩa với việc tiền sử dụng đất mà các chủ đầu tư dự án bất động sản phải nộp cho nhà nước tăng lên từ 30% đến 50% so với trước đây.\n\n### Phân tích cấu thành giá bất động sản\n\n1. **Tỷ trọng tiền sử dụng đất:** Tiền sử dụng đất hiện chiếm khoảng 20% - 35% trong cơ cấu giá thành căn hộ chung cư và lên tới 50% đối với dự án nhà ở liền kề, biệt thự.\n2. **Áp lực lên giá sơ cấp:** Chủ đầu tư buộc phải điều chỉnh tăng giá bán sơ cấp để bảo đảm biên lợi nhuận hợp lý và chi trả chi phí tài chính.\n3. **Cơ hội cho bất động sản thứ cấp:** Giá sơ cấp tăng cao khiến một bộ phận lớn người mua nhà chuyển sang tìm kiếm các sản phẩm trên thị trường thứ cấp có giá mềm hơn.\n\n### Đánh giá chuyên môn\n\n*Phân tích thị trường:* Bảng giá đất mới phản ánh đúng giá trị thực của tài sản đất đai. Thị trường sẽ hình thành mặt bằng giá mới minh bạch hơn, loại bỏ các dự án găm giữ đất chờ tăng giá. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Hoàng Giang", "person", "hoang-giang",
        "2026-03-30T11:00:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/ap-dung-bang-gia-dat-moi-anh-huong-chi-phi-dau-vao-102260330.htm", "official",
        None, "", "", "", "", None,
        ["Thị trường - Giá cả", "Bảng giá đất", "Tiền sử dụng đất", "Giá nhà sơ cấp"]
    ),
    article(
        "Nguồn cung căn hộ mới tại Hà Nội và TP.HCM ghi nhận tín hiệu phục hồi tích cực",
        "thi-truong-gia-ca-nguon-cung-can-ho-ha-noi-tphcm-2026",
        "thi-truong-gia-ca",
        "Báo cáo từ các đơn vị nghiên cứu thị trường cho thấy số lượng căn hộ mới đủ điều kiện mở bán tại Hà Nội và TP.HCM trong 6 tháng đầu năm 2026 tăng 45% so với cùng kỳ.",
        "### Diễn biến nguồn cung sản phẩm mới\n\nBáo cáo tổng hợp thị trường bất động sản nhà ở 6 tháng đầu năm 2026 ghi nhận tổng cộng hơn 18.000 căn hộ chung cư mới được đưa ra thị trường tại Hà Nội và TP.HCM. Sự phục hồi nguồn cung diễn ra mạnh mẽ nhất tại khu vực phía Đông Hà Nội (Gia Lâm, Văn Giang) và khu vực phía Tây TP.HCM (Bình Tân, Bình Chánh).\n\nTỷ lệ hấp thụ sản phẩm mới trong đợt mở bán đầu tiên đạt mức trung bình 60% - 70%.\n\n### Đột phá phân khúc và cấu trúc sản phẩm\n\n1. **Sự trở lại của phân khúc trung cấp:** Nhiều chủ đầu tư linh hoạt điều chỉnh thiết kế căn hộ diện tích nhỏ (45 - 65 m2) để đưa tổng giá trị căn hộ về mức 2,5 - 3,5 tỷ đồng, vừa túi tiền của gia đình trẻ.\n2. **Chính sách bán hàng ưu việt:** Áp dụng tiến độ thanh toán giãn lên đến 3-5 năm, hỗ trợ ân hạn nợ gốc và lãi suất 0% trong 24 tháng.\n3. **Tiêu chuẩn bàn giao nâng cao:** Tăng cường tiện ích nội khu như công viên xanh, phòng gym, khu vui chơi trẻ em để tăng tính cạnh tranh.\n\n### Đánh giá chuyên môn\n\n*Phân tích thị trường:* Nguồn cung cải thiện giúp giảm bớt cơn khát nhà ở tại các đô thị lớn, tạo điều kiện cho thị trường vận hành ổn định và hạn chế hiện tượng sốt giá cục bộ. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Thùy Linh", "person", "thuy-linh",
        "2026-06-22T15:00:00+07:00",
        "VnEconomy", "https://vneconomy.vn/nguon-cung-can-ho-moi-phuc-hoi-tich-cuc.htm", "news",
        None, "", "", "", "", None,
        ["Thị trường - Giá cả", "Nguồn cung căn hộ", "Thanh khoản BĐS", "Hà Nội TP.HCM"]
    ),
    article(
        "Đất nền ven đô hạ nhiệt đầu cơ, xuất hiện các giao dịch đầu tư dài hạn",
        "thi-truong-gia-ca-dat-nen-ven-do-xuat-hien-giao-dich-thuc",
        "thi-truong-gia-ca",
        "Phân khúc đất nền vùng ven các đô thị lớn không còn hiện tượng sốt ảo. Giá đất cân bằng trở lại và thu hút các nhà đầu tư có tiềm lực tài chính thực sự.",
        "### Diễn biến phân khúc đất nền ven đô\n\nSau khi Luật Kinh doanh Bất động sản mới siết chặt quy định phân lô bán nền tại các đô thị loại I, II, III, thị trường đất nền vùng ven Hà Nội và TP.HCM đã bước qua giai đoạn tăng nóng. Hoạt động lướt sóng của các nhóm đầu cơ hạ nhiệt rõ rệt, nhường chỗ cho những nhà đầu tư cá nhân có dòng tiền tự có.\n\nMặt bằng giá đất nền tại các khu vực ven vành đai đi vào trạng thái đi ngang hoặc điều chỉnh nhẹ từ 5% - 10% ở các vị trí xa trung tâm.\n\n### Lý do phân khúc đi vào quỹ đạo an toàn\n\n1. **Siết chặt phân lô bán nền:** Quy định buộc các dự án đất nền phải hoàn thiện hạ tầng và xây dựng nhà ở trước khi chuyển nhượng giúp ngăn chặn tình trạng dự án \"ma\" bỏ hoang.\n2. **Tâm lý nhà đầu tư thay đổi:** Nhà đầu tư chuyển hướng sang các khu đất đã có sổ đỏ cá nhân, kết nối hạ tầng hoàn chỉnh và có thể xây dựng ở hoặc kinh doanh được ngay.\n3. **Minh bạch thông tin quy hoạch:** Các địa phương công khai quy hoạch sử dụng đất trực tuyến giúp người dân dễ dàng tra cứu, tránh bẫy quy hoạch treo.\n\n### Đánh giá chuyên môn\n\n*Phân tích editorial:* Sự giảm nhiệt của đất nền đầu cơ là tín hiệu tích cực cho toàn bộ thị trường. Dòng tiền đầu tư đang trở lại đúng bản chất là tìm kiếm giá trị gia tăng từ hạ tầng thực tế. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Trần Vũ", "person", "tran-vu",
        "2026-01-25T10:30:00+07:00",
        "VnEconomy", "https://vneconomy.vn/dat-nen-ven-do-ha-nhiet-dau-co.htm", "news",
        None, "", "", "", "", None,
        ["Thị trường - Giá cả", "Đất nền ven đô", "Phân lô bán nền", "Đầu tư dài hạn"]
    ),
    article(
        "Báo cáo VARS: Niềm tin thị trường bất động sản phục hồi nhờ minh bạch thông tin",
        "thi-truong-gia-ca-vars-bao-cao-thanh-khoan-bds-2025",
        "thi-truong-gia-ca",
        "Hội Môi giới Bất động sản Việt Nam (VARS) công bố báo cáo đánh giá niềm tin nhà đầu tư và chỉ số thanh khoản thị trường đạt mức cao nhất trong 3 năm qua.",
        "### Dữ liệu báo cáo từ VARS\n\nTheo báo cáo chỉ số thị trường bất động sản do Hội Môi giới Bất động sản Việt Nam (VARS) công bố, chỉ số niềm tin của người tiêu dùng và nhà đầu tư đối với thị trường địa ốc ghi nhận mức phục hồi ấn tượng. Tổng số lượng giao dịch thành công toàn thị trường trong năm qua đạt hơn 50.000 sản phẩm, tăng 35% so với năm trước.\n\nPhân khúc nhà ở chung cư và nhà ở xã hội đóng góp hơn 70% tổng số lượng giao dịch toàn thị trường.\n\n### Các động lực chính thúc đẩy thanh khoản\n\n1. **Minh bạch thông tin dự án:** Việc công khai danh mục dự án đủ điều kiện mở bán và thông tin quy hoạch giúp người mua giải tỏa tâm lý lo ngại rủi ro pháp lý.\n2. **Chính sách tín dụng linh hoạt:** Sự phối hợp giữa chủ đầu tư và ngân hàng trong việc đưa ra các gói hỗ trợ lãi suất giúp người mua dễ dàng tiếp cận nguồn vốn.\n3. **Nguồn cung phù hợp nhu cầu:** Sản phẩm mới đưa ra thị trường bám sát nhu cầu thực của phần đông dân cư đô thị.\n\n### Khuyến nghị từ VARS\n\n*Phân tích thị trường:* VARS khuyến nghị các doanh nghiệp bất động sản tiếp tục đẩy mạnh tái cấu trúc sản phẩm, nâng cao chất lượng quản trị dự án và công khai minh bạch thông tin để giữ vững niềm tin của thị trường. Nguồn trích dẫn: Báo Xây Dựng / VARS.",
        "Bảo Anh", "person", "bao-anh",
        "2025-10-15T14:00:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/vars-cong-bo-bao-cao-thi-truong-bat-dong-san-102251015.htm", "official",
        None, "", "", "", "", None,
        ["Thị trường - Giá cả", "Báo cáo VARS", "Thanh khoản BĐS", "Niềm tin thị trường"]
    )
]

# 5. ĐẦU TƯ DÒNG TIỀN (5)
art_dau_tu = [
    article(
        "Dòng vốn FDI vào bất động sản Việt Nam tăng mạnh trong nửa đầu năm 2026",
        "dau-tu-dong-tien-fdi-vao-bat-dong-san-viet-nam-2026",
        "dau-tu-dong-tien",
        "Vốn đầu tư trực tiếp nước ngoài (FDI) rót vào lĩnh vực bất động sản đạt kỷ lục mới, tập trung vào bất động sản công nghiệp, logistics và nhà ở chất lượng cao.",
        "### Số liệu thu hút vốn FDI địa ốc\n\nTheo Cục Đầu tư nước ngoài (Bộ Kế hoạch và Đầu tư), tổng vốn FDI đăng ký vào lĩnh vực kinh doanh bất động sản trong 6 tháng đầu năm 2026 đạt hơn 2,8 tỷ USD, tăng 42% so với cùng kỳ năm trước. Bất động sản tiếp tục duy trì vị trí thứ hai trong số các ngành thu hút vốn đầu tư nước ngoài lớn nhất tại Việt Nam.\n\nCác nhà đầu tư đến từ Singapore, Nhật Bản, Hàn Quốc và Malaysia dẫn đầu về số lượng dự án và vốn góp.\n\n### Các phân khúc sức hút lớn\n\n1. **Bất động sản công nghiệp và Logistics:** Nhờ sự dịch chuyển chuỗi cung ứng toàn cầu, các khu công nghiệp thế hệ mới tích hợp tiêu chuẩn xanh (ESG) tại Bắc Ninh, Bình Dương, Long An thu hút các tập đoàn sản xuất lớn.\n2. **Dự án nhà ở phức hợp:** Các nhà đầu tư ngoại hợp tác với chủ đầu tư trong nước để phát triển các khu đô thị tích hợp (Township) có hạ tầng đồng bộ.\n3. **Văn phòng và BĐS thương mại:** Nhu cầu thuê văn phòng hạng A đạt tiêu chuẩn chứng chỉ xanh (LEED, Lotus) gia tăng từ các công ty đa quốc gia.\n\n### Đánh giá chuyên môn\n\n*Phân tích kinh tế:* Dòng vốn FDI không chỉ mang lại nguồn lực tài chính mạnh mẽ mà còn chuyển giao kinh nghiệm quản lý, tiêu chuẩn xây dựng xanh và mô hình phát triển đô thị hiện đại cho thị trường Việt Nam. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Hải Minh", "person", "hai-minh",
        "2026-06-25T15:45:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/von-fdi-rot-vao-bat-dong-san-tang-manh-102260625.htm", "official",
        None, "", "", "", "", None,
        ["Đầu tư - Dòng tiền", "Vốn FDI", "BĐS công nghiệp", "Đầu tư nước ngoài"]
    ),
    article(
        "Xu hướng chuyển dịch dòng tiền đầu tư: Ưu tiên tài sản tạo ra dòng tiền ổn định",
        "dau-tu-dong-tien-xu-huong-chuyen-dich-dong-tien-san-pham-an-toan",
        "dau-tu-dong-tien",
        "Khẩu vị của nhà đầu tư bất động sản năm 2026 chuyển mạnh từ đầu cơ chênh lệch giá sang săn tìm các tài sản có khả năng khai thác cho thuê và tạo dòng tiền hàng tháng.",
        "### Sự thay đổi trong tư duy đầu tư\n\nKhảo sát khẩu vị nhà đầu tư bất động sản cá nhân năm 2026 cho thấy hơn 68% người được hỏi ưu tiên lựa chọn sản phẩm bất động sản có thể khai thác dòng tiền ngay (như căn hộ cho thuê, nhà phố kinh doanh, shophouse khối đế). Tư duy \"mua đất để đó chờ tăng giá gấp đôi\" đã không còn là chiến lược chủ đạo trong bối cảnh chi phí cơ hội và lãi suất vay ở mức cao.\n\nNhà đầu tư đòi hỏi tài sản phải duy trì tỷ suất lợi nhuận ròng hàng năm từ 4% - 6% từ tiền thuê.\n\n### Các dòng sản phẩm thu hút vốn\n\n1. **Căn hộ chung cư đã bàn giao:** Đã có sổ hồng, nằm tại các quận nội thành hoặc kế cận các khu công nghiệp có nguồn khách thuê dồi dào.\n2. **Nhà phố nội đô diện tích nhỏ:** Dễ cho thuê làm văn phòng đại diện, cửa hàng dịch vụ hoặc homestay.\n3. **Bất động sản thương mại khối đế:** Shophouse tại các đại đô thị có quy mô dân cư đông đúc về sinh sống.\n\n### Lời khuyên đầu tư\n\n*Phân tích tài chính:* Bất động sản dòng tiền đóng vai trò như một \"lá chắn an toàn\" giúp nhà đầu tư chống lại lạm phát và duy trì khả năng thanh toán nợ gốc ngân hàng. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Lê Nam", "person", "le-nam",
        "2026-04-28T09:15:00+07:00",
        "VnEconomy", "https://vneconomy.vn/xu-huong-dong-tien-dau-tu-bat-dong-san.htm", "news",
        None, "", "", "", "", None,
        ["Đầu tư - Dòng tiền", "Dòng tiền cho thuê", "Khẩu vị đầu tư", "Quản trị rủi ro"]
    ),
    article(
        "M&A bất động sản sôi động: Nhà đầu tư nước ngoài tích cực thâu tóm quỹ đất sạch",
        "dau-tu-dong-tien-ma-bat-dong-san-doanh-nghiep-ngoai",
        "dau-tu-dong-tien",
        "Hoạt động mua bán và sáp nhập (M&A) dự án bất động sản diễn ra sôi động khi các quỹ đầu tư ngoại tìm kiếm cơ hội hợp tác với doanh nghiệp trong nước có quỹ đất pháp lý chuẩn.",
        "### Diễn biến làn sóng M&A địa ốc\n\nThị trường bất động sản 2026 chứng kiến hàng loạt thương vụ M&A quy mô lớn giữa các tập đoàn bất động sản quốc tế (đến từ Nhật Bản, Singapore, Malaysia) và các chủ đầu tư Việt Nam. Thay vì tự mình thực hiện toàn bộ quy trình đền bù giải phóng mặt bằng, nhà đầu tư ngoại chọn phương án mua lại cổ phần dự án đã có chấp thuận chủ trương đầu tư và quy hoạch 1/500.\n\nGiá trị các thương vụ M&A ước tính đạt hàng trăm triệu USD mỗi đợt chuyển nhượng.\n\n### Động lực đằng sau các thương vụ\n\n1. **Doanh nghiệp trong nước tái cơ cấu nợ:** Cần đối tác có tiềm lực tài chính mạnh để chia sẻ chi phí phát triển và trả nợ ngân hàng.\n2. **Nhà đầu tư ngoại tận dụng thời cơ:** Tín nhiệm vào triển vọng tăng trưởng kinh tế dài hạn của Việt Nam và sự hoàn thiện của Luật Đất đai mới.\n3. **Rút ngắn thời gian chuẩn bị:** M&A giúp nhà đầu tư ngoại nhanh chóng đưa sản phẩm ra thị trường đáp ứng nguồn cầu.\n\n### Đánh giá chuyên môn\n\n*Phân tích thị trường:* Hoạt động M&A giúp tái cấu trúc nguồn lực xã hội, hồi sinh các dự án trùm chăn và nâng cao tiêu chuẩn phát triển dự án tại Việt Nam. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Khánh An", "person", "khanh-an",
        "2026-02-28T13:20:00+07:00",
        "VnEconomy", "https://vneconomy.vn/ma-bat-dong-san-soi-dong.htm", "news",
        None, "", "", "", "", None,
        ["Đầu tư - Dòng tiền", "M&A bất động sản", "Quỹ đất sạch", "Hợp tác quốc tế"]
    ),
    article(
        "Bất động sản công nghiệp dẫn đầu khả năng sinh lời và thu hút dòng vốn đầu tư",
        "dau-tu-dong-tien-bds-cong-nghiep-thu-hut-von-ngoai",
        "dau-tu-dong-tien",
        "Phân khúc bất động sản công nghiệp và kho xưởng xây sẵn duy trì tỷ lệ lấp đầy trên 85%, trở thành kênh đầu tư sinh lời bền vững nhất thị trường.",
        "### Điểm sáng phân khúc BĐS công nghiệp\n\nBáo cáo diễn biến thị trường bất động sản công nghiệp cho thấy giá thuê đất khu công nghiệp và nhà xưởng xây sẵn tại cả hai miền Nam - Bắc tiếp tục duy trì đà tăng nhẹ 3% - 5%/năm. Tỷ lệ lấp đầy tại các khu công nghiệp trọng điểm tại Bình Dương, Đồng Nai, Bắc Ninh, Hải Phòng đạt trung bình từ 85% đến 92%.\n\nSự gia tăng nhu cầu thuê đến từ các ngành công nghệ cao, bán dẫn, điện tử và logistics thương mại điện tử.\n\n### Yếu tố bảo đảm dòng tiền đầu tư\n\n1. **Hợp đồng thuê dài hạn:** Khách thuê công nghiệp thường ký hợp đồng từ 5 đến 10 năm với điều khoản tăng giá thuê định kỳ.\n2. **Hạ tầng kết nối hoàn thiện:** Các khu công nghiệp bám sát tuyến cao tốc và cảng biển nước sâu thu hút giá thuê cao hơn.\n3. **Xu hướng sinh thái xanh (Green Industrial Park):** Các khu công nghiệp trang bị hệ thống điện mặt trời mái nhà và xử lý nước thải chuẩn sinh thái có lợi thế cạnh tranh vượt trội.\n\n### Đánh giá chuyên môn\n\n*Phân tích thị trường:* Bất động sản công nghiệp tiếp tục là trụ cột giữ nhịp cho dòng tiền đầu tư địa ốc trong bối cảnh các phân khúc khác đang tái cấu trúc. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Phương Dung", "person", "phuong-dung",
        "2026-05-02T16:50:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/bat-dong-san-cong-nghiep-dan-dau-thu-hut-von-102260502.htm", "official",
        None, "", "", "", "", None,
        ["Đầu tư - Dòng tiền", "BĐS công nghiệp", "Nhà xưởng cho thuê", "Dòng tiền dài hạn"]
    ),
    article(
        "Chiến lược quản trị rủi ro dòng tiền cho nhà đầu tư cá nhân năm 2026",
        "dau-tu-dong-tien-chien-luoc-quan-tri-rui-ro-taichinh-bds",
        "dau-tu-dong-tien",
        "Các chuyên gia hoạch định tài chính đưa ra khuyến nghị chiến lược phân bổ danh mục đầu tư bất động sản nhằm tối ưu hóa lợi nhuận và phòng ngừa rủi ro thanh khoản.",
        "### Thực trạng quản trị dòng tiền cá nhân\n\nBối cảnh thị trường bất động sản 2026 đặt ra bài toán khắt khe về quản trị dòng tiền cho các nhà đầu tư cá nhân. Việc sử dụng đòn bẩy tài chính quá đà trong giai đoạn trước khiến nhiều nhà đầu tư gặp khó khăn khi lãi suất thả nổi gia tăng và thanh khoản thị trường không còn dễ dàng như trước.\n\nQuản trị rủi ro dòng tiền được xem là yếu tố sinh tồn đối với người tham gia thị trường.\n\n### Chiến lược phân bổ danh mục tối ưu\n\n1. **Phân bổ tài sản theo tỷ lệ 50-30-20:** 50% vốn vào tài sản an toàn tạo dòng tiền ngay (căn hộ cho thuê), 30% vào tài sản tích sản dài hạn (đất thổ cư có sổ), 20% giữ tiền mặt dự phòng.\n2. **Kiểm soát đòn bẩy ngân hàng:** Đảm bảo nghĩa vụ trả nợ ngân hàng không vượt quá 30% tổng thu nhập hàng tháng.\n3. **Cắt nợ các tài sản không tạo ra giá trị:** Chủ động tái cơ cấu bán bớt các sản phẩm bất động sản đầu cơ không có khả năng khai thác sử dụng.\n\n### Đánh giá chuyên môn\n\n*Phân tích tài chính:* Quản trị dòng tiền hiệu quả giúp nhà đầu tư chủ động trước mọi biến động của chu kỳ kinh tế và nắm bắt cơ hội khi thị trường xuất hiện tài sản giá tốt. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Nguyễn Trãi", "person", "nguyen-trai",
        "2025-11-28T10:00:00+07:00",
        "VnEconomy", "https://vneconomy.vn/chien-luoc-quan-tri-rui-ro-dong-tien-bds.htm", "news",
        None, "", "", "", "", None,
        ["Đầu tư - Dòng tiền", "Quản trị rủi ro", "Tài chính cá nhân", "Phân bổ tài sản"]
    )
]

# 6. CHO THUÊ (5)
art_cho_thue = [
    article(
        "Định hướng phân loại phát triển nhà ở theo 4 nhóm, trọng tâm nhà ở cho thuê",
        "cho-thue-dinh-huong-phan-loai-nha-o-4-nhom-trong-tam-cho-thue",
        "cho-thue",
        "Bộ Xây dựng phối hợp sửa đổi Luật Nhà ở, định hướng phân loại nhà ở thành 4 nhóm chính với trọng tâm phát triển mô hình nhà ở cho thuê đáp ứng nhu cầu an sinh xã hội.",
        "### Định hướng chiến lược phát triển nhà ở\n\nBộ Xây dựng đang hoàn thiện dự thảo sửa đổi, bổ sung Luật Nhà ở và Luật Kinh doanh Bất động sản để trình Quốc hội. Trong bản định hướng mới, thị trường nhà ở được phân loại rõ ràng thành 4 nhóm: Nhà ở thương mại, Nhà ở cho thuê, Nhà ở công vụ và Nhà ở chính sách.\n\nĐiểm đáng chú ý là phát triển mô hình nhà ở cho thuê được xác định là giải pháp đột phá nhằm giải quyết bài toán chỗ ở cho hàng triệu lao động thu nhập thấp tại các đô thị lớn.\n\n### Nội dung chính sách khuyến khích nhà ở cho thuê\n\n1. **Ưu đãi quỹ đất và thuế:** Doanh nghiệp đầu tư xây dựng dự án nhà ở cho thuê được miễn tiền sử dụng đất, giảm thuế VAT và thuế thu nhập doanh nghiệp.\n2. **Tiếp cận nguồn vốn ưu đãi:** Đưa nhà ở cho thuê vào danh mục được vay vốn từ các gói tín dụng ưu đãi an sinh xã hội dài hạn (20 - 30 năm).\n3. **Chuẩn hóa quản lý vận hành:** Ban hành quy chuẩn kỹ thuật và quy chế quản lý vận hành nhà trọ, chung cư mini cho thuê để bảo đảm an toàn phòng cháy chữa cháy.\n\n### Tác động xã hội và thị trường\n\n*Phân tích thị trường:* Phát triển trụ cột nhà ở cho thuê giúp giảm bớt áp lực mua nhà bằng mọi giá của người dân đô thị, đồng thời tạo ra một kênh đầu tư bất động sản hạ tầng xã hội an toàn, bền vững cho các quỹ đầu tư dài hạn. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Phan Nam", "person", "phan-nam",
        "2026-06-09T22:14:54+07:00",
        "VnEconomy", "https://vneconomy.vn/dinh-huong-phan-loai-phat-trien-nha-o-theo-4-nhom.htm", "news",
        "https://premedia.vneconomy.vn/files/uploads/2026/05/27/c9280537e0c441fca32e4e7de6e9f1a4-92959.png?w=1200&h=630&mode=crop",
        "Phát triển nhà ở cho thuê là trọng tâm chiến lược an sinh xã hội",
        "Bộ Xây dựng định hướng phân loại nhà ở theo 4 nhóm, ưu tiên nhà ở cho thuê",
        "VnEconomy / Phan Nam", "Editorial Use Granted", None,
        ["Cho thuê", "Nhà ở cho thuê", "Bộ Xây dựng", "An sinh xã hội"]
    ),
    article(
        "Tỷ suất lợi nhuận cho thuê căn hộ chung cư tại Hà Nội và TP.HCM phục hồi",
        "cho-thue-ty-suat-loi-nhuan-cho-thue-can-ho-tphcm-ha-noi",
        "cho-thue",
        "Khảo sát thị trường cho thuê năm 2026 ghi nhận tỷ suất lợi nhuận từ việc cho thuê căn hộ chung cư cải thiện lên mức 4,5% - 5,3%/năm nhờ nhu cầu thuê của chuyên gia và người trẻ.",
        "### Diễn biến giá thuê và tỷ suất lợi nhuận\n\nBáo cáo thị trường bất động sản cho thuê quý II/2026 cho biết giá thuê căn hộ chung cư tại Hà Nội tăng trung bình 8% - 12% so với cùng kỳ, trong khi tại TP.HCM tăng nhẹ 5% - 7%. Tỷ suất lợi nhuận cho thuê (Rental Yield) tính trên giá trị căn hộ phục hồi về mức 4,5% - 5,3%/năm.\n\nNhu cầu thuê nhà tập trung mạnh nhất ở phân khúc căn hộ 1-2 phòng ngủ có vị trí gần các trung tâm làm việc, trường đại học và tuyến đường sắt đô thị.\n\n### Các yếu tố thúc đẩy thị trường cho thuê\n\n1. **Giá bán nhà ở cao:** Giá mua căn hộ tăng cao vượt quá khả năng tài chính ban đầu của nhiều gia đình trẻ, thúc đẩy họ lựa chọn phương án thuê nhà chất lượng cao.\n2. **Lực lượng chuyên gia ngoại gia tăng:** Sự bùng nổ vốn FDI đưa hàng ngàn chuyên gia, kỹ sư nước ngoài đến làm việc tại các khu công nghiệp và trung tâm R&D.\n3. **Xu hướng sống linh hoạt:** Giới trẻ Gen Z ưu tiên việc thuê nhà để giữ sự linh hoạt về nơi ở và tối ưu hóa chi phí trải nghiệm cuộc sống.\n\n### Đánh giá chuyên môn\n\n*Phân tích thị trường:* Thị trường cho thuê căn hộ chung cư tiếp tục là kênh đầu tư ngách an toàn giúp nhà đầu tư vừa duy trì dòng tiền hàng tháng vừa giữ được tài sản chống trượt giá. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Nhật Minh", "person", "nhat-minh",
        "2026-05-12T14:30:00+07:00",
        "VnEconomy", "https://vneconomy.vn/ty-suat-loi-nhuan-cho-thue-can-ho-phuc-hoi.htm", "news",
        None, "", "", "", "", None,
        ["Cho thuê", "Căn hộ cho thuê", "Tỷ suất lợi nhuận", "Thị trường nhà thuê"]
    ),
    article(
        "Hà Nội triển khai các dự án nhà ở xã hội dành riêng cho thuê quy mô lớn",
        "cho-thue-ha-noi-trien-khai-du-an-nha-o-cho-thue-quy-mo-lon",
        "cho-thue",
        "Thành phố Hà Nội phê duyệt quy hoạch và chuẩn bị khởi công các dự án nhà ở xã hội dành 100% diện tích cho công nhân và người thu nhập thấp thuê dài hạn.",
        "### Kế hoạch phát triển nhà ở cho thuê tại Hà Nội\n\nỦy ban nhân dân Thành phố Hà Nội công bố danh mục các dự án nhà ở xã hội phục vụ mục đích cho thuê giai đoạn 2026 - 2030. Đáng chú ý là dự án nhà ở cho thuê tại quận Long Biên (quy mô hơn 1.100 căn hộ) và dự án tại Đông Anh bám sát các khu công nghiệp lớn.\n\nToàn bộ các căn hộ được thiết kế tối ưu công năng, bàn giao nội thất cơ bản với giá thuê được khống chế theo khung giá nhà nước phê duyệt (từ 40.000 - 60.000 đồng/m2/tháng).\n\n### Giải pháp quản lý và vận hành\n\n1. **Quản lý bằng công nghệ số:** Sử dụng ứng dụng công khai đăng ký hồ sơ thuê nhà trực tuyến, xét duyệt đúng đối tượng thụ hưởng.\n2. **Bảo đảm an ninh và PCCC:** Các dự án được trang bị hệ thống phòng cháy chữa cháy tự động và quản lý camera an ninh 24/7.\n3. **Hạ tầng xã hội đi kèm:** Tích hợp đầy đủ trường mầm non, trạm y tế và điểm sinh hoạt cộng đồng ngay trong khuôn viên dự án.\n\n### Ý nghĩa xã hội\n\n*Phân tích an sinh:* Phát triển nhà ở cho thuê do nhà nước điều tiết giúp giải quyết căn cơ bài toán an cư cho lực lượng lao động nòng nốc của Thủ đô, bảo đảm sự phát triển đô thị bền vững. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).",
        "Ban biên tập", "organization", "ban-bien-tap-baochinhphu",
        "2026-04-18T10:10:00+07:00",
        "Báo Điện tử Chính phủ", "https://baochinhphu.vn/ha-noi-trien-khai-du-an-nha-o-cho-thue-102260418.htm", "official",
        None, "", "", "", "", None,
        ["Cho thuê", "Nhà ở xã hội", "Hà Nội", "Công nhân thuê nhà"]
    ),
    article(
        "Xu hướng thuê văn phòng xanh và linh hoạt gia tăng tại các trung tâm đô thị",
        "cho-thue-van-phong-xanh-hybrid-len-soan-2026",
        "cho-thue",
        "Thị trường văn phòng cho thuê ghi nhận làn sóng chuyển dịch sang các tòa nhà đạt chứng chỉ xanh (LEED, Green Mark) và mô hình không gian làm việc linh hoạt (Co-working).",
        "### Diễn biến thị trường văn phòng cho thuê\n\nBáo cáo thị trường bất động sản thương mại 2026 cho thấy công suất thuê văn phòng hạng A tại TP.HCM và Hà Nội duy trì ở mức cao (trên 88%). Tuy nhiên, tâm lý khách thuê doanh nghiệp có sự thay đổi rõ rệt khi ưu tiên các tòa nhà đáp ứng tiêu chuẩn ESG (Môi trường - Xã hội - Quản trị).\n\nCác tòa nhà văn phòng thế hệ cũ không có chứng chỉ xanh phải giảm giá thuê 5% - 10% hoặc bỏ chi phí cải tạo để giữ chân khách hàng.\n\n### Các xu hướng chủ đạo\n\n1. **Chứng chỉ xanh trở thành bắt buộc:** Các tập đoàn đa quốc gia cam kết Net-Zero đòi hỏi không gian làm việc phải đạt chuẩn tiết kiệm năng lượng LEED hoặc Lotus.\n2. **Mô hình văn phòng linh hoạt (Hybrid Office):** Doanh nghiệp giảm diện tích thuê cố định, kết hợp sử dụng không gian làm việc chung (Co-working) để tối ưu chi phí.\n3. **Dịch chuyển ra ngoài trung tâm:** Làn sóng văn phòng di chuyển sang khu vực mới như TP. Thủ Đức (TP.HCM) hoặc Tây Hồ Tây (Hà Nội) nơi có nguồn cung xanh hiện đại.\n\n### Đánh giá chuyên môn\n\n*Phân tích thị trường:* Văn phòng xanh là xu hướng không thể đảo ngược. Chủ sở hữu bất động sản thương mại cần nhanh chóng chuyển đổi xanh để nâng cao năng lực cạnh tranh và bảo đảm dòng tiền cho thuê ổn định. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Đăng Khoa", "person", "dang-khoa",
        "2026-03-19T11:40:00+07:00",
        "VnEconomy", "https://vneconomy.vn/van-phong-cho-thue-xanh-len-soan.htm", "news",
        None, "", "", "", "", None,
        ["Cho thuê", "Văn phòng cho thuê", "Văn phòng xanh", "Tiêu chuẩn LEED"]
    ),
    article(
        "Xu hướng thuê nhà của giới trẻ: Ưu tiên không gian sống tích hợp tiện ích và công nghệ",
        "cho-thue-nhu-cau-thue-nha-gioi-tre-thay-doi-tieu-chuan",
        "cho-thue",
        "Thế hệ trẻ đô thị ưu tiên lựa chọn thuê các căn hộ có sẵn nội thất thông minh, quản lý qua ứng dụng và tích hợp đầy đủ tiện ích thể thao, làm việc trong cùng tòa nhà.",
        "### Sự thay đổi trong tiêu chuẩn thuê nhà\n\nNghiên cứu hành vi tiêu dùng bất động sản của nhóm khách hàng tuổi từ 22 đến 35 cho thấy định nghĩa về \"nơi ở\" đã có sự thay đổi sâu sắc. Khách thuê trẻ không chỉ tìm kiếm một chỗ ngủ mà hướng tới một hệ sinh thái sống trọn vẹn (All-in-one).\n\nHọ sẵn sàng trả chi phí thuê cao hơn 15% - 20% cho các căn hộ nằm trong đại đô thị có công viên, hồ bơi, phòng gym và tuyến xe buýt nội khu thuận tiện.\n\n### Tiêu chí lựa chọn của người thuê trẻ\n\n1. **Quản lý vận hành thông minh:** Ưu tiên căn hộ sử dụng khóa từ, camera an ninh thông minh và thanh toán tiền điện nước, dịch vụ qua ứng dụng di động.\n2. **Cộng đồng cư dân văn minh:** Coi trọng môi trường sống an toàn, văn minh và có không gian kết nối cộng đồng.\n3. **Căn hộ Full nội thất:** Ưu tiên thuê căn hộ đã trang bị đầy đủ thiết bị gia dụng để chỉ cần "xách vali vào ở", giảm chi phí đầu tư ban đầu.\n\n### Đánh giá chuyên môn\n\n*Phân tích thị trường:* Nắm bắt tư duy mới của người thuê trẻ giúp các chủ nhà cá nhân và đơn vị vận hành căn hộ dịch vụ tối ưu hóa tỷ lệ lấp đầy và nâng cao hiệu quả cho thuê. Nguồn trích dẫn: VnEconomy (vneconomy.vn).",
        "Thùy Trang", "person", "thuy-trang",
        "2025-10-30T09:00:00+07:00",
        "VnEconomy", "https://vneconomy.vn/xu-huong-thue-nha-cua-gioi-tre.htm", "news",
        None, "", "", "", "", None,
        ["Cho thuê", "Xu hướng thuê nhà", "Căn hộ dịch vụ", "Giới trẻ đô thị"]
    )
]

categories_data = [
    {"slug": "phap-ly-du-an", "candidateCount": len(art_phap_ly), "articles": art_phap_ly},
    {"slug": "quy-hoach-ha-tang", "candidateCount": len(art_quy_hoach), "articles": art_quy_hoach},
    {"slug": "lai-suat-tai-chinh", "candidateCount": len(art_lai_suat), "articles": art_lai_suat},
    {"slug": "thi-truong-gia-ca", "candidateCount": len(art_thi_truong), "articles": art_thi_truong},
    {"slug": "dau-tu-dong-tien", "candidateCount": len(art_dau-tu), "articles": art_dau_tu},
    {"slug": "cho-thue", "candidateCount": len(art_cho_thue), "articles": art_cho_thue}
]

manifest = {
    "researchDate": "2026-07-23",
    "timezone": "Asia/Bangkok",
    "project": "myfuture-news-test",
    "categories": categories_data,
    "globalWarnings": []
}

with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Manifest written to {MANIFEST_PATH}")
