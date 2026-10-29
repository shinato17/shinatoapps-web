/* ==========================================================================
   SHINATO POS DEMO - VERİTABANI (30 GÜNLÜK GEÇMİŞ + 6 KAMPANYA) + ANA MOTOR
   ========================================================================== */

const TURKISH_MONTHS = [
    "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

function getTodayDateObj() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDateISO(dt) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDateDMY(dt) {
    const d = String(dt.getDate()).padStart(2, "0");
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const y = dt.getFullYear();
    return `${d}/${m}/${y}`;
}

function formatDateDotDMY(dt) {
    const d = String(dt.getDate()).padStart(2, "0");
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const y = dt.getFullYear();
    return `${d}.${m}.${y}`;
}

function getNowDateTimeShort() {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${d}/${m}/${y} ${hh}:${mm}`;
}

// ==========================================================================
// 1. KALICI VERİTABANI (30 Günlük Satış Geçmişi + 6 Hazır Kampanya)
// ==========================================================================
const DB_STORAGE_KEY = "shinato_pos_demo_db_v3";

const DemoDB = {
    settings: {
        staff_discount_enabled: "1",
        staff_discount_pct: "50",
        discount_stacking: "0",
        screen2_enabled: "1",
        last_eod_real_date: ""
    },

    categories: [
        [1, "Sıcak İçecekler"],
        [2, "Soğuk İçecekler"],
        [3, "Tatlılar & Unlu Mamuller"],
        [4, "Atıştırmalık & Ekstralar"]
    ],

    products: [
        // KATEGORİ 1: 20 ÜRÜN
        [101, "Espresso", 75, "8690101", 1, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [102, "Double Espresso", 90, "8690102", 2, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [103, "Americano", 90, "8690103", 3, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [104, "Filtre Kahve", 85, "8690104", 4, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [105, "Sütlü Filtre Kahve", 95, "8690105", 5, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [106, "Caffè Latte", 105, "8690106", 6, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [107, "Cappuccino", 105, "8690107", 7, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [108, "Flat White", 110, "8690108", 8, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [109, "Cortado", 95, "8690109", 9, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [110, "Caffè Mocha", 120, "8690110", 10, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [111, "White Chocolate Mocha", 125, "8690111", 11, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [112, "Caramel Macchiato", 125, "8690112", 12, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [113, "Türk Kahvesi", 70, "8690113", 13, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [114, "Duble Türk Kahvesi", 95, "8690114", 14, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [115, "Dibek Kahvesi", 85, "8690115", 15, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [116, "Sıcak Çikolata", 110, "8690116", 16, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [117, "Salep", 115, "8690117", 17, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [118, "Chai Tea Latte", 110, "8690118", 18, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [119, "Demleme Çay", 35, "8690119", 19, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],
        [120, "Fincan Bitki Çayı", 80, "8690120", 20, "01/10/2026 09:00", "01/10/2026 09:00", 1, 1],

        // KATEGORİ 2: 20 ÜRÜN
        [201, "Iced Americano", 95, "8690201", 1, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [202, "Iced Latte", 110, "8690202", 2, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [203, "Iced Cappuccino", 110, "8690203", 3, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [204, "Cold Brew", 115, "8690204", 4, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [205, "Cold Brew Latte", 125, "8690205", 5, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [206, "Iced Mocha", 125, "8690206", 6, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [207, "Iced White Mocha", 130, "8690207", 7, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [208, "Iced Caramel Macchiato", 130, "8690208", 8, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [209, "Iced Chai Tea Latte", 115, "8690209", 9, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [210, "Espresso Frappe", 125, "8690210", 10, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [211, "Caramel Frappe", 130, "8690211", 11, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [212, "Çikolatalı Frozen", 125, "8690212", 12, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [213, "Çilekli Frozen", 125, "8690213", 13, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [214, "Orman Meyveli Smoothie", 135, "8690214", 14, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [215, "Ev Yapımı Limonata", 90, "8690215", 15, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [216, "Naneli Limonata", 95, "8690216", 16, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [217, "Cool Lime", 115, "8690217", 17, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [218, "Berry Hibiscus", 115, "8690218", 18, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [219, "Taze Portakal Suyu", 105, "8690219", 19, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],
        [220, "Churchill", 65, "8690220", 20, "01/10/2026 09:00", "01/10/2026 09:00", 1, 2],

        // KATEGORİ 3: 14 ÜRÜN
        [301, "San Sebastian Cheesecake", 155, "8690301", 1, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [302, "Frambuazlı Cheesecake", 145, "8690302", 2, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [303, "Limonlu Cheesecake", 145, "8690303", 3, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [304, "İtalyan Tiramisu", 140, "8690304", 4, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [305, "Çilekli Magnolia", 125, "8690305", 5, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [306, "Muzlu Magnolia", 125, "8690306", 6, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [307, "Belçika Çikolatalı Brownie", 130, "8690307", 7, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [308, "Tereyağlı Kruvasan", 95, "8690308", 8, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [309, "Çikolatalı Kruvasan", 110, "8690309", 9, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [310, "Bademli Kruvasan", 115, "8690310", 10, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [311, "Damla Çikolatalı Cookie", 75, "8690311", 11, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [312, "Red Velvet Pasta", 140, "8690312", 12, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [313, "Havuçlu Tarçınlı Kek", 105, "8690313", 13, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],
        [314, "Mozaik Pasta", 110, "8690314", 14, "01/10/2026 09:00", "01/10/2026 09:00", 1, 3],

        // KATEGORİ 4: 5 ÜRÜN
        [401, "Kaşarlı Tost", 110, "8690401", 1, "01/10/2026 09:00", "01/10/2026 09:00", 1, 4],
        [402, "Karışık Sandviç", 135, "8690402", 2, "01/10/2026 09:00", "01/10/2026 09:00", 1, 4],
        [403, "Su (50cl)", 20, "8690403", 3, "01/10/2026 09:00", "01/10/2026 09:00", 1, 4],
        [404, "Sade Maden Suyu", 35, "8690404", 4, "01/10/2026 09:00", "01/10/2026 09:00", 1, 4],
        [405, "Ekstra Espresso Shot", 30, "8690405", 5, "01/10/2026 09:00", "01/10/2026 09:00", 1, 4]
    ],

    nextProductId: 500,
    sales: [],
    campaigns: [],
    eodHistory: [],
    nextCampaignId: 20,

    loadOrInit(forceReset = false) {
        const today = getTodayDateObj();
        const todayIso = formatDateISO(today);
        const todayDMY = formatDateDMY(today);

        if (!forceReset) {
            try {
                const raw = localStorage.getItem(DB_STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // Eğer aynı gün içindeysek mevcut veritabanını koru; yeni güne (00:00) geçildiyse sıfırla!
                    if (parsed.seededDate === todayIso) {
                        if (parsed.settings) this.settings = parsed.settings;
                        if (parsed.categories) this.categories = parsed.categories;
                        if (parsed.products) this.products = parsed.products;
                        if (parsed.sales) this.sales = parsed.sales;
                        if (parsed.campaigns) this.campaigns = parsed.campaigns;
                        if (parsed.eodHistory) this.eodHistory = parsed.eodHistory;
                        if (parsed.nextProductId) this.nextProductId = parsed.nextProductId;
                        if (parsed.nextCampaignId) this.nextCampaignId = parsed.nextCampaignId;
                        return;
                    }
                }
            } catch (e) {}
        }

        // Varsayılan Ayarları Sıfırla
        this.settings = {
            staff_discount_enabled: "1",
            staff_discount_pct: "50",
            discount_stacking: "0",
            screen2_enabled: "1",
            last_eod_real_date: ""
        };

        // 6 ADET HAZIR KAMPANYA
        this.campaigns = [
            [1, "CPRAZ", "CPRAZ", "Caffè Latte ve San Sebastian Cheesecake sadece 220 TL.", JSON.stringify({
                product1_id: 106, product1_name: "Caffè Latte",
                product2_id: 301, product2_name: "San Sebastian Cheesecake",
                bundle_price: 220
            }), todayDMY, 1, 1],
            [2, "IKRM", "IKRM", "350 TL üstü harcamalarda Türk Kahvesi ikram.", JSON.stringify({
                min_spend: 350, product_id: 113, product_name: "Türk Kahvesi"
            }), todayDMY, 1, 1],
            [3, "STAR", "STAR", "Gün Boyunca Cold Brew, 20 TL indirimde.", JSON.stringify({
                product_id: 204, product_name: "Cold Brew", discount: 20
            }), todayDMY, 1, 1],
            [4, "STARY", "STARY", "Gün Boyunca Tereyağlı Kruvasan, yüzde 20 indirimde.", JSON.stringify({
                product_id: 308, product_name: "Tereyağlı Kruvasan", percent: 20
            }), todayDMY, 1, 0],
            [5, "INDRM", "INDRM", "500 TL üzerine 60 TL indirim.", JSON.stringify({
                min_spend: 500, discount: 60
            }), todayDMY, 1, 1],
            [6, "SAAT_YUZDE", "SAATY", "14:00 ve 17:00 saatleri arasında Iced Latte, yüzde 15 indirimde.", JSON.stringify({
                start_time: "14:00", end_time: "17:00", product_id: 202, product_name: "Iced Latte", percent: 15
            }), todayDMY, 1, 0]
        ];

        // GİRİLEN GÜNDEN GERİYE DOĞRU 30 İŞLEM (Her güne 1 işlem, toplam 30 gün)
        this.sales = [];
        this.eodHistory = [];
        const sampleTemplates = [
            { items: { "106": { name: "Caffè Latte", price: 105, qty: 1 }, "301": { name: "San Sebastian Cheesecake", price: 155, qty: 1 } }, total: 220, disc: 40, code: "CPRAZ", pay: "Kart", hr: "10:15:20" },
            { items: { "202": { name: "Iced Latte", price: 110, qty: 2 }, "307": { name: "Belçika Çikolatalı Brownie", price: 130, qty: 1 } }, total: 350, disc: 0, code: "", pay: "Nakit", hr: "12:40:10" },
            { items: { "103": { name: "Americano", price: 90, qty: 1 }, "308": { name: "Tereyağlı Kruvasan", price: 95, qty: 1 } }, total: 166, disc: 19, code: "STARY", pay: "Kart", hr: "09:25:44" },
            { items: { "204": { name: "Cold Brew", price: 115, qty: 2 } }, total: 190, disc: 40, code: "STAR", pay: "Kart", hr: "15:18:05" },
            { items: { "111": { name: "White Chocolate Mocha", price: 125, qty: 2 }, "304": { name: "İtalyan Tiramisu", price: 140, qty: 1 }, "113": { name: "Türk Kahvesi", price: 70, qty: 1 } }, total: 390, disc: 70, code: "IKRM", pay: "Nakit", hr: "17:50:32" },
            { items: { "402": { name: "Karışık Sandviç", price: 135, qty: 2 }, "215": { name: "Ev Yapımı Limonata", price: 90, qty: 2 }, "311": { name: "Damla Çikolatalı Cookie", price: 75, qty: 1 } }, total: 465, disc: 60, code: "INDRM", pay: "Kart", hr: "19:10:12" },
            { items: { "107": { name: "Cappuccino", price: 105, qty: 1 }, "401": { name: "Kaşarlı Tost", price: 110, qty: 1 } }, total: 215, disc: 0, code: "", pay: "Nakit", hr: "21:05:50" }
        ];

        for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
            const dObj = new Date(today);
            dObj.setDate(dObj.getDate() - daysAgo);
            const isoStr = formatDateISO(dObj);
            const dotStr = formatDateDotDMY(dObj);
            const dd = String(dObj.getDate()).padStart(2, "0");
            const mm = String(dObj.getMonth() + 1).padStart(2, "0");
            const yy = String(dObj.getFullYear()).slice(-2);
            const tpl = sampleTemplates[daysAgo % sampleTemplates.length];

            this.sales.push({
                id: 30 - daysAgo,
                tx_code: `${dd}${mm}${yy}001`,
                timestamp: `${isoStr} ${tpl.hr}`,
                total_amount: tpl.total,
                discount_amount: tpl.disc,
                discount_code: tpl.code,
                payment_type: tpl.pay,
                items_json: JSON.stringify(tpl.items),
                status: "approved",
                cancel_type: ""
            });

            if (daysAgo > 0) {
                this.eodHistory.push([30 - daysAgo, dotStr, isoStr, tpl.total, `${isoStr} 23:00:00`]);
            }
        }

        this.save();
    },

    save() {
        try {
            localStorage.setItem(DB_STORAGE_KEY, JSON.stringify({
                seededDate: formatDateISO(getTodayDateObj()),
                settings: this.settings,
                categories: this.categories,
                products: this.products,
                sales: this.sales,
                campaigns: this.campaigns,
                eodHistory: this.eodHistory,
                nextProductId: this.nextProductId,
                nextCampaignId: this.nextCampaignId
            }));
        } catch (e) {}
    },

    // Gün Sonu ve Aktif İş Günü Metotları
    isEodTakenToday() {
        const realToday = formatDateISO(getTodayDateObj());
        return this.settings.last_eod_real_date === realToday;
    },

    getActiveBusinessDate() {
        const d = getTodayDateObj();
        if (this.isEodTakenToday()) {
            d.setDate(d.getDate() + 1);
        }
        return d;
    },

    takeEndOfDay(totalRevenue) {
        const todayObj = getTodayDateObj();
        const dispStr = formatDateDotDMY(todayObj);
        const isoStr = formatDateISO(todayObj);
        const nowFull = `${isoStr} ${new Date().toTimeString().slice(0, 8)}`;
        const nextId = this.eodHistory.length > 0 ? Math.max(...this.eodHistory.map(x => x[0])) + 1 : 1;

        this.eodHistory.push([nextId, dispStr, isoStr, parseFloat(totalRevenue || 0), nowFull]);
        this.settings.last_eod_real_date = isoStr;
        this.save();
    },

    getEodHistory() {
        return this.eodHistory.slice().sort((a, b) => b[0] - a[0]).map(r => [r[0], r[1], r[3]]);
    },

    clearEodHistory() {
        this.eodHistory = [];
        this.save();
    },

    getCategories() { return this.categories; },

    updateCategoryName(catId, newName) {
        const cat = this.categories.find(c => c[0] === catId);
        if (cat && newName.trim()) {
            cat[1] = newName.trim();
            this.save();
        }
    },

    getProductsByCategory(catId) {
        return this.products
            .filter(p => p[8] === catId)
            .sort((a, b) => a[4] - b[4] || a[0] - b[0])
            .map(p => [p[0], p[1], p[2], p[7]]);
    },

    getProductsDetailedByCategory(catId) {
        return this.products
            .filter(p => p[8] === catId)
            .sort((a, b) => a[4] - b[4] || a[0] - b[0])
            .map(p => [p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7]]);
    },

    getAllProductsForDropdown() {
        const catMap = Object.fromEntries(this.categories);
        return this.products
            .slice()
            .sort((a, b) => a[8] - b[8] || a[4] - b[4] || a[0] - b[0])
            .map(p => [p[0], p[1], p[2], catMap[p[8]] || ""]);
    },

    getProductByBarcode(barcode) {
        const code = String(barcode).trim();
        if (!code) return null;
        const p = this.products.find(item => item[3] === code);
        return p ? [p[0], p[1], p[2], p[7]] : null;
    },

    checkDuplicateBarcode(barcode, excludeId = null) {
        const code = String(barcode).trim();
        if (!code) return null;
        const conflict = this.products.find(p => p[3] === code && p[0] !== excludeId);
        return conflict ? conflict[1] : null;
    },

    addProduct(catId, name, price, barcode, isActive = 1) {
        const catProds = this.products.filter(p => p[8] === catId);
        const nextOrder = catProds.length > 0 ? Math.max(...catProds.map(p => p[4])) + 1 : 1;
        const nowStr = getNowDateTimeShort();
        const newId = ++this.nextProductId;
        this.products.push([
            newId, name.trim(), parseFloat(price), barcode.trim(),
            nextOrder, nowStr, nowStr, parseInt(isActive), catId
        ]);
        this.save();
        return newId;
    },

    updateProduct(prodId, name, newPrice, barcode, isActive = 1) {
        const p = this.products.find(item => item[0] === prodId);
        if (!p) return;
        const nowStr = getNowDateTimeShort();
        if (parseFloat(p[2]) !== parseFloat(newPrice)) p[6] = nowStr;
        p[1] = name.trim();
        p[2] = parseFloat(newPrice);
        p[3] = barcode.trim();
        p[7] = parseInt(isActive);
        this.save();
    },

    setProductActiveStatus(prodId, isActive) {
        const p = this.products.find(item => item[0] === prodId);
        if (p) { p[7] = parseInt(isActive); this.save(); }
    },

    deleteProduct(prodId, catId) {
        this.products = this.products.filter(p => p[0] !== prodId);
        this.normalizeCategoryOrder(catId);
        this.save();
    },

    normalizeCategoryOrder(catId) {
        const ids = this.products
            .filter(p => p[8] === catId)
            .sort((a, b) => a[4] - b[4] || a[0] - b[0])
            .map(p => p[0]);
        this.updateCategoryProductsOrder(ids);
    },

    updateCategoryProductsOrder(orderedIds) {
        orderedIds.forEach((pid, idx) => {
            const p = this.products.find(item => item[0] === pid);
            if (p) p[4] = idx + 1;
        });
        this.save();
    },

    copyProductToCategory(prodId, targetCatId) {
        const p = this.products.find(item => item[0] === prodId);
        if (p) this.addProduct(targetCatId, p[1], p[2], "", p[7]);
    },

    moveProductToCategory(prodId, oldCatId, targetCatId) {
        const p = this.products.find(item => item[0] === prodId);
        if (p) {
            const targetProds = this.products.filter(item => item[8] === targetCatId);
            const nextOrder = targetProds.length > 0 ? Math.max(...targetProds.map(i => i[4])) + 1 : 1;
            p[8] = targetCatId;
            p[4] = nextOrder;
            this.normalizeCategoryOrder(oldCatId);
            this.save();
        }
    },

    getDiscountStacking() { return this.settings.discount_stacking === "1"; },
    setDiscountStacking(enabled) { this.settings.discount_stacking = enabled ? "1" : "0"; this.save(); },
    getStaffDiscountEnabled() { return this.settings.staff_discount_enabled === "1"; },
    setStaffDiscountEnabled(enabled) { this.settings.staff_discount_enabled = enabled ? "1" : "0"; this.save(); },

    getAllCampaigns() { return this.campaigns.slice().sort((a, b) => b[0] - a[0]); },
    getActiveCampaigns() { return this.campaigns.filter(c => c[6] === 1).sort((a, b) => b[0] - a[0]); },
    getAdCampaigns() { return this.campaigns.filter(c => c[6] === 1 && c[7] === 1).sort((a, b) => b[0] - a[0]).map(c => [c[2], c[3]]); },

    addCampaign(typeKey, code, ruleText, paramsJson) {
        const id = ++this.nextCampaignId;
        const nowStr = formatDateDMY(this.getActiveBusinessDate());
        this.campaigns.push([id, typeKey, code, ruleText, paramsJson, nowStr, 1, 0]);
        this.save();
        return id;
    },

    setCampaignActive(campId, isActive) {
        const c = this.campaigns.find(x => x[0] === campId);
        if (c) { c[6] = parseInt(isActive); this.save(); }
    },

    setCampaignAd(campId, isAd) {
        const c = this.campaigns.find(x => x[0] === campId);
        if (c) { c[7] = parseInt(isAd); this.save(); }
    },

    deleteCampaign(campId) {
        this.campaigns = this.campaigns.filter(x => x[0] !== campId);
        this.save();
    },

    generateNextTxCode() {
        const bizDate = this.getActiveBusinessDate();
        const datePrefix = formatDateISO(bizDate);
        const countToday = this.sales.filter(s => s.timestamp.startsWith(datePrefix)).length + 1;
        const dd = String(bizDate.getDate()).padStart(2, "0");
        const mm = String(bizDate.getMonth() + 1).padStart(2, "0");
        const yy = String(bizDate.getFullYear()).slice(-2);
        return `${dd}${mm}${yy}${String(countToday).padStart(3, "0")}`;
    },

    recordSale(totalAmount, discountAmount, paymentType, itemsObj, discountCode = "", status = "approved", cancelType = "") {
        const bizDate = this.getActiveBusinessDate();
        const now = new Date();
        const timePart = now.toTimeString().slice(0, 8);
        const nowStr = `${formatDateISO(bizDate)} ${timePart}`;
        const txCode = this.generateNextTxCode();

        this.sales.push({
            id: this.sales.length + 1,
            tx_code: txCode,
            timestamp: nowStr,
            total_amount: parseFloat(totalAmount),
            discount_amount: parseFloat(discountAmount || 0),
            discount_code: discountCode,
            payment_type: paymentType,
            items_json: typeof itemsObj === "string" ? itemsObj : JSON.stringify(itemsObj),
            status: status,
            cancel_type: cancelType
        });
        this.save();
    },

    getSalesByDateRange(startTs, endTs, status = "approved") {
        return this.sales
            .filter(s => s.timestamp >= startTs && s.timestamp <= endTs && s.status === status)
            .sort((a, b) => b.id - a.id);
    },

    cancelSaleLater(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (sale) {
            sale.status = "cancelled";
            sale.cancel_type = "Sonradan";
            this.save();
        }
    }
};

// ==========================================================================
// 2. GÜNLÜK 1 SAAT (60:00) DEMO SAYACI + 906090 İLE HER SEFERİNDE +1 SAAT + 00:00 TAM SIFIRLAMA
// ==========================================================================
const TIMER_STORAGE_KEY = "shinato_pos_daily_timer_v2";
const DAILY_LIMIT_SECONDS = 60 * 60;     // 1 Saat (60:00)
const EXTENSION_BONUS_SECONDS = 60 * 60; // +1 Saat (60:00)

let _demoTimerState = null;

function initDailyDemoTimer() {
    const timerEl = document.getElementById("demo-timer-display");
    const expiredModal = document.getElementById("modal-demo-expired");
    const pwdInput = document.getElementById("entry-demo-extend-pwd");

    if (pwdInput) {
        pwdInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                tryExtendDemoTime();
            }
        });
    }

    function loadTimerState() {
        const todayStr = formatDateISO(new Date());
        try {
            const raw = localStorage.getItem(TIMER_STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (data.date === todayStr && typeof data.remaining === "number") {
                    return data;
                }
            }
        } catch (e) {}
        const fresh = { date: todayStr, remaining: DAILY_LIMIT_SECONDS };
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
    }

    function renderTime(sec) {
        const s = Math.max(0, sec);
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        if (timerEl) timerEl.innerText = `${mm}:${ss}`;
    }

    function showExpiredModalUI() {
        const errLbl = document.getElementById("lbl-demo-extend-err");
        if (errLbl) errLbl.innerText = "";
        expiredModal.classList.add("active");
    }

    _demoTimerState = loadTimerState();
    renderTime(_demoTimerState.remaining);
    if (_demoTimerState.remaining <= 0) showExpiredModalUI();

    setInterval(() => {
        const nowToday = formatDateISO(new Date());
        if (_demoTimerState.date !== nowToday) {
            // GECE 00:00 OLDU -> Veritabanını, Renkleri ve 1 Saatlik Süreyi Sıfırla!
            _demoTimerState = { date: nowToday, remaining: DAILY_LIMIT_SECONDS };
            localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(_demoTimerState));
            localStorage.removeItem(DB_STORAGE_KEY);
            if (typeof resetPersonalizeAtMidnight === "function") resetPersonalizeAtMidnight();
            DemoDB.loadOrInit(true);
            renderCategories();
            refreshReceiptUI();
            initSalesView();
            expiredModal.classList.remove("active");
            renderTime(_demoTimerState.remaining);
            return;
        }

        if (_demoTimerState.remaining > 0) {
            _demoTimerState.remaining -= 1;
            localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(_demoTimerState));
            renderTime(_demoTimerState.remaining);
            if (_demoTimerState.remaining <= 0) showExpiredModalUI();
        } else {
            if (!expiredModal.classList.contains("active")) showExpiredModalUI();
        }
    }, 1000);
}

function tryExtendDemoTime() {
    if (!_demoTimerState) return;
    const pwdInput = document.getElementById("entry-demo-extend-pwd");
    const errLbl = document.getElementById("lbl-demo-extend-err");
    const timerEl = document.getElementById("demo-timer-display");
    const expiredModal = document.getElementById("modal-demo-expired");

    const entered = pwdInput ? pwdInput.value.trim() : "";
    if (entered === "906090") {
        // Her 906090 girildiğinde +1 saat (60:00) ekler
        _demoTimerState.remaining += EXTENSION_BONUS_SECONDS;
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(_demoTimerState));

        if (pwdInput) pwdInput.value = "";
        if (errLbl) errLbl.innerText = "";
        if (timerEl) timerEl.innerText = "60:00";
        expiredModal.classList.remove("active");
    } else {
        if (errLbl) errLbl.innerText = "Hatalı şifre!";
        if (pwdInput) { pwdInput.value = ""; pwdInput.focus(); }
    }
}

// ==========================================================================
// 3. STATE VE BAŞLANGIÇ KURULUMU
// ==========================================================================
const POSState = {
    currentScreen: "Kasa",
    cart: {},
    selectedProductId: null,
    activeDiscount: 0.0,
    activeDiscountCode: "",
    staffDiscountActive: false,
    cashMode: false,
    bgBarcodeBuffer: "",
    bgBarcodeLastTs: 0,
    alertFocusTarget: null,
    calendarTarget: "sales"
};

const SalesState = {
    showCancelled: false,
    startDate: getTodayDateObj(),
    endDate: getTodayDateObj(),
    pendingCancelSaleId: null,
    calState: {
        sYear: 2026, sMonth: 10, sSel: getTodayDateObj(),
        eYear: 2026, eMonth: 10, eSel: getTodayDateObj()
    }
};

const CatalogState = {
    currentCatId: null,
    products: [],
    selectedProduct: null,
    newProductMode: false,
    currentActiveState: 1,
    dragIndex: null,
    transferMode: "copy"
};

document.addEventListener("DOMContentLoaded", () => {
    DemoDB.loadOrInit();
    initDailyDemoTimer();
    renderCategories();
    refreshReceiptUI();
    initSalesView();
    initCatalogEvents();
    if (typeof initCampaignsView === "function") initCampaignsView();
    if (typeof initStatsView === "function") initStatsView();
    if (typeof initEndOfDayView === "function") initEndOfDayView();
    if (typeof initCustomerDisplay === "function") initCustomerDisplay();

    // KÜRESEL ENTER TUŞU YÖNETİMİ (Kaydedildi Popup'ı Açıkken Enter'a Basınca Kapatır, Tekrar Kaydetmez!)
    document.addEventListener("keydown", (e) => {
        const alertModal = document.getElementById("modal-simple-alert");
        if (alertModal && alertModal.classList.contains("active")) {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                e.stopImmediatePropagation();
                closeSimpleAlertPopup();
            }
            return;
        }
    }, true);

    const barcodeInput = document.getElementById("entry-barcode");
    barcodeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const code = barcodeInput.value.trim();
            barcodeInput.value = "";
            barcodeInput.blur();
            if (code) processBarcodeCode(code);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (POSState.currentScreen !== "Kasa" || POSState.cashMode) return;
        if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
        const now = Date.now();
        if (now - POSState.bgBarcodeLastTs > 1500) POSState.bgBarcodeBuffer = "";
        if (e.key === "Enter") {
            if (POSState.bgBarcodeBuffer) {
                processBarcodeCode(POSState.bgBarcodeBuffer);
                POSState.bgBarcodeBuffer = "";
            }
        } else if (e.key === "Backspace") {
            POSState.bgBarcodeBuffer = POSState.bgBarcodeBuffer.slice(0, -1);
            POSState.bgBarcodeLastTs = now;
        } else if (e.key.length === 1) {
            POSState.bgBarcodeBuffer += e.key;
            POSState.bgBarcodeLastTs = now;
        }
    });

    document.addEventListener("click", (e) => {
        const menu = document.getElementById("cat-dropdown-menu");
        const box = document.getElementById("cat-selector-box");
        if (menu && menu.style.display === "flex") {
            if (!box.contains(e.target) && !menu.contains(e.target)) menu.style.display = "none";
        }
    });
});

// ==========================================================================
// 4. KASA EKRANI FONKSİYONLARI
// ==========================================================================
function renderCategories() {
    const container = document.getElementById("catalog-container");
    container.innerHTML = "";
    const categories = DemoDB.getCategories().slice(0, 4);

    categories.forEach(([catId, catName]) => {
        const section = document.createElement("div");
        section.className = "cat-section";
        section.innerHTML = `
            <div class="cat-header-frame">
                <div class="cat-line"></div>
                <div class="cat-title-box">${catName}</div>
                <div class="cat-line"></div>
            </div>
            <div class="cat-products-strip"></div>
        `;

        const strip = section.querySelector(".cat-products-strip");
        const products = DemoDB.getProductsByCategory(catId);

        let isDown = false, startX = 0, scrollLeftStart = 0, moved = false, hideTimer = null;

        function showScrollbarTemporarily() {
            if (products.length <= 14) return;
            strip.classList.add("scrolling-active");
            if (hideTimer) clearTimeout(hideTimer);
            hideTimer = setTimeout(() => strip.classList.remove("scrolling-active"), 1200);
        }

        strip.addEventListener("mousedown", (e) => {
            isDown = true; moved = false;
            startX = e.pageX - strip.offsetLeft;
            scrollLeftStart = strip.scrollLeft;
        });
        strip.addEventListener("mouseleave", () => { isDown = false; });
        strip.addEventListener("mouseup", () => { isDown = false; });
        strip.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            const dx = (e.pageX - strip.offsetLeft) - startX;
            if (Math.abs(dx) > 7) {
                moved = true;
                if (products.length > 14) {
                    showScrollbarTemporarily();
                    strip.scrollLeft = scrollLeftStart - dx;
                }
            }
        });
        strip.addEventListener("wheel", (e) => {
            if (products.length <= 14) return;
            if (e.deltaY !== 0) {
                e.preventDefault();
                showScrollbarTemporarily();
                strip.scrollLeft += e.deltaY;
            }
        });

        products.forEach(([prodId, prodName, prodPrice, isActive]) => {
            const card = document.createElement("div");
            card.className = "pos-product-card" + (isActive === 1 ? "" : " inactive");
            const priceFormatted = Number.isInteger(prodPrice) ? prodPrice : prodPrice.toFixed(2);
            card.innerHTML = `
                <div class="prod-card-name">${prodName}</div>
                <div class="prod-card-price">${priceFormatted} TL</div>
            `;
            if (isActive === 1) {
                card.addEventListener("mouseup", () => {
                    if (moved) return;
                    card.classList.add("pressed");
                    setTimeout(() => card.classList.remove("pressed"), 90);
                    addToCart(prodId, prodName, prodPrice);
                });
            }
            strip.appendChild(card);
        });
        container.appendChild(section);
    });
}

function addToCart(prodId, prodName, prodPrice) {
    POSState.selectedProductId = null;
    if (POSState.cashMode) POSState.cashMode = false;
    if (POSState.cart[prodId]) {
        POSState.cart[prodId].qty += 1;
    } else {
        POSState.cart[prodId] = { name: prodName, price: parseFloat(prodPrice), qty: 1 };
    }
    refreshReceiptUI();
}

function selectCartItem(prodId) {
    POSState.selectedProductId = (POSState.selectedProductId === prodId) ? null : prodId;
    refreshReceiptUI();
}

function actionDeleteItem() {
    if (POSState.selectedProductId && POSState.cart[POSState.selectedProductId]) {
        delete POSState.cart[POSState.selectedProductId];
        POSState.selectedProductId = null;
        refreshReceiptUI();
    }
}

function actionDecreaseItem() {
    const id = POSState.selectedProductId;
    if (id && POSState.cart[id]) {
        POSState.cart[id].qty -= 1;
        if (POSState.cart[id].qty <= 0) {
            delete POSState.cart[id];
            POSState.selectedProductId = null;
        }
        refreshReceiptUI();
    }
}

function actionIncreaseItem() {
    const id = POSState.selectedProductId;
    if (id && POSState.cart[id]) {
        POSState.cart[id].qty += 1;
        refreshReceiptUI();
    }
}

function updateStaffButtonState() {
    const btnStaff = document.getElementById("btn-staff");
    if (!btnStaff) return;
    const enabled = DemoDB.getStaffDiscountEnabled();
    if (!enabled) {
        POSState.staffDiscountActive = false;
        btnStaff.classList.remove("staff-active");
        btnStaff.classList.add("staff-disabled");
    } else {
        btnStaff.classList.remove("staff-disabled");
        btnStaff.classList.toggle("staff-active", POSState.staffDiscountActive);
    }
}

function toggleStaffDiscount() {
    if (!DemoDB.getStaffDiscountEnabled()) return;
    POSState.staffDiscountActive = !POSState.staffDiscountActive;
    refreshReceiptUI();
}

function getSubtotal() {
    return Object.values(POSState.cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

function evaluateDiscounts() {
    if (typeof CampaignEngine !== "undefined") {
        const activeCamps = DemoDB.getActiveCampaigns();
        const allowStack = DemoDB.getDiscountStacking();
        const useStaff = POSState.staffDiscountActive && DemoDB.getStaffDiscountEnabled();
        const staffPct = parseFloat(DemoDB.settings.staff_discount_pct || "50");
        const res = CampaignEngine.evaluateCart(POSState.cart, activeCamps, allowStack, useStaff, staffPct);
        POSState.activeDiscount = res.discount;
        POSState.activeDiscountCode = res.code;
    } else {
        POSState.activeDiscount = 0;
        POSState.activeDiscountCode = "";
    }
}

function getNetTotal() {
    return Math.max(0, getSubtotal() - POSState.activeDiscount);
}

function refreshReceiptUI() {
    document.getElementById("lbl-receipt-title").innerText = `Fiş - ${DemoDB.generateNextTxCode()}`;
    updateStaffButtonState();

    const receiptBox = document.getElementById("receipt-box");
    receiptBox.innerHTML = "";
    const entries = Object.entries(POSState.cart);

    entries.forEach(([prodId, item], idx) => {
        const row = document.createElement("div");
        const isSel = String(POSState.selectedProductId) === String(prodId);
        row.className = "receipt-row" + (isSel ? " selected" : "");
        const lineTotal = item.price * item.qty;
        const priceStr = Number.isInteger(lineTotal) ? lineTotal : lineTotal.toFixed(2);
        row.innerHTML = `
            <span class="col-qty">${item.qty}</span>
            <span class="col-name">${item.name}</span>
            <span class="col-price">${priceStr}</span>
        `;
        row.addEventListener("click", () => selectCartItem(prodId));
        receiptBox.appendChild(row);
        if (idx < entries.length - 1) {
            const sep = document.createElement("div");
            sep.className = "receipt-sep";
            receiptBox.appendChild(sep);
        }
    });

    evaluateDiscounts();
    const discountBox = document.getElementById("discount-box");
    const lblDiscount = document.getElementById("lbl-discount");

    if (POSState.activeDiscount > 0) {
        const dVal = Number.isInteger(POSState.activeDiscount) ? POSState.activeDiscount : POSState.activeDiscount.toFixed(2);
        const codeStr = POSState.activeDiscountCode || "IND";
        discountBox.style.display = "flex";
        lblDiscount.innerText = `Aktif İndirim: ${codeStr}(-${dVal}TL)`;
    } else {
        discountBox.style.display = "none";
    }

    const netTotal = getNetTotal();
    const netStr = Number.isInteger(netTotal) ? netTotal : netTotal.toFixed(2);
    document.getElementById("lbl-total-amount").innerText = `${netStr} TL`;

    renderControlBars();
    if (typeof updateCustomerDisplayCart === "function") {
        updateCustomerDisplayCart(POSState.cart, netTotal, POSState.activeDiscount);
    }
}

function renderControlBars() {
    const midBar = document.getElementById("mid-bar-container");
    const bottomBar = document.getElementById("bottom-bar-container");
    midBar.innerHTML = "";
    bottomBar.innerHTML = "";

    if (!POSState.cashMode) {
        const isSel = POSState.selectedProductId !== null;
        midBar.innerHTML = `
            <div class="xmp-grid">
                <button class="xmp-btn ${isSel ? 'remove-active' : ''}" ${isSel ? '' : 'disabled'} onclick="actionDeleteItem()">X</button>
                <button class="xmp-btn" ${isSel ? '' : 'disabled'} onclick="actionDecreaseItem()">-</button>
                <button class="xmp-btn" ${isSel ? '' : 'disabled'} onclick="actionIncreaseItem()">+</button>
            </div>
        `;
        bottomBar.innerHTML = `
            <div class="pay-grid">
                <button class="pay-btn btn-iptal" onclick="handlePaymentButton('iptal')">İptal</button>
                <button class="pay-btn" onclick="handlePaymentButton('nakit')">Nakit</button>
                <button class="pay-btn" onclick="handlePaymentButton('kart')">Kart</button>
            </div>
        `;
    } else {
        midBar.innerHTML = `<div class="change-info-box" id="lbl-change-info">Para üstü: 0 TL</div>`;
        bottomBar.innerHTML = `
            <div class="cash-input-frame">
                <input type="text" id="entry-cash" placeholder="Aldığınız nakiti girin" oninput="updateCashChange(this)" onkeydown="if(event.key==='Enter') confirmCashSale()">
                <button class="cash-confirm-btn" onclick="confirmCashSale()">✔</button>
                <button class="cash-cancel-btn" onclick="exitCashMode()">✖</button>
            </div>
        `;
        setTimeout(() => {
            const cashInput = document.getElementById("entry-cash");
            if (cashInput) cashInput.focus();
        }, 20);
    }
}

function handlePaymentButton(actionKey) {
    if (Object.keys(POSState.cart).length === 0) return;
    if (actionKey === "iptal") {
        const netTotal = getNetTotal();
        DemoDB.recordSale(netTotal, POSState.activeDiscount, "-", POSState.cart, POSState.activeDiscountCode, "cancelled", "Kasa anında");
        POSState.cart = {};
        POSState.selectedProductId = null;
        POSState.staffDiscountActive = false;
        refreshReceiptUI();
    } else if (actionKey === "kart") {
        completeSale("Kart");
    } else if (actionKey === "nakit") {
        POSState.cashMode = true;
        POSState.selectedProductId = null;
        refreshReceiptUI();
    }
}

function exitCashMode() {
    POSState.cashMode = false;
    refreshReceiptUI();
}

function updateCashChange(inputEl) {
    inputEl.value = inputEl.value.replace(/[^0-9]/g, "");
    const valStr = inputEl.value.trim();
    const netTotal = getNetTotal();
    const infoEl = document.getElementById("lbl-change-info");
    if (!valStr) {
        infoEl.innerText = "Para üstü: 0 TL";
        infoEl.style.color = "var(--off-white)";
        return;
    }
    const given = parseFloat(valStr);
    const diff = given - netTotal;
    if (diff < 0) {
        infoEl.innerText = `Para üstü: ${Math.ceil(Math.abs(diff))} TL Eksik`;
        infoEl.style.color = "var(--red)";
    } else {
        infoEl.innerText = `Para üstü: ${Math.floor(diff)} TL`;
        infoEl.style.color = "var(--off-white)";
    }
}

function confirmCashSale() {
    const inputEl = document.getElementById("entry-cash");
    if (!inputEl || !inputEl.value.trim()) return;
    const given = parseFloat(inputEl.value.trim());
    if (given < getNetTotal()) return;
    completeSale("Nakit");
}

function completeSale(paymentType) {
    const netTotal = getNetTotal();
    DemoDB.recordSale(netTotal, POSState.activeDiscount, paymentType, POSState.cart, POSState.activeDiscountCode, "approved", "");
    POSState.cart = {};
    POSState.selectedProductId = null;
    POSState.cashMode = false;
    POSState.staffDiscountActive = false;
    refreshReceiptUI();
    showSimpleAlertPopup("Satış Kaydedildi", false);
}

function processBarcodeCode(code) {
    const prod = DemoDB.getProductByBarcode(code);
    if (prod && prod[3] === 1) addToCart(prod[0], prod[1], prod[2]);
}

// ==========================================================================
// 5. İŞLEMLER EKRANI VE ÇİFT TAKVİM
// ==========================================================================
function initSalesView() {
    const today = DemoDB.getActiveBusinessDate();
    SalesState.startDate = today;
    SalesState.endDate = today;
    document.getElementById("btn-sales-datepicker").innerText = `Tarih seç: ${formatDateDMY(today)}`;
    updateSalesTodayButtonStyle();
    loadTransactionsTable();
}

function updateSalesTodayButtonStyle() {
    const today = DemoDB.getActiveBusinessDate();
    const isToday = formatDateISO(SalesState.startDate) === formatDateISO(today) &&
                    formatDateISO(SalesState.endDate) === formatDateISO(today);
    document.getElementById("btn-sales-today").classList.toggle("active-today", isToday);
}

function toggleSalesStatusFilter() {
    SalesState.showCancelled = !SalesState.showCancelled;
    const btn = document.getElementById("btn-sales-status");
    btn.innerText = SalesState.showCancelled ? "İptaller" : "Onaylananlar";
    btn.classList.toggle("cancelled-mode", SalesState.showCancelled);
    loadTransactionsTable();
}

function resetSalesToToday() {
    const today = DemoDB.getActiveBusinessDate();
    SalesState.startDate = today;
    SalesState.endDate = today;
    document.getElementById("btn-sales-datepicker").innerText = `Tarih seç: ${formatDateDMY(today)}`;
    updateSalesTodayButtonStyle();
    loadTransactionsTable();
}

function loadTransactionsTable() {
    const tbody = document.getElementById("sales-table-body");
    tbody.innerHTML = "";
    const statusKey = SalesState.showCancelled ? "cancelled" : "approved";
    const startStr = `${formatDateISO(SalesState.startDate)} 00:00:00`;
    const endStr = `${formatDateISO(SalesState.endDate)} 23:59:59`;
    const rows = DemoDB.getSalesByDateRange(startStr, endStr, statusKey);

    if (rows.length === 0) {
        tbody.innerHTML = `<div class="sales-empty-msg">Seçilen kriterlere uygun işlem bulunamadı.</div>`;
        return;
    }

    rows.forEach(r => {
        const parts = r.timestamp.split(" ");
        const [yyyy, mm, dd] = (parts[0] || "").split("-");
        const dateDisp = yyyy ? `${dd}/${mm}/${yyyy}` : "-";
        const timeDisp = parts[1] || "-";
        const netVal = Number.isInteger(r.total_amount) ? r.total_amount : r.total_amount.toFixed(2);
        const discVal = Number.isInteger(r.discount_amount) ? r.discount_amount : r.discount_amount.toFixed(2);

        let tutarDisp = `${netVal} TL`;
        let indirimDisp = "-";
        if (r.discount_amount && r.discount_amount > 0) {
            const orig = r.total_amount + r.discount_amount;
            const origInt = Number.isInteger(orig) ? orig : orig.toFixed(2);
            tutarDisp = `${netVal} TL (${origInt} TL)`;
            const rawCode = r.discount_code ? r.discount_code : "IND";
            const codeStr = rawCode.startsWith("KOMBO:") ? "KOMBO" : rawCode;
            indirimDisp = `${codeStr}(-${discVal}TL)`;
        }

        const rowEl = document.createElement("div");
        rowEl.className = "sales-row sales-grid-cols";
        const cancelColHTML = !SalesState.showCancelled
            ? `<button class="sales-cancel-btn" onclick="openSalesCancelPopup(${r.id})">X</button>`
            : `<span class="sales-cancel-type-text">${r.cancel_type || 'Sonradan'}</span>`;

        rowEl.innerHTML = `
            <div class="s-cell">${r.tx_code}</div><div class="s-vline"></div>
            <div class="s-cell">${dateDisp}</div><div class="s-vline"></div>
            <div class="s-cell">${timeDisp}</div><div class="s-vline"></div>
            <div class="s-cell">${tutarDisp}</div><div class="s-vline"></div>
            <div class="s-cell">${indirimDisp}</div><div class="s-vline"></div>
            <div class="s-cell">${r.payment_type}</div><div class="s-vline"></div>
            <div class="s-cell"><button class="sales-detail-btn">&gt;</button></div><div class="s-vline"></div>
            <div class="s-cell">${cancelColHTML}</div>
        `;
        rowEl.querySelector(".sales-detail-btn").onclick = () => showSalesItemsPopup(r.tx_code, r.items_json);
        tbody.appendChild(rowEl);
    });
}

function showSalesItemsPopup(txCode, itemsJson) {
    document.getElementById("sales-items-title").innerText = `İşlem İçeriği (${txCode})`;
    const listEl = document.getElementById("sales-items-list");
    listEl.innerHTML = "";
    let itemsData = {};
    try { itemsData = JSON.parse(itemsJson); } catch (e) {}
    const entries = Object.values(itemsData);
    if (entries.length === 0) {
        listEl.innerHTML = `<div style="padding:20px;text-align:center;">İçerik bilgisi yok.</div>`;
    } else {
        entries.forEach(item => {
            const qty = item.qty || 1;
            const lineTotal = qty * (item.price || 0);
            const pStr = `${Number.isInteger(lineTotal) ? lineTotal : lineTotal.toFixed(2)} TL`;
            const r = document.createElement("div");
            r.className = "sales-item-detail-row";
            r.innerHTML = `<span class="sid-qty">${qty}x</span><span class="sid-name">${item.name || "-"}</span><span class="sid-price">${pStr}</span>`;
            listEl.appendChild(r);
        });
    }
    document.getElementById("modal-sales-items").classList.add("active");
}

function closeSalesItemsPopup() { document.getElementById("modal-sales-items").classList.remove("active"); }
function openSalesCancelPopup(saleId) { SalesState.pendingCancelSaleId = saleId; document.getElementById("modal-sales-cancel").classList.add("active"); }
function closeSalesCancelPopup() { SalesState.pendingCancelSaleId = null; document.getElementById("modal-sales-cancel").classList.remove("active"); }
function confirmSalesCancelAction() {
    if (SalesState.pendingCancelSaleId !== null) {
        DemoDB.cancelSaleLater(SalesState.pendingCancelSaleId);
        closeSalesCancelPopup();
        loadTransactionsTable();
    }
}

function openDualCalendarPopup(target = "sales") {
    POSState.calendarTarget = target;
    const baseStart = (target === "stats" && typeof StatsState !== "undefined") ? StatsState.startDate : SalesState.startDate;
    const baseEnd = (target === "stats" && typeof StatsState !== "undefined") ? StatsState.endDate : SalesState.endDate;

    SalesState.calState = {
        sYear: baseStart.getFullYear(), sMonth: baseStart.getMonth() + 1, sSel: new Date(baseStart),
        eYear: baseEnd.getFullYear(), eMonth: baseEnd.getMonth() + 1, eSel: new Date(baseEnd)
    };
    renderSingleCalendar("cal-holder-start", "s");
    renderSingleCalendar("cal-holder-end", "e");
    document.getElementById("modal-dual-calendar").classList.add("active");
}

function renderSingleCalendar(holderId, prefix) {
    const holder = document.getElementById(holderId);
    holder.innerHTML = "";
    const yr = SalesState.calState[`${prefix}Year`];
    const mn = SalesState.calState[`${prefix}Month`];
    const selDt = SalesState.calState[`${prefix}Sel`];

    const nav = document.createElement("div");
    nav.className = "cal-nav";
    nav.innerHTML = `
        <button class="cal-nav-btn" id="${holderId}-prev">&lt;</button>
        <span class="cal-month-label">${TURKISH_MONTHS[mn]} ${yr}</span>
        <button class="cal-nav-btn" id="${holderId}-next">&gt;</button>
    `;
    holder.appendChild(nav);

    nav.querySelector(`#${holderId}-prev`).onclick = () => {
        if (SalesState.calState[`${prefix}Month`] === 1) {
            SalesState.calState[`${prefix}Month`] = 12; SalesState.calState[`${prefix}Year`] -= 1;
        } else { SalesState.calState[`${prefix}Month`] -= 1; }
        renderSingleCalendar(holderId, prefix);
    };
    nav.querySelector(`#${holderId}-next`).onclick = () => {
        if (SalesState.calState[`${prefix}Month`] === 12) {
            SalesState.calState[`${prefix}Month`] = 1; SalesState.calState[`${prefix}Year`] += 1;
        } else { SalesState.calState[`${prefix}Month`] += 1; }
        renderSingleCalendar(holderId, prefix);
    };

    const grid = document.createElement("div");
    grid.className = "cal-days-grid";
    ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].forEach(dName => {
        const dh = document.createElement("div");
        dh.className = "cal-day-head";
        dh.innerText = dName;
        grid.appendChild(dh);
    });

    const firstDayJS = new Date(yr, mn - 1, 1).getDay();
    const offset = (firstDayJS + 6) % 7;
    const daysInMonth = new Date(yr, mn, 0).getDate();

    for (let i = 0; i < offset; i++) grid.appendChild(document.createElement("div"));

    for (let d = 1; d <= daysInMonth; d++) {
        const currD = new Date(yr, mn - 1, d);
        const isSel = formatDateISO(currD) === formatDateISO(selDt);
        const btn = document.createElement("button");
        btn.className = "cal-day-btn" + (isSel ? " selected-day" : "");
        btn.innerText = d;
        btn.onclick = () => {
            SalesState.calState[`${prefix}Sel`] = currD;
            renderSingleCalendar(holderId, prefix);
        };
        grid.appendChild(btn);
    }
    holder.appendChild(grid);
}

function applyDualCalendarDates() {
    let d1 = SalesState.calState.sSel;
    let d2 = SalesState.calState.eSel;
    if (d1 > d2) { const tmp = d1; d1 = d2; d2 = tmp; }

    if (POSState.calendarTarget === "stats" && typeof applyCustomStatsDates === "function") {
        closeDualCalendarPopup();
        applyCustomStatsDates(d1, d2);
        return;
    }

    SalesState.startDate = d1;
    SalesState.endDate = d2;
    const btnPicker = document.getElementById("btn-sales-datepicker");
    btnPicker.innerText = formatDateISO(d1) === formatDateISO(d2)
        ? `Tarih seç: ${formatDateDMY(d1)}`
        : `${formatDateDMY(d1)} - ${formatDateDMY(d2)}`;

    updateSalesTodayButtonStyle();
    closeDualCalendarPopup();
    loadTransactionsTable();
}

function closeDualCalendarPopup() {
    document.getElementById("modal-dual-calendar").classList.remove("active");
}

// ==========================================================================
// 6. KATALOG EKRANI FONKSİYONLARI (ENTER HATASI GİDERİLDİ)
// ==========================================================================
function initCatalogEvents() {
    const entryCatName = document.getElementById("entry-cat-name");
    const entrySira = document.getElementById("entry-prod-sira");
    const entryName = document.getElementById("entry-prod-name");
    const entryBarcode = document.getElementById("entry-prod-barcode");
    const entryPrice = document.getElementById("entry-prod-price");

    entrySira.addEventListener("input", () => { entrySira.value = entrySira.value.replace(/[^0-9]/g, ""); });
    entryPrice.addEventListener("input", () => {
        let v = entryPrice.value.replace(",", ".").replace(/[^0-9.]/g, "");
        const parts = v.split(".");
        if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
        entryPrice.value = v;
    });

    entryCatName.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && CatalogState.currentCatId !== null) {
            e.preventDefault();
            const newName = entryCatName.value.trim();
            if (newName) {
                DemoDB.updateCategoryName(CatalogState.currentCatId, newName);
                document.getElementById("lbl-cat-selector").innerText = newName;
                renderCategories();
            }
        }
    });
    entrySira.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (CatalogState.selectedProduct && CatalogState.products.length > 0) teleportProductToOrder();
            else entryName.focus();
        }
    });
    entryName.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); entryBarcode.focus(); }
    });
    entryBarcode.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); entryPrice.focus(); }
    });
    entryPrice.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            entryPrice.blur();
            saveCatalogChanges();
        }
    });
}

function toggleCategoryDropdown(e) {
    e.stopPropagation();
    const menu = document.getElementById("cat-dropdown-menu");
    if (menu.style.display === "flex") { menu.style.display = "none"; return; }
    menu.innerHTML = "";
    DemoDB.getCategories().slice(0, 4).forEach(([cid, cname]) => {
        const btn = document.createElement("button");
        btn.className = "cat-drop-item" + (cid === CatalogState.currentCatId ? " curr" : "");
        btn.innerText = cname;
        btn.onclick = () => { menu.style.display = "none"; loadCategoryData(cid); };
        menu.appendChild(btn);
    });
    menu.style.display = "flex";
}

function loadCategoryData(catId, keepSelectedId = null) {
    CatalogState.currentCatId = catId;
    const catObj = DemoDB.getCategories().find(c => c[0] === catId);
    const catName = catObj ? catObj[1] : `Kategori ${catId}`;
    document.getElementById("lbl-cat-selector").innerText = catName;
    const entryCatName = document.getElementById("entry-cat-name");
    entryCatName.disabled = false;
    entryCatName.value = catName;
    CatalogState.products = DemoDB.getProductsDetailedByCategory(catId);

    if (keepSelectedId !== null) {
        const found = CatalogState.products.find(p => p[0] === keepSelectedId);
        if (found) selectCatalogProduct(found);
        else resetCatalogNeutralState();
    } else {
        resetCatalogNeutralState();
    }
    renderCatalogProductsList();
}

function renderCatalogProductsList() {
    const listEl = document.getElementById("cat-products-list");
    listEl.innerHTML = "";
    const selectedId = CatalogState.selectedProduct ? CatalogState.selectedProduct[0] : null;

    CatalogState.products.forEach((prod, idx) => {
        const [prodId, prodName, , , , , , isActive] = prod;
        const row = document.createElement("div");
        row.className = "cat-prod-row" + (isActive === 1 ? "" : " inactive-row") + (prodId === selectedId ? " selected-row" : "");
        row.innerHTML = `<span class="cpr-order">${idx + 1}</span><span class="cpr-name">${prodName}</span><span class="cpr-handle">≡</span>`;

        row.addEventListener("click", (e) => {
            if (e.target.classList.contains("cpr-handle")) return;
            if (CatalogState.selectedProduct && CatalogState.selectedProduct[0] === prodId) resetCatalogNeutralState();
            else { selectCatalogProduct(prod); renderCatalogProductsList(); }
        });

        const handle = row.querySelector(".cpr-handle");
        handle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            CatalogState.dragIndex = idx;
            selectCatalogProduct(prod);
            renderCatalogProductsList();

            const onMove = (moveEvent) => {
                if (CatalogState.dragIndex === null) return;
                const rect = listEl.getBoundingClientRect();
                const relY = moveEvent.clientY - rect.top + listEl.scrollTop;
                const targetIdx = Math.max(0, Math.min(CatalogState.products.length - 1, Math.floor(relY / 46)));
                if (targetIdx !== CatalogState.dragIndex) {
                    const item = CatalogState.products.splice(CatalogState.dragIndex, 1)[0];
                    CatalogState.products.splice(targetIdx, 0, item);
                    CatalogState.dragIndex = targetIdx;
                    document.getElementById("entry-prod-sira").value = String(targetIdx + 1);
                    renderCatalogProductsList();
                }
            };
            const onUp = () => {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
                if (CatalogState.dragIndex !== null) {
                    CatalogState.dragIndex = null;
                    DemoDB.updateCategoryProductsOrder(CatalogState.products.map(p => p[0]));
                    renderCategories();
                }
            };
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
        });
        listEl.appendChild(row);
    });
}

function selectCatalogProduct(prodTuple) {
    CatalogState.selectedProduct = prodTuple;
    CatalogState.newProductMode = false;
    document.getElementById("btn-new-product").classList.remove("active-new");

    const [prodId, prodName, prodPrice, barcode, , createdAt, priceUpdatedAt, isActive] = prodTuple;
    CatalogState.currentActiveState = parseInt(isActive);
    updateActiveToggleVisual();

    const currIdx = CatalogState.products.findIndex(p => p[0] === prodId);
    document.getElementById("entry-prod-sira").value = String((currIdx >= 0 ? currIdx : 0) + 1);
    document.getElementById("entry-prod-name").value = prodName;
    document.getElementById("entry-prod-barcode").value = barcode || "";
    document.getElementById("entry-prod-price").value = prodPrice;
    document.getElementById("lbl-added-val").innerText = createdAt || "-";
    document.getElementById("lbl-price-date-val").innerText = priceUpdatedAt || "-";
}

function resetCatalogNeutralState() {
    CatalogState.selectedProduct = null;
    CatalogState.newProductMode = false;
    CatalogState.currentActiveState = 1;
    document.getElementById("btn-new-product").classList.remove("active-new");
    updateActiveToggleVisual();

    document.getElementById("entry-prod-sira").value = CatalogState.currentCatId !== null ? String(CatalogState.products.length + 1) : "";
    document.getElementById("entry-prod-name").value = "";
    document.getElementById("entry-prod-barcode").value = "";
    document.getElementById("entry-prod-price").value = "";
    document.getElementById("lbl-added-val").innerText = "-";
    document.getElementById("lbl-price-date-val").innerText = "-";
    renderCatalogProductsList();
}

function toggleNewProductMode() {
    if (CatalogState.currentCatId === null) {
        showSimpleAlertPopup("Lütfen önce sol üstten\nbir kategori seçin.", true);
        return;
    }
    if (!CatalogState.newProductMode) {
        CatalogState.selectedProduct = null;
        CatalogState.newProductMode = true;
        CatalogState.currentActiveState = 1;
        document.getElementById("btn-new-product").classList.add("active-new");
        updateActiveToggleVisual();
        document.getElementById("entry-prod-sira").value = String(CatalogState.products.length + 1);
        document.getElementById("entry-prod-name").value = "";
        document.getElementById("entry-prod-barcode").value = "";
        document.getElementById("entry-prod-price").value = "";
        document.getElementById("lbl-added-val").innerText = "-";
        document.getElementById("lbl-price-date-val").innerText = "-";
        renderCatalogProductsList();
        document.getElementById("entry-prod-name").focus();
    } else {
        resetCatalogNeutralState();
    }
}

function updateActiveToggleVisual() {
    const btn = document.getElementById("btn-active-toggle");
    if (!CatalogState.selectedProduct) { btn.style.display = "none"; return; }
    btn.style.display = "inline-block";
    btn.innerText = CatalogState.currentActiveState === 1 ? "Aktif" : "Deaktif";
    btn.classList.toggle("deactive-state", CatalogState.currentActiveState !== 1);
}

function toggleProductActiveState() {
    if (!CatalogState.selectedProduct) return;
    CatalogState.currentActiveState = CatalogState.currentActiveState === 1 ? 0 : 1;
    updateActiveToggleVisual();
    const prodId = CatalogState.selectedProduct[0];
    DemoDB.setProductActiveStatus(prodId, CatalogState.currentActiveState);
    renderCategories();
    CatalogState.products = DemoDB.getProductsDetailedByCategory(CatalogState.currentCatId);
    CatalogState.selectedProduct = CatalogState.products.find(p => p[0] === prodId) || CatalogState.selectedProduct;
    renderCatalogProductsList();
}

function teleportProductToOrder() {
    if (!CatalogState.selectedProduct || CatalogState.products.length === 0) return;
    const valStr = document.getElementById("entry-prod-sira").value.trim();
    if (!valStr) return;
    const targetIdx = Math.max(0, Math.min(CatalogState.products.length - 1, parseInt(valStr) - 1));
    const currId = CatalogState.selectedProduct[0];
    const currIdx = CatalogState.products.findIndex(p => p[0] === currId);
    if (currIdx === -1) return;
    const item = CatalogState.products.splice(currIdx, 1)[0];
    CatalogState.products.splice(targetIdx, 0, item);
    DemoDB.updateCategoryProductsOrder(CatalogState.products.map(p => p[0]));
    renderCategories();
    loadCategoryData(CatalogState.currentCatId, currId);
}

function saveCatalogChanges() {
    if (CatalogState.currentCatId === null) {
        showSimpleAlertPopup("Lütfen önce sol üstten\nbir kategori seçin.", true);
        return;
    }
    const newCatName = document.getElementById("entry-cat-name").value.trim();
    if (newCatName) {
        DemoDB.updateCategoryName(CatalogState.currentCatId, newCatName);
        document.getElementById("lbl-cat-selector").innerText = newCatName;
    }
    const prodName = document.getElementById("entry-prod-name").value.trim();
    const barcode = document.getElementById("entry-prod-barcode").value.trim();
    const priceStr = document.getElementById("entry-prod-price").value.trim().replace(",", ".");

    const missing = [];
    if (!prodName) missing.push("Adı");
    if (!priceStr) missing.push("Fiyatı");
    if (missing.length > 0) {
        const focusEl = !prodName ? document.getElementById("entry-prod-name") : document.getElementById("entry-prod-price");
        showSimpleAlertPopup(`${missing.join(" ve ")} olmadan ürün\nsisteme kaydedilemez.`, true, focusEl);
        return;
    }

    const excludeId = CatalogState.selectedProduct ? CatalogState.selectedProduct[0] : null;
    const conflictName = DemoDB.checkDuplicateBarcode(barcode, excludeId);
    if (conflictName) {
        showSimpleAlertPopup(`Aynı barkodlu ürün olamaz.\nÇakışan ürün: ${conflictName}`, true, document.getElementById("entry-prod-barcode"));
        return;
    }

    const priceVal = parseFloat(priceStr);
    const wasAddingNew = CatalogState.selectedProduct === null;
    let keepId = null;

    if (wasAddingNew) {
        DemoDB.addProduct(CatalogState.currentCatId, prodName, priceVal, barcode, 1);
    } else {
        const targetId = CatalogState.selectedProduct[0];
        DemoDB.updateProduct(targetId, prodName, priceVal, barcode, CatalogState.currentActiveState);
        const siraStr = document.getElementById("entry-prod-sira").value.trim();
        if (siraStr) {
            const desiredPos = parseInt(siraStr);
            const currIds = CatalogState.products.map(p => p[0]).filter(id => id !== targetId);
            currIds.splice(Math.max(0, Math.min(currIds.length, desiredPos - 1)), 0, targetId);
            DemoDB.updateCategoryProductsOrder(currIds);
        }
        keepId = targetId;
    }
    renderCategories();
    loadCategoryData(CatalogState.currentCatId, keepId);
    showSimpleAlertPopup("Kaydedildi", false, wasAddingNew ? document.getElementById("entry-prod-name") : null);
}

function openDeleteProductConfirmPopup() {
    if (!CatalogState.selectedProduct || CatalogState.currentCatId === null) return;
    document.getElementById("modal-cat-delete").classList.add("active");
}
function closeDeleteProductConfirmPopup() { document.getElementById("modal-cat-delete").classList.remove("active"); }
function confirmDeleteProductAction() {
    if (!CatalogState.selectedProduct || CatalogState.currentCatId === null) return;
    DemoDB.deleteProduct(CatalogState.selectedProduct[0], CatalogState.currentCatId);
    renderCategories();
    loadCategoryData(CatalogState.currentCatId);
    closeDeleteProductConfirmPopup();
}

function openCopyOrMovePopup(mode) {
    if (!CatalogState.selectedProduct || CatalogState.currentCatId === null) return;
    document.getElementById("transfer-modal-title").innerText = mode === "copy" ? "Kopyalanacak Kategoriyi Seçin" : "Taşınacak Kategoriyi Seçin";
    const listEl = document.getElementById("transfer-cats-list");
    listEl.innerHTML = "";
    const allCats = DemoDB.getCategories();
    const targetCats = mode === "copy" ? allCats : allCats.filter(([cid]) => cid !== CatalogState.currentCatId);

    targetCats.forEach(([cid, cname]) => {
        const btn = document.createElement("button");
        btn.className = "transfer-cat-btn";
        btn.innerText = `${cid} - ${cname}`;
        btn.onclick = () => {
            const prodId = CatalogState.selectedProduct[0];
            let keepId = null;
            if (mode === "copy") { DemoDB.copyProductToCategory(prodId, cid); keepId = prodId; }
            else { DemoDB.moveProductToCategory(prodId, CatalogState.currentCatId, cid); }
            renderCategories();
            loadCategoryData(CatalogState.currentCatId, keepId);
            closeTransferPopup();
        };
        listEl.appendChild(btn);
    });
    document.getElementById("modal-cat-transfer").classList.add("active");
}
function closeTransferPopup() { document.getElementById("modal-cat-transfer").classList.remove("active"); }

// ==========================================================================
// 7. EKRAN GEÇİŞLERİ VE ORTAK POPUPLAR
// ==========================================================================
function showScreen(screenName) {
    POSState.currentScreen = screenName;
    document.querySelectorAll(".menu-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-screen") === screenName);
    });
    document.querySelectorAll(".screen-view").forEach(v => v.classList.remove("active"));

    if (typeof refreshCustomerAdsFromDB === "function") refreshCustomerAdsFromDB();

    if (screenName === "Kasa") {
        document.getElementById("screen-Kasa").classList.add("active");
        refreshReceiptUI();
    } else if (screenName === "İşlemler") {
        document.getElementById("screen-İşlemler").classList.add("active");
        loadTransactionsTable();
    } else if (screenName === "Katalog") {
        document.getElementById("screen-Katalog").classList.add("active");
        if (CatalogState.currentCatId !== null) {
            loadCategoryData(CatalogState.currentCatId, CatalogState.selectedProduct ? CatalogState.selectedProduct[0] : null);
        }
    } else if (screenName === "Kampanyalar") {
        document.getElementById("screen-Kampanyalar").classList.add("active");
        if (typeof refreshCampaignsScreen === "function") refreshCampaignsScreen();
    } else if (screenName === "İstatistikler") {
        document.getElementById("screen-İstatistikler").classList.add("active");
        if (typeof refreshStatsScreen === "function") refreshStatsScreen();
    } else if (screenName === "Gün Sonu") {
        document.getElementById("screen-Gün Sonu").classList.add("active");
        if (typeof loadEodSummary === "function") loadEodSummary();
    }
}

function showSimpleAlertPopup(messageText, isError = false, focusTarget = null) {
    const modal = document.getElementById("modal-simple-alert");
    const box = document.getElementById("simple-alert-box");
    const txt = document.getElementById("simple-alert-text");
    txt.innerText = messageText;
    box.style.borderColor = isError ? "var(--red)" : "var(--purple-border)";
    POSState.alertFocusTarget = focusTarget;
    modal.classList.add("active");
}

function closeSimpleAlertPopup() {
    document.getElementById("modal-simple-alert").classList.remove("active");
    if (POSState.alertFocusTarget) {
        const target = POSState.alertFocusTarget;
        POSState.alertFocusTarget = null;
        setTimeout(() => target.focus(), 20);
    }
}

function openHelpModal() { document.getElementById("modal-general-info").classList.add("active"); }
function closeHelpModal() { document.getElementById("modal-general-info").classList.remove("active"); }
function confirmExit() { document.getElementById("modal-exit-confirm").classList.add("active"); }
function closeExitModal() { document.getElementById("modal-exit-confirm").classList.remove("active"); }
// ==========================================================================
// 8. KİŞİSELLEŞTİR POPUP (COLOR WHEEL + HEX KODU + 3 KAYIT SLOTU + 00:00 SIFIRLAMA)
// ==========================================================================
const THEME_STORAGE_KEY = "shinato_pos_custom_theme_v2";
const DEFAULT_SHINATO_HEX = "#500062";

let _currentCanvasColors = {
    main: "#500062",
    border: "#7b1fa2",
    bright: "#9c27b0",
    light: "#d896ff",
    shimmer: "#c084fc",
    glowRgba35: "rgba(123, 31, 162, 0.35)"
};

let _themeState = {
    date: formatDateISO(new Date()),
    currentHex: DEFAULT_SHINATO_HEX,
    baseHue: 289,
    baseSat: 100,
    lightness: 19,
    slots: [null, null, null]
};

function hexToHsl(hex) {
    let r = 0, g = 0, b = 0;
    const h = hex.replace("#", "");
    if (h.length === 6) {
        r = parseInt(h.slice(0, 2), 16) / 255;
        g = parseInt(h.slice(2, 4), 16) / 255;
        b = parseInt(h.slice(4, 6), 16) / 255;
    }
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let hue = 0, sat = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
            case g: hue = (b - r) / d + 2; break;
            case b: hue = (r - g) / d + 4; break;
        }
        hue /= 6;
    }
    return [Math.round(hue * 360), Math.round(sat * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

function applyCustomThemeHex(hexCode, saveStorage = true, updateHslState = true) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexCode)) return;
    const cleanHex = hexCode.toUpperCase();
    const [h, s, l] = hexToHsl(cleanHex);
    const sat = Math.max(20, s);

    if (updateHslState) {
        _themeState.baseHue = h;
        _themeState.baseSat = s;
        _themeState.lightness = l;
        const bSlider = document.getElementById("color-brightness-slider");
        if (bSlider) bSlider.value = Math.max(8, Math.min(65, l));
    }

    const sidebarHex = cleanHex;
    const borderHex  = hslToHex(h, sat, Math.min(75, Math.max(32, l + 20)));
    const brightHex  = hslToHex(h, sat, Math.min(80, Math.max(38, l + 26)));
    const hoverHex   = hslToHex(h, sat, Math.min(65, Math.max(20, l + 10)));
    const lightHex   = hslToHex(h, Math.min(100, sat + 15), 78);
    const shimmerHex = hslToHex(h, Math.min(100, sat + 10), 72);

    const root = document.documentElement;
    root.style.setProperty("--purple-sidebar", sidebarHex);
    root.style.setProperty("--purple-border", borderHex);
    root.style.setProperty("--purple-bright", brightHex);
    root.style.setProperty("--purple-hover", hoverHex);
    root.style.setProperty("--theme-accent-light", lightHex);
    root.style.setProperty("--theme-glow-bg", `hsla(${h}, ${sat}%, 40%, 0.28)`);

    _currentCanvasColors = {
        main: sidebarHex,
        border: borderHex,
        bright: brightHex,
        light: lightHex,
        shimmer: shimmerHex,
        glowRgba35: `hsla(${h}, ${sat}%, 40%, 0.35)`
    };

    _themeState.currentHex = cleanHex;
    const hexInput = document.getElementById("color-hex-input");
    if (hexInput && document.activeElement !== hexInput) {
        hexInput.value = cleanHex;
    }

    if (saveStorage) {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(_themeState));
    }

    if (typeof StatsState !== "undefined" && POSState.currentScreen === "İstatistikler") {
        if (typeof drawHourlyBarChart === "function") drawHourlyBarChart();
        if (typeof drawDailyLineChart === "function") drawDailyLineChart();
    }
    if (typeof CustState !== "undefined" && typeof renderCustomerScene === "function") {
        renderCustomerScene();
    }
}

// Beyazdan Siyaha Parlaklık Skalası Hareket Ettirildiğinde
function handleBrightnessSlider(lightVal) {
    const l = parseInt(lightVal, 10);
    _themeState.lightness = l;
    const newHex = hslToHex(_themeState.baseHue || 289, _themeState.baseSat ?? 100, l);
    applyCustomThemeHex(newHex, true, false);
}

// Kişiselleştir Tuşuna Çift Basılırsa Shinato Moruna Döner ve Kayıtlı Renkleri Sıfırlar
function resetPersonalizeToDefault(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    resetPersonalizeAtMidnight();
    const pop = document.getElementById("personalize-popup");
    const btn = document.getElementById("btn-personalize");
    if (pop) pop.style.display = "none";
    if (btn) btn.classList.remove("active-pers");
}

function renderColorSlotsUI() {
    for (let i = 0; i < 3; i++) {
        const btn = document.getElementById(`color-slot-${i}`);
        if (!btn) continue;
        const savedHex = _themeState.slots[i];
        if (savedHex) {
            btn.style.backgroundColor = savedHex;
            btn.innerText = "";
            btn.title = `${savedHex} (Uygulamak için tıkla, değiştirmek için sağ tıkla)`;
        } else {
            btn.style.backgroundColor = "var(--product-bg)";
            btn.innerText = "+";
            btn.title = "Mevcut rengi kaydet";
        }
    }
}

function handleColorSlotClick(idx) {
    if (!_themeState.slots[idx]) {
        // Kutu boşsa (+) o anki rengi kaydet
        _themeState.slots[idx] = _themeState.currentHex;
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(_themeState));
        renderColorSlotsUI();
    } else {
        // Kutuda renk varsa o rengi uygula
        applyCustomThemeHex(_themeState.slots[idx], true);
    }
}

function togglePersonalizePopup(e) {
    if (e) e.stopPropagation();
    const pop = document.getElementById("personalize-popup");
    const btn = document.getElementById("btn-personalize");
    const isHidden = pop.style.display === "none";
    pop.style.display = isHidden ? "flex" : "none";
    if (btn) btn.classList.toggle("active-pers", isHidden);
    if (isHidden) drawColorWheelCanvas();
}

function drawColorWheelCanvas() {
    const canvas = document.getElementById("color-wheel-canvas");
    if (!canvas || canvas.dataset.drawn === "1") return;
    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2;
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = x - radius;
            const dy = y - radius;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
                const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
                const sat = Math.min(100, (dist / radius) * 100);
                const light = 22 + (1 - dist / radius) * 20;
                const hex = hslToHex(angle, sat, light);
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                const pIdx = (y * canvas.width + x) * 4;
                data[pIdx] = r; data[pIdx + 1] = g; data[pIdx + 2] = b; data[pIdx + 3] = 255;
            }
        }
    }
    ctx.putImageData(imgData, 0, 0);
    canvas.dataset.drawn = "1";

    function pickFromWheel(ev) {
        const rect = canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const dx = x - radius, dy = y - radius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
            const angle = Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360);
            const sat = Math.round(Math.min(100, (dist / radius) * 100));
            _themeState.baseHue = angle;
            _themeState.baseSat = sat;
            const hex = hslToHex(angle, sat, _themeState.lightness || 22);
            applyCustomThemeHex(hex, true, false);
        }
    }

    let draggingWheel = false;
    canvas.addEventListener("mousedown", (ev) => { draggingWheel = true; pickFromWheel(ev); });
    window.addEventListener("mousemove", (ev) => { if (draggingWheel) pickFromWheel(ev); });
    window.addEventListener("mouseup", () => { draggingWheel = false; });
}

function resetPersonalizeAtMidnight() {
    _themeState = {
        date: formatDateISO(new Date()),
        currentHex: DEFAULT_SHINATO_HEX,
        baseHue: 289,
        baseSat: 100,
        lightness: 19,
        slots: [null, null, null]
    };
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(_themeState));
    const bSlider = document.getElementById("color-brightness-slider");
    if (bSlider) bSlider.value = 19;
    applyCustomThemeHex(DEFAULT_SHINATO_HEX, false, true);
    renderColorSlotsUI();
}

(function initThemeAndCanvasHook() {
    const proto = CanvasRenderingContext2D.prototype;
    const fillDesc = Object.getOwnPropertyDescriptor(proto, "fillStyle");
    const strokeDesc = Object.getOwnPropertyDescriptor(proto, "strokeStyle");

    function mapColor(val) {
        if (typeof val !== "string") return val;
        const v = val.toLowerCase();
        if (v === "#7b1fa2") return _currentCanvasColors.border;
        if (v === "#9c27b0") return _currentCanvasColors.bright;
        if (v === "#d896ff") return _currentCanvasColors.light;
        if (v === "#c084fc") return _currentCanvasColors.shimmer;
        if (v === "rgba(123, 31, 162, 0.35)") return _currentCanvasColors.glowRgba35;
        return val;
    }

    if (fillDesc && fillDesc.set) {
        Object.defineProperty(proto, "fillStyle", {
            get() { return fillDesc.get.call(this); },
            set(val) { fillDesc.set.call(this, mapColor(val)); }
        });
    }
    if (strokeDesc && strokeDesc.set) {
        Object.defineProperty(proto, "strokeStyle", {
            get() { return strokeDesc.get.call(this); },
            set(val) { strokeDesc.set.call(this, mapColor(val)); }
        });
    }

    window.addEventListener("DOMContentLoaded", () => {
        const todayStr = formatDateISO(new Date());
        try {
            const raw = localStorage.getItem(THEME_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.date === todayStr) {
                    _themeState = parsed;
                }
            }
        } catch (e) {}

        applyCustomThemeHex(_themeState.currentHex || DEFAULT_SHINATO_HEX, false);
        renderColorSlotsUI();

        // Sağ tık ile kayıtlı renk kutusunu sıfırlama
        for (let i = 0; i < 3; i++) {
            const slotBtn = document.getElementById(`color-slot-${i}`);
            if (slotBtn) {
                slotBtn.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    _themeState.slots[i] = null;
                    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(_themeState));
                    renderColorSlotsUI();
                });
            }
        }

        const hexInput = document.getElementById("color-hex-input");
        if (hexInput) {
            hexInput.addEventListener("input", () => {
                let v = hexInput.value.trim();
                if (!v.startsWith("#")) v = "#" + v;
                if (/^#[0-9A-Fa-f]{6}$/.test(v)) applyCustomThemeHex(v, true);
            });
        }

        document.addEventListener("click", (e) => {
            const pop = document.getElementById("personalize-popup");
            const btn = document.getElementById("btn-personalize");
            if (pop && pop.style.display === "flex") {
                if (!pop.contains(e.target) && !btn.contains(e.target)) {
                    pop.style.display = "none";
                    btn.classList.remove("active-pers");
                }
            }
        });
    });
})();
// ==========================================================================
// 9. MOBİLDE VİDEO GİBİ ZORUNLU YATAY (LANDSCAPE) MOD VE TAM EKRAN KİLİDİ
// ==========================================================================
function applyMobileLandscapeScale() {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || Math.min(winW, winH) <= 920;

    const DESIGN_W = 1366;
    const DESIGN_H = 768;

    if (!isMobileDevice) {
        document.body.classList.remove("mobile-forced-landscape");
        document.body.style.width = "100vw";
        document.body.style.height = "100vh";
        document.body.style.transform = "none";
        return;
    }

    document.body.classList.add("mobile-forced-landscape");
    document.body.style.width = DESIGN_W + "px";
    document.body.style.height = DESIGN_H + "px";

    const shell = document.querySelector(".pos-app-shell");
    if (shell) {
        shell.style.width = DESIGN_W + "px";
        shell.style.height = DESIGN_H + "px";
    }

    if (winH > winW) {
        // Telefon DİK tutuluyorsa: Ekranı 90 derece YAN ÇEVİR ve tam sığdır
        const scale = Math.min(winH / DESIGN_W, winW / DESIGN_H);
        const offsetX = winW - ((winW - DESIGN_H * scale) / 2);
        const offsetY = (winH - DESIGN_W * scale) / 2;

        document.body.style.transformOrigin = "0 0";
        document.body.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(90deg) scale(${scale})`;
    } else {
        // Telefon YATAY tutuluyorsa: Doğrudan yatay ekrana tam oturt
        const scale = Math.min(winW / DESIGN_W, winH / DESIGN_H);
        const offsetX = (winW - DESIGN_W * scale) / 2;
        const offsetY = (winH - DESIGN_H * scale) / 2;

        document.body.style.transformOrigin = "0 0";
        document.body.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }
}

// "Anladım, Demoyu Başlat" tuşuna basılınca video gibi Tam Ekran + Yatay Moda geçer
const _origCloseHelpModal = closeHelpModal;
closeHelpModal = function() {
    _origCloseHelpModal();
    const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || Math.min(window.innerWidth, window.innerHeight) <= 920;
    if (isMobileDevice) {
        const docEl = document.documentElement;
        const reqFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
        if (reqFs && !document.fullscreenElement) {
            reqFs.call(docEl).then(() => {
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock("landscape").catch(() => {});
                }
            }).catch(() => {});
        }
        setTimeout(applyMobileLandscapeScale, 120);
    }
};

window.addEventListener("resize", applyMobileLandscapeScale);
window.addEventListener("orientationchange", () => setTimeout(applyMobileLandscapeScale, 150));
window.addEventListener("DOMContentLoaded", applyMobileLandscapeScale);