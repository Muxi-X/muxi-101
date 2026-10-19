---
description: 'Use when adding or changing text in the product showcase, app detail pages, or product copy styles. Keep all product-page text on the Our product entrance animation.'
applyTo: ['src/views/product.tsx', 'src/views/product.scss']
---

# Product Page Copy Animation

- Apply the existing `product-text-in` entrance animation to every visible product-copy text element, including headings, descriptions, labels, links, and future copy.
- Trigger overview copy from the product stage's `is-visible` state; trigger detail copy when its detail content is rendered.
- Stagger related text with small delays, following the existing overview and detail copy timing.
