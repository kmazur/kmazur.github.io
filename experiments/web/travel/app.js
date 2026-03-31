const STORAGE_KEY = "travel-packing-helper-v3";

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const normalizeEntry = (entry) => ({
    id: entry.id,
    name: entry.name,
    category: entry.category || "",
    stage: entry.stage || "",
    qty: entry.qty || "",
    note: entry.note || "",
    tags: Array.isArray(entry.tags) ? entry.tags : []
});

const normalizeDataset = (dataset) => ({
    meta: {
        title: dataset?.meta?.title || "Travel Packing Helper",
        subtitle: dataset?.meta?.subtitle || "Predefined travel checklist"
    },
    items: (dataset?.items || []).map(normalizeEntry),
    actions: (dataset?.actions || []).map(normalizeEntry)
});

const matchesSearch = (entry, term) => {
    if (!term) return true;
    const haystack = [
        entry.name,
        entry.category,
        entry.stage,
        entry.qty,
        entry.note,
        ...(entry.tags || [])
    ].join(" ").toLowerCase();
    return haystack.includes(term);
};

const groupBy = (entries, key, fallbackLabel) => Object.values(entries.reduce((groups, entry) => {
    const label = entry[key] || fallbackLabel;
    groups[label] ||= { label, entries: [] };
    groups[label].entries.push(entry);
    return groups;
}, {}));

window.travelChecklistApp = function () {
    return {
        dataset: normalizeDataset({}),
        checked: { items: {}, actions: {} },
        loading: true,
        loadError: "",
        search: "",
        itemFilter: "all",
        actionFilter: "all",
        activeTab: "all",
        copyState: "Copy Checked",

        async init() {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            if (saved.checked) {
                this.checked = {
                    items: saved.checked.items || {},
                    actions: saved.checked.actions || {}
                };
            }

            this.$watch("checked", () => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ checked: this.checked }));
            });

            try {
                const response = await fetch("./data.json", { cache: "no-store" });
                if (!response.ok) throw new Error(`Failed to load checklist data (${response.status})`);
                this.dataset = normalizeDataset(await response.json());
            } catch (error) {
                this.loadError = "Checklist data could not be loaded.";
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        itemCategories() {
            return ["all"].concat(unique(this.dataset.items.map(item => item.category)));
        },

        actionStages() {
            return ["all"].concat(unique(this.dataset.actions.map(action => action.stage)));
        },

        visibleItems() {
            const term = this.search.trim().toLowerCase();
            return this.dataset.items.filter(item =>
                (this.itemFilter === "all" || item.category === this.itemFilter) &&
                matchesSearch(item, term)
            );
        },

        visibleActions() {
            const term = this.search.trim().toLowerCase();
            return this.dataset.actions.filter(action =>
                (this.actionFilter === "all" || action.stage === this.actionFilter) &&
                matchesSearch(action, term)
            );
        },

        itemGroups() {
            return groupBy(this.visibleItems(), "category", "Other").map(group => ({
                ...group,
                entries: group.entries.slice().sort((a, b) => a.name.localeCompare(b.name))
            }));
        },

        actionGroups() {
            return groupBy(this.visibleActions(), "stage", "Later");
        },

        isChecked(kind, id) {
            return !!this.checked[kind][id];
        },

        toggleChecked(kind, id) {
            this.checked = {
                ...this.checked,
                [kind]: {
                    ...this.checked[kind],
                    [id]: !this.checked[kind][id]
                }
            };
        },

        checkedCount(kind) {
            const source = kind === "items" ? this.dataset.items : this.dataset.actions;
            return source.filter(entry => this.checked[kind][entry.id]).length;
        },

        totalCount() {
            return this.dataset.items.length + this.dataset.actions.length;
        },

        completedCount() {
            return this.checkedCount("items") + this.checkedCount("actions");
        },

        progressLabel() {
            return `${this.completedCount()} of ${this.totalCount()} checked`;
        },

        progressPercent() {
            const total = this.totalCount();
            return total ? Math.round((this.completedCount() / total) * 100) : 0;
        },

        headline() {
            return this.dataset.meta.title;
        },

        summaryText() {
            return `${this.dataset.items.length} packing items and ${this.dataset.actions.length} travel actions, all defined in JSON and saved in your browser as you tick them.`;
        },

        checklistMode() {
            return this.activeTab === "all" ? "All lists" : (this.activeTab === "items" ? "Packing items only" : "Travel actions only");
        },

        activeSectionCount() {
            if (this.activeTab === "items") return this.visibleItems().length;
            if (this.activeTab === "actions") return this.visibleActions().length;
            return this.visibleItems().length + this.visibleActions().length;
        },

        async copyChecked() {
            const lines = [this.dataset.meta.title, ""];
            const checkedItems = this.dataset.items.filter(item => this.checked.items[item.id]);
            const checkedActions = this.dataset.actions.filter(action => this.checked.actions[action.id]);

            lines.push("Checked packing items:");
            if (checkedItems.length) {
                checkedItems.forEach(item => lines.push(`- ${item.name}${item.qty ? ` (${item.qty})` : ""}${item.note ? ` — ${item.note}` : ""}`));
            } else {
                lines.push("- none");
            }

            lines.push("", "Checked travel actions:");
            if (checkedActions.length) {
                checkedActions.forEach(action => lines.push(`- ${action.name}${action.note ? ` — ${action.note}` : ""}`));
            } else {
                lines.push("- none");
            }

            try {
                await navigator.clipboard.writeText(lines.join("\n"));
                this.copyState = "Copied";
            } catch (error) {
                this.copyState = "Copy failed";
            }

            setTimeout(() => {
                this.copyState = "Copy Checked";
            }, 1400);
        },

        clearChecks() {
            this.checked = { items: {}, actions: {} };
            this.copyState = "Copy Checked";
        }
    };
};
