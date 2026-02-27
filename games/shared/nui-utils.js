/**
 * NUI Utility Functions
 *
 * Handles FiveM NUI (New User Interface) communication.
 * In debug/standalone mode (outside FiveM), provides mock implementations.
 */

/**
 * Check if running in debug/standalone mode (outside FiveM).
 * @returns {boolean} true when running outside FiveM
 */
function isDebug() {
  return !window.invokeNative;
}

/**
 * Get the FiveM parent resource name.
 * Returns empty string in debug mode.
 * @returns {string}
 */
const resourceName = isDebug() ? "" : GetParentResourceName();

/**
 * Send a POST request to the FiveM NUI callback handler.
 * In debug mode, returns an empty resolved promise.
 *
 * @param {string} action - The NUI callback action name
 * @param {object} data - The data to send
 * @returns {Promise<object>}
 */
async function fetchNUI(action, data = {}) {
  if (isDebug()) {
    return Promise.resolve({});
  }

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data),
  };

  const response = await fetch(`https://${resourceName}/${action}`, options);
  return response.json();
}

/**
 * Register a listener for NUI messages with a specific action name.
 *
 * @param {string} action - The action name to listen for
 * @param {function} callback - Called with message data when action matches
 * @returns {function} Unsubscribe function to remove the listener
 */
function onNUIMessage(action, callback) {
  const handler = (event) => {
    if (!event || !event.data || typeof event.data !== "object") return;

    const message = event.data;
    if (message.action === action) {
      callback(message.data || {});
    }
  };

  window.addEventListener("message", handler);

  return () => {
    window.removeEventListener("message", handler);
  };
}

/**
 * Show an element by removing the 'hidden' class and fading in via opacity.
 *
 * @param {string} elementId - The DOM element ID to show
 */
function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.classList.remove("hidden");
  requestAnimationFrame(() => {
    element.classList.add("opacity-100");
    element.classList.remove("opacity-0");
  });
}

/**
 * Hide an element with an opacity fade-out transition, then call optional callback.
 *
 * @param {string} elementId - The DOM element ID to hide
 * @param {function} [onComplete] - Called after the fade-out transition ends
 */
function hideElement(elementId, onComplete) {
  const element = document.getElementById(elementId);
  if (!element) {
    if (onComplete) onComplete();
    return;
  }

  element.classList.remove("opacity-100");
  element.classList.add("opacity-0");

  let handled = false;
  const onTransitionEnd = (event) => {
    if (event.target !== element || event.propertyName !== "opacity" || handled) return;

    element.classList.add("hidden");
    handled = true;
    element.removeEventListener("transitionend", onTransitionEnd);
    if (onComplete) onComplete();
  };

  element.addEventListener("transitionend", onTransitionEnd);
}
