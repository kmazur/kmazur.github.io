const STORAGE_KEY = "travel-packing-helper-v4";

function normalizeEntry(entry) {
    return {
        id: entry.id || "",
        name: entry.name || "",
        category: entry.category || "",
        stage: entry.stage || "",
        qty: entry.qty || "",
        note: entry.note || "",
        tags: Array.isArray(entry.tags) ? entry.tags : []
    };
}

function normalizeDataset(dataset) {
    const meta = dataset && dataset.meta ? dataset.meta : {};
    const items = dataset && Array.isArray(dataset.items) ? dataset.items.map(normalizeEntry) : [];
    const actions = dataset && Array.isArray(dataset.actions) ? dataset.actions.map(normalizeEntry) : [];

    return {
        meta: {
            title: meta.title || "Travel Checklist",
            subtitle: meta.subtitle || "Predefined travel checklist"
        },
        items,
        actions
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
        checked: { items: {}, actions: {} },
        loading: true,
        loadError: "",
        copyState: "Copy checked",

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
                if (!response.ok) {
                    throw new Error(`Failed to load checklist data (${response.status})`);
                }
                this.dataset = normalizeDataset(await response.json());
            } catch (error) {
                this.loadError = "Checklist data could not be loaded.";
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        itemGroups() {
            return groupBy(this.dataset.items, "category", "Other").map(group => ({
                label: group.label,
                entries: group.entries.slice().sort((a, b) => a.name.localeCompare(b.name))
            }));
        },

        actionGroups() {
            return groupBy(this.dataset.actions, "stage", "Later");
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
            return `${this.dataset.items.length} packing items and ${this.dataset.actions.length} travel actions, all visible immediately and ready to tick.`;
        },

        async copyChecked() {
            const lines = [this.dataset.meta.title, ""];
            const checkedItems = this.dataset.items.filter(item => this.checked.items[item.id]);
            const checkedActions = this.dataset.actions.filter(action => this.checked.actions[action.id]);

            lines.push("Checked packing items:");
            if (checkedItems.length) {
                checkedItems.forEach(item => {
                    lines.push(`- ${item.name}${item.qty ? ` (${item.qty})` : ""}${item.note ? ` - ${item.note}` : ""}`);
                });
            } else {
                lines.push("- none");
            }

            lines.push("", "Checked travel actions:");
            if (checkedActions.length) {
                checkedActions.forEach(action => {
                    lines.push(`- ${action.name}${action.note ? ` - ${action.note}` : ""}`);
                });
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
                this.copyState = "Copy checked";
            }, 1400);
        },

        clearChecks() {
            this.checked = { items: {}, actions: {} };
            this.copyState = "Copy checked";
        }
    };
};
