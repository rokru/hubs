import { TEXTURES_FLIP_Y } from "../loaders/HubsTextureLoader";


export const ACTIONS ={
  MEGAPHONE: "megaphone",
  TELEPORT: "teleport",
  VISIBLE: "visible",
  SWITCH: "switch active",  
  SNAP: "snap",
  AUDIOZONE: "audiozone",
};

AFRAME.registerComponent('trigger', {
  schema: {
    avatar: { default: null },
    physicsSystem: { default: null },
    uuid: { default: 0 },
    bounds: { default: new THREE.Vector3(1, 1, 1) },
    cMask: {type:"number", default: -1},
    audioChannel: {type:"number", default: 0},
    switchActive: { type: "boolean", default: true},
    target: { default: "target" },
    triggerType: { default: "none" },
    elementsInTrigger: { default: []},

      },
      init: function () {
        this.data.target = "target";
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
        switch(this.data.triggerType)
        {
          case ACTIONS.TELEPORT:
            break;
          case ACTIONS.VISIBLE:
            break;
          case ACTIONS.MEGAPHONE:
            break;
          case ACTIONS.SWITCH	:
            this.switchVisibility(!(this.data.switchActive));
            break; 
          case ACTIONS.SNAP	:
            break; 
          case ACTIONS.AUDIOZONE	:
            break; 
          }
      },
      initVariables: function()
      {
        this.data.avatar = document.querySelector("#avatar-rig");
        this.data.physicsSystem = this.el.sceneEl.systems["hubs-systems"].physicsSystem;
        this.data.uuid = this.el.components["body-helper"].uuid;
        this.data.elementsInTrigger = [];
      },
      setupCollisionGroup: function()
      {
        let collisionMask = 0;

          switch(this.data.triggerType)
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

        this.el.setAttribute("body-helper", {collisionFilterMask:this.data.cMask})
      } ,     
      CheckCollidingObjects: function() {
        
        let collisions = this.data.physicsSystem.getCollisions(this.data.uuid);

        for (let i = 0; i < collisions.length; i++) {
          const bodyData = this.data.physicsSystem.bodyUuidToData.get(collisions[i]);
          const mediaObjectEl = bodyData && bodyData.object3D && bodyData.object3D.el;
          
          if(!this.listContainsElement(this.data.elementsInTrigger, mediaObjectEl))
          {
            this.data.elementsInTrigger.push(mediaObjectEl);

            this.onTriggerEnter(mediaObjectEl);
          }
        }

        for (let i = 0; i < this.data.elementsInTrigger.length; i++) 
        {
          const element = this.data.elementsInTrigger[i];
          let elementFound = false;

          for (let i = 0; i < collisions.length; i++) 
          {
            const bodyData = this.data.physicsSystem.bodyUuidToData.get(collisions[i]);
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
            
            this.data.elementsInTrigger.splice(i,1);
          }
        }
      },
      onTriggerEnter: function(element)
      {
        console.log("trigger onTriggerEnter");

        switch(this.data.triggerType)
        {
          case ACTIONS.TELEPORT:
            this.teleportElement(element, this.data.target);
            break;
          case ACTIONS.VISIBLE:
            this.changeVisibility(element, false);
            break;
          case ACTIONS.MEGAPHONE:
            this.changeMegaphone(true);
            break;
          case ACTIONS.SWITCH:
            this.switchVisibility(this.data.switchActive);
            break;
            case ACTIONS.SNAP:
              this.snap(element);
              break;          
            case ACTIONS.AUDIOZONE:
              this.setAudioZone(element, this.data.audioChannel);
              break;
        }
      },
      onTriggerLeft: function(element)
      {
        console.log("trigger onTriggerLeft");

        switch(this.data.triggerType)
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
            if(this.data.elementsInTrigger.length<=1)
            {
              this.switchVisibility(!(this.data.switchActive));
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
         if(NAF.utils.isMine(element) && this.data.avatar.components["audio-channel"])
          {
            this.data.avatar.components["audio-channel"].setChannel(channelNumber);
          }
          else
          {
            this.data.avatar.components["audio-channel"].updateChannel();
          }
      },
      switchVisibility: function(isVisible)
      {
        console.log("trigger switchVisibility", this.data.target);

        let target = document.querySelector("."+this.data.target);
        
        console.log("trigger switchVisibility", isVisible);
        
        if(target)
        {
          target.setAttribute("visible", isVisible);
        }
      },
      changeMegaphone: function(isActivated)
      {
          this.data.avatar.setAttribute("isMegaphone",isActivated);
      },
      teleportElement: function(element, targetClassName)
      {
        if(!NAF.utils.isMine(element))
        {
            return;
        }

        if(element.className=="AvatarRoot" || element.className=="Head")
        {
          element = this.data.avatar;
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
          this.data.physicsSystem.bodyInitialized(bodyAUUID) &&
          this.data.physicsSystem.bodyInitialized(bodyBUUID) &&
          this.data.physicsSystem.getCollisions(bodyAUUID).indexOf(bodyBUUID) !== -1
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