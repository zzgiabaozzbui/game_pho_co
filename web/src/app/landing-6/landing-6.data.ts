/**
 * Toàn bộ copy của landing-6, hai ngôn ngữ. Component KHÔNG được hardcode chuỗi.
 *
 * Tiếng Việt là bản gốc — viết cho người Việt đọc, không phải dịch từ tiếng Anh.
 * Tiếng Anh là bản phụ.
 */

export type Lang = "vi" | "en";

/** Thứ tự chương = thứ tự cuộn trang. Dùng chung cho menu, HUD, assets.ts. */
export const CHAPTER_IDS = [
  "hero",
  "storyIntro",
  "storyProject",
  "collectionIntro",
  "gallery",
  "tableauKeep",
  "tableauFactions",
  "tableauWorld",
  "launch",
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export interface GalleryCard {
  id: string;
  name: string;
  desc: string;
}

export interface Landing6Content {
  /** Nhãn khung HUD bám fixed qua mọi chương (T07). */
  frame: {
    brand: string;
    brandSub: string;
    audioOn: string;
    audioOff: string;
    menu: string;
    close: string;
    console: string;
    chapterLabel: string;
    progressLabel: string;
    /** Placeholder trong Console.tsx — nội dung thật do task sau (T-console) quyết định. */
    consolePlaceholder: string;
    /** T26: nhãn nút "bỏ qua tới nội dung" — ẩn tới khi focus, đứng trước mọi nút HUD khác trong DOM. */
    skipToContent: string;
  };
  /** Overlay menu — mỗi chương một dòng. */
  menu: {
    title: string;
    items: Array<{ id: ChapterId; index: string; label: string }>;
  };
  /** Dòng telemetry chạy trong preloader (T08). */
  preloader: {
    label: string;
    lines: string[];
    audioPrompt: string;
    audioYes: string;
    audioNo: string;
  };
  hero: {
    words: [string, string, string];
    emblem: string;
    scrollCue: string;
  };
  storyIntro: {
    pretitle: string;
    paragraph: string;
    videoLabel: string;
    videoDuration: string;
    /** aria-label của nút phát video teaser (T14) — video chưa có file thật, nhưng nút vẫn cần mô tả cho screen reader. */
    videoPlayAria: string;
  };
  storyProject: {
    pretitle: string;
    strapline: string;
    coordinates: string;
    question: string;
    telemetry: string[];
  };
  collectionIntro: {
    pretitle: string;
    count: number;
    countLabel: string;
    captions: string[];
  };
  gallery: {
    pretitle: string;
    heading: string;
    description: string;
    cards: GalleryCard[];
    /** aria-label prefix for a card's detail button (T17) — combined with the card's own name at render time. */
    detailAria: string;
    /** aria-label of the detail overlay's close button (T17). */
    closeLabel: string;
  };
  tableauKeep: { index: string; pretitle: string; title: string; paragraph: string };
  tableauFactions: {
    index: string;
    pretitle: string;
    title: string;
    paragraph: string;
    bac: { name: string; attributes: string[] };
    nam: { name: string; attributes: string[] };
  };
  tableauWorld: { index: string; pretitle: string; title: string; paragraph: string };
  launch: {
    pretitle: string;
    heading: string;
    ctaPlay: string;
    ctaQr: string;
    countdownLabel: string;
    tableauLinks: Array<{ id: ChapterId; index: string; label: string }>;
  };
  footer: {
    systemLogTitle: string;
    systemLog: string[];
    navTitle: string;
    nav: Array<{ id: ChapterId; label: string }>;
    socialTitle: string;
    social: string[];
    brandBookLabel: string;
    wordmark: string;
    copyright: string;
  };
}

export const landing6Content: Record<Lang, Landing6Content> = {
  vi: {
    frame: {
      brand: "PHỞ CỔ",
      brandSub: "36 PHỐ PHƯỜNG",
      audioOn: "TIẾNG BẬT",
      audioOff: "TIẾNG TẮT",
      menu: "MỤC LỤC",
      close: "ĐÓNG",
      console: "SỔ TAY",
      chapterLabel: "CHƯƠNG",
      progressLabel: "TIẾN ĐỘ",
      consolePlaceholder: "Nội dung sổ tay sẽ có ở task sau.",
      skipToContent: "BỎ QUA TỚI NỘI DUNG",
    },
    menu: {
      title: "MỤC LỤC",
      items: [
        { id: "hero", index: "01", label: "Mở đầu" },
        { id: "storyIntro", index: "02", label: "Một buổi sáng quen" },
        { id: "storyProject", index: "03", label: "Người giữ lửa" },
        { id: "collectionIntro", index: "04", label: "Bộ sưu tầm" },
        { id: "gallery", index: "05", label: "Nguyên liệu" },
        { id: "tableauKeep", index: "06", label: "Gánh Phở Cổ" },
        { id: "tableauFactions", index: "07", label: "Hai trường phái" },
        { id: "tableauWorld", index: "08", label: "Phố cổ về đêm" },
        { id: "launch", index: "09", label: "Vào chơi" },
      ],
    },
    preloader: {
      label: "ĐANG NHÓM LỬA",
      lines: [
        "Bắc nồi nước dùng…",
        "Nướng gừng, nướng hành…",
        "Thả quế, hồi, thảo quả…",
        "Hạ lửa, hớt bọt…",
        "Tráng bánh, chần hành…",
        "Sẵn sàng.",
      ],
      audioPrompt: "Nghe cả tiếng phố?",
      audioYes: "CÓ, MỞ TIẾNG",
      audioNo: "KHÔNG, ĐỂ YÊN",
    },
    hero: {
      words: ["GIỮ GÌN", "BẢO VỆ", "TÁI HIỆN"],
      emblem: "PHỞ",
      scrollCue: "CUỘN ĐỂ ĐI TIẾP",
    },
    storyIntro: {
      pretitle: "MỘT BUỔI SÁNG QUEN",
      paragraph:
        "Sáu giờ sáng, phố còn ẩm sương. Một gánh phở đặt xuống góc quen, nắp nồi hé ra, khói bốc lên trắng cả vỉa hè. Người ta ngồi xuống ghế nhựa, húp một thìa nước dùng, rồi đi làm. Bao nhiêu năm rồi vẫn thế — cho đến khi những gánh như thế lặng lẽ biến mất khỏi phố, từng gánh một.",
      videoLabel: "XEM ĐOẠN GIỚI THIỆU",
      videoDuration: "01:48",
      videoPlayAria: "Phát đoạn giới thiệu",
    },
    storyProject: {
      pretitle: "NGƯỜI GIỮ LỬA",
      strapline: "Bạn là người cuối cùng còn nhớ nồi nước dùng ấy nấu thế nào.",
      coordinates: "N 21°01.7 / E 105°51.2",
      question: "Giữ lại cho riêng mình, hay truyền lại cho cả phố?",
      telemetry: [
        "> quét khu vực: phố cổ hà nội — 36 tuyến",
        "> gánh còn hoạt động: 07 / 41",
        "> công thức thất truyền: 29",
        "> ngọn lửa đang giữ: 01",
        "> chờ lệnh…",
      ],
    },
    collectionIntro: {
      pretitle: "BỘ SƯU TẦM",
      count: 36,
      countLabel: "CÔNG THỨC CẦN TÌM LẠI",
      captions: [
        "CAO 42MM",
        "NGANG 30MM",
        "MEN RẠN",
        "MẺ 001",
        "ĐỘ HIẾM: THẤP → ĐỘC BẢN",
      ],
    },
    gallery: {
      pretitle: "NGUYÊN LIỆU",
      heading: "MỘT BÁT PHỞ LÀ MỘT BẢN HỢP XƯỚNG",
      description:
        "Mười hai thứ dưới đây, thiếu một thứ là bát phở lệch đi. Sưu tầm đủ để mở khoá công thức gốc của từng gánh.",
      cards: [
        { id: "banh-pho", name: "Bánh phở", desc: "Tráng mỏng, thái tay, chần vừa chín tới." },
        { id: "nuoc-dung", name: "Nước dùng", desc: "Xương ống ninh tám tiếng, hớt bọt liên tục." },
        { id: "que", name: "Quế", desc: "Vỏ quế Trà My, rang khô trước khi thả vào túi thơm." },
        { id: "hoi", name: "Hoa hồi", desc: "Tám cánh đều, cho vị ngọt hậu ở cuối thìa." },
        { id: "gung-nuong", name: "Gừng nướng", desc: "Nướng cháy vỏ, đập dập, khử mùi xương." },
        { id: "hanh", name: "Hành", desc: "Hành củ nướng cho nước trong, hành lá chẻ rắc lên trên." },
        { id: "gau", name: "Gầu", desc: "Miếng gầu giòn viền mỡ, thái ngang thớ." },
        { id: "chin", name: "Nạm chín", desc: "Luộc rồi ép, để nguội mới thái được lát mỏng." },
        { id: "tai", name: "Thịt tái", desc: "Thái mỏng, dội nước dùng đang sôi ngay tại bát." },
        { id: "thao-qua", name: "Thảo quả", desc: "Nướng thơm, đập nứt vỏ, thứ tạo chiều sâu cho nồi." },
        { id: "mam", name: "Nước mắm", desc: "Mắm cốt nhỉ, nêm cuối cùng, chỉ một chút." },
        { id: "chanh-ot", name: "Chanh ớt", desc: "Đĩa nhỏ bên cạnh — phần của người ăn, không phải người nấu." },
      ],
      detailAria: "Xem chi tiết",
      closeLabel: "ĐÓNG",
    },
    tableauKeep: {
      index: "001",
      pretitle: "TRANH 001",
      title: "GÁNH PHỞ CỔ",
      paragraph:
        "Một đầu quang gánh là bếp lò than, đầu kia là nồi nước dùng và chồng bát. Cả cái quán nằm gọn trên vai một người. Bếp không bao giờ tắt hẳn — tắt là mất giống lửa, mà mất giống lửa thì nồi sau không còn đúng vị nồi trước.",
    },
    tableauFactions: {
      index: "002",
      pretitle: "TRANH 002",
      title: "HAI TRƯỜNG PHÁI",
      paragraph:
        "Cùng một bát phở, hai cách hiểu. Ngoài Bắc giữ nước trong, vị thanh, tin rằng thêm thứ gì cũng là bớt đi. Trong Nam thả giá, húng quế, tương đen, tin rằng bát phở là của người ăn. Không phe nào sai. Bạn chỉ được chọn một để đi tới cùng.",
      bac: {
        name: "PHỞ BẮC",
        attributes: ["Nước trong", "Vị thanh", "Ít gia giảm", "Bánh thái tay"],
      },
      nam: {
        name: "PHỞ NAM",
        attributes: ["Nước đậm", "Vị ngọt", "Rau sống đầy đĩa", "Tương đen tương ớt"],
      },
    },
    tableauWorld: {
      index: "003",
      pretitle: "TRANH 003",
      title: "PHỐ CỔ VỀ ĐÊM",
      paragraph:
        "Mười một giờ đêm, biển hiệu tắt dần, chỉ còn vài quầng đèn vàng hắt xuống mặt đường ướt. Đó là lúc phố cổ trở lại đúng tuổi của nó. Ba mươi sáu tuyến phố, mỗi tuyến một nghề, mỗi nghề một mùi — và ở đâu đó giữa chúng là gánh phở bạn đang tìm.",
    },
    launch: {
      pretitle: "SẴN SÀNG",
      heading: "NHÓM LẠI NGỌN LỬA",
      ctaPlay: "VÀO CHƠI",
      ctaQr: "QUÉT QR NHẬN RƯƠNG",
      countdownLabel: "MỞ CỔNG SAU",
      tableauLinks: [
        { id: "tableauKeep", index: "001", label: "Gánh Phở Cổ" },
        { id: "tableauFactions", index: "002", label: "Hai trường phái" },
        { id: "tableauWorld", index: "003", label: "Phố cổ về đêm" },
      ],
    },
    footer: {
      systemLogTitle: "NHẬT KÝ",
      systemLog: [
        "phiên bản 0.6.0 — bản dựng nội bộ",
        "máy chủ hà nội — trạng thái ổn định",
        "cập nhật lần cuối: mẻ 001",
      ],
      navTitle: "ĐI TỚI",
      nav: [
        { id: "hero", label: "Mở đầu" },
        { id: "gallery", label: "Nguyên liệu" },
        { id: "tableauFactions", label: "Hai trường phái" },
        { id: "launch", label: "Vào chơi" },
      ],
      socialTitle: "THEO DÕI",
      social: ["Facebook", "YouTube", "TikTok", "Discord"],
      brandBookLabel: "SỔ TAY THƯƠNG HIỆU",
      wordmark: "PHỞ CỔ",
      copyright: "© 2026 Phở Cổ. Làm tại Hà Nội.",
    },
  },

  en: {
    frame: {
      brand: "PHO CO",
      brandSub: "36 OLD STREETS",
      audioOn: "SOUND ON",
      audioOff: "SOUND OFF",
      menu: "MENU",
      close: "CLOSE",
      console: "CONSOLE",
      chapterLabel: "CHAPTER",
      progressLabel: "PROGRESS",
      consolePlaceholder: "Console content lands in a later task.",
      skipToContent: "SKIP TO CONTENT",
    },
    menu: {
      title: "CONTENTS",
      items: [
        { id: "hero", index: "01", label: "Opening" },
        { id: "storyIntro", index: "02", label: "A familiar morning" },
        { id: "storyProject", index: "03", label: "Keeper of the flame" },
        { id: "collectionIntro", index: "04", label: "The collection" },
        { id: "gallery", index: "05", label: "Ingredients" },
        { id: "tableauKeep", index: "06", label: "The phở cart" },
        { id: "tableauFactions", index: "07", label: "Two schools" },
        { id: "tableauWorld", index: "08", label: "Old quarter at night" },
        { id: "launch", index: "09", label: "Play" },
      ],
    },
    preloader: {
      label: "LIGHTING THE STOVE",
      lines: [
        "Setting the broth pot…",
        "Charring ginger and onion…",
        "Adding cinnamon, star anise, black cardamom…",
        "Lowering the flame, skimming…",
        "Blanching noodles…",
        "Ready.",
      ],
      audioPrompt: "Hear the street too?",
      audioYes: "YES, SOUND ON",
      audioNo: "NO, KEEP QUIET",
    },
    hero: {
      words: ["KEEP", "PROTECT", "REIMAGINE"],
      emblem: "PHỞ",
      scrollCue: "SCROLL TO CONTINUE",
    },
    storyIntro: {
      pretitle: "A FAMILIAR MORNING",
      paragraph:
        "Six in the morning, the street still damp with mist. A phở cart sets down on its usual corner, the lid lifts, and steam whitens the whole pavement. People sit on plastic stools, take one spoonful of broth, then go to work. It was like that for years — until carts like that began disappearing from the street, one at a time.",
      videoLabel: "WATCH THE TEASER",
      videoDuration: "01:48",
      videoPlayAria: "Play the teaser",
    },
    storyProject: {
      pretitle: "KEEPER OF THE FLAME",
      strapline: "You are the last person who remembers how that broth was made.",
      coordinates: "N 21°01.7 / E 105°51.2",
      question: "Keep it to yourself, or hand it back to the street?",
      telemetry: [
        "> scanning area: hanoi old quarter — 36 streets",
        "> carts still trading: 07 / 41",
        "> recipes lost: 29",
        "> flames still burning: 01",
        "> awaiting orders…",
      ],
    },
    collectionIntro: {
      pretitle: "THE COLLECTION",
      count: 36,
      countLabel: "RECIPES TO RECOVER",
      captions: [
        "HEIGHT 42MM",
        "WIDTH 30MM",
        "CRACKLE GLAZE",
        "BATCH 001",
        "RARITY: COMMON → ONE OF ONE",
      ],
    },
    gallery: {
      pretitle: "INGREDIENTS",
      heading: "ONE BOWL, TWELVE VOICES",
      description:
        "Twelve things below. Miss one and the bowl tilts. Collect them all to unlock each cart's original recipe.",
      cards: [
        { id: "banh-pho", name: "Rice noodles", desc: "Sheet-steamed, hand-cut, blanched just to doneness." },
        { id: "nuoc-dung", name: "Broth", desc: "Marrow bones, eight hours, skimmed the whole way." },
        { id: "que", name: "Cinnamon", desc: "Trà My bark, dry-roasted before it goes in the spice bag." },
        { id: "hoi", name: "Star anise", desc: "Eight even points, the sweetness that lands last." },
        { id: "gung-nuong", name: "Charred ginger", desc: "Burnt in the skin, bruised, takes the bone smell away." },
        { id: "hanh", name: "Onion", desc: "Charred bulbs for a clear broth, sliced greens on top." },
        { id: "gau", name: "Brisket fat", desc: "The crisp fat-rimmed cut, sliced across the grain." },
        { id: "chin", name: "Well-done flank", desc: "Boiled, pressed, cooled — only then thin enough to slice." },
        { id: "tai", name: "Rare beef", desc: "Sliced thin, cooked by the boiling broth in the bowl itself." },
        { id: "thao-qua", name: "Black cardamom", desc: "Toasted, cracked open — the depth of the pot." },
        { id: "mam", name: "Fish sauce", desc: "First-press, added last, only a little." },
        { id: "chanh-ot", name: "Lime and chilli", desc: "A small dish on the side — the eater's part, not the cook's." },
      ],
      detailAria: "View details",
      closeLabel: "CLOSE",
    },
    tableauKeep: {
      index: "001",
      pretitle: "TABLEAU 001",
      title: "THE PHỞ CART",
      paragraph:
        "One end of the shoulder pole is a charcoal stove, the other is the broth pot and a stack of bowls. The whole shop rides on one person's shoulder. The stove never fully goes out — lose the flame and the next pot no longer tastes like the last.",
    },
    tableauFactions: {
      index: "002",
      pretitle: "TABLEAU 002",
      title: "TWO SCHOOLS",
      paragraph:
        "One bowl, two readings. The north keeps the broth clear and lean, believing anything added is something taken away. The south piles on bean sprouts, basil, hoisin, believing the bowl belongs to whoever eats it. Neither is wrong. You only get to follow one to the end.",
      bac: {
        name: "PHỞ BẮC",
        attributes: ["Clear broth", "Lean flavour", "Few additions", "Hand-cut noodles"],
      },
      nam: {
        name: "PHỞ NAM",
        attributes: ["Rich broth", "Sweeter", "A plate of herbs", "Hoisin and chilli"],
      },
    },
    tableauWorld: {
      index: "003",
      pretitle: "TABLEAU 003",
      title: "OLD QUARTER AT NIGHT",
      paragraph:
        "Eleven at night, the signs go dark one by one, leaving a few yellow pools on wet asphalt. That is when the old quarter looks its real age again. Thirty-six streets, one trade each, one smell each — and somewhere among them, the cart you are looking for.",
    },
    launch: {
      pretitle: "READY",
      heading: "RELIGHT THE FLAME",
      ctaPlay: "PLAY NOW",
      ctaQr: "SCAN QR FOR A CHEST",
      countdownLabel: "GATES OPEN IN",
      tableauLinks: [
        { id: "tableauKeep", index: "001", label: "The phở cart" },
        { id: "tableauFactions", index: "002", label: "Two schools" },
        { id: "tableauWorld", index: "003", label: "Old quarter at night" },
      ],
    },
    footer: {
      systemLogTitle: "SYSTEM LOG",
      systemLog: [
        "version 0.6.0 — internal build",
        "hanoi node — status nominal",
        "last update: batch 001",
      ],
      navTitle: "GO TO",
      nav: [
        { id: "hero", label: "Opening" },
        { id: "gallery", label: "Ingredients" },
        { id: "tableauFactions", label: "Two schools" },
        { id: "launch", label: "Play" },
      ],
      socialTitle: "FOLLOW",
      social: ["Facebook", "YouTube", "TikTok", "Discord"],
      brandBookLabel: "BRAND BOOK",
      wordmark: "PHỞ CỔ",
      copyright: "© 2026 Phở Cổ. Made in Hanoi.",
    },
  },
};
