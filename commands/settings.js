//process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
// Database
const db = require('../db.js')
const Default = {
  prefix: 'v?',
  news: false
}

// System Funktionen
// Read settings of guild id
function read(id) {
  return { ...Default, ...(db.get(id) || {}) }
}

function write(id, value) {
  db.set(id, value)
}



// Nutzer Funktionen
// Macht ein Embed aus den Einstellungen
function Embed({ guild, settings }) {
  return {
    title: 'Valorant Lab',
    description: `Settings for ${guild.name}`,
    fields: Object.keys(settings).map(k => {
      return {
        name: k,
        value: settings[k]
      }
    })
  }
}

function getAll(message) {
  message.channel.send({
    embed: Embed({
      guild: message.guild,
      settings: read(message.guild.id)
    })
  })
}

function get(message, key) {
  // Check Existance
  if (Object.keys(Default).includes(key)) {
    // Nur ein Key
    message.channel.send({
      embed: Embed({
        guild: message.guild,
        settings: {
          [key]: read(message.guild.id)[key]
        }
      })
    })
  } else {
    message.channel.send(`Can not find Category \`${key}\`.`)
  }
}

function set(message, key, value) {
  // Check Existance
  if (Object.keys(Default).includes(key)) {
    // Check Permission or Admin or Owner
   if (message.member.hasPermission('MANAGE_GUILD', false, true, true)) {
     write(message.guild.id, { ...read(message.guild.id), ...{ [key]: value }})
     getAll(message)
   } else {
     message.channel.send('You don\'t have the `Manage Guild`-Permission. Please ask a Admin to change this')
   }
  } else {
    message.channel.send(`Can not find Category \`${key}\`.`)
  }
}



module.exports = (args, client, message) => {
  if (args[0]) {
    if (args[1]) {
      // Database write
      set(message, args[0], args.slice(1).join(' '))
    } else {
      // Database read
      get(message, args[0])
    }
  } else {
    //Kein spezifisches Argument angegeben
    getAll(message)
  }
}
