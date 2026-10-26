import { NativeTabs } from 'expo-router/native-tabs';
import { useSession } from  '@/src/hooks/useSession';

// Renderars på iOS och Android istället för standard js/ts-versionen.
export default function TabLayout() {
	const session = useSession();
  return (
    <NativeTabs minimizeBehavior="never">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Badge>9+</NativeTabs.Trigger.Badge>
        <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} />
        <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="list">
        <NativeTabs.Trigger.Icon sf="list.bullet" />
        <NativeTabs.Trigger.Label>List</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
	  <NativeTabs.Trigger name="friends" hidden={!session}>
		<NativeTabs.Trigger.Icon sf={{ default: 'person.2.shield', selected: 'person.2.shield.fill' }} />
		<NativeTabs.Trigger.Label>Friends</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
	  <NativeTabs.Trigger name="profile">
		<NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
		<NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
	
    </NativeTabs>
  );
}
