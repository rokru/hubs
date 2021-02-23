AFRAME.registerComponent('audio-channel', {
  dependencies:['avatar-audio-source'],  
  schema: {
      avatar: { default: null },
      channel: {type: "number", default: 0},
      localChannel: {type: "number", default: 0},
      avatarAudioSource: {type: "asset"},
      defaultRef: {type: "number", default: 2},
    },
      init: function () {
        this.avatar = document.querySelector("#avatar-rig");
        this.avatarAudioSource = this.el.components['avatar-audio-source'];
        this.defaultRef = this.avatarAudioSource.data.refDistance;
      },
      setChannel: function(channelNumber)
      {
        this.data.channel = channelNumber;
      },
      tick: function()
      {
        if(this.data.localChannel != this.data.channel)
        {
          this.updateChannel();
        }
      },
      updateChannel: function()
      {
        this.data.localChannel = this.data.channel;
        
        if(NAF.utils.isMine(this.el))
        {
            let audioChannelsEntities = document.querySelectorAll('a-entity[audio-channel]');

            for (let i = 0; i < audioChannelsEntities.length; i++) 
            {
              var audioChannel = audioChannelsEntities[i].components["audio-channel"];

              if(audioChannel.data.channel == this.data.channel)
              {
                audioChannel.setChannelAudio(true);
              }
              else
              {
                audioChannel.setChannelAudio(false);
              }
            }
        }
      },
      setChannelAudio: function(audioState)
      {
        if(NAF.utils.isMine(this.el))
        {
          return;
        }
        
        if(audioState)
        {
          this.avatarAudioSource.data.refDistance = this.defaultRef;
          this.avatarAudioSource.remove();
          this.avatarAudioSource.createAudio();
        }
        else
        {
          this.avatarAudioSource.data.refDistance = 0.0;
          this.avatarAudioSource.remove();
          this.avatarAudioSource.createAudio();
        }
      }
     
  });