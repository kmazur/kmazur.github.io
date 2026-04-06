const STORAGE_KEY = "travel-packing-checklist-v2";
const DATASET_URL = "./data.json?v=20260406-1";

const TAG_GROUPS = {
    "Gender": ["woman", "man"],
    "Season": ["summer", "winter"],
    "Activity": ["hiking", "beach", "city", "skiing"],
    "Trip": ["international", "business", "swim"],
    "Weather": ["rain", "hot", "cold"],
    "Context": ["daily", "transit", "work", "comfort"],
    "Priority": ["important"],
};

const TAG_COLORS = {
    woman: "#f9a8d4",
    man: "#7dd3fc",
    summer: "#fbbf24",
    winter: "#93c5fd",
    hiking: "#4ade80",
    beach: "#fcd34d",
    city: "#c084fc",
    skiing: "#7dd3fc",
    international: "#c084fc",
    business: "#f59e0b",
    swim: "#38bdf8",
    rain: "#60a5fa",
    hot: "#fb923c",
    cold: "#7dd3fc",
    daily: "#4ade80",
    transit: "#a78bfa",
    work: "#f472b6",
    comfort: "#34d399",
    important: "#f87171",
    money: "#fbbf24",
    tech: "#38bdf8",
    document: "#a78bfa",
    booking: "#f59e0b",
    health: "#fb7185",
    washbag: "#2dd4bf",
    clothes: "#818cf8",
    weather: "#60a5fa",
    long: "#d4d4d8",
    week: "#a1a1aa",
};

function normalizeEntry(entry) {
    return {
        id: entry.id || "",
        name: entry.name || "",
        category: entry.category || "",
        qty: entry.qty || "",
        note: entry.note || "",
        tags: Array.isArray(entry.tags) ? entry.tags : [],
    };
}

function normalizeDataset(dataset) {
    const meta = dataset && dataset.meta ? dataset.meta : {};
    const items = dataset && Array.isArray(dataset.items) ? dataset.items.map(normalizeEntry) : [];
    return {
        meta: { title: meta.title || "Packing Checklist" },
        items,
    };
}

function groupBy(entries, key, fallbackLabel) {
    const groups = [];
    const index = {};
    entries.forEach(entry => {
        const label = entry[key] || fallbackLabel;
        if (index[label] === undefined) {
            index[label] = groups.length;
            groups.push({ label, entries: [] });
        }
        groups[index[label]].entries.push(entry);
    });
    return groups;
}

window.travelChecklistApp = function () {
    return {
        dataset: normalizeDataset({}),
        checked: { items: {} },
        loading: true,
        loadError: "",
        copyState: "copy packed",
        searchQuery: "",
        activeTags: [],
        collapsedGroups: {},
        hidePackedMode: false,

        async init() {
            // Load v2 first, fall back to v1
            let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (!saved) {
                const v1 = JSON.parse(localStorage.getItem("travel-packing-checklist-v1") || "null");
                if (v1 && v1.checked && v1.checked.items) {
                    saved = { checked: v1.checked };
                }
            }
            if (saved && saved.checked && saved.checked.items) {
                this.checked = { items: saved.checked.items };
            }

            this.$watch("checked", () => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ checked: this.checked }));
            });

            try {
                const response = await fetch(DATASET_URL, { cache: "no-store" });
                if (!response.ok) throw new Error(`Failed to load (${response.status})`);
                this.dataset = normalizeDataset(await response.json());
            } catch (error) {
                this.loadError = "Checklist data could not be loaded.";
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        allTags() {
            const tags = new Set();
            this.dataset.items.forEach(item => item.tags.forEach(t => tags.add(t)));
            return [...tags].sort();
        },

        tagGroups() {
            const allTags = this.allTags();
            const grouped = [];
            const used = new Set();
            for (const [groupName, groupTags] of Object.entries(TAG_GROUPS)) {
                const available = groupTags.filter(t => allTags.includes(t));
                if (available.length) {
                    grouped.push({ label: groupName, tags: available });
                    available.forEach(t => used.add(t));
                }
            }
            const remaining = allTags.filter(t => !used.has(t));
            if (remaining.length) {
                grouped.push({ label: "Other", tags: remaining });
            }
            return grouped;
        },

        isTagActive(tag) {
            return this.activeTags.includes(tag);
        },

        toggleTag(tag) {
            if (this.activeTags.includes(tag)) {
                this.activeTags = this.activeTags.filter(t => t !== tag);
            } else {
                this.activeTags = [...this.activeTags, tag];
            }
        },

        clearFilters() {
            this.activeTags = [];
            this.searchQuery = "";
        },

        hasActiveFilters() {
            return this.activeTags.length > 0 || this.searchQuery.trim().length > 0;
        },

        filteredItems() {
            let items = this.dataset.items;
            if (this.activeTags.length > 0) {
                items = items.filter(item =>
                    this.activeTags.some(tag => item.tags.includes(tag))
                );
            }
            const q = this.searchQuery.trim().toLowerCase();
            if (q) {
                items = items.filter(item =>
                    item.name.toLowerCase().includes(q) ||
                    item.note.toLowerCase().includes(q) ||
                    item.tags.some(t => t.toLowerCase().includes(q))
                );
            }
            if (this.hidePackedMode) {
                items = items.filter(item => !this.checked.items[item.id]);
            }
            return items;
        },

        filteredGroups() {
            const items = this.filteredItems();
            return groupBy(items, "category", "Other").map(group => ({
                label: group.label,
                entries: group.entries.slice().sort((a, b) => a.name.localeCompare(b.name)),
            }));
        },

        isGroupCollapsed(label) {
            return !!this.collapsedGroups[label];
        },

        toggleGroup(label) {
            this.collapsedGroups = {
                ...this.collapsedGroups,
                [label]: !this.collapsedGroups[label],
            };
        },

        groupPackedCount(entries) {
            return entries.filter(item => this.checked.items[item.id]).length;
        },

        isChecked(id) {
            return !!this.checked.items[id];
        },

        toggleChecked(id) {
            this.checked = {
                items: { ...this.checked.items, [id]: !this.checked.items[id] },
            };
        },

        packedCount() {
            return this.dataset.items.filter(item => this.checked.items[item.id]).length;
        },

        totalCount() {
            return this.dataset.items.length;
        },

        remainingCount() {
            return this.totalCount() - this.packedCount();
        },

        progressPercent() {
            const total = this.totalCount();
            return total ? Math.round((this.packedCount() / total) * 100) : 0;
        },

        filteredCount() {
            return this.filteredItems().length;
        },

        tagColor(tag) {
            return TAG_COLORS[tag] || "#71717a";
        },

        async copyPacked() {
            const lines = ["Packing Checklist", "", "Packed:"];
            const packedItems = this.dataset.items.filter(item => this.checked.items[item.id]);
            if (packedItems.length) {
                packedItems.forEach(item => {
                    lines.push(`  [x] ${item.name}${item.qty ? ` (${item.qty})` : ""}`);
                });
            } else {
                lines.push("  (none)");
            }
            lines.push("", "Remaining:");
            const remaining = this.dataset.items.filter(item => !this.checked.items[item.id]);
            if (remaining.length) {
                remaining.forEach(item => {
                    lines.push(`  [ ] ${item.name}${item.qty ? ` (${item.qty})` : ""}`);
                });
            } else {
                lines.push("  (none)");
            }
            try {
                await navigator.clipboard.writeText(lines.join("\n"));
                this.copyState = "copied!";
            } catch (error) {
                this.copyState = "failed";
            }
            setTimeout(() => { this.copyState = "copy packed"; }, 1400);
        },

        clearChecks() {
            this.checked = { items: {} };
            this.copyState = "copy packed";
        },
    };
};
