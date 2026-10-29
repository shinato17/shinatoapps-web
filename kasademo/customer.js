/* ==========================================================================
   SHINATO POS DEMO - MÜŞTERİ EKRANI (view_customer.py -> customer.js)
   Kavisli Monitör Çizimi + 7sn Scramble Marka + Saat Modu + Shimmer Reklam + 10sn Teşekkür
   ========================================================================== */

const CUST_THANK_YOU_DURATION_MS = 10000;
const CUST_IDLE_TIMEOUT_SEC = 60.0;
const CUST_BRAND_SWITCH_MS = 7000;
const CUST_SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.&-/";

const DEFAULT_THANK_YOU_POOL = [
    "Siparişiniz alındı, harika bir çalışma seansı dileriz! :)",
    "Bol kafein, yüksek odak! Afiyet olsun. (•‿•)",
    "Notlarınızı hazırlayın, kahveniz yolda! (◠‿◕)",
    "Burası sizin alanınız, rahatça çalışın. Afiyet olsun! ( ◜‿◝ )♡",
    "Bugün de bizimle olduğunuz için teşekkürler. (◍•ᴗ•◍)❤",
    "Zihniniz açık, kahveniz taze olsun! ＼(^o^)／",
    "Verimli bir gün geçirmeniz dileğiyle, afiyet olsun. :)",
    "Çalışmaya başlamadan önceki en güzel mola. Afiyet olsun! ༼ つ ◕‿◕ ༽つ",
    "Masanıza geçin, gerisini bize bırakın. İyi çalışmalar! (•‿•)",
    "Güzel bir kahve molası her zaman iyi gelir. (◠‿◕)",
    "İşleriniz su gibi aksın, afiyet olsun! (づ｡◕‿‿◕｡)づ",
    "Sizi aramızda görmek çok güzel, iyi odaklanmalar! (◍•ᴗ•◍)❤"
];

const CustState = {
    isOpen: false,
    cartItems: [], // [[prodId, name, qty, lineTotal], ...]
    rowAnimState: {},
    targetTotal: 0.0,
    displayedTotal: 0.0,
    activeDiscount: 0.0,
    animRunning: false,

    cartEmptySinceTs: Date.now() / 1000.0,
    isIdleClockMode: false,
    idleAnimT: 0.0,
    idleAnimRunning: false,

    brandTexts: ["Shinato Software", "shinatoapps.com"],
    brandIndex: 0,
    currentBrandDisplay: "Shinato Software",
    currentBrandColor: "#d0d0d0",

    lastSeenApprovedSaleId: 0,
    thankYouActive: false,
    thankYouText: "",
    thankYouTimer: null,
    shuffledMessages: [],

    adList: [],
    currentAdIndex: 0,
    adText: "",
    adPhase: 0.0,
    adFadeAlpha: 1.0,
    adFadingOut: false
};

function initCustomerDisplay() {
    CustState.lastSeenApprovedSaleId = getLatestApprovedSaleId();
    refreshCustomerAdsFromDB();
    setupCustomerWindowDrag();

    // 1. Reklam Shimmer Döngüsü (80ms)
    setInterval(() => {
        if (!CustState.thankYouActive && CustState.adText) {
            CustState.adPhase += 0.14;
            if (CustState.adFadingOut) {
                CustState.adFadeAlpha -= 0.15;
                if (CustState.adFadeAlpha <= 0.0) {
                    CustState.adFadeAlpha = 0.0;
                    CustState.adFadingOut = false;
                    if (CustState.adList.length > 0) {
                        CustState.currentAdIndex = (CustState.currentAdIndex + 1) % CustState.adList.length;
                        CustState.adText = CustState.adList[CustState.currentAdIndex];
                    }
                }
            } else if (CustState.adFadeAlpha < 1.0) {
                CustState.adFadeAlpha = Math.min(1.0, CustState.adFadeAlpha + 0.15);
            }
            if (CustState.isOpen) renderCustomerScene();
        }
    }, 80);

    // 2. Reklam Değişim Döngüsü (10 sn)
    setInterval(() => {
        refreshCustomerAdsFromDB();
        if (CustState.adList.length > 1) {
            CustState.adFadingOut = true;
        }
    }, 10000);

    // 3. Boşta Kalma (Saat Modu) İzleyicisi (1 sn)
    setInterval(() => {
        const nowTs = Date.now() / 1000.0;
        if (CustState.cartItems.length === 0 && !CustState.thankYouActive) {
            if (!CustState.isIdleClockMode && (nowTs - CustState.cartEmptySinceTs >= CUST_IDLE_TIMEOUT_SEC)) {
                CustState.isIdleClockMode = true;
                startCustIdleTransition();
            }
        } else {
            CustState.cartEmptySinceTs = nowTs;
            if (CustState.isIdleClockMode) {
                CustState.isIdleClockMode = false;
                startCustIdleTransition();
            }
        }
        if (CustState.isOpen && CustState.idleAnimT > 0.0 && !CustState.idleAnimRunning && !CustState.animRunning) {
            renderCustomerScene();
        }
    }, 1000);

    // 4. 7 Saniyede Bir Harf Dönüşümlü Marka Animasyonu
    setTimeout(triggerBrandMorphCycle, CUST_BRAND_SWITCH_MS);
}

function toggleCustomerDisplay() {
    const win = document.getElementById("customer-display-win");
    const btn = document.getElementById("btn-cust-screen");
    CustState.isOpen = win.style.display === "none";
    win.style.display = CustState.isOpen ? "flex" : "none";

    // Sadece açıkken beyaz çerçeveli olur
    if (btn) {
        btn.classList.toggle("active-cust", CustState.isOpen);
    }

    if (CustState.isOpen) {
        refreshCustomerAdsFromDB();
        renderCustomerScene();
    }
}

function getLatestApprovedSaleId() {
    const approved = DemoDB.sales.filter(s => s.status === "approved");
    return approved.length > 0 ? Math.max(...approved.map(s => s.id)) : 0;
}

function refreshCustomerAdsFromDB() {
    const rows = DemoDB.getAdCampaigns();
    CustState.adList = rows.map(r => r[1]).filter(Boolean);
    if (CustState.adList.length === 0) {
        CustState.adText = "";
        CustState.currentAdIndex = 0;
    } else {
        CustState.currentAdIndex %= CustState.adList.length;
        CustState.adText = CustState.adList[CustState.currentAdIndex];
    }
}

function pickNextThankYouMessage() {
    if (CustState.shuffledMessages.length === 0) {
        CustState.shuffledMessages = DEFAULT_THANK_YOU_POOL.slice().sort(() => Math.random() - 0.5);
    }
    return CustState.shuffledMessages.pop();
}

function showCustThankYouScreen() {
    if (CustState.thankYouTimer) clearTimeout(CustState.thankYouTimer);
    CustState.thankYouActive = true;
    CustState.thankYouText = pickNextThankYouMessage();
    if (CustState.isOpen) renderCustomerScene();
    CustState.thankYouTimer = setTimeout(hideCustThankYouScreen, CUST_THANK_YOU_DURATION_MS);
}

function hideCustThankYouScreen() {
    if (CustState.thankYouTimer) {
        clearTimeout(CustState.thankYouTimer);
        CustState.thankYouTimer = null;
    }
    if (CustState.thankYouActive) {
        CustState.thankYouActive = false;
        CustState.cartEmptySinceTs = Date.now() / 1000.0;
        if (CustState.isOpen) renderCustomerScene();
    }
}

function updateCustomerDisplayCart(cartDict, netTotal, activeDiscount = 0.0) {
    const entries = Object.entries(cartDict || {});
    const hadItemsBefore = CustState.cartItems.length > 0;

    if (entries.length > 0) {
        CustState.cartEmptySinceTs = Date.now() / 1000.0;
        if (CustState.thankYouActive) hideCustThankYouScreen();
        if (CustState.isIdleClockMode) {
            CustState.isIdleClockMode = false;
            startCustIdleTransition();
        }
    } else {
        const latestApprovedId = getLatestApprovedSaleId();
        if (latestApprovedId > CustState.lastSeenApprovedSaleId) {
            CustState.lastSeenApprovedSaleId = latestApprovedId;
            CustState.cartItems = [];
            CustState.rowAnimState = {};
            CustState.targetTotal = 0.0;
            CustState.displayedTotal = 0.0;
            CustState.activeDiscount = 0.0;
            CustState.cartEmptySinceTs = Date.now() / 1000.0;
            showCustThankYouScreen();
            return;
        } else {
            CustState.lastSeenApprovedSaleId = latestApprovedId;
        }
        if (hadItemsBefore) {
            CustState.cartEmptySinceTs = Date.now() / 1000.0;
        }
    }

    const newItems = [];
    const currentIds = new Set();

    entries.forEach(([prodId, item]) => {
        currentIds.add(prodId);
        const name = String(item.name || "");
        const qty = parseInt(item.qty || 1, 10);
        const price = parseFloat(item.price || 0);
        const lineTotal = qty * price;
        newItems.push([prodId, name, qty, lineTotal]);

        if (!CustState.rowAnimState[prodId]) {
            CustState.rowAnimState[prodId] = {
                alpha: 0.15,
                offsetY: -18.0,
                dispPrice: lineTotal,
                flash: 1.0,
                lastQty: qty
            };
        } else {
            const st = CustState.rowAnimState[prodId];
            if (st.lastQty !== qty) {
                st.flash = 1.0;
                st.lastQty = qty;
            }
        }
    });

    Object.keys(CustState.rowAnimState).forEach(oldId => {
        if (!currentIds.has(oldId)) delete CustState.rowAnimState[oldId];
    });

    CustState.cartItems = newItems;
    CustState.targetTotal = parseFloat(netTotal || 0);
    CustState.activeDiscount = parseFloat(activeDiscount || 0);

    if (!CustState.animRunning) {
        CustState.animRunning = true;
        stepCustCartAnimation();
    }
}

function stepCustCartAnimation() {
    let stillMoving = false;

    CustState.cartItems.forEach(([prodId, , , targetLinePrice]) => {
        const st = CustState.rowAnimState[prodId];
        if (!st) return;

        if (st.alpha < 1.0) {
            st.alpha = Math.min(1.0, st.alpha + 0.14);
            stillMoving = true;
        }
        if (Math.abs(st.offsetY) > 0.6) {
            st.offsetY *= 0.68;
            stillMoving = true;
        } else {
            st.offsetY = 0.0;
        }
        if (st.flash > 0.0) {
            st.flash = Math.max(0.0, st.flash - 0.12);
            stillMoving = true;
        }
        const priceDiff = targetLinePrice - st.dispPrice;
        if (Math.abs(priceDiff) > 0.8) {
            st.dispPrice += priceDiff * 0.35;
            stillMoving = true;
        } else {
            st.dispPrice = targetLinePrice;
        }
    });

    const totalDiff = CustState.targetTotal - CustState.displayedTotal;
    if (Math.abs(totalDiff) > 0.8) {
        let step = totalDiff * 0.28;
        if (Math.abs(step) < 1.5) step = totalDiff > 0 ? 1.5 : -1.5;
        CustState.displayedTotal += step;
        stillMoving = true;
    } else {
        CustState.displayedTotal = CustState.targetTotal;
    }

    if (CustState.isOpen) renderCustomerScene();

    if (stillMoving) {
        setTimeout(stepCustCartAnimation, 28);
    } else {
        CustState.animRunning = false;
    }
}

function startCustIdleTransition() {
    if (!CustState.idleAnimRunning) {
        CustState.idleAnimRunning = true;
        stepCustIdleTransition();
    }
}

function stepCustIdleTransition() {
    const targetT = CustState.isIdleClockMode ? 1.0 : 0.0;
    const diff = targetT - CustState.idleAnimT;
    if (Math.abs(diff) > 0.03) {
        const step = diff > 0 ? 0.055 : -0.075;
        CustState.idleAnimT = Math.max(0.0, Math.min(1.0, CustState.idleAnimT + step));
        if (CustState.isOpen && !CustState.animRunning) renderCustomerScene();
        setTimeout(stepCustIdleTransition, 24);
    } else {
        CustState.idleAnimT = targetT;
        CustState.idleAnimRunning = false;
        if (CustState.isOpen && !CustState.animRunning) renderCustomerScene();
    }
}

function triggerBrandMorphCycle() {
    const oldStr = CustState.brandTexts[CustState.brandIndex];
    CustState.brandIndex = 1 - CustState.brandIndex;
    const newStr = CustState.brandTexts[CustState.brandIndex];
    runScrambleMorphStep(oldStr, newStr, 0, 18);
}

function runScrambleMorphStep(oldStr, newStr, step, totalSteps) {
    if (step > totalSteps) {
        CustState.currentBrandDisplay = newStr;
        CustState.currentBrandColor = "#d0d0d0";
        if (CustState.isOpen && !CustState.thankYouActive) renderCustomerScene();
        setTimeout(triggerBrandMorphCycle, CUST_BRAND_SWITCH_MS);
        return;
    }

    const progress = step / totalSteps;
    const curLen = Math.round(oldStr.length + (newStr.length - oldStr.length) * progress);
    const lockedCount = Math.floor(progress * curLen);

    let chars = "";
    for (let i = 0; i < curLen; i++) {
        if (i < lockedCount && i < newStr.length) chars += newStr[i];
        else if (i < newStr.length && newStr[i] === " ") chars += " ";
        else chars += CUST_SCRAMBLE_CHARS[Math.floor(Math.random() * CUST_SCRAMBLE_CHARS.length)];
    }

    CustState.currentBrandDisplay = chars;
    const glowFactor = Math.sin(progress * Math.PI);
    CustState.currentBrandColor = lerpHexColor("#d0d0d0", "#d896ff", glowFactor * 0.85);

    if (CustState.isOpen && !CustState.thankYouActive) renderCustomerScene();
    setTimeout(() => runScrambleMorphStep(oldStr, newStr, step + 1, totalSteps), 35);
}

// Renk ve Çizim Yardımcıları
function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r, g, b) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
    return `#${c(r)}${c(g)}${c(b)}`;
}

function lerpHexColor(hex1, hex2, t) {
    const clamped = Math.max(0.0, Math.min(1.0, t));
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    return rgbToHex(r1 + (r2 - r1) * clamped, g1 + (g2 - g1) * clamped, b1 + (b2 - b1) * clamped);
}

function smoothstep(t) {
    const x = Math.max(0.0, Math.min(1.0, t));
    return x * x * (3.0 - 2.0 * x);
}

function getAdShimmerColor() {
    const p = ((CustState.adPhase % (2 * Math.PI)) / (2 * Math.PI)) * 3.0;
    const dynColor = (typeof _currentCanvasColors !== "undefined" && _currentCanvasColors.shimmer)
        ? _currentCanvasColors.shimmer
        : "#c084fc";

    let baseCol;
    if (p < 1.0) baseCol = lerpHexColor(dynColor, "#ffffff", p);
    else if (p < 2.0) baseCol = lerpHexColor("#ffffff", "#c4c4c4", p - 1.0);
    else baseCol = lerpHexColor("#c4c4c4", dynColor, p - 2.0);

    if (CustState.adFadeAlpha < 1.0) {
        return lerpHexColor("#202020", baseCol, CustState.adFadeAlpha);
    }
    return baseCol;
}

function renderCustomerScene() {
    const canvas = document.getElementById("customer-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, w, h);

    // Arka Plandaki Morluk Kaldırıldı -> DEMO Fontuyla (MuseoModerno) Sistem Renginde Kocaman Blurlu "LOGO"
    ctx.save();
    ctx.filter = "blur(6px)";
    ctx.globalAlpha = 0.24;
    ctx.font = "700 165px 'MuseoModerno', sans-serif";
    ctx.fillStyle = (typeof _currentCanvasColors !== "undefined" && _currentCanvasColors.bright) ? _currentCanvasColors.bright : "#9c27b0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LOGO", cx, cy - 25);
    ctx.restore();
    ctx.textBaseline = "alphabetic";

    // Kavisli Monitör Çerçevesi Çizimi (view_customer.py _build_premium_static_background)
    const margin = 18;
    const frameBottom = h - 38;
    const cornerR = 28;
    const adBarTop = h - 92;
    const totalAreaTop = h - 185;

    ctx.strokeStyle = CustState.thankYouActive ? "rgba(123, 31, 162, 0.35)" : "#9c27b0";
    ctx.lineWidth = 2.5;

    // Dış Yuvarlatılmış Monitör Çerçevesi
    ctx.beginPath();
    ctx.roundRect(margin, margin, w - margin * 2, frameBottom - margin, cornerR);
    ctx.stroke();

    // Monitör Ayağı (Stand)
    ctx.beginPath();
    ctx.moveTo(cx - 125, frameBottom);
    ctx.lineTo(cx - 105, h - 5);
    ctx.moveTo(cx + 125, frameBottom);
    ctx.lineTo(cx + 105, h - 5);
    ctx.stroke();

    // Reklam Üst Çizgisi
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, adBarTop);
    ctx.lineTo(w - margin, adBarTop);
    ctx.stroke();

    // Kavisli Yan Kanat Çizgileri (Sol ve Sağ Bezier)
    const topOpenHalf = 175;
    const botOpenHalf = 135;
    const curveR = 26;

    const vLeftX = cx - topOpenHalf;
    const bLeftX = cx - botOpenHalf;
    const dx = bLeftX - vLeftX;
    const dy = adBarTop - totalAreaTop;
    const slopeLen = Math.hypot(dx, dy);

    ctx.beginPath();
    ctx.moveTo(margin, totalAreaTop);
    ctx.lineTo(vLeftX - curveR, totalAreaTop);
    ctx.quadraticCurveTo(vLeftX, totalAreaTop, vLeftX + curveR * (dx / slopeLen), totalAreaTop + curveR * (dy / slopeLen));
    ctx.lineTo(bLeftX, adBarTop);
    ctx.stroke();

    const vRightX = cx + topOpenHalf;
    const bRightX = cx + botOpenHalf;
    const dxR = bRightX - vRightX;

    ctx.beginPath();
    ctx.moveTo(w - margin, totalAreaTop);
    ctx.lineTo(vRightX + curveR, totalAreaTop);
    ctx.quadraticCurveTo(vRightX, totalAreaTop, vRightX + curveR * (dxR / slopeLen), totalAreaTop + curveR * (dy / slopeLen));
    ctx.lineTo(bRightX, adBarTop);
    ctx.stroke();

    // 10 Saniyelik Teşekkür Ekranı Aktifse
    if (CustState.thankYouActive) {
        ctx.fillStyle = "rgba(18, 18, 20, 0.78)";
        ctx.fillRect(0, 0, w, h);

        ctx.font = "bold 28px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText(CustState.thankYouText, cx + 2, cy + 2);
        ctx.fillStyle = "#F2F0EB";
        ctx.fillText(CustState.thankYouText, cx, cy);
        return;
    }

    // En Altta 7 Saniyede Bir Harf Dönüşümlü "Shinato Software" <-> "shinatoapps.com"
    ctx.font = "bold 13px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillStyle = CustState.currentBrandColor;
    ctx.fillText(CustState.currentBrandDisplay, cx, frameBottom + (h - frameBottom) / 2 + 4);

    // Sütun Koordinatları
    const colNameX = w * 0.23;
    const colQtyX = w * 0.52;
    const colPriceX = w * 0.79;

    const smoothT = smoothstep(CustState.idleAnimT);
    const headerVis = 1.0 - smoothT;

    if (headerVis > 0.02) {
        const headerOffsetY = Math.round(-24 * smoothT);
        const headerY = 52 + headerOffsetY;
        const headerCol = lerpHexColor("#202020", "#F2F0EB", headerVis);
        const sepCol = lerpHexColor("#202020", "#464646", headerVis);

        ctx.font = "bold 18px Segoe UI";
        ctx.fillStyle = headerCol;
        ctx.textAlign = "center";
        ctx.fillText("Ürün Adı", colNameX, headerY);
        ctx.fillText("Adet", colQtyX, headerY);
        ctx.fillText("Fiyatı", colPriceX, headerY);

        ctx.strokeStyle = sepCol;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(44, 76 + headerOffsetY);
        ctx.lineTo(w - 44, 76 + headerOffsetY);
        ctx.stroke();
    }

    // Sepetteki Ürünlerin Animasyonlu Çizimi
    const listTopY = 88;
    const listBottomY = totalAreaTop - 12;
    const availH = Math.max(100, listBottomY - listTopY);
    const numItems = CustState.cartItems.length;

    if (numItems > 0) {
        const maxRowH = 54;
        const rowH = Math.min(maxRowH, availH / numItems);
        const scaleRatio = rowH / maxRowH;
        const fontSz = Math.max(11, Math.round(19 * scaleRatio));

        CustState.cartItems.forEach(([prodId, name, qty], idx) => {
            const st = CustState.rowAnimState[prodId] || { alpha: 1.0, offsetY: 0.0, dispPrice: 0.0, flash: 0.0 };
            const baseRowCy = listTopY + (idx + 0.5) * rowH;
            const animCy = baseRowCy + st.offsetY;

            let rowColor = lerpHexColor("#202020", "#F2F0EB", st.alpha);
            if (st.flash > 0.0) {
                rowColor = lerpHexColor(rowColor, "#d896ff", st.flash);
            }

            const pInt = Math.round(st.dispPrice);
            ctx.font = `bold ${fontSz}px Segoe UI`;
            ctx.fillStyle = rowColor;
            ctx.textAlign = "center";
            ctx.fillText(name, colNameX, animCy + 5);
            ctx.fillText(String(qty), colQtyX, animCy + 5);
            ctx.fillText(`${pInt} TL`, colPriceX, animCy + 5);

            const sepY = listTopY + (idx + 1) * rowH;
            if (sepY <= listBottomY + 4) {
                ctx.strokeStyle = lerpHexColor("#202020", "#7a7a7a", st.alpha);
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(w * 0.08, sepY);
                ctx.lineTo(w * 0.92, sepY);
                ctx.stroke();
            }
        });
    }

    // Toplam Tutar veya 1 Dakika Boşta Kalınca Saat Modu
    const baseTotalCy = totalAreaTop + (adBarTop - totalAreaTop) / 2 + 12;

    if (smoothT < 0.5) {
        const priceVis = 1.0 - smoothT * 2.0;
        const priceOffsetY = Math.round(18 * (1.0 - priceVis));
        const isCounting = Math.abs(CustState.targetTotal - CustState.displayedTotal) > 1.0;
        const totalInt = Math.round(CustState.displayedTotal);
        const totalFontSz = isCounting ? 44 : 40;
        const baseTCol = isCounting ? "#e9d5ff" : "#F2F0EB";
        const drawTCol = lerpHexColor("#202020", baseTCol, priceVis);

        let totalCy = baseTotalCy + priceOffsetY;
        if (CustState.activeDiscount > 0) {
            const discInt = Math.round(CustState.activeDiscount);
            ctx.font = "bold 16px Segoe UI";
            ctx.fillStyle = lerpHexColor("#202020", "#d896ff", priceVis);
            ctx.textAlign = "center";
            ctx.fillText(`İndirim Uygulandı: -${discInt} TL`, cx, totalAreaTop + 22 + priceOffsetY);
            totalCy = totalAreaTop + 66 + priceOffsetY;
        }

        ctx.font = `bold ${totalFontSz}px Segoe UI`;
        ctx.fillStyle = drawTCol;
        ctx.textAlign = "center";
        ctx.fillText(`${totalInt} TL`, cx, totalCy);
    } else {
        const clockVis = (smoothT - 0.5) * 2.0;
        const clockOffsetY = Math.round(18 * (1.0 - clockVis));
        const clockCol = lerpHexColor("#202020", "#F2F0EB", clockVis);
        const nowClock = new Date().toTimeString().slice(0, 5);

        ctx.font = "bold 42px Segoe UI";
        ctx.fillStyle = clockCol;
        ctx.textAlign = "center";
        ctx.fillText(nowClock, cx, baseTotalCy + clockOffsetY);
    }

    // Alt Reklam Barı (Shimmer Efektli)
    if (CustState.adText) {
        const adCy = adBarTop + (frameBottom - adBarTop) / 2 + 6;
        ctx.font = "bold 17px Segoe UI";
        ctx.fillStyle = getAdShimmerColor();
        ctx.textAlign = "center";
        ctx.fillText(CustState.adText, cx, adCy);
    }

    // Eğer 2. Monitör (Ayrı Pencere) açıksa görüntüyü anında oraya da aktar
    if (window._detachedCustWin && !window._detachedCustWin.closed) {
        const extCanvas = window._detachedCustWin.document.getElementById("ext-cust-canvas");
        if (extCanvas) {
            extCanvas.getContext("2d").drawImage(canvas, 0, 0);
        }
    }
}

// Müşteri Ekranı Penceresini Fareyle Tutup Sürükleme
function setupCustomerWindowDrag() {
    const win = document.getElementById("customer-display-win");
    const handle = document.getElementById("cust-drag-handle");
    if (!win || !handle) return;

    let isDragging = false, startX = 0, startY = 0, initLeft = 0, initTop = 0;

    handle.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "BUTTON") return;
        isDragging = true;
        const rect = win.getBoundingClientRect();
        win.style.transform = "none";
        win.style.left = `${rect.left}px`;
        win.style.top = `${rect.top}px`;
        startX = e.clientX;
        startY = e.clientY;
        initLeft = rect.left;
        initTop = rect.top;
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        win.style.left = `${initLeft + (e.clientX - startX)}px`;
        win.style.top = `${initTop + (e.clientY - startY)}px`;
    });

    document.addEventListener("mouseup", () => { isDragging = false; });
}

function openDetachedCustomerWindow() {
    if (window._detachedCustWin && !window._detachedCustWin.closed) {
        window._detachedCustWin.focus();
        return;
    }
    const extWin = window.open("", "ShinatoCustomerDisplay", "popup=yes,width=960,height=600,left=150,top=100");
    if (!extWin) return;

    extWin.document.write(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <title>Müşteri Ekranı (2. Monitöre Taşıyabilirsiniz)</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body, html { width: 100%; height: 100%; background: #202020; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                canvas { width: 100vw; height: 100vh; object-fit: contain; display: block; }
            </style>
        </head>
        <body>
            <canvas id="ext-cust-canvas" width="960" height="600"></canvas>
        </body>
        </html>
    `);
    extWin.document.close();
    window._detachedCustWin = extWin;

    // Sayfa içi küçük pencereyi gizle, tam senkronize ayrı pencereyi çalıştır
    document.getElementById("customer-display-win").style.display = "none";
    setTimeout(() => renderCustomerScene(), 80);
}