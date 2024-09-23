const Discord = require('discord.js')
const client = new Discord.Client()
const config = require("./config.json")

//START OF VARS ==========================================================================================

var generalChannel
var generalChannel2

//TIMEZONE VARS =================================================

let isDST = true

//not DST offsets
const PSTo = -8
const MSTo = -7
const CSTo = -6
const ESTo = -5
const GMTo = 1
const CETo = 1
const AUSo = 10
//DST offsets
const PDTo = -7
const MDTo = -6
const CDTo = -5
const EDTo = -4
const GMTDo = 2
const CETDo = 2
const AUSDo = 11

//IDS FOR FUN COMMANDS =================================================

const clangggID = "384569857825570826"

var PST, MST, CST, EST, GMT, CET, AUS

//END OF VARS ==========================================================================================

client.on('ready', () => {
    //LIST SERVERS AND SET UP THINGS =================================================
    console.log("Servers:")
    client.guilds.cache.each(guild => {
        console.log(" - " + guild.name)
        if(guild.name == "Salmon Run Live Battlers") {
            //PST = guild.roles.find(role => role.name == "PST")
            generalChannel = guild.channels.cache.find(channel => channel.id.toString() == "1287463360471892199")
            generalChannel.send("active")
            generalChannel2 = guild.channels.cache.find(channel => channel.id.toString() == "1287463405065863272")
        } else {

        }
    })
    //client.user.setActivity(`On ${client.guilds.size} Servers`)
    client.user.setActivity(`The Nearest Tourney`)

    //FINDING EMOJIS =================================================
    //emoji = client.emojis.find(emoji => emoji.name == "emojiname")
})

//START OF MESSAGE VERIFICATIONS ==========================================================================================

client.on("message", async message => { // This event will run on every single message received, from any channel or DM.
    //don't check...
    if(message.author == client.user) return //self-sent message

    var firstChar = Array.from(message.content)[0] //var isHelp = (message.content.indexOf(config.helpPrefix) == 0)
    var isHelp = (firstChar == config.helpPrefix)
    var isCommand = (firstChar == config.operatePrefix)
    if(!isHelp && !isCommand) return //non-commands
    
    //settle prefix
    message.content = message.content.substring(1)

    //determine command
    var messageArray = message.content.split(' ')
    var command = messageArray[0]

    switch(command) {
        case "help":
            message.channel.send("**Commands**"
                + "\n-# operate commands with the \"!\" prefix or get more info with the \"?\" prefix"
                + "\n```- !setchannels or ?setchannels"
                + "\n- !countdown or ?countdown"
                + "\n- !stop or ?stop```")
            break
        case "setchannels":
            if(isHelp) {
                message.channel.send("**!setchannels**"
                    + "\n```- description: set the channels you want to send a countdown in. current set channels: "
                    + "tbd"
                    + "\n- syntax: !setchannels [channel id] [channel id] [...]```"
                    + "\n-# note: to get the channel id, right click a channel name and select \"Copy Channel ID\". if you do not see this option, turn on developer mode.")
            } else {
                var channelCount = 0
                messageArray.splice(0, 1)
                for(const channelID of messageArray) {
                    var channel = message.guild.channels.cache.find(ch => ch.id.toString() == channelID.toString())
                    if(channel != null) {
                        channelCount++
                        channel.send("-# channel set to receive countdowns")
                    } else {
                        message.channel.send("channel id `" + channelID + "` is invalid.")
                    }
                }
                message.channel.send("added " + channelCount + " channels")
            }
            break
        case "countdown":
            if(isHelp) {
                message.channel.send("**!countdown**"
                    + "\n```- description: send a countdown message in each set channel. current set channels: "
                    + "tbd"
                    + "\n- syntax: !countdown```")
            } else {
                message.channel.send("countdowns sent")
                //for each channel, send a message and track the progress 
            }
            break
        case "stop":
            if(isHelp) {
                message.channel.send("**!stop**"
                    + "\n```- description: stops any active countdowns"
                    + "\n- syntax: !stop```")
            } else {
                var stopCount = 0
                //check for active countdowns, stop them, increment counter
                message.channel.send(stopCount + " countdown(s) stopped")
            }
            break
        default:
            message.channel.send("**Command Not Found**"
                + "\n```- use `?help` for a list of all commands```")
    }
})

client.login(config.token)