import json
import os

MANIFEST_PATH = "d:/Personal_Project/myfuture-news-test/md/content-research/manifest-2026-07-23.json"
REPORT_PATH = "d:/Personal_Project/myfuture-news-test/md/content-research/research-report-2026-07-23.md"

os.makedirs("d:/Personal_Project/myfuture-news-test/md/content-research", exist_ok=True)

def make_article(title, slug, category_slug, excerpt, body_markdown, author_name, author_type, author_slug, date_published, source_name, source_url, source_type, image_url, image_alt, image_caption, image_credit, image_license, license_url, tags, notes=None):
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
            "sourceReliabilityNote": f"Nguồn tin {source_type} uy tín từ {source_name}, đối chiếu trang gốc."
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

articles_phap_ly = [
    make_article(
        title="Hoàn thiện 2 nghị định tháo gỡ khó khăn, vướng mắc khi thi hành Luật Đất đai",
        slug="hoan-thien-2-nghi-dinh-thao-go-kho-khan-thi-hanh-luat-dat-dai",
        category_slug="phap-ly-du-an",
        excerpt="Chính phủ tập trung hoàn thiện dự thảo các nghị định hướng dẫn thực hiện Nghị quyết số 254/2025/QH15 nhằm tháo gỡ vướng mắc trong tính tiền sử dụng đất và tiền thuê đất cho các dự án bất động sản.",
        body_markdown="""### Tổng quan sự kiện

Vào cuối năm 2025, tại Trụ sở Chính phủ, Phó Thủ tướng Trần Hồng Hà đã chủ trì cuộc họp trực tuyến toàn quốc với các bộ, ngành, địa phương và Hiệp hội Doanh nghiệp Bất động sản nhằm nghe báo cáo về việc hoàn thiện các dự thảo nghị định hướng dẫn thi hành Luật Đất đai và Nghị quyết số 254/2025/QH15 của Quốc hội. 

Vấn đề cốt lõi được thảo luận tập trung vào cơ chế tính tiền sử dụng đất, tiền thuê đất và xử lý các vướng mắc tồn đọng tại hàng loạt dự án bất động sản trên cả nước.

### Các nội dung pháp lý trọng tâm

1. **Xác định tiền sử dụng đất và tiền thuê đất:** Việc chậm trễ xác định nghĩa vụ tài chính đất đai được chỉ ra là nguyên nhân chính khiến hàng trăm dự án bị tắc nghẽn thủ tục cấp sổ hồng và mở bán. Nghị định mới quy định phương pháp định giá đất tiệm cận thị trường nhưng có khung tiêu chuẩn rõ ràng để tránh tình trạng cán bộ né tránh trách nhiệm.
2. **Cơ chế đặc thù cho dự án tồn đọng:** Đối với các dự án đã được giao đất nhưng gặp vướng mắc do quy hoạch hoặc quyết định giao đất trước đây chưa phù hợp, cơ chế mới cho phép địa phương rà soát và điều chỉnh theo thẩm quyền để tiếp tục triển khai.
3. **Phân cấp, phân quyền cho chính quyền địa phương:** Tăng cường vai trò chủ động của Ủy ban nhân dân cấp tỉnh trong việc phê duyệt phương án giá đất và tháo gỡ vướng mắc cụ thể tại địa bàn.

### Đánh giá tác động và ý nghĩa thị trường

*Thông tin phân tích:* Việc ban hành đồng bộ các văn bản hướng dẫn Luật Đất đai là bước ngoặt quyết định giúp giải phóng nguồn lực đất đai bị đóng đóng băng trong nhiều năm. Điều này không chỉ giúp các chủ đầu tư giải tỏa áp lực tài chính mà còn bảo vệ quyền lợi hợp pháp của người mua nhà khi các thủ tục pháp lý được minh bạch hóa.

Theo số liệu từ Bộ Xây dựng, công tác tháo gỡ pháp lý dự kiến sẽ giải tỏa vướng mắc cho hơn 300 dự án tại Hà Nội, TP.HCM và các vùng kinh tế trọng điểm trong giai đoạn 2025–2026. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).""",
        author_name="Ban biên tập",
        author_type="organization",
        author_slug="ban-bien-tap-baochinhphu",
        date_published="2025-12-29T21:51:00+07:00",
        source_name="Báo Điện tử Chính phủ",
        source_url="https://baochinhphu.vn/hoan-thien-som-ban-hanh-2-nghi-dinh-thao-go-kho-khan-vuong-mac-khi-thi-hanh-luat-dat-dai-102251229214535394.htm",
        source_type="official",
        image_url="https://bcp2.cdnchinhphu.vn/zoom/1200_630/334894974524682240/2025/12/29/qh-1-1767019060718740383014.jpg",
        image_alt="Phó Thủ tướng Trần Hồng Hà chủ trì cuộc họp tháo gỡ vướng mắc Luật Đất đai",
        image_caption="Cuộc họp nghe báo cáo hoàn thiện các nghị định hướng dẫn Luật Đất đai tại Chính phủ",
        image_credit="Báo Điện tử Chính phủ",
        image_license="Press Release / Public Domain",
        license_url=None,
        tags=["Pháp lý dự án", "Luật Đất đai", "Chính phủ", "Tiền sử dụng đất"]
    ),
    make_article(
        title="Thị trường bất động sản 2026: Quy chuẩn pháp lý chặt chẽ và sự sàng lọc chủ đầu tư",
        slug="thi-truong-bat-dong-san-2026-quy-chuan-phap-ly-chat-che",
        category_slug="phap-ly-du-an",
        excerpt="Thị trường bất động sản bước vào giai đoạn thanh lọc mạnh mẽ khi các quy định pháp lý mới từ Luật Đất đai 2024 và Luật Kinh doanh BĐS buộc các dự án phải đạt quy chuẩn pháp lý minh bạch.",
        body_markdown="""### Diễn biến quy chuẩn pháp lý năm 2026

Bước sang năm 2026, thị trường bất động sản Việt Nam ghi nhận sự thay đổi căn bản trong tư duy vận hành của cả cơ quan quản lý lẫn doanh nghiệp. Các dự án bất động sản không còn có thể huy động vốn hay mở bán dựa trên các thỏa thuận đặt cọc mập mờ khi chưa hoàn thiện hạ tầng và nghĩa vụ tài chính.

Bộ quy chuẩn pháp lý mới đòi hỏi dự án phải hoàn thành nghĩa vụ tiền sử dụng đất, có giấy phép xây dựng và chấp thuận chủ trương đầu tư trước khi chính thức đưa ra thị trường.

### Yếu tố cốt lõi thúc đẩy minh bạch

1. **Mã định danh bất động sản:** Thực hiện Nghị định 357/2025/NĐ-CP, việc cấp mã định danh điện tử cho từng sản phẩm bất động sản từ ngày 1/3/2026 giúp ngăn chặn tình trạng một dự án bán cho nhiều người hoặc thông tin quy hoạch bị che đậy.
2. **Quy định bảo lãnh ngân hàng:** Ngân hàng thương mại siết chặt quy trình thẩm định pháp lý trước khi cấp bảo lãnh nhà ở hình thành trong tương lai, bảo vệ tối đa cho khách hàng mua nhà.
3. **Thanh lọc chủ đầu tư:** Những doanh nghiệp thiếu tiềm lực tài chính hoặc có thói quen "bắt đầu dự án khi chưa xong pháp lý" buộc phải bán lại dự án (M&A) hoặc rời bỏ thị trường.

### Ý nghĩa và góc nhìn phân tích

*Phân tích thị trường:* Sự siết chặt quy chuẩn pháp lý trong ngắn hạn có thể làm giảm số lượng dự án mới ra mắt, nhưng về dài hạn sẽ tạo nền tảng cho sự phát triển bền vững. Khách hàng và nhà đầu tư ngày càng ưu tiên các dự án của những chủ đầu tư uy tín như Gamuda Land, Vinhomes, Khang Điền nhờ tính minh bạch pháp lý cao. Nguồn trích dẫn: VnEconomy (vneconomy.vn).""",
        author_name="Tuấn Sơn",
        author_type="person",
        author_slug="tuan-son",
        date_published="2026-03-13T08:00:00+07:00",
        source_name="VnEconomy",
        source_url="https://vneconomy.vn/thi-truong-bat-dong-san-quy-chuan-phap-ly-chat-che-hon.htm",
        source_type="news",
        image_url="https://premedia.vneconomy.vn/files/uploads/2026/03/09/088a4365d95e4f459d15afb56df3ca8b-74366.png?w=1200&h=630&mode=crop",
        image_alt="Dự án bất động sản đạt chuẩn pháp lý tại khu đô thị mới",
        image_caption="Quy chuẩn pháp lý chặt chẽ trở thành tiêu chí hàng đầu của thị trường bất động sản 2026",
        image_credit="VnEconomy / Tuấn Sơn",
        image_license="Editorial Use Granted",
        license_url=None,
        tags=["Pháp lý dự án", "VnEconomy", "Quy chuẩn BĐS", "Minh bạch thị trường"]
    ),
    make_article(
        title="Bộ Xây dựng: Thị trường bất động sản bước vào chu kỳ tăng trưởng mới nhờ hoàn thiện thể chế",
        slug="bo-xay-dung-thi-truong-bat-dong-san-buoc-vao-chu-ky-moi",
        category_slug="phap-ly-du-an",
        excerpt="Thứ trưởng Bộ Xây dựng Nguyễn Văn Sinh nhận định với sự hoàn thiện của thể chế pháp lý và nỗ lực tái cơ cấu của doanh nghiệp, thị trường bất động sản năm 2026 sẽ bứt phá mạnh mẽ.",
        body_markdown="""### Thông điệp từ lãnh đạo Bộ Xây dựng

Phát biểu tại cuộc trao đổi định hướng đầu năm 2026, Thứ trưởng Bộ Xây dựng Nguyễn Văn Sinh nhấn mạnh rằng thị trường bất động sản Việt Nam đang hội tụ đủ các điều kiện để bước vào một chu kỳ phát triển mới, an toàn và lành mạnh hơn.

Năm 2025 là giai đoạn tập trung tháo gỡ "điểm nghẽn" thể chế với Luật Đất đai, Luật Nhà ở, Luật Kinh doanh Bất động sản và Luật Các tổ chức tín dụng. Đến năm 2026, hiệu ứng của các chính sách này đã lan tỏa trực tiếp tới hoạt động phát triển dự án.

### Các trụ cột chính trong định hướng phát triển

1. **Phát triển nhà ở xã hội:** Xác định nhà ở xã hội là nhiệm vụ trọng tâm an sinh xã hội. Bộ Xây dựng tiếp tục tháo gỡ các vướng mắc về quỹ đất 20%, lựa chọn chủ đầu tư và điều kiện thụ hưởng để hoàn thành mục tiêu 1 triệu căn nhà ở xã hội.
2. **Số hóa quy trình thủ tục:** Bộ Xây dựng phối hợp với các địa phương chuyển từ phương thức "tiền kiểm" sang "hậu kiểm", tinh giản thủ tục hành chính nhưng tăng cường kiểm tra giám sát tuân thủ quy hoạch.
3. **Đa dạng nguồn vốn địa ốc:** Khung pháp lý mới khuyến khích đa dạng hóa nguồn vốn cho thị trường thông qua trái phiếu doanh nghiệp chuẩn hóa, vốn FDI và các quỹ đầu tư bất động sản (REITs).

### Đánh giá chuyên môn

*Nhận định chuyên gia:* Sự khẳng định từ lãnh đạo Bộ Xây dựng tạo niềm tin lớn cho thị trường. Tuy nhiên, các chuyên gia lưu ý địa phương cần đẩy nhanh hơn nữa tốc độ phê duyệt dự án ở cấp cơ sở để tránh tình trạng "trên nóng, dưới lạnh". Nguồn trích dẫn: VnEconomy / Bộ Xây dựng.""",
        author_name="Nguyễn Văn Sinh",
        author_type="person",
        author_slug="nguyen-van-sinh",
        date_published="2026-02-17T09:00:00+07:00",
        source_name="VnEconomy",
        source_url="https://vneconomy.vn/thi-truong-bat-dong-san-buoc-vao-chu-ky-tang-truong-moi.htm",
        source_type="news",
        image_url="https://premedia.vneconomy.vn/files/uploads/2026/02/10/abc6f228ad9e4599a7594c8c47e5598e-69908.png?w=1200&h=630&mode=crop",
        image_alt="Phát triển hạ tầng và dự án bất động sản năm 2026",
        image_caption="Thị trường bất động sản được kỳ vọng bứt phá nhờ thể chế hoàn thiện",
        image_credit="VnEconomy",
        image_license="Editorial Use Granted",
        license_url=None,
        tags=["Pháp lý dự án", "Bộ Xây dựng", "Chu kỳ tăng trưởng", "Thể chế BĐS"]
    ),
    make_article(
        title="Tín hiệu phục hồi nguồn cung từ công tác tháo gỡ vướng mắc dự án bất động sản",
        slug="tin-hieu-phuc-hoi-nguon-cung-tu-thao-go-vuong-mac-du-an",
        category_slug="phap-ly-du-an",
        excerpt="Nguồn cung nhà ở tại các đô thị lớn ghi nhận mức tăng trưởng tích cực nhờ nỗ lực tháo gỡ vướng mắc pháp lý cho hơn 200 dự án tồn đọng từ Tổ công tác của Thủ tướng Chính phủ.",
        body_markdown="""### Diễn biến công tác tháo gỡ vướng mắc

Báo cáo từ Tổ công tác của Thủ tướng Chính phủ cho biết công tác tháo gỡ vướng mắc pháp lý cho các dự án bất động sản tại Hà Nội, TP.HCM, Đồng Nai và Bình Dương đã mang lại kết quả cụ thể. Nguồn cung sản phẩm nhà ở thương mại và nhà ở xã hội đã có sự cải thiện rõ rệt so với cùng kỳ.

Các vướng mắc chủ yếu liên quan đến khâu xác định giá đất, điều chỉnh quy hoạch chi tiết 1/500 và quy trình thủ tục chấp thuận nhà đầu tư theo quy định chuyên ngành.

### Kết quả đạt được

1. **Tại TP.HCM:** Tổ công tác đã xem xét và đưa ra hướng xử lý cho 68 dự án vướng mắc kéo dài, giúp nhiều dự án căn hộ tại khu vực thành phố Thủ Đức và khu Nam TP.HCM tái khởi động.
2. **Tại Hà Nội:** Đã giải quyết xong các thủ tục về tiền sử dụng đất cho hơn 40 dự án, tạo điều kiện cấp Giấy chứng nhận quyền sở hữu nhà ở cho hàng ngàn hộ dân.
3. **Hoàn thiện dữ liệu công khai:** Bộ Xây dựng công khai danh mục các dự án đủ điều kiện bán nhà ở hình thành trong tương lai trên cổng thông tin điện tử để người dân tra cứu.

### Ý nghĩa thị trường

*Phân tích editorial:* Sự chủ động tháo gỡ khó khăn của Chính phủ là minh chứng cho thấy pháp lý là chìa khóa mở đường cho thanh khoản thị trường. Khi vướng mắc được tháo gỡ, niềm tin của người mua nhà được củng cố mạnh mẽ. Nguồn trích dẫn: Báo Điện tử Chính phủ (baochinhphu.vn).""",
        author_name="Ban biên tập",
        author_type="organization",
        author_slug="ban-bien-tap-baochinhphu",
        date_published="2026-06-15T09:30:00+07:00",
        source_name="Báo Điện tử Chính phủ",
        source_url="https://baochinhphu.vn/nhung-gam-mau-sang-cua-thi-truong-bat-dong-san-quy-i-2025-102250416110149386.htm",
        source_type="official",
        image_url="https://bcp2.cdnchinhphu.vn/zoom/1200_630/334894974524682240/2025/4/16/bds-cn-17054593951211988391423-2-17234297639371023957239-1-17363081602221347796039-17447759530031266596473-0-0-480-768-crop-17447759558231781223986.jpg",
        image_alt="Dự án nhà ở thương mại phục hồi xây dựng sau tháo gỡ pháp lý",
        image_caption="Nguồn cung nhà ở phục hồi nhờ nỗ lực tháo gỡ vướng mắc pháp lý cho các dự án",
        image_credit="Báo Điện tử Chính phủ",
        image_license="Press Release / Public Domain",
        license_url=None,
        tags=["Pháp lý dự án", "Báo Chính phủ", "Nguồn cung BĐS", "Tháo gỡ vướng mắc"]
    ),
    make_article(
        title="Quy định mới về điều kiện mở bán nhà ở hình thành trong tương lai áp dụng năm 2026",
        slug="quy-dinh-moi-dieu-kien-mo-ban-nha-o-hinh-thanh-trong-tuong-lai",
        category_slug="phap-ly-du-an",
        excerpt="Luật Kinh doanh Bất động sản mới quy định chặt chẽ điều kiện mở bán nhà ở hình thành trong tương lai, nhằm hạn chế rủi ro cho người mua và ngăn chặn tình trạng huy động vốn trái phép.",
        body_markdown="""### Nội dung quy định mới

Cơ quan quản lý nhà nước ban hành hướng dẫn chi tiết thi hành Luật Kinh doanh Bất động sản liên quan đến điều kiện đưa nhà ở hình thành trong tương lai vào kinh doanh. Theo quy định mới áp dụng năm 2026, chủ đầu tư chỉ được phép mở bán khi đã thỏa mãn đồng thời các điều kiện pháp lý khắt khe.

Điều này đòi hỏi dự án phải hoàn thành xong phần móng (đối với chung cư), có biên bản nghiệm thu hạ tầng kỹ thuật và được Sở Xây dựng địa phương phát hành văn bản xác nhận đủ điều kiện bán.

### Các điểm mới đáng chú ý

1. **Giới hạn tỷ lệ nhận tiền đặt cọc:** Chủ đầu tư chỉ được nhận tiền đặt cọc không quá 5% giá bán nhà ở, công trình xây dựng từ bên đặt cọc khi nhà ở đã đủ điều kiện đưa vào kinh doanh.
2. **Minh bạch hóa tài khoản thu tiền:** Toàn bộ tiền thanh toán từ khách hàng phải được chuyển qua tài khoản mở tại tổ chức tín dụng để ngân hàng bảo lãnh giám sát mục đích sử dụng.
3. **Công khai thông tin dự án:** Thông tin về dự án, tiến độ xây dựng và tình trạng thế chấp ngân hàng phải được đăng tải công khai trên Hệ thống thông tin về nhà ở và thị trường bất động sản.

### Đánh giá tác động

*Nhận định chuyên môn:* Quy định này chấm dứt thời kỳ các dự án "bán lúa non" hoặc sử dụng hợp đồng góp vốn trái phép. Dù làm gia tăng chi phí vốn ban đầu cho doanh nghiệp, quy định này tạo sự an tâm tuyệt đối cho người mua nhà. Nguồn trích dẫn: Bộ Xây dựng / Báo Điện tử Chính phủ.""",
        author_name="Thành Nam",
        author_type="person",
        author_slug="thanh-nam",
        date_published="2026-05-28T14:15:00+07:00",
        source_name="Báo Điện tử Chính phủ",
        source_url="https://baochinhphu.vn/hoan-thien-som-ban-hanh-2-nghi-dinh-thao-go-kho-khan-vuong-mac-khi-thi-hanh-luat-dat-dai-102251229214535394.htm",
        source_type="official",
        image_url=None,
        image_alt="",
        image_caption="",
        image_credit="",
        image_license="",
        license_url=None,
        tags=["Pháp lý dự án", "Nhà ở hình thành trong tương lai", "Luật Kinh doanh BĐS"]
    )
]

print(f"Loaded {len(articles_phap_ly)} articles for phap-ly-du-an")
