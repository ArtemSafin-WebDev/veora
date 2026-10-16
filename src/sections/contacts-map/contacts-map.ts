type Coordinates = [number, number];

interface MapEntity {
  addChild(child: MapEntity): this;
}

interface YandexMap extends MapEntity {
  destroy(): void;
}

interface MapTheme {
  YMapDefaultMarker: new (props: {
    coordinates: Coordinates;
    iconName: 'building';
    size: 'normal';
    color: { day: string; night: string };
  }) => MapEntity;
  YMapZoomControl: new (props: Record<string, never>) => MapEntity;
}

interface MapsApi {
  ready: Promise<void>;
  YMap: new (element: HTMLElement, props: {
    location: { center: Coordinates; zoom: number };
    behaviors: string[];
  }) => YandexMap;
  YMapDefaultSchemeLayer: new (props: Record<string, never>) => MapEntity;
  YMapDefaultFeaturesLayer: new (props: Record<string, never>) => MapEntity;
  YMapControls: new (props: { position: string }) => MapEntity;
  import: {
    (name: string): Promise<MapTheme>;
    registerCdn(url: string, packages: string[]): void;
  };
}

const mapsWindow = window as Window & { ymaps3?: MapsApi };
let apiPromise: Promise<MapsApi> | undefined;

/** Load the external API only when the contact map is present. */
function loadMapsApi(apiKey: string): Promise<MapsApi> {
  if (mapsWindow.ymaps3) return Promise.resolve(mapsWindow.ymaps3);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
    script.async = true;
    script.onload = () => mapsWindow.ymaps3
      ? resolve(mapsWindow.ymaps3)
      : reject(new Error('Yandex Maps API is unavailable'));
    script.onerror = () => reject(new Error('Yandex Maps API failed to load'));
    document.head.append(script);
  });

  return apiPromise;
}

async function prepareMap(apiKey: string) {
  const api = await loadMapsApi(apiKey);
  await api.ready;
  api.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', ['@yandex/ymaps3-default-ui-theme@0.0.25']);
  const theme = await api.import('@yandex/ymaps3-default-ui-theme');
  return { api, theme };
}

async function initContactsMap(section: HTMLElement) {
  const canvas = section.querySelector<HTMLElement>('[data-map-canvas]');
  const fallback = section.querySelector<HTMLElement>('[data-map-fallback]');
  const status = section.querySelector<HTMLElement>('[data-map-status]');
  if (!canvas || !fallback || !status) return;

  let map: YandexMap | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  section.dataset.mapState = 'loading';
  status.textContent = status.dataset.loadingLabel ?? '';

  try {
    const coordinates: Coordinates = [Number(section.dataset.longitude), Number(section.dataset.latitude)];
    const { api, theme } = await Promise.race([
      prepareMap(section.dataset.apiKey ?? ''),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Yandex Maps loading timed out')), 20000);
      }),
    ]);

    map = new api.YMap(canvas, {
      location: { center: coordinates, zoom: Number(section.dataset.zoom) },
      behaviors: ['drag', 'pinchZoom', 'dblClick'],
    });
    map.addChild(new api.YMapDefaultSchemeLayer({}));
    map.addChild(new api.YMapDefaultFeaturesLayer({}));
    const markerColor = getComputedStyle(section).getPropertyValue('--color-map-marker').trim();
    map.addChild(new theme.YMapDefaultMarker({
      coordinates,
      iconName: 'building',
      size: 'normal',
      color: { day: markerColor, night: markerColor },
    }));
    map.addChild(new api.YMapControls({ position: 'right' }).addChild(new theme.YMapZoomControl({})));
    fallback.hidden = true;
    section.dataset.mapState = 'ready';
  } catch (error) {
    map?.destroy();
    section.dataset.mapState = 'error';
    status.textContent = status.dataset.errorLabel ?? '';
    console.warn('Unable to initialize the contacts map:', error);
  } finally {
    clearTimeout(timeout);
  }
}

document.querySelectorAll<HTMLElement>('[data-contacts-map]').forEach((section) => {
  void initContactsMap(section);
});
