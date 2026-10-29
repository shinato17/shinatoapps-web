/* ==========================================================================
   SHINATO POS DEMO - İSTATİSTİKLER EKRANI VE GRAFİKLERİ (stats.js)
   (Girişlerle ilgili tüm alanlar çıkarıldı, Mor & Kırık Beyaz tema)
   ========================================================================== */

const StatsState = {
    filterMode: "today",
    startDate: getTodayDateObj(),
    endDate: getTodayDateObj(),
    leastSoldList: [],
    hourlyCounts: {},
    hourlyHitboxes: [],
    hoveredHour: null,
    dailySeries: [],
    dailyHitboxes: [],
    hoveredDayIdx: null
};

function initStatsView() {
    const hCanvas = document.getElementById("st-hourly-canvas");
    const dCanvas = document.getElementById("st-daily-canvas");

    if (hCanvas) {
        hCanvas.addEventListener("mousemove", onHourlyChartHover);
        hCanvas.addEventListener("mouseleave", () => {
            if (StatsState.hoveredHour !== null) {
                StatsState.hoveredHour = null;
                drawHourlyBarChart();
            }
        });
    }

    if (dCanvas) {
        dCanvas.addEventListener("mousemove", onDailyChartHover);
        dCanvas.addEventListener("mouseleave", () => {
            if (StatsState.hoveredDayIdx !== null) {
                StatsState.hoveredDayIdx = null;
                drawDailyLineChart();
            }
        });
    }

    window.addEventListener("resize", () => {
        if (POSState.currentScreen === "İstatistikler") {
            drawHourlyBarChart();
            drawDailyLineChart();
        }
    });

    applyStatsPeriodFilter("today");
}

function refreshStatsScreen() {
    calculateAndRenderStats();
}

function updateStatsFilterButtonsStyle() {
    const mapping = [
        ["today", "btn-stats-today", "Bugün"],
        ["week", "btn-stats-week", "Bu hafta"],
        ["month", "btn-stats-month", "Bu ay"],
        ["custom", "btn-stats-custom", null]
    ];
    mapping.forEach(([key, btnId, defTxt]) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        if (defTxt) btn.innerText = defTxt;
        btn.classList.toggle("active-today", StatsState.filterMode === key);
    });
}

function applyStatsPeriodFilter(mode) {
    StatsState.filterMode = mode;
    const today = DemoDB.getActiveBusinessDate();

    if (mode === "today") {
        StatsState.startDate = today;
        StatsState.endDate = today;
        document.getElementById("btn-stats-custom").innerText = "Tarih Seç";
    } else if (mode === "week") {
        const s = new Date(today);
        s.setDate(s.getDate() - 6);
        StatsState.startDate = s;
        StatsState.endDate = today;
        document.getElementById("btn-stats-custom").innerText = "Tarih Seç";
    } else if (mode === "month") {
        const s = new Date(today);
        s.setDate(s.getDate() - 29);
        StatsState.startDate = s;
        StatsState.endDate = today;
        document.getElementById("btn-stats-custom").innerText = "Tarih Seç";
    }

    StatsState.hoveredHour = null;
    StatsState.hoveredDayIdx = null;
    updateStatsFilterButtonsStyle();
    calculateAndRenderStats();
}

function applyCustomStatsDates(d1, d2) {
    StatsState.startDate = d1;
    StatsState.endDate = d2;
    StatsState.filterMode = "custom";
    updateStatsFilterButtonsStyle();

    const btnCustom = document.getElementById("btn-stats-custom");
    if (formatDateISO(d1) === formatDateISO(d2)) {
        btnCustom.innerText = formatDateDotDMY(d1);
    } else {
        const d1Short = `${String(d1.getDate()).padStart(2, "0")}.${String(d1.getMonth() + 1).padStart(2, "0")}`;
        btnCustom.innerText = `${d1Short} - ${formatDateDotDMY(d2)}`;
    }
    calculateAndRenderStats();
}

function fmtTL(amount) {
    const val = Math.round(parseFloat(amount || 0) * 100) / 100;
    return `${Number.isInteger(val) ? val : val} TL`;
}

function extractIndividualCampaignCodes(rawCode, itemsJson) {
    if (!rawCode) return [];
    const code = rawCode.trim();
    if (code.startsWith("KOMBO:")) {
        return code.split(":")[1].split(",").map(c => c.trim()).filter(c => c && c !== "KOMBO");
    }
    if (code === "KOMBO" && typeof CampaignEngine !== "undefined") {
        try {
            const cart = JSON.parse(itemsJson);
            const allCamps = DemoDB.getAllCampaigns();
            const matched = [];
            allCamps.forEach(camp => {
                const res = CampaignEngine.evaluateCart(cart, [camp], false);
                if (res.discount > 0 && res.code) matched.push(res.code);
            });
            return matched;
        } catch (e) { return []; }
    }
    return [code];
}

function calculateAndRenderStats() {
    const startTs = `${formatDateISO(StatsState.startDate)} 00:00:00`;
    const endTs = `${formatDateISO(StatsState.endDate)} 23:59:59`;
    const sales = DemoDB.getSalesByDateRange(startTs, endTs, "approved");

    let totalCiro = 0.0;
    let kartCiro = 0.0;
    let nakitCiro = 0.0;
    let totalDiscount = 0.0;
    let discountedSaleCount = 0;
    const campaignCounts = {};
    const prodStats = {};

    StatsState.hourlyCounts = {};
    for (let h = 8; h <= 23; h++) StatsState.hourlyCounts[h] = 0;

    const dailyMap = {};
    const currD = new Date(StatsState.startDate);
    while (currD <= StatsState.endDate) {
        dailyMap[formatDateISO(currD)] = { dateObj: new Date(currD), rev: 0.0, count: 0 };
        currD.setDate(currD.getDate() + 1);
    }

    sales.forEach(s => {
        const amt = parseFloat(s.total_amount || 0);
        const disc = parseFloat(s.discount_amount || 0);
        totalCiro += amt;
        if (s.payment_type === "Kart") kartCiro += amt;
        else if (s.payment_type === "Nakit") nakitCiro += amt;

        if (disc > 0) {
            totalDiscount += disc;
            discountedSaleCount += 1;
            const codes = extractIndividualCampaignCodes(s.discount_code, s.items_json);
            codes.forEach(c => { campaignCounts[c] = (campaignCounts[c] || 0) + 1; });
        }

        const [datePart, timePart] = (s.timestamp || "").split(" ");
        const hr = timePart ? parseInt(timePart.split(":")[0], 10) : -1;

        let itemQtySum = 0;
        let itemsDict = {};
        try { itemsDict = JSON.parse(s.items_json); } catch (e) {}

        Object.values(itemsDict).forEach(item => {
            const pName = String(item.name || "-").trim();
            const pQty = parseInt(item.qty || 0, 10);
            const pPrice = parseFloat(item.price || 0);
            itemQtySum += pQty;
            if (!prodStats[pName]) prodStats[pName] = { qty: 0, rev: 0.0 };
            prodStats[pName].qty += pQty;
            prodStats[pName].rev += pQty * pPrice;
        });

        if (hr >= 8 && hr <= 23 && itemQtySum > 0) {
            StatsState.hourlyCounts[hr] += itemQtySum;
        }

        if (dailyMap[datePart]) {
            dailyMap[datePart].rev += amt;
            dailyMap[datePart].count += 1;
        }
    });

    // 1. Finans Güncelleme
    document.getElementById("st-total-ciro").innerText = fmtTL(totalCiro);
    document.getElementById("st-kart-ciro").innerText = fmtTL(kartCiro);
    document.getElementById("st-nakit-ciro").innerText = fmtTL(nakitCiro);
    renderPaymentRatioBar(kartCiro, nakitCiro);

    // 2. Ürünler ve Ürün Satışları Sıralaması
    const catalogProds = DemoDB.getAllProductsForDropdown();
    const allCounts = {};
    catalogProds.forEach(([, pName]) => {
        allCounts[pName] = prodStats[pName] ? prodStats[pName].qty : 0;
    });
    Object.keys(prodStats).forEach(pName => {
        if (!(pName in allCounts)) allCounts[pName] = prodStats[pName].qty;
    });

    renderProductSalesRanking(allCounts);

    const prodEntries = Object.entries(prodStats);
    if (prodEntries.length > 0) {
        const mostSold = prodEntries.slice().sort((a, b) => b[1].qty - a[1].qty || b[1].rev - a[1].rev)[0];
        const mostRev = prodEntries.slice().sort((a, b) => b[1].rev - a[1].rev || b[1].qty - a[1].qty)[0];
        document.getElementById("st-most-sold").innerText = `${mostSold[0]} (${mostSold[1].qty} Adet)`;
        document.getElementById("st-most-rev").innerText = `${mostRev[0]} (${fmtTL(mostRev[1].rev)})`;
    } else {
        document.getElementById("st-most-sold").innerText = "-";
        document.getElementById("st-most-rev").innerText = "-";
    }

    const isSingleDay = StatsState.filterMode === "today" || formatDateISO(StatsState.startDate) === formatDateISO(StatsState.endDate);
    const leastTitle = document.getElementById("st-least-title");
    const leastBox = document.getElementById("st-least-sold");
    StatsState.leastSoldList = [];

    if (isSingleDay) {
        leastTitle.classList.add("grey-txt");
        leastBox.classList.add("grey-box");
        leastBox.innerText = "";
        leastBox.style.cursor = "default";
    } else {
        leastTitle.classList.remove("grey-txt");
        leastBox.classList.remove("grey-box");
        const countEntries = Object.entries(allCounts);
        if (countEntries.length === 0) {
            leastBox.innerText = "-";
            leastBox.style.cursor = "default";
        } else {
            const minQty = Math.min(...countEntries.map(x => x[1]));
            const tiedLeast = countEntries.filter(x => x[1] === minQty);
            StatsState.leastSoldList = tiedLeast;
            if (tiedLeast.length === 1) {
                leastBox.innerText = `${tiedLeast[0][0]} (${tiedLeast[0][1]} Adet)`;
                leastBox.style.cursor = "default";
            } else {
                leastBox.innerText = "Birden fazla ürün >";
                leastBox.style.cursor = "pointer";
            }
        }
    }

    // 3. Kampanyalar Özeti
    document.getElementById("st-total-discount").innerText = fmtTL(totalDiscount);
    const campEntries = Object.entries(campaignCounts);
    if (campEntries.length > 0) {
        const topCamp = campEntries.sort((a, b) => b[1] - a[1])[0];
        document.getElementById("st-top-campaign").innerText = `${topCamp[0]} (${topCamp[1]})`;
    } else {
        document.getElementById("st-top-campaign").innerText = "-";
    }
    const campRate = sales.length > 0 ? Math.round((discountedSaleCount / sales.length) * 100) : 0;
    document.getElementById("st-campaign-rate").innerText = `%${campRate}`;

    // 4. Satış Analizi (Sağ Panel)
    StatsState.dailySeries = Object.values(dailyMap).sort((a, b) => a.dateObj - b.dateObj);
    const revDayTitle = document.getElementById("st-best-rev-day-title");
    const revDayBox = document.getElementById("st-best-rev-day");
    const avgDayTitle = document.getElementById("st-best-avg-day-title");
    const avgDayBox = document.getElementById("st-best-avg-day");
    const dailyChartBox = document.getElementById("st-daily-chart-box");

    if (isSingleDay) {
        revDayTitle.classList.add("grey-txt"); revDayBox.classList.add("grey-box"); revDayBox.innerText = "";
        avgDayTitle.classList.add("grey-txt"); avgDayBox.classList.add("grey-box"); avgDayBox.innerText = "";
        dailyChartBox.style.borderColor = "var(--cat-line)";
    } else {
        revDayTitle.classList.remove("grey-txt"); revDayBox.classList.remove("grey-box");
        avgDayTitle.classList.remove("grey-txt"); avgDayBox.classList.remove("grey-box");
        dailyChartBox.style.borderColor = "var(--purple-border)";

        const activeDays = StatsState.dailySeries.filter(d => d.count > 0);
        if (activeDays.length > 0) {
            const bestRevD = activeDays.slice().sort((a, b) => b.rev - a.rev)[0];
            const bestAvgD = activeDays.slice().sort((a, b) => (b.rev / b.count) - (a.rev / a.count))[0];
            revDayBox.innerText = formatDateDotDMY(bestRevD.dateObj);
            avgDayBox.innerText = formatDateDotDMY(bestAvgD.dateObj);
        } else {
            revDayBox.innerText = "-";
            avgDayBox.innerText = "-";
        }
    }

    setTimeout(() => {
        drawHourlyBarChart();
        drawDailyLineChart();
    }, 10);
}

function renderPaymentRatioBar(kart, nakit) {
    const bar = document.getElementById("st-ratio-bar");
    bar.innerHTML = "";
    const total = kart + nakit;
    if (total <= 0) {
        bar.innerHTML = `<div style="width:100%;height:100%;background:var(--product-bg);display:flex;align-items:center;justify-content:center;color:var(--cat-line);font-weight:700;font-size:13px;">%0</div>`;
        return;
    }
    const kartPct = Math.round((kart / total) * 100);
    const nakitPct = 100 - kartPct;

    if (kartPct > 0) {
        const d1 = document.createElement("div");
        d1.className = "ratio-seg";
        d1.style.width = `${kartPct}%`;
        d1.style.backgroundColor = "var(--blue)";
        if (kartPct >= 12) d1.innerText = `%${kartPct}`;
        bar.appendChild(d1);
    }
    if (nakitPct > 0) {
        const d2 = document.createElement("div");
        d2.className = "ratio-seg";
        d2.style.width = `${nakitPct}%`;
        d2.style.backgroundColor = "var(--green)";
        if (kartPct > 0) d2.style.borderLeft = "3px solid var(--bg-dark)";
        if (nakitPct >= 12) d2.innerText = `%${nakitPct}`;
        bar.appendChild(d2);
    }
}

function renderProductSalesRanking(allCounts) {
    const box = document.getElementById("st-prod-ranking-list");
    box.innerHTML = "";
    const sorted = Object.entries(allCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"));
    if (sorted.length === 0) {
        box.innerHTML = `<div style="padding:25px;text-align:center;color:var(--cat-line);font-weight:700;">Katalogda ürün bulunmuyor.</div>`;
        return;
    }
    sorted.forEach(([pName, qty], idx) => {
        const r = document.createElement("div");
        r.className = "st-rank-row" + (qty > 0 ? "" : " zero-qty");
        r.innerHTML = `
            <span class="sr-idx">${idx + 1}.</span>
            <span class="sr-name">${pName}</span>
            <span class="sr-qty">${qty} Adet</span>
        `;
        box.appendChild(r);
    });
}

function openLeastSoldPopup() {
    if (StatsState.leastSoldList.length <= 1) return;
    const minQty = StatsState.leastSoldList[0][1];
    document.getElementById("least-sold-modal-title").innerText = `En Az Satan Ürünler (${minQty} Adet)`;
    const listEl = document.getElementById("least-sold-modal-list");
    listEl.innerHTML = "";

    StatsState.leastSoldList.forEach(([pName, qty], idx) => {
        const r = document.createElement("div");
        r.className = "sales-item-detail-row";
        r.innerHTML = `<span class="sid-qty">${idx + 1}.</span><span class="sid-name">${pName}</span><span class="sid-price" style="color:var(--cat-line);">${qty} Adet</span>`;
        listEl.appendChild(r);
    });
    document.getElementById("modal-least-sold").classList.add("active");
}

function closeLeastSoldPopup() {
    document.getElementById("modal-least-sold").classList.remove("active");
}

// ==========================================================================
// GRAFİK ÇİZİMLERİ VE EXCEL TOOLTIP
// ==========================================================================
function drawCanvasTooltip(ctx, cw, ch, anchorX, anchorY, line1, line2) {
    ctx.font = "bold 11px Segoe UI";
    const w1 = ctx.measureText(line1).width;
    const w2 = ctx.measureText(line2).width;
    const boxW = Math.max(115, Math.max(w1, w2) + 22);
    const boxH = 44;

    let tx = anchorX + 12;
    if (tx + boxW > cw - 6) tx = anchorX - boxW - 12;
    tx = Math.max(6, tx);

    let ty = anchorY - boxH - 6;
    if (ty < 6) ty = anchorY + 10;
    if (ty + boxH > ch - 6) ty = ch - boxH - 6;

    ctx.fillStyle = "#101010";
    ctx.fillRect(tx + 2, ty + 2, boxW, boxH);

    ctx.fillStyle = "#202020";
    ctx.strokeStyle = "#7b1fa2";
    ctx.lineWidth = 2;
    ctx.fillRect(tx, ty, boxW, boxH);
    ctx.strokeRect(tx, ty, boxW, boxH);

    ctx.fillStyle = "#7a7a7a";
    ctx.textAlign = "center";
    ctx.fillText(line1, tx + boxW / 2, ty + 16);

    ctx.fillStyle = "#F2F0EB";
    ctx.fillText(line2, tx + boxW / 2, ty + 34);
}

function drawHourlyBarChart() {
    const canvas = document.getElementById("st-hourly-canvas");
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width <= 30 || rect.height <= 30) return;

    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    StatsState.hourlyHitboxes = [];

    const padLeft = 36, padRight = 14, padTop = 14, padBottom = 26;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    ctx.strokeStyle = "#7a7a7a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    const hours = [];
    for (let hr = 8; hr <= 23; hr++) hours.push(hr);
    const maxVal = Math.max(0, ...Object.values(StatsState.hourlyCounts));
    const yMax = Math.max(4, maxVal);

    ctx.fillStyle = "#7a7a7a";
    ctx.font = "bold 10px Segoe UI";
    ctx.textAlign = "right";
    [0, 0.5, 1].forEach(ratio => {
        const val = Math.round(yMax * ratio);
        const yPos = padTop + plotH - ratio * plotH;
        ctx.fillText(String(val), padLeft - 6, yPos + 3);
    });

    const slotW = plotW / hours.length;
    const barHalfW = Math.max(3, Math.min(10, Math.floor(slotW * 0.32)));
    let tooltipTarget = null;

    hours.forEach((hr, idx) => {
        const cx = padLeft + (idx + 0.5) * slotW;
        const baseY = padTop + plotH;

        ctx.fillStyle = "#F2F0EB";
        ctx.font = "bold 10px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(String(hr).padStart(2, "0"), cx, baseY + 14);

        const cnt = StatsState.hourlyCounts[hr] || 0;
        const barH = cnt > 0 ? Math.max(4, (cnt / yMax) * (plotH - 6)) : 0;
        const topY = baseY - barH;
        const isHovered = StatsState.hoveredHour === hr;

        if (cnt > 0) {
            ctx.fillStyle = isHovered ? "#7b1fa2" : "#272727";
            ctx.strokeStyle = "#9c27b0";
            ctx.lineWidth = 2;
            ctx.fillRect(cx - barHalfW, topY, barHalfW * 2, barH - 1);
            ctx.strokeRect(cx - barHalfW, topY, barHalfW * 2, barH - 1);
        }

        const hb = {
            hr, cnt,
            x1: cx - slotW / 2, x2: cx + slotW / 2,
            topY: cnt > 0 ? topY : baseY - 12,
            baseY, cx
        };
        StatsState.hourlyHitboxes.push(hb);
        if (isHovered) tooltipTarget = hb;
    });

    if (tooltipTarget) {
        const hr = tooltipTarget.hr;
        drawCanvasTooltip(
            ctx, w, h, tooltipTarget.cx, tooltipTarget.topY,
            `Saat: ${String(hr).padStart(2, "0")}:00 - ${String(hr + 1).padStart(2, "0")}:00`,
            `Satış: ${tooltipTarget.cnt} Adet`
        );
    }
}

function onHourlyChartHover(e) {
    const canvas = document.getElementById("st-hourly-canvas");
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let foundHr = null;
    for (const hb of StatsState.hourlyHitboxes) {
        if (mx >= hb.x1 && mx <= hb.x2 && hb.cnt > 0) {
            if (my >= hb.topY - 15 && my <= hb.baseY + 18) {
                foundHr = hb.hr;
                break;
            }
        }
    }
    if (foundHr !== StatsState.hoveredHour) {
        StatsState.hoveredHour = foundHr;
        drawHourlyBarChart();
    }
}

function drawDailyLineChart() {
    const canvas = document.getElementById("st-daily-canvas");
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width <= 30 || rect.height <= 30) return;

    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    StatsState.dailyHitboxes = [];

    const isSingleDay = StatsState.filterMode === "today" || formatDateISO(StatsState.startDate) === formatDateISO(StatsState.endDate);
    if (isSingleDay || StatsState.dailySeries.length <= 1) return;

    const padLeft = 48, padRight = 16, padTop = 16, padBottom = 26;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    ctx.strokeStyle = "#7a7a7a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    const maxVal = Math.max(0, ...StatsState.dailySeries.map(d => d.rev));
    const yMax = Math.max(100.0, maxVal);

    ctx.fillStyle = "#7a7a7a";
    ctx.font = "bold 10px Segoe UI";
    ctx.textAlign = "right";
    [0, 0.5, 1].forEach(ratio => {
        const val = Math.round(yMax * ratio);
        const yPos = padTop + plotH - ratio * plotH;
        ctx.fillText(String(val), padLeft - 6, yPos + 3);
    });

    const nPts = StatsState.dailySeries.length;
    const labelStep = nPts <= 10 ? 1 : Math.max(2, Math.floor(nPts / 6));

    ctx.strokeStyle = "#9c27b0";
    ctx.lineWidth = 3;
    ctx.beginPath();

    StatsState.dailySeries.forEach((item, idx) => {
        const px = padLeft + (idx / (nPts - 1)) * plotW;
        const py = padTop + plotH - ((item.rev / yMax) * (plotH - 8));
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);

        StatsState.dailyHitboxes.push({
            idx, px, py,
            dateStr: formatDateDotDMY(item.dateObj),
            valStr: `Ciro: ${fmtTL(item.rev)}`
        });

        if (idx % labelStep === 0 || idx === nPts - 1) {
            const dd = String(item.dateObj.getDate()).padStart(2, "0");
            const mm = String(item.dateObj.getMonth() + 1).padStart(2, "0");
            ctx.fillStyle = "#F2F0EB";
            ctx.font = "bold 9px Segoe UI";
            ctx.textAlign = "center";
            ctx.fillText(`${dd}/${mm}`, px, padTop + plotH + 14);
        }
    });
    ctx.stroke();

    let tooltipHb = null;
    StatsState.dailyHitboxes.forEach(hb => {
        const isHov = hb.idx === StatsState.hoveredDayIdx;
        const r = isHov ? 6 : 3.5;
        ctx.beginPath();
        ctx.arc(hb.px, hb.py, r, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? "#ffffff" : "#9c27b0";
        ctx.fill();
        ctx.strokeStyle = isHov ? "#9c27b0" : "#202020";
        ctx.lineWidth = isHov ? 2 : 1;
        ctx.stroke();
        if (isHov) tooltipHb = hb;
    });

    if (tooltipHb) {
        drawCanvasTooltip(ctx, w, h, tooltipHb.px, tooltipHb.py, tooltipHb.dateStr, tooltipHb.valStr);
    }
}

function onDailyChartHover(e) {
    if (StatsState.dailyHitboxes.length === 0) return;
    const canvas = document.getElementById("st-daily-canvas");
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;

    let closest = StatsState.dailyHitboxes[0];
    StatsState.dailyHitboxes.forEach(hb => {
        if (Math.abs(hb.px - mx) < Math.abs(closest.px - mx)) closest = hb;
    });

    const newIdx = Math.abs(closest.px - mx) <= 24 ? closest.idx : null;
    if (newIdx !== StatsState.hoveredDayIdx) {
        StatsState.hoveredDayIdx = newIdx;
        drawDailyLineChart();
    }
}