AFRAME.registerComponent('megaphone', {
  schema: {
        isActive: {type: "boolean", default: false},
        isLocked: {type: "boolean", default: false},
        avatarAudioSource: {type: "asset", default: null},
        defaultRef: {type: "number", default: 2},
      },
      init: function () {
        this.data.isActive = this.el.getAttribute("isMegaphone")=="true";
       
        if(this.el.id == "avatar-rig")
        {
          this.data.isLocked = true;
        }
      },

    set: function(isMegaphoneActive)
    {  
      if(isMegaphoneActive == this.data.isActive)
      {
        return;
      }

      if(!this.data.avatarAudioSource)
      {
        this.initVariables();

        if(!this.data.avatarAudioSource)
        {
          return;
        }
      }

      this.data.isActive = isMegaphoneActive;
            
      if(this.data.isActive==true)
      {               
        this.data.avatarAudioSource.data.refDistance = 100;
        this.data.avatarAudioSource.data.positional = false;
        this.data.avatarAudioSource.remove();
        this.data.avatarAudioSource.createAudio();
      }
      else
      {       
        this.data.avatarAudioSource.data.refDistance = this.data.defaultRef;
        this.data.avatarAudioSource.data.positional = true;
        this.data.avatarAudioSource.remove();
        this.data.avatarAudioSource.createAudio();
      }
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
    block: function()
    {
      this.data.isLocked = true;
    },
    tick: function()
    {
      if(this.data.isLocked)
      {
        return;
      }

      this.set(this.el.getAttribute("isMegaphone")=="true");
    },     
  });