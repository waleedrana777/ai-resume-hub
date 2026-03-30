# Income Finder — Project Resume

## What This Is

A map-first mobile app (Flutter) that shows jobs and professionals on a map in Italy. Supabase backend, MapTiler maps (via flutter_map). Apple Find My / Snapchat Map design inspiration.

## Current State (2026-03-30)

### Shipped Core
- Map screen with emoji pins (jobs = varied emoji, people = walking emoji)
- Two tabs: Jobs / Job Buddy (bottom nav)
- Pin tap shows macOS Dictionary-style detail popup
- Single MapTiler map via flutter_map (no toggle, no Mapbox)
- Auth flow (Supabase) with skip-auth for testing
- Sample data: 24 jobs + 20 people around Rome, Italy
- Location service with Rome default fallback

### Just Cleaned (this session)
- Removed: sidebar settings drawer, fake network/chat widget, labs screen (AR scanner, AI negotiator, crypto wallet, gig swipe, voice commander), modern UI mode, dual intro screens, glass container widgets, stories/chat/profile modern screens
- Removed: AppModeProvider, LabsProvider
- Simplified: main.dart goes straight to AuthWrapper -> MapScreen. No intro carousel, no mode switching.
- Removed: Mapbox SDK, OpenStreetMap widget, map toggle logic. Single MapTiler implementation remains.
- Fixed: bottom nav emoji rendering (wrapped in SizedBox), all default locations aligned to Rome

### Files That Matter
```
lib/main.dart                          — Entry point, Supabase init, straight to MapScreen
lib/screens/map_screen.dart            — Main screen: map + bottom nav (Rome default)
lib/screens/auth_screen.dart           — Sign in / sign up (currently bypassed)
lib/widgets/map_widget.dart            — Thin pass-through to MapTiler
lib/widgets/maps/maptiler_map_widget.dart — THE map (MapTiler tiles, emoji markers, zoom)
lib/widgets/pin_detail_popup.dart      — Dictionary-style pin detail dialog
lib/models/map_item.dart               — Generic map item (job | person)
lib/models/user.dart                   — User model
lib/providers/map_provider.dart        — Map state + sample data (Rome center)
lib/providers/auth_provider.dart       — Auth state
lib/services/supabase_service.dart     — Supabase operations
lib/services/location_service.dart     — GPS / location permissions
```

## Single Feature to Ship: Rome Instagrammer Discovery

### The Idea
Instead of fake sample data, onboard users by showing **real popular Instagrammers in Rome**. Scrape/aggregate public Instagram profiles of influencers, creators, and local figures in Rome and display them as pins on the map.

### Why This Feature
- Gives the app real, compelling content on first open
- Rome is a target market — tourists and locals both care about local creators
- Makes the Job Buddy tab actually useful: "discover who's around you"
- One feature, fully shipped, beats 10 half-built features

### What Needs to Happen
1. **Data source**: Build a scraper or use an API to get public Instagram profiles of popular Rome-based accounts (name, bio, follower count, profile pic URL, approximate location)
2. **Backend**: Store scraped profiles in Supabase as MapItems of type `person` with Instagram metadata
3. **Display**: Show Instagrammers as pins on the Rome map — tap to see their profile info
4. **Onboarding**: When a new user opens the app, the map is already populated with real Rome creators — no empty state
5. **Refresh**: Periodic scrape to keep data fresh

### What We Are NOT Building
- No chat
- No messaging
- No job applications
- No filters
- No notifications
- No settings screen
- No profile editing
- No stories
- No AR/VR/crypto/voice anything

## Tech Stack
- **Mobile**: Flutter
- **Backend/DB**: Supabase (Postgres)
- **Maps**: Mapbox (primary), OpenStreetMap (fallback)
- **Auth**: Supabase Auth

## Decision Log
| Date | Decision | Why |
|------|----------|-----|
| 2026-03-29 | Cut 90% of features, focus on Rome Instagrammer discovery | Ship one real feature to App Store instead of 10 demos |
| 2026-03-29 | Removed sidebar, labs, modern mode, chat widget, intro screens | Clutter removal — map is the product |
| 2026-03-29 | Default location = Isernia, Italy | Developer's base location |
