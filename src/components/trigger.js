AFRAME.registerComponent('trigger', {
  schema: {
    avatar: { default: null },
    physicsSystem: { default: null },
    uuid: { default: 0 },

      },
      init: function () {
        this.avatar = document.querySelector("#avatar-rig");
        this.physicsSystem = this.el.sceneEl.systems["hubs-systems"].physicsSystem;
        this.uuid = this.el.components["body-helper"].uuid;
        this.el.setAttribute("media-frame", {mediaType:"none"});

      },  
      tick: function()
      {
        this.getCapturableEntityCollidingWithBody(this.uuid);
      },      
      getCapturableEntityCollidingWithBody: function(bodyUUID) {
        const collisions = this.physicsSystem.getCollisions(bodyUUID);
        for (let i = 0; i < collisions.length; i++) {
          const bodyData = this.physicsSystem.bodyUuidToData.get(collisions[i]);
          const mediaObjectEl = bodyData && bodyData.object3D && bodyData.object3D.el;
          
          console.log("trigger colliding object", mediaObjectEl);
          const position = document.querySelector(".Spawn_Point");

          mediaObjectEl.object3D.position.copy(position.object3D.position);
          mediaObjectEl.object3D.rotation.copy(position.object3D.rotation);
          mediaObjectEl.object3D.matrixNeedsUpdate = true;
          mediaObjectEl.components["floaty-object"].setLocked(true);  }

        return null;
      }
  });