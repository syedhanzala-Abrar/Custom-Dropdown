/**
 * Stories Feature - Interactive Implementation
 * Conforming to wireframe specifications:
 * 1. "When there are no stories" - Shows container with only [+] button.
 * 2. "When there is one story" - Shows container with [+] button and 1 story circle.
 * 3. "When there are multiple stories" - Shows container with [+] button and multiple story circles.
 * 4. "Clicking a story will show it for 3 seconds with a progress bar at the top and then move to next story."
 * 5. "User can also switch stories by swiping."
 * 6. "Progress bar for active story fills up in 3 seconds; each story will have separate progress bar."
 */

// ==========================================================================
// Sample Stories Dataset (Curated photos + wireframe doodle theme)
// ==========================================================================
const DEFAULT_STORIES_DATA = [
  {
    id: 'story-1',
    author: 'wanderlust_sam',
    time: '2h ago',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    media: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    caption: 'Sunrise over Yosemite peaks 🏔️✨',
    viewed: false,
  },
  {
    id: 'story-2',
    author: 'alex_developer',
    time: '3h ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    media: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    caption: 'Late night coding session and good coffee ☕💻',
    viewed: false,
  },
  {
    id: 'story-3',
    author: 'elena_design',
    time: '4h ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    media: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    caption: 'Exploring new fluid design systems & 3D art 🎨',
    viewed: false,
  },
  {
    id: 'story-4',
    author: 'marcus_ai',
    time: '6h ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    media: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    caption: 'Neural networks visual experiment in Python 🚀🧠',
    viewed: false,
  },
  {
    id: 'story-5',
    author: 'chloe_photos',
    time: '7h ago',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    media: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    caption: 'Misty morning in the Pacific Northwest pine woods 🌲⛅',
    viewed: false,
  },
  {
    id: 'story-6',
    author: 'kevin_travels',
    time: '9h ago',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    media: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    caption: 'Golden hour waves along the southern coastline 🌊🏄‍♂️',
    viewed: false,
  },
];

const THEME_PRESETS = {
  mountains: {
    media: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  ocean: {
    media: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  aurora: {
    media: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
  desert: {
    media: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
};

// ==========================================================================
// Stories Application Controller
// ==========================================================================
class StoriesApp {
  constructor() {
    // Current Active Stories list
    this.stories = [...DEFAULT_STORIES_DATA];
    this.currentStoryIndex = 0;
    this.isViewerOpen = false;

    // Timer & Progress Animation (3 seconds per story per wireframe)
    this.STORY_DURATION = 3000; // 3000ms = 3 seconds
    this.elapsedTime = 0;
    this.lastTimestamp = 0;
    this.isPaused = false;
    this.animationFrameId = null;

    // Gesture / Swipe State
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.isSwiping = false;

    this.cacheDOM();
    this.bindEvents();
    this.renderTray();
  }

  cacheDOM() {
    // Tray Elements
    this.storiesListEl = document.getElementById('stories-list');
    this.createTrigger = document.getElementById('create-story-trigger');
    this.activeStateBadge = document.getElementById('active-state-indicator');

    // Preset buttons
    this.btnEmpty = document.getElementById('btn-state-empty');
    this.btnSingle = document.getElementById('btn-state-single');
    this.btnMultiple = document.getElementById('btn-state-multiple');
    this.btnOpenCreate = document.getElementById('btn-open-create');

    // Viewer Elements
    this.viewerModal = document.getElementById('story-viewer');
    this.viewerBackdrop = document.getElementById('viewer-backdrop');
    this.playerEl = document.getElementById('story-player');
    this.progressContainer = document.getElementById('story-progress-container');
    this.authorAvatar = document.getElementById('viewer-author-avatar');
    this.authorName = document.getElementById('viewer-author-name');
    this.authorTime = document.getElementById('viewer-author-time');
    this.mediaImg = document.getElementById('viewer-media-img');
    this.mediaFallback = document.getElementById('viewer-media-fallback');
    this.captionText = document.getElementById('viewer-caption-text');
    this.pauseBadge = document.getElementById('viewer-pause-badge');
    this.closeBtn = document.getElementById('viewer-close-btn');
    this.tapPrev = document.getElementById('tap-prev');
    this.tapNext = document.getElementById('tap-next');
    this.navPrevBtn = document.getElementById('nav-prev-btn');
    this.navNextBtn = document.getElementById('nav-next-btn');

    // Create Modal
    this.createModalOverlay = document.getElementById('create-modal-overlay');
    this.createForm = document.getElementById('create-story-form');
    this.closeModalBtn = document.getElementById('close-modal-btn');
    this.cancelCreateBtn = document.getElementById('cancel-create-btn');
    this.themePicker = document.getElementById('theme-picker');
    this.selectedTheme = 'mountains';
  }

  bindEvents() {
    // State switcher buttons
    this.btnEmpty.addEventListener('click', () => this.setStatePreset('empty'));
    this.btnSingle.addEventListener('click', () => this.setStatePreset('single'));
    this.btnMultiple.addEventListener('click', () => this.setStatePreset('multiple'));
    this.btnOpenCreate.addEventListener('click', () => this.openCreateModal());
    this.createTrigger.addEventListener('click', () => this.openCreateModal());

    // Viewer controls
    this.closeBtn.addEventListener('click', () => this.closeViewer());
    this.viewerBackdrop.addEventListener('click', () => this.closeViewer());
    this.navPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prevStory();
    });
    this.navNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextStory();
    });

    // Tap Zones (Left 35% -> Previous, Right 65% -> Next)
    this.tapPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prevStory();
    });
    this.tapNext.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextStory();
    });

    // Hold to Pause (Mouse & Touch)
    this.playerEl.addEventListener('mousedown', (e) => {
      if (e.target !== this.closeBtn && !this.closeBtn.contains(e.target)) {
        this.pause();
      }
    });
    window.addEventListener('mouseup', () => {
      if (this.isViewerOpen && this.isPaused) {
        this.resume();
      }
    });

    // Touch events for Swiping & Hold
    this.playerEl.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.playerEl.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    this.playerEl.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Create Story Modal Form
    this.createForm.addEventListener('submit', (e) => this.handleCreateStory(e));
    this.closeModalBtn.addEventListener('click', () => this.closeCreateModal());
    this.cancelCreateBtn.addEventListener('click', () => this.closeCreateModal());
    this.createModalOverlay.addEventListener('click', (e) => {
      if (e.target === this.createModalOverlay) this.closeCreateModal();
    });

    // Theme selector in modal
    this.themePicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-option');
      if (!btn) return;
      this.themePicker.querySelectorAll('.theme-option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      this.selectedTheme = btn.dataset.theme;
    });

    // Fallback if network blocks unsplash images
    this.mediaImg.addEventListener('error', () => {
      this.mediaImg.style.display = 'none';
      this.mediaFallback.removeAttribute('hidden');
    });
  }

  // ========================================================================
  // Tray Rendering (State 1: Empty, State 2: Single, State 3: Multiple)
  // ========================================================================
  renderTray() {
    this.storiesListEl.innerHTML = '';

    if (this.stories.length === 0) {
      // Wireframe State 1: When there are no stories
      this.activeStateBadge.textContent = '0 Stories (Empty)';
    } else if (this.stories.length === 1) {
      // Wireframe State 2: When there is one story
      this.activeStateBadge.textContent = '1 Story Active';
    } else {
      // Wireframe State 3: When there are multiple stories
      this.activeStateBadge.textContent = `${this.stories.length} Stories Active`;
    }

    this.stories.forEach((story, index) => {
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = `story-item ${story.viewed ? 'viewed' : ''}`;
      itemBtn.setAttribute('aria-label', `View story by ${story.author}`);

      itemBtn.innerHTML = `
        <div class="story-avatar-ring">
          <div class="story-avatar-inner">
            <img class="story-avatar-img" src="${story.avatar}" alt="${story.author}" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'" />
          </div>
        </div>
        <span class="story-label">${story.author}</span>
      `;

      itemBtn.addEventListener('click', () => {
        this.openViewer(index);
      });

      this.storiesListEl.appendChild(itemBtn);
    });
  }

  setStatePreset(preset) {
    [this.btnEmpty, this.btnSingle, this.btnMultiple].forEach((b) => b.classList.remove('active'));

    if (preset === 'empty') {
      this.stories = [];
      this.btnEmpty.classList.add('active');
    } else if (preset === 'single') {
      this.stories = [DEFAULT_STORIES_DATA[0]];
      this.btnSingle.classList.add('active');
    } else {
      this.stories = [...DEFAULT_STORIES_DATA];
      this.btnMultiple.classList.add('active');
    }

    this.renderTray();
  }

  // ========================================================================
  // Story Viewer Engine
  // ========================================================================
  openViewer(startIndex = 0) {
    if (this.stories.length === 0) return;

    this.isViewerOpen = true;
    this.currentStoryIndex = Math.min(Math.max(startIndex, 0), this.stories.length - 1);
    this.viewerModal.removeAttribute('hidden');
    this.viewerModal.setAttribute('aria-hidden', 'false');
    this.playerEl.focus();

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Render separate segmented progress bars for each story
    this.renderProgressBars();

    // Load active story
    this.loadStory(this.currentStoryIndex);
  }

  closeViewer() {
    this.isViewerOpen = false;
    this.stopProgress();
    this.viewerModal.setAttribute('hidden', '');
    this.viewerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  renderProgressBars() {
    this.progressContainer.innerHTML = '';
    this.stories.forEach((_, idx) => {
      const segment = document.createElement('div');
      segment.className = 'progress-segment';
      segment.id = `progress-segment-${idx}`;

      const fill = document.createElement('div');
      fill.className = 'progress-fill';
      segment.appendChild(fill);

      this.progressContainer.appendChild(segment);
    });
  }

  loadStory(index) {
    if (index < 0 || index >= this.stories.length) {
      this.closeViewer();
      return;
    }

    this.currentStoryIndex = index;
    const story = this.stories[index];

    // Mark current story as viewed
    story.viewed = true;
    this.renderTray();

    // Update Header metadata
    this.authorAvatar.src = story.avatar;
    this.authorName.textContent = story.author;
    this.authorTime.textContent = story.time;
    this.captionText.textContent = story.caption || '';

    // Update Media Image
    this.mediaImg.style.display = 'block';
    this.mediaFallback.setAttribute('hidden', '');
    this.mediaImg.src = story.media;

    // Reset progress timers
    this.resetAndStartProgress();
  }

  resetAndStartProgress() {
    this.stopProgress();
    this.elapsedTime = 0;
    this.isPaused = false;
    this.pauseBadge.setAttribute('hidden', '');

    // Update all progress segments:
    // - previous segments: 100% completed
    // - current segment: 0%
    // - future segments: 0%
    this.stories.forEach((_, idx) => {
      const seg = document.getElementById(`progress-segment-${idx}`);
      if (!seg) return;
      const fill = seg.querySelector('.progress-fill');

      if (idx < this.currentStoryIndex) {
        seg.classList.add('completed');
        fill.style.width = '100%';
      } else {
        seg.classList.remove('completed');
        fill.style.width = '0%';
      }
    });

    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame((ts) => this.animateProgress(ts));
  }

  animateProgress(timestamp) {
    if (!this.isViewerOpen) return;

    if (!this.isPaused) {
      const delta = timestamp - this.lastTimestamp;
      this.elapsedTime += delta;

      const progressRatio = Math.min(this.elapsedTime / this.STORY_DURATION, 1);
      const currentFill = document.querySelector(`#progress-segment-${this.currentStoryIndex} .progress-fill`);
      if (currentFill) {
        currentFill.style.width = `${progressRatio * 100}%`;
      }

      // Check if 3 seconds have completed -> auto-advance to next story!
      if (this.elapsedTime >= this.STORY_DURATION) {
        this.nextStory();
        return;
      }
    }

    this.lastTimestamp = timestamp;
    this.animationFrameId = requestAnimationFrame((ts) => this.animateProgress(ts));
  }

  stopProgress() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  pause() {
    if (!this.isViewerOpen || this.isPaused) return;
    this.isPaused = true;
    this.pauseBadge.removeAttribute('hidden');
  }

  resume() {
    if (!this.isViewerOpen || !this.isPaused) return;
    this.isPaused = false;
    this.pauseBadge.setAttribute('hidden', '');
    this.lastTimestamp = performance.now();
  }

  nextStory() {
    if (this.currentStoryIndex < this.stories.length - 1) {
      this.loadStory(this.currentStoryIndex + 1);
    } else {
      // Completed last story -> auto close viewer
      this.closeViewer();
    }
  }

  prevStory() {
    // If more than 1 second elapsed on current story, restart current; otherwise go to previous
    if (this.elapsedTime > 1000) {
      this.loadStory(this.currentStoryIndex);
    } else if (this.currentStoryIndex > 0) {
      this.loadStory(this.currentStoryIndex - 1);
    } else {
      this.loadStory(0);
    }
  }

  // ========================================================================
  // Gesture & Swipe Support
  // ========================================================================
  handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.isSwiping = false;
    this.pause();
  }

  handleTouchMove(e) {
    if (e.touches.length !== 1) return;
    this.touchEndX = e.touches[0].clientX;
    this.touchEndY = e.touches[0].clientY;
    const diffX = Math.abs(this.touchEndX - this.touchStartX);
    const diffY = Math.abs(this.touchEndY - this.touchStartY);
    if (diffX > 15 && diffX > diffY) {
      this.isSwiping = true;
    }
  }

  handleTouchEnd() {
    this.resume();

    if (this.isSwiping) {
      const deltaX = this.touchEndX - this.touchStartX;
      const SWIPE_THRESHOLD = 45; // pixels

      if (deltaX < -SWIPE_THRESHOLD) {
        // Swiped Left -> Move to Next Story
        this.nextStory();
      } else if (deltaX > SWIPE_THRESHOLD) {
        // Swiped Right -> Move to Previous Story
        this.prevStory();
      }
    }

    this.isSwiping = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  // ========================================================================
  // Keyboard Support
  // ========================================================================
  handleKeyboard(e) {
    if (!this.isViewerOpen) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        this.nextStory();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.prevStory();
        break;

      case ' ': // Spacebar
        e.preventDefault();
        if (this.isPaused) {
          this.resume();
        } else {
          this.pause();
        }
        break;

      case 'Escape':
        e.preventDefault();
        this.closeViewer();
        break;
    }
  }

  // ========================================================================
  // Add Story Modal Actions
  // ========================================================================
  openCreateModal() {
    this.createModalOverlay.removeAttribute('hidden');
    document.getElementById('story-author-input').focus();
  }

  closeCreateModal() {
    this.createModalOverlay.setAttribute('hidden', '');
    this.createForm.reset();
  }

  handleCreateStory(e) {
    e.preventDefault();
    const authorInput = document.getElementById('story-author-input').value.trim();
    const captionInput = document.getElementById('story-caption-input').value.trim();

    if (!authorInput) return;

    const theme = THEME_PRESETS[this.selectedTheme] || THEME_PRESETS.mountains;

    const newStory = {
      id: `story-${Date.now()}`,
      author: authorInput.replace(/\s+/g, '_').toLowerCase(),
      time: 'Just now',
      avatar: theme.avatar,
      media: theme.media,
      caption: captionInput || `Shared via Stories Feature 🌟`,
      viewed: false,
    };

    // Prepend or append to stories list
    this.stories.unshift(newStory);
    this.closeCreateModal();
    this.renderTray();

    // Reset preset buttons highlight
    [this.btnEmpty, this.btnSingle, this.btnMultiple].forEach((b) => b.classList.remove('active'));
    if (this.stories.length > 1) {
      this.btnMultiple.classList.add('active');
    } else {
      this.btnSingle.classList.add('active');
    }
  }
}

// ==========================================================================
// Initialization on DOM Ready
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  window.storiesApp = new StoriesApp();
});
