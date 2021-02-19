AFRAME.registerComponent('audio-channel', {
  dependencies:['avatar-audio-source'],  
  schema: {
        channel: {type: "number", default: 0},
        localChannel: {type: "number", default: 0},
        avatarAudioSource: {type: "asset"},
      },
      init: function () {
        this.avatarAudioSource = this.el.components['avatar-audio-source'];
      },
      setChannel: function(channelNumber)
      {
        console.log("audio-channel setChannel", channelNumber);
        this.data.channel = channelNumber;
      },
      tick: function()
      {
        if(this.data.localChannel != this.data.channel)
        {
          console.log("audio-channel tick", this.data.channel);
          this.updateChannel();
        }
      },
      updateChannel: function()
      {
        this.data.localChannel = this.data.channel;
      }

     
  });