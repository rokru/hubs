import { NearestFilter } from "three";

AFRAME.registerComponent('audio-channel', {
  dependencies:['avatar-audio-source'],  
  schema: {
      avatar: { default: null },
      channel: {type: "number", default: 0},
        localChannel: {type: "number", default: 0},
        avatarAudioSource: {type: "asset"},
      },
      init: function () {
        this.avatar = document.querySelector("#avatar-rig");
        this.avatarAudioSource = this.el.components['avatar-audio-source'];
      },
      setChannel: function(channelNumber)
      {
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

        if(NAF.utils.isMine(this.el))
        {
            let audioChannelsEntities = document.querySelectorAll('a-entity[audio-channel]');
            console.log("audio-channel audioChannels", audioChannelsEntities);

            for (let i = 0; i < audioChannelsEntities.length; i++) 
            {
              var audioChannel = audioChannelsEntities[i].components["audio-channel"];

              console.log("audio-channel audioChannel", audioChannel.data.channel);

              if(audioChannel.data.channel == this.data.channel)
              {
                console.log("audio-channel SOUND");
                audioChannel.setChannelAudio(true);
              }
              else
              {
                console.log("audio-channel MUTE");
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
          console.log("audio-channel setChannelAudio true", this.el);

        }
        else
        {
          console.log("audio-channel setChannelAudio false", this.el);

        }

      }
     
  });