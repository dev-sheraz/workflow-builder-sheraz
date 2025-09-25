export function getRequiredApps(workflow): string[] {
  const apps = new Set();

  workflow.payload.steps.forEach((step) => {
    const props = step.props || {};

    // Case 1: external app configs like gmail, slack, etc.
    for (const key of Object.keys(props)) {
      if (
        props[key] &&
        typeof props[key] === "object" &&
        "externalUserConfig" in props[key]
      ) {
        apps.add(key); // e.g. "gmail"
      }
    }

    // Case 2: explicit app property
    if (props.app) {
      apps.add(props.app); // e.g. "openai"
    }
  });

  return Array.from(apps);
}
