import { cloneMedia } from "../utils/media-utils";
import { guessContentType } from "../utils/media-url-utils";
import InWorldChatBox from "../react-components/in-world-chat-box.js";

AFRAME.registerComponent("change-link-button", {
  schema:{
    linkedURL: { default: "" },    
  },
  init: function() {
    this.updateSrc = () => {
      if (!this.targetEl.parentNode) return; // If removed
      const src = (this.src = this.targetEl.components["media-loader"].data.src);
      const visible = src && guessContentType(src) !== "video/vnd.hubs-webrtc";
      this.el.object3D.visible = !!visible;
    };

    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      this.targetEl = networkedEl;
      this.targetEl.addEventListener("media_resolved", this.updateSrc, { once: true });
      this.updateSrc();
    });

    this.onClick = () => {
      
      this.targetEl.setAttribute("customLink", InWorldChatBox.inputMessage);
      
      if(InWorldChatBox.inputMessage)
      {
        console.log("change link button click withMessage");
        this.targetEl.setAttribute("hover-menu__link", { template: "#link-hover-menu", isFlat: true });
      }
      else
      {
        console.log("change link button click noMessage");
        this.targetEl.setAttribute("hover-menu", { template: "#empty-hover-menu"});
      }
      
      
      
      
      InWorldChatBox.inputMessage = "";
    };
  },
  tick: function()
  {

  }, 

  play() {
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  pause() {
    this.el.object3D.removeEventListener("interact", this.onClick);
  }
});
