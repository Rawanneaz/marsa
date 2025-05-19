import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import * as THREE from 'three';
import { PositionService } from '../services/position.service';
import { CommonModule } from '@angular/common';
import { OrbitControls } from 'three-orbitcontrols-ts';
import {ParkingService} from '../services/parking.service';

interface ParkingSpotUserData {
  id: string;
  niveau: number;
  x: number;
  y: number;
  statut: string;
  vehiculeId?: number;
  vehiculeNumeroIdentification?: string;
}

interface CarUserData {
  isCar: boolean;
  position: any;
}

class ParkingSpot extends THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> {
  override userData: ParkingSpotUserData;

  constructor(geometry?: THREE.BoxGeometry, material?: THREE.MeshStandardMaterial) {
    super(geometry, material);
    this.userData = {
      id: '',
      niveau: 0,
      x: 0,
      y: 0,
      statut: 'DISPONIBLE'
    };
  }
}

@Component({
  selector: 'app-parking-3d',
  templateUrl: './parking-3d-visualization.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./parking-3d-visualization.component.css']
})
export class Parking3dComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private spots: ParkingSpot[] = [];
  private levelGroups: THREE.Group[] = [];
  private refreshInterval: any;

  selectedPosition: {
    id?: string;
    niveau?: number;
    x?: number;
    y?: number;
    statut?: string;
    vehiculeId?: number;
    vehiculeNumeroIdentification?: string;
  } | null = null;

  constructor(
    private positionService: PositionService,
    private parkingService: ParkingService // Add this service

  ) {}

  ngOnInit(): void {
    // Set up periodic refresh to ensure positions are always up to date
    this.refreshInterval = setInterval(() => {
      this.refreshParkingData();
    }, 30000);
    this.parkingService.positionHighlight$.subscribe(positionId => {
      if (positionId) {
        this.highlightAssignedPosition(positionId);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.createParkingLevels();
    this.loadParkingData();
    this.setupEventListeners();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.getContainerWidth() / this.getContainerHeight(),
      0.1,
      1000
    );
    this.camera.position.set(50, 25, 30);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.resizeRenderer();
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    (this.controls as any).screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2;

    // Improved lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-1, 1, -1);
    this.scene.add(directionalLight2);

    // Add level indicators
    this.addLevelIndicators();

    this.animate();
  }

  private getContainerWidth(): number {
    return this.rendererContainer?.nativeElement?.offsetWidth || window.innerWidth * 0.75;
  }

  private getContainerHeight(): number {
    return this.rendererContainer?.nativeElement?.offsetHeight || window.innerHeight * 0.8;
  }

  private resizeRenderer(): void {
    this.renderer.setSize(this.getContainerWidth(), this.getContainerHeight());
  }

  private addLevelIndicators(): void {
    const levels = 4;
    const levelSpacing = 30; // Increased spacing between levels

    for (let i = 0; i < levels; i++) {
      // Create level number
      const levelText = this.createTextLabel(`Niveau ${i+1}`, 0xffffff);
      levelText.position.set(i * levelSpacing, 0.5, -15);
      this.scene.add(levelText);
    }
  }

  private createTextLabel(text: string, backgroundColor: number): THREE.Mesh {
    // Create a canvas for the text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 128;
    canvas.height = 64;

    // Fill background
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = '24px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);

    // Create material using the texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    // Create plane mesh with the material
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), material);
    return mesh;
  }

  private createParkingLevels(): void {
    const levels = 4;
    const levelSpacing = 30; // Increased spacing between levels

    for (let level = 1; level <= levels; level++) {
      const levelGroup = new THREE.Group();
      // Position levels horizontally next to each other
      levelGroup.position.x = (level - 1) * levelSpacing;
      this.levelGroups.push(levelGroup);

      // Create floor with better coloring
      const floorGeometry = new THREE.PlaneGeometry(25, 40);
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: level % 2 === 0 ? 0xcccccc : 0xdddddd,
        side: THREE.DoubleSide,
        roughness: 0.8
      });

      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      levelGroup.add(floor);

      // Add floor grid for better visual reference
      const gridHelper = new THREE.GridHelper(25, 20, 0x555555, 0x888888);
      gridHelper.position.y = 0.01;
      levelGroup.add(gridHelper);

      // Create parking spots
      for (let x = 1; x <= 10; x++) {
        for (let y = 1; y <= 20; y++) {
          const spotGeometry = new THREE.BoxGeometry(1.8, 0.1, 1.8);
          const spotMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.7
          });

          const spot = new ParkingSpot(spotGeometry, spotMaterial);
          spot.position.set(
            (x - 5.5) * 2.2, // Increased spacing between spots
            0.1,
            (y - 10.5) * 2.0
          );

          spot.userData = {
            id: `${level}-${x}-${y}`,
            niveau: level,
            x: x,
            y: y,
            statut: 'DISPONIBLE'
          };

          this.spots.push(spot);
          levelGroup.add(spot);
        }
      }

      this.scene.add(levelGroup);
    }
  }

  private loadParkingData(): void {
    // First load all positions, not just available ones
    this.positionService.getAllPositions().subscribe({
      next: positions => {
        console.log('Loaded all parking positions:', positions);
        this.updateParkingSpots(positions);
      },
      error: err => {
        console.error('Error loading all parking data:', err);

        // Fallback to available positions if getAllPositions fails or doesn't exist
        this.positionService.getAvailablePositions().subscribe({
          next: availablePositions => {
            console.log('Loaded available parking positions:', availablePositions);
            this.updateParkingSpots(availablePositions);
          },
          error: fallbackErr => {
            console.error('Error loading parking data (fallback):', fallbackErr);
          }
        });
      }
    });
  }

  private updateParkingSpots(positions: any[]): void {
    // Reset all spots to default state
    this.spots.forEach(spot => {
      spot.material.color.setHex(0x00ff00); // Default green

      // Remove any cars
      spot.children = spot.children.filter(child => !(child.userData as CarUserData)?.isCar);

      // Reset user data but keep base info
      const level = spot.userData.niveau;
      const x = spot.userData.x;
      const y = spot.userData.y;
      spot.userData = {
        id: `${level}-${x}-${y}`,
        niveau: level,
        x: x,
        y: y,
        statut: 'DISPONIBLE'
      };
    });

    // Apply server data
    positions.forEach(pos => {
      const spot = this.spots.find(s =>
        s.userData.niveau === pos.niveau &&
        s.userData.x === pos.x &&
        s.userData.y === pos.y
      );

      if (spot) {
        // Update spot with server data
        spot.userData = {
          ...spot.userData,
          id: pos.id?.toString() || `${pos.niveau}-${pos.x}-${pos.y}`,
          statut: pos.statut,
          vehiculeId: pos.vehiculeId,
          vehiculeNumeroIdentification: pos.vehiculeNumeroIdentification
        };

        // Update spot color based on status
        this.updateSpotColor(spot);

        // Add car if the spot is occupied
        if (pos.statut === 'OCCUPEE' && pos.vehiculeId) {
          this.addCarToSpot(spot, pos);
        }
      }
    });

    // Update selected position display if needed
    if (this.selectedPosition) {
      const updated = positions.find(pos =>
        pos.niveau === this.selectedPosition?.niveau &&
        pos.x === this.selectedPosition?.x &&
        pos.y === this.selectedPosition?.y
      );

      if (updated) {
        this.selectedPosition = {
          id: updated.id?.toString() || `${updated.niveau}-${updated.x}-${updated.y}`,
          niveau: updated.niveau,
          x: updated.x,
          y: updated.y,
          statut: updated.statut,
          vehiculeId: updated.vehiculeId,
          vehiculeNumeroIdentification: updated.vehiculeNumeroIdentification
        };
      }
    }
  }

  private updateSpotColor(spot: ParkingSpot): void {
    const material = spot.material;

    switch (spot.userData.statut) {
      case 'OCCUPEE':
        material.color.setHex(0xff0000); // Red
        break;
      case 'RESERVEE':
        material.color.setHex(0xffff00); // Yellow
        break;
      case 'MAINTENANCE':
        material.color.setHex(0x0000ff); // Blue
        break;
      default:
        material.color.setHex(0x00ff00); // Green (available)
    }
  }

  private addCarToSpot(spot: ParkingSpot, position: any): void {
    // Remove existing car if present
    spot.children.forEach(child => {
      if ((child.userData as CarUserData)?.isCar) {
        spot.remove(child);
      }
    });

    const car = new THREE.Group();
    car.userData = { isCar: true, position };

    // Car body - improved design
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x2244aa, metalness: 0.5, roughness: 0.5 })
    );
    body.position.y = 0.4;
    car.add(body);

    // Car cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.3, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.1, roughness: 0.1 })
    );
    cabin.position.y = 0.8;
    car.add(cabin);

    // Add wheels
    this.addWheel(car, 0.6, 0.2, 0.4);
    this.addWheel(car, 0.6, 0.2, -0.4);
    this.addWheel(car, -0.6, 0.2, 0.4);
    this.addWheel(car, -0.6, 0.2, -0.4);

    // Add to spot
    spot.add(car);
  }

  private addWheel(car: THREE.Group, x: number, y: number, z: number): void {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    car.add(wheel);
  }

  private setupEventListeners(): void {
    this.renderer.domElement.addEventListener('click', (event) => this.onCanvasClick(event), false);
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onCanvasClick(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1,
      -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1
    );

    // Set up raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Find intersections
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    // Reset previous selection highlight
    this.spots.forEach(spot => {
      spot.material.emissive.setHex(0x000000);
    });

    if (intersects.length > 0) {
      let clickedObject: THREE.Object3D | null = intersects[0].object;

      // Navigate up the object hierarchy to find the ParkingSpot
      while (clickedObject && !(clickedObject instanceof ParkingSpot)) {
        clickedObject = clickedObject.parent;
      }

      if (clickedObject && clickedObject.userData) {
        // Update selected position
        this.selectedPosition = {
          id: clickedObject.userData.id,
          niveau: clickedObject.userData.niveau,
          x: clickedObject.userData.x,
          y: clickedObject.userData.y,
          statut: clickedObject.userData.statut,
          vehiculeId: clickedObject.userData.vehiculeId,
          vehiculeNumeroIdentification: clickedObject.userData.vehiculeNumeroIdentification
        };

        // Highlight selected spot
        (clickedObject as ParkingSpot).material.emissive.setHex(0x00ffff);
        (clickedObject as ParkingSpot).material.emissiveIntensity = 0.5;
      }
    } else {
      this.selectedPosition = null;
    }
  }

  highlightAssignedPosition(positionId: string): void {
    // Clear previous highlights
    this.spots.forEach(spot => {
      spot.material.emissive.setHex(0x000000);
    });

    // Find and highlight the assigned spot
    const assignedSpot = this.spots.find(spot => spot.userData.id === positionId);
    if (assignedSpot) {
      assignedSpot.material.emissive.setHex(0x00ffff);
      assignedSpot.material.emissiveIntensity = 0.5;

      // Focus camera on the assigned spot
      const levelGroup = assignedSpot.parent as THREE.Group;
      if (levelGroup) {
        // Calculate new camera position to focus on the spot
        const targetPosition = new THREE.Vector3().copy(assignedSpot.position);
        targetPosition.add(levelGroup.position);

        this.camera.position.set(
          targetPosition.x + 10,
          25,
          30
        );

        this.controls.target.copy(targetPosition);
        this.controls.update();
      }

      // Update selected position
      this.selectedPosition = {
        id: assignedSpot.userData.id,
        niveau: assignedSpot.userData.niveau,
        x: assignedSpot.userData.x,
        y: assignedSpot.userData.y,
        statut: assignedSpot.userData.statut,
        vehiculeId: assignedSpot.userData.vehiculeId,
        vehiculeNumeroIdentification: assignedSpot.userData.vehiculeNumeroIdentification
      };
    }
  }

  refreshParkingData(): void {
    // First try to get all positions
    this.positionService.getAllPositions().subscribe({
      next: positions => {
        this.updateParkingSpots(positions);
      },
      error: err => {
        console.error('Error refreshing all parking data:', err);

        // Fallback to available positions
        this.positionService.getAvailablePositions().subscribe({
          next: availablePositions => {
            this.updateParkingSpots(availablePositions);
          },
          error: fallbackErr => {
            console.error('Error refreshing available parking data:', fallbackErr);
          }
        });
      }
    });
  }

  assignRandomPosition(): void {
    if (!this.selectedPosition) return;

    const randomVehicleId = Math.floor(Math.random() * 1000) + 1;

    // Call service to assign position
    this.positionService.assignPosition(randomVehicleId).subscribe({
      next: (assignedPosition) => {
        // Refresh data to ensure all spots are updated
        this.refreshParkingData();

        // Highlight the newly assigned position
        this.highlightAssignedPosition(
          assignedPosition.id?.toString() ||
          `${assignedPosition.niveau}-${assignedPosition.x}-${assignedPosition.y}`
        );
      },
      error: (err) => {
        console.error('Error assigning position:', err);
      }
    });
  }

  private onWindowResize(): void {
    this.camera.aspect = this.getContainerWidth() / this.getContainerHeight();
    this.camera.updateProjectionMatrix();
    this.resizeRenderer();
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  ngOnDestroy(): void {
    // Clean up resources and event listeners
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }

    window.removeEventListener('resize', () => this.onWindowResize);

    // Clear refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}
