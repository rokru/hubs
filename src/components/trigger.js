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
        this.avatar = document.querySelector("#avatar-rig");
        this.physicsSystem = this.el.sceneEl.systems["hubs-systems"].physicsSystem;
        this.uuid = this.el.components["body-helper"].uuid;
        this.params = this.el.className.split("-");
        this.action = this.el.className.split("-")[1];
        this.elementsInTrigger = [];
        this.el.setAttribute("media-frame", {mediaType:"none"});

        console.log("trigger action", this.action);


      },  
      tick: function()
      {
        this.CheckCollidingObjects();
      },      
      CheckCollidingObjects: function() {
        const collisions = this.physicsSystem.getCollisions(this.uuid);

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

            if(mediaObjectEl == element)
            {
              elementFound = true;
              break;
            }
          }

          if(!elementFound)
          {
            this.elementsInTrigger.splice(i,1);

            this.onTriggerLeft(element);
          }
        }
      },
      onTriggerEnter: function(element)
      {
        switch(this.action)
        {
          case "teleport":
            this.teleportElement(element, this.params[2]);
            break;
          case "visible":
            this.changeVisibility(element, false);
            break;
        }
      },
      onTriggerLeft: function(element)
      {
        switch(this.action)
        {
          case "teleport":
            //this.teleportElement(element, this.params[2]);
            break;
          case "visible":
            this.changeVisibility(element, true);
            break;
        }
      },
      teleportElement: function(element, targetClassName)
      {
        const position = document.querySelector("."+targetClassName);
        element.object3D.position.copy(position.object3D.position);
        element.object3D.rotation.copy(position.object3D.rotation);
        element.object3D.matrixNeedsUpdate = true;
        element.components["floaty-object"].setLocked(true); 
      },
      changeVisibility: function(element, isVisible)
      {
        console.log("trigger changeVisibility", element);
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