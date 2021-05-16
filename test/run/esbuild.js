let builds = []

module.exports = {
  clearBuilds() {
    builds = []
  },

  getBuilds() {
    return builds
  },

  build(task) {
    builds.push(task)
    return Promise.resolve()
  }
}
