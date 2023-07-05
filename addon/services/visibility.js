import Service from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from "@glimmer/tracking";

export const APIs = {
  global: { isSupported: true, hiddenFlag: 'hidden', eventName: 'visibilitychange' },
  webkit: { isSupported: true, hiddenFlag: 'webkitHidden', eventName: 'webkitvisibilitychange' },
  mozilla: { isSupported: true, hiddenFlag: 'mozHidden', eventName: 'mozvisibilitychange' },
  unsupported: { isSupported: false }
};

/**
 * Returns visibility API support flag & flag / event names, depending on the
 * user's browser.
 *
 * See also:
 * https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
 * https://whatwebcando.today/foreground-detection.html
 */
export const detectApi = function(_document = {}) {
  let api;

  if (!document) return APIs.unsupported;

  if (isPresent(_document.hidden)) {
    api = APIs.global;
  } else if (isPresent(_document.webkitHidden)) {
    api = APIs.webkit;
  } else if (isPresent(_document.mozHidden)) {
    api = APIs.mozilla;
  } else {
    api = APIs.unsupported;
  }

  return api;
};

/**
 * This service keeps track of whether the window has ever lost visibility. This
 * happens when the user switches tabs, minimizes the window, etc.
 */
class VisibilityService extends Service {

  @tracked visible = true;

  @tracked lostVisibility = false;

  pageVisibilityAPI =  detectApi(document);

  constructor() {
    super(...arguments);
    const { isSupported, eventName } = this.pageVisibilityAPI;

    if (isSupported) {
      this.#handleDocumentVisibilityChange();

      document.addEventListener(eventName, this.#handleDocumentVisibilityChange);
    }
  }

  /**
   * Service teardown
   */
  willDestroy() {
    super.willDestroy(...arguments);

    this.removeBindings();
  }

  /**
   * Unsubscribes to events.
   */
  removeBindings() {
    const { isSupported, eventName } = this.pageVisibilityAPI;

    if (isSupported) {
      document.removeEventListener(eventName, this.#handleDocumentVisibilityChange);
    }
  }

  /**
   * Event handler.
   */
  #handleDocumentVisibilityChange() {
    if (this.isDestroyed || this.isDestroying) { return; }

    const hiddenFlagName = this.pageVisibilityAPI.hiddenFlag;
    const isHidden = document?.[hiddenFlagName];

    this.visible = !isHidden;

    if (isHidden) {
      this.lostVisibility = true;
    }
  }
}

export default VisibilityService;
