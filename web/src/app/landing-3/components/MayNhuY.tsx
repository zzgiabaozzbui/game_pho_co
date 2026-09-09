"use client";

interface MayNhuYProps {
  className?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}

export function MayNhuY({
  className = "",
  stroke = "currentColor",
  strokeWidth = 1.6,
  fill = "none",
}: MayNhuYProps) {
  return (
    <svg
      viewBox="0 0 340 160"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* ================================================================= */}
        {/* MÂY NHƯ Ý - CHU SA: NÉT VẼ ĐƠN SẮC TRUYỀN THỐNG VIỆT NAM          */}
        {/* ================================================================= */}

        {/* 1. Dải đuôi lượn mềm mại từ bên trái (Left flowing tail) */}
        <path d="M 12 70 C 35 68, 65 72, 95 86 C 122 99, 146 112, 172 108 C 190 105, 202 92, 198 76" />
        <path d="M 12 70 C 30 78, 55 94, 80 108 C 108 122, 138 126, 168 116 C 185 110, 196 100, 202 88" />

        {/* 2. Vòng xoáy ốc lớn trung tâm (Main Center Spiral - Cuộn Như Ý chính) */}
        <path d="M 172 108 C 158 92, 154 68, 168 50 C 184 32, 212 34, 222 56 C 230 75, 218 96, 198 98 C 182 100, 172 88, 176 74 C 180 62, 194 58, 204 66 C 210 74, 206 84, 198 84" />

        {/* 3. Vòng xoáy ốc phụ bên dưới (Secondary Lower Spiral) */}
        <path d="M 202 88 C 196 102, 198 118, 212 128 C 228 138, 252 134, 258 116 C 264 98, 248 84, 230 88 C 216 92, 212 106, 220 116 C 228 122, 240 118, 242 110" />

        {/* 4. Cụm ba cánh mây đỉnh tròn bồng bềnh (Top & Right Scalloped Cloud Lobes) */}
        {/* Cánh mây trên cùng bên trái */}
        <path d="M 178 40 C 176 25, 188 12, 205 12 C 220 12, 228 22, 226 36" />
        
        {/* Cánh mây đỉnh cao nhất ở giữa */}
        <path d="M 226 36 C 236 20, 256 18, 270 28 C 284 38, 284 56, 274 68" />
        
        {/* Cánh mây bên phải */}
        <path d="M 274 68 C 290 70, 304 82, 304 98 C 304 114, 288 126, 270 122" />

        {/* 5. Vòng xoáy ốc nhỏ đuôi bên phải (Far-right delicate curl) */}
        <path d="M 270 122 C 285 126, 298 118, 302 106 C 306 94, 296 82, 282 86 C 274 88, 272 98, 280 104 C 286 108, 292 102, 290 96" />

        {/* Nét lượn liên kết khối mây uyển chuyển */}
        <path d="M 222 56 C 238 60, 254 58, 266 50" />
        <path d="M 258 116 C 268 118, 278 115, 284 108" />
      </g>
    </svg>
  );
}
