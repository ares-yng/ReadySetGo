const Discord = require('discord.js')
const client = new Discord.Client()
const config = require("./config.json")
const save = require("./save.json")
const FileSystem = require("fs");
const { act } = require('react');
const { count } = require('console');

//START OF VARS ==========================================================================================

//var announcementChannel
var countdownStatusMessage = null
var activeCountdowns = []
var countdownStatusIntervalID = false
var botAccessRole1
var botAccessRole2

//END OF VARS ==========================================================================================

client.on('ready', () => {
    //LIST SERVERS AND SET UP THINGS =================================================
    console.log("Servers:")
    client.guilds.cache.each(guild => {
        console.log(" - " + guild.name)
        if(guild.name == config.salmonRunServerName) {
            botAccessRole1 = guild.roles.cache.find(role => role.name == config.botAccessRole1)
            botAccessRole2 = guild.roles.cache.find(role => role.name == config.botAccessRole2)
            //announcementChannel = guild.channels.cache.find(channel => channel.id.toString() == config.announcementChannelID)
        } 
    })
    client.user.setActivity(config.activity)
})

//START OF MESSAGE VERIFICATIONS ==========================================================================================

client.on("message", async message => { // This event will run on every single message received, from any channel or DM.
    //don't check...
    //self-sent message
    if(message.author == client.user) return 
    //non-commands
    var firstChar = Array.from(message.content)[0]
    var isHelp = (firstChar == config.helpPrefix)
    if(!(isHelp || (firstChar == config.operatePrefix))) return 
    //non-bot access roles
    if(!(message.member.roles.cache.has(botAccessRole1.id) || message.member.roles.cache.has(botAccessRole2.id))) return
    
    //remove prefix
    message.content = message.content.substring(1)

    //handle command
    var messageArray = message.content.split(' ')
    var command = messageArray[0]

    switch(command) {
        case "help":
            message.channel.send("**Commands**"
                + "\n-# operate commands with the \"!\" prefix or get more info with the \"?\" prefix"
                + "\n- !setchannels or ?setchannels"
                + "\n- !countdown or ?countdown"
                + "\n- !stop or ?stop")
            break
        case "setchannels":
            if(isHelp) {
                message.channel.send("`!setchannels [channel id] [channel id] [...]`"
                    + "\n- description: set the channels you want to send a countdown in"
                    + "\n- current set channels: " + getChannelNames(save.channels, message.guild)
                    + "\n-# note: to get the channel id, right click a channel name and select \"Copy Channel ID\". if you do not see this option, turn on developer mode.")
            } else {
                if(countdownStatusIntervalID) {
                    message.channel.send(stopCountdowns() + " countdown(s) stopped")
                }
                var newChannels = []
                messageArray.splice(0, 1)
                for(const channelID of messageArray) {
                    var channel = message.guild.channels.cache.find(ch => ch.id.toString() == channelID.toString())
                    if(channel != null) {
                        channel.send("-# channel set to receive countdowns")
                        newChannels.push(channelID)
                    } else {
                        message.channel.send("channel id `" + channelID + "` is invalid.")
                    }
                }
                save.channels = newChannels
                FileSystem.writeFile('save.json', JSON.stringify(save), (error) => {
                    if (error) throw error
                  })
                message.channel.send("added " + save.channels.length + " channels")
            }
            break
        case "countdown":
            if(isHelp) {
                message.channel.send("`!countdown`"
                    + "\n- description: send a countdown message in each set channel"
                    + "\n- current set channels: " + getChannelNames(save.channels, message.guild))
            } else {
                if(countdownStatusIntervalID) {
                    message.channel.send(stopCountdowns() + " countdown(s) stopped")
                }
                //give feedback to moderator
                countdownStatusMessage = await message.channel.send("**Countdown Status**\n- sending ready-up messages...")
                //for each channel, send a message and setInterval to check on it
                activeCountdowns = []
                for(const channelID of save.channels) {
                    var channel = message.guild.channels.cache.find(ch => ch.id.toString() == channelID)
                    var msg = await channel.send("React with " + config.readyReaction + " when ready")
                    msg.react(config.readyReaction)

                    var countdown = {"message": msg, "status": "not ready", "countdown": config.countdownLength}
                    activeCountdowns.push(countdown)
                    sleep(250) //prevent rate limiting
                }
                countdownStatusIntervalID = setInterval(() => checkCountdowns(), 1000)
            }
            break
        case "stop":
            if(isHelp) {
                message.channel.send("`!stop`"
                    + "\n- description: stops any active countdowns")
            } else {
                message.channel.send(stopCountdowns() + " countdown(s) stopped")
            }
            break
        default:
            message.channel.send("**Command Not Found**"
                + "\n-# use `?help` for a list of all commands")
    }
})

//given an array of channel ids and the guild, returns a string of channel names
function getChannelNames(channelIDs, guild) {
    if(channelIDs.length == 0) {
        return "none"
    }

    var channelNames = []
    var channelCache = guild.channels.cache

    //find channel names
    for(const id of channelIDs) {
        var channel = channelCache.find(ch => ch.id.toString() == id.toString())
        if(channel != null) {
            channelNames.push(channel.name)
        } else {
            console.log("in guild \"" + guild.name + "\", channel not found for id: " + id)
        }
    }

    //format string with channel names
    var strChannelNames = ""
    for(let i = 0; i < channelNames.length - 1; i++) {
        strChannelNames += channelNames[i] + ", "
    }
    strChannelNames += channelNames[channelNames.length - 1]
    return strChannelNames
}

//given a message, edits it with countdown statuses. ends interval when all countdowns have been started
async function checkCountdowns() {
    //checks ready status or updates countdown status for each countdown
    for(var index = 0; index < activeCountdowns.length; index++) {
        switch(activeCountdowns[index].status) {
            case "not ready":
                //check for ready reactions
                for(const reaction of activeCountdowns[index].message.reactions.cache) {
                    if(reaction[1]._emoji.name == config.readyReaction) {
                        if(reaction[1].count >= 3) {
                            activeCountdowns[index].status = "counting down"
                            var msg = await activeCountdowns[index].message.channel.send("# **start your game in... " + activeCountdowns[index].countdown + "**")
                            activeCountdowns[index].message = msg
                        }
                    }
                }
                break
            case "counting down":
                activeCountdowns[index].countdown -= 1
                if(activeCountdowns[index].countdown <= 0) {
                    activeCountdowns[index].message.edit("# **GO!**")
                    activeCountdowns[index].status = "started"
                } else {
                    activeCountdowns[index].message.edit("# **start your game in... " + activeCountdowns[index].countdown + "**")
                }
                break
            default:
        }
    }
    
    var header = "**Countdown Status**"
    var statuses = ""
    var gamesStarted = 0

    for(const countdown of activeCountdowns) {
        statuses += "\n- #" + countdown.message.channel.name + " ... " + countdown.status

        if(countdown.status == "started") {
            gamesStarted++
        }
    }

    if(statuses == "") {
        statuses = "\n- no countdowns started"
    }

    if(countdownStatusMessage.content != (header + statuses)) { 
        countdownStatusMessage.edit(header + statuses)
    }

    if(gamesStarted == activeCountdowns.length) {
        stopCountdowns()
    }
}

function stopCountdowns() {
    //stop countdowns
    var stopCount = 0
    for(const countdown of activeCountdowns) {
        if(countdown.status != "started") {
            countdown.message.edit(countdown.message.content + "\n-# canceled game")
            stopCount++
        }
    }
    //stop countdown status
    countdownStatusMessage.edit(countdownStatusMessage.content + "\n-# stopped tracking")
    //initialize
    clearInterval(countdownStatusIntervalID)
    countdownStatusMessage = null
    activeCountdowns = []
    countdownStatusIntervalID = false

    return stopCount
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

client.login(process.env.BOT_TOKEN)