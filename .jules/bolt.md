## 2025-05-18 - WorldGrid Tile Component Memoization
**Learning:** Large tile grid maps in React app re-render every tile button on player movements or selection changes. Extracting tile buttons into a `React.memo` component prevents unnecessary re-renders for unchanged tiles.
**Action:** When working with 2D grid/tile maps, extract individual tile components and memoize tile renderers with static helper functions placed outside component scope.
