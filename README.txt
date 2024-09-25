FEATURES
--------
1. set channels to send countdowns in
2. !countdown
3. wait for two team captains to react with check emote
4. start countdown


COMMANDS
--------
?help or !help
operate commands with the "!" prefix or get more info with the "?" prefix
- !setchannels or ?setchannels 
- !countdown or ?countdown 
- !stop or ?stop

!setchannels for setting which channels to send a countdown in 
- send feedback on which channels are set
- save given channel ids
?setchannels for instructions 
- description: set the channels you want to send a countdown in. current set channels: {}
- syntax: `!setchannels [channel id] [channel id] [...]`
- To get the channel id, right click a channel name and select "Copy Channel ID". if you do not see this option, turn on developer mode

!countdown for sending a countdown message in each set channel
- message with emote sent in each saved, set channel
- send feedback with info on which channels messages have been sent in and their status (not ready, counting down, started)
?countdown for instructions
- description: send a countdown to each channel. when the team captains ready up with the emote, a 10 second countdown will begin. current set channels: {}
- syntax: `!countdown`

!stop for ending countdowns
- reply with number of countdowns stopped
countdown ends when...
- manual stop (only affects set channels)
- when !setchannels or !countdown is used
?stop for instructions
- description: stops any active countdowns
- syntax: !stop

