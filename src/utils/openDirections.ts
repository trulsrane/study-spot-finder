import {Alert, Linking,Platform} from 'react-native';

export const openDirections = (latitude: number, longitude: number) => {
	const url = Platform.OS === 'ios'
		? `maps://app?daddr=${latitude},${longitude}`
		: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&dirflg=w`;
	Linking.openURL(url).catch(() => Alert.alert('Kunde inte öppna kartor', 'Det gick inte att öppna kartor på din enhet.'));
  
  };
