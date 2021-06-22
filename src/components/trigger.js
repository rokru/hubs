import { string } from "prop-types";
import { TEXTURES_FLIP_Y } from "../loaders/HubsTextureLoader";


export const ACTIONS ={
  MEGAPHONE: "megaphone",
  TELEPORT: "teleport",
  VISIBLE: "visibility",
  SWITCH: "switch active",  
  SNAP: "snap",
  AUDIOZONE: "audiozone",
  CHANGE_ROOM: "Change Room",
  SCALE: "Scale",
};

AFRAME.registerComponent('trigger', {
  schema: {
    avatar: { default: "" },
    physicsSystem: { default: "" },
    uuid: { default: 0 },
    bounds: { default: new THREE.Vector3(1, 1, 1) },
    cMask: {type:"number", default: -1},
    channel: {type:"number", default: 0},
    switchActive: { type: "boolean", default: true},
    targetName: { default: "target" },
    triggerType: { default: "none" },
    size: { default: 0.1 },
    newRoomUrl: { default: "" },
    elementsInTrigger: { default: []},
      },
      init: function () {
        this.initVariables();
        this.setupCollisionGroup();
        this.initState();
        //this.setBorder();
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
      setBorder: function()
      {
    var cylinderRadius = this.data.bounds.x > this.data.bounds.z? this.data.bounds.x : this.data.bounds.z;

    this.el.setObject3D(
      "guide",
      new THREE.Mesh(
        new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, this.data.bounds.y, 24 ),
        new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0x6d9be3) }
          },
          vertexShader: `
            varying vec2 vUv;
            void main()
            {
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
              vUv = uv;
            }
          `,
          fragmentShader: `
            // adapted from https://www.shadertoy.com/view/Mlt3z8
            float bayerDither2x2( vec2 v ) {
              return mod( 3.0 * v.y + 2.0 * v.x, 4.0 );
            }
            float bayerDither4x4( vec2 v ) {
              vec2 P1 = mod( v, 2.0 );
              vec2 P2 = mod( floor( 0.5  * v ), 2.0 );
              return 4.0 * bayerDither2x2( P1 ) + bayerDither2x2( P2 );
            }

            varying vec2 vUv;
            uniform vec3 color;
            void main() {
              float alpha = (1.0-vUv.y)-0.5;
              if( ( bayerDither4x4( floor( mod( gl_FragCoord.xy, 4.0 ) ) ) ) / 32.0 >= alpha ) discard;
              gl_FragColor = vec4(color, 1.0);
            }
          `,
          side: THREE.DoubleSide
        })
      )
    );
      },
      initState: function()
      {
        //console.log("trigger initState", this.data.triggerType);
        switch(this.data.triggerType)
        {
          case ACTIONS.TELEPORT:
            this.setBorder();
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
          case ACTIONS.CHANGE_ROOM	:
            this.setBorder();
            break; 
            case ACTIONS.SCALE	:
            break; 
          }
      },
      initVariables: function()
      {
        this.data.bounds.x = this.data.bounds.x / 2;
        this.data.bounds.z = this.data.bounds.z / 2;
        this.data.avatar = document.querySelector("#avatar-rig");
        this.data.physicsSystem = this.el.sceneEl.systems["hubs-systems"].physicsSystem;
        this.data.uuid = this.el.components["body-helper"].uuid;
        this.data.elementsInTrigger = [];
        this.data.targetName = this.data.targetName.replaceAll(" ", "_");
        this.data.newRoomUrl = this.data.newRoomUrl != "" ? this.data.newRoomUrl : window.location.href;
      
      //###############DEBUG####################
      //this.data.triggerType = ACTIONS.SCALE;
      //########################################
      },
      setupCollisionGroup: function()
      {
        //console.log("trigger setupCollisionGroup", this.data.cMask);

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
            case ACTIONS.CHANGE_ROOM	:
              collisionMask = 4;
              break;  
            case ACTIONS.SCALE	:
              collisionMask = 5;
              break;               
            }
        this.el.setAttribute("body-helper", {collisionFilterMask:this.data.cMask})
      } ,     
      CheckCollidingObjects: function() {
        
        let collisions = this.data.physicsSystem.getCollisions(this.data.uuid);

        for (let i = 0; i < collisions.length; i++) {
          const bodyData = this.data.physicsSystem.bodyUuidToData.get(collisions[i]);
          const mediaObjectEl = bodyData && bodyData.object3D && bodyData.object3D.el;

          if(mediaObjectEl != null && !this.listContainsElement(this.data.elementsInTrigger, mediaObjectEl))
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

            try
            {
              if(mediaObjectEl.object3D.uuid == element.object3D.uuid)
              {
                elementFound = true;
                break;
              }
            }
            catch(e)
            {
              console.error(e);

              this.data.elementsInTrigger.splice(i,1);
            
              this.onTriggerLeft(element); 
            }

          }

          if(!elementFound)
          {
            this.data.elementsInTrigger.splice(i,1);
            
            this.onTriggerLeft(element);            
          }
        }
      },
      onTriggerEnter: function(element)
      {
        //console.log("trigger onTriggerEnter", element);

        switch(this.data.triggerType)
        {
          case ACTIONS.TELEPORT:
            this.teleportElement(element, this.data.targetName);
            break;
          case ACTIONS.VISIBLE:
            this.changeVisibility(element, false);
            break;
          case ACTIONS.MEGAPHONE:
            if(NAF.utils.isMine(element))
            {
              this.changeMegaphone(true);
            }
            break;
          case ACTIONS.SWITCH:
            this.switchVisibility(this.data.switchActive);
            break;
          case ACTIONS.SNAP:
            this.snap(element);
            break;          
          case ACTIONS.AUDIOZONE:
            this.setAudioZone(element, this.data.channel);
            break;
          case ACTIONS.CHANGE_ROOM:
            if(NAF.utils.isMine(element))
            {
              this.enterNewRoom();
            }
            break;
          case ACTIONS.SCALE:
            this.scale(element, this.data.size);
            break;
        }
      },
      onTriggerLeft: function(element)
      {
        //console.log("trigger onTriggerLeft", element);

        switch(this.data.triggerType)
        {
          case ACTIONS.TELEPORT:
            break;
          case ACTIONS.VISIBLE:
              this.changeVisibility(element, true);
            break;
          case ACTIONS.MEGAPHONE:
            if(NAF.utils.isMine(element))
            {
              this.changeMegaphone(false);
            }
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
          case ACTIONS.CHANGE_ROOM:
            break;
          case ACTIONS.SCALE:
            this.scale(element, 1.0);
            break;
        }
      },
      setAudioZone: function(element, channelNumber)
      {
        //console.log("trigger setAudioZone", element);
        //console.log("trigger channelNumber", channelNumber);

        if(!this.data.avatar.components["audio-channel"])
        {
          return;
        }

        if(NAF.utils.isMine(element))
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
        console.log("trigger switchVisibility", isVisible);
        
        let targetName = document.querySelector("."+this.data.targetName);
        
        console.log("trigger switchVisibility targetName", targetName);
               
        if(targetName)
        {
          targetName.setAttribute("visible", isVisible);
        }
      },
      changeMegaphone: function(isActivated)
      {
        //console.log("trigger changeMegaphone", isActivated);

        this.data.avatar.setAttribute("ismegaphone",isActivated);
      },
      teleportElement: function(element, targetClassName)
      {
        //console.log("trigger teleportElement", element);
        //console.log("trigger teleportElement", targetClassName);

        if(!NAF.utils.isMine(element))
        {
            return;
        }

        const position = document.querySelector("."+targetClassName);
        //console.log("trigger teleport targetClassName", targetClassName);
        //console.log("trigger teleport position", position);

        if(element.className=="AvatarRoot" || element.className=="Head")
        {
          element = this.data.avatar;

          let isInstant = true;
          this.el.sceneEl.systems["hubs-systems"].characterController.enqueueWaypointTravelTo(
            position.object3D.matrixWorld,
            isInstant,
            {willDisableMotion: false}
          );
        }
        else
        {
          element.object3D.position.copy(position.object3D.position);
          element.object3D.rotation.copy(position.object3D.rotation);
          element.object3D.matrixNeedsUpdate = true;
          
          if(element.components["floaty-object"])
          {
            element.components["floaty-object"].setLocked(true); 
          }
        }   
      },
      changeVisibility: function(element, isVisible)
      {
        //console.log("trigger changeVisibility", element);
        //console.log("trigger changeVisibility", isVisible);

        element.setAttribute("visible", isVisible);
      },
      snap: function(element)
      {
        //console.log("trigger snap", element);

        if(element.components["floaty-object"])
        {
          element.components["floaty-object"].setLocked(true); 
        }
        
        element.object3D.rotation.copy(this.el.object3D.rotation);
        element.object3D.matrixNeedsUpdate = true;        
      },
      enterNewRoom: function()
      {
        //console.log("enterNewRoom", this.data.newRoomUrl);

        if(this.data.newRoomUrl != "" && this.data.newRoomUrl != null)
        {
          window.open(this.data.newRoomUrl,"_self");
        }
      },
      scale: function(element, size)
      {
        if(!NAF.utils.isMine(element))
        {
            return;
        }

        //console.log("trigger scale element", element);

        if(element.className=="AvatarRoot" || element.className=="Head")
        {
          element = this.data.avatar;
        }

        element.object3D.scale.set(size, size, size);
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