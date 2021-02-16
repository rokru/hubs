AFRAME.registerComponent('custom-link', {
  dependencies:[],  
  schema: {
        link: {type: "string", default: ""},
      },
      init: function () {
      },
      set: function(newLink)
      {
        this.data.link = newLink;
        this.updateUI();
      },
      getLink: function()
      {
        if(this.data.link != "")
        {
          return "http://"+this.data.link;
        }
        else{
          return "";
        }
      },
      updateUI: function()
      {
        if(this.data.link)
      {
        this.el.setAttribute("hover-menu__link", { template: "#link-hover-menu", isFlat: true });
      }
      else
      {
        this.el.setAttribute("hover-menu", { template: "#empty-hover-menu"});
      } 
      }
  });