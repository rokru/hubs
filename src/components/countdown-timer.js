const EVENT_START="EVENT_START";
const EVENT_PAUSE="EVENT_PAUSE";
const EVENT_STOP="EVENT_STOP";
const EVENT_SET_DATA="EVENT_SET_DATA";
const EVENT_RESPONSE_INIT="EVENT_RESPONSE_INIT";

AFRAME.registerComponent('countdown-timer', {
  schema: {
    isActive: {type: "boolean", default: false},
    hour: {type: "number", default: 0},
    minute: {type: "number", default: 0},
    second: {type: "number", default: 0},
    intervalId: {type: "number", default: 0},
    textElement: {default: null},
    playPauseButton: {default: null},
    StopButton: {default: null},
    hourPlusButton: {default: null},
    hourMinusButton: {default: null},
    minutePlusButton: {default: null},
    minuteMinusButton: {default: null},
    secondPlusButton: {default: null},
    secondMinusButton: {default: null},
      },
      init: function () {
        var initVariablesFunction = ()=>{
          this.el.sceneEl.removeEventListener('model-loaded', initVariablesFunction);
        
          this.data.textElement = this.el.querySelector("#clock");
         
          this.data.playPauseButton = this.el.querySelector("#play-pause-button");
          this.data.playPauseButton.object3D.addEventListener("interact", this.onPlayPause.bind(this));
         
          this.data.StopButton = this.el.querySelector("#stop-button");
          this.data.StopButton.object3D.addEventListener("interact", ()=>{
            this.broadcastNetworkEvent(EVENT_STOP);
            this.stopCountdown();
          });
          
          this.data.hourPlusButton = this.el.querySelector("#hour-plus");
          this.data.hourPlusButton.object3D.addEventListener("interact", ()=>{this.setTimer(this.data.hour+1,this.data.minute, this.data.second)});
          
          this.data.hourPlusButton = this.el.querySelector("#hour-minus");
          this.data.hourPlusButton.object3D.addEventListener("interact", ()=>{this.setTimer(this.data.hour-1,this.data.minute, this.data.second)});
          
          this.data.hourPlusButton = this.el.querySelector("#minute-plus");
          this.data.hourPlusButton.object3D.addEventListener("interact", ()=>{this.setTimer(this.data.hour,this.data.minute+1, this.data.second)});
          
          this.data.hourPlusButton = this.el.querySelector("#minute-minus");
          this.data.hourPlusButton.object3D.addEventListener("interact", ()=>{this.setTimer(this.data.hour,this.data.minute-1, this.data.second)});
          
          this.data.hourPlusButton = this.el.querySelector("#second-plus");
          this.data.hourPlusButton.object3D.addEventListener("interact", ()=>{this.setTimer(this.data.hour,this.data.minute, this.data.second+1)});
          
          this.data.hourPlusButton = this.el.querySelector("#second-minus");
          this.data.hourPlusButton.object3D.addEventListener("interact", ()=>{this.setTimer(this.data.hour,this.data.minute, this.data.second-1)});
          
          this.initButtonSubscriptions();
          this.updateTextElement();

          document.body.addEventListener('clientConnected', function (evt) {
            if(NAF.utils.isMine(this.el))
            {
              this.sendInitData(evt.detail.clientId);
            }
          }.bind(this));
        };

        this.el.sceneEl.addEventListener('model-loaded', initVariablesFunction);
      },
      initButtonSubscriptions()
      {
        console.log("countdown-timer initButtonSubscriptions", this.el.id);
        NAF.connection.subscribeToDataChannel(this.el.id, 
          (senderId, dataType, data, targetId)=>{
            console.log("countdown-timer data received", data.eventType);

            this.data.hour = data.hour;
            this.data.minute = data.minute;
            this.data.second = data.second;

            switch(data.eventType)
            {
            case EVENT_RESPONSE_INIT:
                console.log("countdown-timer EVENT_RESPONSE_INIT");
                if(data.isActive)
                {
                  this.startCountdown();
                }
                else
                {
                  this.pauseCountdown();
                }
                break;
              case EVENT_START:
                this.startCountdown();
                break;
              case EVENT_PAUSE:
                this.pauseCountdown();
                break;
              case EVENT_STOP:
                this.stopCountdown();
                break;
              case EVENT_SET_DATA:
                this.updateTextElement();
                break;
            }
        });
      },
      broadcastNetworkEvent(eventType)
      {
        var data = {
          eventType : eventType,
          hour: this.data.hour,
          minute: this.data.minute,
          second: this.data.second,
        };

        NAF.connection.broadcastData(this.el.id, data);

        console.log("countdown-timer broadcastNetworkEvent", data);
      },
      sendInitData(clientId)
      {
        var data = {
          eventType : EVENT_RESPONSE_INIT,
          isActive:   this.data.isActive,
          hour:       this.data.hour,
          minute:     this.data.minute,
          second:     this.data.second,
        };
        
        NAF.connection.sendData(clientId, this.el.id, data);
        console.log("countdown-timer sendInitData", data);
      },
      onPlayPause()
      {
        console.log("countdown-timer onPlayPause");

        if(this.data.isActive)
        {
        this.broadcastNetworkEvent(EVENT_PAUSE);
        this.pauseCountdown();
        }
        else
        {
          this.broadcastNetworkEvent(EVENT_START);
          this.startCountdown();
        }
      },
      startCountdown()
      {
        console.log("countdown-timer startCountdown");
        this.data.isActive = true;
        this.updateTextElement();

        this.data.intervalId = setInterval(function(){
          if(this.data.isActive){
            this.data.second = this.data.second - 1
            if(this.data.second == -1){
              this.data.minute = this.data.minute - 1
              if(this.data.minute == -1){
                this.data.hour = this.data.hour - 1
                this.data.minute = 59
              }
              this.data.second = 59
            }
            if(this.data.hour == -1 && this.data.minute == 59 && this.data.second == 59){
              this.stopCountdown();
              this.data.textElement.setAttribute("text", "value:Ende");
            }
            else{
              this.updateTextElement();
            }
          }
        }.bind(this),1000);
      },
      stopCountdown()
      {
        console.log("countdown-timer stopCountdown");

        this.data.isActive = false;
        clearInterval(this.data.intervalId);
        this.setTimer(0,0,0);
        this.updateTextElement();
      },
      pauseCountdown()
      {
        console.log("countdown-timer pauseCountdown");

        this.data.isActive = false;

        clearInterval(this.data.intervalId);

        this.updateTextElement();
      },
      setTimer(hour, minute, second)
      {
        //NAF.utils.takeOwnership(this.el)

        this.data.hour = hour;
        this.data.minute = minute;
        this.data.second = second;

        this.updateTextElement();
        this.broadcastNetworkEvent(EVENT_SET_DATA);
      },
      updateTextElement()
      {
        this.validateTime();
        var timeAsString = ""+(this.data.hour.toString().padStart(2,'0') + ":" + this.data.minute.toString().padStart(2,'0') + ":" + this.data.second.toString().padStart(2,'0'));
        this.data.textElement.setAttribute("text", "value:"+timeAsString);

        if(this.data.isActive)
        {
          this.data.playPauseButton.querySelector("[text]").setAttribute("text", "value:Pause")
        }
        else
        {
          this.data.playPauseButton.querySelector("[text]").setAttribute("text", "value:Start")
        }
      },
      validateTime()
      {
        this.data.hour = this.data.hour < 0 ? 99 : (this.data.hour > 99 ? 0 :this.data.hour);
        this.data.minute = this.data.minute < 0 ? 59 : (this.data.minute > 59 ? 0 :this.data.minute);
        this.data.second = this.data.second < 0 ? 59 : (this.data.second > 59 ? 0 :this.data.second);
      }
  });