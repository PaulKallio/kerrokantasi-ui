import {Provider} from 'nconf';

const defaults = {
  // Server will listen on this address and port
  listen_address: 'localhost',
  listen_port: '8086',
  // URL for the Kerrokantasi API endpoint
  kerrokantasi_api_base: 'http://localhost:8000',
  // URL this frontend runs at, for callbacks
  public_url: 'http://localhost:8080',
  // Image used as background for the Hero
  hero_image_url: 'https://source.unsplash.com/1600x900/?squirrel',
  // Client Identifier in the Helsinki SSO system
  expressjs_session_secret: null,
  // only used to pass Sentry DSN as JSON structure
  ui_config: null,
  // this sets dev stuff, can be overridden from environment 'dev'
  dev: process.env.NODE_ENV !== 'production',
  // disables hot reloading middleware
  cold: false,
  // Should display accessibility info
  show_accessibility_info: false,
  // Configurations related to OpenId Connect authentication
  openid_client_id: null,
  openid_audience: 'kerrokantasi',
  openid_authority: 'http://localhost:8086',
  openid_apitoken_url: 'https://testitunnistamo.turku.fi/api-tokens/',
  // Should display social media sharing buttons
  show_social_media_sharing: true,
  // Should display & enable contrast toggle button
  enable_highcontrast: false,
  // Should display cookiebar
  show_cookiebar: false,
};

const optionalKeys = [
  "listen_address",
  "listen_port",
  "kerrokantasi_api_base",
  "public_url",
  "hero_image_url",
  "ui_config",
  "dev",
  "cold",
  "city_config",
  "show_accessibility_info",
  "show_social_media_sharing",
  "show_cookiebar",
  "openid_client_id",
  "openid_audience",
  "openid_authority",
  "enable_highcontrast",
];

const mandatoryKeys = [
  "expressjs_session_secret"
];

export default function getOptions() {
  const nconf = new Provider();
  const shouldReadFile = true;
  nconf.env({
    whitelist: optionalKeys.concat(mandatoryKeys),
    lowerCase: true,
    parseValues: true
  });
  // We spefically want to read configuration file ONLY in development mode
  // There have been quite a few unfortunate accidents with production running
  // on a leftover configuration file. Thus only environmental variable there.
  // Sadly development mode is broken and developers develop in production mode.
  // Thus always read the configuration file
  if (defaults.dev || shouldReadFile) {
    // TOML can be used similarly to an 'env'-file (key=value pairs), although
    // it is really extended INI-like format
    nconf.file('toml', {file: 'config_dev.toml', format: require('nconf-toml')});
    // JSON is kept for backwards compabitibility, to not to annoy the developer
    // using it
    nconf.file('json', {file: 'config_dev.json'});
  } else {
    // We want somewhere to store ui_config, without file we have only
    // read-only stores
    nconf.use('memory');
  }
  nconf.defaults(defaults);

  nconf.required(mandatoryKeys);

  const uiConfig = nconf.get('ui_config');
  if (typeof uiConfig === 'string' || uiConfig instanceof String) {
    nconf.set('ui_config', JSON.parse(uiConfig));
  }

  if (nconf.get('serverRendering')) {
    throw new Error("Server rendering is not currently supported.");
  }

  console.info(nconf.get());
  return nconf.get();
}
