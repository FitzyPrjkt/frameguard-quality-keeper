# FrameGuard

FRAMEGUARD — MASTER FRONTEND BUILD PROMPT

1. Project Overview

Build a polished, responsive frontend prototype for FrameGuard, a professional video quality analysis and preparation application.

Product positioning:

Maximum-Compatible Quality Preparation.

FrameGuard analyzes video files, evaluates them against verified platform upload capabilities, and prepares them with the minimum necessary changes while preserving as much original quality as possible.

The product must communicate these principles:

- Quality Preservation First.
- Maximum-Compatible Preparation.
- Minimum Necessary Changes.
- Evidence-Based Decisions.
- Original File Protection.
- Transparent Processing.

FrameGuard is not a generic video editor, video enhancer, or compression utility.

It is a professional video preparation and verification tool.

The frontend must visually communicate a credible, technically sophisticated product while remaining simple and approachable for ordinary users.

2. Technical Scope

Build a frontend-only web prototype.

Preferred stack:

- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide icons.
- CSS variables for theming.

Use 21st.dev community components selectively when they improve the interface. Prefer shadcn/ui primitives as the consistent foundation.

Important constraints:

- Do not build a backend.
- Do not implement real FFmpeg processing.
- Do not pretend that actual video analysis or verification has occurred.
- Use clearly labeled synthetic/mock data.
- Use local mock state for interactions.
- Do not require authentication or external API keys.
- Do not introduce unnecessary dependencies.
- Keep components reusable and maintainable.
- Keep the implementation suitable for future migration of the visual design into native Android Jetpack Compose.

This is a web design prototype, NOT the final Android application.

3. Design Direction

The visual direction is:

Minimalist. Elegant. Clean. Balanced. Responsive.

Theme:

- Adaptive light and dark mode.
- Default to system preference, with a manual theme toggle.
- Persist the selected theme locally in the browser.

Layout density:

- Balanced.
- Generous but controlled whitespace.
- Clear separation between sections.
- Avoid cramped layouts and unnecessary visual containers.

Accent:

- Soft professional blue.

Typography:

- Geist or Inter.
- Clear typographic hierarchy.
- Comfortable line heights.
- Restrained font weights.

Visual characteristics:

- Neutral backgrounds.
- Subtle surfaces.
- Thin and understated borders.
- Consistent medium corner radius.
- Minimal shadows.
- Small, purposeful icons.
- Smooth, subtle transitions.
- Strong alignment and consistent spacing.

Avoid:

- Excessive cards.
- Excessive borders.
- Bento grids everywhere.
- Neon colors.
- Glowing gradients.
- Glassmorphism.
- Decorative illustrations.
- Oversized icons.
- Excessive badges.
- Excessive animations.
- Generic SaaS dashboard aesthetics.

Whitespace is a deliberate part of the design.

Do not fill every available area with UI elements.

Use content width constraints to keep information readable.

4. Design System

Create reusable semantic design tokens.

Light theme:

- Background: soft off-white.
- Surface: white.
- Foreground: near-black.
- Muted foreground: neutral gray.
- Border: subtle light gray.
- Primary: professional soft blue.
- Secondary: understated neutral.
- Success: muted green.
- Warning: muted amber.
- Destructive: muted red.

Dark theme:

- Background: charcoal, not pure black.
- Surface: slightly elevated dark gray.
- Foreground: soft white.
- Muted foreground: neutral gray.
- Border: subtle dark gray.
- Primary: accessible soft blue.
- Status colors: restrained and readable.

Use CSS variables and semantic tokens so both themes share the same component architecture.

Create reusable components for:

- Buttons.
- Inputs.
- Selects.
- Switches.
- Tabs.
- Dialogs.
- Tooltips.
- Toast notifications.
- Progress indicators.
- Step indicators.
- Tables.
- Empty states.
- Skeleton loading.
- Status indicators.
- File upload areas.

Use Lucide icons consistently.

5. Application Navigation

Create an application shell with:

Desktop:

- Collapsible left sidebar.
- FrameGuard logo and product name.
- Simple navigation labels and icons.
- Active navigation state.
- Main content area.
- Small top bar with page context and theme toggle.

Mobile:

- Responsive navigation drawer or bottom navigation where appropriate.
- No permanently visible desktop sidebar.
- Comfortable touch targets.
- No horizontal overflow.
- Forms and tables must adapt to narrow screens.

Navigation structure:

WORKSPACE

1. Overview
2. My Videos
3. Analysis
4. History

CONFIGURATION
5. Platform Profiles
6. Settings

The main video workflow should be accessible through a prominent but restrained "Prepare Video" action.

6. Pages and UI Planning

Build the following pages with consistent layout and reusable components.

PAGE 01 — Overview / Dashboard

Purpose:
Give users a quick overview and an obvious starting point.

Elements:

- Page title: "Overview".
- Short description: "Your video quality workspace."
- Primary action: "Prepare a Video".
- Small summary metrics:
  - Videos Analyzed.
  - Videos Prepared.
  - Verification Results.
- Recent activity section.
- Recent video entries.
- Current platform profile status.
- Helpful empty state for new users.

Do not create a dashboard full of statistic cards.

Prefer a simple layout with a prominent preparation area and restrained activity information.

PAGE 02 — My Videos / Video Import

Purpose:
Let users select and inspect video files.

Elements:

- File selection area.
- Drag-and-drop zone for desktop.
- Browse Files button.
- Supported file format information.
- Selected video preview placeholder.
- Filename.
- File size.
- Duration.
- Basic metadata.
- Remove or replace file action.

Show an appropriate empty state before selection.

Do not claim the browser has analyzed a file unless mock analysis is explicitly triggered.

PAGE 03 — Analysis

Purpose:
Present source media characteristics.

Organize information into logical groups:

VIDEO

- Codec.
- Resolution.
- Aspect ratio.
- Frame rate.
- Bitrate.
- Pixel format.
- Profile and level when available.

AUDIO

- Audio codec.
- Sample rate.
- Channels.
- Audio bitrate when available.

CONTAINER

- Container format.
- Duration.
- File size.
- Faststart status where available.

ADDITIONAL INFORMATION

- HDR information.
- Bit depth.
- Color metadata.
- VFR/CFR classification.
- Unknown or unavailable values.

Use compact tables or well-spaced definition lists instead of excessive cards.

Each field should support:

- Measured value.
- Unknown.
- Not available.

Never fabricate missing metadata.

PAGE 04 — Compatibility Assessment

Purpose:
Compare the source video against a platform capability profile.

Show:

- Selected platform profile.
- Profile verification status.
- Last verified date when available.
- Evidence/source information.
- Compatibility results.

Possible statuses:

- Compatible.
- Needs Adjustment.
- Unknown.
- Unsupported.
- Insufficient Evidence.

For each relevant parameter show:

- Source value.
- Verified capability or constraint.
- Assessment.
- Explanation.

Important:
Never invent TikTok Web upload limits.

Use synthetic demonstration values only when visibly labeled as MOCK DATA.

Clearly distinguish:

- Officially documented capabilities.
- Empirically verified capabilities.
- Secondary evidence.
- Unknown capabilities.
- Conflicting evidence.

A profile with insufficient evidence must not produce a false compatibility guarantee.

PAGE 05 — Preparation

Purpose:
Show FrameGuard's preparation decisions.

Display:

- Source media profile.
- Target compatible profile.
- Parameters to preserve.
- Parameters requiring adjustment.
- Parameters that cannot currently be handled.
- Preparation method.

Possible decisions:

- NO_CHANGE.
- SMART_REMUX.
- CONDITIONAL_REENCODE.
- UNSUPPORTED.
- INSUFFICIENT_EVIDENCE.

Explain why every adjustment is recommended.

Core rules:

- Preserve compatible source parameters.
- Only adjust verified violations.
- Do not upscale.
- Do not interpolate frames.
- Do not forge metadata.
- Do not perform unnecessary transcoding.
- Never overwrite the original.
- Lossy re-encoding requires explicit authorization.
- Unknown platform limits must not trigger automatic conversion.

PAGE 06 — Preparation Review

Purpose:
Let users review changes before processing.

Show a clear comparison:

SOURCE → PREPARED OUTPUT

Include:

- Original values.
- Expected output values.
- Preserved parameters.
- Changed parameters.
- Reason for every change.
- Expected processing method.
- Potential quality implications.

Primary action:
"Generate Prepared Video"

Secondary action:
"Back to Preparation"

For a NO_CHANGE decision, clearly communicate that processing is unnecessary.

Do not silently execute lossy operations.

PAGE 07 — Processing Center

Purpose:
Represent the processing workflow.

Show:

- Processing stage.
- Progress indicator.
- Current operation.
- Estimated information only when justified.
- Cancel action.
- Processing status.
- Error state.

Use realistic simulated progress for the frontend prototype.

Never present mock progress as actual FFmpeg execution.

If processing fails:

- Show a readable error.
- Indicate that the original source remains untouched.
- Show that incomplete output is not considered successful.

PAGE 08 — Quality Verification

Purpose:
Display verification results for the prepared output.

Show:

- Overall verification status.
- Source versus output comparison.
- Codec.
- Resolution.
- Frame rate.
- Duration.
- Audio properties.
- Stream integrity.
- Any unexpected changes.

Verification states:

- Passed.
- Warning.
- Failed.
- Inconclusive.

Explain what was actually checked.

Do not claim perceptual quality equivalence from metadata alone.

Clearly distinguish measured results from simulated results.

PAGE 09 — Export & Share

Purpose:
Allow users to save or share the prepared video.

Elements:

- Prepared output information.
- Filename.
- File size.
- Verification summary.
- Save Output button.
- Share action placeholder.
- Export Report action.

For the web prototype, these actions may use mock interactions.

The final Android application will use native file access and Android Share Sheet.

Do not claim to upload videos to TikTok automatically.

PAGE 10 — History

Purpose:
Review previous analysis and preparation sessions.

Elements:

- Search.
- Filters.
- Video filename.
- Date.
- Preparation method.
- Verification status.
- Source profile.
- Open report action.

Use a clean table on desktop and compact list rows on mobile.

Provide an empty state when no history exists.

PAGE 11 — Platform Profiles & Settings

Purpose:
Manage application preferences and platform evidence.

Platform Profiles:

- Platform name.
- Profile version.
- Verification status.
- Evidence classification.
- Last verified date.
- View profile details.

Settings:

- Theme selection: System / Light / Dark.
- Output preferences.
- Processing preferences.
- History preferences.
- Application information.

Do not implement fictional platform limits as real settings.

7. Main User Workflow

The application must communicate this sequence:

1. Select Video.
2. Analyze Source.
3. Assess Compatibility.
4. Review Preparation Decision.
5. Confirm Preparation.
6. Process Video.
7. Verify Output.
8. Export or Share.

Build a consistent step indicator for the workflow.

The user should always understand:

- Where they are.
- What has already happened.
- What happens next.
- Whether an action will modify or create a file.

8. Mock Data

Create a centralized mock data layer.

Use a sample file such as:

Filename: sample-video.mp4
Container: MP4
Video Codec: H.264
Resolution: 1920 × 1080
Frame Rate: 60 FPS
Pixel Format: yuv420p
Audio Codec: AAC
Audio Sample Rate: 48000 Hz
Duration: 00:30
File Size: 45 MB

Label all demonstration data clearly:

"DEMO DATA — NOT A VERIFIED TIKTOK CAPABILITY PROFILE"

Do not present these values as real platform requirements.

Support mock scenarios:

1. Fully compatible source — NO_CHANGE.
2. Compatible container needing remux — SMART_REMUX.
3. Verified violation requiring an authorized adjustment.
4. Unsupported video re-encoding.
5. Insufficient evidence.
6. Processing failure.
7. Successful verification.
8. Inconclusive verification.

9. Interaction Requirements

The prototype must be interactive.

Implement:

- Sidebar navigation.
- Theme switching.
- File selection UI.
- Mock analysis action.
- Compatibility assessment display.
- Preparation review.
- Processing simulation.
- Verification result.
- History filtering.
- Dialog confirmations.
- Toast feedback.
- Responsive navigation.

Use mock state to simulate transitions.

Do not create dead buttons.

Every visible interactive element must either:

- Perform a meaningful prototype interaction, or
- Be clearly disabled with an explanation.

Use sensible empty, loading, success, warning, and error states.

10. Responsive Requirements

Desktop:

- Spacious content layout.
- Collapsible sidebar.
- Readable tables.
- Clear page hierarchy.

Tablet:

- Adapted navigation.
- Reduced horizontal spacing.
- Responsive columns.

Mobile:

- Single-column layout.
- Touch-friendly controls.
- Compact but readable data tables.
- No horizontal overflow.
- Bottom navigation or drawer.
- Clear primary action.
- Comfortable vertical spacing.

Do not simply shrink the desktop design.

Design mobile and desktop as intentional layouts.

11. Accessibility and Quality

Ensure:

- Sufficient color contrast in both themes.
- Keyboard-accessible controls.
- Visible focus states.
- Semantic HTML.
- Accessible labels.
- Reduced-motion support.
- Consistent icon sizing.
- No color-only status communication.

12. Implementation Order

Build incrementally:

PHASE 1 — FOUNDATION

- Design tokens.
- Adaptive theme.
- Typography.
- Application shell.
- Navigation.
- Reusable UI primitives.

PHASE 2 — CORE WORKSPACE

- Overview.
- Video Import.
- Analysis.
- Compatibility Assessment.

PHASE 3 — PREPARATION WORKFLOW

- Preparation.
- Preparation Review.
- Processing Center.

PHASE 4 — VERIFICATION AND OUTPUT

- Quality Verification.
- Export & Share.
- History.

PHASE 5 — SETTINGS AND POLISH

- Platform Profiles.
- Settings.
- Responsive refinement.
- Accessibility.
- Empty/loading/error states.
- Interaction testing.

Do not skip ahead and create unrelated features.

Keep the implementation consistent across all pages.

13. Final Quality Standard

The final result should feel like a carefully designed professional media engineering application.

It should be:

- Minimal.
- Elegant.
- Clean.
- Balanced.
- Responsive.
- Technically credible.
- Easy to navigate.
- Consistent in light and dark mode.

Avoid making the application look like a generic admin template.

Prioritize clarity over decoration.

Prioritize whitespace over excessive containers.

Prioritize useful information over visual noise.

The central product philosophy:

"Don't maximize the numbers. Maximize the preserved quality."

Build FrameGuard around this philosophy.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/02b0dfd9-042a-4846-b505-6fe1c1bb46ae).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
