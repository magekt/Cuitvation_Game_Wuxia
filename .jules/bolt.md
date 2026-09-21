# Bolt's Performance Journal

## 2026-09-21 - React.memo on Grid Tile Rendering
**Learning:** Rendering large interactive grid maps (e.g. 7x7 to 13x13 grid tiles = 49 to 169 tile components) causes all tile components to re-render whenever player coordinates update or a single tile is selected.
**Action:** Wrap sub-components like `TileButton` with `React.memo` to prevent unnecessary DOM re-renders on unaffected tiles.
