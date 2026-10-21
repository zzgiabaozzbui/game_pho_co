export type Lang = "vi" | "en";

export interface LandingData {
  nav: {
    brand: string;
    brandSub: string;
    intro: string;
    gameplay: string;
    world: string;
    features: string;
    showcase: string;
    cta: string;
    switchLang: string;
  };
  hero: {
    eyebrow: string;
    headlinePart1: string;
    headlinePart2: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    badgeLive: string;
    interactiveNotice: string;
  };
  metrics: {
    stations: { value: string; label: string };
    vision: { value: string; label: string };
    tiers: { value: string; label: string };
    cost: { value: string; label: string };
  };
  intro: {
    eyebrow: string;
    title: string;
    description: string;
    pillars: Array<{
      tag: string;
      title: string;
      description: string;
    }>;
  };
  gameplay: {
    title: string;
    subtitle: string;
    steps: Array<{
      stepNumber: string;
      title: string;
      description: string;
      accent: string;
    }>;
  };
  world: {
    quote: string;
    subquote: string;
    description: string;
    guilds: Array<{
      name: string;
      century: string;
      description: string;
    }>;
  };
  features: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
      tag: string;
    }>;
  };
  showcase: {
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      caption: string;
      tag: string;
    }>;
  };
  cta: {
    headline: string;
    description: string;
    button: string;
    subtext: string;
  };
  footer: {
    brand: string;
    tagline: string;
    copyright: string;
    heritageAttribution: string;
    linksTitle: string;
    links: Array<{ label: string; href: string }>;
    backToTop: string;
  };
}

export const landingContent: Record<Lang, LandingData> = {
  vi: {
    nav: {
      brand: "PHỐ CỔ 36",
      brandSub: "TRUY TÌM KHO BÁU",
      intro: "Giới thiệu",
      gameplay: "Cách chơi",
      world: "Kinh thành",
      features: "Điểm nổi bật",
      showcase: "Trưng bày",
      cta: "Bắt đầu chơi",
      switchLang: "English",
    },
    hero: {
      eyebrow: "HÀ NỘI · 36 PHỐ PHƯỜNG",
      headlinePart1: "36 Phố Phường.",
      headlinePart2: "Một Huyền Thoại.",
      description:
        "Hành trình thực cảnh kết hợp nhận diện thị giác, câu đố di tích và rương bảo vật 3D trong không gian sống của Hà Nội.",
      primaryCta: "Bắt đầu khám phá",
      secondaryCta: "Xem trải nghiệm",
      badgeLive: "Khám phá mở · Không giới hạn thứ tự",
      interactiveNotice: "Xoay hoặc chạm để tương tác rương 3D",
    },
    metrics: {
      stations: { value: "36", label: "Phố di sản tự do khám phá" },
      vision: { value: "100%", label: "Nhận diện di tích qua ống kính" },
      tiers: { value: "04", label: "Phẩm cấp rương báu văn hóa" },
      cost: { value: "0đ", label: "Mở trực tiếp trên di động" },
    },
    intro: {
      eyebrow: "BẢN ĐỒ SỐNG CỦA KINH THÀNH",
      title: "Không phải brochure du lịch. Đây là một cuộc phiêu lưu thực cảnh.",
      description:
        "Mỗi bước chân qua ngõ nhỏ Hà Nội là một lần chạm vào ký ức trăm năm. Trò chơi biến 36 phố phường thành một không gian truy tìm kho báu thực địa, nơi kiến trúc cổ và giai thoại lịch sử trở thành chìa khóa mở ra phần thưởng.",
      pillars: [
        {
          tag: "01 · Tự Do",
          title: "36 Phố Phường Nghề",
          description:
            "Không khóa tuyến, không lộ trình ép buộc. Bạn bắt đầu ở bất kỳ con phố nào mình muốn.",
        },
        {
          tag: "02 · Thị Giác",
          title: "Ống Kính Thay Vì GPS",
          description:
            "Xác nhận trạm bằng ảnh chụp biển phố hoặc kiến trúc đặc trưng, mang lại cảm giác thám tử thực thụ.",
        },
        {
          tag: "03 · Đích Thực",
          title: "Kho Báu Đích Thực",
          description:
            "Hành trình dẫn tới xưởng thủ công đối tác tại trung tâm phố cổ với trải nghiệm văn hóa độc quyền.",
        },
      ],
    },
    gameplay: {
      title: "Hành trình thám hiểm 4 bước",
      subtitle: "Từ góc phố rêu phong đến bảo vật tương tác không gian thực.",
      steps: [
        {
          stepNumber: "01",
          title: "Chọn Phố Khám Phá",
          description:
            "Mở bản đồ phố cổ tương tác, định vị các trạm di sản xung quanh và lên lộ trình theo nhịp đi bộ của riêng bạn.",
          accent: "var(--color-ink-strong)",
        },
        {
          stepNumber: "02",
          title: "Xác Nhận Qua Ống Kính",
          description:
            "Đến đúng địa điểm, hướng camera về phía biển tên đường hoặc tòa nhà cổ để mở khóa câu đố của trạm.",
          accent: "var(--color-son)",
        },
        {
          stepNumber: "03",
          title: "Giải Mã Điển Tích",
          description:
            "Mỗi câu hỏi được chắt lọc từ gia phả phường nghề và biên niên sử Thăng Long, hé lộ bí mật nghề truyền thống.",
          accent: "var(--color-gold)",
        },
        {
          stepNumber: "04",
          title: "Mở Rương 3D & AR",
          description:
            "Nhận rương bảo vật theo từng phẩm cấp (Gỗ, Đồng, Sơn Son, Ngọc Bích) và chiếu rương vào không gian thực qua AR.",
          accent: "var(--color-jade)",
        },
      ],
    },
    world: {
      quote: "Ba mươi sáu chốn phồn hoa, ngàn năm trầm tích lắng đọng trong từng thớ gỗ, mạch vôi.",
      subquote: "Hà Nội không chỉ để ngắm nhìn. Hà Nội chờ được giải mã.",
      description:
        "Trải qua bao biến thiên lịch sử, khu phố cổ vẫn bảo tồn cấu trúc phường hội độc nhất Đông Nam Á. Mỗi con phố mang tên một mặt hàng thủ công: bạc thoi Hàng Bạc, đèn lồng Hàng Mã, tơ lụa Hàng Gai, và thành lũy Ô Quan Chưởng kiên trung. Đặt chân vào trò chơi là bước vào một bảo tàng mở sống động.",
      guilds: [
        {
          name: "Phố Hàng Bạc",
          century: "Thế kỷ XV",
          description: "Hội Kim Ngân đúc bạc nén tiến triều dưới thời vua Lê Thánh Tông.",
        },
        {
          name: "Phố Hàng Mã",
          century: "Thế kỷ XVII",
          description: "Thế giới giấy bồi lung linh, sắc màu nghi lễ và ký ức Trung thu kinh kỳ.",
        },
        {
          name: "Phố Hàng Gai",
          century: "Thế kỷ XVI",
          description: "Cái nôi tơ lụa kinh kỳ, nơi hội tụ những nghệ nhân dệt gấm thêu hoa đất Bắc.",
        },
        {
          name: "Cửa Ô Quan Chưởng",
          century: "Năm 1749",
          description: "Cửa ô duy nhất còn vẹn nguyên của thành Thăng Long, chứng nhân bảo vệ kinh thành.",
        },
      ],
    },
    features: {
      title: "Chế tác chuẩn mực cho trải nghiệm thực địa",
      subtitle: "Công nghệ tiên tiến phục vụ chiều sâu di sản, vận hành mượt mà trên mọi thiết bị.",
      items: [
        {
          tag: "PWA Native",
          title: "Không Cần Tải App",
          description:
            "Chạy trực tiếp trên Safari và Chrome. Khởi động tức thì, hoạt động cả khi mạng chập chờn.",
        },
        {
          tag: "Không Gian Ba Chiều",
          title: "WebXR & iOS Quick Look",
          description:
            "Mô hình 3D rương báu chế tác tinh xảo, hỗ trợ đặt trực tiếp lên mặt bàn qua công nghệ thực tế tăng cường.",
        },
        {
          tag: "Lịch Sử Chuẩn Xác",
          title: "Sử Ký Giám Định",
          description:
            "36 câu chuyện và thử thách được biên soạn công phu từ nguồn tư liệu di tích và gia phả nghệ nhân.",
        },
        {
          tag: "Bảo Vệ Thiết Bị",
          title: "Không Chạy GPS Ngầm",
          description:
            "Cơ chế check-in bằng ảnh giúp tiết kiệm tối đa pin điện thoại, đồng hành cùng bạn suốt cả ngày dài dạo phố.",
        },
        {
          tag: "Đối Tác Thật",
          title: "Phần Thưởng Thực Tế",
          description:
            "Tích lũy điểm để nhận mã quà tặng và trải nghiệm độc quyền tại các workshop thủ công phố cổ.",
        },
        {
          tag: "Toàn Cầu Hóa",
          title: "Song Ngữ Toàn Diện",
          description:
            "Giao diện và cốt truyện chuyển đổi tức thì giữa Tiếng Việt và Tiếng Anh cho mọi du khách quốc tế.",
        },
      ],
    },
    showcase: {
      title: "Giao diện tinh giản, đậm hồn văn hóa",
      subtitle: "Kết hợp giữa sổ tay thám hiểm bìa da và công nghệ tương tác hiện đại.",
      cards: [
        {
          title: "Bản Đồ Tuyến Phố Cổ",
          caption: "Toàn cảnh 36 điểm di sản với chỉ dẫn khoảng cách và tọa độ tâm trạm.",
          tag: "Navigation",
        },
        {
          title: "Ống Kính Check-in Di Tích",
          caption: "Xác thực tức thì bằng ảnh chụp góc nhìn mặt tiền hoặc biển phố cổ kính.",
          tag: "Vision AI",
        },
        {
          title: "Câu Đố & Manh Mối",
          caption: "Hệ thống câu hỏi thử thách sự sắc sảo kèm gợi ý dẫn đường sang phố tiếp theo.",
          tag: "Riddle Engine",
        },
        {
          title: "Rương Báu Ba Chiều",
          caption: "Nghi thức mở rương với hiệu ứng âm thanh và khám phá hiện vật cổ xưa.",
          tag: "3D Relic",
        },
      ],
    },
    cta: {
      headline: "Sẵn sàng vén màn bí mật 36 phố phường?",
      description:
        "Hãy xỏ giày, sạc đầy pin điện thoại và bước ra phố. Kho báu văn hóa nghìn năm đang chờ bạn mở lối.",
      button: "Bắt đầu khám phá",
      subtext: "Hoàn toàn miễn phí · Không cần đăng ký tài khoản",
    },
    footer: {
      brand: "PHỐ CỔ 36",
      tagline: "Hành trình truy tìm kho báu qua 36 phố phường Hà Nội",
      copyright: "© 2026 Phố Cổ 36. Bảo lưu mọi quyền.",
      heritageAttribution: "Dự án số hóa và trải nghiệm di sản văn hóa Thăng Long — Hà Nội.",
      linksTitle: "Điều hướng",
      links: [
        { label: "Bắt đầu chơi", href: "/play" },
        { label: "Bản đồ tuyến", href: "/huong-dan" },
        { label: "Xưởng đối tác", href: "/partner" },
        { label: "Quản trị di tích", href: "/admin" },
      ],
      backToTop: "Về đầu trang",
    },
  },
  en: {
    nav: {
      brand: "OLD QUARTER 36",
      brandSub: "TREASURE HUNT",
      intro: "Overview",
      gameplay: "How to Play",
      world: "The Realm",
      features: "Highlights",
      showcase: "Showcase",
      cta: "Launch Game",
      switchLang: "Tiếng Việt",
    },
    hero: {
      eyebrow: "HANOI · 36 GUILD STREETS",
      headlinePart1: "36 Streets.",
      headlinePart2: "One Living Legend.",
      description:
        "A physical-digital treasure hunt across Hanoi's historic quarters blending vision check-ins, ancient lore, and 3D artifacts.",
      primaryCta: "Start Exploring",
      secondaryCta: "See Experience",
      badgeLive: "Open Expedition · Any Route Order",
      interactiveNotice: "Drag or rotate to inspect 3D relic",
    },
    metrics: {
      stations: { value: "36", label: "Heritage guilds to discover" },
      vision: { value: "100%", label: "Vision-based landmark check-ins" },
      tiers: { value: "04", label: "Tiers of collectible relics" },
      cost: { value: "$0", label: "Instant play on mobile browser" },
    },
    intro: {
      eyebrow: "A LIVING ARCHIVE OF THE ANCIENT CAPITAL",
      title: "Not an ordinary travel brochure. This is a real-world expedition.",
      description:
        "Every alleyway in Hanoi holds centuries of artisan memory. The game transforms the 36 ancient guild streets into an open-air quest, where heritage facades and dynastic chronicles become keys to uncover legendary rewards.",
      pillars: [
        {
          tag: "01 · Autonomy",
          title: "36 Guild Enclaves",
          description:
            "No locked paths, no mandatory sequence. Start your expedition at whichever corner draws your curiosity.",
        },
        {
          tag: "02 · Vision",
          title: "Camera Over Pure GPS",
          description:
            "Confirm stations by photographing ancient street signs or historic architecture like a true investigator.",
        },
        {
          tag: "03 · Real Relic",
          title: "Physical Partner Rewards",
          description:
            "The quest culminates in authentic artisan workshops in the Old Quarter with tangible cultural perks.",
        },
      ],
    },
    gameplay: {
      title: "The 4-Step Expedition",
      subtitle: "From mossy shophouses to spatial interactive 3D heirlooms.",
      steps: [
        {
          stepNumber: "01",
          title: "Pick Your Guild",
          description:
            "Open the interactive Old Quarter map, spot heritage stations nearby, and chart your own walking route.",
          accent: "var(--color-ink-strong)",
        },
        {
          stepNumber: "02",
          title: "Vision Confirmation",
          description:
            "Arrive on site, frame the antique street plaque or shophouse facade with your camera to unlock the riddle.",
          accent: "var(--color-son)",
        },
        {
          stepNumber: "03",
          title: "Decode the Chronicles",
          description:
            "Answer riddles drawn directly from dynastic records and master craftsmen guilds to earn exploration points.",
          accent: "var(--color-gold)",
        },
        {
          stepNumber: "04",
          title: "Claim 3D & AR Relics",
          description:
            "Unlock historical lacquer chests (Timber, Bronze, Vermilion, Jade) and view them in physical space via AR.",
          accent: "var(--color-jade)",
        },
      ],
    },
    world: {
      quote: "Thirty-six bustling guild havens, a thousand years distilled into weathered brick and timber.",
      subquote: "Hanoi is not meant merely to be seen. It is meant to be decoded.",
      description:
        "Through centuries of change, Hanoi's Old Quarter remains Southeast Asia's most intact historic guild grid. Each street carries the legacy of its trade: silver ingot forgers on Hang Bac, ceremonial lanterns on Hang Mã, royal silk weavers on Hang Gai, and the stone sentinel of O Quan Chuong gate.",
      guilds: [
        {
          name: "Hang Bac Guild",
          century: "15th Century",
          description: "Royal silversmiths gathered under King Le Thanh Tong to cast imperial currency.",
        },
        {
          name: "Hang Ma Guild",
          century: "17th Century",
          description: "A dreamscape of paper craft, lanterns, and ancestral ceremonial tributes.",
        },
        {
          name: "Hang Gai Guild",
          century: "16th Century",
          description: "Cradle of Northern silk masters, renowned for intricate jacquard and brocade.",
        },
        {
          name: "O Quan Chuong Gate",
          century: "Circa 1749",
          description: "The sole standing military gate of Thang Long citadel, steadfast through centuries.",
        },
      ],
    },
    features: {
      title: "Engineered for real-world exploration",
      subtitle: "High-performance digital craft serving deep cultural heritage across any device.",
      items: [
        {
          tag: "Native PWA",
          title: "Zero Install Overhead",
          description:
            "Runs instantly in Safari or Chrome. Fast loading, offline-ready for spotty connectivity.",
        },
        {
          tag: "Spatial 3D",
          title: "WebXR & iOS Quick Look",
          description:
            "Inspect hand-crafted 3D chest models and place them onto your table in augmented reality.",
        },
        {
          tag: "Historical Rigor",
          title: "Archival Lore",
          description:
            "36 vetted cultural stories crafted in collaboration with heritage experts and craft guild elders.",
        },
        {
          tag: "Battery Conscious",
          title: "No Background GPS",
          description:
            "Camera recognition replaces power-hungry constant geolocation, saving your battery for photos.",
        },
        {
          tag: "Tangible Culture",
          title: "Real Partner Perks",
          description:
            "Redeem accumulated points for exclusive discounts at traditional Old Quarter craft workshops.",
        },
        {
          tag: "Global Audience",
          title: "Full Bilingual Support",
          description:
            "Seamless one-tap language switching between English and Vietnamese for explorers worldwide.",
        },
      ],
    },
    showcase: {
      title: "Minimalist craft, timeless heritage",
      subtitle: "Where vintage field journal aesthetics meet modern interactive tech.",
      cards: [
        {
          title: "Guild Expedition Map",
          caption: "36 heritage stations with distance vectors and coordinates.",
          tag: "Navigation",
        },
        {
          title: "Optical Landmark Check-in",
          caption: "Instant verification matching camera frames to historic facade motifs.",
          tag: "Vision AI",
        },
        {
          title: "Guild Lore & Riddles",
          caption: "Sharp trivia challenges with breadcrumbs leading to neighboring stations.",
          tag: "Riddle Engine",
        },
        {
          title: "Spatial Heirloom Chests",
          caption: "Loot reveals with ceremonial audio cues and tangible 3D inspect.",
          tag: "3D Relic",
        },
      ],
    },
    cta: {
      headline: "Ready to unlock the secrets of the 36 Streets?",
      description:
        "Lace up your walking shoes, grab your mobile camera, and step into the living history of Hanoi.",
      button: "Start Exploring",
      subtext: "100% Free · No registration required",
    },
    footer: {
      brand: "OLD QUARTER 36",
      tagline: "Cultural treasure hunt across 36 historic guild streets of Hanoi",
      copyright: "© 2026 Old Quarter 36. All rights reserved.",
      heritageAttribution: "Dedicated to the living heritage and craft artisans of Hanoi.",
      linksTitle: "Expedition",
      links: [
        { label: "Start Playing", href: "/play" },
        { label: "Guild Guide", href: "/huong-dan" },
        { label: "Partner Workshop", href: "/partner" },
        { label: "Heritage Admin", href: "/admin" },
      ],
      backToTop: "Back to top",
    },
  },
};
