// 狀態管理
const state = {
    isRunning: false,
    timerInterval: null,
    secondsElapsed: 0,
    counts: {
        internal: 0,
        customer: 0
    },
    allSessionHistory: [], // 全局歷史紀錄供總結報告使用
    currentSKU: null,      // 第一筆掃描鎖定的品號
    alertTimerInterval: null,
    alertSecondsElapsed: 0,
    totalErrors: 0,
    scanHistory: []
};

// DOM 元素參考 (增加保護檢查)
const getEl = (id) => document.getElementById(id);
const elements = {
    views: {
        dashboard: getEl('dashboard-view'),
        alert: getEl('alert-view')
    },
    timer: getEl('timer-display'),
    startBtn: getEl('btn-start'),
    startIcon: getEl('start-btn-icon'),
    startText: getEl('start-btn-text'),
    endBtn: getEl('btn-end'),
    systemStatus: getEl('system-status'),
    lockStatus: getEl('scanner-lock-status'),
    barcodeInput: getEl('barcode-input'),
    skuDisplay: getEl('current-sku-display'),

    // 看板
    counts: {
        internal: getEl('count-internal'),
        customer: getEl('count-customer')
    },

    historyTable: getEl('scan-history'),

    // Alert View Elements
    resolveAlertBtn: getEl('btn-resolve-alert'),
    alertDisplays: {
        h: getEl('alert-h'),
        m: getEl('alert-m'),
        s: getEl('alert-s')
    },
    lastScanRaw: getEl('last-scan-raw')
};

// 格式化時間 (MM:SS) 或 (HH:MM:SS)
function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// 更新主儀表板計時器
function updateDashboardTimer() {
    state.secondsElapsed++;
    elements.timer.textContent = formatTime(state.secondsElapsed);
    elements.timer.classList.add('text-primary');
}

// 啟動/停止任務
function toggleTask() {
    if (!elements.startBtn) return;

    if (!state.isRunning) {
        // 開始任務
        state.isRunning = true;

        // 如果是全新開始，重置狀態
        if (state.secondsElapsed === 0) {
            state.counts.internal = 0;
            state.counts.customer = 0;
            state.scanHistory = [];
            state.allSessionHistory = [];
            state.currentSKU = null;
            state.totalErrors = 0;
            if (elements.counts.internal) elements.counts.internal.textContent = "0";
            if (elements.counts.customer) elements.counts.customer.textContent = "0";
            if (elements.skuDisplay) {
                elements.skuDisplay.innerHTML = '<span class="material-symbols-outlined">scan_delete</span> 尚未掃描 (等待首件)';
                elements.skuDisplay.className = "text-lg font-black text-slate-500 flex items-center gap-2";
            }
            renderHistory();
        }

        state.timerInterval = setInterval(updateDashboardTimer, 1000);

        // 更新 UI (使用更安全的方式)
        elements.startBtn.classList.remove('bg-industry-green', 'hover:bg-industry-green/90');
        elements.startBtn.classList.add('bg-industry-orange', 'hover:bg-industry-orange/90');

        if (elements.startIcon) elements.startIcon.textContent = 'pause_circle';
        if (elements.startText) elements.startText.textContent = '暫停理貨任務';

        if (elements.endBtn) {
            elements.endBtn.disabled = false;
            elements.endBtn.classList.remove('bg-slate-500', 'hover:bg-slate-600', 'opacity-50', 'cursor-not-allowed');
            elements.endBtn.classList.add('bg-industry-red', 'hover:bg-industry-red/90');
        }

        if (elements.lockStatus) {
            elements.lockStatus.innerHTML = '<span class="material-symbols-outlined text-[12px] text-industry-green">keyboard_hide</span> 掃描槍已解鎖，等待輸入中...';
            elements.lockStatus.className = "flex items-center gap-1 text-industry-green";
        }

        if (elements.barcodeInput) elements.barcodeInput.focus();
    } else {
        // 暫停任務
        state.isRunning = false;
        clearInterval(state.timerInterval);

        // 更新 UI
        elements.startBtn.classList.remove('bg-industry-orange', 'hover:bg-industry-orange/90');
        elements.startBtn.classList.add('bg-industry-green', 'hover:bg-industry-green/90');

        if (elements.startIcon) elements.startIcon.textContent = 'play_circle';
        if (elements.startText) elements.startText.textContent = '繼續理貨任務';

        if (elements.lockStatus) {
            elements.lockStatus.innerHTML = '<span class="material-symbols-outlined text-[12px]">lock</span> 任務暫停，掃描已鎖定';
            elements.lockStatus.className = "flex items-center gap-1 text-slate-400";
        }
    }
}

// 結束任務總結
function endTask() {
    if (!confirm('確定要結束目前的理貨任務嗎？系統將進行結算並產出報告。')) return;

    // 檢查最後一筆結算是否平衡
    if (state.counts.internal !== state.counts.customer) {
        alert('警告：目前正在處理的品號，廠內數量與客戶數量尚未吻合，無法直接結束！');
        return;
    }

    state.isRunning = false;
    clearInterval(state.timerInterval);

    // 產生報告
    const summaryMsg = `=== 理貨任務總結報告 ===\n\n` +
        `總計時長: ${formatTime(state.secondsElapsed)}\n` +
        `總掃描次數: ${state.allSessionHistory.length} 次\n` +
        `異常發生次數: ${state.totalErrors} 次\n\n` +
        `感謝您的使用，點擊確定重置系統。`;
    alert(summaryMsg);

    // 重置全部狀態
    state.secondsElapsed = 0;
    elements.timer.textContent = "00:00:00";
    state.counts.internal = 0;
    state.counts.customer = 0;
    elements.counts.internal.textContent = "0";
    elements.counts.customer.textContent = "0";

    state.scanHistory = [];
    state.allSessionHistory = [];
    state.currentSKU = null;
    renderHistory();

    // UI 恢復預設
    elements.startBtn.classList.replace('bg-industry-orange', 'bg-industry-green');
    elements.startBtn.classList.replace('hover:bg-industry-orange/90', 'hover:bg-industry-green/90');
    elements.startIcon.textContent = 'play_circle';
    elements.startText.textContent = '開始新理貨任務';

    elements.endBtn.disabled = true;
    elements.endBtn.classList.replace('bg-industry-red', 'bg-slate-500');
    elements.endBtn.classList.replace('hover:bg-industry-red/90', 'hover:bg-slate-600');
    elements.endBtn.classList.add('opacity-50', 'cursor-not-allowed');

    elements.skuDisplay.innerHTML = '<span class="material-symbols-outlined">scan_delete</span> 尚未掃描 (等待首件)';
    elements.skuDisplay.className = "text-lg font-black text-slate-500 flex items-center gap-2";
}

// 解析條碼資訊：判斷類別與提取品號
function getScanInfo(barcodeStr) {
    if (!barcodeStr) return { type: 'unknown', sku: '' };

    // 1. 廠內看板格式：75602-BZ110-00#D008#... 或是 85084-6RX0A#...
    if (barcodeStr.includes('#')) {
        const skuPart = barcodeStr.split('#')[0];
        const cleanSKU = skuPart.replace(/-/g, '').trim();
        return { type: 'internal', sku: cleanSKU };
    }

    // 2. 出貨看板格式 (通常長度大於 40 且具備固定位元)
    if (barcodeStr.length > 40) {
        // 先嘗試提取標準位置 (索引 44-56)
        let extracted = barcodeStr.substring(44, 56).trim();

        // 【關鍵修正】如果目前已經鎖定了品號，且該品號存在於長條碼中，則以鎖定的為準
        if (state.currentSKU && barcodeStr.includes(state.currentSKU)) {
            return { type: 'customer', sku: state.currentSKU };
        }
        return { type: 'customer', sku: extracted };
    }

    // 3. 通用備用邏輯
    const simpleSKU = barcodeStr.replace(/-/g, '').substring(0, 12).trim();
    return { type: barcodeStr.length < 22 ? 'internal' : 'customer', sku: simpleSKU };
}

// 處理掃描
function handleScan(barcodeStr) {
    // 更新除錯顯示 (不論是否運行)
    if (elements.lastScanRaw) elements.lastScanRaw.textContent = barcodeStr;
    console.log("偵測到掃描:", barcodeStr);

    if (!state.isRunning) {
        flashScreen('bg-red-500/30');
        setTimeout(() => {
            if (!state.isRunning) alert('請先點擊「開始理貨任務」解鎖掃描槍！\n偵測到內容：' + barcodeStr);
        }, 50);
        return;
    }

    // 1. 辨識與提取
    const { type, sku: scannedSKU } = getScanInfo(barcodeStr);

    if (type === 'unknown' || !scannedSKU) {
        console.warn('無法辨識條碼格式:', barcodeStr);
        flashScreen('bg-yellow-500/20');
        return;
    }

    // 2. 品號比對與鎖定邏輯
    if (!state.currentSKU) {
        state.currentSKU = scannedSKU;
        if (elements.skuDisplay) {
            elements.skuDisplay.innerHTML = `<span class="material-symbols-outlined">barcode_scanner</span> ${state.currentSKU}`;
            elements.skuDisplay.className = "text-lg font-black text-primary flex items-center gap-2";
        }
    }

    // 防錯：如果掃到的品號與當前鎖定的不同
    if (scannedSKU !== state.currentSKU) {
        // 只有在「當前兩邊數量已平」且「至少有一邊大於0」時，才允許自動切換品號 (換線)
        if (state.counts.internal === state.counts.customer && state.counts.internal > 0) {
            console.log(`[系統] 品號 ${state.currentSKU} 結算完成，自動切換至新品號 ${scannedSKU}`);
            state.currentSKU = scannedSKU;
            state.counts.internal = 0;
            state.counts.customer = 0;
            if (elements.counts.internal) elements.counts.internal.textContent = "0";
            if (elements.counts.customer) elements.counts.customer.textContent = "0";
            if (elements.skuDisplay) {
                elements.skuDisplay.innerHTML = `<span class="material-symbols-outlined">barcode_scanner</span> ${state.currentSKU} (新批次)`;
                elements.skuDisplay.className = "text-lg font-black text-industry-orange flex items-center gap-2";
            }
            flashScreen('bg-industry-green/20');
        } else {
            triggerAlert(state.currentSKU, scannedSKU, state.counts.internal, state.counts.customer);
            return;
        }
    }

    // 3. 正常計數邏輯
    state.counts[type]++;
    if (elements.counts[type]) {
        elements.counts[type].textContent = state.counts[type];
        const targetEl = elements.counts[type];
        targetEl.classList.remove('scale-110');
        void targetEl.offsetWidth; // Trigger reflow
        targetEl.classList.add('scale-110', 'transition-transform');
        setTimeout(() => targetEl.classList.remove('scale-110'), 200);
    }

    flashScreen(type === 'internal' ? 'bg-primary/20' : 'bg-industry-orange/20');

    // 新增歷史紀錄
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false });
    const record = { time: timeStr, type: type, raw: barcodeStr, sku: scannedSKU };

    state.scanHistory.unshift(record);
    state.allSessionHistory.push(record);

    if (state.scanHistory.length > 5) state.scanHistory.pop();
    renderHistory();

    if (elements.barcodeInput) elements.barcodeInput.focus();
}

// 畫面閃爍提示功能 (換線成功時)
function flashScreen(colorClass) {
    const overlay = document.createElement('div');
    overlay.className = `fixed inset-0 z-40 pointer-events-none transition-opacity duration-300 ${colorClass}`;
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.remove(), 300);
    }, 100);
}

// 渲染掃描歷史表格
function renderHistory() {
    if (state.scanHistory.length === 0) {
        elements.historyTable.innerHTML = `<tr><td colspan="3" class="px-6 py-8 text-center text-slate-500 italic">尚無掃描紀錄，請開始任務並掃描條碼</td></tr>`;
        return;
    }

    elements.historyTable.innerHTML = state.scanHistory.map((record, index) => {
        const opacity = index === 0 ? '' : `opacity-${Math.max(30, 100 - index * 20)}`;
        const typeBadge = record.type === 'internal'
            ? `<span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black border border-primary/20">廠內 (Internal)</span>`
            : `<span class="bg-industry-orange/10 text-industry-orange px-3 py-1 rounded-full text-xs font-black border border-industry-orange/20">客戶 (Customer)</span>`;

        return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${opacity}">
            <td class="px-6 py-4 font-mono text-sm text-slate-500">${record.time}</td>
            <td class="px-6 py-4">${typeBadge}</td>
            <td class="px-6 py-4 font-bold tracking-wider text-sm truncate max-w-xs" title="${record.raw}">${record.sku} <span class="text-xs text-slate-400 font-normal">...</span></td>
        </tr>
        `;
    }).join('');
}

/** 
 * Alert System Logic
 */
function updateAlertTimer() {
    state.alertSecondsElapsed++;
    const h = Math.floor(state.alertSecondsElapsed / 3600);
    const m = Math.floor((state.alertSecondsElapsed % 3600) / 60);
    const s = state.alertSecondsElapsed % 60;

    elements.alertDisplays.h.textContent = h.toString().padStart(2, '0');
    elements.alertDisplays.m.textContent = m.toString().padStart(2, '0');
    elements.alertDisplays.s.textContent = s.toString().padStart(2, '0');
}

// 觸發錯誤警告
function triggerAlert(oldSKU, newSKU, internalCount, customerCount) {
    state.totalErrors++;

    // 暫停背景主任務計時器
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }

    // 初始化異常計時器
    state.alertSecondsElapsed = 0;
    updateAlertTimer();
    state.alertTimerInterval = setInterval(updateAlertTimer, 1000);

    // 切換 View
    elements.views.dashboard.classList.add('hidden');
    elements.views.alert.classList.remove('hidden');

    // 更新警告 UI 訊息
    document.getElementById('alert-batch-id').textContent = oldSKU;
    document.getElementById('alert-expected').textContent = internalCount;
    document.getElementById('alert-actual').textContent = customerCount;

    const diff = Math.abs(internalCount - customerCount);
    document.getElementById('alert-diff').textContent = `數量落差: ${diff}`;

    document.getElementById('alert-message').innerHTML = `
        警告：前一產品數量不符！<br/>
        偵測到換線品號 <span class="text-yellow-400">${newSKU}</span>，<br/>
        但上一批品號 <span class="bg-white/20 px-2 rounded">${oldSKU}</span> 廠內(${internalCount})與客戶(${customerCount})數量不合。<br/>
        <span class="font-black underline mt-2 block">系統已強制鎖定並停止記錄。</span>
    `;
}

function resolveAlert() {
    // 停止異常計時器
    clearInterval(state.alertTimerInterval);

    // 恢復主畫面計時器
    if (state.isRunning) {
        state.timerInterval = setInterval(updateDashboardTimer, 1000);
    }

    // 切換回 Dashboard
    elements.views.alert.classList.add('hidden');
    elements.views.dashboard.classList.remove('hidden');

    // 將輸入焦點還給 input
    elements.barcodeInput.focus();
}

// 綁定事件
if (elements.startBtn) elements.startBtn.addEventListener('click', toggleTask);
if (elements.endBtn) elements.endBtn.addEventListener('click', endTask);

// 允許直接在鍵盤上輸入 (掃描槍模擬)
// 使用 keydown 並支援 Enter 與 Tab (掃描槍常用結尾符)
if (elements.barcodeInput) {
    elements.barcodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            const val = e.target.value.trim();
            if (val.length > 0) {
                handleScan(val);
                e.preventDefault(); // 避免 Tab 導致跳轉焦點
            }
            e.target.value = ''; // 清空 input
        }
    });
}

// 移除測試按鈕的綁定
const triggerAlertBtn = document.getElementById('btn-trigger-alert');
if (triggerAlertBtn) triggerAlertBtn.remove();
const simulateInternal = document.getElementById('btn-simulate-internal-scan');
if (simulateInternal) simulateInternal.removeEventListener('click', () => { });
const simulateCustomer = document.getElementById('btn-simulate-customer-scan');
if (simulateCustomer) simulateCustomer.removeEventListener('click', () => { });


// 重拾焦點機制 - 點擊畫面任何地方都確保 input 在 focus (若正在理貨)
document.addEventListener('click', () => {
    if (state.isRunning && elements.barcodeInput) {
        // 只有在非警告視窗下才抓回焦點
        if (!elements.views.alert || elements.views.alert.classList.contains('hidden')) {
            elements.barcodeInput.focus();
        }
    }
});

// 額外保險：如果使用者嘗試打字但焦點不在 input，且任務正運行中，自動帶回焦點
document.addEventListener('keydown', (e) => {
    if (!state.isRunning || !elements.barcodeInput) return;
    if (elements.views.alert && !elements.views.alert.classList.contains('hidden')) return;

    if (document.activeElement !== elements.barcodeInput && !e.metaKey && !e.ctrlKey) {
        // 排除控制鍵 (如 Shift, Tab 等)
        if (e.key.length === 1) {
            elements.barcodeInput.focus();
            // 這裡可以選擇是否主動補償首字 (對於 Mac 系統這很有幫助)
            // elements.barcodeInput.value += e.key; 
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            elements.barcodeInput.focus();
        }
    }
});

// 警告綁定
elements.resolveAlertBtn.addEventListener('click', resolveAlert);

// 初始化
renderHistory();
