AFRAME.registerComponent('megaphone', {
  dependencies:['avatar-audio-source'],  
  schema: {
        isActive: {type: "boolean", default: false},
        avatarAudioSource: {type: "asset"},
      },
      init: function () {
        this.data.avatarAudioSource = this.el.getAttribute("avatar-audio-source");
    },

    set: function(isMegaphoneActive)
    {      
      if(isMegaphoneActive === this.data.isActive)
      {
        return;
      }

      console.log("megaphone set", isMegaphoneActive);

      this.data.isActive = isMegaphoneActive;
      
      console.log("isActivated", this.data.isActive);

      if(this.data.isActive==="true")
      {
        console.log("activate megaphone");

        this.el.setAttribute("avatar-audio-source", {
          positional: true,
          distanceModel: "inverse",
          maxDistance: 10000,
          refDistance: 100,
          rolloffFactor: 1
        });
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
      }
      
      console.log("megaphone", this.data.avatarAudioSource);
    },
    tick: function()
    {
        this.set(this.el.getAttribute("isMegaphone"));
    },
     
  });