const cpus = require('os').cpus().length

module.exports = async function parallelize(tasks, batch, parallelism = cpus) {
  for (let rest = tasks; rest.length > 0; rest = rest.slice(parallelism)) {
    const set = rest.slice(0, parallelism)
    if (batch) batch(set)
    await Promise.all(set.map(task => task()))
  }
}
