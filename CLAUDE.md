# 理貨防錯系統

工廠理貨（物料清點／配送驗收）條碼掃描防錯系統。純前端，無後端。

## 頁面架構

| 檔案 | 功能 |
|------|------|
| `kanban-scan.html` | 主畫面：條碼掃描比對看板、計數器、批次管理 |
| `dashboard.html` | 工廠理貨防錯系統主儀表板 |
| `alert.html` | 錯誤警告狀態顯示 |
| `qr-gen.html` | QR 看板產生器 |
| `index.html` | 入口，直接跳轉至 `kanban-scan.html` |

## 技術棧

- 純 HTML／CSS／JavaScript（無框架）
- Tailwind CSS v3（透過 Vite 建置）
- 字型：Rajdhani、JetBrains Mono、DM Sans（Google Fonts）
- 深色主題為主（CSS 變數定義於 `:root`）

## 開發指令

```bash
npm run dev    # 啟動 Vite 開發伺服器
npm run build  # 建置產出
```

## 設計風格

- 深色工業風介面（背景色 `#060c18`）
- 強調色：青色 `#00c8ff`、綠色 `#00e676`、紅色 `#ff1744`
- 介面語言：繁體中文
