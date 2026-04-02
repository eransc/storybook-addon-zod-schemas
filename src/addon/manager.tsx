import React from 'react';
import { addons, types } from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';
import { Panel } from './components/Panel';

const ADDON_ID = 'storybook-addon-zod-schemas';
const PANEL_ID = `${ADDON_ID}/panel`;

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Zod Schemas',
    render: ({ active }) => (
      <AddonPanel active={active ?? false}>
        <Panel />
      </AddonPanel>
    ),
  });
});
