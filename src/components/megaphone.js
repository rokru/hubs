AFRAME.registerComponent('megaphone', {
  dependencies:['avatar-audio-source'],  
  schema: {
        isActive: {type: "boolean", default: false},
        isUpdate: {type: "boolean", default: false},
        avatarAudioSource: {type: "asset"},
        originalRefDistance: {default: 2},
      },
      init: function () {
        this.avatarAudioSource = this.el.getAttribute("avatar-audio-source");
        this.originalRefDistance = this.avatarAudioSource.refDistance;
        this.isActive = this.el.getAttribute("isMicrophone");
      // This will be called after the entity has properly attached and loaded.
    },

    set: function(isMegaphoneActive)
    {
      console.log("megaphone set", isMegaphoneActive);
      
      this.data.isActive = isMegaphoneActive;
      
      console.log("isActivated", this.data.isActive);

      if(this.data.isActive==="true")
      {
        console.log("activate megaphone");
        this.avatarAudioSource.refDistance = 20;
        //this.el.setAttribute("avatar-audio-source", {refDistance: 20, rolloffFactor: 0});
      }
      else
      {
        console.log("deactivate megaphone");
        this.avatarAudioSource.refDistance = this.data.originalRefDistance;
        //this.el.setAttribute("avatar-audio-source", {refDistance: 2, rolloffFactor: 2});
      }
      
      console.log("megaphone", this.avatarAudioSource);
    },
    tick: function()
    {
      if(this.el.getAttribute("isMegaphone")!=this.data.isActive)
      {
        this.set(this.el.getAttribute("isMegaphone"));
      }
    },
     
  });