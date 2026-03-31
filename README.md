# Knowledge Archive

This repository no longer uses Jekyll. It is organized as a plain content and experiments repo:

- `content/`: markdown pages and draft posts kept from the former blog
- `content/legacy/jekyll/`: archived Liquid/Jekyll-specific experiments kept for reference
- `data/`: supporting datasets and tag lists
- `experiments/web/`: self-contained browser prototypes
- `media/`: images and figures referenced by drafts
- `references/`: bibliography and other source material
- `tools/`: standalone utilities, including the OpenJDK crawler

Notes:

- Many files in `content/drafts/` still keep their old YAML front matter because it contains useful metadata such as title, tags, and author.
- `experiments/web/jdk/` should be opened through a local static server because it fetches JSON data at runtime.
