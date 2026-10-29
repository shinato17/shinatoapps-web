/* ==========================================================================
   SHINATO POS DEMO - GÜN SONU EKRANI (view_endofday.py -> endofday.js)
   ========================================================================== */

const EOD_ITEMS_PER_PAGE = 7;

const EODState = {
    currentDayRevenue: 0.0,
    historyPage: 1
};

function initEndOfDayView() {
    updateEodClock();
    setInterval(updateEodClock, 1000);
    loadEodSummary();
}

function updateEodClock() {
    const el = document.getElementById("eod-lbl-clock");
    if (el) {
        el.innerText = new Date().toTimeString().slice(0, 8);
    }
}

function fmtEodTL(val) {
    const v = Math.round(parseFloat(val || 0) * 100) / 100;
    return `${Number.isInteger(v) ? v : v} TL`;
}

function loadEodSummary() {
    const takenToday = DemoDB.isEodTakenToday();
    const targetDate = DemoDB.getActiveBusinessDate();

    const startTs = `${formatDateISO(targetDate)} 00:00:00`;
    const endTs = `${formatDateISO(targetDate)} 23:59:59`;
    const sales = DemoDB.getSalesByDateRange(startTs, endTs, "approved");

    let totalRev = 0.0;
    const prodCounts = {};

    sales.forEach(s => {
        totalRev += parseFloat(s.total_amount || 0);
        let itemsDict = {};
        try { itemsDict = JSON.parse(s.items_json); } catch (e) {}

        Object.values(itemsDict).forEach(item => {
            const pName = String(item.name || "-").trim();
            const pQty = parseInt(item.qty || 0, 10);
            prodCounts[pName] = (prodCounts[pName] || 0) + pQty;
        });
    });

    EODState.currentDayRevenue = totalRev;
    const revEl = document.getElementById("eod-lbl-revenue");
    if (revEl) revEl.innerText = fmtEodTL(totalRev);

    const top3Inner = document.getElementById("eod-top3-inner");
    if (top3Inner) {
        top3Inner.innerHTML = "";
        const top3 = Object.entries(prodCounts)
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"))
            .slice(0, 3);

        if (top3.length === 0) {
            top3Inner.innerHTML = `<div style="text-align:center;color:var(--cat-line);font-weight:700;font-size:15px;">Henüz ürün satışı yapılmadı.</div>`;
        } else {
            top3.forEach(([pName, pQty], idx) => {
                const row = document.createElement("div");
                row.className = "eod-top3-row";
                row.innerHTML = `<span>${idx + 1}. ${pName}</span><span>${pQty}</span>`;
                top3Inner.appendChild(row);
            });
        }
    }

    const alreadyEl = document.getElementById("eod-lbl-already-taken");
    const btnTake = document.getElementById("eod-btn-take");

    if (takenToday) {
        if (alreadyEl) alreadyEl.innerText = "Bugün zaten gün sonu alındı";
        if (btnTake) btnTake.disabled = true;
    } else {
        if (alreadyEl) alreadyEl.innerText = "";
        if (btnTake) btnTake.disabled = false;
    }
}

function openTakeEodConfirmPopup() {
    if (DemoDB.isEodTakenToday()) return;
    document.getElementById("modal-eod-confirm").classList.add("active");
}

function closeTakeEodConfirmPopup() {
    document.getElementById("modal-eod-confirm").classList.remove("active");
}

function confirmTakeEodAction() {
    DemoDB.takeEndOfDay(EODState.currentDayRevenue);
    closeTakeEodConfirmPopup();
    refreshReceiptUI();
    loadEodSummary();
    if (typeof initSalesView === "function") initSalesView();
}

function openEodHistoryPopup() {
    EODState.historyPage = 1;
    renderEodHistoryPage(1);
    document.getElementById("modal-eod-history").classList.add("active");
}

function closeEodHistoryPopup() {
    document.getElementById("modal-eod-history").classList.remove("active");
}

function renderEodHistoryPage(pageNum) {
    const rowsHolder = document.getElementById("eod-hist-rows");
    const pagBar = document.getElementById("eod-hist-pagination");
    rowsHolder.innerHTML = "";
    pagBar.innerHTML = "";

    const records = DemoDB.getEodHistory();
    const totalRecords = records.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / EOD_ITEMS_PER_PAGE));

    const currPage = Math.max(1, Math.min(totalPages, pageNum));
    EODState.historyPage = currPage;

    if (totalRecords === 0) {
        rowsHolder.innerHTML = `<div style="margin:auto;color:var(--cat-line);font-weight:700;font-size:15px;">Kayıtlı geçmiş gün sonu bulunmuyor.</div>`;
        return;
    }

    const startIdx = (currPage - 1) * EOD_ITEMS_PER_PAGE;
    const pageItems = records.slice(startIdx, startIdx + EOD_ITEMS_PER_PAGE);

    pageItems.forEach(([, dateDisp, totalAmt]) => {
        const r = document.createElement("div");
        r.className = "eod-hist-row";
        r.innerHTML = `<span>${dateDisp}</span><span>${fmtEodTL(totalAmt)}</span>`;
        rowsHolder.appendChild(r);
    });

    for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement("button");
        btn.className = "eod-page-btn" + (p === currPage ? " curr" : "");
        btn.innerText = p;
        btn.onclick = () => renderEodHistoryPage(p);
        pagBar.appendChild(btn);
    }
}

function openClearEodHistoryConfirmPopup() {
    if (DemoDB.getEodHistory().length === 0) return;
    document.getElementById("modal-eod-clear-confirm").classList.add("active");
}

function closeClearEodHistoryConfirmPopup() {
    document.getElementById("modal-eod-clear-confirm").classList.remove("active");
}

function confirmClearEodHistoryAction() {
    DemoDB.clearEodHistory();
    closeClearEodHistoryConfirmPopup();
    renderEodHistoryPage(1);
}