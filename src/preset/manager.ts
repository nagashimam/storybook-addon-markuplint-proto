import { addons, types } from "@storybook/addons";

import { ADDON_ID, EVENTS, PANEL_ID } from "../constants";
import { Panel } from "../Panel";
import { callVerify } from "../verify";

// Register the addon
addons.register(ADDON_ID, (api) => {
  api.on(EVENTS.PARAMETERS_SET, (args) => callVerify(api, args));
  // Register the panel
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "markuplint",
    match: ({ viewMode }) => viewMode === "story",
    render: Panel,
  });
});
