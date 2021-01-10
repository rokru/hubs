import * as moment from "moment";
import {
  THREE
} from "aframe";
const digitLines = require("./digital-clock-lines.json");

const DIGIT_DISTANCE = 0.4;
const DIGIT_GROUP_DISTANCE = 3.2;
const DIGIT_WIDTH = 0.5;
const CLOCK_SCALE = 0.3;
const CLOCK_POSITION = {
  x: 0,
  y: 2.3,
  z: 0
};
// const CLOCK_POSITION = { x: 0, y: 0, z: 0 };
const CLOCK_ROTATION = Math.PI / 2; // In radians
const BACKGROUND_COLOR = "black";
const DIGIT_COLOR = "red";

/*
Made by: https://github.com/kallekj, inspired by https://github.com/aelatgt/custom-hubs-template/commit/9835c36de78f8f33a1cfb643095b708850143197 

This code will render a digital clock, use the constants above to change the position etc of the clock.

Everything is ordered in groups as follows:
- clockGroup
|- secGroup
| |- secGroupLow
| |- secGroupHigh
|- minGroup
| |- minGroupLow
| |- minGroupHigh
|- hourGroup
| |- hourGroupLow
| |- hourGroupHigh

clockGroup is used to position the clock.

This code uses the moment library for time data, you need to add it to your dependency list in package.json and install it, see: https://momentjs.com/docs/

TODO:
  * Make it spawn on an object placed in Spoke for better user experience.
  * Reduce the number of vertecies in digital-clock-lines.json, I think you should be able to draw every digit with 4 triangles instead of 6.
  * Change THREE.Line to THREE.MeshLine from https://github.com/spite/THREE.MeshLine
  * Remove redundant code.

*/

// AFRAME.registerSystem("digital-clock", {
AFRAME.registerComponent("digital-clock", {
  init: function () {
    console.log("Digital Clock: Init...")
    const clockGroup = new THREE.Group();
    clockGroup.position.set(CLOCK_POSITION["x"], CLOCK_POSITION["y"], CLOCK_POSITION["z"]);
    clockGroup.rotateY(CLOCK_ROTATION);
    clockGroup.scale.set(CLOCK_SCALE, CLOCK_SCALE, CLOCK_SCALE);

    const clockGeometry = new THREE.PlaneGeometry(
      6 * DIGIT_WIDTH + DIGIT_GROUP_DISTANCE * 2 + (DIGIT_DISTANCE * 3) / 2,
      3,
      1
    );
    const clockMaterial = new THREE.MeshBasicMaterial({
      color: BACKGROUND_COLOR
    });
    const clockFrame = new THREE.Mesh(clockGeometry, clockMaterial);
    clockFrame.position.set(0, 0, -0.02);
    clockGroup.add(clockFrame);

    const secGroup = new THREE.Group();
    secGroup.position.set(DIGIT_GROUP_DISTANCE, 0, 0);
    const secGroupLow = new THREE.Group();
    secGroupLow.position.set(1 + DIGIT_DISTANCE, 0, 0);
    const secGroupHigh = new THREE.Group();
    secGroupHigh.position.set(-1 - DIGIT_DISTANCE, 0, 0);
    secGroup.add(secGroupLow);
    secGroup.add(secGroupHigh);
    secGroup.scale.set(DIGIT_WIDTH, 1, 1);

    const minGroup = new THREE.Group();
    minGroup.position.set(0, 0, 0);
    const minGroupLow = new THREE.Group();
    minGroupLow.position.set(1 + DIGIT_DISTANCE, 0, 0);
    const minGroupHigh = new THREE.Group();
    minGroupHigh.position.set(-1 - DIGIT_DISTANCE, 0, 0);
    minGroup.add(minGroupLow);
    minGroup.add(minGroupHigh);
    minGroup.scale.set(DIGIT_WIDTH, 1, 1);

    const hourGroup = new THREE.Group();
    hourGroup.position.set(-DIGIT_GROUP_DISTANCE, 0, 0);
    const hourGroupLow = new THREE.Group();
    hourGroupLow.position.set(1 + DIGIT_DISTANCE, 0, 0);
    const hourGroupHigh = new THREE.Group();
    hourGroupHigh.position.set(-1 - DIGIT_DISTANCE, 0, 0);
    hourGroup.add(hourGroupLow);
    hourGroup.add(hourGroupHigh);
    hourGroup.scale.set(DIGIT_WIDTH, 1, 1);

    const digitMat = new THREE.LineBasicMaterial({
      color: DIGIT_COLOR
    });

    const secPsLow = new Float32Array(digitLines["0"]);
    const secGeoLow = new THREE.BufferGeometry().setFromPoints(secPsLow);
    secGeoLow.addAttribute("position", new THREE.BufferAttribute(secPsLow, 3));
    const secondLow = (this.secondLow = new THREE.Line(secGeoLow, digitMat));
    secGroupLow.add(secondLow);

    const secPsHigh = new Float32Array(digitLines["0"]);
    const secGeoHigh = new THREE.BufferGeometry().setFromPoints(secPsHigh);
    secGeoHigh.addAttribute("position", new THREE.BufferAttribute(secPsHigh, 3));
    const secondHigh = (this.secondHigh = new THREE.Line(secGeoHigh, digitMat));
    secGroupHigh.add(secondHigh);

    const minPsLow = new Float32Array(digitLines["0"]);
    const minGeoLow = new THREE.BufferGeometry().setFromPoints(minPsLow);
    minGeoLow.addAttribute("position", new THREE.BufferAttribute(minPsLow, 3));
    const minuitLow = (this.minuitLow = new THREE.Line(minGeoLow, digitMat));
    minGroupLow.add(minuitLow);

    const minPsHigh = new Float32Array(digitLines["0"]);
    const minGeoHigh = new THREE.BufferGeometry().setFromPoints(minPsHigh);
    minGeoHigh.addAttribute("position", new THREE.BufferAttribute(minPsHigh, 3));
    const minuitHigh = (this.minuitHigh = new THREE.Line(minGeoHigh, digitMat));
    minGroupHigh.add(minuitHigh);

    const hourPsLow = new Float32Array(digitLines["0"]);
    const hourGeoLow = new THREE.BufferGeometry().setFromPoints(hourPsLow);
    hourGeoLow.addAttribute("position", new THREE.BufferAttribute(hourPsLow, 3));
    const hourLow = (this.hourLow = new THREE.Line(hourGeoLow, digitMat));
    hourGroupLow.add(hourLow);

    const hourPsHigh = new Float32Array(digitLines["0"]);
    const hourGeoHigh = new THREE.BufferGeometry().setFromPoints(hourPsHigh);
    hourGeoHigh.addAttribute("position", new THREE.BufferAttribute(hourPsHigh, 3));
    const hourHigh = (this.hourHigh = new THREE.Line(hourGeoHigh, digitMat));
    hourGroupHigh.add(hourHigh);

    clockGroup.add(secGroup);
    clockGroup.add(minGroup);
    clockGroup.add(hourGroup);
    this.el.object3D.add(clockGroup);
  },

  tick() {
    const s = moment()
      .zone("Europe/Stockholm")
      .second();
    const m = moment()
      .zone("Europe/Stockholm")
      .minute();
    const h = moment()
      .zone("Europe/Stockholm")
      .hour();
    this.updateSec(s);
    this.secondLow.geometry.attributes.position.needsUpdate = true;
    this.secondHigh.geometry.attributes.position.needsUpdate = true;
    this.updateMin(m);
    this.minuitLow.geometry.attributes.position.needsUpdate = true;
    this.minuitHigh.geometry.attributes.position.needsUpdate = true;
    this.updateHour(h);
    this.hourLow.geometry.attributes.position.needsUpdate = true;
    this.hourHigh.geometry.attributes.position.needsUpdate = true;
    console.log("Digital-Clock Tick");
  },
  updateSec(s) {
    const sLow = s % 10;
    const sHigh = Math.floor(s / 10);
    const posLow = this.secondLow.geometry.attributes.position.array;
    const posHigh = this.secondHigh.geometry.attributes.position.array;
    const newPointsLow = new Float32Array(digitLines[sLow.toString()]);
    const newPointsHigh = new Float32Array(digitLines[sHigh.toString()]);
    for (let i = 0; i < posLow.length; i++) {
      posLow[i] = newPointsLow[i];
      posHigh[i] = newPointsHigh[i];
    }
  },
  updateMin(m) {
    const mLow = m % 10;
    const mHigh = Math.floor(m / 10);
    const posLow = this.minuitLow.geometry.attributes.position.array;
    const posHigh = this.minuitHigh.geometry.attributes.position.array;
    const newPointsLow = new Float32Array(digitLines[mLow.toString()]);
    const newPointsHigh = new Float32Array(digitLines[mHigh.toString()]);
    for (let i = 0; i < posLow.length; i++) {
      posLow[i] = newPointsLow[i];
      posHigh[i] = newPointsHigh[i];
    }
  },
  updateHour(h) {
    const hLow = h % 10;
    const hHigh = Math.floor(h / 10);
    const posLow = this.hourLow.geometry.attributes.position.array;
    const posHigh = this.hourHigh.geometry.attributes.position.array;
    const newPointsLow = new Float32Array(digitLines[hLow.toString()]);
    const newPointsHigh = new Float32Array(digitLines[hHigh.toString()]);
    for (let i = 0; i < posLow.length; i++) {
      posLow[i] = newPointsLow[i];
      posHigh[i] = newPointsHigh[i];
    }
  }
});