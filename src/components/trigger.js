export const ACTIONS ={
  MEGAPHONE: "megaphone",
  TELEPORT: "teleport",
  VISIBLE: "visible",
  SWITCH: "switch",  
  SNAP: "snap",
  AUDIOZONE: "audiozone",
};

AFRAME.registerComponent('trigger', {
  schema: {
    avatar: { default: null },
    physicsSystem: { default: null },
    uuid: { default: 0 },
    params: { default: "" },
    action: { default: "test" },
    elementsInTrigger: { default: []},

      },
      init: function () {
        this.initVariables();
        this.setupCollisionGroup();
        this.initState();
      },  
      tick: function()
      {
        try
        {
          this.CheckCollidingObjects();
        }
        catch(e)
        {
          console.error(e);
        }
      },
      initState: function()
      {
        switch(this.action)
        {
          case ACTIONS.TELEPORT:
            break;
          case ACTIONS.VISIBLE:
            break;
          case ACTIONS.MEGAPHONE:
            break;
          case ACTIONS.SWITCH	:
            this.switchVisibility(!(this.params[3]=='true'));
            break; 
          case ACTIONS.SWITCH	:
            break; 
          }
      },
      initVariables: function()
      {
        this.avatar = document.querySelector("#avatar-rig");
        this.physicsSystem = this.el.sceneEl.systems["hubs-systems"].physicsSystem;
        //this.interactionSystem = this.el.sceneEl.systems["hubs-systems"].el.systems.interaction;
        this.uuid = this.el.components["body-helper"].uuid;
        this.params = this.el.className.split("-");
        this.action = this.params[1];
        this.elementsInTrigger = [];
        this.el.setAttribute("media-frame", {mediaType:"none"});
      },
      setupCollisionGroup: function()
      {
        let collisionMask = 0;

          switch(this.action)
          {
            case ACTIONS.TELEPORT:
              collisionMask = 5;
              break;
            case ACTIONS.VISIBLE:
              collisionMask = 1;
              break;
            case ACTIONS.MEGAPHONE:
              collisionMask = 4;
              break;
            case ACTIONS.SWITCH	:
              collisionMask = 5;
              break; 
            case ACTIONS.SNAP	:
              collisionMask = 1;
              break; 
            case ACTIONS.AUDIOZONE	:
              collisionMask = 4;
              break; 
            }

        this.el.setAttribute("body-helper", {collisionFilterMask:collisionMask})
      } ,     
      CheckCollidingObjects: function() {
        
        let collisions = this.physicsSystem.getCollisions(this.uuid);

        for (let i = 0; i < collisions.length; i++) {
          const bodyData = this.physicsSystem.bodyUuidToData.get(collisions[i]);
          const mediaObjectEl = bodyData && bodyData.object3D && bodyData.object3D.el;
          
          if(!this.listContainsElement(this.elementsInTrigger, mediaObjectEl))
          {
            this.elementsInTrigger.push(mediaObjectEl);

            this.onTriggerEnter(mediaObjectEl);
          }
        }

        for (let i = 0; i < this.elementsInTrigger.length; i++) 
        {
          const element = this.elementsInTrigger[i];
          let elementFound = false;

          for (let i = 0; i < collisions.length; i++) 
          {
            const bodyData = this.physicsSystem.bodyUuidToData.get(collisions[i]);
            const mediaObjectEl = bodyData && bodyData.object3D && bodyData.object3D.el;

            if(mediaObjectEl.object3D.uuid == element.object3D.uuid)
            {
              elementFound = true;
              break;
            }
          }

          if(!elementFound)
          {
            this.onTriggerLeft(element);
            
            this.elementsInTrigger.splice(i,1);
          }
        }
      },
      onTriggerEnter: function(element)
      {
        switch(this.action)
        {
          case ACTIONS.TELEPORT:
            this.teleportElement(element, this.params[2]);
            break;
          case ACTIONS.VISIBLE:
            this.changeVisibility(element, false);
            break;
          case ACTIONS.MEGAPHONE:
            this.changeMegaphone(true);
            break;
          case ACTIONS.SWITCH:
            this.switchVisibility(this.params[3]=='true');
            break;
            case ACTIONS.SNAP:
              this.snap(element);
              break;          
            case ACTIONS.AUDIOZONE:
              this.setAudioZone(element, this.params[2]);
              break;
        }
      },
      onTriggerLeft: function(element)
      {
        switch(this.action)
        {
          case ACTIONS.TELEPORT:
            break;
          case ACTIONS.VISIBLE:
              this.changeVisibility(element, true);
            break;
          case ACTIONS.MEGAPHONE:
            this.changeMegaphone(false);
            break;
          case ACTIONS.SWITCH:
            if(this.elementsInTrigger.length<=1)
            {
              this.switchVisibility(!(this.params[3]=='true'));
            }
            break;
          case ACTIONS.SNAP:
            break;
          case ACTIONS.AUDIOZONE:
            this.setAudioZone(element, 0);
            break;
        }
      },
      setAudioZone: function(element, channelNumber)
      {
         if(NAF.utils.isMine(element) && this.avatar.components["audio-channel"])
          {
            this.avatar.components["audio-channel"].setChannel(channelNumber);
          }
          else
          {
            this.avatar.components["audio-channel"].updateChannel();
          }
      },
      switchVisibility: function(isVisible)
      {
        let target = document.querySelector("."+this.params[2]);
        
        if(target)
        {
          target.setAttribute("visible", isVisible);
        }
      },
      changeMegaphone: function(isActivated)
      {
          this.avatar.setAttribute("isMegaphone",isActivated);
      },
      teleportElement: function(element, targetClassName)
      {
        if(!NAF.utils.isMine(element))
        {
            return;
        }

        if(element.className=="AvatarRoot" || element.className=="Head")
        {
          element = this.avatar;
        }

        const position = document.querySelector("."+targetClassName);
        element.object3D.position.copy(position.object3D.position);
        element.object3D.rotation.copy(position.object3D.rotation);
        element.object3D.matrixNeedsUpdate = true;

        if(element.components["floaty-object"])
        {
          element.components["floaty-object"].setLocked(true); 
        }
      },
      changeVisibility: function(element, isVisible)
      {
        element.setAttribute("visible", isVisible);
      },
      snap: function(element)
      {
        if(element.components["floaty-object"])
        {
          element.components["floaty-object"].setLocked(true); 
        }
        
        element.object3D.rotation.copy(this.el.object3D.rotation);
        element.object3D.matrixNeedsUpdate = true;        
      },
      isColliding: function(entityA, entityB) {
        const bodyAUUID = entityA.components["body-helper"].uuid;
        const bodyBUUID = entityB.components["body-helper"].uuid;
        return (
          this.physicsSystem.bodyInitialized(bodyAUUID) &&
          this.physicsSystem.bodyInitialized(bodyBUUID) &&
          this.physicsSystem.getCollisions(bodyAUUID).indexOf(bodyBUUID) !== -1
        );
      },
      listContainsElement: function(list, element)
      {
        for (let i = 0; i < list.length; i++) 
        {
          if(list[i]==element)
          {
            return true;
          }
        }

        return false;
      }
  });