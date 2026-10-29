/* ==========================================================================
   SHINATO POS DEMO - KAMPANYALAR EKRANI VE MOTORU (campaigns.js)
   ========================================================================== */

const MULTI_DISCOUNT_CODE = "KOMBO";
const STAFF_DISCOUNT_CODE = "PRSNL";

const CAMPAIGN_TYPES = [
    ["IKRM", "Harcama İkramı", "IKRM"],
    ["CPRAZ", "Çapraz Satış İndirimi", "CPRAZ"],
    ["STAR", "Günün Ürünü", "STAR"],
    ["STARY", "Günün Ürünü Yüzde", "STARY"],
    ["INDRM", "Harcama İndirimi", "INDRM"],
    ["INDMY", "Harcama İndirimi Yüzde", "INDMY"],
    ["SAAT_TL", "Günün Saatleri", "SAAT"],
    ["SAAT_YUZDE", "Günün Saatleri Yüzde", "SAATY"]
];

// ==========================================================================
// 1. KAMPANYA MOTORU (campaign_engine.py Birebir Karşılığı)
// ==========================================================================
const CampaignEngine = {
    evaluateCart(cart, activeCampaigns, allowStacking = false, staffDiscount = false, staffDiscountPct = 50.0) {
        if (!cart || Object.keys(cart).length === 0) return { discount: 0.0, code: "" };

        const subtotal = Object.values(cart).reduce((s, item) => s + item.price * item.qty, 0);
        if (subtotal <= 0) return { discount: 0.0, code: "" };

        if (staffDiscount) {
            const pct = Math.max(1.0, Math.min(100.0, parseFloat(staffDiscountPct)));
            return {
                discount: Math.round(subtotal * (pct / 100.0) * 100) / 100,
                code: STAFF_DISCOUNT_CODE
            };
        }

        if (!activeCampaigns || activeCampaigns.length === 0) return { discount: 0.0, code: "" };

        const now = new Date();
        const nowTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        const matchedDiscounts = [];

        activeCampaigns.forEach(camp => {
            const typeKey = camp[1];
            const code = camp[2];
            let params = {};
            try { params = JSON.parse(camp[4]); } catch (e) { return; }

            let disc = 0.0;

            if (typeKey === "IKRM") {
                const minSpend = parseFloat(params.min_spend || 0);
                const prodId = String(params.product_id || 0);
                if (subtotal >= minSpend && cart[prodId]) {
                    disc = parseFloat(cart[prodId].price);
                }
            } else if (typeKey === "CPRAZ") {
                const p1Id = String(params.product1_id || 0);
                const p2Id = String(params.product2_id || 0);
                const bundlePrice = parseFloat(params.bundle_price || 0);

                if (cart[p1Id] && cart[p2Id]) {
                    const pairs = (p1Id === p2Id)
                        ? Math.floor(cart[p1Id].qty / 2)
                        : Math.min(cart[p1Id].qty, cart[p2Id].qty);
                    if (pairs > 0) {
                        const normalPairPrice = cart[p1Id].price + cart[p2Id].price;
                        if (normalPairPrice > bundlePrice) {
                            disc = (normalPairPrice - bundlePrice) * pairs;
                        }
                    }
                }
            } else if (typeKey === "STAR") {
                const prodId = String(params.product_id || 0);
                const discVal = parseFloat(params.discount || 0);
                if (cart[prodId]) {
                    const unitDisc = Math.min(cart[prodId].price, discVal);
                    disc = unitDisc * cart[prodId].qty;
                }
            } else if (typeKey === "STARY") {
                const prodId = String(params.product_id || 0);
                const pct = parseFloat(params.percent || 0);
                if (cart[prodId] && pct > 0 && pct <= 100) {
                    disc = (cart[prodId].price * (pct / 100.0)) * cart[prodId].qty;
                }
            } else if (typeKey === "INDRM") {
                const minSpend = parseFloat(params.min_spend || 0);
                const discVal = parseFloat(params.discount || 0);
                if (subtotal >= minSpend) {
                    disc = Math.min(subtotal, discVal);
                }
            } else if (typeKey === "INDMY") {
                const minSpend = parseFloat(params.min_spend || 0);
                const pct = parseFloat(params.percent || 0);
                if (subtotal >= minSpend && pct > 0 && pct <= 100) {
                    disc = subtotal * (pct / 100.0);
                }
            } else if (typeKey === "SAAT_TL") {
                const startT = params.start_time || "00:00";
                const endT = params.end_time || "23:59";
                const prodId = String(params.product_id || 0);
                const discVal = parseFloat(params.discount || 0);
                if (this._isTimeInRange(nowTimeStr, startT, endT) && cart[prodId]) {
                    const unitDisc = Math.min(cart[prodId].price, discVal);
                    disc = unitDisc * cart[prodId].qty;
                }
            } else if (typeKey === "SAAT_YUZDE") {
                const startT = params.start_time || "00:00";
                const endT = params.end_time || "23:59";
                const prodId = String(params.product_id || 0);
                const pct = parseFloat(params.percent || 0);
                if (this._isTimeInRange(nowTimeStr, startT, endT) && cart[prodId] && pct > 0 && pct <= 100) {
                    disc = (cart[prodId].price * (pct / 100.0)) * cart[prodId].qty;
                }
            }

            if (disc > 0) {
                matchedDiscounts.push([Math.round(disc * 100) / 100, code]);
            }
        });

        if (matchedDiscounts.length === 0) return { discount: 0.0, code: "" };

        if (allowStacking) {
            if (matchedDiscounts.length === 1) {
                return { discount: matchedDiscounts[0][0], code: matchedDiscounts[0][1] };
            } else {
                const sum = matchedDiscounts.reduce((acc, d) => acc + d[0], 0);
                return { discount: Math.min(subtotal, Math.round(sum * 100) / 100), code: MULTI_DISCOUNT_CODE };
            }
        } else {
            let best = matchedDiscounts[0];
            matchedDiscounts.forEach(item => { if (item[0] > best[0]) best = item; });
            return { discount: best[0], code: best[1] };
        }
    },

    _isTimeInRange(nowStr, startStr, endStr) {
        if (startStr <= endStr) return nowStr >= startStr && nowStr <= endStr;
        return nowStr >= startStr || nowStr <= endStr;
    }
};

// ==========================================================================
// 2. KAMPANYALAR ARAYÜZÜ (view_campaigns.py)
// ==========================================================================
const CampaignsState = {
    currentTypeIndex: 0,
    ruleInputs: {},
    pendingDeleteId: null
};

function initCampaignsView() {
    updateCampaignCheckboxesUI();
    selectCampaignType(0);
    loadCampaignsTable();

    document.addEventListener("click", (e) => {
        const typeMenu = document.getElementById("camp-type-dropdown");
        const typeBox = document.getElementById("camp-selector-box");
        if (typeMenu && typeMenu.style.display === "flex") {
            if (!typeBox.contains(e.target) && !typeMenu.contains(e.target)) {
                typeMenu.style.display = "none";
            }
        }

        document.querySelectorAll(".rule-prod-dropdown").forEach(dd => {
            if (!dd.parentElement.contains(e.target)) {
                dd.style.display = "none";
            }
        });
    });
}

function refreshCampaignsScreen() {
    updateCampaignCheckboxesUI();
    renderRuleBuilder(CAMPAIGN_TYPES[CampaignsState.currentTypeIndex][0]);
    loadCampaignsTable();
}

function updateCampaignCheckboxesUI() {
    const stackOn = DemoDB.getDiscountStacking();
    const staffOn = DemoDB.getStaffDiscountEnabled();

    const btnStack = document.getElementById("btn-stack-check");
    const lblStack = document.getElementById("lbl-stack-text");
    btnStack.innerText = stackOn ? "✔" : "";
    btnStack.classList.toggle("checked", stackOn);
    lblStack.classList.toggle("checked", stackOn);

    const btnStaff = document.getElementById("btn-staff-check");
    const lblStaff = document.getElementById("lbl-staff-text");
    btnStaff.innerText = staffOn ? "✔" : "";
    btnStaff.classList.toggle("checked", staffOn);
    lblStaff.classList.toggle("checked", staffOn);
}

function toggleDiscountStacking() {
    const next = !DemoDB.getDiscountStacking();
    DemoDB.setDiscountStacking(next);
    updateCampaignCheckboxesUI();
    refreshReceiptUI();
}

function toggleStaffDiscountFeature() {
    const next = !DemoDB.getStaffDiscountEnabled();
    DemoDB.setStaffDiscountEnabled(next);
    updateCampaignCheckboxesUI();
    updateStaffButtonState();
    refreshReceiptUI();
}

function toggleCampaignTypeDropdown(e) {
    e.stopPropagation();
    const menu = document.getElementById("camp-type-dropdown");
    if (menu.style.display === "flex") { menu.style.display = "none"; return; }
    menu.innerHTML = "";
    CAMPAIGN_TYPES.forEach(([tKey, dispName, code], idx) => {
        const btn = document.createElement("button");
        btn.className = "cat-drop-item" + (idx === CampaignsState.currentTypeIndex ? " curr" : "");
        btn.innerText = `${dispName} (${code})`;
        btn.onclick = () => {
            menu.style.display = "none";
            selectCampaignType(idx);
        };
        menu.appendChild(btn);
    });
    menu.style.display = "flex";
}

function selectCampaignType(index) {
    CampaignsState.currentTypeIndex = index;
    const [typeKey, dispName, code] = CAMPAIGN_TYPES[index];
    document.getElementById("lbl-selected-camp-name").innerText = dispName;
    document.getElementById("lbl-selected-camp-code").innerText = code;
    renderRuleBuilder(typeKey);
}

function renderRuleBuilder(typeKey) {
    const container = document.getElementById("camp-rule-sentence");
    container.innerHTML = "";
    CampaignsState.ruleInputs = {};

    function addText(txt) {
        const span = document.createElement("span");
        span.className = "rule-static-txt";
        span.innerText = txt;
        container.appendChild(span);
    }

    function addNumberBox(key, width = 120) {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "rule-num-input";
        inp.style.width = `${width}px`;
        inp.addEventListener("input", () => {
            let v = inp.value.replace(",", ".").replace(/[^0-9.]/g, "");
            const parts = v.split(".");
            if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
            inp.value = v;
        });
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") handleAddCampaign(); });
        container.appendChild(inp);
        CampaignsState.ruleInputs[key] = { type: "number", el: inp };
    }

    function addTimeBox(key, width = 95) {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.maxLength = 5;
        inp.placeholder = "14:00";
        inp.className = "rule-num-input";
        inp.style.width = `${width}px`;
        inp.addEventListener("input", () => {
            inp.value = inp.value.replace(/[^0-9:.]/g, "");
        });
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") handleAddCampaign(); });
        container.appendChild(inp);
        CampaignsState.ruleInputs[key] = { type: "time", el: inp };
    }

    function addProductBox(key, width = 200) {
        const wrap = document.createElement("div");
        wrap.className = "rule-prod-select-wrap";

        const box = document.createElement("div");
        box.className = "rule-prod-box";
        box.style.width = `${width}px`;
        box.innerHTML = `<span class="rp-lbl">Ürün Seçin</span><span>▼</span>`;

        const dd = document.createElement("div");
        dd.className = "rule-prod-dropdown";
        dd.style.display = "none";

        const stateObj = { type: "product", selectedId: null, selectedName: null, boxEl: box };
        CampaignsState.ruleInputs[key] = stateObj;

        box.onclick = (e) => {
            e.stopPropagation();
            const isOpen = dd.style.display === "flex";
            document.querySelectorAll(".rule-prod-dropdown").forEach(el => el.style.display = "none");
            if (isOpen) return;

            dd.innerHTML = "";
            const allProds = DemoDB.getAllProductsForDropdown();
            allProds.forEach(([pid, pname, pprice]) => {
                const pInt = Number.isInteger(pprice) ? pprice : pprice.toFixed(2);
                const itemBtn = document.createElement("button");
                itemBtn.className = "rule-prod-item";
                itemBtn.innerText = `${pname} (${pInt} TL)`;
                itemBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    stateObj.selectedId = pid;
                    stateObj.selectedName = pname;
                    box.querySelector(".rp-lbl").innerText = pname;
                    box.classList.add("selected");
                    dd.style.display = "none";
                };
                dd.appendChild(itemBtn);
            });
            dd.style.display = "flex";
        };

        wrap.appendChild(box);
        wrap.appendChild(dd);
        container.appendChild(wrap);
    }

    if (typeKey === "IKRM") {
        addNumberBox("xxx", 130);
        addText("TL üstü harcamalarda");
        addProductBox("yyy", 210);
        addText("ikram.");
    } else if (typeKey === "CPRAZ") {
        addProductBox("xxx", 185);
        addText("ve");
        addProductBox("yyy", 185);
        addText("sadece");
        addNumberBox("zzz", 115);
        addText("TL.");
    } else if (typeKey === "STAR") {
        addText("Gün Boyunca");
        addProductBox("xxx", 210);
        addText(",");
        addNumberBox("yyy", 120);
        addText("TL indirimde.");
    } else if (typeKey === "STARY") {
        addText("Gün Boyunca");
        addProductBox("xxx", 210);
        addText(", yüzde");
        addNumberBox("yyy", 110);
        addText("indirimde.");
    } else if (typeKey === "INDRM") {
        addNumberBox("xxx", 140);
        addText("TL üzerine");
        addNumberBox("yyy", 140);
        addText("TL indirim.");
    } else if (typeKey === "INDMY") {
        addNumberBox("xxx", 140);
        addText("TL üzerine yüzde");
        addNumberBox("yyy", 120);
        addText("indirim.");
    } else if (typeKey === "SAAT_TL") {
        addTimeBox("t1", 90);
        addText("ve");
        addTimeBox("t2", 90);
        addText("saatleri arasında");
        addProductBox("yyy", 165);
        addText(",");
        addNumberBox("zzz", 95);
        addText("TL indirimde.");
    } else if (typeKey === "SAAT_YUZDE") {
        addTimeBox("t1", 90);
        addText("ve");
        addTimeBox("t2", 90);
        addText("saatleri arasında");
        addProductBox("yyy", 165);
        addText(", yüzde");
        addNumberBox("zzz", 85);
        addText("indirimde.");
    }
}

function parseAndValidateTime(rawStr) {
    let s = String(rawStr).trim().replace(".", ":");
    if (/^\d{4}$/.test(s)) s = `${s.slice(0, 2)}:${s.slice(2)}`;
    const parts = s.split(":");
    if (parts.length !== 2) return null;
    if (!/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) return null;
    const hh = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
        return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }
    return null;
}

function fmtNum(val) {
    const f = parseFloat(val);
    return Number.isInteger(f) ? String(f) : String(f);
}

function handleAddCampaign() {
    const [typeKey, , code] = CAMPAIGN_TYPES[CampaignsState.currentTypeIndex];
    const inputs = CampaignsState.ruleInputs;

    for (const info of Object.values(inputs)) {
        if (info.type === "number" || info.type === "time") {
            if (!info.el.value.trim()) {
                showSimpleAlertPopup("Lütfen kampanya kuralındaki\ntüm boş alanları doldurun.", true);
                return;
            }
        } else if (info.type === "product") {
            if (info.selectedId === null) {
                showSimpleAlertPopup("Lütfen kampanya kuralındaki\nürün seçimini yapın.", true);
                return;
            }
        }
    }

    let params = {};
    let ruleText = "";

    if (typeKey === "IKRM") {
        const xxx = fmtNum(inputs.xxx.el.value);
        const pId = inputs.yyy.selectedId;
        const pName = inputs.yyy.selectedName;
        params = { min_spend: parseFloat(xxx), product_id: pId, product_name: pName };
        ruleText = `${xxx} TL üstü harcamalarda ${pName} ikram.`;
    } else if (typeKey === "CPRAZ") {
        const p1Id = inputs.xxx.selectedId;
        const p1Name = inputs.xxx.selectedName;
        const p2Id = inputs.yyy.selectedId;
        const p2Name = inputs.yyy.selectedName;
        const zzz = fmtNum(inputs.zzz.el.value);
        params = { product1_id: p1Id, product1_name: p1Name, product2_id: p2Id, product2_name: p2Name, bundle_price: parseFloat(zzz) };
        ruleText = `${p1Name} ve ${p2Name} sadece ${zzz} TL.`;
    } else if (typeKey === "STAR") {
        const pId = inputs.xxx.selectedId;
        const pName = inputs.xxx.selectedName;
        const yyy = fmtNum(inputs.yyy.el.value);
        params = { product_id: pId, product_name: pName, discount: parseFloat(yyy) };
        ruleText = `Gün Boyunca ${pName}, ${yyy} TL indirimde.`;
    } else if (typeKey === "STARY") {
        const pId = inputs.xxx.selectedId;
        const pName = inputs.xxx.selectedName;
        const rawPct = parseFloat(inputs.yyy.el.value);
        if (!(rawPct > 0 && rawPct <= 100)) {
            showSimpleAlertPopup("Yüzde indirim oranı 0 ile 100\narasında olmalıdır!", true);
            return;
        }
        const yyy = fmtNum(rawPct);
        params = { product_id: pId, product_name: pName, percent: parseFloat(yyy) };
        ruleText = `Gün Boyunca ${pName}, yüzde ${yyy} indirimde.`;
    } else if (typeKey === "INDRM") {
        const xxx = fmtNum(inputs.xxx.el.value);
        const yyy = fmtNum(inputs.yyy.el.value);
        params = { min_spend: parseFloat(xxx), discount: parseFloat(yyy) };
        ruleText = `${xxx} TL üzerine ${yyy} TL indirim.`;
    } else if (typeKey === "INDMY") {
        const xxx = fmtNum(inputs.xxx.el.value);
        const rawPct = parseFloat(inputs.yyy.el.value);
        if (!(rawPct > 0 && rawPct <= 100)) {
            showSimpleAlertPopup("Yüzde indirim oranı 0 ile 100\narasında olmalıdır!", true);
            return;
        }
        const yyy = fmtNum(rawPct);
        params = { min_spend: parseFloat(xxx), percent: parseFloat(yyy) };
        ruleText = `${xxx} TL üzerine yüzde ${yyy} indirim.`;
    } else if (typeKey === "SAAT_TL") {
        const t1 = parseAndValidateTime(inputs.t1.el.value);
        const t2 = parseAndValidateTime(inputs.t2.el.value);
        if (!t1 || !t2) {
            showSimpleAlertPopup("Lütfen geçerli bir saat girin!\n(Örn: 14:00 ve 18:30)", true);
            return;
        }
        const pId = inputs.yyy.selectedId;
        const pName = inputs.yyy.selectedName;
        const zzz = fmtNum(inputs.zzz.el.value);
        params = { start_time: t1, end_time: t2, product_id: pId, product_name: pName, discount: parseFloat(zzz) };
        ruleText = `${t1} ve ${t2} saatleri arasında ${pName}, ${zzz} TL indirimde.`;
    } else if (typeKey === "SAAT_YUZDE") {
        const t1 = parseAndValidateTime(inputs.t1.el.value);
        const t2 = parseAndValidateTime(inputs.t2.el.value);
        if (!t1 || !t2) {
            showSimpleAlertPopup("Lütfen geçerli bir saat girin!\n(Örn: 14:00 ve 18:30)", true);
            return;
        }
        const pId = inputs.yyy.selectedId;
        const pName = inputs.yyy.selectedName;
        const rawPct = parseFloat(inputs.zzz.el.value);
        if (!(rawPct > 0 && rawPct <= 100)) {
            showSimpleAlertPopup("Yüzde indirim oranı 0 ile 100\narasında olmalıdır!", true);
            return;
        }
        const zzz = fmtNum(rawPct);
        params = { start_time: t1, end_time: t2, product_id: pId, product_name: pName, percent: parseFloat(zzz) };
        ruleText = `${t1} ve ${t2} saatleri arasında ${pName}, yüzde ${zzz} indirimde.`;
    }

    DemoDB.addCampaign(typeKey, code, ruleText, JSON.stringify(params));
    renderRuleBuilder(typeKey);
    loadCampaignsTable();
    refreshReceiptUI();
}

function loadCampaignsTable() {
    const tbody = document.getElementById("camp-table-body");
    tbody.innerHTML = "";

    const campaigns = DemoDB.getAllCampaigns();
    if (campaigns.length === 0) {
        tbody.innerHTML = `<div class="sales-empty-msg">Henüz eklenmiş bir kampanya bulunmuyor.</div>`;
        return;
    }

    campaigns.forEach(camp => {
        const [campId, , code, ruleText, , createdAt, isActive, isAd] = camp;
        const row = document.createElement("div");
        row.className = "camp-row camp-grid-cols";

        row.innerHTML = `
            <div class="c-cell">${code}</div><div class="s-vline"></div>
            <div class="c-cell left-align">${ruleText}</div><div class="s-vline"></div>
            <div class="c-cell">${createdAt}</div><div class="s-vline"></div>
            <div class="c-cell">
                <button class="camp-status-btn ${isActive === 1 ? '' : 'passive'}">${isActive === 1 ? 'Aktif' : 'Pasif'}</button>
            </div><div class="s-vline"></div>
            <div class="c-cell">
                <button class="camp-ad-btn ${isAd === 1 ? 'ad-on' : ''}">${isAd === 1 ? '✔' : ''}</button>
            </div><div class="s-vline"></div>
            <div class="c-cell">
                <button class="sales-cancel-btn">X</button>
            </div>
        `;

        row.querySelector(".camp-status-btn").onclick = () => {
            DemoDB.setCampaignActive(campId, isActive === 1 ? 0 : 1);
            loadCampaignsTable();
            refreshReceiptUI();
        };

        row.querySelector(".camp-ad-btn").onclick = () => {
            DemoDB.setCampaignAd(campId, isAd === 1 ? 0 : 1);
            loadCampaignsTable();
        };

        row.querySelector(".sales-cancel-btn").onclick = () => {
            CampaignsState.pendingDeleteId = campId;
            document.getElementById("modal-camp-delete").classList.add("active");
        };

        tbody.appendChild(row);
    });
}

function closeCampDeletePopup() {
    CampaignsState.pendingDeleteId = null;
    document.getElementById("modal-camp-delete").classList.remove("active");
}

function confirmCampDeleteAction() {
    if (CampaignsState.pendingDeleteId !== null) {
        DemoDB.deleteCampaign(CampaignsState.pendingDeleteId);
        closeCampDeletePopup();
        loadCampaignsTable();
        refreshReceiptUI();
    }
}