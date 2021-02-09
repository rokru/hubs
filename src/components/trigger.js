export const ACTIONS ={
  MEGAPHONE: "megaphone",
  TELEPORT: "teleport",
  VISIBLE: "visible",
  SWITCH: "switch",
};



AFRAME.registerComponent('trigger', {
  schema: {
    avatar: { default: null },
    physicsSystem: { default: null },
    uuid: { default: 0 },
    params: { default: "" },
    action: { default: "" },
    elementsInTrigger: { default: []},

      },
      init: function () {
        this.initVariables();
        this.setupCollisionGroup();
        this.initState();
        console.log("trigger action", this.action);
      },  
      tick: function()
      {
        this.CheckCollidingObjects();
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
          }
      },
      initVariables: function()
      {
        this.avatar = document.querySelector("#avatar-rig");
        this.physicsSystem = this.el.sceneEl.systems["hubs-systems"].physicsSystem;
        //this.interactionSystem = this.el.sceneEl.systems["hubs-systems"].el.systems.interaction;
        this.uuid = this.el.components["body-helper"].uuid;
        this.params = this.el.className.split("-");
        this.action = this.el.className.split("-")[1];
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
            }

        this.el.setAttribute("body-helper", {collisionFilterMask:collisionMask})
      } ,     
      CheckCollidingObjects: function() {
        let collisions = this.physicsSystem.getCollisions(this.uuid);

        for (let i = 0; i < collisions.length; i++) {
          const bodyData = this.physicsSystem.bodyUuidToData.get(collisions[i]);
          const mediaObjectEl = bodyData && bodyData.object3D && bodyData.object3D.el;
          
          if(this.listContainsElement(this.elementsInTrigger, mediaObjectEl))
          {

          }
          else if(!this.listContainsElement(this.elementsInTrigger, mediaObjectEl))
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

            if(mediaObjectEl.id == element.id)
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
        console.log("trigger enter",element);

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
        }
      },
      onTriggerLeft: function(element)
      {
        console.log("trigger left",element);

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
        if(element.className=="AvatarRoot")
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
      isColliding: function(entityA, entityB) {
        console.log("media-frame isColliding");
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