import { number } from "prop-types";
import { isLocalHubsSceneUrl, isHubsRoomUrl, isLocalHubsAvatarUrl } from "../utils/media-url-utils";
import { guessContentType } from "../utils/media-url-utils";
import { handleExitTo2DInterstitial } from "../utils/vr-interstitial";

const BUTTON_DATA_REQUEST = new Request(
  "https://fh-erfurt.info/api/v1/media/search?source=rooms&filter=public", 
  {
  method:'GET',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {'Content-type':'application/json'}
});

const UPDATE_INTERVAL = 10000;

AFRAME.registerComponent("open-media-button", {
  schema: {
    onlyOpenLink: { type: "boolean" },
    numberOfCurrentUsers: {type: "number"},
    roomSize: {type: "number"},
    roomSizeSubscription:{},
    label: {}
  },
  init() {
    this.label = this.el.querySelector("[text]");
    this.numberOfCurrentUsers = 0;
    this.roomSize = 0;

    this.updateSrc = async () => {
      if (!this.targetEl.parentNode) return; // If removed
      const mediaLoader = this.targetEl.components["media-loader"].data;
      const src = (this.src = (mediaLoader.mediaOptions && mediaLoader.mediaOptions.href) || mediaLoader.src);
      const visible = src && guessContentType(src) !== "video/vnd.hubs-webrtc";
      const mayChangeScene = this.el.sceneEl.systems.permissions.canOrWillIfCreator("update_hub");

      this.el.object3D.visible = !!visible;

      if (visible) {
        let label = " Link öffnen ";
        if (!this.data.onlyOpenLink) {
          if (await isLocalHubsAvatarUrl(src)) {
            label = " Avatar verwenden ";
          } else if ((await isLocalHubsSceneUrl(src)) && mayChangeScene) {
            label = " Szene wechseln ";
          } else if (await isHubsRoomUrl(src)) {
            const url = new URL(this.src);
            if (url.hash && window.location.pathname === url.pathname) {
              label = " Betreten ";
            } else {
              label = " Raum betreten ";

              this.roomSizeSubscription = window.setInterval(function(){
                this.updateLabel();
              }.bind(this), UPDATE_INTERVAL);            
            }
          }
        }
        this.label.setAttribute("text", "value:"+label);

      }
    };

    this.onClick = async () => {
      const mayChangeScene = this.el.sceneEl.systems.permissions.canOrWillIfCreator("update_hub");

      const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => {}, true);

      if (this.data.onlyOpenLink) {
        await exitImmersive();
        window.open(this.src);
      } else if (await isLocalHubsAvatarUrl(this.src)) {
        const avatarId = new URL(this.src).pathname.split("/").pop();
        window.APP.store.update({ profile: { avatarId } });
        this.el.sceneEl.emit("avatar_updated");
      } else if ((await isLocalHubsSceneUrl(this.src)) && mayChangeScene) {
        this.el.sceneEl.emit("scene_media_selected", this.src);
      } else if (await isHubsRoomUrl(this.src)) {
        await exitImmersive();
        location.href = this.src;
      } else {
        await exitImmersive();
        window.open(this.src);
      }
    };

    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      this.targetEl = networkedEl;
      this.targetEl.addEventListener("media_resolved", this.updateSrc, { once: true });
      this.updateSrc();
    });
  },

  play() {
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  pause() {
    this.el.object3D.removeEventListener("interact", this.onClick);
  },

  async updateLabel()
  {
    let response = await fetch(BUTTON_DATA_REQUEST);
    
    response.json().then(json=>{
      let entries = json.entries;
      let isEntryFound = false;

      for(let i = 0; i<entries.length; i++)
      {
        let entry = entries[i];
        
        if(entry.url == this.src)
        {
          isEntryFound = true;
          this.numberOfCurrentUsers = entry.member_count;
          this.roomSize = entry.room_size;

          var labelText = " Raum betreten \n ("+this.numberOfCurrentUsers+"/"+this.roomSize+")";
          this.label.setAttribute("text", "value:"+labelText);
          break;
        }
      }

      if(!isEntryFound)
      {
        clearInterval(this.roomSizeSubscription) //use this to cancel update
      }      
    })
  }
});


