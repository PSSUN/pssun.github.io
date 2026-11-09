# AGENTS.md

Personal academic homepage of Peisen Sun (bioinformatics PhD student, Xi'an Jiaotong University), built with Jekyll on the `luost26/academic-homepage` template. The repo name `pssun.github.io` means GitHub Pages builds and deploys it automatically from `main` — there is no CI workflow to run or maintain; every push to `main` goes live.

## Local preview

```bash
bundle exec jekyll serve   # then open http://127.0.0.1:4000
```

Jekyll ~> 3.9, kramdown. The Gemfile already includes Windows-specific gems (`tzinfo-data`, `wdm`). `Gemfile.lock` and `_site/` are gitignored. There is no test suite or linter.

## Layout

- `_data/` — most site personalization lives here:
  - `profile.yml` — name, positions, bio, portrait, social links
  - `display.yml` — homepage section toggles (`show_news`, `show_experience`, `num_news`, ...)
  - `navigation.yml` — navbar pages
- Collections (defined in `_config.yml`), edited as Markdown files with front matter:
  - `_news/YYYY-newsN.md` — `title` (may contain raw HTML for links/badges) + `date`
  - `_publications/YYYY/YYYY-pub-*.md` — `title`, `date`, `selected`, `pub`, `pub_date`, `abstract`, `cover`, `authors` (list), `links` (map of label → URL)
  - `_tools/*.md` — tool cards: `title`, `subtitle`, `description`, `cover`, `tags`, `links`
  - `_showcase/` — grid cards with `show`, `width`, `height`; body can include widgets (e.g. `widgets/carousel.html`)
- `_layouts/`, `_includes/widgets/` — page scaffolding and per-item renderers; changing these affects every page
- Root pages: `index.html`, `publications.html`, `tools.html`, `showcase.html`, `other.html`
- `assets/images/` — covers, photos, badges; reference with site-root paths like `/assets/images/covers/x.png`

## Conventions and gotchas

- `other.html` is a large hand-written standalone page (~30KB with inline CSS/JS: clock, year progress, weather). It is not generated — edit it directly and carefully; it is the most frequently changed file.
- Navbar highlighting: the `name` in `_data/navigation.yml` must exactly match the `navbar_title` front-matter field of each root page. A new page needs `layout: default` + `navbar_title` plus a `navigation.yml` entry.
- Emails are obfuscated through the `jekyll-email-protect` plugin (`| encode_email` filter, used in `_includes/widgets/profile_card*.html`). Never hardcode a `mailto:` link.
- Items render newest-first by `date`; publication dates use full timestamps like `2026-02-12 00:01:00 +0800`.
- `baseurl` is `""` — the site serves from the domain root, so links/assets start with `/`.
- Content is bilingual (English primary, Chinese names in author lists); keep that style.
- `README.md` documents the upstream template, not this site's workflow — don't treat it as authoritative for this repo.
