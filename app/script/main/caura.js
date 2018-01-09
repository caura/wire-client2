'use strict';
(function() {

window.z = window.z || {};
window.z.main = z.main || {};

const event_prototype = {
  conversation: "f452cdb1-0902-43a8-842a-cdcc7da0d275", //Lobby
  data: {
    content: '',
    nonce: '',
    previews: []
  },
  from: '',
  id: '',
  status: undefined,
  time: '',
  type: "conversation.message-add"
};

window.z.main.Caura = class Caura {
  constructor(){
    this.history_loaded = false;
    this.baseUrl = z.config.CAURA_API_URL;
    this.logger = new z.util.Logger('z.caura.Caura', z.config.LOGGER.OPTIONS);

    window.setInterval(this.heartbeat.bind(this), z.config.CAURA_HEARTBEAT_FREQUENCY_MS);
    amplify.subscribe(z.event.WebApp.CONVERSATION.UNREAD, this, this.loading_history);
  }

  saveMessage(message_json){
    var message = $.extend({},event_prototype);
    message.data.content = message_json.text;
    message.from = message_json.from;
    message.time = message_json.time;
    var uuid = new WackyUUID(message_json.id);
    message.data.nonce = uuid.guid();
    //overwrite id into our native format
    message.id = uuid.guid();
    this.logger.info("message id: "+message.id);
    this.logger.info("original id: "+message_json.id);
    this.logger.info(message.data.content);
    wire.app.service.conversation.save_event(message)
      .catch((error) => {
        this.logger.warn(`Error add message: ${error.message}`, error);
    });
  }

  loading_history(){
    const self = this;
    if (this.history_loaded){
      return new Promise((resolve) => { resolve(val); });
    }
    this.history_loaded = true;
    return new Promise((resolve, reject) => {
      $.get(this.baseUrl + "/lobby").done((conversations) => {
        self.logger.info("conversation history found");
        conversations = JSON.parse(conversations);
        for (const count in conversations){
          var messageJson = conversations[count];
          this.saveMessage(messageJson);
        }
        resolve(conversations);
      }).fail((jqXHR, textStatus, errorThrown) => {
        self.logger.warn("no conversation history found");
        reject(new Error(errorThrown));
      });
    });
  }

  heartbeat(){
    this.logger.info("sending heartbeat...");

    // fire and forget here is fine
    this.get("lease/refresh");
  }

  getGuestCredentials(){
    const self = this;

    return this.get(
      "lease/request",
      { dataType: "json" }
    ).then(function (creds) {
      if( creds === false ){
        self.logger.warn("no credentials available for lease");
        return Promise.reject( new Error("no credentials available for lease") );
      }

      self.logger.info("leased credentials",creds);
      return {
        email: creds.username,
        password: creds.password
      };
    });
  }

  get(path,customParams={}){
    const params = Object.assign(
      {
        method: 'GET',
        url: this.baseUrl + "/" + path,
        xhrFields: {
          withCredentials: true
        }
      },
      customParams
    );

    return Promise.resolve($.ajax(params));
  }
};


})();


var WackyUUID = class Util{
  constructor(seed){
    Math.seed = function(s) {
      return function() {
          s = Math.sin(s) * 10000; return s - Math.floor(s);
      };
    };

    // usage:
    var random1 = Math.seed(seed);
    var random2 = Math.seed(random1());
    Math.random = Math.seed(random2());
  }

  guid(){

    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
};
