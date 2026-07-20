# CryptoPing — Bot specification

**Archetype:** custom

**Voice:** professional and concise — write every user-facing message, button label, error, and empty state in this voice.

CryptoPing is a personal Telegram bot that allows users to maintain a private watchlist of cryptocurrencies and receive alerts for price thresholds and percentage changes. Users can add/remove coins via inline buttons or by typing tickers, check prices on-demand, and receive optional daily summaries. The bot owner receives aggregate usage metrics for analytics.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- Individual Telegram users interested in crypto price tracking
- Bot owner seeking operational metrics

## Success criteria

- Users can add and manage watchlist items with alerts
- Alerts are delivered accurately with suppression logic
- Owner receives daily aggregate metrics
- Bot handles price-source failures gracefully

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Onboarding flow: detect time zone, set quiet hours, and show quick-start buttons for popular coins
- **/price** (command, actor: user, command: /price) — Check current price of a specific coin or the entire watchlist
- **/watchlist** (command, actor: user, command: /watchlist) — View and manage watchlist items with inline buttons for removal and editing
- **Add Coin** (button, actor: user, callback: add_coin:start) — Initiates the flow to add a new coin to the watchlist
- **Edit Threshold** (button, actor: user, callback: edit_threshold:start) — Allows users to edit threshold alerts for a specific watchlist item
- **Edit Percent** (button, actor: user, callback: edit_percent:start) — Allows users to edit percentage change alerts for a specific watchlist item
- **Toggle Enabled** (button, actor: user, callback: toggle_enabled:start) — Enables or disables alerts for a specific watchlist item
- **Snooze for X hours** (button, actor: user, callback: snooze:start) — Snoozes alerts for a specific watchlist item for a configurable duration
- **Disable this alert** (button, actor: user, callback: disable_alert:start) — Disables a specific alert for a watchlist item
- **/admin_stats** (command, actor: owner, command: /admin_stats) — Displays aggregate usage metrics for the bot owner

## Flows

### Onboarding
_Trigger:_ /start

1. Detect time zone
2. Offer to set quiet hours
3. Offer to set morning summary time
4. Show quick-start buttons for popular coins
5. Explain how to add arbitrary tickers

_Data touched:_ User profile

### Add Coin
_Trigger:_ add_coin:start

1. Confirm normalization of ticker
2. Ask which alerts to enable
3. Set threshold or percent-change alerts if selected

_Data touched:_ Watchlist entry

### Edit Threshold Alert
_Trigger:_ edit_threshold:start

1. Ask for price value and direction (above/below)
2. Update threshold alert settings

_Data touched:_ Watchlist entry

### Edit Percent Alert
_Trigger:_ edit_percent:start

1. Ask for percent value and window (default 1h)
2. Update percent-change alert settings

_Data touched:_ Watchlist entry

### Price Check
_Trigger:_ /price

1. Check current price
2. Show 24h change
3. Compare to last known watchlist price if present

_Data touched:_ Watchlist entry, Price source status

### Morning Summary
_Trigger:_ scheduled event

1. Check if enabled and within allowed time
2. Generate summary of watchlist items
3. Include price changes and threshold exceedances

_Data touched:_ User profile, Watchlist entry

### Alert Trigger
_Trigger:_ price update

1. Check if price crosses threshold or exceeds percent change
2. Send alert message with details
3. Apply suppression logic for cooldown period

_Data touched:_ Watchlist entry, Alert record

### Admin Metrics
_Trigger:_ /admin_stats

1. Fetch active user count
2. Fetch top N most-triggered alerts
3. Display metrics to owner

_Data touched:_ User profile, Alert record

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **User profile** _(retention: persistent)_ — Stores user-specific settings and preferences
  - fields: Telegram user id, display name, time zone, quiet hours (start, end), morning summary enabled + time, alert suppression window, locale/language
- **Watchlist entry** _(retention: persistent)_ — Represents a cryptocurrency in a user's watchlist
  - fields: user id, ticker, friendly name, enabled alert types, threshold price, percent change value, window duration, last known price, last alert timestamp, created_at
- **Alert record** _(retention: session)_ — Tracks triggered alerts for analytics
  - fields: user id (anonymized), ticker, alert type, triggered_at, old_price, new_price, percent_change
- **Price source status** _(retention: session)_ — Tracks the status of the external price feed
  - fields: last successful fetch timestamp, last failure timestamp

## Integrations

- **Telegram** (required) — Bot API messaging
- **Price feed** (required) — External market price API
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- View aggregate usage metrics via /admin_stats
- Configure price-source retry policy
- Set default alert suppression cooldown
- Define default quiet hours
- Set default morning summary time
- Configure default percent alert window

## Notifications

- Price threshold alerts
- Percent change alerts
- Morning summaries
- Price-source failure notifications (to users with active alerts)

## Permissions & privacy

- User data is private and not shared with third parties
- Alert records are anonymized for analytics
- Watchlists are private to individual users
- Bot respects user-configured quiet hours

## Edge cases

- Price oscillating around threshold causing multiple alerts
- Price-source failure during alert check
- User requests /price during price-source outage
- User adds an unknown ticker with no fuzzy match
- User enables morning summary but has no watchlist items

## Required tests

- Verify alert suppression logic prevents repeated alerts during oscillation
- Test price-source failure handling and retry behavior
- Validate morning summary content and timing
- Confirm user privacy and data isolation between users
- Test error handling for unknown tickers and fuzzy matching

## Assumptions

- Price feed API is reliable and provides current prices
- Users understand crypto price volatility and alert behavior
- Owner will implement a suitable price-source retry policy
- Telegram API is stable and available for bot communication
