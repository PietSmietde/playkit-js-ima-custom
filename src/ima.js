// @flow
import {core} from 'kaltura-player-js';
import {Ima as BaseImaPlugin} from './ima';

const {Env} = core;

class CustomIma extends BaseImaPlugin {
  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   * @memberof Ima
   */
  static defaultConfig: Object = {
    debug: false,
    delayInitUntilSourceSelected: Env.os.name === 'iOS',
    disableMediaPreload: false,
    forceReloadMediaAfterAds: false,
    adsRenderingSettings: {
      restoreCustomPlaybackStateOnAdBreakComplete: false,
      enablePreloading: false,
      useStyledLinearAds: false,
      useStyledNonLinearAds: true,
      bitrate: -1,
      autoAlign: true,
      loadVideoTimeout: -1
    },
    companions: {
      ads: null,
      sizeCriteria: 'SELECT_EXACT_MATCH'
    },
    aps: {
      enabled: false,
      fetchBids: adTagUrl => new Promise(resolve => resolve(adTagUrl))
    }
  };

  /**
   * Requests the ads from the ads loader.
   * @param {?string} vastUrl - vast url.
   * @param {?string} vastResponse - vast XML response.
   * @private
   * @returns {void}
   * @instance
   * @memberof Ima
   */
  _requestAds(vastUrl: ?string, vastResponse: ?string): void {
    if (!this._playAdByConfig()) {
      return;
    }

    this.logger.debug('Request ads', vastUrl);

    let adTagUrl = vastUrl || this.config.adTagUrl;

    this.logger.debug('APS integration', this.config.aps.enabled);

    let fetchBidsPromise = new Promise(resolve => resolve(adTagUrl));

    if (this.config.aps.enabled && adTagUrl && 'apstag' in window) {
      fetchBidsPromise = this.config.aps.fetchBids(adTagUrl);
    }

    fetchBidsPromise.then(adTagUrl => {
      this.logger.debug('APS fetch bids resolved', adTagUrl);
      super._requestAds(adTagUrl, vastResponse);
    });
  }
}

export {CustomIma as Ima};
