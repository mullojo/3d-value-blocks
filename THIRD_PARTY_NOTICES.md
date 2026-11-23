# Third-party notices

The root [MIT License](LICENSE) covers original project code and documentation. It does not override the licenses below. Keep upstream notices with redistributed copies.

| Material | Version / license | Local notice and source |
| --- | --- | --- |
| Vue | 3.5.44 · MIT | `vendor/vue.global.prod.js`; copyright Yuxi (Evan) You and Vue contributors; [vendor notice](vendor/NOTICE.md) |
| Tailwind CSS | 4.3.4 · MIT | Compiled `vendor/tailwind.css` and retained `vendor/tailwind-browser.js`; copyright Tailwind Labs, Inc.; [vendor notice](vendor/NOTICE.md) |
| QR Code Generator for JavaScript | 1.4.4 · MIT | `vendor/qrcode-generator.js`; copyright Kazuhiko Arase; [vendor notice](vendor/NOTICE.md). Used by local SVG generators. |
| jsQR | 1.4.0 · Apache-2.0 | `vendor/jsqr.js`; [full license](vendor/jsqr-LICENSE.txt). Used for QR verification, not the main application. |
| Bob’s and Lindsay’s project-journal photographs | Contributor-supplied; project use permitted | `lab-assets/bob-profile.png` and `lab-assets/lindsay-profile.png`; [usage note](lab-assets/README.md). These photographs are separate from the MIT software license. |
| Illustrative portrait photographs | Unsplash license | `journal-assets/portrait-*.jpg`; [individual image sources](journal-assets/README.md), [license](https://unsplash.com/license) |

Archived experiments contain their own vendored library copies and license notices. Preserve those too.

The Unsplash photographs are illustrative. Names, roles, affiliations, records, and film credits in the studio’s sample journals and fictional film are fictional and do not imply the people pictured contributed to or endorse this project. Screenshots in the gallery and its README overview containing those photographs also contain third-party material; the photos are not relicensed under MIT.

The film’s giving QR is a locally generated design mockup with a reserved `.example` destination. Its styling was adapted from the author’s Scan It / QR-Code-Maker lab experiment. The separate project-support QR is generated here from `project-support.json`; neither generator contacts an external QR service.
