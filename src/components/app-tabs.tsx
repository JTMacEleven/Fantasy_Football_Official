import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { appTabs } from '@/constants/tabs';
import { BrandColors } from '@/constants/theme';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={BrandColors.black}
      indicatorColor={BrandColors.purpleDark}
      labelStyle={{ selected: { color: BrandColors.neonGreen } }}>
      {appTabs.map((tab) => (
        <NativeTabs.Trigger key={tab.route} name={tab.route}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={tab.icon.sf}
            md={tab.icon.md}
            renderingMode="template"
          />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
