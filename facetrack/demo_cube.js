"use strict";const SETTINGS={rotationOffsetX:0,cameraFOV:40,pivotOffsetYZ:[0.2,0.2],detectionThreshold:0.5,detectionHysteresis:0.1,scale:1};let THREEVIDEOTEXTURE=null,THREERENDERER=null,THREEFACEOBJ3D=null,THREEFACEOBJ3DPIVOTED=null,THREESCENE=null,THREECAMERA=null,AFRAMEINSTANCE=null;let ISDETECTED=false,ISLOADED=false;function detect_callback(isDetected){if(isDetected){console.log('INFO in detect_callback(): DETECTED');}else{console.log('INFO in detect_callback(): LOST');}}
function extract_threeChildrenWithId(id,threeElt){if(typeof(threeElt)==='undefined')return false;if(!threeElt||!threeElt.type)return false;if(threeElt.el&&threeElt.el.id===id)return[threeElt];if(!threeElt.children||threeElt.children.length===0)return false;let r=[];threeElt.children.forEach(function(threeChild){const zou=extract_threeChildrenWithId(id,threeChild);if(zou&&zou.length){r=r.concat(zou);}});return r;}
function init_aFrame(spec){AFRAMEINSTANCE=startAframe({context:spec.GL,canvas:spec.canvasElement});THREERENDERER=AFRAMEINSTANCE.renderer;init_threeScene(spec);}
function init_threeScene(spec){THREEFACEOBJ3D=new THREE.Object3D();THREEFACEOBJ3D.frustumCulled=false;THREEFACEOBJ3DPIVOTED=new THREE.Object3D();THREEFACEOBJ3DPIVOTED.frustumCulled=false;THREEFACEOBJ3DPIVOTED.position.set(0,-SETTINGS.pivotOffsetYZ[0],-SETTINGS.pivotOffsetYZ[1]);THREEFACEOBJ3DPIVOTED.scale.set(SETTINGS.scale,SETTINGS.scale,SETTINGS.scale);THREEFACEOBJ3D.add(THREEFACEOBJ3DPIVOTED);THREESCENE=AFRAMEINSTANCE.object3D;THREESCENE.add(THREEFACEOBJ3D);const threeFaceFollowers=extract_threeChildrenWithId('jeelizFaceFilterFollow',THREESCENE);if(!threeFaceFollowers||!threeFaceFollowers.length){alert('No element with id = jeelizFaceFilterFollow has been found in the A-Frame scene. You should have at least one. Otherwise none of your stuffs will follow the head');}else{threeFaceFollowers.forEach(function(threeStuff){THREEFACEOBJ3DPIVOTED.add(threeStuff);})}
THREEVIDEOTEXTURE=new THREE.DataTexture(new Uint8Array([255,0,0]),1,1,THREE.RGBFormat);THREEVIDEOTEXTURE.needsUpdate=true;const videoMaterial=new THREE.RawShaderMaterial({depthWrite:false,vertexShader:"attribute vec2 position;\n\
      varying vec2 vUV;\n\
      void main(void){\n\
        gl_Position=vec4(position, 1., 1.);\n\
        vUV=0.5+0.5*position;\n\
      }",fragmentShader:"precision lowp float;\n\
      uniform sampler2D samplerVideo;\n\
      varying vec2 vUV;\n\
      void main(void){\n\
        gl_FragColor=texture2D(samplerVideo, vUV);\n\
      }",uniforms:{samplerVideo:{value:THREEVIDEOTEXTURE}}});const videoGeometry=new THREE.BufferGeometry()
const videoScreenCorners=new Float32Array([-1,-1,1,-1,1,1,-1,1]);videoGeometry.addAttribute('position',new THREE.BufferAttribute(videoScreenCorners,2));videoGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2,0,2,3]),1));const videoMesh=new THREE.Mesh(videoGeometry,videoMaterial);videoMesh.onAfterRender=function(){THREERENDERER.properties.update(THREEVIDEOTEXTURE,'__webglTexture',spec.videoTexture);delete(videoMesh.onAfterRender);};videoMesh.frustumCulled=false;THREESCENE.add(videoMesh);const aspecRatio=spec.canvasElement.width/spec.canvasElement.height;THREECAMERA=new THREE.PerspectiveCamera(SETTINGS.cameraFOV,aspecRatio,0.1,100);AFRAMEINSTANCE.camera=THREECAMERA;ISLOADED=true;}
function main(){JEEFACEFILTERAPI.init({canvasId:'jeeFaceFilterCanvas',NNCpath:'../../../dist/',callbackReady:function(errCode,spec){if(errCode){console.log('AN ERROR HAPPENS. SORRY BRO :( . ERR =',errCode);return;}
console.log('INFO: JEEFACEFILTERAPI IS READY');init_aFrame(spec);},callbackTrack:function(detectState){if(!ISLOADED){return;}
if(ISDETECTED&&detectState.detected<SETTINGS.detectionThreshold-SETTINGS.detectionHysteresis){detect_callback(false);ISDETECTED=false;}else if(!ISDETECTED&&detectState.detected>SETTINGS.detectionThreshold+SETTINGS.detectionHysteresis){detect_callback(true);ISDETECTED=true;}
if(ISDETECTED){const tanFOV=Math.tan(THREECAMERA.aspect*THREECAMERA.fov*Math.PI/360);const W=detectState.s;const D=1/(2*W*tanFOV);const xv=detectState.x;const yv=detectState.y;const z=-D-0.5;const x=xv*D*tanFOV;const y=yv*D*tanFOV/THREECAMERA.aspect;THREEFACEOBJ3D.position.set(x,y+SETTINGS.pivotOffsetYZ[0],z+SETTINGS.pivotOffsetYZ[1]);THREEFACEOBJ3D.rotation.set(detectState.rx+SETTINGS.rotationOffsetX,detectState.ry,detectState.rz,"XYZ");}
THREERENDERER.state.reset();THREERENDERER.render(THREESCENE,THREECAMERA);}});}
