import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const treeData = {
  name: 'CEO',
  color: 'red',
  children: [
    {
      name: 'Manager 1',
      color: 'green',
      children: [
        { name: 'Employee 1', color: 'Orange' , children:[{ name: 'Sub Employee 3', color: 'yellow' , children:[]}]},
        { name: 'Employee 2', color: 'blue' , children:[{ name: 'Sub Employee 4', color: 'yellow' , children:[]}]},
      ],
    }
  ],
};

const OrgTree = () => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 10;

    function createNode(data, onClick) {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: data.color });
      const node = new THREE.Mesh(geometry, material);
      node.userData = data;
      node.visible = false;
      node.callback = onClick;
      return node;
    }
    function createLine(start, end) {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        return new THREE.Line(geometry, material);
      }
      function buildOrgTree(data, parent, onClick, level = 0, index = 0) {
        console.log(level,index)
        
        const node = createNode(data, onClick);
        parent.add(node);
        node.position.set(0, -2 * level, 2 * index - level);
         console.log()

        if (data.children) {
          node.visible = true;
          data.children.forEach((child, i) => {
           
            const childNode = buildOrgTree(child, node, onClick, level + 1, i);
            const line = createLine(parent.position, childNode.position);
            node.add(line);
          });
        }
      
        return node;
      }
      

    function onNodeClick(node) {
      node.children.forEach((child) => {
        child.visible = !child.visible;
      });
    }

    buildOrgTree(treeData, scene, onNodeClick);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onMouseClick(event) {
      mouse.x = (event.clientX / width) * 2 - 1;
      mouse.y = -(event.clientY / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const node = intersects[0].object;
        if (node.callback) {
          node.callback(node);
        }
      }
    }

    window.addEventListener('click', onMouseClick, false);

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    function onWindowResize() {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', onWindowResize, false);

    return () => {
      window.removeEventListener('click', onMouseClick, false);
      window.removeEventListener('resize', onWindowResize, false);
    };
  }, [containerRef]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'block',
      }}
    />
  );
};

export default OrgTree;

