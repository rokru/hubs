AFRAME.registerComponent('audio-channel', {
  schema: {
      channel: {type: "number", default: 0},
      localChannel: {type: "number", default: 0},
      avatarAudioSource: {type: "asset", default: null},
      defaultRef: {type: "number", default: 2},
    },
      init: function () {
      },
      setChannel: function(channelNumber)
      {
        this.data.channel = channelNumber;
      },
      initVariables: function()
      {
        try
        {
          this.data.avatarAudioSource = this.el.querySelector("[avatar-audio-source]").components['avatar-audio-source'];
          console.log("megaphone avatarAudioSource Data", this.data.avatarAudioSource.data);
          this.data.defaultRef = this.data.avatarAudioSource.data.refDistance;
          console.log("megaphone defaultRef", this.data.defaultRef);
        }
        catch(e)
        {
          console.error(e);
        }
      },
      tick: function()
      {   
        if(this.el.id!="avatar-rig" && this.data.avatarAudioSource == null)
        {
          this.initVariables();
          
          return;
        }

        if(this.data.localChannel != this.data.channel)
        {
          this.updateChannel();
        }
      },
      updateChannel: function()
      {        
        if(this.el.id=="avatar-rig")
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
        this.data.localChannel = this.data.channel;

        if(this.el.id=="avatar-rig")
        {
          return;
        }
        
        if(audioState)
        {
          this.data.avatarAudioSource.data.refDistance = this.data.defaultRef;
          this.data.avatarAudioSource.remove();
          this.data.avatarAudioSource.createAudio();
        }
        else
        {
          this.data.avatarAudioSource.data.refDistance = 0.0;
          this.data.avatarAudioSource.remove();
          this.data.avatarAudioSource.createAudio();
        }
      }
     
  });