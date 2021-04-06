import "./utils/configs";
import { getAbsoluteHref, guessContentType } from "./utils/media-url-utils";
import { isValidSceneUrl } from "./utils/scene-url-utils";
import { getMessages } from "./utils/i18n";
import { spawnChatMessage } from "./react-components/chat-message";
import { SOUND_QUACK, SOUND_SPECIAL_QUACK } from "./systems/sound-effects-system";
import ducky from "./assets/models/DuckyMesh.glb";
import { ObjectContentOrigins } from "./object-types";
import GROUP_ID from "./scene-entry-manager";
import { CameraSystem } from "./systems/camera-system";

let uiRoot;
// Handles user-entered messages
export default class MessageDispatch {
  constructor(scene, entryManager, hubChannel, addToPresenceLog, remountUI, mediaSearchStore) {
    this.scene = scene;
    this.entryManager = entryManager;
    this.hubChannel = hubChannel;
    this.addToPresenceLog = addToPresenceLog;
    this.remountUI = remountUI;
    this.mediaSearchStore = mediaSearchStore;
  }

  log = body => {
    this.addToPresenceLog({ type: "log", body });
  };

  dispatch = message => {
    if (message.startsWith("/")) {
      const commandParts = message.substring(1).split(/\s+/);
      this.dispatchCommand(commandParts[0], ...commandParts.slice(1));
      document.activeElement.blur(); // Commands should blur
    } else {
      this.hubChannel.sendMessage(message);
    }
  };

  dispatchCommand = async (command, ...args) => {
    console.log("dispatchCommand", command);

    const entered = this.scene.is("entered");
    uiRoot = uiRoot || document.getElementById("ui-root");
    const isGhost = !entered && uiRoot && uiRoot.firstChild && uiRoot.firstChild.classList.contains("isGhost");

    if (!entered && (!isGhost || command === "duck")) {
      this.addToPresenceLog({ type: "log", body: "You must enter the room to use this command." });
      return;
    }

    const avatarRig = document.querySelector("#avatar-rig");
    const scales = [0.0625, 0.125, 0.25, 0.5, 1.0, 1.5, 3, 5, 7.5, 12.5];
    const curScale = avatarRig.object3D.scale;
    let err;
    let physicsSystem;
    const captureSystem = this.scene.systems["capture-system"];

    switch (command) {
      case "fly":
        if (this.scene.systems["hubs-systems"].characterController.fly) {
          this.scene.systems["hubs-systems"].characterController.enableFly(false);
          this.addToPresenceLog({ type: "log", body: "Fly mode disabled." });
        } else {
          if (this.scene.systems["hubs-systems"].characterController.enableFly(true)) {
            this.addToPresenceLog({ type: "log", body: "Fly mode enabled." });
          }
        }
        break;
      case "grow":
        for (let i = 0; i < scales.length; i++) {
          if (scales[i] > curScale.x) {
            avatarRig.object3D.scale.set(scales[i], scales[i], scales[i]);
            avatarRig.object3D.matrixNeedsUpdate = true;
            break;
          }
        }
        case "fov":
          console.log("fov", args);

          var customFOV = args[0];
          console.log("fov customFOV", customFOV);

          var viewingCamera = document.getElementById("viewing-camera");

          if (viewingCamera?.components.camera) {
            viewingCamera.setAttribute("camera", { fov: customFOV });
          }

          viewingCamera.object3DMap.camera.matrixNeedsUpdate = true;
          viewingCamera.object3DMap.camera.updateMatrix();
          viewingCamera.object3DMap.camera.updateMatrixWorld();

        break;
      case "shrink":
        for (let i = scales.length - 1; i >= 0; i--) {
          if (curScale.x > scales[i]) {
            avatarRig.object3D.scale.set(scales[i], scales[i], scales[i]);
            avatarRig.object3D.matrixNeedsUpdate = true;
            break;
          }
        }

        break;
      case "leave":
        this.entryManager.exitScene();
        this.remountUI({ roomUnavailableReason: "left" });
        break;
        case "mute":
          this.scene.emit("action_mute");
          break;
      case "megaphone":
       
        const avatarHead = this.scene.querySelector("[id='avatar-rig'");

        if(args[0]==="on")
        {
          avatarHead.setAttribute("isMegaphone", true);
        }
        else if(args[0]==="off")
        {
          avatarHead.setAttribute("isMegaphone", false);
        }
        
      break;
      case "hide-group":          
          const entities = this.scene.querySelectorAll("[group-id='"+args[0]+"']");
          for (let i = 0; i < entities.length; i++) {
            
            if(!NAF.utils.isMine(entities[i]))  
            {
              NAF.utils.takeOwnership(entities[i]);
            }       

            entities[i].setAttribute("visible",false);
          }
        break;
      case "show-group":
          const ents = this.scene.querySelectorAll("[group-id='"+args[0]+"']");
          for (let i = 0; i < ents.length; i++) {

            if(!NAF.utils.isMine(ents[i]))  
            {
              NAF.utils.takeOwnership(ents[i]);
            }         

            ents[i].setAttribute("visible",true);
          }
        break;
        case "set-group-id":
          this.scene.emit("set-group-id",  args[0]);
        break;
      case "create":
        if(args[0]==="")
        {
          return;
        }
        else if(args[0].startsWith("www."))
        {
          this.scene.emit("create_object",  {action:"website", website:args[0], position:args[1]});
        }
        else if(args[0]==="clock")
        {
          this.scene.emit("create_object",  {action:"clock", position:args[1]}, "clock");
        }
        else if(args[0].includes(".glb"))
        {
          spawnChatMessage(getAbsoluteHref(location.href, "./assets/models/"+args[0]));
        }

        break;
      case "duck":
        spawnChatMessage(getAbsoluteHref(location.href, ducky));

        if (Math.random() < 0.01) {
          this.scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_SPECIAL_QUACK);
        } else {
          this.scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_QUACK);
        }
        break;
      case "debug":
        physicsSystem = document.querySelector("a-scene").systems["hubs-systems"].physicsSystem;
        physicsSystem.setDebug(!physicsSystem.debugEnabled);
        break;
      case "vrstats":
        document.getElementById("stats").components["stats-plus"].toggleVRStats();
        break;
      case "scene":
        if (args[0]) {

          console.log("chat arguments:", args[0], args[1]);

          if (await isValidSceneUrl(args[0])) {
            err = this.hubChannel.updateScene(args[0]);
            if (err === "unauthorized") {
              this.addToPresenceLog({ type: "log", body: "You do not have permission to change the scene." });
            }
          } else {
            this.addToPresenceLog({ type: "log", body: getMessages()["invalid-scene-url"] });
          }
        } else if (this.hubChannel.canOrWillIfCreator("update_hub")) {
          this.mediaSearchStore.sourceNavigateWithNoNav("scenes", "use");
        }

        break;
      case "rename":
        err = this.hubChannel.rename(args.join(" "));
        if (err === "unauthorized") {
          this.addToPresenceLog({ type: "log", body: "You do not have permission to rename this room." });
        }
        break;
      case "capture":
        if (!captureSystem.available()) {
          this.log("Capture unavailable.");
          break;
        }
        if (args[0] === "stop") {
          if (captureSystem.started()) {
            captureSystem.stop();
            this.log("Capture stopped.");
          } else {
            this.log("Capture already stopped.");
          }
        } else {
          if (captureSystem.started()) {
            this.log("Capture already running.");
          } else {
            captureSystem.start();
            this.log("Capture started.");
          }
        }
        break;
      case "audiomode":
        {
          const shouldEnablePositionalAudio = window.APP.store.state.preferences.audioOutputMode === "audio";
          window.APP.store.update({
            preferences: { audioOutputMode: shouldEnablePositionalAudio ? "panner" : "audio" }
          });
          this.log(`Positional Audio ${shouldEnablePositionalAudio ? "enabled" : "disabled"}.`);
        }
        break;
      case "audioNormalization":
        {
          if (args.length === 1) {
            const factor = Number(args[0]);
            if (!isNaN(factor)) {
              const effectiveFactor = Math.max(0.0, Math.min(255.0, factor));
              window.APP.store.update({
                preferences: { audioNormalization: effectiveFactor }
              });
              if (factor) {
                this.log(`audioNormalization factor is set to ${effectiveFactor}.`);
              } else {
                this.log("audioNormalization is disabled.");
              }
            } else {
              this.log("audioNormalization command needs a valid number parameter.");
            }
          } else {
            this.log(
              "audioNormalization command needs a base volume number between 0 [no normalization] and 255. Default is 0. The recommended value is 4, if you would like to enable normalization."
            );
          }
        }
        break;
    }
  };
}
