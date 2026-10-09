import {Alert, Linking,Platform} from 'react-native';

export const openDirections = (latitude: number, longitude: number) => {
	const url = Platform.OS === 'ios'
		? `maps://app?daddr=${latitude},${longitude}`
		: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&dirflg=w`;
	Linking.openURL(url).catch(() => Alert.alert('Could not open maps', 'Maps could not be opened on your device.'));
  
  };
