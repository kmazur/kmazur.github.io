const STORAGE_KEY = "travel-packing-helper-v2";

const CATEGORY_LABELS = {
    essential: "Essentials",
    clothes: "Clothes",
    hygiene: "Wash Bag",
    weather: "Weather",
    tech: "Tech",
    comfort: "Comfort",
    docs: "Documents"
};

const STAGE_LABELS = {
    plan: "Before Booking",
    prep: "Day Before",
    leave: "Before Leaving Home",
    departure: "Departure Day"
};

const IDEAS = [
    "cash exchange rate",
    "country-specific weather",
    "boarding pass screenshots",
    "hotel contact details",
    "car preparation mode",
    "places to visit list",
    "print-friendly version"
];

const ITEMS = {
    wallet: { name: "Wallet", category: "essential", carryOn: "yes" },
    homeKeys: { name: "Home keys", category: "essential", carryOn: "yes" },
    phone: { name: "Smartphone", category: "tech", carryOn: "yes" },
    phoneCharger: { name: "Phone charger", category: "tech", carryOn: "yes" },
    toothbrush: { name: "Toothbrush", category: "hygiene", carryOn: "yes" },
    toothpaste: { name: "Toothpaste", category: "hygiene", carryOn: "liquid", note: "Use a travel-size tube for cabin bags." },
    deodorant: { name: "Deodorant", category: "hygiene", carryOn: "no", note: "Check cabin rules or pack a smaller alternative." },
    painkillers: { name: "Painkillers", category: "comfort", carryOn: "yes" },
    bandages: { name: "Bandages", category: "comfort", carryOn: "yes" },
    reusableBottle: { name: "Reusable water bottle", category: "comfort", carryOn: "yes" },
    backpack: { name: "Backpack", category: "essential", carryOn: "yes" },
    tshirt: { name: "T-shirt", category: "clothes", carryOn: "yes" },
    trousers: { name: "Jeans / trousers", category: "clothes", carryOn: "yes" },
    underwear: { name: "Underwear", category: "clothes", carryOn: "yes" },
    socks: { name: "Socks", category: "clothes", carryOn: "yes" },
    shoes: { name: "Shoes", category: "clothes", carryOn: "yes" },
    smartTop: { name: "Smart shirt / blouse", category: "clothes", carryOn: "yes" },
    bra: { name: "Bra", category: "clothes", carryOn: "yes", profiles: ["female"] },
    jacket: { name: "Jacket", category: "weather", carryOn: "yes" },
    gloves: { name: "Gloves", category: "weather", carryOn: "yes" },
    umbrella: { name: "Umbrella", category: "weather", carryOn: "yes" },
    raincoat: { name: "Raincoat", category: "weather", carryOn: "yes" },
    sunglasses: { name: "Sunglasses", category: "weather", carryOn: "yes" },
    sunscreen: { name: "Sunscreen", category: "weather", carryOn: "liquid" },
    headphones: { name: "Headphones", category: "tech", carryOn: "yes" },
    laptop: { name: "Laptop", category: "tech", carryOn: "yes" },
    laptopCharger: { name: "Laptop charger", category: "tech", carryOn: "yes" },
    powerbank: { name: "Powerbank", category: "tech", carryOn: "yes" },
    passport: { name: "Passport", category: "docs", carryOn: "yes" },
    confirmations: { name: "Booking confirmations", category: "docs", carryOn: "yes" },
    insurance: { name: "Insurance documents", category: "docs", carryOn: "yes" },
    cash: { name: "Cash backup", category: "docs", carryOn: "yes" },
    plug: { name: "Power plug adapter", category: "tech", carryOn: "yes" },
    swimwear: { name: "Swimwear", category: "clothes", carryOn: "yes" },
    slippers: { name: "Slippers", category: "clothes", carryOn: "yes" },
    hikingPoles: { name: "Walking sticks", category: "comfort", carryOn: "no" }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const uniq = (values) => Array.from(new Set(values.filter(Boolean)));

const mergeItems = (items) => Array.from(items.reduce((map, item) => {
    const current = map.get(item.id) || { ...item, reasons: [] };
    current.qty = Math.max(current.qty || 1, item.qty || 1);
    current.priority = current.priority === "must" || item.priority === "must" ? "must" : "optional";
    current.reasons = uniq(current.reasons.concat(item.reason));
    current.note = current.note || item.note || "";
    current.carryOn = current.carryOn === "no" || item.carryOn === "no" ? "no" : (current.carryOn === "liquid" || item.carryOn === "liquid" ? "liquid" : "yes");
    map.set(item.id, current);
    return map;
}, new Map()).values()).map(item => ({
    ...item,
    qtyLabel: item.qty > 1 ? `x${item.qty}` : "1x",
    reasonText: item.reasons.join(" • ")
})).sort((a, b) => a.name.localeCompare(b.name));

const mergeActions = (actions) => Array.from(actions.reduce((map, action) => {
    const current = map.get(action.id) || { ...action, reasons: [] };
    current.reasons = uniq(current.reasons.concat(action.reason));
    map.set(action.id, current);
    return map;
}, new Map()).values()).map(action => ({ ...action, reasonText: action.reasons.join(" • ") }));

const makeItem = (id, qty, priority, reason) => ({ id, ...ITEMS[id], qty, priority, reason, note: ITEMS[id].note || "" });
const makeAction = (id, name, stage, reason) => ({ id, name, stage, reason });

const defaultTrip = () => ({
    destination: "",
    days: 4,
    transport: "plane",
    luggage: "carry-on",
    weather: "mixed",
    style: "casual",
    profile: "neutral",
    stay: "hotel",
    international: true,
    remoteWork: false,
    laundry: false,
    activities: ["city"]
});

document.addEventListener("alpine:init", () => {
    Alpine.data("travelHelper", () => ({
        copyState: "Copy Plan",
        planningIdeas: IDEAS,
        trip: defaultTrip(),
        checked: { packing: {}, actions: {} },
        options: {
            transport: [{ value: "plane", label: "Plane" }, { value: "train", label: "Train" }, { value: "car", label: "Car" }],
            weather: [{ value: "hot", label: "Hot / sunny" }, { value: "mixed", label: "Mixed" }, { value: "rainy", label: "Rainy" }, { value: "cold", label: "Cold" }],
            style: [{ value: "casual", label: "Casual" }, { value: "mixed", label: "Mixed" }, { value: "business", label: "Business" }],
            profile: [{ value: "neutral", label: "Neutral" }, { value: "male", label: "Male-focused" }, { value: "female", label: "Female-focused" }],
            stay: [{ value: "hotel", label: "Hotel" }, { value: "apartment", label: "Apartment" }, { value: "outdoors", label: "Outdoors" }],
            activities: [{ value: "city", label: "City walking" }, { value: "hike", label: "Hiking" }, { value: "swim", label: "Swimming" }, { value: "formal", label: "Formal evening" }]
        },

        init() {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            if (saved.trip) this.trip = { ...defaultTrip(), ...saved.trip };
            if (saved.checked) this.checked = { packing: saved.checked.packing || {}, actions: saved.checked.actions || {} };
            this.normalizeLuggage();
            this.$watch("trip", () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ trip: this.trip, checked: this.checked })));
            this.$watch("checked", () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ trip: this.trip, checked: this.checked })));
        },

        luggageOptions() {
            return this.trip.transport === "car"
                ? [{ value: "car", label: "Car trunk" }, { value: "carry-on", label: "Cabin backpack" }]
                : [{ value: "carry-on", label: "Carry-on only" }, { value: "checked", label: this.trip.transport === "train" ? "Large suitcase" : "Checked bag" }];
        },
        normalizeLuggage() {
            const allowed = this.luggageOptions().map(option => option.value);
            if (!allowed.includes(this.trip.luggage)) this.trip.luggage = allowed[0];
        },
        toggleActivity(value) {
            this.trip.activities = this.trip.activities.includes(value)
                ? this.trip.activities.filter(activity => activity !== value)
                : this.trip.activities.concat(value);
        },
        headline() {
            return `${this.trip.days}-day ${this.trip.international ? "international" : "local"} plan for ${this.trip.destination || "your next trip"}`;
        },
        summaryText() {
            return uniq([
                `${this.trip.transport} travel`,
                this.trip.weather === "hot" ? "hot weather" : null,
                this.trip.weather === "cold" ? "cold weather" : null,
                this.trip.weather === "rainy" ? "rainy conditions" : null,
                this.trip.weather === "mixed" ? "mixed weather" : null,
                `${this.trip.style} schedule`,
                this.trip.remoteWork ? "remote work enabled" : null,
                this.trip.laundry ? "laundry access" : "pack for the full stay"
            ]).join(" • ");
        },
        modeHint() {
            return this.trip.transport === "plane" && this.trip.luggage === "carry-on"
                ? "Cabin-only mode keeps a dedicated watchlist for liquids and restricted items."
                : "The checklist balances essentials first, then comfort extras and departure actions.";
        },
        buildItems() {
            const days = clamp(this.trip.days || 1, 1, 21);
            const daily = this.trip.laundry ? Math.ceil(days * 0.6) : days;
            const tops = clamp(daily, 2, 8);
            const items = [
                makeItem("wallet", 1, "must", "Payments and cards."),
                makeItem("homeKeys", 1, "must", "Easy to miss on departure day."),
                makeItem("phone", 1, "must", "Maps, tickets, and communication."),
                makeItem("phoneCharger", 1, "must", "Needed every day."),
                makeItem("toothbrush", 1, "must", "Daily basic."),
                makeItem("toothpaste", 1, "must", "Daily basic."),
                makeItem("painkillers", 1, "must", "Small emergency kit."),
                makeItem("bandages", 1, "optional", "Useful for blisters or minor cuts."),
                makeItem("backpack", 1, "must", "Day bag or personal item."),
                makeItem("tshirt", tops, "must", "Core daily tops."),
                makeItem("trousers", clamp(Math.ceil(days / 3), 1, 4), "must", "Repeatable base layer."),
                makeItem("underwear", clamp(daily, 2, 10), "must", "One per day, reduced if you have laundry."),
                makeItem("socks", clamp(daily, 2, 10), "must", "One pair per day."),
                makeItem("shoes", 1, "must", "Reliable daily pair."),
                makeItem("confirmations", 1, "must", "Bookings, addresses, and tickets."),
                makeItem("reusableBottle", 1, "optional", "Useful for transit and city days.")
            ];

            if (this.trip.profile === "female") items.push(makeItem("bra", clamp(Math.ceil(daily / 2), 1, 5), "must", "Core daily clothing support."));
            if (this.trip.style === "business" || this.trip.activities.includes("formal")) items.push(makeItem("smartTop", clamp(Math.ceil(daily / 2), 1, 4), "must", "Smarter outfit option."));
            if (this.trip.remoteWork) items.push(makeItem("laptop", 1, "must", "Required for remote work."), makeItem("laptopCharger", 1, "must", "Required for remote work."), makeItem("headphones", 1, "must", "Calls and focus."));
            if (this.trip.transport === "plane") items.push(makeItem("powerbank", 1, "optional", "Useful on long airport days."), makeItem("headphones", 1, "optional", "Makes the flight easier."));
            if (this.trip.weather === "hot") items.push(makeItem("sunglasses", 1, "must", "Sun protection."), makeItem("sunscreen", 1, "must", "Strong sun protection."));
            if (this.trip.weather === "cold") items.push(makeItem("jacket", 1, "must", "Cold-weather layer."), makeItem("gloves", 1, "optional", "Cold-weather comfort."));
            if (this.trip.weather === "rainy") items.push(makeItem("umbrella", 1, "must", "Frequent rain protection."), makeItem("raincoat", 1, "optional", "Better for long outdoor stretches."));
            if (this.trip.weather === "mixed") items.push(makeItem("jacket", 1, "optional", "Flexible layer for changing weather."));
            if (this.trip.international) items.push(makeItem("passport", 1, "must", "Border-crossing essential."), makeItem("insurance", 1, "must", "Useful abroad."), makeItem("cash", 1, "optional", "Useful backup."), makeItem("plug", 1, "optional", "Adapter if needed."));
            if (this.trip.activities.includes("swim")) items.push(makeItem("swimwear", 1, "must", "Pool or beach time."), makeItem("slippers", 1, "optional", "Useful for shared showers and pools."));
            if (this.trip.activities.includes("hike")) items.push(makeItem("hikingPoles", 1, this.trip.transport === "car" ? "must" : "optional", "Helpful on trail days."), makeItem("raincoat", 1, "must", "Better than an umbrella on the trail."));
            if (this.trip.luggage !== "carry-on") items.push(makeItem("deodorant", 1, "optional", "Easier once cabin rules are relaxed."));

            return mergeItems(items.filter(item => !item.profiles || item.profiles.includes(this.trip.profile)));
        },
        mustPack() { return this.buildItems().filter(item => item.priority === "must"); },
        optionalPack() { return this.buildItems().filter(item => item.priority === "optional"); },
        packingGroups(priority) {
            return Object.values((priority === "must" ? this.mustPack() : this.optionalPack()).reduce((groups, item) => {
                groups[item.category] ||= { category: item.category, label: CATEGORY_LABELS[item.category], items: [] };
                groups[item.category].items.push(item);
                return groups;
            }, {}));
        },
        carryOnWatchlist() {
            const notes = {
                liquid: "Cabin bag item. Use a small bottle and liquids pouch.",
                no: "Move this to checked baggage or swap it for a cabin-friendly alternative."
            };
            return this.trip.luggage === "carry-on"
                ? this.buildItems().filter(item => item.carryOn !== "yes").map(item => ({ ...item, carryOnNote: notes[item.carryOn] }))
                : [];
        },
        departureActions() {
            const actions = [
                makeAction("charge-phone", "Charge smartphone battery", "prep", "Core travel device."),
                makeAction("take-id", "Take ID card", "departure", "Quick identity proof."),
                makeAction("buy-water", "Buy water", "departure", "Easy comfort step."),
                makeAction("buy-snacks", "Buy snacks / food", "prep", "Avoid last-minute transit choices."),
                makeAction("utilities", "Turn off anything unnecessary at home", "leave", "Gas, water, electricity, and stray devices.")
            ];
            if (this.trip.remoteWork) actions.push(makeAction("charge-laptop", "Charge laptop battery", "prep", "Start with a full battery."));
            if (this.trip.transport === "plane") actions.push(makeAction("check-in", "Check in online", "prep", "Clear airline admin before the airport."), makeAction("boarding-pass", "Download boarding passes and screenshots", "prep", "Keep offline copies."), makeAction("baggage-rules", "Review baggage rules", "prep", "Avoid airport surprises."));
            if (this.trip.transport === "car") actions.push(makeAction("car-rules", "Check driving rules at destination", "plan", "Especially important abroad."), makeAction("car-kit", "Check required items in the car", "prep", "Some countries require specific safety gear."));
            if (this.trip.international) actions.push(makeAction("passport-check", "Take passport", "departure", "Border-crossing essential."), makeAction("roaming", "Turn on roaming or confirm travel eSIM", "prep", "Connectivity check."), makeAction("cash-backup", "Exchange or withdraw backup cash", "prep", "Useful fallback."), makeAction("maps", "Download Google Maps offline area", "prep", "Safer than relying on a live connection."), makeAction("translate", "Download Google Translate language pack", "prep", "Useful backup when signal is weak."));
            if (this.trip.days >= 3) actions.push(makeAction("empty-fridge", "Empty the fridge", "leave", "Avoid waste while away."), makeAction("empty-trash", "Empty the trash", "leave", "Return to a cleaner place."), makeAction("wash-dishes", "Wash the dishes", "leave", "One less stale surprise after the trip."));
            if (this.trip.days >= 5) actions.push(makeAction("water-flowers", "Water flowers", "leave", "Longer trip, higher chance they need it."));
            if (this.trip.activities.includes("hike")) actions.push(makeAction("hike-gear", "Review hiking-specific gear", "prep", "Trail days need extra prep."));
            if (this.trip.style === "business" || this.trip.activities.includes("formal")) actions.push(makeAction("smart-outfit", "Prepare and iron the smarter outfit", "prep", "Do it before the departure rush."));
            return mergeActions(actions);
        },
        actionGroups() {
            const order = ["plan", "prep", "leave", "departure"];
            return Object.values(this.departureActions().reduce((groups, action) => {
                groups[action.stage] ||= { stage: action.stage, label: STAGE_LABELS[action.stage], items: [] };
                groups[action.stage].items.push(action);
                return groups;
            }, {})).sort((a, b) => order.indexOf(a.stage) - order.indexOf(b.stage));
        },
        isChecked(kind, id) { return !!this.checked[kind][id]; },
        toggleChecked(kind, id) {
            this.checked = { ...this.checked, [kind]: { ...this.checked[kind], [id]: !this.checked[kind][id] } };
        },
        progressLabel() {
            const packing = this.buildItems().map(item => item.id);
            const actions = this.departureActions().map(action => action.id);
            const done = packing.filter(id => this.checked.packing[id]).length + actions.filter(id => this.checked.actions[id]).length;
            return `${done} of ${packing.length + actions.length} done`;
        },
        progressPercent() {
            const packing = this.buildItems().map(item => item.id);
            const actions = this.departureActions().map(action => action.id);
            const total = packing.length + actions.length;
            const done = packing.filter(id => this.checked.packing[id]).length + actions.filter(id => this.checked.actions[id]).length;
            return total ? Math.round((done / total) * 100) : 0;
        },
        async copyPlan() {
            const lines = [this.headline(), this.summaryText(), "", "Must pack:"];
            this.mustPack().forEach(item => lines.push(`- ${item.name} (${item.qtyLabel}) — ${item.reasonText}`));
            if (this.optionalPack().length) {
                lines.push("", "Optional:");
                this.optionalPack().forEach(item => lines.push(`- ${item.name} (${item.qtyLabel}) — ${item.reasonText}`));
            }
            lines.push("", "Before you leave:");
            this.departureActions().forEach(action => lines.push(`- ${action.name} — ${action.reasonText}`));
            try {
                await navigator.clipboard.writeText(lines.join("\n"));
                this.copyState = "Copied";
            } catch (error) {
                this.copyState = "Copy failed";
            }
            setTimeout(() => { this.copyState = "Copy Plan"; }, 1400);
        },
        resetTrip() {
            this.trip = defaultTrip();
            this.checked = { packing: {}, actions: {} };
            this.copyState = "Copy Plan";
        }
    }));
});
