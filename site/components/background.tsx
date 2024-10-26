import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Particles from "@/components/magicui/particles";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Spline curve points
const curvePath = [
  10.136184463414924, -1.374508746897471, 10.384881573913269,
  9.1152593889854714, -1.374508746897471, 8.5846792797570011,
  9.0669355709754882, -1.0665123466336568, 5.8937771631608156,
  10.151040177840205, -0.65913653144937956, 3.4340491740541346,
  10.806779203170416, 1.8859391007298545, 0.46855774212986023,
  10.761433540147586, 2.8724172201359197, -1.2811838605587311,
  9.6195923104445065, 2.8724172201359197, -3.2833099941904766,
  6.9763020889151646, 2.7659257976905427, -4.7591958908830172,
  6.0461277891353697, 1.0727045302089879, -6.6638740164090482,
  7.3472235778544794, -1.8228856326635698, -9.0685043046185623,
  7.226367212900791, -1.8228856326635698, -10.499536640855691,
  5.8354566696263914, -1.8228856326635698, -12.039219379199908,
  3.6532357452141353, -0.20463983570573391, -13.87695442281038,
  -0.30169589630131455, 1.5965000671484342, -14.879986418947327,
  -2.8925694230502157, 2.2971364614427481, -13.892095587598131,
  -4.537672295357936, 4.5863515759659208, -12.140831652074551,
  -6.1287913464117594, 5.9653814634119815, -8.9776527318875896,
  -6.0120301606452813, 4.4081161943855998, -6.712084358394045,
  -5.2138252159038974, 2.820894808418279, -4.4532820412085607,
  -2.3424712835109611, 2.2032065005086259, -3.0788773693500198,
  -0.0076956453915433265, 1.8931797788880202, -1.6577070662471063,
  -0.24767503988481437, 2.8845808465856684, 0.073915859214221724,
  -2.2174044353598896, 4.2415524507318576, 2.215992718290742,
  -3.4526531678364756, 3.0615192023340851, 4.7922404932096558,
  -3.7356278971556445, 1.4054080369354316, 7.8432021841434629,
  -3.4003734463804118, 1.1924069108769393, 9.2464090886227073,
  -1.8851803760476225, 1.5269331003449989, 10.306083896408374,
  0.01071077144031829, 2.1101821577522295, 10.490880699847727,
  0.42562058195647001, 2.2759939598834387, 11.613129436580291,
  0.096405262182225115, 0.032317784084054391, 16.223455375061565,
  2.3458797884520433, 0.38907275257695584, 19.91188266079584,
  5.7018400098488771, 1.73337964747396, 20.615481586999959, 7.9720939736751824,
  1.73337964747396, 19.303399329816457, 9.8672362721095652,
  0.090083018057025177, 16.893338541618121, 11.225959519544134,
  -1.374508746897471, 14.279002555560753, 11.288646925965876,
  -1.374508746897471, 11.926359497447137, 10.136184463414924,
  -1.374508746897471, 10.384881573913269,
];

const createSpline = () => {
  const points: THREE.Vector3[] = [];
  const len = curvePath.length;
  for (let p = 0; p < len; p += 3) {
    points.push(
      new THREE.Vector3(curvePath[p], curvePath[p + 1], curvePath[p + 2])
    );
  }
  return new THREE.CatmullRomCurve3(points);
};

const Tunnel: React.FC<{}> = ({}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    composer: EffectComposer;
    controls: OrbitControls;
    animationFrameId?: number;
  }>();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.4);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.0,
      0.5,
      100
    );
    bloomPass.threshold = 0.001;
    bloomPass.strength = 4.5;
    bloomPass.radius = 0.5;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const spline = createSpline();
    const tubeGeo = new THREE.TubeGeometry(spline, 200, 0.9, 16, true);
    const edges = new THREE.EdgesGeometry(tubeGeo, 0.25);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.2,
    });
    const tubeLines = new THREE.LineSegments(edges, lineMat);
    scene.add(tubeLines);

    const updateCamera = (time: number) => {
      const looptime = 50 * 1000;
      const p = ((time * 0.04) % looptime) / looptime;
      const pos = tubeGeo.parameters.path.getPointAt(p);
      const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.02) % 1);
      camera.position.copy(pos);
      camera.lookAt(lookAt);
    };

    const animate = (time = 0) => {
      const animationFrameId = requestAnimationFrame(animate);
      updateCamera(time);
      renderer.render(scene, camera);
      composer.render();
      controls.update();

      sceneRef.current!.animationFrameId = animationFrameId;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      composer,
      controls,
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (sceneRef.current?.animationFrameId) {
        cancelAnimationFrame(sceneRef.current.animationFrameId);
      }
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
};

interface BackgroundProps {
  showModal?: boolean;
}

const Background: React.FC<BackgroundProps> = ({ showModal = false }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setOpacity((prev) => Math.min(prev + 1.5, 35));
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      {showModal && (
        <div className="absolute inset-0 animate-tunnel-fade">
          <Tunnel />
        </div>
      )}
      <Particles
        className="absolute inset-0 pointer-events-none"
        quantity={500}
        staticity={60}
        ease={70}
        size={0.03}
        color="#fde68a"
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: opacity / 100 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-500/20 to-amber-400/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/20 to-amber-400/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-amber-500/30 to-transparent" />
        <div className="absolute inset-[10%] bg-amber-400/10 blur-3xl" />
      </div>
    </div>
  );
};

export default Background;
