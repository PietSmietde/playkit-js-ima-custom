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
      enabled: false
    },
    adBreakPlayable: () => true,
    requestAdTag: adTagUrl => new Promise(resolve => resolve(adTagUrl))
  };

  /**
   * Plays ad on demand
   * @param {KPAdPod} adPod - The ad pod to play.
   * @returns {void}
   * @public
   * @instance
   * @memberof Ima
   */
  playAdNow(adPod: KPAdPod): void {
    if (!this._adBreakPlayableByConfig(adPod)) {
      this.logger.debug('Not playing ad now because config callback denied');
      return;
    }

    super.playAdNow(adPod);
  }

  _adBreakPlayableByConfig(adPod: ?PKAdPod): boolean {
    return this.config.adBreakPlayable(adPod);
  }

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
    this.logger.debug('Request ads', vastUrl);
    this.logger.debug('APS integration enabled', this.config.aps.enabled);

    const adTagUrl = vastUrl || this.config.adTagUrl;
    const requestAdTagPromise = this.config.aps.requestAdTag(adTagUrl);

    requestAdTagPromise.then(adTagUrl => {
      this.logger.debug('APS fetch bids resolved', adTagUrl);
      super._requestAds(adTagUrl, vastResponse);
    });
  }
}

export {CustomIma as Ima};
