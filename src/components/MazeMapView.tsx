import { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { colors } from '@/src/theme';
import { buildMazeMapHtml } from '@/src/utils/mazemapHtml';
import { FromWebMessage, MapDraft, MapSpot, MazeMapConfig, ToWebMessage } from '@/src/types/mazemap';

// Det skärmen kan be kartan om, utöver det som styrs av props
export type MazeMapHandle = {
  startDraftAtCenter: () => void;
  clearDraft: () => void;
};

type Props = {
  ref?: Ref<MazeMapHandle>;
  config: MazeMapConfig;
  spots: MapSpot[];
  selectedId: string | null;
  onSpotPress: (id: string) => void;
  onMapPress: () => void;
  onDraftChange: (draft: MapDraft) => void;
};

// MazeMap-kartan i en WebView. Platserna och vald plats skickas in som props,
// och komponenten skickar dem vidare till kartan när de ändras.
export function MazeMapView({ ref, config, spots, selectedId, onSpotPress, onMapPress, onDraftChange }: Props) {
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);

  // Byggs bara om när config ändras, annars laddas hela kartan om
  const html = useMemo(() => buildMazeMapHtml(config), [config]);

  // Appen -> WebView. "true;" på slutet krävs av react-native-webview
  const send = useCallback((message: ToWebMessage) => {
    webViewRef.current?.injectJavaScript(`window.receiveFromApp(${JSON.stringify(message)}); true;`);
  }, []);

  useImperativeHandle(ref, () => ({
    startDraftAtCenter: () => send({ type: 'startDraftAtCenter' }),
    clearDraft: () => send({ type: 'clearDraft' }),
  }), [send]);

  // Skickas när kartan blivit redo (även efter en omladdning) och när platserna ändras
  useEffect(() => {
    if (ready) send({ type: 'setSpots', spots });
  }, [ready, spots, send]);

  useEffect(() => {
    if (ready) send({ type: 'setSelected', id: selectedId });
  }, [ready, selectedId, send]);

  // WebView -> appen
  const handleMessage = (event: WebViewMessageEvent) => {
    let message: FromWebMessage;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    switch (message.type) {
      case 'ready':
        setReady(true);
        break;
      case 'spotPressed':
        onSpotPress(message.id);
        break;
      case 'mapPressed':
        onMapPress();
        break;
      case 'draftChanged':
        onDraftChange(message.draft);
        break;
      case 'error':
        console.warn('MazeMap:', message.message);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.webView}
        originWhitelist={['*']}
        // baseUrl ger sidan ett riktigt https-ursprung, som kartan behöver för att hämta kartdata
        source={{ html, baseUrl: 'https://api.mazemap.com/' }}
        onMessage={handleMessage}
        onLoadStart={() => setReady(false)}
        // iOS kan döda WebView:ns process i bakgrunden, då laddas kartan om
        onContentProcessDidTerminate={() => webViewRef.current?.reload()}
        javaScriptEnabled
        domStorageEnabled
        // Kartan har egen zoom och panorering, WebView:n ska inte studsa eller scrolla
        bounces={false}
        scrollEnabled={false}
        // Gör att sidan kan inspekteras i Safari (iOS) eller chrome://inspect (Android)
        webviewDebuggingEnabled={__DEV__}
      />

      {!ready && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={colors.icon} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
