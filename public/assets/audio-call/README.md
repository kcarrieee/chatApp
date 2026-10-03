# Audio call assets

Design: https://www.figma.com/design/1NZmtql1cKSZ6KtLA2a6CD/Portfolio-site?node-id=945-39761

The glow, call controls and connected-state rings are original assets downloaded from Figma's design-context response. `tatyana.svg` reuses the existing profile avatar and its crop, as requested, instead of the design's Andrey avatar.

`AudioCallScreen` accepts `theme="dark"` (default) or `theme="light"`. There is intentionally no theme switcher yet. The screen simulates a connection after three seconds, runs a local elapsed-time counter, and toggles local microphone/speaker state. It does not request device permissions or establish a real call. Leaving the screen disposes of its timers.
