AFRAME.registerComponent('megaphone', {
  dependencies:['avatar-audio-source'],  
  schema: {
        isActive: {type: "boolean", default: false},
        isLocked: {type: "boolean", default: false},
        avatarAudioSource: {type: "asset"},
        defaultRef: {type: "number", default: 2},
      },
      init: function () {
        this.isActive = this.el.getAttribute("isMegaphone")=="true";
        this.avatarAudioSource = this.el.components['avatar-audio-source'];
        this.defaultRef = this.avatarAudioSource.data.refDistance;
      console.log("megaphone defaultRef", this.defaultRef);
        
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

      console.log("megaphone set", isMegaphoneActive);
      console.log("megaphone defaultRef", this.defaultRef);

      this.isActive = isMegaphoneActive;
            
      if(this.isActive==true)
      {               
        this.avatarAudioSource.data.refDistance = 100;
        this.avatarAudioSource.data.positional = false;
        this.avatarAudioSource.remove();
        this.avatarAudioSource.createAudio();
      }
      else
      {       
        this.avatarAudioSource.data.refDistance = this.defaultRef;
        this.avatarAudioSource.data.positional = true;
        this.avatarAudioSource.remove();
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