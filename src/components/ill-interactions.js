AFRAME.registerComponent('ill-interactions', {
    schema: {
        isTest: {type: "boolean", default: true}

      },
      init: function () {
      // This will be called after the entity has properly attached and loaded.
      console.log('----------I am ready!', this.data.isTest, this.el.localName);
    },
  });