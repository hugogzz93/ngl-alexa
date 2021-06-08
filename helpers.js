class Stack {
  constructor() {
    this.items = []
  }
  push(element) {return this.items.push(element)}
  pop() { return this.items.pop()}
  isEmpty() { return this.items.length === 0 }
  empty() {return this.items.length == 0}
  top() { this.items[this.items.length - 1]}
  toArray() { return [...this.items] }
}

class Path {
  constructor(routeArray, routeData) {
    this.routes = routeArray;
    this.steps = routeArray.map(r => ({route: r, miles: r.miles, ...this.calculateStepCosts(r, routeData)}))
    this.totalMiles = this.steps.reduce((acc, step) => acc += step.miles, 0).toFixed()
    this.totalCost = this.steps.reduce((acc, step) => acc += step.cost, 0).toFixed(2)
  }

  checkValidity(route, routeData) {
    let valid = true
    let validErrors = []
    if(routeData.carrier.currentRouteRate === null) {
      valid = false
      validErrors.push({attribute: 'routeRate', type: 'missing'})
    } 
    if(routeData.currentFreightRate === null) {
      valid = false
      validErrors.push({attribute: 'freightRate', type: 'missing'})
    }
    if(routeData.carrier === null) {
      valid = false
      validErrors.push({attribute: 'carrier', type: 'missing'})
    }
    return {valid, validErrors}
  }

  calculateStepCosts(route, routesData) {
    const routeData = routesData[route.id]
    const validity = this.checkValidity(route, routeData)
    const miles = route.miles
    const fsc = routeData.carrier.currentRouteRate ? routeData.carrier.currentRouteRate.fsc : 0
    const rate = routeData.currentFreightRate ? routeData.currentFreightRate.rate : 0
    const carrier = routeData.carrier
    const cost = miles * rate + fsc
    return {
      fsc, rate, carrier, cost, validity
    }
  }
}

exports.Stack = Stack
exports.Path = Path

exports.calculateAllPaths = (origin, destination, routes) => {
        const pathsConnect = (a, b) => !!a && !!b & !!a.destinationRegion & !!b.destinationRegion & (a.destinationRegion.id == b.originRegion.id)
        const reachesDestination = (path, dest) => path.destinationRegion.id == dest.id
        const path = []
        const Explore = new Stack()
        const Path = new Stack()
        const ParticipatingRoutes = new Set()
        const ParticipatingCarriers = new Set()
        const FoundPaths = []
        const exploredRoutes = {}
        const successfulRoutes = {}
        const hasBeenExplored = (route) => !!exploredRoutes[route.id]
        const markAsExplored = route => exploredRoutes[route.id] = true;
        const isRouteSuccessful = route => !!successfulRoutes[route.id]
        const markAsSuccessful = route => {
          ParticipatingRoutes.add(route)
          ParticipatingCarriers.add(route.carrier)
          successfulRoutes[route.id] = true
        }
        const registerSuccess = ({route, path}) => {
            if(route) {
              FoundPaths.push([...path, route])
              markAsSuccessful(route)
            }
            else {
              FoundPaths.push(path)
            }
            path.forEach(markAsSuccessful)
        }

        const getAllSuccessfulPaths = route => {
          const routes = []
          FoundPaths.forEach(path => {
            const index = path.findIndex(node => node.id == route.id)
            if(index) routes.push(path.slice(index))
          })
          return routes
        }



        const startingPaths = routes.filter(s => s.originRegion.id == origin.id)
        for(let path of startingPaths) Explore.push(path)
        while(!Explore.isEmpty()) {
          let currentRoute = Explore.pop();
          if(hasBeenExplored(currentRoute)) {
            if(isRouteSuccessful(currentRoute)) {
              const routes = getAllSuccessfulPaths(currentRoute)
              routes.forEach(r => {
                registerSuccess({route: null, path: [...Path.toArray(), ...r]})
              })
              continue
            }
            else continue;
          }
          markAsExplored(currentRoute)

          while(!pathsConnect(Path.top(), currentRoute) && !Path.isEmpty()) {
            Path.pop();
          }

          if(reachesDestination(currentRoute, destination)) {
            registerSuccess({route: currentRoute, path: Path.toArray()})
            continue
          }

          Path.push(currentRoute)
          let children = routes.filter(r => pathsConnect(currentRoute, r))
          for(let child of children) Explore.push(child)
        }

        return {
          paths: FoundPaths,
          participatingCarriers: Array.from(ParticipatingCarriers),
          participatingRoutes: Array.from(ParticipatingRoutes)
        }
    }
