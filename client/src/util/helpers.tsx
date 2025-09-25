/**
 * Helper function to extract required apps from a workflow configuration
 * Analyzes workflow steps to determine which external apps need to be connected
 *
 * This function identifies apps in two ways:
 * 1. External app configurations (objects with externalUserConfig property)
 * 2. Explicit app properties in step props
 *
 * @param {Object} workflow - The workflow object to analyze
 * @returns {string[]} Array of unique app names required by the workflow
 */
export function getRequiredApps(workflow): string[] {
  const apps = new Set(); // Use Set to avoid duplicates

  // Iterate through all workflow steps to find app dependencies
  workflow.payload.steps.forEach((step) => {
    const props = step.props || {};

    // Case 1: Find external app configurations (gmail, slack, etc.)
    // These are objects containing externalUserConfig property
    for (const key of Object.keys(props)) {
      if (
        props[key] &&
        typeof props[key] === "object" &&
        "externalUserConfig" in props[key]
      ) {
        apps.add(key); // e.g., "gmail", "slack"
      }
    }

    // Case 2: Find explicit app properties
    // Some steps have a direct 'app' property specifying the required service
    if (props.app) {
      apps.add(props.app); // e.g., "openai", "anthropic"
    }
  });

  // Convert Set to Array and return unique app names
  return Array.from(apps);
}
