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

## 掃描作業流程

同番號的場內看板＋客戶看板各掃一張為一組配對（順序不限）。
- `countInternal === countCustomer` → 配對成功（播三音上升音＋綠色全螢幕閃爍）
- 配對成功後再掃下一個番號才換批次
- 兩邊張數不一致時掃到新番號 → 跳警報畫面

## 設計風格

- 深色工業風介面（背景色 `#060c18`）
- 強調色：青色 `#00c8ff`、綠色 `#00e676`、紅色 `#ff1744`
- 介面語言：繁體中文
