AFRAME.registerComponent('megaphone', {
  dependencies:['avatar-audio-source'],  
  schema: {
        isActive: {type: "boolean", default: false},
        isLocked: {type: "boolean", default: false},
        avatarAudioSource: {type: "asset"},
      },
      init: function () {
        //this.data.avatarAudioSource = this.el.getAttribute("avatar-audio-source");
        this.isActive = this.el.getAttribute("isMegaphone")=="true";
        this.avatarAudioSource = this.el.components['avatar-audio-source'];
        
        if(this.el.id == "avatar-rig")
        {
          this.isLocked = true;
        }
      },

    set: function(isMegaphoneActive)
    {      
      if(isMegaphoneActive == this.isActive)
      {
        return;
      }

      this.isActive = isMegaphoneActive;
            
      if(this.isActive==true)
      {               
        this.el.setAttribute("avatar-audio-source", {
          positional: true,
          distanceModel: "inverse",
          maxDistance: 10000,
          refDistance: 100,
          rolloffFactor: 1
        });

        this.avatarAudioSource.destroyAudio();
        this.avatarAudioSource.createAudio();
      }
      else
      {       
        this.el.setAttribute("avatar-audio-source", {
          positional: true,
          distanceModel: "inverse",
          maxDistance: 10000,
          refDistance: 2,
          rolloffFactor: 2
        });

        this.avatarAudioSource.destroyAudio();
        this.avatarAudioSource.createAudio();
      }
    },
    block: function(){
        this.isLocked = true;
      },
      tick: function()
      {
        
        if(this.isLocked)
        {
          return;
        }
        else
        {
        this.set(this.el.getAttribute("isMegaphone")=="true");
      }
    },
     
  });