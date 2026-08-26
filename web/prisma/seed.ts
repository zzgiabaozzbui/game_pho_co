import "dotenv/config";
import { randomBytes } from "crypto";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

interface SeedStation {
  slug: string;
  nameVi: string;
  nameEn: string;
  storyVi: string;
  storyEn: string;
  questionVi: string;
  questionEn: string;
  options: { vi: string; en: string }[];
  correctIndex: number;
  hintVi: string;
  hintEn: string;
  lat: number;
  lng: number;
  radiusM: number;
  qrToken: string;
}

// Tuyến đi bộ vòng qua 36 phố phường. Tọa độ là tâm gần đúng (chỉnh được trong /admin).
const stations: SeedStation[] = [
  {
    slug: "hang-bac",
    nameVi: "Phố Hàng Bạc",
    nameEn: "Hang Bac Street",
    storyVi:
      "Từ thế kỷ XV, dưới thời vua Lê Thánh Tông, các thợ đúc bạc được tập hợp về khu này lập nên hội 'Kim Ngân' làm bạc thoi, bạc nén thuế cho triều đình. Đình Kim Ngân giữa phố vẫn thờ tổ nghề đúc bạc đến ngày nay.",
    storyEn:
      "Since the 15th century under King Le Thanh Tong, silversmiths were gathered here into the 'Kim Ngan' guild, minting silver bars and tax ingots for the royal court. Kim Ngan communal house still honors the founding masters of silver casting.",
    questionVi: "Người thợ ở Hàng Bạc xưa nổi tiếng với nghề gì?",
    questionEn: "What craft made Hang Bac's artisans famous?",
    options: [
      { vi: "Đúc bạc", en: "Silver casting" },
      { vi: "Dệt lụa", en: "Silk weaving" },
      { vi: "Làm giấy dó", en: "Making dó paper" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi về phía bắc vài bước, tìm con phố nơi xưa thợ làm chân đèn và đồ thờ bằng đồng — tên phố là một vật dùng để thắp sáng nhà thờ.",
    hintEn:
      "Head a few steps north to a street whose smiths once forged candlesticks — its name is an object used to bring light.",
    lat: 21.03505,
    lng: 105.84895,
    radiusM: 130,
    qrToken: "pc36-hang-bac-k7q2",
  },
  {
    slug: "hang-dieu",
    nameVi: "Phố Hàng Điếu",
    nameEn: "Hang Dieu Street",
    storyVi:
      "Hàng Điếu xưa tập trung thợ làm 'điếu' — chân đèn và vật phẩm thờ bằng đồng, cùng nghề làm đồ mã, tang lễ. Con phố nhỏ uốn cong này nay còn giữ dáng vẻ cổ kính với những ngôi nhà ống.",
    storyEn:
      "Hang Dieu was home to makers of 'dieu' — brass candlesticks and ritual objects — plus funeral paper crafts. This narrow curving lane still keeps its ancient tube-house charm.",
    questionVi: "'Điếu' trong tên phố Hàng Điếu chỉ loại đồ vật nào?",
    questionEn: "What object does 'Dieu' in Hang Dieu refer to?",
    options: [
      { vi: "Chân đèn thờ", en: "Ritual candlesticks" },
      { vi: "Cây tre", en: "Bamboo poles" },
      { vi: "Chiếu ngồi", en: "Sitting mats" },
    ],
    correctIndex: 0,
    hintVi:
      "Rẽ sang con phố song song phía tây, nơi những người thợ đan khung ghế, rèm che bằng tre mảnh — tên gọi gắn với một món đồ mỏng nhẹ che nắng.",
    hintEn:
      "Turn west onto a parallel lane where artisans wove fine bamboo frames and sun-screens — named after something thin and light.",
    lat: 21.03585,
    lng: 105.84855,
    radiusM: 120,
    qrToken: "pc36-hang-dieu-m3x8",
  },
  {
    slug: "hang-cot",
    nameVi: "Phố Hàng Cót",
    nameEn: "Hang Cot Street",
    storyVi:
      "'Cót' là những nan tre mỏng dùng để dệt phên, rèm che và làm khung ghế. Xưa cả phố nhà nhà đan cót, tiếng kẽo kẹt của tre nghe suốt ngày đêm.",
    storyEn:
      "'Cot' are thin bamboo strips woven into screens, blinds and chair frames. The whole street once echoed all day with the creak of weaving bamboo.",
    questionVi: "Chất liệu chính của nghề Hàng Cót là gì?",
    questionEn: "What was the main material of Hang Cot's craft?",
    options: [
      { vi: "Tre", en: "Bamboo" },
      { vi: "Sắt", en: "Iron" },
      { vi: "Lụa", en: "Silk" },
    ],
    correctIndex: 0,
    hintVi:
      "Tiếp tục xuống nam, đến con phố buôn vải sơn đông nhất khu 36 phố phường, nơi tên gọi gợi ngay những cuộn vải treo đầy cửa hàng.",
    hintEn:
      "Continue south to the busiest fabric market lane of the old quarter, named after rolls of cloth hanging in shopfronts.",
    lat: 21.03475,
    lng: 105.84825,
    radiusM: 120,
    qrToken: "pc36-hang-cot-t9v4",
  },
  {
    slug: "hang-ngang",
    nameVi: "Phố Hàng Ngang",
    nameEn: "Hang Ngang Street",
    storyVi:
      "Hàng Ngang cùng Hàng Đào tạo thành trục buôn bán sầm uất bậc nhất Thăng Long, chuyên vải vóc, quần áo. Mùa Thuật 1945, tại số 48 Hàng Ngang, Chủ tịch Hồ Chí Minh soạn thảo Tuyên ngôn Độc lập trước khi đọc tại Quảng trường Ba Đình.",
    storyEn:
      "Together with Hang Dao, Hang Ngang formed the busiest trading axis of Thang Long, famed for cloth and garments. In August 1945, at No. 48, Ho Chi Minh drafted the Declaration of Independence before reading it at Ba Dinh Square.",
    questionVi: "Sự kiện lịch sử quan trọng nào gắn với số 48 Hàng Ngang năm 1945?",
    questionEn: "What historic event happened at 48 Hang Ngang in 1945?",
    options: [
      { vi: "Soạn thảo Tuyên ngôn Độc lập", en: "Drafting the Declaration of Independence" },
      { vi: "Khai mạc chợ Đồng Xuân", en: "Opening of Dong Xuan market" },
      { vi: "Đúc chuộc chùa Cầu Đông", en: "Casting the Dong Co bell" },
    ],
    correctIndex: 0,
    hintVi:
      "Con phố kế bên chạy song song, xưa là nơi thợ đúc đồ đồng gia dụng như nồi, ấm, đĩa — tên phố là một kim loại quý.",
    hintEn:
      "The next parallel lane was home to casters of everyday copperware — pots, kettles, trays — and bears the name of a precious metal.",
    lat: 21.03395,
    lng: 105.84905,
    radiusM: 120,
    qrToken: "pc36-hang-ngang-r5n7",
  },
  {
    slug: "hang-dong",
    nameVi: "Phố Hàng Đồng",
    nameEn: "Hang Dong Street",
    storyVi:
      "Tiếng búa đập đồng từng vang khắp Hàng Đồng, nơi chế tác nồi đồng, ấm đồng, đĩa đồng và cả chuông, khánh đình chùa. Nghề đúc đồng Thăng Long nổi danh từ thời Lý – Trần.",
    storyEn:
      "Hammer on bronze rang through Hang Dong, where craftsmen shaped pots, kettles, trays, even temple bells. Thang Long bronze casting has been renowned since the Ly–Tran dynasties.",
    questionVi: "Nghề chính của phố Hàng Đồng là gì?",
    questionEn: "What was Hang Dong's main craft?",
    options: [
      { vi: "Đồ đồng gia dụng", en: "Household copperware" },
      { vi: "Gốm sứ", en: "Ceramics" },
      { vi: "Làm quạt giấy", en: "Paper fans" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi tiếp về hướng nam, tìm con phố bán mọi thứ vải vóc từ tấm đến cuộn — chữ đầu tiên của tên phố cũng là chữ trong 'vải vóc'.",
    hintEn:
      "Keep heading south to a lane trading every kind of cloth by bolt or piece — its very name means fabric.",
    lat: 21.03415,
    lng: 105.84985,
    radiusM: 120,
    qrToken: "pc36-hang-dong-b2h6",
  },
  {
    slug: "hang-vai",
    nameVi: "Phố Hàng Vải",
    nameEn: "Hang Vai Street",
    storyVi:
      "Hàng Vải nối khu chợ vải lớn của kinh thành, nơi buôn tơ bán vải tăm tắp. Những cửa hàng vải truyền thống vẫn còn đó giữa phố hiện đại.",
    storyEn:
      "Hang Vai linked the capital's great cloth markets where silk and fabric were traded in abundance. Traditional fabric shops still line this lane today.",
    questionVi: "Hàng Vải xưa chuyên buôn bán mặt hàng gì?",
    questionEn: "What did Hang Vai traditionally trade?",
    options: [
      { vi: "Vải vóc", en: "Cloth and fabric" },
      { vi: "Muối", en: "Salt" },
      { vi: "Gương, lược", en: "Mirrors and combs" },
    ],
    correctIndex: 0,
    hintVi:
      "Quay về phía tây một đoạn ngắn, tìm con phố của những người thợ hàn thiếc làm ấm trà, bình rượu — kim loại mềm sáng màu trắng bạc.",
    hintEn:
      "Walk a short way back west to the street of pewterers who made tea pots and wine flasks from a soft, silver-white metal.",
    lat: 21.03235,
    lng: 105.85115,
    radiusM: 120,
    qrToken: "pc36-hang-vai-w8d3",
  },
  {
    slug: "hang-thiec",
    nameVi: "Phố Hàng Thiếc",
    nameEn: "Hang Thiec Street",
    storyVi:
      "Thợ Hàng Thiếc hàn gắn và chế tác đồ bằng thiếc: ấm tích, chum rượu, ống hút thiếc uống nước mát mùa hè. Tiếng 'thiếc' là kim loại mềm, sáng như bạc.",
    storyEn:
      "Pewterers of Hang Thiec crafted and repaired tin goods: teapots, wine jars, even pewter straws for cool summer drinks.",
    questionVi: "Đồ vật nào dưới đây do thợ Hàng Thiếc làm ra?",
    questionEn: "Which item did Hang Thiec artisans make?",
    options: [
      { vi: "Ấm tích thiếc", en: "Pewter teapots" },
      { vi: "Chiếu cói", en: "Sedge mats" },
      { vi: "Quạt giấy", en: "Paper fans" },
    ],
    correctIndex: 0,
    hintVi:
      "Xuống nam gặp con phố mang tên một dụng cụ đo lường — xưa đây là nơi chế tạo cân đòn, dây cân cho chợ đời.",
    hintEn:
      "Southward you'll meet a street named after a measuring tool — scale-makers once supplied the city's markets here.",
    lat: 21.03275,
    lng: 105.84955,
    radiusM: 120,
    qrToken: "pc36-hang-thiec-j4f9",
  },
  {
    slug: "hang-can",
    nameVi: "Phố Hàng Cân",
    nameEn: "Hang Can Street",
    storyVi:
      "Hàng Cân là 'xưởng' chế tạo cân đòn, cân dây, quả cân đá và đồng cho toàn thành. Một cây cân chuẩn xác được xem như sự công bằng của thương trường xưa.",
    storyEn:
      "Hang Can was the city's workshop for steelyard scales, strings and stone or brass weights. An accurate scale symbolized fairness in the old marketplace.",
    questionVi: "Dụng cụ nào được chế tạo tại Hàng Cân?",
    questionEn: "Which tool was made on Hang Can street?",
    options: [
      { vi: "Cân đòn, quả cân", en: "Steelyard scales and weights" },
      { vi: "Bàn tính", en: "Abacuses" },
      { vi: "La bàn", en: "Compasses" },
    ],
    correctIndex: 0,
    hintVi:
      "Rẽ sang con phố nhỏ bên phải, nơi xưa sản xuất 'lược' — dụng cụ chải đầu bằng sừng trâu và gỗ ngọc am.",
    hintEn:
      "Turn into the small lane on the right where combs of buffalo horn and fragrant wood were once carved.",
    lat: 21.03185,
    lng: 105.84945,
    radiusM: 120,
    qrToken: "pc36-hang-can-p6k1",
  },
  {
    slug: "hang-luoc",
    nameVi: "Phố Hàng Lược",
    nameEn: "Hang Luoc Street",
    storyVi:
      "Thợ Hàng Lược chạm khắc chiếc lược từ sừng trâu, gỗ mun, gỗ ngọc am — vật dụng thân thuộc của thiếu nữ Thăng Long. Phố còn giáp chợ Hoa ngày Tết ngày nay.",
    storyEn:
      "Artisans of Hang Luoc carved combs from buffalo horn and ebony — an intimate accessory of Thang Long women. Today the street borders the beloved Tet flower market.",
    questionVi: "Vật liệu truyền thống để làm lược ở Hàng Lược là gì?",
    questionEn: "Which traditional materials were used for combs here?",
    options: [
      { vi: "Sừng trâu và gỗ", en: "Buffalo horn and wood" },
      { vi: "Nhựa cây", en: "Tree sap" },
      { vi: "Da cá sấu", en: "Crocodile leather" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi về phía nam tới con phố mang tên một loại củ gia vị thơm nồng, xưa chất đầy những rổ hành khô.",
    hintEn:
      "Head south to a street named after a pungent bulb — baskets of dried shallots once piled high here.",
    lat: 21.03135,
    lng: 105.85005,
    radiusM: 120,
    qrToken: "pc36-hang-luoc-c7t2",
  },
  {
    slug: "hang-hanh",
    nameVi: "Phố Hàng Hành",
    nameEn: "Hang Hanh Street",
    storyVi:
      "Hành củ — gia vị không thể thiếu của bếp Việt — từng được bán la liệt trên Hàng Hành. Mùi hành xào thơm lừng mỗi dịp lễ Tết tưởng như vẫn còn vương trên con phố nhỏ này.",
    storyEn:
      "Shallots, an essential spice of Vietnamese kitchens, were sold in heaps along Hang Hanh. The aroma of fried shallots at festival time seems to linger still.",
    questionVi: "Hàng Hành bán loại gia vị nào?",
    questionEn: "Which spice was sold on Hang Hanh?",
    options: [
      { vi: "Hành củ", en: "Shallots" },
      { vi: "Ớt", en: "Chili" },
      { vi: "Nghệ", en: "Turmeric" },
    ],
    correctIndex: 0,
    hintVi:
      "Một con phố nữa về phía nam, tên gọi ghép từ hai món đồ mây tre đan: cái đựng cơm và cái trải ngồi.",
    hintEn:
      "One more lane south, whose name pairs two woven bamboo items: a container and a sitting mat.",
    lat: 21.03065,
    lng: 105.85005,
    radiusM: 120,
    qrToken: "pc36-hang-hanh-y3w8",
  },
  {
    slug: "to-tich",
    nameVi: "Phố Tô Tịch",
    nameEn: "To Tich Street",
    storyVi:
      "Tên phố ghép từ 'tô' — chiếc rổ mây đựng cơm, và 'tích' — tấm chiếu trải. Đây cũng là phố ẩm thực nổi tiếng với chè và các món ăn vặt Hà thành.",
    storyEn:
      "The name joins 'to' — a woven rice basket — with 'tich' — a sitting mat. Today it is a favorite dessert street of Hanoi.",
    questionVi: "Từ 'Tô Tịch' ghép từ những đồ vật nào?",
    questionEn: "Which objects form the name To Tich?",
    options: [
      { vi: "Rổ mây và chiếu", en: "A basket and a mat" },
      { vi: "Ấm trà và chén", en: "Teapot and cups" },
      { vi: "Quạt và nón", en: "Fan and conical hat" },
    ],
    correctIndex: 0,
    hintVi:
      "Rẽ sang đông, tìm con phố mang tên thứ 'trắng muối' quý giá mà thuyền chở từ biển về bán ở đất kinh kỳ.",
    hintEn:
      "Turn east toward a street named after the precious white cargo carried from the sea to the royal city: salt.",
    lat: 21.03015,
    lng: 105.85045,
    radiusM: 120,
    qrToken: "pc36-to-tich-n9r5",
  },
  {
    slug: "hang-muoi",
    nameVi: "Phố Hàng Muối",
    nameEn: "Hang Muoi Street",
    storyVi:
      "Thuyền gạo xe muối tấp nập đưa muối biển lên Hàng Muối, nơi phân phối cho cả kinh thành. Muối xưa quý đến mức được xem như một thứ 'tiền' trao đổi.",
    storyEn:
      "Boats and carts delivered sea salt to Hang Muoi, distributor for the whole capital. Salt was once so valuable it served as a medium of exchange.",
    questionVi: "Hàng Muối phân phối mặt hàng gì cho kinh thành xưa?",
    questionEn: "What commodity did Hang Muoi distribute?",
    options: [
      { vi: "Muối biển", en: "Sea salt" },
      { vi: "Đá quý", en: "Gemstones" },
      { vi: "Thuốc bắc", en: "Herbal medicine" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi tiếp về đông bắc, đến phố của đường phèn, mứt trái cây — thứ ngọt ngào mà tên phố nói lên tất cả.",
    hintEn:
      "Northeast to the street of sugar crystals and candied fruit — sweetness spelled out right in its name.",
    lat: 21.03085,
    lng: 105.85185,
    radiusM: 120,
    qrToken: "pc36-hang-muoi-g6b3",
  },
  {
    slug: "hang-duong",
    nameVi: "Phố Hàng Đường",
    nameEn: "Hang Duong Street",
    storyVi:
      "Hàng Đường thiên đường ngọt của Hà Nội: đường phèn, mứt sen, bánh pía, ô mai. Nhà thờ họ và tiệm ô mai centuries-old vẫn hút khách mỗi độ Tết về.",
    storyEn:
      "Hang Duong is Hanoi's sweet paradise: rock sugar, lotus jam, pastries and preserved fruits. Century-old jam shops still draw crowds every Tet.",
    questionVi: "Hàng Đường nổi tiếng với nhóm mặt hàng nào?",
    questionEn: "What is Hang Duong famous for?",
    options: [
      { vi: "Đường, mứt, ô mai", en: "Sugar, jams, preserved fruit" },
      { vi: "Giày dép", en: "Shoes" },
      { vi: "Đồ điện", en: "Electronics" },
    ],
    correctIndex: 0,
    hintVi:
      "Theo dòng phố lên bắc, tới nơi thợ khâu buồm thuyền — tên phố là tấm vải lớn bắt gió cho thuyền rời bến.",
    hintEn:
      "Follow the street north to where sailmakers stitched great canvas — the street is named after the cloth that catches wind.",
    lat: 21.03135,
    lng: 105.85295,
    radiusM: 120,
    qrToken: "pc36-hang-duong-z5s9",
  },
  {
    slug: "hang-buom",
    nameVi: "Phố Hàng Buồm",
    nameEn: "Hang Buom Street",
    storyVi:
      "Xưa sát bờ sông, Hàng Buồm là nơi thợ may buồm cho thuyền buôn. Nay phố trở thành điểm hẹn ẩm thực đêm và có tiệm bánh mì nổi tiếng thế giới.",
    storyEn:
      "Once by the riverbank, sailmakers tailored sails for merchant boats here. Today it is a lively night-food street, home of a world-famous banh mi shop.",
    questionVi: "Nghề truyền thống của Hàng Buồm là gì?",
    questionEn: "What was Hang Buom's traditional trade?",
    options: [
      { vi: "May buồm thuyền", en: "Tailoring boat sails" },
      { vi: "Đúc tiền", en: "Coin minting" },
      { vi: "Làm đèn lồng", en: "Lantern making" },
    ],
    correctIndex: 0,
    hintVi:
      "Chui xuống con phố nhỏ phía tây chợ Đồng Xuân, nơi xưa đóng quan tài gỗ — tên gọi nhắc tới một 'cái lò' và người nằm nghỉ.",
    hintEn:
      "Slip into the small lane west of Dong Xuan market, where wooden coffins were once crafted — its name recalls a workshop and eternal rest.",
    lat: 21.03285,
    lng: 105.85385,
    radiusM: 120,
    qrToken: "pc36-hang-buom-h2m6",
  },
  {
    slug: "lo-su",
    nameVi: "Phố Lò Sũ",
    nameEn: "Lo Su Street",
    storyVi:
      "Lò Sũ tập trung các xưởng đóng quan tài gỗ táng tang lễ theo phong thủy. Ngày nay phố chuyển mình sầm uất với hàng thời trang, ít ai nhớ nguồn gốc cái tên.",
    storyEn:
      "Lo Su hosted coffin workshops following feng-shui burial customs. Now a bustling fashion strip, few remember the origin of its name.",
    questionVi: "Tên 'Lò Sũ' gắn với nghề nào ngày xưa?",
    questionEn: "Which craft gave Lo Su its name?",
    options: [
      { vi: "Đóng quan tài", en: "Coffin making" },
      { vi: "Nướng bánh", en: "Baking" },
      { vi: "Rèn dao kéo", en: "Blade forging" },
    ],
    correctIndex: 0,
    hintVi:
      "Leo lên bắc qua mặt trước chợ Đồng Xuân, tìm phố bán khoai lang, khoai sọ — thức ăn dân dã nuôi sống kinh thành.",
    hintEn:
      "North past the front of Dong Xuan market lies a street selling sweet potatoes and taros — humble food that fed the capital.",
    lat: 21.03095,
    lng: 105.85435,
    radiusM: 130,
    qrToken: "pc36-lo-su-q8v2",
  },
  {
    slug: "hang-khoai",
    nameVi: "Phố Hàng Khoai",
    nameEn: "Hang Khoai Street",
    storyVi:
      "Hàng Khoai rực rỡ sắc tím khoai lang, trắng khoai sọ, cùng các loại củ quả đồng nội. Phố nằm ngay cạnh cổng chợ Đồng Xuân — trái tim thương mại Thăng Long.",
    storyEn:
      "Purple sweet potatoes and white taros brightened Hang Khoai alongside native roots and fruits, right beside Dong Xuan market — the commercial heart of Thang Long.",
    questionVi: "Hàng Khoai nằm kề bên chợ nào nổi tiếng?",
    questionEn: "Which famous market sits next to Hang Khoai?",
    options: [
      { vi: "Chợ Đồng Xuân", en: "Dong Xuan Market" },
      { vi: "Chợ Bến Thành", en: "Ben Thanh Market" },
      { vi: "Chợ Hoa Hàng Lược", en: "Hang Luoc flower market" },
    ],
    correctIndex: 0,
    hintVi:
      "Rẽ phải theo vành chợ, vào con phố của những lọ thủy tinh, chai sành đựng rượu thuốc — tên phố là một đồ vật trong nhà bếp.",
    hintEn:
      "Turn right around the market into a street of glass bottles and stoneware jars — its name is a common kitchen item.",
    lat: 21.03395,
    lng: 105.85315,
    radiusM: 120,
    qrToken: "pc36-hang-khoai-e4y7",
  },
  {
    slug: "hang-chai",
    nameVi: "Phố Hàng Chai",
    nameEn: "Hang Chai Street",
    storyVi:
      "Thương hồn mua bán chai lọ, lục bình thủy tinh tụ về Hàng Chai ven sông. Những 'chai' đựng nước mắm, rượu thuốc xếp chồng cao vút như tháp.",
    storyEn:
      "Traders of bottles and glass jugs gathered at riverside Hang Chai. Fish-sauce jars and medicinal bottles stacked tall as towers.",
    questionVi: "Hàng Chai buôn bán đồ vật nào?",
    questionEn: "What did Hang Chai traders sell?",
    options: [
      { vi: "Chai, lọ, lục bình", en: "Bottles, jugs, vases" },
      { vi: "Nón lá", en: "Conical hats" },
      { vi: "Đèn dầu", en: "Oil lamps" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi về cuối phố phía đông nam, tới nơi bày biện chĩnh — loại chum gốm đựng nước, tương. Tên phố gần như tiếng gọi món đồ đó.",
    hintEn:
      "Toward the southeast end find the street of ceramic water jars — its name almost calls out the item itself.",
    lat: 21.03355,
    lng: 105.85455,
    radiusM: 120,
    qrToken: "pc36-hang-chai-u7j4",
  },
  {
    slug: "hang-chinh",
    nameVi: "Phố Hàng Chĩnh",
    nameEn: "Hang Chinh Street",
    storyVi:
      "Chĩnh gốm từ các lò village Gốm Sủ, Phù Lãng được thuyền chở về bày kín Hàng Chĩnh. Người Hà Nội mua chĩnh đựng nước mưa trong veo quanh năm.",
    storyEn:
      "Ceramic jars from Su and Phu Lang kilns arrived by boat to fill Hang Chinh. Hanoi families stored clear rainwater in them year-round.",
    questionVi: "Chĩnh là đồ gốm dùng để làm gì phổ biến nhất?",
    questionEn: "What were these ceramic jars mostly used for?",
    options: [
      { vi: "Đựng nước", en: "Storing water" },
      { vi: "Nấu cơm", en: "Cooking rice" },
      { vi: "Trồng hoa", en: "Planting flowers" },
    ],
    correctIndex: 0,
    hintVi:
      "Con phố kế bên bán thứ đặc sản theo mùa: con rươi thịt mỡ màng — dám thử mới là người Hà Nội chính gốc!",
    hintEn:
      "The next lane sells a seasonal delicacy: plump ragworms — only true Hanoians dare try them!",
    lat: 21.03345,
    lng: 105.85605,
    radiusM: 120,
    qrToken: "pc36-hang-chinh-a9l5",
  },
  {
    slug: "hang-ruoi",
    nameVi: "Phố Hàng Rươi",
    nameEn: "Hang Ruoi Street",
    storyVi:
      "Mỗi độ cuối thu đầu đông, rươi từ vùng nước lợ đổ về Hàng Rươi. Món rươi đánh trứng, chả rươi là tinh hoa ẩm thực theo mùa khó quên.",
    storyEn:
      "Every late autumn, brackish-water ragworms flood into Hang Ruoi. Omelet and patty made of them are an unforgettable seasonal delicacy.",
    questionVi: "Hàng Rươi bán đặc sản gì theo mùa?",
    questionEn: "What seasonal delicacy does Hang Ruoi sell?",
    options: [
      { vi: "Con rươi", en: "Ragworms" },
      { vi: "Cua đồng", en: "Field crabs" },
      { vi: "Ốc bươu", en: "Apple snails" },
    ],
    correctIndex: 0,
    hintVi:
      "Xuống phía nam một chút, tới phố của bè gỗ trôi dạt theo sông về đây khai thác — tên phố gắn với 'cái bè'.",
    hintEn:
      "A little south lies the street of timber rafts floated downriver — its name comes straight from 'raft'.",
    lat: 21.03295,
    lng: 105.85555,
    radiusM: 120,
    qrToken: "pc36-hang-ruoi-s3d8",
  },
  {
    slug: "hang-be",
    nameVi: "Phố Hàng Bè",
    nameEn: "Hang Be Street",
    storyVi:
      "Những bè gỗ quý xuôi dòng sông Tô Lịch – sông Hồng cập bến Hàng Bè. Thợ xẻ gỗ chia lóng, cung ứng gỗ xây dựng cho cả kinh thành.",
    storyEn:
      "Rafts of precious timber drifted down the To Lich and Red River to moor at Hang Be. Woodcutters split and graded lumber for the entire capital.",
    questionVi: "Hàng Bè gắn với phương tiện vận tải nào trên sông?",
    questionEn: "Which river transport gave Hang Be its name?",
    options: [
      { vi: "Bè gỗ", en: "Timber rafts" },
      { vi: "Thuyền rồng", en: "Dragon boats" },
      { vi: "Xe trâu", en: "Buffalo carts" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi vòng về trung tâm phố cổ, tới con phố dài rực rỡ đèn lồng, đồ chơi truyền thống và hàng mã mỗi dịp lễ Tết.",
    hintEn:
      "Circle back to the long street blazing with lanterns, traditional toys and votive papers every festival.",
    lat: 21.03215,
    lng: 105.85605,
    radiusM: 130,
    qrToken: "pc36-hang-be-v6g1",
  },
  {
    slug: "hang-ma",
    nameVi: "Phố Hàng Mã",
    nameEn: "Hang Ma Street",
    storyVi:
      "Hàng Mã rực sắc đỏ vàng: đồ mã cúng lễ, đèn lồng trung thu, mặt nạ, trom tống. Trước Trung thu, cả phố như bừng lên một 'lễ hội ánh sáng' trọn vẹn.",
    storyEn:
      "Hang Ma glows red and gold with votive paper, mid-autumn lanterns, masks and drums. Before the full moon festival, the whole street becomes a festival of light.",
    questionVi: "Hàng Mã rực rỡ nhất vào dịp nào?",
    questionEn: "When does Hang Ma shine brightest?",
    options: [
      { vi: "Trung thu và Tết", en: "Mid-Autumn Festival and Tet" },
      { vi: "Mùa mưa", en: "Rainy season" },
      { vi: "Mùa cưới", en: "Wedding season" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi về phía bắc ngắn ngủi, tới phố của những chiếc 'bồ' — chiếc thúng mây đựng thóc gạo.",
    hintEn:
      "A short walk north to the street of 'bo' — woven rattan tubs for storing rice.",
    lat: 21.03255,
    lng: 105.85055,
    radiusM: 140,
    qrToken: "pc36-hang-ma-f8n2",
  },
  {
    slug: "hang-bo",
    nameVi: "Phố Hàng Bồ",
    nameEn: "Hang Bo Street",
    storyVi:
      "'Bồ' là chiếc thúng mây tre đựng thóc, gạo, hạt. Hàng Bồ ngày xưa đầy ắp những chiếc bồ đan khéo xếp tầng tầng lớp lớp.",
    storyEn:
      "'Bo' is a rattan tub for grain and rice. Hang Bo once overflowed with skillfully woven baskets stacked layer upon layer.",
    questionVi: "'Bồ' là đồ dùng để làm gì?",
    questionEn: "What is a 'bo' used for?",
    options: [
      { vi: "Đựng thóc gạo", en: "Storing grain and rice" },
      { vi: "Đun nước", en: "Boiling water" },
      { vi: "Che mưa", en: "Sheltering from rain" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi về hướng hồ Gươm, qua con phố mang tên cây cầu gỗ bắc qua sông Tô Lịch xưa.",
    hintEn:
      "Head toward Hoan Kiem Lake through a street named after an old wooden bridge over the To Lich river.",
    lat: 21.03345,
    lng: 105.85215,
    radiusM: 120,
    qrToken: "pc36-hang-bo-x5k9",
  },
  {
    slug: "cau-go",
    nameVi: "Phố Cầu Gỗ",
    nameEn: "Cau Go Street",
    storyVi:
      "Cầu Gỗ là cây cầu gỗ bắc qua sông Tô Lịch dẫn vào khu chợ đông đúc. Phố Cầu Gỗ ngày nay vẫn là trục giao thương sầm uất nhìn ra hồ Gươm.",
    storyEn:
      "The wooden bridge crossed the To Lich river into the eastern market. Cau Go street today remains a busy artery facing Hoan Kiem lake.",
    questionVi: "Tên 'Cầu Gỗ' xuất phát từ điều gì?",
    questionEn: "Where does the name 'Cau Go' come from?",
    options: [
      { vi: "Cây cầu bằng gỗ", en: "A bridge made of wood" },
      { vi: "Khu xưởng mộc", en: "A carpentry quarter" },
      { vi: "Cột nhà bằng gỗ", en: "Wooden house pillars" },
    ],
    correctIndex: 0,
    hintVi:
      "Xuống sát mép hồ Gươm về phía nam, tới phố của những chiếc khay son thếp — đồ cưới xa xưa của người Hà Nội.",
    hintEn:
      "Down to the lake edge southward, to the street of lacquered gilt trays — treasured wedding gifts of old Hanoi.",
    lat: 21.02855,
    lng: 105.85205,
    radiusM: 130,
    qrToken: "pc36-cau-go-l2t6",
  },
  {
    slug: "hang-khay",
    nameVi: "Phố Hàng Khay",
    nameEn: "Hang Khay Street",
    storyVi:
      "Khay son thếp của Hàng Khay là món hồi môn sang trọng trong đám cưới xưa. Phố nay dọc mặt tây nam hồ Gươm, phồn hoa đèn neon.",
    storyEn:
      "Gilt trays from Hang Khay were luxurious wedding dowry pieces. Today the street lines the southwest shore of Hoan Kiem lake in neon splendor.",
    questionVi: "Hàng Khay nổi tiếng với sản phẩm nào?",
    questionEn: "What product made Hang Khay famous?",
    options: [
      { vi: "Khay sơn mài thếp vàng", en: "Gilt lacquer trays" },
      { vi: "Tượng đồng", en: "Bronze statues" },
      { vi: "Tranh lụa", en: "Silk paintings" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi lên hướng bắc men theo hồ, tới phố của trống lễ và tranh dân gian — tên phố là một nhạc cụ gõ.",
    hintEn:
      "Walk north along the lake to the street of ceremonial drums and folk prints — named after a percussion instrument.",
    lat: 21.02615,
    lng: 105.85115,
    radiusM: 130,
    qrToken: "pc36-hang-khay-o7w3",
  },
  {
    slug: "hang-trong",
    nameVi: "Phố Hàng Trống",
    nameEn: "Hang Trong Street",
    storyVi:
      "Hàng Trống hội tụ hai nghề: làm trống lễ hội và in tranh dân gian 'Tranh Hàng Trống' — một trong ba dòng tranh dân gian nổi tiếng Việt Nam cùng Đông Hồ và Kim Hoàng.",
    storyEn:
      "Hang Trong united drum-making with folk woodblock printing — Hang Trong paintings stand beside Dong Ho and Kim Hoang among Vietnam's three great folk print traditions.",
    questionVi: "Tranh Hàng Trống thuộc thể loại nghệ thuật nào?",
    questionEn: "Hang Trong prints belong to which art genre?",
    options: [
      { vi: "Tranh dân gian mộc bản", en: "Folk woodblock prints" },
      { vi: "Tranh sơn dầu", en: "Oil painting" },
      { vi: "Ảnh đen trắng", en: "Black-and-white photography" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi ngang qua phố, tìm con phố bằng sợi cây 'gai' dệt vải thô — tên gọi là một loài cây sợi.",
    hintEn:
      "Cross over to a lane named after a fibrous plant once woven into coarse cloth.",
    lat: 21.02705,
    lng: 105.84915,
    radiusM: 120,
    qrToken: "pc36-hang-trong-i4b8",
  },
  {
    slug: "hang-gai",
    nameVi: "Phố Hàng Gai",
    nameEn: "Hang Gai Street",
    storyVi:
      "Gai — sợi cây dai — được đem về Hàng Gai để dệt vải bố, dây thừng. Nay phố dẫn lên chùa Cầu Đông và là tuyến dạo hồ Gươm yêu thích của du khách.",
    storyEn:
      "Hemp fiber was brought to Hang Gai for weaving coarse cloth and rope. The street now leads to Cau Dong pagoda and a beloved lake promenade.",
    questionVi: "Sợi gai ở Hàng Gai dùng chủ yếu để làm gì?",
    questionEn: "What was hemp fiber mainly used for here?",
    options: [
      { vi: "Dệt vải bố, dây thừng", en: "Weaving linen and rope" },
      { vi: "Làm giấy", en: "Making paper" },
      { vi: "Nhuộm tóc", en: "Hair dyeing" },
    ],
    correctIndex: 0,
    hintVi:
      "Con phố song song phía nam bán 'hoa bông' — sợi bông trắng muốt làm chăn gối ấm áp mùa đông Hà Nội.",
    hintEn:
      "The parallel street south traded cotton — soft white fluff for warm Hanoi winter quilts.",
    lat: 21.02955,
    lng: 105.84995,
    radiusM: 120,
    qrToken: "pc36-hang-gai-d9h4",
  },
  {
    slug: "hang-bong",
    nameVi: "Phố Hàng Bông",
    nameEn: "Hang Bong Street",
    storyVi:
      "Hàng Bông buôn bông vải, chăn ga gối đắp chăn. Phố dài nối Hàng Gai tới Hàng Cót, nay còn nổi tiếng tiệm bánh và tranh ảnh.",
    storyEn:
      "Hang Bong traded raw cotton, quilts and pillows. Stretching from Hang Gai to Hang Cot, it now hosts beloved bakeries and galleries.",
    questionVi: 'Chữ "Bông" trong Hàng Bông chỉ nguyên liệu gì?',
    questionEn: 'What material does "Bong" refer to?',
    options: [
      { vi: "Bông vải", en: "Raw cotton" },
      { vi: "Hoa tươi", en: "Fresh flowers" },
      { vi: "Bông cải", en: "Broccoli" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi về phía tây, tới con phố mang tên con gia cầm quen thuộc bữa cơm Việt — xưa là chợ gà sống.",
    hintEn:
      "Westward to a street named after the familiar bird of Vietnamese dinners — once a live poultry market.",
    lat: 21.03005,
    lng: 105.84785,
    radiusM: 130,
    qrToken: "pc36-hang-bong-k5r1",
  },
  {
    slug: "hang-ga",
    nameVi: "Phố Hàng Gà",
    nameEn: "Hang Ga Street",
    storyVi:
      "Tiếng gáy gà gà ran khắp Hàng Gà xưa kia nơi bán gà giống, gà thịt. Ngày nay phố lặng lẽ hơn với các cửa hàng tre đan và quán ăn dân dã.",
    storyEn:
      "Crowed roosters once filled Hang Ga, the live poultry market. Today it is quieter, lined with bamboo shops and homestyle eateries.",
    questionVi: "Hàng Gà xưa là nơi buôn bán gì?",
    questionEn: "What was traded on Hang Ga street?",
    options: [
      { vi: "Gà sống", en: "Live poultry" },
      { vi: "Cá cảnh", en: "Ornamental fish" },
      { vi: "Chim hót", en: "Songbirds" },
    ],
    correctIndex: 0,
    hintVi:
      "Một con phố nữa về phía đông nam, tên gọi là loại chiếu cói trải giường — nơi bày bán chiếu làng Trúc Ninh nổi tiếng.",
    hintEn:
      "One more lane southeast named after a sleeping mat — famous mats from Truc Ninh village were piled high here.",
    lat: 21.03045,
    lng: 105.84655,
    radiusM: 120,
    qrToken: "pc36-hang-ga-t1y6",
  },
  {
    slug: "hang-chieu",
    nameVi: "Phố Hàng Chiếu",
    nameEn: "Hang Chieu Street",
    storyVi:
      "Chiếu làng Trúc Ninh, Kim Sơn chở về Hàng Chiếu bày kín hai hàng. Chiếu cói mát lạnh là 'điều hòa' của mùa hè Hà thành xưa.",
    storyEn:
      "Sedge mats from Truc Ninh and Kim Son villages filled both sides of Hang Chieu. A cool woven mat was the air-conditioner of old Hanoi summers.",
    questionVi: "Chiếu ở Hàng Chiếu được dệt từ nguyên liệu nào?",
    questionEn: "What material are the mats here woven from?",
    options: [
      { vi: "Cói", en: "Sedge grass" },
      { vi: "Lụa", en: "Silk" },
      { vi: "Len", en: "Wool" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi lên phía bắc, tới phố của than hồng sưởi ấm mùa đông — tên gọi là thứ nhiên liệu đen bóng.",
    hintEn:
      "North to a street named after the glossy black fuel that warmed Hanoi winters: charcoal.",
    lat: 21.02955,
    lng: 105.84685,
    radiusM: 120,
    qrToken: "pc36-hang-chieu-m7e2",
  },
  {
    slug: "hang-than",
    nameVi: "Phố Hàng Than",
    nameEn: "Hang Than Street",
    storyVi:
      "Than than củi chất cao như núi trên Hàng Than xưa. Nay phố nổi tiếng bánh cuốn nóng và dẫn tới hồ Trúc Bạch xanh mát.",
    storyEn:
      "Charcoal piles rose like hills on old Hang Than. Today the street is loved for hot steamed rice rolls and leads to tranquil Truc Bach lake.",
    questionVi: "Hàng Than ngày nay nổi tiếng với món ăn nào?",
    questionEn: "Which dish is Hang Than known for today?",
    options: [
      { vi: "Bánh cuốn", en: "Steamed rice rolls" },
      { vi: "Phở bò", en: "Beef pho" },
      { vi: "Bún chả", en: "Grilled pork noodles" },
    ],
    correctIndex: 0,
    hintVi:
      "Con phố bên cạnh bán sợi bún trắng ngần — nguyên liệu của bún thang, bún chả Hà thành.",
    hintEn:
      "The neighboring street sold snowy vermicelli strands — base of Hanoi's bun thang and bun cha.",
    lat: 21.03745,
    lng: 105.84485,
    radiusM: 130,
    qrToken: "pc36-hang-than-w4s7",
  },
  {
    slug: "hang-bun",
    nameVi: "Phố Hàng Bún",
    nameEn: "Hang Bun Street",
    storyVi:
      "Hàng Bún là 'kho' bún tươi của khu Tây phố cổ, thợ làm bún gạo từ đêm khuya. Sợi bún trắng mềm chảy vào bao món ngon Hà Nội.",
    storyEn:
      "Hang Bun was the fresh-rice-vermicelli pantry of the western Old Quarter, with makers working through the night into countless Hanoi dishes.",
    questionVi: "Hàng Bún làm và bán loại thực phẩm nào?",
    questionEn: "What food was made and sold on Hang Bun?",
    options: [
      { vi: "Bún gạo tươi", en: "Fresh rice vermicelli" },
      { vi: "Bánh đa", en: "Rice crackers" },
      { vi: "Xôi", en: "Sticky rice" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi về hướng đông nam, tới phố mang tên loại hạt đậu bổ dưỡng — nơi gần Ô Quan Chưởng và đường tàu cũ.",
    hintEn:
      "Southeast to a street named after nutritious beans, near the Old East Gate and the old railway spur.",
    lat: 21.03685,
    lng: 105.84335,
    radiusM: 130,
    qrToken: "pc36-hang-bun-j8q4",
  },
  {
    slug: "hang-dau",
    nameVi: "Phố Hàng Đậu",
    nameEn: "Hang Dau Street",
    storyVi:
      "Hàng Đậu buôn các loại đậu: đậu xanh, đậu đen, đậu tương. Phố nằm gần Ô Quan Chưởng — cánh cổng thành Thăng Long cuối cùng còn lại.",
    storyEn:
      "Beans of every kind — mung, black, soy — filled Hang Dau near O Quan Chuong, the last surviving gate of Thang Long citadel.",
    questionVi: "Cổng thành nào còn lại gần Hàng Đậu?",
    questionEn: "Which citadel gate stands near Hang Dau?",
    options: [
      { vi: "Ô Quan Chưởng", en: "O Quan Chuong gate" },
      { vi: "Cửa Bắc", en: "North Gate" },
      { vi: "Cửa Nam", en: "South Gate" },
    ],
    correctIndex: 0,
    hintVi:
      "Xuống về phía nam lòng chảo phố cổ, tới con phố tre — mây xanh mát ven bờ sông xưa.",
    hintEn:
      "Down into the bowl of the old quarter, to a bamboo-green lane along the former riverbank.",
    lat: 21.03555,
    lng: 105.84415,
    radiusM: 130,
    qrToken: "pc36-hang-dau-c2v9",
  },
  {
    slug: "hang-tre",
    nameVi: "Phố Hàng Tre",
    nameEn: "Hang Tre Street",
    storyVi:
      "Tre nguyên cây, tre đan lát chất đống ven Hàng Tre ven sông. Tre Việt gắn với làng quê, với câu ca 'tre già măng mọc'.",
    storyEn:
      "Whole bamboo poles and split slats piled riverside at Hang Tre. Bamboo is the emblem of Vietnamese villages — 'old bamboo, young shoots'.",
    questionVi: "Hàng Tre bán nguyên liệu gì chủ đạo?",
    questionEn: "What main material was sold on Hang Tre?",
    options: [
      { vi: "Tre", en: "Bamboo" },
      { vi: "Gỗ lim", en: "Ironwood" },
      { vi: "Mây", en: "Rattan" },
    ],
    correctIndex: 0,
    hintVi:
      "Đi về phía nam gần hồ Gươm, tới phố làm quạt giấy, quạt lụa xòe hình bán nguyệt.",
    hintEn:
      "South near Hoan Kiem lake, to the street of paper and silk fans unfolding in half moons.",
    lat: 21.02995,
    lng: 105.85165,
    radiusM: 120,
    qrToken: "pc36-hang-tre-b6n3",
  },
  {
    slug: "hang-quat",
    nameVi: "Phố Hàng Quạt",
    nameEn: "Hang Quat Street",
    storyVi:
      "Hàng Quạt khép lại 'phố nghề' phía nam bằng quạt giấy, quạt lụa, quạt cầm tay của quan lại và cô gái Thăng Long. Quạt còn là vật cúng lễ không thể thiếu.",
    storyEn:
      "Closing the southern craft arc, Hang Quat offered paper and silk fans for mandarins and Thang Long maidens alike — also essential ritual items.",
    questionVi: "Hàng Quạt chuyên sản phẩm gì?",
    questionEn: "What did Hang Quat specialize in?",
    options: [
      { vi: "Quạt các loại", en: "Fans of all kinds" },
      { vi: "Ô dù", en: "Umbrellas" },
      { vi: "Mũ quan", en: "Mandarin hats" },
    ],
    correctIndex: 0,
    hintVi:
      "Men theo bờ đông hồ Gươm lên bắc, tới phố nhuộm vải 'màu đào' hồng thắm — nay là phố đi bộ sôi động nhất Hà Nội.",
    hintEn:
      "Along the east bank of the lake northward, to the street of peach-red dyed silk — now Hanoi's liveliest walking street.",
    lat: 21.02705,
    lng: 105.85255,
    radiusM: 120,
    qrToken: "pc36-hang-quat-y9f5",
  },
  {
    slug: "hang-dao",
    nameVi: "Phố Hàng Đào",
    nameEn: "Hang Dao Street",
    storyVi:
      "Hàng Đào xưa nhuộm vải màu đỏ đào rực rỡ phơi phấp phới. Nay là trục phố đi bộ đêm cuối tuần, nơi giao hòa giữa thương xưa và nhịp nay.",
    storyEn:
      "Peach-red dyed cloth once fluttered along Hang Dao. Now it is the weekend night-walking heart where old trade meets new rhythm.",
    questionVi: '"Đào" trong tên Hàng Đào chỉ màu gì?',
    questionEn: 'What color does "Dao" refer to?',
    options: [
      { vi: "Màu đỏ hồng của hoa đào", en: "Peach blossom red-pink" },
      { vi: "Màu xanh lá", en: "Green" },
      { vi: "Màu vàng nghệ", en: "Turmeric yellow" },
    ],
    correctIndex: 0,
    hintVi:
      "Trạm cuối: quay lên phía bắc chợ Đồng Xuân, tìm con phố nhỏ của những thùng mắm cá cơm thơm nồng biển khơi.",
    hintEn:
      "Final station: back north of Dong Xuan market, find the small lane of anchovy fish-sauce barrels breathing the open sea.",
    lat: 21.02885,
    lng: 105.85275,
    radiusM: 130,
    qrToken: "pc36-hang-dao-p3j8",
  },
  {
    slug: "hang-mam",
    nameVi: "Phố Hàng Mắm",
    nameEn: "Hang Mam Street",
    storyVi:
      "Hàng Mắm kết thúc hành trình bằng hương vị đậm đà nhất: nước mắm, mắm tôm, cà cuống từ các vùng biển chở về. Giọt mắm đậm đà như tinh thần phố cổ — mặn mà, sâu lắng.",
    storyEn:
      "Hang Mam ends the journey with the boldest flavor: fish sauce, shrimp paste from coastal lands. One pungent drop carries the soul of the Old Quarter — salty and profound.",
    questionVi: "Hàng Mắm buôn mặt hàng gì đặc trưng?",
    questionEn: "What signature goods were sold on Hang Mam?",
    options: [
      { vi: "Nước mắm, mắm tôm", en: "Fish and shrimp sauces" },
      { vi: "Trái cây", en: "Fruits" },
      { vi: "Hoa khô", en: "Dried flowers" },
    ],
    correctIndex: 0,
    hintVi:
      "Bạn đã đi trọn 36 phố phường! Kho báu văn hóa đang chờ mở ra.",
    hintEn: "You have walked all 36 streets! The cultural treasure awaits.",
    lat: 21.03375,
    lng: 105.85065,
    radiusM: 120,
    qrToken: "pc36-hang-mam-r6t1",
  },
];

async function main() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = url.startsWith("file:")
    ? new PrismaBetterSqlite3({ url })
    : (() => {
        throw new Error("Seed chỉ hỗ trợ SQLite dev URL hiện tại");
      })();
  const db = new PrismaClient({ adapter });

  for (const [i, s] of stations.entries()) {
    await db.station.upsert({
      where: { slug: s.slug },
      update: {
        orderIndex: i + 1,
        nameVi: s.nameVi,
        nameEn: s.nameEn,
        storyVi: s.storyVi,
        storyEn: s.storyEn,
        questionVi: s.questionVi,
        questionEn: s.questionEn,
        optionsJson: JSON.stringify(s.options),
        correctIndex: s.correctIndex,
        hintVi: s.hintVi,
        hintEn: s.hintEn,
        lat: s.lat,
        lng: s.lng,
        radiusM: s.radiusM,
        qrToken: s.qrToken,
      },
      create: {
        slug: s.slug,
        orderIndex: i + 1,
        nameVi: s.nameVi,
        nameEn: s.nameEn,
        storyVi: s.storyVi,
        storyEn: s.storyEn,
        questionVi: s.questionVi,
        questionEn: s.questionEn,
        optionsJson: JSON.stringify(s.options),
        correctIndex: s.correctIndex,
        hintVi: s.hintVi,
        hintEn: s.hintEn,
        lat: s.lat,
        lng: s.lng,
        radiusM: s.radiusM,
        qrToken: s.qrToken,
      },
    });
  }
  const count = await db.station.count();
  console.log(`Seeded ${count} stations.`);

  const tiers = [
    { key: "common", nameVi: "Rương Thường", nameEn: "Common Chest", colorHex: "#9a3b2b", sortOrder: 1 },
    { key: "gold", nameVi: "Rương Vàng", nameEn: "Gold Chest", colorHex: "#c9962b", sortOrder: 2 },
    { key: "epic", nameVi: "Rương Huyền Bí", nameEn: "Epic Chest", colorHex: "#b3122e", sortOrder: 3 },
    { key: "grand", nameVi: "Kho Báu Văn Hóa", nameEn: "Grand Treasure", colorHex: "#1f5c46", sortOrder: 4 },
  ];
  const tierIds: Record<string, number> = {};
  for (const t of tiers) {
    const modelGlbPath = `/models/chest-${t.key}.glb`;
    const modelUsdzPath = `/models/chest-${t.key}.usdz`;
    const row = await db.chestTier.upsert({
      where: { key: t.key },
      update: { nameVi: t.nameVi, nameEn: t.nameEn, colorHex: t.colorHex, sortOrder: t.sortOrder, modelGlbPath, modelUsdzPath },
      create: { ...t, modelGlbPath, modelUsdzPath },
    });
    tierIds[t.key] = row.id;
  }

  await db.dropRule.deleteMany();
  await db.dropRule.createMany({
    data: [
      { chancePct: 30, tierKey: "common", weight: 70 },
      { chancePct: 30, tierKey: "gold", weight: 25 },
      { chancePct: 30, tierKey: "epic", weight: 5 },
    ],
  });

  const partnerToken = randomBytes(32).toString("hex");
  let spot = await db.partnerSpot.upsert({
    where: { key: "workshop" },
    update: { mindTargetPath: "/markers/workshop.mind" },
    create: { key: "workshop", token: partnerToken, mindTargetPath: "/markers/workshop.mind" },
  });
  if (spot.token.length < 64) {
    spot = await db.partnerSpot.update({ where: { key: "workshop" }, data: { token: partnerToken } });
  }
  console.log("PartnerSpot token (lưu lại):", spot.token);

  if ((await db.chestLoot.count()) === 0) {
    const loots = [
      { scopeKey: "final", type: "POINTS", pointsAmount: 300, sortOrder: 1 },
      {
        scopeKey: "final",
        type: "STORY",
        storyVi: "Bạn đã mở kho báu văn hóa Phố cổ Hà Nội!",
        storyEn: "You have unlocked the Old Quarter cultural treasure!",
        sortOrder: 2,
      },
      { scopeKey: "final", type: "VIDEO", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sortOrder: 3 },
      { scopeKey: "partner", type: "POINTS", pointsAmount: 150, sortOrder: 1 },
      {
        scopeKey: "partner",
        type: "STORY",
        storyVi: "Quà riêng từ workshop đối tác.",
        storyEn: "A gift from our partner workshop.",
        sortOrder: 2,
      },
      { scopeKey: "drop", type: "POINTS", pointsAmount: 30, sortOrder: 1 },
      {
        scopeKey: "drop",
        type: "STORY",
        storyVi: "Phần quà bất ngờ trên hành trình.",
        storyEn: "A surprise gift on your journey.",
        sortOrder: 2,
      },
      { scopeKey: "achievement:stations_6", type: "POINTS", pointsAmount: 50, sortOrder: 1 },
      {
        scopeKey: "achievement:stations_6",
        type: "STORY",
        storyVi: "Đã khám phá 6 phố phường!",
        storyEn: "Six streets explored!",
        sortOrder: 2,
      },
      { scopeKey: "achievement:stations_18", type: "POINTS", pointsAmount: 100, sortOrder: 1 },
      {
        scopeKey: "achievement:stations_18",
        type: "STORY",
        storyVi: "Nửa chặng đường Phố cổ!",
        storyEn: "Halfway through the Old Quarter!",
        sortOrder: 2,
      },
      { scopeKey: "achievement:perfect_5", type: "POINTS", pointsAmount: 80, sortOrder: 1 },
      {
        scopeKey: "achievement:perfect_5",
        type: "STORY",
        storyVi: "5 trạm liền giải đúng ngay lần đầu!",
        storyEn: "Five stations solved on the first try!",
        sortOrder: 2,
      },
      { scopeKey: "achievement:score_2000", type: "POINTS", pointsAmount: 120, sortOrder: 1 },
      {
        scopeKey: "achievement:score_2000",
        type: "STORY",
        storyVi: "Nhà thám hiểm điểm cao!",
        storyEn: "High-scoring explorer!",
        sortOrder: 2,
      },
      { scopeKey: "station:hang-bac", type: "POINTS", pointsAmount: 40, sortOrder: 1 },
      {
        scopeKey: "station:hang-bac",
        type: "STORY",
        storyVi: "Kỷ niệm phố Hàng Bạc.",
        storyEn: "A memory of Silver Street.",
        sortOrder: 2,
      },
    ];
    for (const l of loots) await db.chestLoot.create({ data: l });
  }

  await db.station.updateMany({ data: { chestTierId: tierIds["common"] } });

  // ===== Sample Partners =====
  const partnerData = [
    {
      name: "Xưởng Gỗ Sơn Son",
      phone: "0912 345 678",
      address: "42 Hàng Mã, Hoàn Kiếm, Hà Nội",
      description: "Trải nghiệm nghệ thuật sơn son thếp vàng trên gỗ truyền thống",
      lat: 21.0345,
      lng: 105.8522,
    },
    {
      name: "Bảo tàng Lịch sử Hà Nội",
      phone: "024 3825 2853",
      address: "216 Trần Quang Khải, Hoàn Kiếm, Hà Nội",
      description: "Khám phá lịch sử Hà Nội qua các hiện vật và trưng bày",
      lat: 21.0287,
      lng: 105.8522,
    },
    {
      name: "Workshop Giấy Dó",
      phone: "0987 654 321",
      address: "11 Hàng Bông, Hoàn Kiếm, Hà Nội",
      description: "Tự tay làm giấy dó truyền thống và viết thư pháp",
      lat: 21.0285,
      lng: 105.8482,
    },
  ];

  const createdPartners: Record<string, any> = {};
  for (const pData of partnerData) {
    const existing = await db.partner.findFirst({ where: { name: pData.name } });
    if (existing) {
      createdPartners[pData.name] = existing;
    } else {
      const created = await db.partner.create({ data: pData });
      createdPartners[pData.name] = created;
    }
  }

  // ===== Sample Station-Partner Links =====
  const hangMa = await db.station.findUnique({ where: { slug: "hang-ma" } });
  const xuongGo = createdPartners["Xưởng Gỗ Sơn Son"];
  const giayDo = createdPartners["Workshop Giấy Dó"];
  const baoTang = createdPartners["Bảo tàng Lịch sử Hà Nội"];

  if (hangMa && xuongGo) {
    await db.stationPartner.upsert({
      where: { stationId_partnerId: { stationId: hangMa.id, partnerId: xuongGo.id } },
      create: { stationId: hangMa.id, partnerId: xuongGo.id },
      update: {},
    });
  }
  if (hangMa && giayDo) {
    await db.stationPartner.upsert({
      where: { stationId_partnerId: { stationId: hangMa.id, partnerId: giayDo.id } },
      create: { stationId: hangMa.id, partnerId: giayDo.id },
      update: {},
    });
  }

  const tranQuangKhai = await db.station.findUnique({ where: { slug: "tran-quang-khai" } });
  if (tranQuangKhai && baoTang) {
    await db.stationPartner.upsert({
      where: { stationId_partnerId: { stationId: tranQuangKhai.id, partnerId: baoTang.id } },
      create: { stationId: tranQuangKhai.id, partnerId: baoTang.id },
      update: {},
    });
  }

  // ===== Sample Workshop Tasks =====
  if (xuongGo && hangMa) {
    const existingTask = await db.workshopTask.findFirst({
      where: { partnerId: xuongGo.id, stationId: hangMa.id },
    });
    if (!existingTask) {
      await db.workshopTask.create({
        data: {
          partnerId: xuongGo.id,
          stationId: hangMa.id,
          instructionVi: "Đến xưởng và trải nghiệm kỹ thuật sơn son thếp vàng trên một món đồ gỗ nhỏ",
          instructionEn: "Visit the workshop and experience gold-leaf lacquer technique on a small wooden item",
          photoReqsVi: "1 ảnh chụp bạn đang thực hành sơn + 1 ảnh sản phẩm hoàn thành",
          photoReqsEn: "1 photo of you practicing lacquer + 1 photo of the finished product",
          quizQuestionVi: "Bạn vừa học kỹ thuật nào?",
          quizQuestionEn: "Which technique did you just learn?",
          quizOptionsJson: JSON.stringify([
            { vi: "Sơn son thếp vàng", en: "Gold-leaf lacquer" },
            { vi: "Gỗ khảm trai", en: "Mother-of-pearl inlay" },
            { vi: "Đúc đồng", en: "Bronze casting" },
          ]),
          quizCorrectIndex: 0,
          rewardPoints: 75,
        },
      });
    }
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
