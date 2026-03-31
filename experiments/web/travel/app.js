const STORAGE_KEY = "travel-packing-checklist-v1";

function normalizeEntry(entry) {
    return {
        id: entry.id || "",
        name: entry.name || "",
        category: entry.category || "",
        qty: entry.qty || "",
        note: entry.note || ""
    };
}

function normalizeDataset(dataset) {
    const meta = dataset && dataset.meta ? dataset.meta : {};
    const items = dataset && Array.isArray(dataset.items) ? dataset.items.map(normalizeEntry) : [];

    return {
        meta: {
            title: meta.title || "Packing Checklist"
        },
        items
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
        copyState: "Copy packed",

        async init() {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            if (saved.checked && saved.checked.items) {
                this.checked = { items: saved.checked.items };
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

        isChecked(id) {
            return !!this.checked.items[id];
        },

        toggleChecked(id) {
            this.checked = {
                items: {
                    ...this.checked.items,
                    [id]: !this.checked.items[id]
                }
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

        progressLabel() {
            return `${this.packedCount()} of ${this.totalCount()} packed`;
        },

        progressPercent() {
            const total = this.totalCount();
            return total ? Math.round((this.packedCount() / total) * 100) : 0;
        },

        headline() {
            return this.dataset.meta.title;
        },

        summaryText() {
            return `${this.dataset.items.length} things to pack. Tick what is already packed and leave the rest unchecked.`;
        },

        async copyPacked() {
            const lines = [this.dataset.meta.title, "", "Already packed:"];
            const packedItems = this.dataset.items.filter(item => this.checked.items[item.id]);

            if (packedItems.length) {
                packedItems.forEach(item => {
                    lines.push(`- ${item.name}${item.qty ? ` (${item.qty})` : ""}`);
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
                this.copyState = "Copy packed";
            }, 1400);
        },

        clearChecks() {
            this.checked = { items: {} };
            this.copyState = "Copy packed";
        }
    };
};
