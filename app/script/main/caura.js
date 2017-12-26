'use strict';
(function() {

window.z = window.z || {};
window.z.main = z.main || {};

window.z.main.Caura = class Caura {
  constructor(){
    this.baseUrl = z.config.CAURA_API_URL;
    this.logger = new z.util.Logger('z.caura.Caura', z.config.LOGGER.OPTIONS);

    window.setInterval(this.heartbeat.bind(this), z.config.CAURA_HEARTBEAT_FREQUENCY_MS);
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
