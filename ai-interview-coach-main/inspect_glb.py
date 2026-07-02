import struct
import json
import sys
import os

file_path = r'c:\Users\ADMIN\Downloads\ai interview coach\ai-interview-coach-main\frontend\public\models\Hitem3d-1781792382042.glb'

if not os.path.exists(file_path):
    print("File not found")
    sys.exit(1)

with open(file_path, 'rb') as f:
    magic = f.read(4)
    if magic != b'glTF':
        print('Not a valid GLB file')
        sys.exit(1)
    version, length = struct.unpack('<II', f.read(8))
    chunk0_length, chunk0_type = struct.unpack('<II', f.read(8))
    if chunk0_type != 0x4E4F534A:
        print('Chunk 0 is not JSON')
        sys.exit(1)
    json_data = f.read(chunk0_length).decode('utf-8')
    gltf = json.loads(json_data)
    
    meshes = gltf.get('meshes', [])
    nodes = gltf.get('nodes', [])
    animations = gltf.get('animations', [])
    skins = gltf.get('skins', [])
    
    print('--- MESHES ---')
    print(f'Total meshes: {len(meshes)}')
    
    morph_targets_list = set()
    for i, m in enumerate(meshes):
        prims = m.get('primitives', [])
        target_names = m.get('extras', {}).get('targetNames', [])
        if target_names:
            morph_targets_list.update(target_names)

    # If targets are not in extras, maybe they are just weights but we can't get names easily unless we check accessor extras
    
    print('\n--- BONES ---')
    joints = set()
    for skin in skins:
        joints.update(skin.get('joints', []))
    print(f'Total bones (joints): {len(joints)}')
    
    bone_names = []
    for j in joints:
        bone_names.append(nodes[j].get('name', f'Node_{j}'))
    
    def check_bone(pattern):
        return [n for n in bone_names if pattern in n.lower()]
    
    print(f"Spine: {check_bone('spine')}")
    print(f"Neck: {check_bone('neck')}")
    print(f"Head: {check_bone('head')}")
    print(f"Arm: {check_bone('arm')}")
    print(f"Hand: {check_bone('hand')}")
    print(f"Finger: {check_bone('finger')}")
    print(f"Jaw: {check_bone('jaw')}")
    print(f"Eye: {check_bone('eye')}")
    print(f"Lip: {check_bone('lip')}")
    
    print('\n--- ANIMATIONS ---')
    print(f'Total animations: {len(animations)}')
    for a in animations:
        print(f"- {a.get('name', 'Unnamed')}")

    print('\n--- BLENDSHAPES / MORPH TARGETS ---')
    print(f'Morph targets found: {list(morph_targets_list)}')

