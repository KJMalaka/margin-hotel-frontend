# Brand font

Self-hosted copies (latin subset, woff2) downloaded from Google Fonts and
loaded with `next/font/local` in `app/layout.tsx`, so builds need no network
fetch and the metric-matched fallback prevents layout shift.

| File | Family | Use |
| --- | --- | --- |
| `AtkinsonHyperlegible-400.woff2` | Atkinson Hyperlegible Regular | All body and interface text |
| `AtkinsonHyperlegible-700.woff2` | Atkinson Hyperlegible Bold | Headings, labels, emphasis |

Atkinson Hyperlegible was designed by the Braille Institute for readers with
low vision. It is licensed under the SIL Open Font License 1.1:
https://openfontlicense.org
