export class World {
    constructor(width = 5000, height = 5000) {
        this.width = width;
        this.height = height;
        this.cameraX = 0;
        this.cameraY = 0;
        
        this.nextEntityId = 1;
        this.entities = new Set();
        // Maps component name -> Map(entityId -> componentData)
        this.components = new Map();
        this.systems = [];
    }

    createEntity() {
        const id = this.nextEntityId++;
        this.entities.add(id);
        return id;
    }

    destroyEntity(entity) {
        this.entities.delete(entity);
        for (const [name, map] of this.components.entries()) {
            map.delete(entity);
        }
    }

    addComponent(entity, componentName, data = {}) {
        if (!this.components.has(componentName)) {
            this.components.set(componentName, new Map());
        }
        this.components.get(componentName).set(entity, data);
    }

    removeComponent(entity, componentName) {
        if (this.components.has(componentName)) {
            this.components.get(componentName).delete(entity);
        }
    }

    getComponent(entity, componentName) {
        if (this.components.has(componentName)) {
            return this.components.get(componentName).get(entity);
        }
        return undefined;
    }

    hasComponent(entity, componentName) {
        return this.components.has(componentName) && this.components.get(componentName).has(entity);
    }

    // Get a list of entities that have ALL specified components
    query(...componentNames) {
        const result = [];
        for (const entity of this.entities) {
            let hasAll = true;
            for (const name of componentNames) {
                if (!this.hasComponent(entity, name)) {
                    hasAll = false;
                    break;
                }
            }
            if (hasAll) {
                result.push(entity);
            }
        }
        return result;
    }

    addSystem(system) {
        this.systems.push(system);
        system.init(this);
    }

    update(deltaTime) {
        for (const system of this.systems) {
            system.update(this, deltaTime);
        }
    }
}

export class System {
    init(world) {
        // Called when added to the world
    }

    update(world, deltaTime) {
        // Called every frame
    }
}
