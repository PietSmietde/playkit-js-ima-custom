// @flow
import {core} from 'kaltura-player-js';
import {State} from './state';
import {Ima as BaseImaPlugin} from './ima';

const {EngineType, getCapabilities, Env} = core;

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
    if (vastUrl || vastResponse || this._playAdByConfig()) {
      this.logger.debug('Request ads', vastUrl);

      // Request video ads
      let adsRequest = new this._sdk.AdsRequest();

      let adTagUrl = vastUrl || this.config.adTagUrl;

      this.logger.debug('APS integration', this.config.aps.enabled);

      let fetchBidsPromise = new Promise(resolve => resolve(adTagUrl));

      if (this.config.aps.enabled && adTagUrl && 'apstag' in window) {
        fetchBidsPromise = this.config.aps.fetchBids(adTagUrl);
      }

      fetchBidsPromise.then(adTagUrl => {
        this.logger.debug('APS fetch bids resolved', adTagUrl);
        if (adTagUrl) {
          adsRequest.adTagUrl = adTagUrl;
        } else {
          adsRequest.adsResponse = vastResponse || this.config.adsResponse;
        }

        if (typeof this.config.vastLoadTimeout === 'number') {
          adsRequest.vastLoadTimeout = this.config.vastLoadTimeout;
        }

        adsRequest.linearAdSlotWidth = this.player.dimensions.width;
        adsRequest.linearAdSlotHeight = this.player.dimensions.height;
        adsRequest.nonLinearAdSlotWidth = this.player.dimensions.width;
        adsRequest.nonLinearAdSlotHeight = this.player.dimensions.height / 3;

        const muted = this.player.muted || this.player.volume === 0;
        adsRequest.setAdWillPlayMuted(muted);

        const adWillAutoPlay = this.config.adWillAutoPlay;
        const playerWillAutoPlay = this.player.config.playback.autoplay;
        const allowMutedAutoPlay = this.player.config.playback.allowMutedAutoPlay;

        // Pass signal to IMA SDK if ad will autoplay with sound
        // First let application config this, otherwise if player is configured
        // to autoplay then try to autodetect if unmuted autoplay is supported
        if (typeof adWillAutoPlay === 'boolean') {
          adsRequest.setAdWillAutoPlay(adWillAutoPlay);
          this._adsLoader.requestAds(adsRequest);
        } else if (playerWillAutoPlay) {
          getCapabilities(EngineType.HTML5).then(capabilities => {
            // If the plugin has been destroyed while calling this promise
            // the adsLoader will no longer exists
            if (!this._adsLoader) return;

            if (capabilities.autoplay) {
              adsRequest.setAdWillAutoPlay(true);
            } else if (allowMutedAutoPlay && capabilities.mutedAutoPlay) {
              adsRequest.setAdWillAutoPlay(true);
              adsRequest.setAdWillPlayMuted(true);
            } else {
              adsRequest.setAdWillAutoPlay(false);
            }
            this._adsLoader.requestAds(adsRequest);
          });
        } else {
          adsRequest.setAdWillAutoPlay(false);
          this._adsLoader.requestAds(adsRequest);
        }
        this._stateMachine.loaded();
      });
    } else {
      this._stateMachine.goto(State.DONE);
      this.logger.debug('Missing ad tag url: create plugin without requesting ads');
    }
  }
}

export {CustomIma as Ima};
