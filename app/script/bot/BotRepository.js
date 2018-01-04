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
window.z.bot = z.bot || {};

z.bot.BotRepository = class BotRepository {
  constructor(bot_service, conversation_repository) {
    this.logger = new z.util.Logger('z.bot.BotRepository', z.config.LOGGER.OPTIONS);
    this.bot_service = bot_service;
    this.conversation_repository = conversation_repository;
  }

  /*
  Add bot to conversation.
  @param {string} bot_name - Bot name registered on backend
  @param {string} [create_conversation=true] - A new conversation is created if true otherwise bot is added to active conversation
  */
  add_bot(bot_name, create_conversation = true) {
    let bot_result = {
      "entropybot": {
        "service": "0b5949b8-4fd8-458a-9049-1f0ff6d3b53a",
        "channel_name": "Caura",
        "provider" : "25b147b8-b810-4843-82d6-a5ca0a5c52b0"}
    };
    if (!(bot_name in bot_result)){
      return new Promise((resolve) => { resolve(null); });
    }
    let bot = bot_result[bot_name];
    this.logger.info(`Info for bot '${bot_name}' retrieved`, bot);
    return this.conversation_repository.create_new_conversation([], bot.channel_name)
    .then(conversation_et => {
      if (conversation_et == null) {
        this.logger.error(`error returning conversation for add_bot`);
        // conversation_et = this.conversation_repository.active_conversation();
      }
      this.conversation_repository.add_bot(conversation_et, bot.provider, bot.service);
      window.setTimeout(function() {
        return amplify.publish(z.event.WebApp.CONVERSATION.SHOW, conversation_et);
      }, 650);
    });
  }
};
