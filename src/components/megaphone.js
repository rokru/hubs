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
        this.avatarAudioSource = this.el.parentNode.querySelector("[avatar-audio-source]").components['avatar-audio-source'];
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
        console.log("activate megaphone");
                
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
        console.log("deactivate megaphone");
        
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
      
      console.log("megaphone isMegaphoneActive", isMegaphoneActive);
      console.log("megaphone this.isActive", this.isActive);
      console.log("megaphone avatarAudioSource", this.avatarAudioSource);
    },
    block: function(){
        this.isLocked = true;
        console.log("megaphone block");
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