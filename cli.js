/**
 * @overview Env Copy Command Line Script
 * @module cli
 * @author Dominik Sigmund
 * @version 1.0
 * @description Allows to Copy ARTIFACTs from ENV to ENV
 * @memberof env-copy
 * @requires scp2
 * @requires path
 * @requires fs
 * @requires mysqldump
 * @requires node-mysql-importer
 */
const client = require('scp2')
const path = require('path')
const fs = require('fs')
const mysqlDump = require('mysqldump')
const importer = require('node-mysql-importer')
const config = require('config.json')
const artifacts = config.artifacts
const enviroments = config.enviroments

var artifact = process.argv[2]
if (artifact !== 'all' && !artifacts.hasOwnProperty(artifact)) {
  console.error('Artifact ' + artifact + ' not \'all\' or found in list')
  printHelp()
  process.exit(1)
}
if (process.argv[3] !== 'from') {
  printHelp()
  process.exit(1)
}
var from = process.argv[4]
if (!enviroments.hasOwnProperty(from)) {
  console.error('Enviroment ' + from + ' not found in list')
  printHelp()
  process.exit(1)
}
if (process.argv[5] !== 'to') {
  printHelp()
  process.exit(1)
}
var to = process.argv[6]
if (!enviroments.hasOwnProperty(to) || !enviroments[to].writable) {
  console.error('Enviroment ' + to + ' not found in list or not writable')
  printHelp()
  process.exit(1)
}

if (artifact === 'all') {
  for (var art in artifacts) {
    if (artifacts.hasOwnProperty(art)) {
      copyArtifact(art, from, to)
    }
  }
} else {
  copyArtifact(artifact, from, to, function (error) {
    if (error) {
      console.error(error)
      process.exit(2)
    } else {
      console.log('Done')
    }
  })
}

function copyArtifact (artifact, from, to, callback) {
  var fromEnv = enviroments[from].artifacts[artifact]
  var toEnv = enviroments[to].artifacts[artifact]
  switch (artifacts[artifact]) {
    case 'mysql':
      copyMySQL(fromEnv, toEnv, true, callback)
      break
    case 'mysql-structure':
      copyMySQL(fromEnv, toEnv, false, callback)
      break
    case 'file':
      copyFile(fromEnv, toEnv, callback)
      break
    case 'folder':
      copyFolder(fromEnv, toEnv, callback)
      break
    default:
      console.error('Unknown Artifact ' + artifacts[artifact])
      process.exit(1)
  }
}
function copyMySQL (from, to, withData, callback) {
  mysqlDump({ // Dump Database (with or withoutData)
    host: from.server,
    user: from.user,
    password: from.password,
    database: from.name,
    data: withData,
    dropTable: true,
    dest: path.join(config.tmp, 'mysqldump.sql')
  }, function (err) {
    if (err) {
      callback(err)
    } else {
      importer.config({ // import into target
        'host': to.server,
        'user': to.user,
        'password': to.password,
        'database': to.name
      })
      importer.importSQL(path.join(config.tmp, 'mysqldump.sql')).then(function () {
        fs.unlinkSync(path.join(config.tmp, 'mysqldump.sql')) // remove file in tmp
        callback(null)
      }).catch(function (err) {
        callback(err)
      })
    }
  })
}
function copyFile (from, to, callback) {
  client.scp({ // Download File into tmp
    host: from.server,
    username: from.user,
    password: from.password,
    path: from.file
  }, path.join(config.tmp, path.basename(from.file)), function (err) {
    if (err) {
      callback(err)
    } else {
      client.scp(path.join(config.tmp, path.basename(from.file)), { // upload file to target
        host: to.server,
        username: to.user,
        password: to.password,
        path: to.file
      }, function (err) {
        if (err) {
          callback(err)
        } else {
          fs.unlinkSync(path.join(config.tmp, path.basename(from.file))) // remove file in tmp
          callback(null)
        }
      })
    }
  })
}
function copyFolder (from, to, callback) {
  client.scp({ // Download Folder into tmp
    host: from.server,
    username: from.user,
    password: from.password,
    path: from.folder
  }, path.join(config.tmp, path.basename(from.folder)), function (err) {
    if (err) {
      callback(err)
    } else {
      client.scp(path.join(config.tmp, path.basename(from.folder)), { // upload folder to target
        host: to.server,
        username: to.user,
        password: to.password,
        path: to.folder
      }, function (err) {
        if (err) {
          callback(err)
        } else {
          fs.unlinkSync(path.join(config.tmp, path.basename(from.folder))) // remove folder in tmp
          callback(null)
        }
      })
    }
  })
}
function printHelp () {
  console.log('Syntax:')
  console.log('ecopy ARTIFACT from ENV to ENV')
}
