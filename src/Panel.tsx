import { useAddonState, useChannel } from "@storybook/api";
import { AddonPanel } from "@storybook/components";
import React from "react";
import { PanelContent } from "./components/PanelContent";
import { ADDON_ID, EVENTS } from "./constants";
import { defaultParameter } from "./withRoundTrip";

interface PanelProps {
  active: boolean;
}

export const Panel: React.FC<PanelProps> = (props) => {
  // https://storybook.js.org/docs/react/addons/addons-api#useaddonstate
  const [results, setState] = useAddonState(ADDON_ID, {
    danger: [],
    warning: [],
  });

  // https://storybook.js.org/docs/react/addons/addons-api#usechannel
  const emit = useChannel({
    [EVENTS.RESULT]: (newResults) => setState(newResults),
    storyRendered: () => {
      emit(EVENTS.PARAMETERS_SET, defaultParameter);
    },
  });

  return (
    <AddonPanel {...props}>
      <PanelContent results={results} />
    </AddonPanel>
  );
};
