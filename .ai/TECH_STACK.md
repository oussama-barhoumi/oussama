TECH STACK

Portfolio Technology Stack

This document is the technical source of truth for the portfolio.

The project should prioritize:

* Performance
* Maintainability
* Smooth interactions
* Premium visual quality
* Responsive design
* Clean architecture
* Modern web standards

Do not introduce a new library or framework unless there is a clear technical reason.

⸻

1. Frontend

React

Purpose: Main UI framework.

React is responsible for:

* Components
* UI composition
* Application structure
* Interactive interfaces
* Reusable sections

⸻

TypeScript

Purpose: Type safety and maintainable code.

Use TypeScript consistently across the project.

Prefer:

* Explicit types
* Reusable interfaces
* Type-safe component props
* Type-safe utility functions

Avoid unnecessary any.

⸻

Vite

Purpose: Development server and production build system.

Use Vite for:

* Local development
* Fast HMR
* Production builds
* Asset handling

⸻

2. Styling

Tailwind CSS

Purpose: Primary styling system.

Use Tailwind for:

* Layout
* Responsive design
* Spacing
* Typography
* Colors
* Components
* Utility styling

Keep styling consistent with the project’s design system.

Do not introduce another CSS framework.

⸻

3. Animation

GSAP

Purpose: Primary animation engine.

GSAP is the main animation library for the portfolio.

Use it for:

* Entrance animations
* Element reveals
* Text animations
* Image animations
* Hover interactions
* Timeline-based animations
* Page transitions
* Complex UI motion

⸻

GSAP ScrollTrigger

Purpose: Scroll-driven animation.

Use ScrollTrigger for:

* Scroll reveals
* Parallax effects
* Pinned sections
* Scroll progress
* Horizontal scrolling sections
* Cinematic transitions

Animations should remain purposeful and performant.

⸻

Lenis

Purpose: Smooth scrolling.

Use Lenis to create a smooth scrolling experience.

Lenis should work together with GSAP/ScrollTrigger when required.

Avoid implementing multiple competing smooth-scroll systems.

⸻

4. 3D

Three.js

Purpose: 3D rendering engine.

Use Three.js when direct low-level 3D functionality is required.

⸻

React Three Fiber

Purpose: React integration for Three.js.

Use React Three Fiber for:

* 3D scenes
* Interactive objects
* Camera control
* Materials
* Lighting
* WebGL experiences

⸻

Drei

Purpose: React Three Fiber utilities.

Use @react-three/drei for reusable helpers such as:

* Cameras
* Controls
* Environment
* Text
* Loaders
* Effects
* 3D utilities

Do not recreate existing Drei functionality unnecessarily.

⸻

5. Icons

Lucide React

Purpose: UI icons.

Use Lucide React for:

* Navigation icons
* Buttons
* Social icons when available
* UI controls
* Interface elements

Avoid mixing multiple icon libraries unless explicitly required.

⸻

6. Utility Libraries

clsx

Use for conditional class names.

tailwind-merge

Use for safely merging Tailwind classes.

These utilities should remain lightweight and should not be replaced with custom solutions unless necessary.

⸻

7. Assets

Images

Preferred formats:

* AVIF
* WebP
* SVG

Avoid unnecessarily large images.

Optimize images before adding them to the project.

⸻

3D Models

Preferred format:

* GLB
* GLTF

3D assets should be optimized for the web.

Avoid unnecessarily heavy models and textures.

⸻

8. Backend / API

The portfolio does NOT require a full backend by default.

Only introduce backend infrastructure when a real requirement exists.

Examples:

* Contact form
* CMS
* Dynamic content
* Authentication
* External API integrations

Do not add:

* Laravel
* Express
* MongoDB
* MySQL
* PostgreSQL

unless the project explicitly requires them.

⸻

9. Contact

If a contact form requires an external email service, Resend may be used.

Use it only if the project actually implements a contact form requiring email delivery.

Never expose:

* API keys
* Tokens
* Secrets
* Private credentials

inside the repository.

⸻

10. Deployment

Vercel

Preferred deployment platform.

Production workflow:

npm run build

Then deploy the generated production application through Vercel.

⸻

11. Version Control

Git

Use Git for version control.

GitHub

Use GitHub as the primary repository platform.

Commit messages should be clear and meaningful.

Avoid committing:

* .env
* API keys
* Secrets
* node_modules
* Build artifacts
* Temporary files

⸻

12. Architecture Principles

Prefer:

* Reusable components
* Small focused components
* Clear separation of concerns
* Typed data
* Reusable animation utilities
* Reusable hooks
* Centralized design tokens
* Clean imports

Avoid:

* Giant components
* Duplicate code
* Unnecessary abstractions
* Deeply coupled components
* Global state without a real need
* Unnecessary dependencies

⸻

13. Animation Rules

GSAP is the primary animation system.

Before adding animation:

1. Ask what purpose it serves.
2. Check whether an existing animation utility can be reused.
3. Consider mobile performance.
4. Consider accessibility.
5. Avoid excessive simultaneous animations.

Prefer quality over quantity.

⸻

14. 3D Rules

3D should be used intentionally.

Before adding a 3D element:

1. Confirm that it improves the experience.
2. Optimize geometry.
3. Optimize textures.
4. Avoid unnecessary high-poly assets.
5. Consider mobile performance.
6. Provide a reasonable fallback when appropriate.

Do not add 3D simply because Three.js is available.

⸻

15. Performance

Performance is a first-class requirement.

Prioritize:

* Code splitting
* Lazy loading
* Optimized images
* Optimized 3D assets
* Efficient animations
* Minimal dependencies
* Avoiding unnecessary re-renders
* Mobile performance

Do not sacrifice performance for decorative effects.

⸻

16. Accessibility

The implementation should support:

* Semantic HTML
* Keyboard navigation
* Accessible buttons
* Proper labels
* Meaningful alt text
* Sufficient contrast
* Reduced-motion considerations

Animations must not prevent users from navigating or understanding the content.

⸻

17. Dependency Rule

Before installing a new dependency, ask:

1. Do we actually need it?
2. Can the existing stack solve the problem?
3. Will it increase bundle size significantly?
4. Does it duplicate existing functionality?
5. Is it actively maintained?

If the existing stack can solve the problem cleanly, do not add another dependency.

⸻

18. Source of Truth

The following files define the project:

AGENTS.md
.ai/PROJECT.md
.ai/DESIGN.md
.ai/TECH_STACK.md
.ai/RULES.md
.ai/DECISIONS.md

Always respect these files before making technical or architectural decisions.

If a new technology is explicitly approved by the project owner, update this document accordingly.

Never silently replace the established technology stack.