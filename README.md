# Enviroment Copy Script

Copy Databases, Files, Folder from different enviroments at an ease.
Great to Deploy stuff or get data for testing.
It sports an easy natural language syntax for error safety (copy test database to live system?...)

## Installation

`npm install env-copy -g`

## Usage

ecopy all from live to staging
ecopy database-structure from staging to live
ecopy config from test to staging

Its really just:

* ecopy
* artifact to copy (defined in config) OR all
* from
* sending enviroment (config)
* to
* receiving enviroment (config)

## Config

Just edit /etc/envcopy.json

### Artifacts

Artifacts define the names for stuff to copy.
There are 4 types right now:

* mysql > Fully copy a database
* mysql-structure > only copy the structure, try to keep data
* file > a single file
* folder > A folder

The Enviroments define details

### Enviroments

An Enviroment is a container of settings for the defined resources.

### Example

```json
{
  "cli": {
    "tmp":"/tmp/"
  },
  "artifacts": {
    "database": "mysql",
    "config": "file",
    "database-structure":"mysql-structure",
    "images":"folder"
  },
  "enviroments": {
    "live": {
      "writable":false,
      "artifacts": {
        "database": {
          "server":"",
          "user":"",
          "password":"",
          "name":""
        },
        "database-structure":"database",
        "config": {
          "file":"/opt/mynode/config.json",
          "server":"",
          "user":"",
          "password":""
        },
        "images":{
          "folder":"/var/data/myimages/",
          "server":"",
          "user":"",
          "password":""
        }
      }
    },
    "staging": {
      "writable":true,
      "artifacts": {
        "database": {
          "server":"",
          "user":"",
          "password":"",
          "name":""
        },
        "database-structure":"database",
        "config": {
          "file":"/opt/mynode/config.json",
          "server":"",
          "user":"",
          "password":""
        },
        "images":{
          "folder":"/var/data/myimages/",
          "server":"",
          "user":"",
          "password":""
        }
      }
    }
  }
}
```