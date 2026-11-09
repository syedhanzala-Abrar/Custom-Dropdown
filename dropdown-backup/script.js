/**
 * Custom Dropdown Component
 * Modern, accessible, and responsive dropdown built with Vanilla JavaScript.
 *
 * Implements WAI-ARIA 1.2 Combobox / Listbox Design Pattern:
 * - Full keyboard navigation (Arrow Up/Down, Home/End, Enter, Space, Escape, Tab, Typeahead)
 * - Screen reader announcements via aria-live and ARIA states
 * - Auto-close on outside click or blur
 * - Synchronized hidden form input for form submission
 */

class CustomDropdown {
  /**
   * @param {HTMLElement} element - The dropdown container element (.custom-dropdown)
   */
  constructor(element) {
    if (!element) return;

    this.root = element;
    this.trigger = this.root.querySelector('.dropdown-trigger');
    this.menu = this.root.querySelector('.dropdown-menu');
    this.optionsList = this.root.querySelector('.options-list');
    this.options = Array.from(this.root.querySelectorAll('.dropdown-option'));
    this.hiddenInput = this.root.querySelector('input[type="hidden"]');
    this.triggerText = this.root.querySelector('.trigger-text');
    this.triggerIcon = this.root.querySelector('.trigger-icon');

    // Associated UI Elements (Banner, Clear Button, State Pill)
    this.banner = document.getElementById('selection-banner');
    this.bannerHeading = document.getElementById('banner-text');
    this.bannerSubtext = document.getElementById('banner-subtext');
    this.clearBtn = document.getElementById('clear-selection-btn');
    this.statusPill = document.getElementById('status-pill');
    this.stateLabel = document.getElementById('state-label');
    this.liveRegion = document.getElementById('status-live-region');

    // State Variables
    this.isOpen = false;
    this.selectedIndex = -1; // -1 represents Default / Unselected State
    this.focusedIndex = -1;   // Highlighted index for keyboard navigation
    this.typeaheadQuery = '';
    this.typeaheadTimeout = null;

    // Cache default placeholder text & icon
    this.defaultPlaceholder = this.triggerText ? this.triggerText.textContent.trim() : 'Select an option';
    this.defaultIconHTML = this.triggerIcon ? this.triggerIcon.innerHTML : '';

    this.init();
  }

  /**
   * Initialize event handlers and initial states
   */
  init() {
    // Register trigger interactions
    this.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });

    this.trigger.addEventListener('keydown', (e) => this.handleTriggerKeydown(e));

    // Register option interactions
    this.options.forEach((option, index) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectOption(index);
      });

      option.addEventListener('mouseenter', () => {
        this.setFocusedIndex(index, false);
      });
    });

    // Register dropdown menu keydown
    this.menu.addEventListener('keydown', (e) => this.handleMenuKeydown(e));

    // Outside click detection
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.root.contains(e.target)) {
        this.close();
      }
    });

    // Close on window blur or Escape key at window level
    window.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        e.preventDefault();
        this.close();
        this.trigger.focus();
      }
    });

    // Clear / Reset button listener
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetSelection();
      });
    }

    // Set initial state
    this.updateStateUI();
  }

  /**
   * Toggle the dropdown menu open/closed
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the dropdown menu
   */
  open() {
    if (this.isOpen) return;

    // Close any other open dropdown instance on the page
    CustomDropdown.closeAllInstances(this);

    this.isOpen = true;
    this.root.classList.add('is-open');
    this.trigger.setAttribute('aria-expanded', 'true');

    // Focus the currently selected item or the first item
    const initialIndex = this.selectedIndex >= 0 ? this.selectedIndex : 0;
    this.setFocusedIndex(initialIndex, true);

    this.updateStateUI();
  }

  /**
   * Close the dropdown menu
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.root.classList.remove('is-open');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.removeAttribute('aria-activedescendant');

    // Clear focused state on options
    this.clearFocusedState();

    this.updateStateUI();
  }

  /**
   * Select an option by index
   * @param {number} index - Index in this.options array
   */
  selectOption(index) {
    if (index < 0 || index >= this.options.length) return;

    const selectedOption = this.options[index];
    const optionValue = selectedOption.getAttribute('data-value') || '';
    const optionTitleEl = selectedOption.querySelector('.option-title');
    const optionDescEl = selectedOption.querySelector('.option-desc');
    const optionIconEl = selectedOption.querySelector('.option-icon-wrapper svg');

    const optionTitle = optionTitleEl ? optionTitleEl.textContent.trim() : '';
    const optionDesc = optionDescEl ? optionDescEl.textContent.trim() : '';

    // Update state
    this.selectedIndex = index;

    // Update aria-selected on all options
    this.options.forEach((opt, idx) => {
      const isSelected = idx === index;
      opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      opt.classList.toggle('is-selected', isSelected);
    });

    // Update trigger text & remove placeholder class
    if (this.triggerText) {
      this.triggerText.textContent = optionTitle;
      this.triggerText.classList.remove('is-placeholder');
    }

    // Update trigger icon with selected option's icon
    if (this.triggerIcon && optionIconEl) {
      this.triggerIcon.innerHTML = optionIconEl.outerHTML;
      this.triggerIcon.classList.add('is-active');
    }

    // Update hidden form input
    if (this.hiddenInput) {
      this.hiddenInput.value = optionValue;
    }

    // Update Success Message Banner
    if (this.banner) {
      this.banner.classList.remove('is-empty');
      this.banner.classList.add('is-active');

      if (this.bannerHeading) {
        this.bannerHeading.textContent = `Selected: ${optionTitle}`;
      }

      if (this.bannerSubtext) {
        this.bannerSubtext.textContent = optionDesc || `Value: ${optionValue} | Specialization confirmed`;
      }

      if (this.clearBtn) {
        this.clearBtn.removeAttribute('hidden');
      }
    }

    // Announce to screen readers via aria-live
    if (this.liveRegion) {
      this.liveRegion.textContent = `Selected ${optionTitle}`;
    }

    // Close menu and refocus the trigger button
    this.close();
    this.trigger.focus();

    // Update badge / state indicator
    this.updateStateUI();

    // Dispatch custom 'change' event for modular integration
    this.root.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        detail: {
          value: optionValue,
          label: optionTitle,
          index: index,
        },
      })
    );
  }

  /**
   * Reset the dropdown back to Default State (Unselected)
   */
  resetSelection() {
    this.selectedIndex = -1;
    this.focusedIndex = -1;

    // Clear selected state on options
    this.options.forEach((opt) => {
      opt.setAttribute('aria-selected', 'false');
      opt.classList.remove('is-selected');
    });

    // Reset trigger text
    if (this.triggerText) {
      this.triggerText.textContent = this.defaultPlaceholder;
      this.triggerText.classList.add('is-placeholder');
    }

    // Reset trigger icon
    if (this.triggerIcon) {
      this.triggerIcon.innerHTML = this.defaultIconHTML;
      this.triggerIcon.classList.remove('is-active');
    }

    // Reset hidden input
    if (this.hiddenInput) {
      this.hiddenInput.value = '';
    }

    // Reset banner
    if (this.banner) {
      this.banner.classList.remove('is-active');
      this.banner.classList.add('is-empty');

      if (this.bannerHeading) {
        this.bannerHeading.textContent = 'No option selected';
      }

      if (this.bannerSubtext) {
        this.bannerSubtext.textContent = 'Click above or use arrow keys to pick a specialization';
      }

      if (this.clearBtn) {
        this.clearBtn.setAttribute('hidden', '');
      }
    }

    // Screen reader announcement
    if (this.liveRegion) {
      this.liveRegion.textContent = 'Selection cleared. Select an option.';
    }

    this.close();
    this.updateStateUI();

    // Dispatch clear event
    this.root.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        detail: {
          value: '',
          label: '',
          index: -1,
        },
      })
    );
  }

  /**
   * Highlight / visually focus an option by index for keyboard navigation
   * @param {number} index
   * @param {boolean} scrollIntoView
   */
  setFocusedIndex(index, scrollIntoView = true) {
    if (index < 0 || index >= this.options.length) return;

    this.focusedIndex = index;

    this.options.forEach((opt, idx) => {
      const isFocused = idx === index;
      opt.classList.toggle('is-focused', isFocused);

      if (isFocused) {
        this.trigger.setAttribute('aria-activedescendant', opt.id);

        if (scrollIntoView) {
          opt.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    });
  }

  /**
   * Clear focused highlight on all options
   */
  clearFocusedState() {
    this.options.forEach((opt) => opt.classList.remove('is-focused'));
    this.focusedIndex = -1;
  }

  /**
   * Handle keydown events when focus is on the trigger button
   * @param {KeyboardEvent} e
   */
  handleTriggerKeydown(e) {
    const { key } = e;

    switch (key) {
      case 'Enter':
      case ' ': // Spacebar
        e.preventDefault();
        this.toggle();
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.focusNextOption();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.focusPrevOption();
        }
        break;

      case 'Home':
        if (this.isOpen) {
          e.preventDefault();
          this.setFocusedIndex(0);
        }
        break;

      case 'End':
        if (this.isOpen) {
          e.preventDefault();
          this.setFocusedIndex(this.options.length - 1);
        }
        break;

      case 'Escape':
        if (this.isOpen) {
          e.preventDefault();
          this.close();
        }
        break;

      case 'Tab':
        if (this.isOpen) {
          this.close();
        }
        break;

      default:
        // Handle typeahead search (single printable characters)
        if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.handleTypeahead(key);
        }
        break;
    }
  }

  /**
   * Handle keydown events when inside dropdown menu
   * @param {KeyboardEvent} e
   */
  handleMenuKeydown(e) {
    const { key } = e;

    switch (key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this.focusedIndex >= 0) {
          this.selectOption(this.focusedIndex);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.focusNextOption();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.focusPrevOption();
        break;

      case 'Home':
        e.preventDefault();
        this.setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        this.setFocusedIndex(this.options.length - 1);
        break;

      case 'Escape':
        e.preventDefault();
        this.close();
        this.trigger.focus();
        break;

      case 'Tab':
        this.close();
        break;

      default:
        if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.handleTypeahead(key);
        }
        break;
    }
  }

  /**
   * Move visual focus to next option (with wrapping)
   */
  focusNextOption() {
    let nextIndex = this.focusedIndex + 1;
    if (nextIndex >= this.options.length) {
      nextIndex = 0; // Wrap to start
    }
    this.setFocusedIndex(nextIndex);
  }

  /**
   * Move visual focus to previous option (with wrapping)
   */
  focusPrevOption() {
    let prevIndex = this.focusedIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.options.length - 1; // Wrap to end
    }
    this.setFocusedIndex(prevIndex);
  }

  /**
   * Typeahead search helper: matches typing against option titles
   * @param {string} char
   */
  handleTypeahead(char) {
    if (!this.isOpen) {
      this.open();
    }

    clearTimeout(this.typeaheadTimeout);
    this.typeaheadQuery += char.toLowerCase();

    // Find the first option whose title starts with the accumulated query
    const matchIndex = this.options.findIndex((opt) => {
      const title = opt.querySelector('.option-title')?.textContent.trim().toLowerCase() || '';
      return title.startsWith(this.typeaheadQuery);
    });

    if (matchIndex !== -1) {
      this.setFocusedIndex(matchIndex);
    }

    // Reset query buffer after 500ms of inactivity
    this.typeaheadTimeout = setTimeout(() => {
      this.typeaheadQuery = '';
    }, 500);
  }

  /**
   * Update the status pill in the card footer reflecting current state:
   * - Default State
   * - Open State
   * - Selected State
   */
  updateStateUI() {
    if (!this.statusPill || !this.stateLabel) return;

    this.statusPill.classList.remove('is-open', 'is-selected');

    if (this.isOpen) {
      this.statusPill.classList.add('is-open');
      this.stateLabel.textContent = 'Open State';
    } else if (this.selectedIndex >= 0) {
      this.statusPill.classList.add('is-selected');
      this.stateLabel.textContent = 'Selected State';
    } else {
      this.stateLabel.textContent = 'Default State';
    }
  }

  /**
   * Static helper: close any open dropdown instances
   * @param {CustomDropdown} [excludeInstance]
   */
  static closeAllInstances(excludeInstance = null) {
    CustomDropdown.instances.forEach((instance) => {
      if (instance !== excludeInstance && instance.isOpen) {
        instance.close();
      }
    });
  }
}

// Track active instances
CustomDropdown.instances = [];

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dropdownElements = document.querySelectorAll('[data-dropdown]');
  dropdownElements.forEach((el) => {
    const dropdown = new CustomDropdown(el);
    CustomDropdown.instances.push(dropdown);
  });
});

