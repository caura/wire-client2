/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

'use strict';

window.z = window.z || {};
window.z.extension = z.extension || {};

z.extension.GiphyRepository = class GiphyRepository {
  /**
   * Construct a new Giphy Repository.
   * @param {z.extension.GiphyService} giphy_service - Giphy REST API implementation
   * @returns {GiphyRepository} Repository for all interactions with the giphy service
   */
  constructor(giphy_service) {
    this.giphy_service = giphy_service;
    this.logger = new z.util.Logger('z.extension.GiphyRepository', z.config.LOGGER.OPTIONS);
    this.gif_query_cache = {};
  }

  /**
   * Get random GIF for a word or phrase.
   *
   * @param {Object} options - Search options
   * @param {string} options.tag - Search query term or phrase
   * @param {Number} [options.retry=3] - How many retries to get the correct size
   * @param {Number} [options.max_size=3MB] - Maximum gif size in bytes
   * @returns {Promise} Resolves with a random matching gif
   */
  get_random_gif(options) {
    return new Promise((resolve, reject) => {
      options = $.extend({
        retry: 3,
        max_size: 3 * 1024 * 1024,
      },
      options);

      const _get_random_gif = (retries = 0) => {
        if (options.retry === retries) {
          reject(new Error(`Unable to fetch a proper gif within ${options.retry} retries`));
        }

        return this.giphy_service.get_random(options.tag)
        .then(({data: random_gif}) => {
          return this.giphy_service.get_by_id(random_gif.id);
        })
        .then(({data: {images, url}}) => {
          const static_gif = images[z.extension.GiphyContentSizes.FIXED_WIDTH_STILL];
          const animated_gif = images[z.extension.GiphyContentSizes.DOWNSIZED];

          if (animated_gif.size > options.max_size) {
            this.logger.info(`Gif size (${animated_gif.size}) is over maximum size (${animated_gif.size})`);
            return _get_random_gif(retries + 1);
          }

          return resolve({
            url: url,
            static: static_gif.url,
            animated: animated_gif.url,
          });
        })
        .catch(reject);
      };

      return _get_random_gif();
    });
  }

  /**
   * Get random GIFs for a word or phrase.
   *
   * @param {Object} options - Search options
   * @param {string} options.query - Search query term or phrase
   * @param {Number} options.number - Amount of GIFs to retrieve
   * @param {Number} [options.max_size=3MB] - Maximum gif size in bytes
   * @param {Boolean} [options.random=true] - Will return an randomized result
   * @param {string} [options.sorting='recent'] - Specify sorting ('relevant' or 'recent')
   * @returns {Promise} Resolves with gifs
   */
  get_gifs(options) {
    return new Promise((resolve, reject) => {
      let offset = 0;

      options = $.extend({
        number: 6,
        max_size: 3 * 1024 * 1024,
        random: true,
        sorting: 'relevant',
      }
      , options);

      if (!options.query) {
        const error = new Error('No query specified');
        this.logger.error(error.message, error);
        reject(error);
      }

      if (options.random) {
        options.sorting = z.util.ArrayUtil.random_element(['recent', 'relevant']);

        const total = this.gif_query_cache[options.query];
        if (total !== null) {
          if (options.number >= total) {
            offset = 0;
          } else {
            const range = total - options.number;
            offset = Math.floor(Math.random() * range);
          }
        }
      }

      return this.giphy_service.get_search({
        query: options.query,
        limit: 100,
        sorting: options.sorting,
        offset: offset})
      .then(({data: gifs, pagination}) => {
        const result = [];

        if (options.random) {
          gifs = gifs.sort(function() {
            return .5 - Math.random();
          });
        }

        this.gif_query_cache[options.query] = pagination.total_count;

        let index = 0;
        while (index < options.number) {
          const gif = gifs[index];
          const {images} = gif;
          const static_gif = images[z.extension.GiphyContentSizes.FIXED_WIDTH_STILL];
          const animation_gif = images[z.extension.GiphyContentSizes.DOWNSIZED];

          if (animation_gif.size <= options.max_size) {
            result.push({
              url: gif.url,
              static: static_gif.url,
              animated: animation_gif.url,
            });
          }
          index++;
        }

        return resolve(result);
      })
      .catch((error) => {
        this.logger.info(`Unable to fetch gif for query: ${options.query}`, error);
        return reject(error);
      });
    });
  }
};
