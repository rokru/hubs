export const ACTIONS ={
  MEGAPHONE: "megaphone",
  TELEPORT: "teleport",
  SWITCH_VISIBLITY: "switch visibility",  
  CHANGE_ROOM: "Change Room",
  NONE: "None",
};

AFRAME.registerComponent("action-button", {
  schema: {
    isInitialized: {default: false},
    textElement: {default: null},
    textLabel: { default:""},
    avatar: { default: "" },
    buttonType: { default: ACTIONS.NONE },
    buttonStatus: { default: false },
    isSwitchButton: {default: false},
    newRoomUrl: { default: "" },
    target: { default: "" },
  },
  init() {
    this.el.sceneEl.addEventListener('model-loaded', ()=>{
      if(!this.isInitialized)
      {
        this.isInitialized = true;
        this.initVariables();
        this.initButtonText();
      }
    });
  },
  initVariables()
  {
    this.data.textElement = this.el.querySelector("[text]");
    this.data.target = this.data.target.replaceAll(" ", "_");
    this.data.target = this.data.target ? document.querySelector("."+this.data.target): "";
    
    this.data.avatar = document.querySelector("#avatar-rig");

    switch(this.data.buttonType)
      {
        case ACTIONS.TELEPORT:
          break;
        case ACTIONS.MEGAPHONE:
          break;
        case ACTIONS.SWITCH_VISIBLITY:
          this.data.buttonStatus = this.data.target.object3D.visible;
          break; 
        case ACTIONS.CHANGE_ROOM:
          break; 
        case ACTIONS.NONE:
          break; 
      }
  },
  initButtonText()
  {
    let text = (this.data.textLabel? (this.data.textLabel+"\n "):"")+ (this.data.buttonStatus?"Aus":"An");
    this.data.textElement.setAttribute("text", "value:"+text);
   },
  play() {
    this.el.object3D.addEventListener("interact", this.onButtonPressed.bind(this));
  },
  pause() {
    this.el.object3D.removeEventListener("interact", this.onButtonPressed.bind(this));
  },
  onButtonPressed()
  {
    try
    { 
      if(this.data.isSwitchButton)
      {
        this.data.buttonStatus = !this.data.buttonStatus;
      }

      this.initButtonText();
  
      switch(this.data.buttonType)
      {
        case ACTIONS.TELEPORT:
          this.teleport();
          break;
        case ACTIONS.MEGAPHONE:
          this.changeMegaphone(this.data.buttonStatus);
          break;
        case ACTIONS.SWITCH_VISIBLITY	:
          this.changeVisibility(this.data.buttonStatus);
          break; 
        case ACTIONS.CHANGE_ROOM	:
          this.enterNewRoom();
          break; 
        case ACTIONS.NONE	:
          break; 
      }
    }
    catch(error)
    {
      console.error(error);
    }
  },
  teleport: function()
  {
    let isInstant = true;
    
    this.el.sceneEl.systems["hubs-systems"].characterController.enqueueWaypointTravelTo(
      this.data.target.object3D.matrixWorld,
      isInstant,
      {willDisableMotion: false}
    );
  },
  changeMegaphone: function(isActivated)
  {
    this.data.avatar.setAttribute("ismegaphone",isActivated);
  },
  enterNewRoom: function()
  {
    if(this.data.newRoomUrl != "" && this.data.newRoomUrl != null)
    {
      window.open(this.data.newRoomUrl,"_self");
    }
  },
  changeVisibility: function(isVisible)
  {
    if(this.data.target == "")
    {
      return;
    }
    
    this.data.target.setAttribute("visible", isVisible);
  },
});


